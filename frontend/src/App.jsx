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
    {
      id: '1',
      trackingNumber: 'CST001',
      status: 'In Transit',
      origin: 'New York, USA',
      destination: 'London, UK',
      cargo: 'Electronics',
      estimatedDelivery: '2024-01-15'
    },
    {
      id: '2',
      trackingNumber: 'CST002',
      status: 'Pending',
      origin: 'Shanghai, China',
      destination: 'Los Angeles, USA',
      cargo: 'Textiles',
      estimatedDelivery: '2024-01-20'
    },
    {
      id: '3',
      trackingNumber: 'CST003',
      status: 'Delivered',
      origin: 'Tokyo, Japan',
      destination: 'Sydney, Australia',
      cargo: 'Machinery',
      estimatedDelivery: '2024-01-10'
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
