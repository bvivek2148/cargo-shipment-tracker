import { useState, useEffect } from 'react'
import { Package, Ship, MapPin, TrendingUp, Clock, AlertTriangle } from 'lucide-react'
import ShipmentMap from './maps/ShipmentMap'

function DashboardWithMap() {
  const [stats, setStats] = useState({
    total: 156,
    pending: 23,
    inTransit: 42,
    delivered: 89,
    delayed: 2
  })

  const [shipments, setShipments] = useState([])
  const [selectedShipment, setSelectedShipment] = useState(null)

  // Sample shipments for the map
  useEffect(() => {
    const sampleShipments = [
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
      },
      {
        id: '4',
        trackingNumber: 'CST004',
        status: 'Delayed',
        origin: 'Hamburg, Germany',
        destination: 'Mumbai, India',
        cargo: 'Automotive Parts',
        estimatedDelivery: '2024-01-18'
      },
      {
        id: '5',
        trackingNumber: 'CST005',
        status: 'In Transit',
        origin: 'Singapore',
        destination: 'Dubai, UAE',
        cargo: 'Consumer Goods',
        estimatedDelivery: '2024-01-16'
      }
    ]
    setShipments(sampleShipments)
  }, [])

  const handleShipmentSelect = (shipment) => {
    setSelectedShipment(shipment)
  }

  return (
    <div className="dashboard-with-map">
      <div className="dashboard-header">
        <h2>🚢 Cargo Shipment Tracker Dashboard</h2>
        <p>Real-time tracking and monitoring of global shipments</p>
      </div>

      {/* Statistics Grid */}
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
            <Clock size={24} />
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
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.delayed}</div>
            <div className="stat-label">Delayed</div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        {/* Global Shipment Map */}
        <div className="dashboard-map">
          <ShipmentMap 
            shipments={shipments}
            selectedShipment={selectedShipment}
            onShipmentSelect={handleShipmentSelect}
          />
        </div>

        {/* Shipment Details Panel */}
        {selectedShipment && (
          <div className="selected-shipment-panel">
            <div className="panel-header">
              <h3>📦 Selected Shipment</h3>
              <button 
                className="close-panel"
                onClick={() => setSelectedShipment(null)}
              >
                ×
              </button>
            </div>
            
            <div className="panel-content">
              <div className="shipment-info">
                <h4>{selectedShipment.trackingNumber}</h4>
                <span className={`status-badge status-${selectedShipment.status.toLowerCase().replace(' ', '-')}`}>
                  {selectedShipment.status}
                </span>
              </div>
              
              <div className="shipment-route">
                <div className="route-item">
                  <MapPin size={16} />
                  <div>
                    <label>From</label>
                    <span>{selectedShipment.origin}</span>
                  </div>
                </div>
                
                <div className="route-arrow">→</div>
                
                <div className="route-item">
                  <MapPin size={16} />
                  <div>
                    <label>To</label>
                    <span>{selectedShipment.destination}</span>
                  </div>
                </div>
              </div>
              
              <div className="shipment-details">
                <div className="detail-row">
                  <label>Cargo:</label>
                  <span>{selectedShipment.cargo}</span>
                </div>
                <div className="detail-row">
                  <label>ETA:</label>
                  <span>{selectedShipment.estimatedDelivery}</span>
                </div>
              </div>
              
              <div className="panel-actions">
                <button className="btn btn-primary">
                  View Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="recent-activity-card">
          <h3>🔄 Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">📦</span>
              <div className="activity-content">
                <span className="activity-text">Shipment CST001 departed from New York</span>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">✅</span>
              <div className="activity-content">
                <span className="activity-text">Shipment CST089 delivered to Sydney</span>
                <span className="activity-time">4 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">🚛</span>
              <div className="activity-content">
                <span className="activity-text">Shipment CST045 arrived at Singapore Hub</span>
                <span className="activity-time">6 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">⚠️</span>
              <div className="activity-content">
                <span className="activity-text">Shipment CST023 delayed due to weather</span>
                <span className="activity-time">8 hours ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats-card">
          <h3>📊 Quick Stats</h3>
          <div className="quick-stats-grid">
            <div className="quick-stat">
              <div className="quick-stat-value">94.2%</div>
              <div className="quick-stat-label">On-time Delivery</div>
            </div>
            <div className="quick-stat">
              <div className="quick-stat-value">12.5</div>
              <div className="quick-stat-label">Avg Days Transit</div>
            </div>
            <div className="quick-stat">
              <div className="quick-stat-value">$2.4M</div>
              <div className="quick-stat-label">Cargo Value</div>
            </div>
            <div className="quick-stat">
              <div className="quick-stat-value">156</div>
              <div className="quick-stat-label">Active Routes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardWithMap
