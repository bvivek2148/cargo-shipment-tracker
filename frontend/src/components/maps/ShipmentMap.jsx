import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom icons for different shipment statuses
const createCustomIcon = (color, status) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-pin marker-${status}" style="background-color: ${color};">
        <div class="marker-icon">
          ${getStatusIcon(status)}
        </div>
      </div>
    `,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40]
  })
}

function getStatusIcon(status) {
  switch (status) {
    case 'pending':
      return '📦'
    case 'in-transit':
      return '🚛'
    case 'delivered':
      return '✅'
    case 'delayed':
      return '⚠️'
    default:
      return '📍'
  }
}

function getStatusColor(status) {
  switch (status) {
    case 'pending':
      return '#f59e0b'
    case 'in-transit':
      return '#3b82f6'
    case 'delivered':
      return '#10b981'
    case 'delayed':
      return '#ef4444'
    default:
      return '#6b7280'
  }
}

function ShipmentMap({ shipments = [], selectedShipment = null, onShipmentSelect }) {
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]) // Default to NYC
  const [mapZoom, setMapZoom] = useState(4)

  // Sample coordinates for major cities (in a real app, this would come from a geocoding service)
  const cityCoordinates = {
    'New York, USA': [40.7128, -74.0060],
    'London, UK': [51.5074, -0.1278],
    'Shanghai, China': [31.2304, 121.4737],
    'Los Angeles, USA': [34.0522, -118.2437],
    'Tokyo, Japan': [35.6762, 139.6503],
    'Sydney, Australia': [-33.8688, 151.2093],
    'Hamburg, Germany': [53.5511, 9.9937],
    'Singapore': [1.3521, 103.8198],
    'Dubai, UAE': [25.2048, 55.2708],
    'Mumbai, India': [19.0760, 72.8777]
  }

  // Get coordinates for a city
  const getCoordinates = (cityName) => {
    return cityCoordinates[cityName] || [0, 0]
  }

  // Generate route points between origin and destination
  const generateRoutePoints = (origin, destination, currentProgress = 0.5) => {
    const originCoords = getCoordinates(origin)
    const destCoords = getCoordinates(destination)
    
    if (!originCoords || !destCoords) return []

    // Simple linear interpolation for route (in real app, use routing service)
    const points = []
    const steps = 20
    
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps
      const lat = originCoords[0] + (destCoords[0] - originCoords[0]) * ratio
      const lng = originCoords[1] + (destCoords[1] - originCoords[1]) * ratio
      points.push([lat, lng])
    }
    
    return points
  }

  // Get current position based on shipment status
  const getCurrentPosition = (shipment) => {
    const originCoords = getCoordinates(shipment.origin)
    const destCoords = getCoordinates(shipment.destination)
    
    if (!originCoords || !destCoords) return originCoords

    let progress = 0
    switch (shipment.status.toLowerCase().replace(' ', '-')) {
      case 'pending':
        progress = 0
        break
      case 'in-transit':
        progress = 0.6 // 60% of the way
        break
      case 'delivered':
        progress = 1
        break
      case 'delayed':
        progress = 0.4 // Stuck at 40%
        break
      default:
        progress = 0.5
    }

    const lat = originCoords[0] + (destCoords[0] - originCoords[0]) * progress
    const lng = originCoords[1] + (destCoords[1] - originCoords[1]) * progress
    
    return [lat, lng]
  }

  // Focus map on selected shipment
  useEffect(() => {
    if (selectedShipment) {
      const currentPos = getCurrentPosition(selectedShipment)
      setMapCenter(currentPos)
      setMapZoom(6)
    }
  }, [selectedShipment])

  return (
    <div className="shipment-map-container">
      <div className="map-header">
        <h3>🗺️ Shipment Tracking Map</h3>
        <div className="map-legend">
          <div className="legend-item">
            <span className="legend-marker pending">📦</span>
            <span>Pending</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker in-transit">🚛</span>
            <span>In Transit</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker delivered">✅</span>
            <span>Delivered</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker delayed">⚠️</span>
            <span>Delayed</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '500px', width: '100%' }}
        className="shipment-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {shipments.map(shipment => {
          const currentPosition = getCurrentPosition(shipment)
          const routePoints = generateRoutePoints(shipment.origin, shipment.destination)
          const status = shipment.status.toLowerCase().replace(' ', '-')
          const color = getStatusColor(status)

          return (
            <div key={shipment.id}>
              {/* Route line */}
              {routePoints.length > 0 && (
                <Polyline
                  positions={routePoints}
                  color={color}
                  weight={3}
                  opacity={0.7}
                  dashArray={status === 'delayed' ? '10, 10' : null}
                />
              )}

              {/* Origin marker */}
              <CircleMarker
                center={getCoordinates(shipment.origin)}
                radius={8}
                fillColor="#10b981"
                color="#ffffff"
                weight={2}
                fillOpacity={0.8}
              >
                <Popup>
                  <div className="map-popup">
                    <h4>📍 Origin</h4>
                    <p><strong>{shipment.origin}</strong></p>
                    <p>Shipment: {shipment.trackingNumber}</p>
                  </div>
                </Popup>
              </CircleMarker>

              {/* Destination marker */}
              <CircleMarker
                center={getCoordinates(shipment.destination)}
                radius={8}
                fillColor="#ef4444"
                color="#ffffff"
                weight={2}
                fillOpacity={0.8}
              >
                <Popup>
                  <div className="map-popup">
                    <h4>🎯 Destination</h4>
                    <p><strong>{shipment.destination}</strong></p>
                    <p>Shipment: {shipment.trackingNumber}</p>
                  </div>
                </Popup>
              </CircleMarker>

              {/* Current position marker */}
              <Marker
                position={currentPosition}
                icon={createCustomIcon(color, status)}
                eventHandlers={{
                  click: () => onShipmentSelect && onShipmentSelect(shipment)
                }}
              >
                <Popup>
                  <div className="map-popup">
                    <h4>🚛 {shipment.trackingNumber}</h4>
                    <p><strong>Status:</strong> {shipment.status}</p>
                    <p><strong>Cargo:</strong> {shipment.cargo}</p>
                    <p><strong>From:</strong> {shipment.origin}</p>
                    <p><strong>To:</strong> {shipment.destination}</p>
                    {shipment.estimatedDelivery && (
                      <p><strong>ETA:</strong> {shipment.estimatedDelivery}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            </div>
          )
        })}
      </MapContainer>
    </div>
  )
}

export default ShipmentMap
