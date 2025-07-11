const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const logger = require('../config/logger');

// Rate limiting configurations
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Different rate limits for different endpoints
const rateLimiters = {
  // General API rate limit
  general: createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    100, // limit each IP to 100 requests per windowMs
    'Too many requests from this IP, please try again later.'
  ),

  // Stricter rate limit for write operations
  write: createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    20, // limit each IP to 20 write requests per windowMs
    'Too many write operations from this IP, please try again later.'
  ),

  // Very strict rate limit for delete operations
  delete: createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    5, // limit each IP to 5 delete requests per windowMs
    'Too many delete operations from this IP, please try again later.'
  )
};

// Security headers configuration
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// MongoDB injection prevention
const mongoSanitization = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn(`Potential MongoDB injection attempt detected from IP: ${req.ip}, Key: ${key}`);
  }
});

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    if (res.statusCode >= 400) {
      logger.error(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms - ${req.ip}`);
    } else {
      logger.http(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms - ${req.ip}`);
    }
  });
  
  next();
};

// Error tracking middleware
const errorTracker = (err, req, res, next) => {
  logger.error(`Error occurred: ${err.message}`, {
    error: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  next(err);
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attempts from request body
  if (req.body) {
    req.body = JSON.parse(JSON.stringify(req.body).replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''));
  }
  
  // Remove any potential XSS attempts from query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }
    });
  }
  
  next();
};

module.exports = {
  rateLimiters,
  securityHeaders,
  mongoSanitization,
  requestLogger,
  errorTracker,
  sanitizeInput
};
