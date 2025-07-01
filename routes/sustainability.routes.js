const express = require('express');
const SustainabilityMetrics = require('../models/SustainabilityMetrics');
const Shipment = require('../models/Shipment');
const Analytics = require('../models/Analytics');
const { authenticate, authorize, requirePermission } = require('../middleware/auth');
const { cacheResponse, invalidateCache } = require('../middleware/cache');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/sustainability/dashboard
// @desc    Get sustainability dashboard data
// @access  Private
router.get('/dashboard', authenticate, cacheResponse({ ttl: 300 }), async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

    // Get organization summary
    const summary = await SustainabilityMetrics.getOrganizationSummary(
      req.user.organizationId,
      period
    );

    // Get recent metrics
    const recentMetrics = await SustainabilityMetrics.find({
      organizationId: req.user.organizationId,
      period
    })
    .sort({ createdAt: -1 })
    .limit(12)
    .lean();

    // Calculate trends
    const trends = calculateTrends(recentMetrics);

    // Get benchmark data
    const benchmarks = await SustainabilityMetrics.getBenchmarkData(req.user.organizationId);

    res.json({
      success: true,
      data: {
        summary,
        trends,
        benchmarks,
        recentMetrics: recentMetrics.slice(0, 5)
      }
    });

  } catch (error) {
    console.error('Get sustainability dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sustainability dashboard'
    });
  }
});

// @route   POST /api/sustainability/metrics
// @desc    Record sustainability metrics for shipment
// @access  Private
router.post('/metrics', authenticate, [
  body('shipmentId').isMongoId().withMessage('Valid shipment ID required'),
  body('carbonFootprint').optional().isObject().withMessage('Carbon footprint must be an object'),
  body('energyConsumption').optional().isObject().withMessage('Energy consumption must be an object'),
  body('fuelConsumption').optional().isObject().withMessage('Fuel consumption must be an object')
], invalidateCache(['sustainability:*']), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { shipmentId, ...metricsData } = req.body;

    // Verify shipment exists and user has access
    const shipment = await Shipment.findOne({
      _id: shipmentId,
      organizationId: req.user.organizationId
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Create or update sustainability metrics
    let metrics = await SustainabilityMetrics.findOne({
      shipmentId,
      organizationId: req.user.organizationId
    });

    if (metrics) {
      Object.assign(metrics, metricsData);
    } else {
      metrics = new SustainabilityMetrics({
        organizationId: req.user.organizationId,
        shipmentId,
        ...metricsData
      });
    }

    // Calculate derived metrics
    metrics.calculateCarbonFootprint();
    metrics.calculateESGScore();
    metrics.updateTargetProgress();

    await metrics.save();

    // Record analytics
    await Analytics.recordEvent({
      type: 'sustainability_metrics_recorded',
      category: 'sustainability',
      entityId: shipmentId,
      entityType: 'shipment',
      userId: req.user._id,
      data: {
        shipmentId,
        carbonFootprint: metrics.carbonFootprint.total,
        esgScore: metrics.esgScores.overall,
        energyConsumption: metrics.energyConsumption.total
      },
      metadata: { source: 'api' }
    });

    res.status(201).json({
      success: true,
      data: metrics,
      message: 'Sustainability metrics recorded successfully'
    });

  } catch (error) {
    console.error('Record sustainability metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording sustainability metrics'
    });
  }
});

// @route   GET /api/sustainability/carbon-footprint
// @desc    Get carbon footprint analysis
// @access  Private
router.get('/carbon-footprint', authenticate, cacheResponse({ ttl: 600 }), async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    const matchStage = { organizationId: req.user.organizationId };
    
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const groupStage = {
      _id: groupBy === 'month' 
        ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }
        : { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } },
      totalCarbon: { $sum: '$carbonFootprint.total' },
      transportation: { $sum: '$carbonFootprint.transportation' },
      packaging: { $sum: '$carbonFootprint.packaging' },
      warehousing: { $sum: '$carbonFootprint.warehousing' },
      shipmentCount: { $sum: 1 },
      avgCarbonPerShipment: { $avg: '$carbonFootprint.total' }
    };

    const carbonData = await SustainabilityMetrics.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1 } }
    ]);

    // Calculate reduction targets and progress
    const targetAnalysis = await calculateCarbonTargets(req.user.organizationId);

    res.json({
      success: true,
      data: {
        carbonData,
        targetAnalysis,
        summary: {
          totalEmissions: carbonData.reduce((sum, item) => sum + item.totalCarbon, 0),
          averagePerShipment: carbonData.length > 0 
            ? carbonData.reduce((sum, item) => sum + item.avgCarbonPerShipment, 0) / carbonData.length 
            : 0,
          breakdown: {
            transportation: carbonData.reduce((sum, item) => sum + item.transportation, 0),
            packaging: carbonData.reduce((sum, item) => sum + item.packaging, 0),
            warehousing: carbonData.reduce((sum, item) => sum + item.warehousing, 0)
          }
        }
      }
    });

  } catch (error) {
    console.error('Get carbon footprint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching carbon footprint data'
    });
  }
});

