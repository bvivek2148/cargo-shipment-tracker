const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import services
const socketService = require('./services/socketService');
const redisService = require('./utils/redis');
const { warmCache } = require('./middleware/cache');

const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize services
async function initializeServices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cargo-tracker', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('Connected to MongoDB');

    // Connect to Redis (optional - app will work without it)
    try {
      await redisService.connect();
      console.log('Redis connected successfully');

      // Warm up cache
      await warmCache();
    } catch (redisError) {
      console.warn('Redis connection failed, continuing without cache:', redisError.message);
    }

    // Initialize Socket.IO
    socketService.initialize(server);
    console.log('Socket.IO initialized');

  } catch (error) {
    console.error('Service initialization error:', error);
    process.exit(1);
  }
}

// Health check endpoint with service status
app.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    message: 'Cargo Shipment Tracker API is running',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      redis: redisService.isReady() ? 'connected' : 'disconnected',
      socketio: socketService.io ? 'initialized' : 'not initialized'
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  };

  const statusCode = health.services.mongodb === 'connected' ? 200 : 503;
  res.status(statusCode).json(health);
});

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/shipments', require('./routes/shipment.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/organizations', require('./routes/organization.routes'));
app.use('/api/iot', require('./routes/iot.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/blockchain', require('./routes/blockchain.routes'));
app.use('/api/sustainability', require('./routes/sustainability.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');

  try {
    await mongoose.connection.close();
    await redisService.disconnect();

    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');

  try {
    await mongoose.connection.close();
    await redisService.disconnect();

    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initializeServices();

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔌 Socket.IO ready for connections`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();