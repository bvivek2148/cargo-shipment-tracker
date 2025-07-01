const redisService = require('../utils/redis');
const crypto = require('crypto');

/**
 * Cache middleware for Express routes
 * Provides intelligent caching with automatic invalidation
 */

// Generate cache key from request
const generateCacheKey = (req, prefix = 'api') => {
  const { method, originalUrl, query, user } = req;
  const userId = user ? user._id.toString() : 'anonymous';
  
  // Create a unique key based on method, URL, query params, and user
  const keyData = {
    method,
    url: originalUrl,
    query: JSON.stringify(query),
    userId
  };
  
  const hash = crypto
    .createHash('md5')
    .update(JSON.stringify(keyData))
    .digest('hex');
    
  return `${prefix}:${hash}`;
};

// Cache response middleware
const cacheResponse = (options = {}) => {
  const {
    ttl = 300, // 5 minutes default
    prefix = 'api',
    skipCache = false,
    varyBy = [],
    condition = null
  } = options;

  return async (req, res, next) => {
    // Skip caching if disabled or Redis not available
    if (skipCache || !redisService.isReady()) {
      return next();
    }

    // Check condition function if provided
    if (condition && !condition(req)) {
      return next();
    }

    // Only cache GET requests by default
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Generate cache key
      let cacheKey = generateCacheKey(req, prefix);
      
      // Add vary-by parameters to cache key
      if (varyBy.length > 0) {
        const varyData = varyBy.map(field => {
          if (field.startsWith('header.')) {
            return req.get(field.substring(7));
          }
          if (field.startsWith('query.')) {
            return req.query[field.substring(6)];
          }
          if (field.startsWith('user.')) {
            return req.user ? req.user[field.substring(5)] : null;
          }
          return req[field];
        }).join(':');
        
        cacheKey += `:${crypto.createHash('md5').update(varyData).digest('hex')}`;
      }

      // Try to get cached response
      const cachedResponse = await redisService.get(cacheKey);
      
      if (cachedResponse) {
        // Set cache headers
        res.set({
          'X-Cache': 'HIT',
          'X-Cache-Key': cacheKey,
          'Cache-Control': `public, max-age=${ttl}`
        });
        
        // Return cached response
        return res.status(cachedResponse.status).json(cachedResponse.data);
      }

      // Store original res.json method
      const originalJson = res.json;
      
      // Override res.json to cache the response
      res.json = function(data) {
        // Cache successful responses only
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const responseData = {
            status: res.statusCode,
            data: data,
            timestamp: new Date().toISOString()
          };
          
          // Cache the response asynchronously
          redisService.set(cacheKey, responseData, ttl).catch(error => {
            console.error('Cache set error:', error.message);
          });
          
          // Set cache headers
          res.set({
            'X-Cache': 'MISS',
            'X-Cache-Key': cacheKey,
            'Cache-Control': `public, max-age=${ttl}`
          });
        }
        
        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error.message);
      next();
    }
  };
};

// Cache invalidation middleware
const invalidateCache = (patterns = []) => {
  return async (req, res, next) => {
    // Store original methods
    const originalJson = res.json;
    const originalSend = res.send;
    
    // Override response methods to invalidate cache after successful operations
    const invalidateAfterResponse = function(data) {
      // Only invalidate on successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Invalidate cache patterns asynchronously
        Promise.all(
          patterns.map(pattern => redisService.flushPattern(pattern))
        ).catch(error => {
          console.error('Cache invalidation error:', error.message);
        });
      }
      
      return data;
    };
    
    res.json = function(data) {
      const result = invalidateAfterResponse(data);
      return originalJson.call(this, result);
    };
    
    res.send = function(data) {
      invalidateAfterResponse(data);
      return originalSend.call(this, data);
    };

    next();
  };
};

// Shipment-specific cache middleware
const cacheShipments = cacheResponse({
  ttl: 300, // 5 minutes
  prefix: 'shipments',
  varyBy: ['user.role', 'query.status', 'query.search']
});

