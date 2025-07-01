const express = require('express');
const blockchainService = require('../services/blockchainService');
const Shipment = require('../models/Shipment');
const Analytics = require('../models/Analytics');
const { authenticate, authorize, requirePermission } = require('../middleware/auth');
const { cacheResponse, invalidateCache } = require('../middleware/cache');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   POST /api/blockchain/record-event
// @desc    Record shipment event on blockchain
// @access  Private
router.post('/record-event', authenticate, [
  body('shipmentId').isMongoId().withMessage('Valid shipment ID required'),
  body('eventType').isIn(['created', 'picked_up', 'in_transit', 'customs_cleared', 'delivered', 'damaged', 'delayed']).withMessage('Invalid event type'),
  body('data').isObject().withMessage('Event data must be an object')
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

    const { shipmentId, eventType, data } = req.body;

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

    // Record event on blockchain
    const transaction = await blockchainService.recordShipmentEvent(
      shipmentId,
      eventType,
      {
        ...data,
        userId: req.user._id,
        timestamp: new Date().toISOString(),
        location: data.location || shipment.currentLocation?.location,
        coordinates: data.coordinates || shipment.currentLocation?.coordinates
      },
      req.user.organizationId
    );

    // Record analytics
    await Analytics.recordEvent({
      type: 'blockchain_event_recorded',
      category: 'blockchain',
      entityId: shipmentId,
      entityType: 'shipment',
      userId: req.user._id,
      data: {
        shipmentId,
        eventType,
        transactionId: transaction.id,
        blockchainHash: transaction.signature
      },
      metadata: { source: 'api' }
    });

    res.json({
      success: true,
      data: {
        transactionId: transaction.id,
        signature: transaction.signature,
        timestamp: transaction.timestamp
      },
      message: 'Event recorded on blockchain successfully'
    });

  } catch (error) {
    console.error('Record blockchain event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording event on blockchain'
    });
  }
});

// @route   POST /api/blockchain/create-contract
// @desc    Create smart contract for shipment
// @access  Private (Admin/Operator)
router.post('/create-contract', authenticate, requirePermission('manage_iot'), [
  body('shipmentId').isMongoId().withMessage('Valid shipment ID required'),
  body('conditions').isObject().withMessage('Contract conditions required'),
  body('stakeholders').isArray().withMessage('Stakeholders must be an array')
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

    const { shipmentId, conditions, stakeholders, penalties = {}, rewards = {} } = req.body;

    // Verify shipment exists
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

    // Create smart contract
    const contract = await blockchainService.createShipmentContract({
      shipmentId,
      organizationId: req.user.organizationId,
      eta: shipment.eta,
      temperatureRange: conditions.temperatureRange,
      allowedRoutes: conditions.allowedRoutes,
      customsRequirements: conditions.customsRequirements,
      lateDeliveryPenalty: penalties.lateDelivery || 0,
      temperaturePenalty: penalties.temperatureBreach || 0,
      routePenalty: penalties.routeDeviation || 0,
      onTimeBonus: rewards.onTimeDelivery || 0,
      earlyBonus: rewards.earlyDelivery || 0,
      perfectBonus: rewards.perfectConditions || 0,
      stakeholders
    });

    // Record analytics
    await Analytics.recordEvent({
      type: 'smart_contract_created',
      category: 'blockchain',
      entityId: shipmentId,
      entityType: 'shipment',
      userId: req.user._id,
      data: {
        shipmentId,
        contractId: contract.id,
        stakeholders: stakeholders.length,
        conditions: Object.keys(conditions)
      },
      metadata: { source: 'api' }
    });

    res.status(201).json({
      success: true,
      data: {
        contractId: contract.id,
        terms: contract.terms,
        status: contract.status,
        createdAt: contract.createdAt
      },
      message: 'Smart contract created successfully'
    });

  } catch (error) {
    console.error('Create smart contract error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating smart contract'
    });
  }
});

// @route   POST /api/blockchain/execute-contract
// @desc    Execute smart contract conditions
// @access  Private
router.post('/execute-contract/:contractId', authenticate, [
  body('eventData').isObject().withMessage('Event data required for contract execution')
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

    const { contractId } = req.params;
    const { eventData } = req.body;

    // Execute smart contract
    const results = await blockchainService.executeContract(contractId, {
      ...eventData,
      executedBy: req.user._id,
      timestamp: new Date().toISOString()
    });

    // Record analytics
    await Analytics.recordEvent({
      type: 'smart_contract_executed',
      category: 'blockchain',
      userId: req.user._id,
      data: {
        contractId,
        eventType: eventData.eventType,
        penalties: results.penalties,
        rewards: results.rewards,
        conditionsMet: results.conditions.length
      },
      metadata: { source: 'api' }
    });

    res.json({
      success: true,
      data: results,
      message: 'Smart contract executed successfully'
    });

  } catch (error) {
    console.error('Execute smart contract error:', error);
    res.status(500).json({
      success: false,
      message: 'Error executing smart contract'
    });
  }
});