// @route   GET /api/sustainability/esg-report
// @desc    Generate ESG report
// @access  Private (Admin)
router.get('/esg-report', authenticate, authorize('admin'), cacheResponse({ ttl: 3600 }), async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    // Get all metrics for the year
    const metrics = await SustainabilityMetrics.find({
      organizationId: req.user.organizationId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).lean();

    // Calculate ESG scores
    const esgAnalysis = calculateESGAnalysis(metrics);

    // Get certifications and compliance
    const compliance = await getComplianceStatus(req.user.organizationId);

    // Generate recommendations
    const recommendations = generateSustainabilityRecommendations(esgAnalysis, compliance);

    const report = {
      reportYear: year,
      generatedAt: new Date().toISOString(),
      organizationId: req.user.organizationId,
      esgScores: esgAnalysis.scores,
      performance: esgAnalysis.performance,
      compliance,
      recommendations,
      dataPoints: metrics.length,
      reportingStandards: ['GRI', 'SASB', 'TCFD'],
      nextSteps: recommendations.slice(0, 5)
    };

    // Record analytics
    await Analytics.recordEvent({
      type: 'esg_report_generated',
      category: 'sustainability',
      userId: req.user._id,
      data: {
        reportYear: year,
        esgScore: esgAnalysis.scores.overall,
        dataPoints: metrics.length,
        recommendationCount: recommendations.length
      },
      metadata: { source: 'api' }
    });

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Generate ESG report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating ESG report'
    });
  }
});

// @route   POST /api/sustainability/targets
// @desc    Set sustainability targets
// @access  Private (Admin)
router.post('/targets', authenticate, authorize('admin'), [
  body('carbonReduction').optional().isObject().withMessage('Carbon reduction target must be an object'),
  body('renewableEnergy').optional().isObject().withMessage('Renewable energy target must be an object'),
  body('wasteReduction').optional().isObject().withMessage('Waste reduction target must be an object')
], invalidateCache(['sustainability:*']), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { carbonReduction, renewableEnergy, wasteReduction, waterReduction } = req.body;

    // Update targets for all future metrics
    const updateData = {};
    if (carbonReduction) updateData['targets.carbonReduction'] = carbonReduction;
    if (renewableEnergy) updateData['targets.renewableEnergy'] = renewableEnergy;
    if (wasteReduction) updateData['targets.wasteReduction'] = wasteReduction;
    if (waterReduction) updateData['targets.waterReduction'] = waterReduction;

    await SustainabilityMetrics.updateMany(
      { organizationId: req.user.organizationId },
      { $set: updateData }
    );

    // Record analytics
    await Analytics.recordEvent({
      type: 'sustainability_targets_set',
      category: 'sustainability',
      userId: req.user._id,
      data: {
        targets: Object.keys(updateData),
        carbonTarget: carbonReduction?.target,
        renewableTarget: renewableEnergy?.target,
        wasteTarget: wasteReduction?.target
      },
      metadata: { source: 'api' }
    });

    res.json({
      success: true,
      message: 'Sustainability targets updated successfully'
    });

  } catch (error) {
    console.error('Set sustainability targets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting sustainability targets'
    });
  }
});

// @route   GET /api/sustainability/benchmarks
// @desc    Get industry benchmarks and comparisons
// @access  Private
router.get('/benchmarks', authenticate, cacheResponse({ ttl: 3600 }), async (req, res) => {
  try {
    // Get organization's performance
    const orgMetrics = await SustainabilityMetrics.find({
      organizationId: req.user.organizationId
    }).sort({ createdAt: -1 }).limit(10);

    // Get industry benchmarks
    const benchmarks = await SustainabilityMetrics.getBenchmarkData(req.user.organizationId);

    // Calculate performance ranking
    const ranking = await calculatePerformanceRanking(req.user.organizationId);

    res.json({
      success: true,
      data: {
        organizationMetrics: {
          avgCarbonIntensity: orgMetrics.reduce((sum, m) => sum + m.carbonIntensity, 0) / orgMetrics.length,
          avgEnergyIntensity: orgMetrics.reduce((sum, m) => sum + m.energyEfficiency, 0) / orgMetrics.length,
          avgESGScore: orgMetrics.reduce((sum, m) => sum + m.esgScores.overall, 0) / orgMetrics.length
        },
        industryBenchmarks: benchmarks,
        ranking,
        recommendations: generateBenchmarkRecommendations(orgMetrics, benchmarks)
      }
    });

  } catch (error) {
    console.error('Get sustainability benchmarks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sustainability benchmarks'
    });
  }
});

