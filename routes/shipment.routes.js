const router = require('express').Router();
const Shipment = require('../models/Shipment');
const Analytics = require('../models/Analytics');
const { authenticate, authorize, requirePermission } = require('../middleware/auth');
const {
  cacheShipments,
  cacheShipmentDetails,
  invalidateShipmentCache
} = require('../middleware/cache');
const socketService = require('../services/socketService');

// Get all shipments
router.get('/', authenticate, cacheShipments, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    // Build query based on user role
    let query = {};
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { containerId: { $regex: search, $options: 'i' } },
        { 'currentLocation.location': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const shipments = await Shipment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Shipment.countDocuments(query);

    // Record analytics
    await Analytics.recordEvent({
      type: 'shipment_query',
      category: 'shipment',
      userId: req.user._id,
      data: { query, resultCount: shipments.length },
      metadata: { source: 'api' }
    });

    res.json({
      success: true,
      data: shipments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get shipments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shipments'
    });
  }
});

// Get specific shipment
router.get('/:id', authenticate, cacheShipmentDetails, async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && shipment.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Record analytics
    await Analytics.recordEvent({
      type: 'shipment_viewed',
      category: 'shipment',
      entityId: shipment._id,
      entityType: 'shipment',
      userId: req.user._id,
      data: { shipmentId: shipment._id, containerId: shipment.containerId },
      metadata: { source: 'api' }
    });

    res.json({
      success: true,
      data: shipment
    });
  } catch (error) {
    console.error('Get shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shipment'
    });
  }
});

// Create new shipment
router.post('/', authenticate, requirePermission('create_shipment'), invalidateShipmentCache, async (req, res) => {
  try {
    const shipmentData = {
      ...req.body,
      userId: req.user._id
    };

    const shipment = new Shipment(shipmentData);
    const newShipment = await shipment.save();

    // Record analytics
    await Analytics.recordEvent({
      type: 'shipment_created',
      category: 'shipment',
      entityId: newShipment._id,
      entityType: 'shipment',
      userId: req.user._id,
      data: {
        shipmentId: newShipment._id,
        containerId: newShipment.containerId,
        status: newShipment.status
      },
      metadata: { source: 'api' }
    });

    // Emit real-time update
    socketService.emitToRole('admin', 'shipment_created', {
      shipment: newShipment,
      createdBy: req.user.fullName,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      data: newShipment,
      message: 'Shipment created successfully'
    });
  } catch (error) {
    console.error('Create shipment error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update shipment location
router.post('/:id/location', authenticate, requirePermission('edit_shipment'), invalidateShipmentCache, async (req, res) => {
  try {
    const { location, coordinates } = req.body;

    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && shipment.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const previousLocation = shipment.currentLocation;
    shipment.currentLocation = {
      location,
      coordinates,
      timestamp: new Date()
    };

    const updatedShipment = await shipment.save();

    // Record analytics
    await Analytics.recordEvent({
      type: 'location_update',
      category: 'shipment',
      entityId: shipment._id,
      entityType: 'shipment',
      userId: req.user._id,
      data: {
        shipmentId: shipment._id,
        previousLocation,
        newLocation: shipment.currentLocation
      },
      metadata: { source: 'api' }
    });

    // Emit real-time update
    socketService.emitToShipment(shipment._id.toString(), 'location_updated', {
      shipmentId: shipment._id,
      location,
      coordinates,
      timestamp: shipment.currentLocation.timestamp,
      updatedBy: req.user._id
    });

    res.json({
      success: true,
      data: updatedShipment,
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get shipment ETA
router.get('/:id/eta', authenticate, async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && shipment.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { eta: shipment.eta }
    });
  } catch (error) {
    console.error('Get ETA error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ETA'
    });
  }
});

// Update shipment status
router.patch('/:id/status', authenticate, requirePermission('edit_shipment'), invalidateShipmentCache, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = ['pending', 'in-transit', 'delivered', 'delayed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && shipment.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const previousStatus = shipment.status;
    shipment.status = status;
    if (notes) shipment.notes = notes;

    const updatedShipment = await shipment.save();

    // Record analytics
    await Analytics.recordEvent({
      type: 'status_change',
      category: 'shipment',
      entityId: shipment._id,
      entityType: 'shipment',
      userId: req.user._id,
      data: {
        shipmentId: shipment._id,
        previousStatus,
        newStatus: status,
        notes
      },
      metadata: { source: 'api' }
    });

    // Emit real-time update
    socketService.emitToShipment(shipment._id.toString(), 'status_updated', {
      shipmentId: shipment._id,
      status,
      notes,
      timestamp: new Date().toISOString(),
      updatedBy: req.user._id
    });

    res.json({
      success: true,
      data: updatedShipment,
      message: 'Status updated successfully'
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete shipment
router.delete('/:id', authenticate, requirePermission('delete_shipment'), invalidateShipmentCache, async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && shipment.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Shipment.findByIdAndDelete(req.params.id);

    // Record analytics
    await Analytics.recordEvent({
      type: 'shipment_deleted',
      category: 'shipment',
      entityId: shipment._id,
      entityType: 'shipment',
      userId: req.user._id,
      data: {
        shipmentId: shipment._id,
        containerId: shipment.containerId
      },
      metadata: { source: 'api' }
    });

    // Emit real-time update
    socketService.emitToRole('admin', 'shipment_deleted', {
      shipmentId: shipment._id,
      containerId: shipment.containerId,
      deletedBy: req.user.fullName,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Shipment deleted successfully'
    });
  } catch (error) {
    console.error('Delete shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting shipment'
    });
  }
});

module.exports = router;