const express = require('express');
const aiOptimizationService = require('../services/aiOptimizationService');
const Shipment = require('../models/Shipment');
const Analytics = require('../models/Analytics');
const { authenticate, authorize, requirePermission } = require('../middleware/auth');
const { cacheResponse, invalidateCache } = require('../middleware/cache');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   POST /api/ai/optimize-route
// @desc    Optimize route using AI algorithms
// @access  Private (requires AI optimization feature)
router.post('/optimize-route', authenticate, requirePermission('manage_iot'), [
  body('waypoints').isArray({ min: 2 }).withMessage('At least 2 waypoints required'),
  body('waypoints.*.lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('waypoints.*.lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if organization has AI optimization feature
    const user = await req.user.populate('organizationId');
    if (!user.organizationId?.isFeatureEnabled('aiOptimization')) {
      return res.status(403).json({
        success: false,
        message: 'AI optimization feature not available in your subscription plan'
      });
    }

    const { waypoints, options = {} } = req.body;

    // Optimize route
    const optimizedRoute = await aiOptimizationService.optimizeRoute(waypoints, {
      ...options,
      organizationId: req.user.organizationId
    });

    // Record analytics
    await Analytics.recordEvent({
      type: 'ai_route_optimization',
      category: 'system',
      userId: req.user._id,
      data: {
        waypointCount: waypoints.length,
        algorithm: optimizedRoute.algorithm,
        originalDistance: aiOptimizationService.calculateTotalDistance(waypoints),
        optimizedDistance: optimizedRoute.totalDistance,
        timeSavings: optimizedRoute.timeSavings || 0,
        fuelSavings: optimizedRoute.fuelSavings || 0
      },
      metadata: { source: 'api' }
    });

    res.json({
      success: true,
      data: optimizedRoute,
      message: 'Route optimized successfully'
    });

  } catch (error) {
    console.error('Route optimization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error optimizing route'
    });
  }
});

// @route   POST /api/ai/predict-eta
// @desc    Predict ETA using machine learning
// @access  Private
router.post('/predict-eta', authenticate, [
  body('route.waypoints').isArray({ min: 2 }).withMessage('Route with waypoints required'),
  body('shipmentId').optional().isMongoId().withMessage('Invalid shipment ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { route, options = {}, shipmentId } = req.body;

    // Get shipment data if provided
    let shipment = null;
    if (shipmentId) {
      shipment = await Shipment.findOne({
        _id: shipmentId,
        organizationId: req.user.organizationId
      });
    }

    // Predict ETA
    const etaPrediction = await aiOptimizationService.predictETA(route, {
      ...options,
      shipment,
      organizationId: req.user.organizationId
    });

    // Update shipment ETA if provided
    if (shipment) {
      shipment.eta = etaPrediction.eta;
      shipment.aiOptimized = true;
      await shipment.save();
    }

    // Record analytics
    await Analytics.recordEvent({
      type: 'ai_eta_prediction',
      category: 'system',
      userId: req.user._id,
      data: {
        shipmentId,
        predictedETA: etaPrediction.eta,
        confidence: etaPrediction.confidence,
        estimatedMinutes: etaPrediction.estimatedMinutes
      },
      metadata: { source: 'api' }
    });

    res.json({
      success: true,
      data: etaPrediction,
      message: 'ETA predicted successfully'
    });

  } catch (error) {
    console.error('ETA prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error predicting ETA'
    });
  }
});

