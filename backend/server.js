const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import middleware and configurations
const logger = require('./config/logger');
const {
  rateLimiters,
  securityHeaders,
  mongoSanitization,
  requestLogger,
  errorTracker,
  sanitizeInput
} = require('./middleware/security');
const {
  shipmentValidation,
  queryValidation,
  authValidation,
  userValidation
} = require('./middleware/validation');
const {
  authenticate,
  authorize,
  checkPermission,
  optionalAuth,
  authRateLimit
} = require('./middleware/auth');

// Import controllers
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(securityHeaders);
app.use(compression());
app.use(requestLogger);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Security middleware
app.use(mongoSanitization);
app.use(sanitizeInput);

// Rate limiting
app.use('/api/', rateLimiters.general);

// MongoDB connection with enhanced configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cargo-shipment-tracker';

const mongooseOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
};

mongoose.connect(MONGODB_URI, mongooseOptions)
  .then(() => {
    logger.info('Successfully connected to MongoDB');
    logger.info(`Database: ${mongoose.connection.name}`);
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

// MongoDB connection event handlers
mongoose.connection.on('error', (error) => {
  logger.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

// Enhanced Shipment Schema with validation and indexes
const shipmentSchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    required: [true, 'Tracking number is required'],
    trim: true,
    uppercase: true,
    minlength: [3, 'Tracking number must be at least 3 characters'],
    maxlength: [50, 'Tracking number cannot exceed 50 characters'],
    match: [/^[A-Z0-9-]+$/, 'Tracking number can only contain uppercase letters, numbers, and hyphens']
  },
  origin: {
    type: String,
    required: [true, 'Origin is required'],
    trim: true,
    minlength: [2, 'Origin must be at least 2 characters'],
    maxlength: [100, 'Origin cannot exceed 100 characters']
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true,
    minlength: [2, 'Destination must be at least 2 characters'],
    maxlength: [100, 'Destination cannot exceed 100 characters']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['Pending', 'In Transit', 'Delivered', 'Cancelled'],
      message: 'Status must be one of: Pending, In Transit, Delivered, Cancelled'
    },
    default: 'Pending'
  },
  estimatedDelivery: {
    type: Date,
    required: [true, 'Estimated delivery date is required'],
    validate: {
      validator: function(value) {
        return value >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Estimated delivery cannot be in the past'
    }
  },
  cargo: {
    type: String,
    required: [true, 'Cargo description is required'],
    trim: true,
    minlength: [2, 'Cargo description must be at least 2 characters'],
    maxlength: [200, 'Cargo description cannot exceed 200 characters']
  },
  weight: {
    type: String,
    required: [true, 'Weight is required'],
    trim: true,
    validate: {
      validator: function(value) {
        return /^\d+(\.\d+)?\s*(kg|lbs|tons?)$/i.test(value);
      },
      message: 'Weight must be in format: number + unit (kg, lbs, ton, tons)'
    }
  },
  description: {
    type: String,
    default: '',
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  customerInfo: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Customer name cannot exceed 100 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    }
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['Pending', 'In Transit', 'Delivered', 'Cancelled'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    location: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, 'Status notes cannot exceed 200 characters']
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
shipmentSchema.index({ trackingNumber: 1 }, { unique: true });
shipmentSchema.index({ status: 1 });
shipmentSchema.index({ createdAt: -1 });
shipmentSchema.index({ estimatedDelivery: 1 });
shipmentSchema.index({ origin: 1, destination: 1 });
shipmentSchema.index({ 'customerInfo.email': 1 });

// Text index for search functionality
shipmentSchema.index({
  trackingNumber: 'text',
  origin: 'text',
  destination: 'text',
  cargo: 'text',
  'customerInfo.name': 'text'
});

// Virtual for days until delivery
shipmentSchema.virtual('daysUntilDelivery').get(function() {
  if (this.status === 'Delivered') return 0;
  const today = new Date();
  const delivery = new Date(this.estimatedDelivery);
  const diffTime = delivery - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware
shipmentSchema.pre('save', function(next) {
  // Update the updatedAt field
  this.updatedAt = Date.now();

  // Add initial status to history if it's a new document
  if (this.isNew) {
    this.statusHistory = [{
      status: this.status,
      timestamp: new Date(),
      notes: 'Shipment created'
    }];
  }

  next();
});

// Pre-update middleware to track status changes
shipmentSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Method to add status update
shipmentSchema.methods.addStatusUpdate = function(status, location, notes) {
  this.statusHistory.push({
    status,
    timestamp: new Date(),
    location,
    notes
  });
  this.status = status;
  this.updatedAt = Date.now();
  return this.save();
};

const Shipment = mongoose.model('Shipment', shipmentSchema);

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

// Shipment Routes (Protected)

// Get all shipments with enhanced filtering, pagination, and search
app.get('/api/shipments', authenticate, queryValidation.shipmentList, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate
    } = req.query;

    // Build query
    let query = {};

    // Status filter
    if (status) {
      query.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const [shipments, totalCount] = await Promise.all([
      Shipment.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Shipment.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    logger.info(`Retrieved ${shipments.length} shipments for page ${page}`);

    res.json({
      success: true,
      data: shipments,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching shipments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shipments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get a single shipment by ID
app.get('/api/shipments/:id', authenticate, shipmentValidation.getById, async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id).lean();
    if (!shipment) {
      logger.warn(`Shipment not found: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    logger.info(`Retrieved shipment: ${shipment.trackingNumber}`);
    res.json({
      success: true,
      data: shipment
    });
  } catch (error) {
    logger.error('Error fetching shipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shipment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create a new shipment
app.post('/api/shipments', authenticate, checkPermission('user'), rateLimiters.write, shipmentValidation.create, async (req, res) => {
  try {
    const shipment = new Shipment(req.body);
    const savedShipment = await shipment.save();

    logger.info(`New shipment created: ${savedShipment.trackingNumber} by IP: ${req.ip}`);

    res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      data: savedShipment
    });
  } catch (error) {
    logger.error('Error creating shipment:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tracking number already exists'
      });
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create shipment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update a shipment
app.put('/api/shipments/:id', authenticate, checkPermission('user'), rateLimiters.write, shipmentValidation.update, async (req, res) => {
  try {
    const oldShipment = await Shipment.findById(req.params.id);
    if (!oldShipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Check if status is being updated to add to history
    if (req.body.status && req.body.status !== oldShipment.status) {
      req.body.statusHistory = [...oldShipment.statusHistory, {
        status: req.body.status,
        timestamp: new Date(),
        location: req.body.currentLocation || '',
        notes: req.body.statusNotes || `Status updated to ${req.body.status}`
      }];
    }

    const shipment = await Shipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    logger.info(`Shipment updated: ${shipment.trackingNumber} by IP: ${req.ip}`);

    res.json({
      success: true,
      message: 'Shipment updated successfully',
      data: shipment
    });
  } catch (error) {
    logger.error('Error updating shipment:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update shipment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete a shipment
app.delete('/api/shipments/:id', authenticate, checkPermission('manager'), rateLimiters.delete, shipmentValidation.delete, async (req, res) => {
  try {
    const shipment = await Shipment.findByIdAndDelete(req.params.id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    logger.info(`Shipment deleted: ${shipment.trackingNumber} by IP: ${req.ip}`);

    res.json({
      success: true,
      message: 'Shipment deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting shipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete shipment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get enhanced shipment statistics
app.get('/api/stats', authenticate, async (req, res) => {
  try {
    const [
      totalShipments,
      pendingShipments,
      inTransitShipments,
      deliveredShipments,
      cancelledShipments,
      recentShipments,
      overdueShipments
    ] = await Promise.all([
      Shipment.countDocuments(),
      Shipment.countDocuments({ status: 'Pending' }),
      Shipment.countDocuments({ status: 'In Transit' }),
      Shipment.countDocuments({ status: 'Delivered' }),
      Shipment.countDocuments({ status: 'Cancelled' }),
      Shipment.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      Shipment.countDocuments({
        estimatedDelivery: { $lt: new Date() },
        status: { $in: ['Pending', 'In Transit'] }
      })
    ]);

    // Calculate delivery performance
    const deliveryRate = totalShipments > 0 ?
      ((deliveredShipments / totalShipments) * 100).toFixed(2) : 0;

    logger.info('Statistics retrieved successfully');

    res.json({
      success: true,
      data: {
        overview: {
          total: totalShipments,
          pending: pendingShipments,
          inTransit: inTransitShipments,
          delivered: deliveredShipments,
          cancelled: cancelledShipments
        },
        performance: {
          deliveryRate: parseFloat(deliveryRate),
          recentShipments,
          overdueShipments
        },
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Enhanced health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Get basic system info
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus,
        name: mongoose.connection.name
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      environment: process.env.NODE_ENV || 'development'
    };

    res.json({
      success: true,
      data: healthData
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      message: 'Service unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// Add bulk operations endpoint
app.post('/api/shipments/bulk', authenticate, checkPermission('manager'), rateLimiters.write, async (req, res) => {
  try {
    const { operation, shipmentIds, updateData } = req.body;

    if (!operation || !shipmentIds || !Array.isArray(shipmentIds)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bulk operation request'
      });
    }

    let result;
    switch (operation) {
      case 'delete':
        result = await Shipment.deleteMany({ _id: { $in: shipmentIds } });
        logger.info(`Bulk delete: ${result.deletedCount} shipments deleted by IP: ${req.ip}`);
        break;

      case 'updateStatus':
        if (!updateData || !updateData.status) {
          return res.status(400).json({
            success: false,
            message: 'Status is required for bulk status update'
          });
        }
        result = await Shipment.updateMany(
          { _id: { $in: shipmentIds } },
          {
            status: updateData.status,
            updatedAt: new Date(),
            $push: {
              statusHistory: {
                status: updateData.status,
                timestamp: new Date(),
                notes: updateData.notes || `Bulk status update to ${updateData.status}`
              }
            }
          }
        );
        logger.info(`Bulk status update: ${result.modifiedCount} shipments updated by IP: ${req.ip}`);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid operation type'
        });
    }

    res.json({
      success: true,
      message: `Bulk ${operation} completed successfully`,
      data: result
    });
  } catch (error) {
    logger.error('Error in bulk operation:', error);
    res.status(500).json({
      success: false,
      message: 'Bulk operation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Error tracking middleware
app.use(errorTracker);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    success: false,
    message: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl} from IP: ${req.ip}`);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed');
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

// Handle server errors
server.on('error', (error) => {
  logger.error('Server error:', error);
});
