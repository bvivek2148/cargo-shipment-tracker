const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import models
const User = require('./models/User');

// Import controllers
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');

// Import middleware
const { authenticate, authorize, checkPermission, authRateLimit } = require('./middleware/auth');
const { authValidation, userValidation } = require('./middleware/validation');

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Authentication Routes
app.post('/api/auth/register', authRateLimit, authValidation.register, authController.register);
app.post('/api/auth/login', authRateLimit, authValidation.login, authController.login);
app.post('/api/auth/logout', authenticate, authController.logout);
app.get('/api/auth/me', authenticate, authController.getMe);
app.put('/api/auth/profile', authenticate, authValidation.updateProfile, authController.updateProfile);
app.put('/api/auth/change-password', authenticate, authValidation.changePassword, authController.changePassword);
app.post('/api/auth/refresh', authController.refreshToken);

// User Management Routes (Admin only)
app.get('/api/users/stats', authenticate, authorize('admin'), userController.getUserStats);
app.get('/api/users', authenticate, authorize('admin'), userController.getUsers);
app.post('/api/users', authenticate, authorize('admin'), userValidation.createUser, userController.createUser);
app.get('/api/users/:id', authenticate, checkPermission('manager'), userController.getUser);
app.put('/api/users/:id', authenticate, authorize('admin'), userValidation.updateUser, userController.updateUser);
app.delete('/api/users/:id', authenticate, authorize('admin'), userController.deleteUser);

// Basic shipment routes (simplified for now)
app.get('/api/shipments', authenticate, (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Shipments endpoint working'
  });
});

app.get('/api/stats', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      overview: {
        total: 0,
        pending: 0,
        inTransit: 0,
        delivered: 0,
        cancelled: 0
      }
    },
    message: 'Stats endpoint working'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  console.log('404 - Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cargo-shipment-tracker')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log('Database:', mongoose.connection.name);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
  });

// Start server
console.log('Starting server...');
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Working server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});
