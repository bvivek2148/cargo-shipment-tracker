const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test data
const testShipment = {
  containerId: 'TEST-001',
  currentLocation: {
    location: 'New York Port',
    coordinates: {
      lat: 40.7128,
      lng: -74.0060
    }
  },
  status: 'pending',
  eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
};

async function testAPI() {
  try {
    console.log('Testing Cargo Shipment Tracker API...\n');

    // Test 1: Create a shipment
    console.log('1. Creating test shipment...');
    const createResponse = await axios.post(`${API_URL}/shipment`, testShipment);
    console.log('✓ Shipment created:', createResponse.data.containerId);
    const shipmentId = createResponse.data._id;

    // Test 2: Get all shipments
    console.log('\n2. Fetching all shipments...');
    const getAllResponse = await axios.get(`${API_URL}/shipments`);
    console.log('✓ Found', getAllResponse.data.length, 'shipments');

    // Test 3: Get specific shipment
    console.log('\n3. Fetching specific shipment...');
    const getOneResponse = await axios.get(`${API_URL}/shipment/${shipmentId}`);
    console.log('✓ Retrieved shipment:', getOneResponse.data.containerId);

    // Test 4: Update location
    console.log('\n4. Updating shipment location...');
    const updateResponse = await axios.post(`${API_URL}/shipment/${shipmentId}/update-location`, {
      location: 'Boston Port',
      coordinates: { lat: 42.3601, lng: -71.0589 }
    });
    console.log('✓ Location updated to:', updateResponse.data.currentLocation.location);

    // Test 5: Update status
    console.log('\n5. Updating shipment status...');
    const statusResponse = await axios.patch(`${API_URL}/shipment/${shipmentId}/status`, {
      status: 'in-transit'
    });
    console.log('✓ Status updated to:', statusResponse.data.status);

    // Test 6: Get ETA
    console.log('\n6. Getting shipment ETA...');
    const etaResponse = await axios.get(`${API_URL}/shipment/${shipmentId}/eta`);
    console.log('✓ ETA:', new Date(etaResponse.data.eta).toLocaleDateString());

    console.log('\n✅ All tests passed! API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

// Run tests if server is available
testAPI();
