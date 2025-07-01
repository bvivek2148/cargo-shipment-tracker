const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const sampleShipments = [
  {
    containerId: 'CONT-001',
    currentLocation: {
      location: 'Port of Los Angeles',
      coordinates: { lat: 33.7361, lng: -118.2639 }
    },
    route: [
      {
        location: 'Port of Los Angeles',
        coordinates: { lat: 33.7361, lng: -118.2639 },
        arrivalTime: new Date('2024-01-15T08:00:00Z'),
        departureTime: new Date('2024-01-15T12:00:00Z')
      },
      {
        location: 'Port of Long Beach',
        coordinates: { lat: 33.7701, lng: -118.1937 },
        arrivalTime: new Date('2024-01-16T10:00:00Z'),
        departureTime: new Date('2024-01-16T14:00:00Z')
      }
    ],
    status: 'in-transit',
    eta: new Date('2024-01-20T15:00:00Z')
  },
  {
    containerId: 'CONT-002',
    currentLocation: {
      location: 'Port of New York',
      coordinates: { lat: 40.6892, lng: -74.0445 }
    },
    route: [
      {
        location: 'Port of Miami',
        coordinates: { lat: 25.7617, lng: -80.1918 },
        arrivalTime: new Date('2024-01-10T09:00:00Z'),
        departureTime: new Date('2024-01-10T13:00:00Z')
      }
    ],
    status: 'delivered',
    eta: new Date('2024-01-18T10:00:00Z')
  },
  {
    containerId: 'CONT-003',
    currentLocation: {
      location: 'Port of Seattle',
      coordinates: { lat: 47.6062, lng: -122.3321 }
    },
    route: [],
    status: 'delayed',
    eta: new Date('2024-01-25T16:00:00Z')
  },
  {
    containerId: 'CONT-004',
    currentLocation: {
      location: 'Port of Houston',
      coordinates: { lat: 29.7604, lng: -95.3698 }
    },
    route: [
      {
        location: 'Port of New Orleans',
        coordinates: { lat: 29.9511, lng: -90.0715 },
        arrivalTime: new Date('2024-01-12T11:00:00Z'),
        departureTime: new Date('2024-01-12T15:00:00Z')
      }
    ],
    status: 'pending',
    eta: new Date('2024-01-22T12:00:00Z')
  },
  {
    containerId: 'CONT-005',
    currentLocation: {
      location: 'Port of Oakland',
      coordinates: { lat: 37.8044, lng: -122.2711 }
    },
    route: [
      {
        location: 'Port of San Francisco',
        coordinates: { lat: 37.7749, lng: -122.4194 },
        arrivalTime: new Date('2024-01-14T07:00:00Z'),
        departureTime: new Date('2024-01-14T11:00:00Z')
      }
    ],
    status: 'in-transit',
    eta: new Date('2024-01-21T14:00:00Z')
  }
];

async function seedData() {
  try {
    console.log('🌱 Seeding sample shipment data...\n');

    // Check if server is running
    try {
      await axios.get('http://localhost:5000/health');
      console.log('✓ Server is running');
    } catch (error) {
      console.error('❌ Server is not running. Please start the server first.');
      return;
    }

    // Create sample shipments
    for (const shipment of sampleShipments) {
      try {
        const response = await axios.post(`${API_URL}/shipment`, shipment);
        console.log(`✓ Created shipment: ${response.data.containerId}`);
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.message?.includes('duplicate')) {
          console.log(`⚠ Shipment ${shipment.containerId} already exists, skipping...`);
        } else {
          console.error(`❌ Failed to create shipment ${shipment.containerId}:`, error.response?.data?.message || error.message);
        }
      }
    }

    console.log('\n🎉 Sample data seeding completed!');
    console.log('\nYou can now:');
    console.log('1. Start the frontend: cd cargo-shipment-tracker && npm start');
    console.log('2. View the dashboard at: http://localhost:3000');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  }
}

seedData();
