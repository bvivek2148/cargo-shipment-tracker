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

  // Sample shipment data with enhanced Phase 4 features
  const sampleShipments = {
    '1': {
      id: '1',
      trackingNumber: 'CST001',
      status: 'In Transit',
      origin: 'New York, USA',
      destination: 'London, UK',
      cargo: 'Electronics',
      weight: '500 kg',
      dimensions: '120x80x60 cm',
      value: '$25,000',
      estimatedDelivery: '2024-01-15',
      currentLocation: 'Atlantic Ocean',
      carrier: 'Global Shipping Co.',
      vessel: 'MV Ocean Explorer',
      container: 'GSTU1234567',
      createdAt: '2024-01-10',
      route: {
        origin: 'New York, USA',
        destination: 'London, UK',
        waypoints: ['Halifax, Canada'],
        distance: 5585, // km
        estimatedTime: 12.5 // days
      },
      customer: {
        name: 'Tech Solutions Inc.',
        email: 'orders@techsolutions.com',
        phone: '+1-555-0123'
      },
      documents: [
        { name: 'Bill of Lading', type: 'PDF', size: '245 KB' },
        { name: 'Commercial Invoice', type: 'PDF', size: '189 KB' },
        { name: 'Packing List', type: 'PDF', size: '156 KB' }
      ]
    },
    '2': {
      id: '2',
      trackingNumber: 'CST002',
      status: 'Pending',
      origin: 'Shanghai, China',
      destination: 'Los Angeles, USA',
      cargo: 'Textiles',
      weight: '1200 kg',
      dimensions: '200x150x100 cm',
      value: '$18,500',
      estimatedDelivery: '2024-01-20',
      currentLocation: 'Shanghai Port',
      carrier: 'Pacific Logistics',
      vessel: 'MV Pacific Star',
      container: 'PLSU9876543',
      createdAt: '2024-01-12',
      route: {
        origin: 'Shanghai, China',
        destination: 'Los Angeles, USA',
        waypoints: ['Tokyo, Japan', 'Honolulu, USA'],
        distance: 11095, // km
        estimatedTime: 18.2 // days
      },
      customer: {
        name: 'Fashion Forward LLC',
        email: 'shipping@fashionforward.com',
        phone: '+1-555-0456'
      },
      documents: [
        { name: 'Export Declaration', type: 'PDF', size: '198 KB' },
        { name: 'Certificate of Origin', type: 'PDF', size: '167 KB' }
      ]
    }
  }

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const shipmentData = sampleShipments[id]
      setShipment(shipmentData)
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
        <div className="loading-spinner">
          <Package size={32} className="loading-icon" />
          <p>Loading advanced shipment details...</p>
        </div>
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="phase4-shipment-details error">
        <div className="error-message">
          <AlertTriangle size={48} />
          <h2>Shipment Not Found</h2>
          <p>The shipment with ID {id} could not be found.</p>
          <Link to="/shipments" className="btn btn-primary">
            <ArrowLeft size={16} />
            Back to Shipments
          </Link>
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