// @route   GET /api/sustainability/export
// @desc    Export sustainability data
// @access  Private
router.get('/export', authenticate, async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate } = req.query;

    const query = { organizationId: req.user.organizationId };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const metrics = await SustainabilityMetrics.find(query).lean();

    let exportData;
    let contentType;
    let filename;

    if (format === 'csv') {
      exportData = convertToCSV(metrics);
      contentType = 'text/csv';
      filename = `sustainability-metrics-${Date.now()}.csv`;
    } else {
      exportData = JSON.stringify(metrics, null, 2);
      contentType = 'application/json';
      filename = `sustainability-metrics-${Date.now()}.json`;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);

  } catch (error) {
    console.error('Export sustainability data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting sustainability data'
    });
  }
});

// Helper functions
function calculateTrends(metrics) {
  if (metrics.length < 2) return {};

  const latest = metrics[0];
  const previous = metrics[1];

  return {
    carbonFootprint: calculatePercentageChange(previous.carbonFootprint?.total, latest.carbonFootprint?.total),
    energyConsumption: calculatePercentageChange(previous.energyConsumption?.total, latest.energyConsumption?.total),
    esgScore: calculatePercentageChange(previous.esgScores?.overall, latest.esgScores?.overall),
    renewablePercentage: calculatePercentageChange(previous.energyConsumption?.renewablePercentage, latest.energyConsumption?.renewablePercentage)
  };
}

function calculatePercentageChange(oldValue, newValue) {
  if (!oldValue || !newValue) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

async function calculateCarbonTargets(organizationId) {
  const metrics = await SustainabilityMetrics.findOne({
    organizationId,
    'targets.carbonReduction.target': { $exists: true }
  }).sort({ createdAt: -1 });

  if (!metrics) return null;

  const target = metrics.targets.carbonReduction;
  const progress = target.current || 0;
  const timeRemaining = target.deadline ? Math.max(0, new Date(target.deadline) - new Date()) : 0;

  return {
    target: target.target,
    current: progress,
    achieved: target.achieved,
    timeRemaining: Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)), // days
    onTrack: progress >= (target.target * 0.8) // 80% of target
  };
}

function calculateESGAnalysis(metrics) {
  if (metrics.length === 0) return { scores: {}, performance: {} };

  const avgScores = {
    environmental: metrics.reduce((sum, m) => sum + (m.esgScores?.environmental || 0), 0) / metrics.length,
    social: metrics.reduce((sum, m) => sum + (m.esgScores?.social || 0), 0) / metrics.length,
    governance: metrics.reduce((sum, m) => sum + (m.esgScores?.governance || 0), 0) / metrics.length,
    overall: metrics.reduce((sum, m) => sum + (m.esgScores?.overall || 0), 0) / metrics.length
  };

  return {
    scores: avgScores,
    performance: {
      carbonIntensity: metrics.reduce((sum, m) => sum + (m.carbonFootprint?.total || 0), 0) / metrics.length,
      renewablePercentage: metrics.reduce((sum, m) => sum + (m.energyConsumption?.renewablePercentage || 0), 0) / metrics.length,
      recyclingRate: metrics.reduce((sum, m) => sum + (m.wasteGeneration?.recyclingRate || 0), 0) / metrics.length
    }
  };
}

async function getComplianceStatus(organizationId) {
  const metrics = await SustainabilityMetrics.findOne({ organizationId }).sort({ createdAt: -1 });
  
  return metrics?.compliance || {
    certifications: [],
    dataResidency: [],
    encryptionStandards: [],
    complianceScore: 0
  };
}

function generateSustainabilityRecommendations(esgAnalysis, compliance) {
  const recommendations = [];

  if (esgAnalysis.scores.environmental < 70) {
    recommendations.push({
      category: 'environmental',
      priority: 'high',
      title: 'Improve Environmental Performance',
      description: 'Focus on reducing carbon emissions and increasing renewable energy usage'
    });
  }

  if (esgAnalysis.performance.renewablePercentage < 50) {
    recommendations.push({
      category: 'energy',
      priority: 'medium',
      title: 'Increase Renewable Energy',
      description: 'Target 50% renewable energy usage to improve sustainability score'
    });
  }

  return recommendations;
}

async function calculatePerformanceRanking(organizationId) {
  // Simplified ranking calculation
  return {
    carbonRanking: 'top_25',
    energyRanking: 'top_50',
    wasteRanking: 'top_10'
  };
}

function generateBenchmarkRecommendations(orgMetrics, benchmarks) {
  return [
    {
      title: 'Optimize Transportation Routes',
      impact: 'High',
      description: 'Reduce carbon intensity by 15% through AI-powered route optimization'
    }
  ];
}

function convertToCSV(data) {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
  ].join('\n');

  return csvContent;
}

module.exports = router;
