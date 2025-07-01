const mongoose = require('mongoose');

const iotDeviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: [
      'gps_tracker',
      'temperature_sensor',
      'humidity_sensor',
      'pressure_sensor',
      'accelerometer',
      'door_sensor',
      'fuel_sensor',
      'weight_sensor',
      'camera',
      'beacon',
      'multi_sensor'
    ],
    required: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  firmwareVersion: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'error', 'offline'],
    default: 'inactive'
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  shipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment',
    default: null
  },
  configuration: {
    reportingInterval: {
      type: Number,
      default: 300 // seconds
    },
    batteryThreshold: {
      type: Number,
      default: 20 // percentage
    },
    temperatureRange: {
      min: { type: Number, default: -20 },
      max: { type: Number, default: 50 }
    },
    humidityRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 100 }
    },
    geofencing: {
      enabled: { type: Boolean, default: false },
      zones: [{
        name: String,
        coordinates: [{
          lat: Number,
          lng: Number
        }],
        type: {
          type: String,
          enum: ['allowed', 'restricted'],
          default: 'allowed'
        }
      }]
    },
    alerts: {
      temperature: { type: Boolean, default: true },
      humidity: { type: Boolean, default: false },
      movement: { type: Boolean, default: true },
      battery: { type: Boolean, default: true },
      offline: { type: Boolean, default: true },
      geofence: { type: Boolean, default: false }
    }
  },
  connectivity: {
    type: {
      type: String,
      enum: ['cellular', 'wifi', 'bluetooth', 'lora', 'satellite'],
      default: 'cellular'
    },
    provider: String,
    signalStrength: Number, // -120 to 0 dBm
    lastSeen: Date,
    ipAddress: String,
    macAddress: String
  },
  hardware: {
    batteryLevel: {
      type: Number,
      min: 0,
      max: 100
    },
    batteryVoltage: Number,
    internalTemperature: Number,
    memoryUsage: Number,
    cpuUsage: Number,
    storageUsed: Number,
    storageTotal: Number
  },
  location: {
    coordinates: {
      lat: Number,
      lng: Number
    },
    accuracy: Number, // meters
    altitude: Number,
    speed: Number, // km/h
    heading: Number, // degrees
    timestamp: Date
  },
  sensors: [{
    type: {
      type: String,
      enum: [
        'temperature',
        'humidity',
        'pressure',
        'acceleration',
        'gyroscope',
        'magnetometer',
        'light',
        'sound',
        'vibration',
        'door',
        'weight',
        'fuel'
      ]
    },
    unit: String,
    value: Number,
    timestamp: Date,
    calibration: {
      offset: { type: Number, default: 0 },
      scale: { type: Number, default: 1 }
    }
  }],
  alerts: [{
    type: {
      type: String,
      enum: [
        'temperature_high',
        'temperature_low',
        'humidity_high',
        'humidity_low',
        'battery_low',
        'device_offline',
        'movement_detected',
        'door_opened',
        'geofence_violation',
        'sensor_error',
        'connectivity_lost'
      ]
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    message: String,
    value: Number,
    threshold: Number,
    acknowledged: { type: Boolean, default: false },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedAt: Date,
    resolvedAt: Date,
    timestamp: { type: Date, default: Date.now }
  }],
  maintenance: {
    lastMaintenance: Date,
    nextMaintenance: Date,
    maintenanceInterval: { type: Number, default: 90 }, // days
    maintenanceHistory: [{
      date: Date,
      type: {
        type: String,
        enum: ['routine', 'repair', 'calibration', 'firmware_update']
      },
      description: String,
      performedBy: String,
      cost: Number,
      notes: String
    }]
  },
  statistics: {
    totalDataPoints: { type: Number, default: 0 },
    lastDataReceived: Date,
    averageReportingInterval: Number,
    uptime: { type: Number, default: 0 }, // percentage
    dataQuality: { type: Number, default: 100 }, // percentage
    alertsGenerated: { type: Number, default: 0 },
    batteryReplacements: { type: Number, default: 0 }
  },
  metadata: {
    installationDate: Date,
    installationLocation: String,
    installedBy: String,
    warrantyExpiry: Date,
    purchaseDate: Date,
    purchaseCost: Number,
    vendor: String,
    notes: String,
    tags: [String]
  }
}, {
  timestamps: true,
  collection: 'iot_devices'
});

// Indexes
iotDeviceSchema.index({ deviceId: 1 }, { unique: true });
iotDeviceSchema.index({ organizationId: 1 });
iotDeviceSchema.index({ shipmentId: 1 });
iotDeviceSchema.index({ status: 1 });
iotDeviceSchema.index({ type: 1 });
iotDeviceSchema.index({ 'connectivity.lastSeen': -1 });
iotDeviceSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for device health
iotDeviceSchema.virtual('health').get(function() {
  let score = 100;
  
  // Battery level impact
  if (this.hardware.batteryLevel < 20) score -= 30;
  else if (this.hardware.batteryLevel < 50) score -= 10;
  
  // Connectivity impact
  const lastSeen = this.connectivity.lastSeen;
  if (lastSeen) {
    const minutesOffline = (Date.now() - lastSeen.getTime()) / (1000 * 60);
    if (minutesOffline > 60) score -= 40;
    else if (minutesOffline > 30) score -= 20;
    else if (minutesOffline > 10) score -= 10;
  }
  
  // Alert impact
  const criticalAlerts = this.alerts.filter(a => 
    a.severity === 'critical' && !a.acknowledged
  ).length;
  score -= criticalAlerts * 15;
  
  return Math.max(0, score);
});

