import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Ship, MapPin, TrendingUp, Clock, AlertTriangle } from 'lucide-react'
import ShipmentMap from './maps/ShipmentMap'

function DashboardWithMap() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    total: 285,
    pending: 45,
    inTransit: 78,
    delivered: 152,
    delayed: 10
  })

  const [shipments, setShipments] = useState([])
  const [selectedShipment, setSelectedShipment] = useState(null)

  // Sample shipments for the map
  useEffect(() => {
    // Comprehensive shipments data with global coverage including many from India
    const sampleShipments = [
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
      {
        id: '31',
        trackingNumber: 'CST031',
        status: 'In Transit',
        origin: 'Ho Chi Minh City, Vietnam',
        destination: 'Los Angeles, USA',
        cargo: 'Garments',
        estimatedDelivery: '2024-01-21'
      },
      {
        id: '32',
        trackingNumber: 'CST032',
        status: 'Delivered',
        origin: 'Jakarta, Indonesia',
        destination: 'Mumbai, India',
        cargo: 'Coffee & Spices',
        estimatedDelivery: '2024-01-06'
      },
      {
        id: '33',
        trackingNumber: 'CST033',
        status: 'In Transit',
        origin: 'Manila, Philippines',
        destination: 'Tokyo, Japan',
        cargo: 'Electronics Components',
        estimatedDelivery: '2024-01-18'
      },
      // From Africa
      {
        id: '34',
        trackingNumber: 'CST034',
        status: 'Delivered',
        origin: 'Cape Town, South Africa',
        destination: 'Chennai, India',
        cargo: 'Minerals',
        estimatedDelivery: '2024-01-07'
      },
      {
        id: '35',
        trackingNumber: 'CST035',
        status: 'In Transit',
        origin: 'Lagos, Nigeria',
        destination: 'London, UK',
        cargo: 'Agricultural Products',
        estimatedDelivery: '2024-01-20'
      },
      {
        id: '36',
        trackingNumber: 'CST036',
        status: 'Pending',
        origin: 'Alexandria, Egypt',
        destination: 'Mumbai, India',
        cargo: 'Cotton',
        estimatedDelivery: '2024-01-25'
      },
      {
        id: '37',
        trackingNumber: 'CST037',
        status: 'In Transit',
        origin: 'Casablanca, Morocco',
        destination: 'Hamburg, Germany',
        cargo: 'Phosphates',
        estimatedDelivery: '2024-01-22'
      },
      // From South America
      {
        id: '38',
        trackingNumber: 'CST038',
        status: 'Pending',
        origin: 'São Paulo, Brazil',
        destination: 'Rotterdam, Netherlands',
        cargo: 'Coffee Beans',
        estimatedDelivery: '2024-01-26'
      },
      {
        id: '39',
        trackingNumber: 'CST039',
        status: 'In Transit',
        origin: 'Buenos Aires, Argentina',
        destination: 'Shanghai, China',
        cargo: 'Beef Products',
        estimatedDelivery: '2024-01-21'
      },
      {
        id: '40',
        trackingNumber: 'CST040',
        status: 'Delivered',
        origin: 'Valparaíso, Chile',
        destination: 'Tokyo, Japan',
        cargo: 'Copper',
        estimatedDelivery: '2024-01-05'
      },
      // From Australia/Oceania
      {
        id: '41',
        trackingNumber: 'CST041',
        status: 'Delivered',
        origin: 'Sydney, Australia',
        destination: 'Mumbai, India',
        cargo: 'Iron Ore',
        estimatedDelivery: '2024-01-06'
      },
      {
        id: '42',
        trackingNumber: 'CST042',
        status: 'In Transit',
        origin: 'Melbourne, Australia',
        destination: 'Bangalore, India',
        cargo: 'Educational Materials',
        estimatedDelivery: '2024-01-20'
      },
      {
        id: '43',
        trackingNumber: 'CST043',
        status: 'Pending',
        origin: 'Perth, Australia',
        destination: 'Shanghai, China',
        cargo: 'Wheat',
        estimatedDelivery: '2024-01-24'
      },
      // Additional Indian domestic and export routes
      {
        id: '44',
        trackingNumber: 'CST044',
        status: 'Delayed',
        origin: 'Kandla, India',
        destination: 'Hamburg, Germany',
        cargo: 'Chemicals',
        estimatedDelivery: '2024-01-15'
      },
      {
        id: '45',
        trackingNumber: 'CST045',
        status: 'In Transit',
        origin: 'Tuticorin, India',
        destination: 'Colombo, Sri Lanka',
        cargo: 'Rice',
        estimatedDelivery: '2024-01-16'
      }
    ]
    setShipments(sampleShipments)
  }, [])

  const handleShipmentSelect = (shipment) => {
    setSelectedShipment(shipment)
  }

  const handleViewDetails = () => {
    if (selectedShipment) {
      navigate(`/shipments/${selectedShipment.id}`)
    }
  }

  return (
    <div className="dashboard-with-map">
      <div className="dashboard-header professional-header">
        <div className="header-main">
          <div className="header-icon">
            <Package size={32} />
          </div>
          <div className="header-text">
            <h1>Cargo Shipment Tracker</h1>
            <p>Real-time tracking and monitoring of global shipments</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="status-indicator">
            <div className="status-dot active"></div>
            <span>System Online</span>
          </div>
        </div>
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
                <button
                  className="btn btn-primary"
                  onClick={handleViewDetails}
                >
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
