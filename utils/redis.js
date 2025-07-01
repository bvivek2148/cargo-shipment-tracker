const Redis = require('ioredis');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.retryAttempts = 0;
    this.maxRetries = 5;
  }

  async connect() {
    try {
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000,
      };

      // Add TLS configuration for production
      if (process.env.REDIS_TLS === 'true') {
        redisConfig.tls = {
          rejectUnauthorized: false
        };
      }

      this.client = new Redis(redisConfig);

      // Event handlers
      this.client.on('connect', () => {
        console.log('Redis connected successfully');
        this.isConnected = true;
        this.retryAttempts = 0;
      });

      this.client.on('ready', () => {
        console.log('Redis ready to accept commands');
      });

      this.client.on('error', (error) => {
        console.error('Redis connection error:', error.message);
        this.isConnected = false;
        
        if (this.retryAttempts < this.maxRetries) {
          this.retryAttempts++;
          console.log(`Retrying Redis connection (${this.retryAttempts}/${this.maxRetries})...`);
        }
      });

      this.client.on('close', () => {
        console.log('Redis connection closed');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        console.log('Redis reconnecting...');
      });

      // Connect to Redis
      await this.client.connect();
      
      return this.client;
    } catch (error) {
      console.error('Failed to connect to Redis:', error.message);
      this.isConnected = false;
      return null;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
      console.log('Redis disconnected');
    }
  }

  isReady() {
    return this.isConnected && this.client && this.client.status === 'ready';
  }

  // Cache operations
  async get(key) {
    if (!this.isReady()) return null;
    
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error.message);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    if (!this.isReady()) return false;
    
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl > 0) {
        await this.client.setex(key, ttl, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
      return true;
    } catch (error) {
      console.error('Redis SET error:', error.message);
      return false;
    }
  }

  async del(key) {
    if (!this.isReady()) return false;
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error.message);
      return false;
    }
  }

  async exists(key) {
    if (!this.isReady()) return false;
    
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error.message);
      return false;
    }
  }

  async expire(key, ttl) {
    if (!this.isReady()) return false;
    
    try {
      await this.client.expire(key, ttl);
      return true;
    } catch (error) {
      console.error('Redis EXPIRE error:', error.message);
      return false;
    }
  }

  async flushPattern(pattern) {
    if (!this.isReady()) return false;
    
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Redis FLUSH PATTERN error:', error.message);
      return false;
    }
  }

  // Hash operations
  async hget(key, field) {
    if (!this.isReady()) return null;
    
    try {
      const value = await this.client.hget(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis HGET error:', error.message);
      return null;
    }
  }

  async hset(key, field, value, ttl = 3600) {
    if (!this.isReady()) return false;
    
    try {
      const serializedValue = JSON.stringify(value);
      await this.client.hset(key, field, serializedValue);
      if (ttl > 0) {
        await this.client.expire(key, ttl);
      }
      return true;
    } catch (error) {
      console.error('Redis HSET error:', error.message);
      return false;
    }
  }

  async hgetall(key) {
    if (!this.isReady()) return null;
    
    try {
      const hash = await this.client.hgetall(key);
      const result = {};
      for (const [field, value] of Object.entries(hash)) {
        try {
          result[field] = JSON.parse(value);
        } catch {
          result[field] = value;
        }
      }
      return result;
    } catch (error) {
      console.error('Redis HGETALL error:', error.message);
      return null;
    }
  }

  // List operations
  async lpush(key, value) {
    if (!this.isReady()) return false;
    
    try {
      const serializedValue = JSON.stringify(value);
      await this.client.lpush(key, serializedValue);
      return true;
    } catch (error) {
      console.error('Redis LPUSH error:', error.message);
      return false;
    }
  }

  async rpop(key) {
    if (!this.isReady()) return null;
    
    try {
      const value = await this.client.rpop(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis RPOP error:', error.message);
      return null;
    }
  }

  async lrange(key, start = 0, stop = -1) {
    if (!this.isReady()) return [];
    
    try {
      const values = await this.client.lrange(key, start, stop);
      return values.map(value => {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      });
    } catch (error) {
      console.error('Redis LRANGE error:', error.message);
      return [];
    }
  }

  // Pub/Sub operations
  async publish(channel, message) {
    if (!this.isReady()) return false;
    
    try {
      const serializedMessage = JSON.stringify(message);
      await this.client.publish(channel, serializedMessage);
      return true;
    } catch (error) {
      console.error('Redis PUBLISH error:', error.message);
      return false;
    }
  }

  createSubscriber() {
    if (!this.isReady()) return null;
    
    try {
      return this.client.duplicate();
    } catch (error) {
      console.error('Redis SUBSCRIBER error:', error.message);
      return null;
    }
  }

  // Performance monitoring
  async getStats() {
    if (!this.isReady()) return null;
    
    try {
      const info = await this.client.info('memory');
      const keyspace = await this.client.info('keyspace');
      
      return {
        connected: this.isConnected,
        memory: info,
        keyspace: keyspace,
        status: this.client.status
      };
    } catch (error) {
      console.error('Redis STATS error:', error.message);
      return null;
    }
  }
}

// Create singleton instance
const redisService = new RedisService();

module.exports = redisService;
