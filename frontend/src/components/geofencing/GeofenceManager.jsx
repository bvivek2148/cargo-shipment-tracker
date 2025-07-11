import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon } from 'react-leaflet'
import { Shield, AlertTriangle, MapPin, Plus, Edit, Trash2, Bell, Settings, CheckCircle } from 'lucide-react'
import L from 'leaflet'
import toast from 'react-hot-toast'

// Geofence types and their configurations
const GEOFENCE_TYPES = {
  PORT: {
    name: 'Port Area',
    color: '#3b82f6',
    icon: '🚢',
    defaultRadius: 5000, // 5km
    alerts: ['entry', 'exit', 'dwell']
  },
  CUSTOMS: {
    name: 'Customs Zone',
    color: '#f59e0b',
    icon: '🛃',
    defaultRadius: 2000, // 2km
    alerts: ['entry', 'exit']
  },
  WAREHOUSE: {
    name: 'Warehouse',
    color: '#10b981',
    icon: '🏭',
    defaultRadius: 1000, // 1km
    alerts: ['entry', 'exit', 'dwell']
  },
  RESTRICTED: {
    name: 'Restricted Area',
    color: '#ef4444',
    icon: '🚫',
    defaultRadius: 3000, // 3km
    alerts: ['entry', 'proximity']
  },
  DELIVERY: {
    name: 'Delivery Zone',
    color: '#8b5cf6',
    icon: '📦',
    defaultRadius: 1500, // 1.5km
    alerts: ['entry', 'exit']
  }
}