// Virtual for online status
iotDeviceSchema.virtual('isOnline').get(function() {
  if (!this.connectivity.lastSeen) return false;
  const minutesOffline = (Date.now() - this.connectivity.lastSeen.getTime()) / (1000 * 60);
  return minutesOffline <= (this.configuration.reportingInterval / 60) * 2;
});

// Methods
iotDeviceSchema.methods.addSensorReading = async function(sensorType, value, unit, timestamp = new Date()) {
  // Find existing sensor or create new one
  let sensor = this.sensors.find(s => s.type === sensorType);
  
  if (!sensor) {
    sensor = {
      type: sensorType,
      unit: unit,
      value: value,
      timestamp: timestamp,
      calibration: { offset: 0, scale: 1 }
    };
    this.sensors.push(sensor);
  } else {
    sensor.value = value;
    sensor.timestamp = timestamp;
    if (unit) sensor.unit = unit;
  }
  
  // Apply calibration
  const calibratedValue = (value + sensor.calibration.offset) * sensor.calibration.scale;
  
  // Check for alerts
  await this.checkSensorAlerts(sensorType, calibratedValue);
  
  // Update statistics
  this.statistics.totalDataPoints += 1;
  this.statistics.lastDataReceived = timestamp;
  this.connectivity.lastSeen = timestamp;
  
  return await this.save();
};

iotDeviceSchema.methods.updateLocation = async function(lat, lng, accuracy, altitude, speed, heading, timestamp = new Date()) {
  this.location = {
    coordinates: { lat, lng },
    accuracy,
    altitude,
    speed,
    heading,
    timestamp
  };
  
  this.connectivity.lastSeen = timestamp;
  
  // Check geofencing
  if (this.configuration.geofencing.enabled) {
    await this.checkGeofencing(lat, lng);
  }
  
  return await this.save();
};

iotDeviceSchema.methods.checkSensorAlerts = async function(sensorType, value) {
  const config = this.configuration;
  let alertType = null;
  let threshold = null;
  
  switch (sensorType) {
    case 'temperature':
      if (value > config.temperatureRange.max) {
        alertType = 'temperature_high';
        threshold = config.temperatureRange.max;
      } else if (value < config.temperatureRange.min) {
        alertType = 'temperature_low';
        threshold = config.temperatureRange.min;
      }
      break;
    case 'humidity':
      if (value > config.humidityRange.max) {
        alertType = 'humidity_high';
        threshold = config.humidityRange.max;
      } else if (value < config.humidityRange.min) {
        alertType = 'humidity_low';
        threshold = config.humidityRange.min;
      }
      break;
  }
  
  if (alertType && config.alerts[sensorType.split('_')[0]]) {
    await this.createAlert(alertType, `${sensorType} value ${value} exceeded threshold ${threshold}`, value, threshold);
  }
};

iotDeviceSchema.methods.checkGeofencing = async function(lat, lng) {
  // Implementation for geofencing checks
  // This would check if the device is within allowed zones or outside restricted zones
};

iotDeviceSchema.methods.createAlert = async function(type, message, value, threshold, severity = 'medium') {
  // Check if similar alert already exists and is not acknowledged
  const existingAlert = this.alerts.find(a => 
    a.type === type && 
    !a.acknowledged && 
    (Date.now() - a.timestamp.getTime()) < 3600000 // 1 hour
  );
  
  if (existingAlert) return; // Don't create duplicate alerts
  
  const alert = {
    type,
    severity,
    message,
    value,
    threshold,
    timestamp: new Date()
  };
  
  this.alerts.push(alert);
  this.statistics.alertsGenerated += 1;
  
  // Emit real-time alert
  const socketService = require('../services/socketService');
  socketService.emitToRole('admin', 'iot_alert', {
    deviceId: this.deviceId,
    alert,
    timestamp: new Date().toISOString()
  });
  
  return await this.save();
};

iotDeviceSchema.methods.acknowledgeAlert = async function(alertId, userId) {
  const alert = this.alerts.id(alertId);
  if (alert) {
    alert.acknowledged = true;
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date();
    return await this.save();
  }
  return null;
};

iotDeviceSchema.methods.updateBattery = async function(level, voltage) {
  this.hardware.batteryLevel = level;
  if (voltage) this.hardware.batteryVoltage = voltage;
  
  // Check battery alert
  if (level <= this.configuration.batteryThreshold && this.configuration.alerts.battery) {
    await this.createAlert('battery_low', `Battery level is ${level}%`, level, this.configuration.batteryThreshold, 'high');
  }
  
  return await this.save();
};

// Static methods
iotDeviceSchema.statics.findByDeviceId = function(deviceId) {
  return this.findOne({ deviceId });
};

iotDeviceSchema.statics.findByOrganization = function(organizationId) {
  return this.find({ organizationId });
};

iotDeviceSchema.statics.findByShipment = function(shipmentId) {
  return this.find({ shipmentId });
};

iotDeviceSchema.statics.getDeviceHealth = async function(organizationId) {
  const devices = await this.find({ organizationId });
  
  const healthStats = {
    total: devices.length,
    online: 0,
    offline: 0,
    lowBattery: 0,
    alerts: 0,
    averageHealth: 0
  };
  
  let totalHealth = 0;
  
  devices.forEach(device => {
    if (device.isOnline) healthStats.online++;
    else healthStats.offline++;
    
    if (device.hardware.batteryLevel <= 20) healthStats.lowBattery++;
    
    healthStats.alerts += device.alerts.filter(a => !a.acknowledged).length;
    totalHealth += device.health;
  });
  
  healthStats.averageHealth = devices.length > 0 ? totalHealth / devices.length : 0;
  
  return healthStats;
};

module.exports = mongoose.model('IoTDevice', iotDeviceSchema);
