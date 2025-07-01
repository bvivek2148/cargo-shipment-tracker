const express = require('express');
const IoTDevice = require('../models/IoTDevice');
const Shipment = require('../models/Shipment');
const Analytics = require('../models/Analytics');
const { authenticate, authorize, requirePermission } = require('../middleware/auth');
const { cacheResponse, invalidateCache } = require('../middleware/cache');
const { body, validationResult } = require('express-validator');
const socketService = require('../services/socketService');

const router = express.Router();

// @route   GET /api/iot/devices
// @desc    Get all IoT devices for organization
// @access  Private
router.get('/devices', authenticate, cacheResponse({ ttl: 300 }), async (req, res) => {
  try {
    const { status, type, shipmentId, page = 1, limit = 20 } = req.query;
    
    let query = { organizationId: req.user.organizationId };
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (shipmentId) query.shipmentId = shipmentId;

    const skip = (page - 1) * limit;
    const devices = await IoTDevice.find(query)
      .populate('shipmentId', 'containerId status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await IoTDevice.countDocuments(query);

    // Add health status to each device
    const devicesWithHealth = devices.map(device => ({
      ...device.toObject(),
      health: device.health,
      isOnline: device.isOnline
    }));

    res.json({
      success: true,
      data: devicesWithHealth,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get IoT devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching IoT devices'
    });
  }
});

// @route   POST /api/iot/devices
// @desc    Register new IoT device
// @access  Private (Admin/Operator)
router.post('/devices', authenticate, requirePermission('manage_iot'), [
  body('deviceId').trim().isLength({ min: 1 }).withMessage('Device ID is required'),
  body('name').trim().isLength({ min: 1 }).withMessage('Device name is required'),
  body('type').isIn([
    'gps_tracker', 'temperature_sensor', 'humidity_sensor', 'pressure_sensor',
    'accelerometer', 'door_sensor', 'fuel_sensor', 'weight_sensor', 'camera', 'beacon', 'multi_sensor'
  ]).withMessage('Invalid device type')
], invalidateCache(['iot:*']), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if device ID already exists
    const existingDevice = await IoTDevice.findOne({ deviceId: req.body.deviceId });
    if (existingDevice) {
      return res.status(400).json({
        success: false,
        message: 'Device with this ID already exists'
      });
    }

    const deviceData = {
      ...req.body,
      organizationId: req.user.organizationId,
      status: 'inactive'
    };

    const device = new IoTDevice(deviceData);
    await device.save();

    // Record analytics
    await Analytics.recordEvent({
      type: 'iot_device_registered',
      category: 'system',
      entityId: device._id,
      entityType: 'iot_device',
      userId: req.user._id,
      data: {
        deviceId: device.deviceId,
        type: device.type,
        organizationId: req.user.organizationId
      },
      metadata: { source: 'api' }
    });

    res.status(201).json({
      success: true,
      data: device,
      message: 'IoT device registered successfully'
    });

  } catch (error) {
    console.error('Register IoT device error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering IoT device'
    });
  }
});

// @route   GET /api/iot/devices/:deviceId
// @desc    Get specific IoT device
// @access  Private
router.get('/devices/:deviceId', authenticate, cacheResponse({ ttl: 60 }), async (req, res) => {
  try {
    const device = await IoTDevice.findOne({
      deviceId: req.params.deviceId,
      organizationId: req.user.organizationId
    }).populate('shipmentId', 'containerId status currentLocation');

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'IoT device not found'
      });
    }

    // Add computed properties
    const deviceData = {
      ...device.toObject(),
      health: device.health,
      isOnline: device.isOnline
    };

    res.json({
      success: true,
      data: deviceData
    });

  } catch (error) {
    console.error('Get IoT device error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching IoT device'
    });
  }
});

// @route   POST /api/iot/devices/:deviceId/data
// @desc    Receive sensor data from IoT device
// @access  Public (with device authentication)
router.post('/devices/:deviceId/data', [
  body('sensors').isArray().withMessage('Sensors data must be an array'),
  body('timestamp').optional().isISO8601().withMessage('Invalid timestamp format')
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

    const device = await IoTDevice.findOne({ deviceId: req.params.deviceId });
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const { sensors, location, battery, timestamp } = req.body;
    const dataTimestamp = timestamp ? new Date(timestamp) : new Date();

    // Update sensor readings
    if (sensors && sensors.length > 0) {
      for (const sensor of sensors) {
        await device.addSensorReading(
          sensor.type,
          sensor.value,
          sensor.unit,
          dataTimestamp
        );
      }
    }

    // Update location if provided
    if (location && location.lat && location.lng) {
      await device.updateLocation(
        location.lat,
        location.lng,
        location.accuracy,
        location.altitude,
        location.speed,
        location.heading,
        dataTimestamp
      );

      // Update shipment location if device is attached to shipment
      if (device.shipmentId) {
        const shipment = await Shipment.findById(device.shipmentId);
        if (shipment) {
          shipment.currentLocation = {
            location: `${location.lat}, ${location.lng}`,
            coordinates: { lat: location.lat, lng: location.lng },
            timestamp: dataTimestamp
          };
          await shipment.save();

          // Emit real-time location update
          socketService.emitToShipment(device.shipmentId.toString(), 'location_updated', {
            shipmentId: device.shipmentId,
            location: shipment.currentLocation.location,
            coordinates: shipment.currentLocation.coordinates,
            timestamp: dataTimestamp,
            source: 'iot_device',
            deviceId: device.deviceId
          });
        }
      }
    }

    // Update battery if provided
    if (battery) {
      await device.updateBattery(battery.level, battery.voltage);
    }

    // Update device status to active
    if (device.status === 'inactive') {
      device.status = 'active';
      await device.save();
    }

    res.json({
      success: true,
      message: 'Data received successfully',
      timestamp: dataTimestamp
    });

  } catch (error) {
    console.error('Receive IoT data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing IoT data'
    });
  }
});