// @route   GET /api/blockchain/shipment/:shipmentId/history
// @desc    Get complete blockchain history for shipment
// @access  Private
router.get('/shipment/:shipmentId/history', authenticate, cacheResponse({ ttl: 300 }), async (req, res) => {
  try {
    const { shipmentId } = req.params;

    // Verify shipment access
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

    // Get blockchain history
    const history = blockchainService.getShipmentHistory(shipmentId);

    res.json({
      success: true,
      data: {
        shipmentId,
        totalEvents: history.length,
        events: history,
        chainIntegrity: blockchainService.isChainValid()
      }
    });

  } catch (error) {
    console.error('Get blockchain history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blockchain history'
    });
  }
});

// @route   GET /api/blockchain/shipment/:shipmentId/verify
// @desc    Verify shipment authenticity and integrity
// @access  Private
router.get('/shipment/:shipmentId/verify', authenticate, async (req, res) => {
  try {
    const { shipmentId } = req.params;

    // Verify shipment access
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

    // Verify shipment on blockchain
    const verification = await blockchainService.verifyShipment(shipmentId);

    // Record analytics
    await Analytics.recordEvent({
      type: 'shipment_verification',
      category: 'blockchain',
      entityId: shipmentId,
      entityType: 'shipment',
      userId: req.user._id,
      data: {
        shipmentId,
        isValid: verification.isValid,
        eventsVerified: verification.events,
        anomaliesFound: verification.anomalies.length
      },
      metadata: { source: 'api' }
    });

    res.json({
      success: true,
      data: verification
    });

  } catch (error) {
    console.error('Verify shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying shipment'
    });
  }
});

// @route   GET /api/blockchain/shipment/:shipmentId/proof
// @desc    Generate proof of authenticity certificate
// @access  Private
router.get('/shipment/:shipmentId/proof', authenticate, async (req, res) => {
  try {
    const { shipmentId } = req.params;

    // Verify shipment access
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

    // Generate proof of authenticity
    const proof = blockchainService.generateProofOfAuthenticity(shipmentId);

    // Record analytics
    await Analytics.recordEvent({
      type: 'proof_generated',
      category: 'blockchain',
      entityId: shipmentId,
      entityType: 'shipment',
      userId: req.user._id,
      data: {
        shipmentId,
        proofHash: proof.blockchainHash,
        totalEvents: proof.totalEvents,
        verificationStatus: proof.verificationStatus
      },
      metadata: { source: 'api' }
    });

    res.json({
      success: true,
      data: proof,
      message: 'Proof of authenticity generated successfully'
    });

  } catch (error) {
    console.error('Generate proof error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating proof of authenticity'
    });
  }
});

// @route   GET /api/blockchain/chain/status
// @desc    Get blockchain status and health
// @access  Private (Admin)
router.get('/chain/status', authenticate, authorize('admin'), cacheResponse({ ttl: 60 }), async (req, res) => {
  try {
    const status = {
      chainLength: blockchainService.chain.length,
      pendingTransactions: blockchainService.pendingTransactions.length,
      isValid: blockchainService.isChainValid(),
      difficulty: blockchainService.difficulty,
      lastBlock: blockchainService.getLatestBlock(),
      smartContracts: blockchainService.smartContracts.size,
      validators: blockchainService.validators.size
    };

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Get blockchain status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blockchain status'
    });
  }
});

// @route   POST /api/blockchain/mine
// @desc    Manually trigger mining of pending transactions
// @access  Private (Admin)
router.post('/mine', authenticate, authorize('admin'), async (req, res) => {
  try {
    if (blockchainService.pendingTransactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No pending transactions to mine'
      });
    }

    const block = await blockchainService.minePendingTransactions();

    // Record analytics
    await Analytics.recordEvent({
      type: 'blockchain_mining',
      category: 'blockchain',
      userId: req.user._id,
      data: {
        blockIndex: block.index,
        transactionCount: block.transactions.length,
        blockHash: block.hash,
        nonce: block.nonce
      },
      metadata: { source: 'api' }
    });

    res.json({
      success: true,
      data: {
        blockIndex: block.index,
        blockHash: block.hash,
        transactionCount: block.transactions.length,
        timestamp: block.timestamp
      },
      message: 'Block mined successfully'
    });

  } catch (error) {
    console.error('Mine block error:', error);
    res.status(500).json({
      success: false,
      message: 'Error mining block'
    });
  }
});

// @route   GET /api/blockchain/analytics
// @desc    Get blockchain analytics and metrics
// @access  Private (Admin)
router.get('/analytics', authenticate, authorize('admin'), cacheResponse({ ttl: 600 }), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = {
      type: { $in: ['blockchain_event_recorded', 'smart_contract_created', 'smart_contract_executed', 'shipment_verification'] }
    };

    if (Object.keys(dateFilter).length > 0) {
      matchStage.createdAt = dateFilter;
    }

    const analytics = await Analytics.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          organizations: { $addToSet: '$data.organizationId' },
          avgResponseTime: { $avg: '$metadata.responseTime' }
        }
      }
    ]);

    const summary = {
      totalEvents: blockchainService.chain.reduce((sum, block) => sum + block.transactions.length, 0),
      totalBlocks: blockchainService.chain.length,
      chainIntegrity: blockchainService.isChainValid(),
      smartContracts: blockchainService.smartContracts.size,
      pendingTransactions: blockchainService.pendingTransactions.length,
      analytics
    };

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Get blockchain analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blockchain analytics'
    });
  }
});

module.exports = router;
