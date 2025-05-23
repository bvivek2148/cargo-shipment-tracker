const router = require('express').Router();
const Shipment = require('../models/Shipment');

// Get all shipments
router.get('/shipments', async (req, res) => {
  try {
    const shipments = await Shipment.find();
    res.json(shipments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific shipment
router.get('/shipment/:id', async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new shipment
router.post('/shipment', async (req, res) => {
  const shipment = new Shipment(req.body);
  try {
    const newShipment = await shipment.save();
    res.status(201).json(newShipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update shipment location
router.post('/shipment/:id/update-location', async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });

    shipment.currentLocation = {
      location: req.body.location,
      coordinates: req.body.coordinates,
      timestamp: new Date()
    };

    const updatedShipment = await shipment.save();
    res.json(updatedShipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get shipment ETA
router.get('/shipment/:id/eta', async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
    res.json({ eta: shipment.eta });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;