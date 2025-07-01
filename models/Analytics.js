const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'shipment_created',
      'shipment_updated', 
      'shipment_delivered',
      'location_update',
      'status_change',
      'user_login',
      'user_action',
      'system_event',
      'performance_metric',
      'error_event'
    ]
  },
  category: {
    type: String,
    required: true,
    enum: ['shipment', 'user', 'system', 'performance', 'security']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Some events might not be tied to a specific entity
  },
  entityType: {
    type: String,
    enum: ['shipment', 'user', 'system'],
    required: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // System events might not have a user
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    location: {
      country: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    sessionId: String,
    requestId: String,
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'system'],
      default: 'web'
    }
  },
  metrics: {
    duration: Number, // in milliseconds
    responseTime: Number,
    memoryUsage: Number,
    cpuUsage: Number,
    errorCount: Number,
    successCount: Number
  },
  tags: [String], // For categorization and filtering
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  processed: {
    type: Boolean,
    default: false
  },
  aggregated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'analytics'
});

// Indexes for performance
analyticsSchema.index({ type: 1, createdAt: -1 });
analyticsSchema.index({ category: 1, createdAt: -1 });
analyticsSchema.index({ userId: 1, createdAt: -1 });
analyticsSchema.index({ entityId: 1, entityType: 1 });
analyticsSchema.index({ createdAt: -1 });
analyticsSchema.index({ tags: 1 });
analyticsSchema.index({ severity: 1, processed: 1 });

// Compound indexes for common queries
analyticsSchema.index({ type: 1, category: 1, createdAt: -1 });
analyticsSchema.index({ userId: 1, type: 1, createdAt: -1 });

// TTL index for automatic cleanup (optional - keep data for 1 year)
analyticsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

// Static methods for analytics operations
analyticsSchema.statics.recordEvent = async function(eventData) {
  try {
    const event = new this(eventData);
    await event.save();
    return event;
  } catch (error) {
    console.error('Error recording analytics event:', error);
    throw error;
  }
};

analyticsSchema.statics.getShipmentAnalytics = async function(filters = {}) {
  const {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate = new Date(),
    userId,
    shipmentId
  } = filters;

  const matchStage = {
    category: 'shipment',
    createdAt: { $gte: startDate, $lte: endDate }
  };

  if (userId) matchStage.userId = new mongoose.Types.ObjectId(userId);
  if (shipmentId) matchStage.entityId = new mongoose.Types.ObjectId(shipmentId);

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: {
          type: '$type',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
        },
        count: { $sum: 1 },
        avgDuration: { $avg: '$metrics.duration' },
        totalEvents: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.type',
        dailyStats: {
          $push: {
            date: '$_id.date',
            count: '$count',
            avgDuration: '$avgDuration'
          }
        },
        totalCount: { $sum: '$count' }
      }
    },
    { $sort: { totalCount: -1 } }
  ];

  return await this.aggregate(pipeline);
};

analyticsSchema.statics.getUserAnalytics = async function(filters = {}) {
  const {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate = new Date(),
    userId
  } = filters;

  const matchStage = {
    category: 'user',
    createdAt: { $gte: startDate, $lte: endDate }
  };

  if (userId) matchStage.userId = new mongoose.Types.ObjectId(userId);

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: {
          userId: '$userId',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
        },
        loginCount: {
          $sum: { $cond: [{ $eq: ['$type', 'user_login'] }, 1, 0] }
        },
        actionCount: {
          $sum: { $cond: [{ $eq: ['$type', 'user_action'] }, 1, 0] }
        },
        totalEvents: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id.userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $group: {
        _id: '$_id.userId',
        userName: { $first: '$user.fullName' },
        userEmail: { $first: '$user.email' },
        dailyStats: {
          $push: {
            date: '$_id.date',
            loginCount: '$loginCount',
            actionCount: '$actionCount',
            totalEvents: '$totalEvents'
          }
        },
        totalLogins: { $sum: '$loginCount' },
        totalActions: { $sum: '$actionCount' }
      }
    },
    { $sort: { totalActions: -1 } }
  ];

  return await this.aggregate(pipeline);
};

analyticsSchema.statics.getPerformanceMetrics = async function(filters = {}) {
  const {
    startDate = new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    endDate = new Date(),
    type
  } = filters;

  const matchStage = {
    category: 'performance',
    createdAt: { $gte: startDate, $lte: endDate }
  };

  if (type) matchStage.type = type;

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: {
          hour: { $hour: '$createdAt' },
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
        },
        avgResponseTime: { $avg: '$metrics.responseTime' },
        avgMemoryUsage: { $avg: '$metrics.memoryUsage' },
        avgCpuUsage: { $avg: '$metrics.cpuUsage' },
        errorCount: { $sum: '$metrics.errorCount' },
        successCount: { $sum: '$metrics.successCount' },
        totalRequests: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.date': 1, '_id.hour': 1 }
    }
  ];

  return await this.aggregate(pipeline);
};

analyticsSchema.statics.getSystemHealth = async function() {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const pipeline = [
    {
      $match: {
        category: 'system',
        createdAt: { $gte: oneHourAgo }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        avgMetrics: {
          $avg: {
            $add: [
              { $ifNull: ['$metrics.responseTime', 0] },
              { $ifNull: ['$metrics.memoryUsage', 0] },
              { $ifNull: ['$metrics.cpuUsage', 0] }
            ]
          }
        },
        errors: { $sum: '$metrics.errorCount' },
        lastEvent: { $max: '$createdAt' }
      }
    }
  ];

  return await this.aggregate(pipeline);
};

analyticsSchema.statics.getDashboardStats = async function(userId, userRole) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const matchStage = {
    createdAt: { $gte: startOfDay }
  };

  // Filter by user if not admin
  if (userRole !== 'admin' && userId) {
    matchStage.userId = new mongoose.Types.ObjectId(userId);
  }

  const pipeline = [
    { $match: matchStage },
    {
      $facet: {
        today: [
          { $match: { createdAt: { $gte: startOfDay } } },
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ],
        week: [
          { $match: { createdAt: { $gte: startOfWeek } } },
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ],
        month: [
          { $match: { createdAt: { $gte: startOfMonth } } },
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ],
        recentEvents: [
          { $sort: { createdAt: -1 } },
          { $limit: 10 },
          {
            $project: {
              type: 1,
              category: 1,
              createdAt: 1,
              severity: 1,
              'data.message': 1
            }
          }
        ]
      }
    }
  ];

  return await this.aggregate(pipeline);
};

// Instance methods
analyticsSchema.methods.markAsProcessed = async function() {
  this.processed = true;
  return await this.save();
};

analyticsSchema.methods.addTag = async function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    return await this.save();
  }
  return this;
};

module.exports = mongoose.model('Analytics', analyticsSchema);
