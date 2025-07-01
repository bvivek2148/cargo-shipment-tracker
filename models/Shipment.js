const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  containerId: {
    type: String,
    required: true,
    unique: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  route: [{
    location: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    arrivalTime: Date,
    departureTime: Date
  }],
  currentLocation: {
    location: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    enum: ['pending', 'in-transit', 'delivered', 'delayed'],
    default: 'pending'
  },
  eta: {
    type: Date,
    required: true
  },
  iotDevices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IoTDevice'
  }],
  cargo: {
    type: String,
    description: String,
    weight: Number, // kg
    volume: Number, // cubic meters
    value: Number, // monetary value
    hazardous: { type: Boolean, default: false },
    temperature: {
      min: Number,
      max: Number,
      current: Number
    }
  },
  customer: {
    name: String,
    email: String,
    phone: String,
    address: String
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  notes: String,
  estimatedCost: Number,
  actualCost: Number,
  aiOptimized: { type: Boolean, default: false },
  optimizationData: {
    algorithm: String,
    fuelSavings: Number,
    timeSavings: Number,
    routeEfficiency: Number
  }
}, {
  timestamps: true
});

// Indexes
shipmentSchema.index({ organizationId: 1 });
shipmentSchema.index({ userId: 1 });
shipmentSchema.index({ status: 1 });
shipmentSchema.index({ containerId: 1 });
shipmentSchema.index({ createdAt: -1 });
shipmentSchema.index({ organizationId: 1, status: 1 });
shipmentSchema.index({ 'currentLocation.coordinates': '2dsphere' });

module.exports = mongoose.model('Shipment', shipmentSchema);