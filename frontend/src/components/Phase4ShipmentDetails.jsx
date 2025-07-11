import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Package, MapPin, Clock, Truck, AlertTriangle, Download, Share2, Route, Shield, BarChart3 } from 'lucide-react'
import ShipmentMap from './maps/ShipmentMap'
import RealTimeTracker from './tracking/RealTimeTracker'
import RouteOptimizer from './routing/RouteOptimizer'
import GeofenceManager from './geofencing/GeofenceManager'
import AdvancedAnalytics from './analytics/AdvancedAnalytics'

function Phase4ShipmentDetails() {
  const { id } = useParams()
  const [shipment, setShipment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')



  // Generate detailed shipment data from basic shipment info
  const generateShipmentDetails = (basicShipment) => {
    if (!basicShipment) return null

    // Generate realistic details based on cargo type and route
    const getCarrierInfo = (cargo, origin) => {
      if (cargo.includes('Pharmaceuticals')) return { carrier: 'Global Pharma Logistics', vessel: 'MV MedExpress' }
      if (cargo.includes('Electronics')) return { carrier: 'Tech Express Lines', vessel: 'MV Digital Carrier' }
      if (cargo.includes('Textiles')) return { carrier: 'Fashion Logistics', vessel: 'MV Textile Express' }
      if (cargo.includes('Steel')) return { carrier: 'Heavy Cargo Lines', vessel: 'MV Steel Dragon' }
      if (cargo.includes('Chemicals')) return { carrier: 'Chemical Transport Co.', vessel: 'MV Chem Safe' }
      if (origin.includes('India')) return { carrier: 'India Shipping Lines', vessel: 'MV Mumbai Express' }
      if (origin.includes('China')) return { carrier: 'China Express Lines', vessel: 'MV Dragon Gate' }
      return { carrier: 'Global Shipping Co.', vessel: 'MV Ocean Explorer' }
    }

    const getWeight = (cargo) => {
      if (cargo.includes('Pharmaceuticals')) return '300 kg'
      if (cargo.includes('Electronics')) return '800 kg'
      if (cargo.includes('Steel')) return '3000 kg'
      if (cargo.includes('Machinery')) return '2500 kg'
      if (cargo.includes('Chemicals')) return '1800 kg'
      return '1200 kg'
    }

    const getValue = (cargo) => {
      if (cargo.includes('Pharmaceuticals')) return '$85,000'
      if (cargo.includes('Software')) return '$120,000'
      if (cargo.includes('Electronics')) return '$35,000'
      if (cargo.includes('Steel')) return '$55,000'
      if (cargo.includes('Machinery')) return '$65,000'
      return '$25,000'
    }

    const getCurrentLocation = (origin, destination, status) => {
      if (status === 'Delivered') return destination.split(',')[0] + ' Port'
      if (status === 'Pending') return origin.split(',')[0] + ' Warehouse'

      // Generate intermediate location based on route
      if (origin.includes('India') && destination.includes('UK')) return 'Arabian Sea'
      if (origin.includes('India') && destination.includes('USA')) return 'Indian Ocean'
      if (origin.includes('China') && destination.includes('India')) return 'South China Sea'
      if (origin.includes('India') && destination.includes('Germany')) return 'Red Sea'
      if (origin.includes('India') && destination.includes('Japan')) return 'Bay of Bengal'
      return 'International Waters'
    }

    const carrierInfo = getCarrierInfo(basicShipment.cargo, basicShipment.origin)

    return {
      ...basicShipment,
      weight: getWeight(basicShipment.cargo),
      dimensions: '150x100x80 cm',
      value: getValue(basicShipment.cargo),
      currentLocation: getCurrentLocation(basicShipment.origin, basicShipment.destination, basicShipment.status),
      carrier: carrierInfo.carrier,
      vessel: carrierInfo.vessel,
      container: `CONT${basicShipment.id.padStart(7, '0')}`,
      createdAt: '2024-01-08',
      route: {
        origin: basicShipment.origin,
        destination: basicShipment.destination,
        waypoints: ['Transit Point 1', 'Transit Point 2'],
        distance: Math.floor(Math.random() * 15000) + 2000, // km
        estimatedTime: Math.floor(Math.random() * 20) + 5 // days
      },
      customer: {
        name: `Customer for ${basicShipment.trackingNumber}`,
        email: `contact@customer${basicShipment.id}.com`,
        phone: `+1-555-${basicShipment.id.padStart(4, '0')}`
      },
      documents: [
        { name: 'Bill of Lading', type: 'PDF', size: '245 KB' },
        { name: 'Commercial Invoice', type: 'PDF', size: '189 KB' },
        { name: 'Packing List', type: 'PDF', size: '156 KB' }
      ]
    }
  }

  // Basic shipment data (matching the list data)
  const basicShipments = [
    { id: '1', trackingNumber: 'CST001', status: 'In Transit', origin: 'Mumbai, India', destination: 'London, UK', cargo: 'Textiles & Garments', estimatedDelivery: '2024-01-15' },
    { id: '2', trackingNumber: 'CST002', status: 'Delivered', origin: 'Chennai, India', destination: 'New York, USA', cargo: 'Pharmaceuticals', estimatedDelivery: '2024-01-10' },
    { id: '3', trackingNumber: 'CST003', status: 'In Transit', origin: 'Kolkata, India', destination: 'Hamburg, Germany', cargo: 'Tea & Spices', estimatedDelivery: '2024-01-18' },
    { id: '4', trackingNumber: 'CST004', status: 'Pending', origin: 'Bangalore, India', destination: 'Singapore', cargo: 'IT Equipment', estimatedDelivery: '2024-01-20' },
    { id: '5', trackingNumber: 'CST005', status: 'In Transit', origin: 'Delhi, India', destination: 'Dubai, UAE', cargo: 'Handicrafts', estimatedDelivery: '2024-01-16' },
    { id: '6', trackingNumber: 'CST006', status: 'Delivered', origin: 'Pune, India', destination: 'Sydney, Australia', cargo: 'Automotive Parts', estimatedDelivery: '2024-01-12' },
    { id: '7', trackingNumber: 'CST007', status: 'In Transit', origin: 'Hyderabad, India', destination: 'Tokyo, Japan', cargo: 'Software Services', estimatedDelivery: '2024-01-22' },
    { id: '8', trackingNumber: 'CST008', status: 'Delayed', origin: 'Kochi, India', destination: 'Rotterdam, Netherlands', cargo: 'Marine Products', estimatedDelivery: '2024-01-14' },
    { id: '9', trackingNumber: 'CST009', status: 'In Transit', origin: 'Visakhapatnam, India', destination: 'Busan, South Korea', cargo: 'Steel Products', estimatedDelivery: '2024-01-19' },
    { id: '10', trackingNumber: 'CST010', status: 'Delivered', origin: 'Ahmedabad, India', destination: 'Los Angeles, USA', cargo: 'Chemicals', estimatedDelivery: '2024-01-08' },
    { id: '11', trackingNumber: 'CST011', status: 'In Transit', origin: 'Shanghai, China', destination: 'Mumbai, India', cargo: 'Electronics', estimatedDelivery: '2024-01-17' },
    { id: '12', trackingNumber: 'CST012', status: 'Delivered', origin: 'Shenzhen, China', destination: 'Frankfurt, Germany', cargo: 'Consumer Electronics', estimatedDelivery: '2024-01-11' },
    { id: '13', trackingNumber: 'CST013', status: 'In Transit', origin: 'Guangzhou, China', destination: 'Chennai, India', cargo: 'Machinery', estimatedDelivery: '2024-01-21' },
    { id: '14', trackingNumber: 'CST014', status: 'Pending', origin: 'Beijing, China', destination: 'London, UK', cargo: 'Industrial Equipment', estimatedDelivery: '2024-01-25' },
    { id: '15', trackingNumber: 'CST015', status: 'In Transit', origin: 'Tianjin, China', destination: 'Kolkata, India', cargo: 'Raw Materials', estimatedDelivery: '2024-01-18' },
    { id: '16', trackingNumber: 'CST016', status: 'In Transit', origin: 'New York, USA', destination: 'Chennai, India', cargo: 'Medical Equipment', estimatedDelivery: '2024-01-23' },
    { id: '17', trackingNumber: 'CST017', status: 'Delivered', origin: 'Los Angeles, USA', destination: 'Tokyo, Japan', cargo: 'Agricultural Products', estimatedDelivery: '2024-01-13' },
    { id: '18', trackingNumber: 'CST018', status: 'In Transit', origin: 'Miami, USA', destination: 'São Paulo, Brazil', cargo: 'Technology Hardware', estimatedDelivery: '2024-01-20' },
    { id: '19', trackingNumber: 'CST019', status: 'Pending', origin: 'Seattle, USA', destination: 'Mumbai, India', cargo: 'Aircraft Parts', estimatedDelivery: '2024-01-26' },
    { id: '20', trackingNumber: 'CST020', status: 'In Transit', origin: 'Houston, USA', destination: 'Dubai, UAE', cargo: 'Oil Equipment', estimatedDelivery: '2024-01-17' },
    { id: '21', trackingNumber: 'CST021', status: 'In Transit', origin: 'Hamburg, Germany', destination: 'Kolkata, India', cargo: 'Chemical Products', estimatedDelivery: '2024-01-20' },
    { id: '22', trackingNumber: 'CST022', status: 'Delivered', origin: 'Rotterdam, Netherlands', destination: 'Singapore', cargo: 'Food Products', estimatedDelivery: '2024-01-09' },
    { id: '23', trackingNumber: 'CST023', status: 'Pending', origin: 'Antwerp, Belgium', destination: 'Mumbai, India', cargo: 'Luxury Goods', estimatedDelivery: '2024-01-24' },
    { id: '24', trackingNumber: 'CST024', status: 'In Transit', origin: 'Le Havre, France', destination: 'Chennai, India', cargo: 'Wine & Spirits', estimatedDelivery: '2024-01-22' },
    { id: '25', trackingNumber: 'CST025', status: 'Delivered', origin: 'Felixstowe, UK', destination: 'New York, USA', cargo: 'Manufactured Goods', estimatedDelivery: '2024-01-07' },
    { id: '26', trackingNumber: 'CST026', status: 'In Transit', origin: 'Dubai, UAE', destination: 'Mumbai, India', cargo: 'Petroleum Products', estimatedDelivery: '2024-01-16' },
    { id: '27', trackingNumber: 'CST027', status: 'Delivered', origin: 'Jeddah, Saudi Arabia', destination: 'Karachi, Pakistan', cargo: 'Construction Materials', estimatedDelivery: '2024-01-08' },
    { id: '28', trackingNumber: 'CST028', status: 'In Transit', origin: 'Kuwait City, Kuwait', destination: 'Chennai, India', cargo: 'Oil & Gas Equipment', estimatedDelivery: '2024-01-19' },
    { id: '29', trackingNumber: 'CST029', status: 'In Transit', origin: 'Singapore', destination: 'Kolkata, India', cargo: 'Palm Oil', estimatedDelivery: '2024-01-17' },
    { id: '30', trackingNumber: 'CST030', status: 'Pending', origin: 'Bangkok, Thailand', destination: 'Sydney, Australia', cargo: 'Rubber Products', estimatedDelivery: '2024-01-23' },
    { id: '31', trackingNumber: 'CST031', status: 'Delivered', origin: 'Cape Town, South Africa', destination: 'Chennai, India', cargo: 'Minerals', estimatedDelivery: '2024-01-07' },
    { id: '32', trackingNumber: 'CST032', status: 'In Transit', origin: 'Lagos, Nigeria', destination: 'London, UK', cargo: 'Agricultural Products', estimatedDelivery: '2024-01-20' },
    { id: '33', trackingNumber: 'CST033', status: 'Pending', origin: 'São Paulo, Brazil', destination: 'Rotterdam, Netherlands', cargo: 'Coffee Beans', estimatedDelivery: '2024-01-26' },
    { id: '34', trackingNumber: 'CST034', status: 'In Transit', origin: 'Buenos Aires, Argentina', destination: 'Shanghai, China', cargo: 'Beef Products', estimatedDelivery: '2024-01-21' },
    { id: '35', trackingNumber: 'CST035', status: 'Delivered', origin: 'Sydney, Australia', destination: 'Mumbai, India', cargo: 'Iron Ore', estimatedDelivery: '2024-01-06' },
    { id: '36', trackingNumber: 'CST036', status: 'Delayed', origin: 'Kandla, India', destination: 'Hamburg, Germany', cargo: 'Chemicals', estimatedDelivery: '2024-01-15' },
    { id: '37', trackingNumber: 'CST037', status: 'In Transit', origin: 'Tuticorin, India', destination: 'Colombo, Sri Lanka', cargo: 'Rice', estimatedDelivery: '2024-01-16' },
    { id: '38', trackingNumber: 'CST038', status: 'Pending', origin: 'Ho Chi Minh City, Vietnam', destination: 'Los Angeles, USA', cargo: 'Garments', estimatedDelivery: '2024-01-21' },
    { id: '39', trackingNumber: 'CST039', status: 'In Transit', origin: 'Jakarta, Indonesia', destination: 'Mumbai, India', cargo: 'Coffee & Spices', estimatedDelivery: '2024-01-18' },
    { id: '40', trackingNumber: 'CST040', status: 'Delivered', origin: 'Manila, Philippines', destination: 'Tokyo, Japan', cargo: 'Electronics Components', estimatedDelivery: '2024-01-06' },
    { id: '41', trackingNumber: 'CST041', status: 'In Transit', origin: 'Alexandria, Egypt', destination: 'Mumbai, India', cargo: 'Cotton', estimatedDelivery: '2024-01-25' },
    { id: '42', trackingNumber: 'CST042', status: 'Pending', origin: 'Casablanca, Morocco', destination: 'Hamburg, Germany', cargo: 'Phosphates', estimatedDelivery: '2024-01-22' },
    { id: '43', trackingNumber: 'CST043', status: 'Delivered', origin: 'Valparaíso, Chile', destination: 'Tokyo, Japan', cargo: 'Copper', estimatedDelivery: '2024-01-05' },
    { id: '44', trackingNumber: 'CST044', status: 'In Transit', origin: 'Melbourne, Australia', destination: 'Bangalore, India', cargo: 'Educational Materials', estimatedDelivery: '2024-01-20' },
    { id: '45', trackingNumber: 'CST045', status: 'Pending', origin: 'Perth, Australia', destination: 'Shanghai, China', cargo: 'Wheat', estimatedDelivery: '2024-01-24' }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const basicShipment = basicShipments.find(s => s.id === id)
      const detailedShipment = generateShipmentDetails(basicShipment)
      setShipment(detailedShipment)
      setLoading(false)
    }, 1000)
  }, [id])

  const handleLocationUpdate = (newLocation) => {
    setShipment(prev => ({
      ...prev,
      currentLocation: newLocation.name,
      lastUpdate: newLocation.timestamp
    }))
  }

  const handleRouteUpdate = (optimizedRoute, routeStats) => {
    setShipment(prev => ({
      ...prev,
      route: {
        ...prev.route,
        optimizedRoute,
        stats: routeStats
      }
    }))
  }

  const handleGeofenceAlert = (alert) => {
    console.log('Geofence alert:', alert)
    // Handle geofence alerts (could trigger notifications, etc.)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'status-delivered'
      case 'In Transit':
        return 'status-in-transit'
      case 'Delayed':
        return 'status-delayed'
      case 'Pending':
        return 'status-pending'
      default:
        return 'status-default'
    }
  }

  if (loading) {
    return (
      <div className="phase4-shipment-details loading">
        <div className="modern-loading-container">
          <div className="loading-animation">
            <div className="cargo-container">
              <div className="cargo-box"></div>
              <div className="cargo-box"></div>
              <div className="cargo-box"></div>
            </div>
            <div className="loading-truck">
              <Truck size={40} className="truck-icon" />
            </div>
          </div>

          <div className="loading-content">
            <h2>Loading Shipment Details</h2>
            <p>Fetching advanced tracking information...</p>

            <div className="loading-progress">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <div className="loading-steps">
                <span className="step active">📦 Shipment Data</span>
                <span className="step">🗺️ Route Information</span>
                <span className="step">📊 Analytics</span>
              </div>
            </div>
          </div>

          <div className="loading-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="phase4-shipment-details error">
        <div className="modern-error-container">
          <div className="error-animation">
            <div className="error-icon-container">
              <AlertTriangle size={64} className="error-icon" />
              <div className="error-pulse"></div>
            </div>
          </div>

          <div className="error-content">
            <h2>Shipment Not Found</h2>
            <p>We couldn't locate the shipment with ID <strong>{id}</strong>. It may have been moved or doesn't exist.</p>

            <div className="error-suggestions">
              <div className="suggestion">
                <Package size={20} />
                <span>Check the tracking number</span>
              </div>
              <div className="suggestion">
                <Clock size={20} />
                <span>Try again in a moment</span>
              </div>
            </div>
          </div>

          <div className="error-actions">
            <Link to="/shipments" className="btn btn-primary modern-btn">
              <ArrowLeft size={16} />
              Back to Shipments
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-secondary modern-btn"
            >
              <Package size={16} />
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="phase4-shipment-details">
      {/* Header */}
      <div className="details-header">
        <div className="header-navigation">
          <Link to="/shipments" className="back-link">
            <ArrowLeft size={20} />
            Back to Shipments
          </Link>
        </div>
        
        <div className="header-content">
          <div className="header-info">
            <h1>{shipment.trackingNumber}</h1>
            <span className={`status-badge ${getStatusColor(shipment.status)}`}>
              {shipment.status}
            </span>
          </div>
          
          <div className="header-actions">
            <button className="btn btn-secondary">
              <Share2 size={16} />
              Share
            </button>
            <button className="btn btn-primary">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs with Phase 4 Features */}
      <div className="details-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Package size={16} />
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'tracking' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracking')}
        >
          <MapPin size={16} />
          Live Tracking
        </button>
        <button 
          className={`tab-button ${activeTab === 'route' ? 'active' : ''}`}
          onClick={() => setActiveTab('route')}
        >
          <Route size={16} />
          Route Optimization
        </button>
        <button 
          className={`tab-button ${activeTab === 'geofencing' ? 'active' : ''}`}
          onClick={() => setActiveTab('geofencing')}
        >
          <Shield size={16} />
          Geofencing
        </button>
        <button 
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={16} />
          Analytics
        </button>
        <button 
          className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <Download size={16} />
          Documents
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-grid">
              {/* Shipment Information */}
              <div className="info-card">
                <h3>📦 Shipment Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Tracking Number</label>
                    <span>{shipment.trackingNumber}</span>
                  </div>
                  <div className="info-item">
                    <label>Status</label>
                    <span className={`status-text ${getStatusColor(shipment.status)}`}>
                      {shipment.status}
                    </span>
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
                    <label>Dimensions</label>
                    <span>{shipment.dimensions}</span>
                  </div>
                  <div className="info-item">
                    <label>Value</label>
                    <span>{shipment.value}</span>
                  </div>
                </div>
              </div>

              {/* Route Information */}
              <div className="info-card">
                <h3>🗺️ Route Information</h3>
                <div className="route-info">
                  <div className="route-point origin">
                    <div className="route-marker">📍</div>
                    <div className="route-details">
                      <label>Origin</label>
                      <span>{shipment.origin}</span>
                    </div>
                  </div>
                  
                  <div className="route-line"></div>
                  
                  <div className="route-point current">
                    <div className="route-marker">🚛</div>
                    <div className="route-details">
                      <label>Current Location</label>
                      <span>{shipment.currentLocation}</span>
                    </div>
                  </div>
                  
                  <div className="route-line"></div>
                  
                  <div className="route-point destination">
                    <div className="route-marker">🎯</div>
                    <div className="route-details">
                      <label>Destination</label>
                      <span>{shipment.destination}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Details */}
              <div className="info-card">
                <h3>🚢 Shipping Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Carrier</label>
                    <span>{shipment.carrier}</span>
                  </div>
                  <div className="info-item">
                    <label>Vessel</label>
                    <span>{shipment.vessel}</span>
                  </div>
                  <div className="info-item">
                    <label>Container</label>
                    <span>{shipment.container}</span>
                  </div>
                  <div className="info-item">
                    <label>Estimated Delivery</label>
                    <span>{shipment.estimatedDelivery}</span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="info-card">
                <h3>👤 Customer Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Company</label>
                    <span>{shipment.customer.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Email</label>
                    <span>{shipment.customer.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone</label>
                    <span>{shipment.customer.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="tracking-tab">
            <div className="tracking-grid">
              <div className="tracking-map">
                <ShipmentMap 
                  shipments={[shipment]} 
                  selectedShipment={shipment}
                />
              </div>
              <div className="tracking-details">
                <RealTimeTracker 
                  shipment={shipment}
                  onLocationUpdate={handleLocationUpdate}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'route' && (
          <div className="route-tab">
            <RouteOptimizer 
              shipment={shipment}
              onRouteUpdate={handleRouteUpdate}
            />
          </div>
        )}

        {activeTab === 'geofencing' && (
          <div className="geofencing-tab">
            <GeofenceManager 
              shipments={[shipment]}
              onAlertTriggered={handleGeofenceAlert}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <AdvancedAnalytics 
              shipments={[shipment]}
              selectedShipment={shipment}
            />
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="documents-tab">
            <div className="documents-header">
              <h3>📄 Shipping Documents</h3>
              <p>Download or view shipping documents for this shipment</p>
            </div>
            
            <div className="documents-list">
              {shipment.documents.map((doc, index) => (
                <div key={index} className="document-item">
                  <div className="document-info">
                    <div className="document-icon">📄</div>
                    <div className="document-details">
                      <div className="document-name">{doc.name}</div>
                      <div className="document-meta">
                        {doc.type} • {doc.size}
                      </div>
                    </div>
                  </div>
                  <div className="document-actions">
                    <button className="btn btn-secondary">View</button>
                    <button className="btn btn-primary">
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Phase4ShipmentDetails