// @route   PUT /api/iot/devices/:deviceId/assign
// @desc    Assign device to shipment
// @access  Private (Admin/Operator)
router.put('/devices/:deviceId/assign', authenticate, requirePermission('manage_iot'), [
  body('shipmentId').isMongoId().withMessage('Valid shipment ID is required')
], invalidateCache(['iot:*', 'shipments:*']), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const device = await IoTDevice.findOne({
      deviceId: req.params.deviceId,
      organizationId: req.user.organizationId
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const shipment = await Shipment.findOne({
      _id: req.body.shipmentId,
      organizationId: req.user.organizationId
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Check if device is already assigned to another shipment
    if (device.shipmentId && device.shipmentId.toString() !== req.body.shipmentId) {
      return res.status(400).json({
        success: false,
        message: 'Device is already assigned to another shipment'
      });
    }

    device.shipmentId = req.body.shipmentId;
    await device.save();

    // Record analytics
    await Analytics.recordEvent({
      type: 'iot_device_assigned',
      category: 'system',
      entityId: device._id,
      entityType: 'iot_device',
      userId: req.user._id,
      data: {
        deviceId: device.deviceId,
        shipmentId: req.body.shipmentId,
        organizationId: req.user.organizationId
      },
      metadata: { source: 'api' }
    });

    res.json({
      success: true,
      data: device,
      message: 'Device assigned to shipment successfully'
    });

  } catch (error) {
    console.error('Assign IoT device error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning device to shipment'
    });
  }
});

// @route   PUT /api/iot/devices/:deviceId/unassign
// @desc    Unassign device from shipment
// @access  Private (Admin/Operator)
router.put('/devices/:deviceId/unassign', authenticate, requirePermission('manage_iot'), invalidateCache(['iot:*', 'shipments:*']), async (req, res) => {
  try {
    const device = await IoTDevice.findOne({
      deviceId: req.params.deviceId,
      organizationId: req.user.organizationId
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const previousShipmentId = device.shipmentId;
    device.shipmentId = null;
    await device.save();

    // Record analytics
    await Analytics.recordEvent({
      type: 'iot_device_unassigned',
      category: 'system',
      entityId: device._id,
      entityType: 'iot_device',
      userId: req.user._id,
      data: {
        deviceId: device.deviceId,
        previousShipmentId,
        organizationId: req.user.organizationId
      },
      metadata: { source: 'api' }
    });

    res.json({
      success: true,
      data: device,
      message: 'Device unassigned from shipment successfully'
    });

  } catch (error) {
    console.error('Unassign IoT device error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unassigning device from shipment'
    });
  }
});

// @route   GET /api/iot/devices/:deviceId/alerts
// @desc    Get device alerts
// @access  Private
router.get('/devices/:deviceId/alerts', authenticate, cacheResponse({ ttl: 60 }), async (req, res) => {
  try {
    const { acknowledged, severity, page = 1, limit = 20 } = req.query;

    const device = await IoTDevice.findOne({
      deviceId: req.params.deviceId,
      organizationId: req.user.organizationId
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    let alerts = device.alerts;

    // Apply filters
    if (acknowledged !== undefined) {
      alerts = alerts.filter(alert => alert.acknowledged === (acknowledged === 'true'));
    }
    
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }

    // Sort by timestamp (newest first)
    alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Pagination
    const skip = (page - 1) * limit;
    const paginatedAlerts = alerts.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: paginatedAlerts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: alerts.length,
        pages: Math.ceil(alerts.length / limit)
      }
    });

  } catch (error) {
    console.error('Get device alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching device alerts'
    });
  }
});

// @route   PUT /api/iot/devices/:deviceId/alerts/:alertId/acknowledge
// @desc    Acknowledge device alert
// @access  Private
router.put('/devices/:deviceId/alerts/:alertId/acknowledge', authenticate, async (req, res) => {
  try {
    const device = await IoTDevice.findOne({
      deviceId: req.params.deviceId,
      organizationId: req.user.organizationId
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const result = await device.acknowledgeAlert(req.params.alertId, req.user._id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Alert acknowledged successfully'
    });

  } catch (error) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error acknowledging alert'
    });
  }
});

// @route   GET /api/iot/health
// @desc    Get IoT devices health overview
// @access  Private
router.get('/health', authenticate, cacheResponse({ ttl: 300 }), async (req, res) => {
  try {
    const healthStats = await IoTDevice.getDeviceHealth(req.user.organizationId);

    res.json({
      success: true,
      data: healthStats
    });

  } catch (error) {
    console.error('Get IoT health error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching IoT health data'
    });
  }
});

// @route   PUT /api/iot/devices/:deviceId/config
// @desc    Update device configuration
// @access  Private (Admin/Operator)
router.put('/devices/:deviceId/config', authenticate, requirePermission('manage_iot'), invalidateCache(['iot:*']), async (req, res) => {
  try {
    const device = await IoTDevice.findOne({
      deviceId: req.params.deviceId,
      organizationId: req.user.organizationId
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Update configuration
    Object.assign(device.configuration, req.body);
    await device.save();

    res.json({
      success: true,
      data: device,
      message: 'Device configuration updated successfully'
    });

  } catch (error) {
    console.error('Update device config error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating device configuration'
    });
  }
});

module.exports = router;
