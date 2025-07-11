import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { Package, Ship, Home, Plus, BarChart3 } from 'lucide-react'
import './App.css'

// Notification Components
import ToastContainer from './components/notifications/ToastContainer'

// Enhanced Components
import EnhancedShipmentDetails from './components/EnhancedShipmentDetails'
import DashboardWithMap from './components/DashboardWithMap'
import Phase4ShipmentDetails from './components/Phase4ShipmentDetails'

// PWA Components
import PWAManager from './components/pwa/PWAManager'
import OfflineSync from './components/offline/OfflineSync'
import Phase5Demo from './components/Phase5Demo'
import Phase6Demo from './components/Phase6Demo'

// Simple Navigation Component
function SimpleNavigation() {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Ship size={24} />
        <h1>Cargo Tracker</h1>
      </div>
      
      <div className="nav-links">
        <Link to="/" className="nav-link">
          <Home size={18} />
          Dashboard
        </Link>
        <Link to="/shipments" className="nav-link">
          <Package size={18} />
          Shipments
        </Link>
        <Link to="/shipments/new" className="nav-link">
          <Plus size={18} />
          New Shipment
        </Link>
      </div>
    </nav>
  )
}

// Simple Dashboard Component
function SimpleDashboard() {
  const [stats, setStats] = useState({
    total: 156,
    pending: 23,
    inTransit: 42,
    delivered: 89,
    delayed: 2
  })

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Dashboard Overview</h2>
        <p>Welcome to Cargo Shipment Tracker</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Shipments</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon in-transit">
            <Ship size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.inTransit}</div>
            <div className="stat-label">In Transit</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon delivered">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.delivered}</div>
            <div className="stat-label">Delivered</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon delayed">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.delayed}</div>
            <div className="stat-label">Delayed</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="card">
          <h3>🚢 Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">📦</span>
              <span className="activity-text">Shipment CST001 created</span>
              <span className="activity-time">2 hours ago</span>
            </div>
            <div className="activity-item">
              <span className="activity-icon">✅</span>
              <span className="activity-text">Shipment CST089 delivered</span>
              <span className="activity-time">4 hours ago</span>
            </div>
            <div className="activity-item">
              <span className="activity-icon">🚛</span>
              <span className="activity-text">Shipment CST045 in transit</span>
              <span className="activity-time">6 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple Shipment List Component