function GeofenceManager({ shipments = [], onAlertTriggered }) {
  const [geofences, setGeofences] = useState([])
  const [activeAlerts, setActiveAlerts] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [selectedGeofence, setSelectedGeofence] = useState(null)
  const [newGeofence, setNewGeofence] = useState({
    name: '',
    type: 'PORT',
    center: null,
    radius: 5000,
    alerts: ['entry', 'exit'],
    isActive: true
  })
  const mapRef = useRef(null)

  // Sample geofences for major ports and areas
  useEffect(() => {
    const sampleGeofences = [
      {
        id: '1',
        name: 'Port of New York',
        type: 'PORT',
        center: { lat: 40.6892, lng: -74.0445 },
        radius: 8000,
        alerts: ['entry', 'exit', 'dwell'],
        isActive: true,
        createdAt: new Date('2024-01-01')
      },
      {
        id: '2',
        name: 'London Gateway Port',
        type: 'PORT',
        center: { lat: 51.5074, lng: -0.1278 },
        radius: 6000,
        alerts: ['entry', 'exit'],
        isActive: true,
        createdAt: new Date('2024-01-01')
      },
      {
        id: '3',
        name: 'Shanghai Customs Zone',
        type: 'CUSTOMS',
        center: { lat: 31.2304, lng: 121.4737 },
        radius: 4000,
        alerts: ['entry', 'exit'],
        isActive: true,
        createdAt: new Date('2024-01-01')
      },
      {
        id: '4',
        name: 'LA Port Restricted Area',
        type: 'RESTRICTED',
        center: { lat: 33.7361, lng: -118.2639 },
        radius: 5000,
        alerts: ['entry', 'proximity'],
        isActive: true,
        createdAt: new Date('2024-01-01')
      }
    ]
    
    setGeofences(sampleGeofences)
  }, [])

  // Monitor shipments for geofence violations
  useEffect(() => {
    const interval = setInterval(() => {
      checkGeofenceViolations()
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [shipments, geofences])

  const checkGeofenceViolations = () => {
    shipments.forEach(shipment => {
      const shipmentPosition = getShipmentPosition(shipment)
      if (!shipmentPosition) return

      geofences.forEach(geofence => {
        if (!geofence.isActive) return

        const distance = calculateDistance(shipmentPosition, geofence.center)
        const isInside = distance <= geofence.radius / 1000 // Convert to km

        // Check for entry/exit events
        const wasInside = shipment.geofenceStatus?.[geofence.id]?.inside || false
        
        if (isInside && !wasInside && geofence.alerts.includes('entry')) {
          triggerAlert('entry', geofence, shipment, distance)
        } else if (!isInside && wasInside && geofence.alerts.includes('exit')) {
          triggerAlert('exit', geofence, shipment, distance)
        } else if (!isInside && distance <= (geofence.radius / 1000) * 1.2 && geofence.alerts.includes('proximity')) {
          triggerAlert('proximity', geofence, shipment, distance)
        }

        // Update shipment geofence status
        if (!shipment.geofenceStatus) shipment.geofenceStatus = {}
        shipment.geofenceStatus[geofence.id] = {
          inside: isInside,
          lastCheck: new Date(),
          distance: distance
        }
      })
    })
  }

  const getShipmentPosition = (shipment) => {
    // Get current position based on shipment status (simplified)
    const cityCoordinates = {
      'New York, USA': { lat: 40.7128, lng: -74.0060 },
      'London, UK': { lat: 51.5074, lng: -0.1278 },
      'Shanghai, China': { lat: 31.2304, lng: 121.4737 },
      'Los Angeles, USA': { lat: 34.0522, lng: -118.2437 },
      'Tokyo, Japan': { lat: 35.6762, lng: 139.6503 },
      'Sydney, Australia': { lat: -33.8688, lng: 151.2093 }
    }

    const origin = cityCoordinates[shipment.origin]
    const destination = cityCoordinates[shipment.destination]
    
    if (!origin || !destination) return null

    // Calculate current position based on status
    let progress = 0
    switch (shipment.status) {
      case 'Pending': progress = 0; break
      case 'In Transit': progress = 0.6; break
      case 'Delivered': progress = 1; break
      case 'Delayed': progress = 0.4; break
      default: progress = 0.5
    }

    return {
      lat: origin.lat + (destination.lat - origin.lat) * progress,
      lng: origin.lng + (destination.lng - origin.lng) * progress
    }
  }

  const calculateDistance = (point1, point2) => {
    const R = 6371 // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180
    const dLon = (point2.lng - point1.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const triggerAlert = (type, geofence, shipment, distance) => {
    const alert = {
      id: Date.now(),
      type,
      geofence,
      shipment,
      distance: Math.round(distance * 100) / 100,
      timestamp: new Date(),
      severity: geofence.type === 'RESTRICTED' ? 'high' : 'medium',
      acknowledged: false
    }

    setActiveAlerts(prev => [alert, ...prev.slice(0, 49)]) // Keep last 50 alerts

    // Show toast notification
    const message = `${shipment.trackingNumber} ${type} ${geofence.name}`
    const icon = GEOFENCE_TYPES[geofence.type].icon
    
    if (alert.severity === 'high') {
      toast.error(`${icon} ${message}`, { duration: 8000 })
    } else {
      toast(`${icon} ${message}`, { duration: 5000 })
    }

    // Notify parent component
    if (onAlertTriggered) {
      onAlertTriggered(alert)
    }
  }

  const createGeofence = () => {
    if (!newGeofence.name || !newGeofence.center) {
      toast.error('Please provide a name and location for the geofence')
      return
    }

    const geofence = {
      ...newGeofence,
      id: Date.now().toString(),
      createdAt: new Date()
    }

    setGeofences(prev => [...prev, geofence])
    setIsCreating(false)
    setNewGeofence({
      name: '',
      type: 'PORT',
      center: null,
      radius: 5000,
      alerts: ['entry', 'exit'],
      isActive: true
    })
    
    toast.success('Geofence created successfully')
  }

  const deleteGeofence = (id) => {
    setGeofences(prev => prev.filter(g => g.id !== id))
    toast.success('Geofence deleted')
  }

  const toggleGeofence = (id) => {
    setGeofences(prev => prev.map(g => 
      g.id === id ? { ...g, isActive: !g.isActive } : g
    ))
  }

  const acknowledgeAlert = (alertId) => {
    setActiveAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ))
  }

  const handleMapClick = (e) => {
    if (isCreating) {
      setNewGeofence(prev => ({
        ...prev,
        center: { lat: e.latlng.lat, lng: e.latlng.lng }
      }))
    }
  }

  return (
    <div className="geofence-manager">
      <div className="manager-header">
        <h3>🛡️ Geofence Manager</h3>
        <div className="header-actions">
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className={`btn ${isCreating ? 'btn-secondary' : 'btn-primary'}`}
          >
            <Plus size={16} />
            {isCreating ? 'Cancel' : 'Create Geofence'}
          </button>
        </div>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="active-alerts">
          <h4>🚨 Active Alerts ({activeAlerts.filter(a => !a.acknowledged).length})</h4>
          <div className="alerts-list">
            {activeAlerts.slice(0, 5).map(alert => (
              <div 
                key={alert.id} 
                className={`alert-item ${alert.severity} ${alert.acknowledged ? 'acknowledged' : ''}`}
              >
                <div className="alert-icon">
                  {GEOFENCE_TYPES[alert.geofence.type].icon}
                </div>
                <div className="alert-content">
                  <div className="alert-title">
                    {alert.shipment.trackingNumber} {alert.type} {alert.geofence.name}
                  </div>
                  <div className="alert-details">
                    Distance: {alert.distance} km • {alert.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                {!alert.acknowledged && (
                  <button 
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="acknowledge-btn"
                  >
                    <CheckCircle size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Geofence Creation Form */}
      {isCreating && (
        <div className="geofence-form">
          <h4>Create New Geofence</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={newGeofence.name}
                onChange={(e) => setNewGeofence(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter geofence name"
              />
            </div>
            
            <div className="form-group">
              <label>Type</label>
              <select
                value={newGeofence.type}
                onChange={(e) => setNewGeofence(prev => ({ 
                  ...prev, 
                  type: e.target.value,
                  radius: GEOFENCE_TYPES[e.target.value].defaultRadius
                }))}
              >
                {Object.entries(GEOFENCE_TYPES).map(([key, type]) => (
                  <option key={key} value={key}>
                    {type.icon} {type.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Radius (meters)</label>
              <input
                type="number"
                value={newGeofence.radius}
                onChange={(e) => setNewGeofence(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                min="100"
                max="50000"
              />
            </div>
          </div>
          
          <div className="alert-types">
            <label>Alert Types</label>
            <div className="checkbox-group">
              {['entry', 'exit', 'dwell', 'proximity'].map(alertType => (
                <label key={alertType} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newGeofence.alerts.includes(alertType)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewGeofence(prev => ({ 
                          ...prev, 
                          alerts: [...prev.alerts, alertType] 
                        }))
                      } else {
                        setNewGeofence(prev => ({ 
                          ...prev, 
                          alerts: prev.alerts.filter(a => a !== alertType) 
                        }))
                      }
                    }}
                  />
                  {alertType.charAt(0).toUpperCase() + alertType.slice(1)}
                </label>
              ))}
            </div>
          </div>
          
          <p className="form-hint">
            {newGeofence.center 
              ? `Location: ${newGeofence.center.lat.toFixed(4)}, ${newGeofence.center.lng.toFixed(4)}`
              : 'Click on the map to set location'
            }
          </p>
          
          <div className="form-actions">
            <button onClick={createGeofence} className="btn btn-primary">
              Create Geofence
            </button>
          </div>
        </div>
      )}

      {/* Geofence List */}
      <div className="geofence-list">
        <h4>📍 Geofences ({geofences.length})</h4>
        <div className="geofences">
          {geofences.map(geofence => (
            <div key={geofence.id} className={`geofence-item ${!geofence.isActive ? 'inactive' : ''}`}>
              <div className="geofence-info">
                <div className="geofence-header">
                  <span className="geofence-icon">
                    {GEOFENCE_TYPES[geofence.type].icon}
                  </span>
                  <span className="geofence-name">{geofence.name}</span>
                  <span className={`geofence-status ${geofence.isActive ? 'active' : 'inactive'}`}>
                    {geofence.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="geofence-details">
                  <span>{GEOFENCE_TYPES[geofence.type].name}</span>
                  <span>Radius: {(geofence.radius / 1000).toFixed(1)} km</span>
                  <span>Alerts: {geofence.alerts.join(', ')}</span>
                </div>
              </div>
              <div className="geofence-actions">
                <button 
                  onClick={() => toggleGeofence(geofence.id)}
                  className={`btn btn-sm ${geofence.isActive ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {geofence.isActive ? 'Disable' : 'Enable'}
                </button>
                <button 
                  onClick={() => deleteGeofence(geofence.id)}
                  className="btn btn-sm btn-danger"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="geofence-map">
        <MapContainer
          center={[40.7128, -74.0060]}
          zoom={2}
          style={{ height: '500px', width: '100%' }}
          ref={mapRef}
          onClick={handleMapClick}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Geofences */}
          {geofences.map(geofence => (
            <Circle
              key={geofence.id}
              center={[geofence.center.lat, geofence.center.lng]}
              radius={geofence.radius}
              pathOptions={{
                color: GEOFENCE_TYPES[geofence.type].color,
                fillColor: GEOFENCE_TYPES[geofence.type].color,
                fillOpacity: geofence.isActive ? 0.2 : 0.1,
                opacity: geofence.isActive ? 0.8 : 0.4
              }}
            >
              <Popup>
                <div>
                  <h4>{GEOFENCE_TYPES[geofence.type].icon} {geofence.name}</h4>
                  <p>Type: {GEOFENCE_TYPES[geofence.type].name}</p>
                  <p>Radius: {(geofence.radius / 1000).toFixed(1)} km</p>
                  <p>Status: {geofence.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </Popup>
            </Circle>
          ))}

          {/* Shipment positions */}
          {shipments.map(shipment => {
            const position = getShipmentPosition(shipment)
            if (!position) return null

            return (
              <Marker
                key={shipment.id}
                position={[position.lat, position.lng]}
                icon={L.divIcon({
                  className: 'shipment-marker',
                  html: `<div class="marker-shipment">${shipment.trackingNumber}</div>`,
                  iconSize: [80, 20],
                  iconAnchor: [40, 10]
                })}
              >
                <Popup>
                  <div>
                    <h4>{shipment.trackingNumber}</h4>
                    <p>Status: {shipment.status}</p>
                    <p>Cargo: {shipment.cargo}</p>
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {/* New geofence preview */}
          {isCreating && newGeofence.center && (
            <Circle
              center={[newGeofence.center.lat, newGeofence.center.lng]}
              radius={newGeofence.radius}
              pathOptions={{
                color: GEOFENCE_TYPES[newGeofence.type].color,
                fillColor: GEOFENCE_TYPES[newGeofence.type].color,
                fillOpacity: 0.3,
                opacity: 1,
                dashArray: '10, 10'
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  )
}

export default GeofenceManager