// @route   POST /api/ai/optimize-schedule
// @desc    Optimize delivery schedule for multiple shipments
// @access  Private (Admin/Operator)
router.post('/optimize-schedule', authenticate, requirePermission('manage_iot'), [
  body('shipmentIds').isArray({ min: 1 }).withMessage('At least one shipment required'),
  body('constraints').optional().isObject().withMessage('Constraints must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check AI optimization feature
    const user = await req.user.populate('organizationId');
    if (!user.organizationId?.isFeatureEnabled('aiOptimization')) {
      return res.status(403).json({
        success: false,
        message: 'AI optimization feature not available in your subscription plan'
      });
    }

    const { shipmentIds, constraints = {} } = req.body;

    // Get shipments
    const shipments = await Shipment.find({
      _id: { $in: shipmentIds },
      organizationId: req.user.organizationId
    }).populate('iotDevices');

    if (shipments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No shipments found'
      });
    }

    // Optimize schedule
    const optimizedSchedule = await aiOptimizationService.optimizeDeliverySchedule(
      shipments,
      constraints
    );

    // Update shipments with optimized data
    for (const route of optimizedSchedule.routes) {
      for (const shipment of route.shipments) {
        await Shipment.findByIdAndUpdate(shipment._id, {
          aiOptimized: true,
          optimizationData: {
            algorithm: 'schedule_optimization',
            routeEfficiency: route.efficiency,
            estimatedCost: route.estimatedCost
          }
        });
      }
    }

    // Record analytics
    await Analytics.recordEvent({
      type: 'ai_schedule_optimization',
      category: 'system',
      userId: req.user._id,
      data: {
        shipmentCount: shipments.length,
        routeCount: optimizedSchedule.routes.length,
        totalDistance: optimizedSchedule.totalDistance,
        totalCost: optimizedSchedule.totalCost,
        efficiency: optimizedSchedule.efficiency
      },
      metadata: { source: 'api' }
    });

    res.json({
      success: true,
      data: optimizedSchedule,
      message: 'Schedule optimized successfully'
    });

  } catch (error) {
    console.error('Schedule optimization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error optimizing schedule'
    });
  }
});

// @route   GET /api/ai/optimization-history
// @desc    Get AI optimization history
// @access  Private
router.get('/optimization-history', authenticate, cacheResponse({ ttl: 300 }), async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;

    let query = {
      userId: req.user._id,
      type: { $in: ['ai_route_optimization', 'ai_eta_prediction', 'ai_schedule_optimization'] }
    };

    if (type) {
      query.type = type;
    }

    const skip = (page - 1) * limit;
    const history = await Analytics.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Analytics.countDocuments(query);

    res.json({
      success: true,
      data: history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get optimization history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching optimization history'
    });
  }
});

// @route   GET /api/ai/performance-metrics
// @desc    Get AI optimization performance metrics
// @access  Private (Admin)
router.get('/performance-metrics', authenticate, authorize('admin'), cacheResponse({ ttl: 600 }), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = {
      type: { $in: ['ai_route_optimization', 'ai_eta_prediction', 'ai_schedule_optimization'] }
    };

    if (Object.keys(dateFilter).length > 0) {
      matchStage.createdAt = dateFilter;
    }

    const metrics = await Analytics.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgTimeSavings: { $avg: '$data.timeSavings' },
          avgFuelSavings: { $avg: '$data.fuelSavings' },
          avgEfficiency: { $avg: '$data.efficiency' },
          totalCostSavings: { $sum: '$data.costSavings' }
        }
      }
    ]);

    // Calculate overall performance
    const overallMetrics = await Analytics.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOptimizations: { $sum: 1 },
          totalTimeSavings: { $sum: '$data.timeSavings' },
          totalFuelSavings: { $sum: '$data.fuelSavings' },
          totalCostSavings: { $sum: '$data.costSavings' },
          avgConfidence: { $avg: '$data.confidence' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        byType: metrics,
        overall: overallMetrics[0] || {},
        period: { startDate, endDate }
      }
    });

  } catch (error) {
    console.error('Get AI performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching AI performance metrics'
    });
  }
});

// @route   POST /api/ai/feedback
// @desc    Submit feedback on AI optimization results
// @access  Private
router.post('/feedback', authenticate, [
  body('optimizationId').isMongoId().withMessage('Valid optimization ID required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback').optional().isString().withMessage('Feedback must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { optimizationId, rating, feedback, actualResults } = req.body;

    // Find the optimization record
    const optimization = await Analytics.findById(optimizationId);
    if (!optimization || optimization.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Optimization record not found'
      });
    }

    // Record feedback
    await Analytics.recordEvent({
      type: 'ai_optimization_feedback',
      category: 'system',
      userId: req.user._id,
      data: {
        optimizationId,
        optimizationType: optimization.type,
        rating,
        feedback,
        actualResults,
        predictedResults: optimization.data
      },
      metadata: { source: 'api' }
    });

    res.json({
      success: true,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Submit AI feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback'
    });
  }
});

module.exports = router;