const cacheShipmentDetails = cacheResponse({
  ttl: 600, // 10 minutes
  prefix: 'shipment',
  varyBy: ['user.role']
});

const cacheAnalytics = cacheResponse({
  ttl: 900, // 15 minutes
  prefix: 'analytics',
  varyBy: ['user.role', 'query.period', 'query.type']
});

// Cache invalidation patterns
const invalidateShipmentCache = invalidateCache([
  'shipments:*',
  'shipment:*',
  'analytics:*'
]);

const invalidateAnalyticsCache = invalidateCache([
  'analytics:*'
]);

// User session cache
const cacheUserSession = async (userId, sessionData, ttl = 3600) => {
  if (!redisService.isReady()) return false;
  
  const key = `session:${userId}`;
  return await redisService.set(key, sessionData, ttl);
};

const getUserSession = async (userId) => {
  if (!redisService.isReady()) return null;
  
  const key = `session:${userId}`;
  return await redisService.get(key);
};

const invalidateUserSession = async (userId) => {
  if (!redisService.isReady()) return false;
  
  const key = `session:${userId}`;
  return await redisService.del(key);
};

// Rate limiting cache
const setRateLimit = async (identifier, limit, windowMs) => {
  if (!redisService.isReady()) return false;
  
  const key = `ratelimit:${identifier}`;
  const current = await redisService.get(key) || 0;
  
  if (current >= limit) {
    return false; // Rate limit exceeded
  }
  
  const ttl = Math.ceil(windowMs / 1000);
  await redisService.set(key, current + 1, ttl);
  return true;
};

const getRateLimit = async (identifier) => {
  if (!redisService.isReady()) return null;
  
  const key = `ratelimit:${identifier}`;
  return await redisService.get(key) || 0;
};

// Real-time data cache
const cacheRealtimeData = async (type, id, data, ttl = 60) => {
  if (!redisService.isReady()) return false;
  
  const key = `realtime:${type}:${id}`;
  return await redisService.set(key, data, ttl);
};

const getRealtimeData = async (type, id) => {
  if (!redisService.isReady()) return null;
  
  const key = `realtime:${type}:${id}`;
  return await redisService.get(key);
};

// Notification queue
const queueNotification = async (notification) => {
  if (!redisService.isReady()) return false;
  
  const key = 'notifications:queue';
  return await redisService.lpush(key, notification);
};

const dequeueNotification = async () => {
  if (!redisService.isReady()) return null;
  
  const key = 'notifications:queue';
  return await redisService.rpop(key);
};

// Cache warming
const warmCache = async () => {
  if (!redisService.isReady()) {
    console.log('Redis not available, skipping cache warming');
    return;
  }
  
  try {
    console.log('Starting cache warming...');
    
    // Warm up common queries
    // This would typically be done by making requests to your API endpoints
    // or by pre-computing and storing frequently accessed data
    
    console.log('Cache warming completed');
  } catch (error) {
    console.error('Cache warming error:', error.message);
  }
};

// Cache health check
const getCacheHealth = async () => {
  if (!redisService.isReady()) {
    return {
      status: 'unhealthy',
      connected: false,
      error: 'Redis not connected'
    };
  }
  
  try {
    const stats = await redisService.getStats();
    return {
      status: 'healthy',
      connected: true,
      stats
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      connected: false,
      error: error.message
    };
  }
};

module.exports = {
  cacheResponse,
  invalidateCache,
  cacheShipments,
  cacheShipmentDetails,
  cacheAnalytics,
  invalidateShipmentCache,
  invalidateAnalyticsCache,
  cacheUserSession,
  getUserSession,
  invalidateUserSession,
  setRateLimit,
  getRateLimit,
  cacheRealtimeData,
  getRealtimeData,
  queueNotification,
  dequeueNotification,
  warmCache,
  getCacheHealth,
  generateCacheKey
};
