const express = require('express');
const Analytics = require('../models/Analytics');
const Shipment = require('../models/Shipment');
const User = require('../models/User');
const { authenticate, authorize, requirePermission } = require('../middleware/auth');
const { cacheAnalytics, invalidateAnalyticsCache } = require('../middleware/cache');
const socketService = require('../services/socketService');

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private
router.get('/dashboard', authenticate, cacheAnalytics, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Get dashboard statistics
    const dashboardStats = await Analytics.getDashboardStats(userId, userRole);
    
    // Get shipment statistics
    const shipmentStats = await getShipmentStatistics(userId, userRole);
    
    // Get user activity (admin only)
    let userActivity = null;
    if (userRole === 'admin') {
      userActivity = await getUserActivityStats();
    }

    // Get system health
    const systemHealth = await Analytics.getSystemHealth();

    res.json({
      success: true,
      data: {
        dashboard: dashboardStats[0] || {},
        shipments: shipmentStats,
        userActivity,
        systemHealth,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard analytics'
    });
  }
});

// @route   GET /api/analytics/shipments
// @desc    Get shipment analytics
// @access  Private
router.get('/shipments', authenticate, requirePermission('view_analytics'), cacheAnalytics, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      shipmentId,
      groupBy = 'day',
      metrics = 'all'
    } = req.query;

    const filters = {
      startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: endDate ? new Date(endDate) : new Date(),
      userId: req.user.role === 'admin' ? null : req.user._id,
      shipmentId
    };

    const analytics = await Analytics.getShipmentAnalytics(filters);
    
    // Get additional shipment metrics
    const shipmentMetrics = await getDetailedShipmentMetrics(filters, groupBy, metrics);

    res.json({
      success: true,
      data: {
        analytics,
        metrics: shipmentMetrics,
        filters,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Shipment analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shipment analytics'
    });
  }
});

// @route   GET /api/analytics/users
// @desc    Get user analytics (admin only)
// @access  Private (Admin)
router.get('/users', authenticate, authorize('admin'), cacheAnalytics, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      userId,
      groupBy = 'day'
    } = req.query;

    const filters = {
      startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: endDate ? new Date(endDate) : new Date(),
      userId
    };

    const userAnalytics = await Analytics.getUserAnalytics(filters);
    
    // Get user engagement metrics
    const engagementMetrics = await getUserEngagementMetrics(filters);

    res.json({
      success: true,
      data: {
        analytics: userAnalytics,
        engagement: engagementMetrics,
        filters,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user analytics'
    });
  }
});

// @route   GET /api/analytics/performance
// @desc    Get performance metrics
// @access  Private (Admin)
router.get('/performance', authenticate, authorize('admin'), cacheAnalytics, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      type,
      interval = 'hour'
    } = req.query;

    const filters = {
      startDate: startDate ? new Date(startDate) : new Date(Date.now() - 24 * 60 * 60 * 1000),
      endDate: endDate ? new Date(endDate) : new Date(),
      type
    };

    const performanceMetrics = await Analytics.getPerformanceMetrics(filters);
    
    // Get system resource usage
    const resourceUsage = await getSystemResourceUsage(filters, interval);

    res.json({
      success: true,
      data: {
        performance: performanceMetrics,
        resources: resourceUsage,
        filters,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Performance analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching performance analytics'
    });
  }
});

// @route   GET /api/analytics/realtime
// @desc    Get real-time analytics
// @access  Private
router.get('/realtime', authenticate, async (req, res) => {
  try {
    const { type = 'all' } = req.query;
    
    // Get real-time metrics from the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const realtimeData = await Analytics.find({
      createdAt: { $gte: fiveMinutesAgo },
      ...(type !== 'all' && { type })
    })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

    // Get active connections
    const activeConnections = socketService.getConnectedUsers().length;
    
    // Get current system status
    const systemStatus = await getCurrentSystemStatus();

    res.json({
      success: true,
      data: {
        events: realtimeData,
        activeConnections,
        systemStatus,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Real-time analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching real-time analytics'
    });
  }
});

// @route   POST /api/analytics/event
// @desc    Record analytics event
// @access  Private
router.post('/event', authenticate, async (req, res) => {
  try {
    const {
      type,
      category,
      entityId,
      entityType,
      data,
      metadata = {},
      metrics = {},
      tags = [],
      severity = 'low'
    } = req.body;

    // Validate required fields
    if (!type || !category || !data) {
      return res.status(400).json({
        success: false,
        message: 'Type, category, and data are required'
      });
    }

    // Create analytics event
    const eventData = {
      type,
      category,
      entityId,
      entityType,
      userId: req.user._id,
      data,
      metadata: {
        ...metadata,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        source: 'api'
      },
      metrics,
      tags,
      severity
    };

    const event = await Analytics.recordEvent(eventData);

    // Emit real-time update if needed
    if (severity === 'high' || severity === 'critical') {
      socketService.emitToRole('admin', 'analytics_alert', {
        event: event,
        timestamp: new Date().toISOString()
      });
    }

    res.status(201).json({
      success: true,
      data: event,
      message: 'Analytics event recorded successfully'
    });

  } catch (error) {
    console.error('Record analytics event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording analytics event'
    });
  }
});

// @route   GET /api/analytics/export
// @desc    Export analytics data
// @access  Private (Admin)
router.get('/export', authenticate, authorize('admin'), async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      type,
      category,
      format = 'json'
    } = req.query;

    const filters = {
      ...(startDate && { createdAt: { $gte: new Date(startDate) } }),
      ...(endDate && { createdAt: { ...filters.createdAt, $lte: new Date(endDate) } }),
      ...(type && { type }),
      ...(category && { category })
    };

    const data = await Analytics.find(filters)
      .sort({ createdAt: -1 })
      .limit(10000) // Limit for performance
      .lean();

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics-export.csv');
      return res.send(csv);
    }

    res.json({
      success: true,
      data,
      count: data.length,
      filters,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting analytics data'
    });
  }
});

// Helper functions
async function getShipmentStatistics(userId, userRole) {
  const matchStage = userRole === 'admin' ? {} : { userId };
  
  const stats = await Shipment.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgDeliveryTime: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'delivered'] },
              { $subtract: ['$updatedAt', '$createdAt'] },
              null
            ]
          }
        }
      }
    }
  ]);

  return stats;
}

async function getUserActivityStats() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  return await User.aggregate([
    {
      $match: {
        lastLogin: { $gte: oneDayAgo }
      }
    },
    {
      $group: {
        _id: '$role',
        activeUsers: { $sum: 1 },
        avgSessionTime: { $avg: '$sessionDuration' }
      }
    }
  ]);
}

async function getDetailedShipmentMetrics(filters, groupBy, metrics) {
  // Implementation for detailed shipment metrics
  // This would include delivery times, route efficiency, etc.
  return {};
}

async function getUserEngagementMetrics(filters) {
  // Implementation for user engagement metrics
  return {};
}

async function getSystemResourceUsage(filters, interval) {
  // Implementation for system resource usage
  return {};
}

async function getCurrentSystemStatus() {
  return {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    timestamp: new Date().toISOString()
  };
}

function convertToCSV(data) {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'object' ? JSON.stringify(value) : value;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
}

module.exports = router;
