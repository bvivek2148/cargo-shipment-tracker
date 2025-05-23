const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  containerId: {
    type: String,
    required: true,
    unique: true
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Shipment', shipmentSchema);