function SimpleShipmentList() {
  const [shipments] = useState([
    // From India - Major export routes
    {
      id: '1',
      trackingNumber: 'CST001',
      status: 'In Transit',
      origin: 'Mumbai, India',
      destination: 'London, UK',
      cargo: 'Textiles & Garments',
      estimatedDelivery: '2024-01-15'
    },
    {
      id: '2',
      trackingNumber: 'CST002',
      status: 'Delivered',
      origin: 'Chennai, India',
      destination: 'New York, USA',
      cargo: 'Pharmaceuticals',
      estimatedDelivery: '2024-01-10'
    },
    {
      id: '3',
      trackingNumber: 'CST003',
      status: 'In Transit',
      origin: 'Kolkata, India',
      destination: 'Hamburg, Germany',
      cargo: 'Tea & Spices',
      estimatedDelivery: '2024-01-18'
    },
    {
      id: '4',
      trackingNumber: 'CST004',
      status: 'Pending',
      origin: 'Bangalore, India',
      destination: 'Singapore',
      cargo: 'IT Equipment',
      estimatedDelivery: '2024-01-20'
    },
    {
      id: '5',
      trackingNumber: 'CST005',
      status: 'In Transit',
      origin: 'Delhi, India',
      destination: 'Dubai, UAE',
      cargo: 'Handicrafts',
      estimatedDelivery: '2024-01-16'
    },
    {
      id: '6',
      trackingNumber: 'CST006',
      status: 'Delivered',
      origin: 'Pune, India',
      destination: 'Sydney, Australia',
      cargo: 'Automotive Parts',
      estimatedDelivery: '2024-01-12'
    },
    {
      id: '7',
      trackingNumber: 'CST007',
      status: 'In Transit',
      origin: 'Hyderabad, India',
      destination: 'Tokyo, Japan',
      cargo: 'Software Services',
      estimatedDelivery: '2024-01-22'
    },
    {
      id: '8',
      trackingNumber: 'CST008',
      status: 'Delayed',
      origin: 'Kochi, India',
      destination: 'Rotterdam, Netherlands',
      cargo: 'Marine Products',
      estimatedDelivery: '2024-01-14'
    },
    {
      id: '9',
      trackingNumber: 'CST009',
      status: 'In Transit',
      origin: 'Visakhapatnam, India',
      destination: 'Busan, South Korea',
      cargo: 'Steel Products',
      estimatedDelivery: '2024-01-19'
    },
    {
      id: '10',
      trackingNumber: 'CST010',
      status: 'Delivered',
      origin: 'Ahmedabad, India',
      destination: 'Los Angeles, USA',
      cargo: 'Chemicals',
      estimatedDelivery: '2024-01-08'
    },
    // From China
    {
      id: '11',
      trackingNumber: 'CST011',
      status: 'In Transit',
      origin: 'Shanghai, China',
      destination: 'Mumbai, India',
      cargo: 'Electronics',
      estimatedDelivery: '2024-01-17'
    },
    {
      id: '12',
      trackingNumber: 'CST012',
      status: 'Delivered',
      origin: 'Shenzhen, China',
      destination: 'Frankfurt, Germany',
      cargo: 'Consumer Electronics',
      estimatedDelivery: '2024-01-11'
    },
    {
      id: '13',
      trackingNumber: 'CST013',
      status: 'In Transit',
      origin: 'Guangzhou, China',
      destination: 'Chennai, India',
      cargo: 'Machinery',
      estimatedDelivery: '2024-01-21'
    },
    {
      id: '14',
      trackingNumber: 'CST014',
      status: 'Pending',
      origin: 'Beijing, China',
      destination: 'London, UK',
      cargo: 'Industrial Equipment',
      estimatedDelivery: '2024-01-25'
    },
    {
      id: '15',
      trackingNumber: 'CST015',
      status: 'In Transit',
      origin: 'Tianjin, China',
      destination: 'Kolkata, India',
      cargo: 'Raw Materials',
      estimatedDelivery: '2024-01-18'
    },
    // From USA
    {
      id: '16',
      trackingNumber: 'CST016',
      status: 'In Transit',
      origin: 'New York, USA',
      destination: 'Chennai, India',
      cargo: 'Medical Equipment',
      estimatedDelivery: '2024-01-23'
    },
    {
      id: '17',
      trackingNumber: 'CST017',
      status: 'Delivered',
      origin: 'Los Angeles, USA',
      destination: 'Tokyo, Japan',
      cargo: 'Agricultural Products',
      estimatedDelivery: '2024-01-13'
    },
    {
      id: '18',
      trackingNumber: 'CST018',
      status: 'In Transit',
      origin: 'Miami, USA',
      destination: 'São Paulo, Brazil',
      cargo: 'Technology Hardware',
      estimatedDelivery: '2024-01-20'
    },
    {
      id: '19',
      trackingNumber: 'CST019',
      status: 'Pending',
      origin: 'Seattle, USA',
      destination: 'Mumbai, India',
      cargo: 'Aircraft Parts',
      estimatedDelivery: '2024-01-26'
    },
    {
      id: '20',
      trackingNumber: 'CST020',
      status: 'In Transit',
      origin: 'Houston, USA',
      destination: 'Dubai, UAE',
      cargo: 'Oil Equipment',
      estimatedDelivery: '2024-01-17'
    },
    // From Europe
    {
      id: '21',
      trackingNumber: 'CST021',
      status: 'In Transit',
      origin: 'Hamburg, Germany',
      destination: 'Kolkata, India',
      cargo: 'Chemical Products',
      estimatedDelivery: '2024-01-20'
    },
    {
      id: '22',
      trackingNumber: 'CST022',
      status: 'Delivered',
      origin: 'Rotterdam, Netherlands',
      destination: 'Singapore',
      cargo: 'Food Products',
      estimatedDelivery: '2024-01-09'
    },
    {
      id: '23',
      trackingNumber: 'CST023',
      status: 'Pending',
      origin: 'Antwerp, Belgium',
      destination: 'Mumbai, India',
      cargo: 'Luxury Goods',
      estimatedDelivery: '2024-01-24'
    },
    {
      id: '24',
      trackingNumber: 'CST024',
      status: 'In Transit',
      origin: 'Le Havre, France',
      destination: 'Chennai, India',
      cargo: 'Wine & Spirits',
      estimatedDelivery: '2024-01-22'
    },
    {
      id: '25',
      trackingNumber: 'CST025',
      status: 'Delivered',
      origin: 'Felixstowe, UK',
      destination: 'New York, USA',
      cargo: 'Manufactured Goods',
      estimatedDelivery: '2024-01-07'
    },
    // From Middle East
    {
      id: '26',
      trackingNumber: 'CST026',
      status: 'In Transit',
      origin: 'Dubai, UAE',
      destination: 'Mumbai, India',
      cargo: 'Petroleum Products',
      estimatedDelivery: '2024-01-16'
    },
    {
      id: '27',
      trackingNumber: 'CST027',
      status: 'Delivered',
      origin: 'Jeddah, Saudi Arabia',
      destination: 'Karachi, Pakistan',
      cargo: 'Construction Materials',
      estimatedDelivery: '2024-01-08'
    },
    {
      id: '28',
      trackingNumber: 'CST028',
      status: 'In Transit',
      origin: 'Kuwait City, Kuwait',
      destination: 'Chennai, India',
      cargo: 'Oil & Gas Equipment',
      estimatedDelivery: '2024-01-19'
    },
    // From Southeast Asia
    {
      id: '29',
      trackingNumber: 'CST029',
      status: 'In Transit',
      origin: 'Singapore',
      destination: 'Kolkata, India',
      cargo: 'Palm Oil',
      estimatedDelivery: '2024-01-17'
    },
    {
      id: '30',
      trackingNumber: 'CST030',
      status: 'Pending',
      origin: 'Bangkok, Thailand',
      destination: 'Sydney, Australia',
      cargo: 'Rubber Products',
      estimatedDelivery: '2024-01-23'
    },
    // From Africa
    {
      id: '31',
      trackingNumber: 'CST031',
      status: 'Delivered',
      origin: 'Cape Town, South Africa',
      destination: 'Chennai, India',
      cargo: 'Minerals',
      estimatedDelivery: '2024-01-07'
    },
    {
      id: '32',
      trackingNumber: 'CST032',
      status: 'In Transit',
      origin: 'Lagos, Nigeria',
      destination: 'London, UK',
      cargo: 'Agricultural Products',
      estimatedDelivery: '2024-01-20'
    },
    // From South America
    {
      id: '33',
      trackingNumber: 'CST033',
      status: 'Pending',
      origin: 'São Paulo, Brazil',
      destination: 'Rotterdam, Netherlands',
      cargo: 'Coffee Beans',
      estimatedDelivery: '2024-01-26'
    },
    {
      id: '34',
      trackingNumber: 'CST034',
      status: 'In Transit',
      origin: 'Buenos Aires, Argentina',
      destination: 'Shanghai, China',
      cargo: 'Beef Products',
      estimatedDelivery: '2024-01-21'
    },
    // From Australia
    {
      id: '35',
      trackingNumber: 'CST035',
      status: 'Delivered',
      origin: 'Sydney, Australia',
      destination: 'Mumbai, India',
      cargo: 'Iron Ore',
      estimatedDelivery: '2024-01-06'
    },
    // Additional Indian routes
    {
      id: '36',
      trackingNumber: 'CST036',
      status: 'Delayed',
      origin: 'Kandla, India',
      destination: 'Hamburg, Germany',
      cargo: 'Chemicals',
      estimatedDelivery: '2024-01-15'
    },
    {
      id: '37',
      trackingNumber: 'CST037',
      status: 'In Transit',
      origin: 'Tuticorin, India',
      destination: 'Colombo, Sri Lanka',
      cargo: 'Rice',
      estimatedDelivery: '2024-01-16'
    },
    {
      id: '38',
      trackingNumber: 'CST038',
      status: 'Pending',
      origin: 'Ho Chi Minh City, Vietnam',
      destination: 'Los Angeles, USA',
      cargo: 'Garments',
      estimatedDelivery: '2024-01-21'
    },
    {
      id: '39',
      trackingNumber: 'CST039',
      status: 'In Transit',
      origin: 'Jakarta, Indonesia',
      destination: 'Mumbai, India',
      cargo: 'Coffee & Spices',
      estimatedDelivery: '2024-01-18'
    },
    {
      id: '40',
      trackingNumber: 'CST040',
      status: 'Delivered',
      origin: 'Manila, Philippines',
      destination: 'Tokyo, Japan',
      cargo: 'Electronics Components',
      estimatedDelivery: '2024-01-06'
    },
    {
      id: '41',
      trackingNumber: 'CST041',
      status: 'In Transit',
      origin: 'Alexandria, Egypt',
      destination: 'Mumbai, India',
      cargo: 'Cotton',
      estimatedDelivery: '2024-01-25'
    },
    {
      id: '42',
      trackingNumber: 'CST042',
      status: 'Pending',
      origin: 'Casablanca, Morocco',
      destination: 'Hamburg, Germany',
      cargo: 'Phosphates',
      estimatedDelivery: '2024-01-22'
    },
    {
      id: '43',
      trackingNumber: 'CST043',
      status: 'Delivered',
      origin: 'Valparaíso, Chile',
      destination: 'Tokyo, Japan',
      cargo: 'Copper',
      estimatedDelivery: '2024-01-05'
    },
    {
      id: '44',
      trackingNumber: 'CST044',
      status: 'In Transit',
      origin: 'Melbourne, Australia',
      destination: 'Bangalore, India',
      cargo: 'Educational Materials',
      estimatedDelivery: '2024-01-20'
    },
    {
      id: '45',
      trackingNumber: 'CST045',
      status: 'Pending',
      origin: 'Perth, Australia',
      destination: 'Shanghai, China',
      cargo: 'Wheat',
      estimatedDelivery: '2024-01-24'
    }
  ])

  return (
    <div className="shipments">
      <div className="page-header">
        <h2>📦 Shipments</h2>
        <Link to="/shipments/new" className="btn btn-primary">
          <Plus size={18} />
          New Shipment
        </Link>
      </div>

      <div className="shipments-grid">
        {shipments.map(shipment => (
          <div key={shipment.id} className="shipment-card">
            <div className="shipment-header">
              <h3>{shipment.trackingNumber}</h3>
              <span className={`status-badge status-${shipment.status.toLowerCase().replace(' ', '-')}`}>
                {shipment.status}
              </span>
            </div>
            <div className="shipment-details">
              <p><strong>From:</strong> {shipment.origin}</p>
              <p><strong>To:</strong> {shipment.destination}</p>
              <p><strong>Cargo:</strong> {shipment.cargo}</p>
              <p><strong>ETA:</strong> {shipment.estimatedDelivery}</p>
            </div>
            <div className="shipment-actions">
              <Link to={`/shipments/${shipment.id}`} className="btn btn-secondary">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Simple Shipment Form Component
function SimpleShipmentForm() {
  const [formData, setFormData] = useState({
    trackingNumber: '',
    origin: '',
    destination: '',
    cargo: '',
    weight: '',
    estimatedDelivery: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Creating shipment:', formData)
    alert('Shipment created successfully!')
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="shipment-form">
      <div className="page-header">
        <h2>➕ Create New Shipment</h2>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="trackingNumber">Tracking Number</label>
              <input
                type="text"
                id="trackingNumber"
                name="trackingNumber"
                value={formData.trackingNumber}
                onChange={handleChange}
                placeholder="CST001"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="origin">Origin</label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                placeholder="New York, USA"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="destination">Destination</label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="London, UK"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="cargo">Cargo Description</label>
              <input
                type="text"
                id="cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                placeholder="Electronics"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="weight">Weight</label>
              <input
                type="text"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="500 kg"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="estimatedDelivery">Estimated Delivery</label>
              <input
                type="date"
                id="estimatedDelivery"
                name="estimatedDelivery"
                value={formData.estimatedDelivery}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Create Shipment
            </button>
            <Link to="/shipments" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

// Simple Shipment Details Component
function SimpleShipmentDetails() {
  const shipment = {
    id: '1',
    trackingNumber: 'CST001',
    status: 'In Transit',
    origin: 'New York, USA',
    destination: 'London, UK',
    cargo: 'Electronics',
    weight: '500 kg',
    estimatedDelivery: '2024-01-15',
    currentLocation: 'Atlantic Ocean'
  }

  return (
    <div className="shipment-details">
      <div className="page-header">
        <h2>📦 Shipment Details</h2>
        <span className={`status-badge status-${shipment.status.toLowerCase().replace(' ', '-')}`}>
          {shipment.status}
        </span>
      </div>

      <div className="details-grid">
        <div className="card">
          <h3>Shipment Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Tracking Number</label>
              <span>{shipment.trackingNumber}</span>
            </div>
            <div className="info-item">
              <label>Origin</label>
              <span>{shipment.origin}</span>
            </div>
            <div className="info-item">
              <label>Destination</label>
              <span>{shipment.destination}</span>
            </div>
            <div className="info-item">
              <label>Cargo</label>
              <span>{shipment.cargo}</span>
            </div>
            <div className="info-item">
              <label>Weight</label>
              <span>{shipment.weight}</span>
            </div>
            <div className="info-item">
              <label>Current Location</label>
              <span>{shipment.currentLocation}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main App Component
function App() {
  return (
    <Router>
      <div className="app">
        <SimpleNavigation />
        <main className="main-content" id="main-content">
          <Routes>
            <Route path="/" element={<DashboardWithMap />} />
            <Route path="/shipments" element={<SimpleShipmentList />} />
            <Route path="/shipments/new" element={<SimpleShipmentForm />} />
            <Route path="/shipments/:id" element={<Phase4ShipmentDetails />} />
            <Route path="/phase5" element={<Phase5Demo />} />
            <Route path="/phase6" element={<Phase6Demo />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* PWA Components */}
        <PWAManager />
        <OfflineSync />

        <ToastContainer />
      </div>
    </Router>
  )
}

export default App
