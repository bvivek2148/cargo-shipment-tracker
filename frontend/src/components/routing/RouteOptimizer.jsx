import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet'
import { Route, Navigation, MapPin, Clock, Truck, Fuel, DollarSign, Plus, X, RotateCcw } from 'lucide-react'
import L from 'leaflet'

// Route optimization algorithms
const RouteOptimizer = {
  // Simple nearest neighbor algorithm for TSP
  nearestNeighbor: (waypoints) => {
    if (waypoints.length <= 2) return waypoints
    
    const unvisited = [...waypoints.slice(1)] // Exclude starting point
    const route = [waypoints[0]] // Start with origin
    let current = waypoints[0]
    
    while (unvisited.length > 0) {
      let nearest = unvisited[0]
      let nearestIndex = 0
      let minDistance = calculateDistance(current, nearest)
      
      for (let i = 1; i < unvisited.length; i++) {
        const distance = calculateDistance(current, unvisited[i])
        if (distance < minDistance) {
          minDistance = distance
          nearest = unvisited[i]
          nearestIndex = i
        }
      }
      
      route.push(nearest)
      current = nearest
      unvisited.splice(nearestIndex, 1)
    }
    
    return route
  },
  
  // 2-opt optimization
  twoOpt: (route) => {
    let improved = true
    let bestRoute = [...route]
    
    while (improved) {
      improved = false
      
      for (let i = 1; i < route.length - 2; i++) {
        for (let j = i + 1; j < route.length; j++) {
          if (j - i === 1) continue
          
          const newRoute = [...route]
          // Reverse the segment between i and j
          const segment = newRoute.slice(i, j + 1).reverse()
          newRoute.splice(i, j - i + 1, ...segment)
          
          if (calculateTotalDistance(newRoute) < calculateTotalDistance(bestRoute)) {
            bestRoute = [...newRoute]
            improved = true
          }
        }
      }
      
      route = [...bestRoute]
    }
    
    return bestRoute
  }
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(point1, point2) {
  const R = 6371 // Earth's radius in km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180
  const dLon = (point2.lng - point1.lng) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function calculateTotalDistance(route) {
  let total = 0
  for (let i = 0; i < route.length - 1; i++) {
    total += calculateDistance(route[i], route[i + 1])
  }
  return total
}

function RouteOptimizerComponent({ shipment, onRouteUpdate }) {
  const [waypoints, setWaypoints] = useState([])
  const [optimizedRoute, setOptimizedRoute] = useState([])
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [routeStats, setRouteStats] = useState(null)
  const [optimizationMethod, setOptimizationMethod] = useState('nearestNeighbor')

  // City coordinates database
  const cityCoordinates = {
    'New York, USA': { lat: 40.7128, lng: -74.0060, name: 'New York, USA' },
    'London, UK': { lat: 51.5074, lng: -0.1278, name: 'London, UK' },
    'Shanghai, China': { lat: 31.2304, lng: 121.4737, name: 'Shanghai, China' },
    'Los Angeles, USA': { lat: 34.0522, lng: -118.2437, name: 'Los Angeles, USA' },
    'Tokyo, Japan': { lat: 35.6762, lng: 139.6503, name: 'Tokyo, Japan' },
    'Sydney, Australia': { lat: -33.8688, lng: 151.2093, name: 'Sydney, Australia' },
    'Hamburg, Germany': { lat: 53.5511, lng: 9.9937, name: 'Hamburg, Germany' },
    'Singapore': { lat: 1.3521, lng: 103.8198, name: 'Singapore' },
    'Dubai, UAE': { lat: 25.2048, lng: 55.2708, name: 'Dubai, UAE' },
    'Mumbai, India': { lat: 19.0760, lng: 72.8777, name: 'Mumbai, India' },
    'Rotterdam, Netherlands': { lat: 51.9244, lng: 4.4777, name: 'Rotterdam, Netherlands' },
    'Hong Kong': { lat: 22.3193, lng: 114.1694, name: 'Hong Kong' }
  }

  useEffect(() => {
    if (shipment) {
      initializeRoute()
    }
  }, [shipment])

  const initializeRoute = () => {
    const origin = cityCoordinates[shipment.origin]
    const destination = cityCoordinates[shipment.destination]
    
    if (origin && destination) {
      const initialWaypoints = [origin, destination]
      setWaypoints(initialWaypoints)
      setOptimizedRoute(initialWaypoints)
      calculateRouteStats(initialWaypoints)
    }
  }

  const addWaypoint = (cityName) => {
    const city = cityCoordinates[cityName]
    if (city && !waypoints.find(w => w.name === cityName)) {
      const newWaypoints = [...waypoints.slice(0, -1), city, waypoints[waypoints.length - 1]]
      setWaypoints(newWaypoints)
    }
  }

  const removeWaypoint = (index) => {
    if (index === 0 || index === waypoints.length - 1) return // Can't remove origin or destination
    const newWaypoints = waypoints.filter((_, i) => i !== index)
    setWaypoints(newWaypoints)
    setOptimizedRoute(newWaypoints)
    calculateRouteStats(newWaypoints)
  }

  const optimizeRoute = async () => {
    setIsOptimizing(true)
    
    // Simulate optimization delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    let optimized
    switch (optimizationMethod) {
      case 'nearestNeighbor':
        optimized = RouteOptimizer.nearestNeighbor(waypoints)
        break
      case 'twoOpt':
        const nearest = RouteOptimizer.nearestNeighbor(waypoints)
        optimized = RouteOptimizer.twoOpt(nearest)
        break
      default:
        optimized = waypoints
    }
    
    setOptimizedRoute(optimized)
    calculateRouteStats(optimized)
    setIsOptimizing(false)
    
    if (onRouteUpdate) {
      onRouteUpdate(optimized, routeStats)
    }
  }

  const calculateRouteStats = (route) => {
    const totalDistance = calculateTotalDistance(route)
    const estimatedTime = totalDistance / 50 // Assume 50 km/h average speed
    const fuelCost = totalDistance * 0.8 // $0.8 per km
    const estimatedCO2 = totalDistance * 2.3 // 2.3 kg CO2 per km
    
    setRouteStats({
      totalDistance: Math.round(totalDistance),
      estimatedTime: Math.round(estimatedTime * 10) / 10,
      fuelCost: Math.round(fuelCost),
      estimatedCO2: Math.round(estimatedCO2),
      waypoints: route.length
    })
  }

  const resetRoute = () => {
    initializeRoute()
  }

  if (!shipment) {
    return (
      <div className="route-optimizer">
        <div className="optimizer-header">
          <h3>🛣️ Route Optimizer</h3>
        </div>
        <div className="optimizer-empty">
          <Route size={48} />
          <p>Select a shipment to optimize its route</p>
        </div>
      </div>
    )
  }

  return (
    <div className="route-optimizer">
      <div className="optimizer-header">
        <h3>🛣️ Route Optimizer</h3>
        <div className="optimizer-controls">
          <select 
            value={optimizationMethod}
            onChange={(e) => setOptimizationMethod(e.target.value)}
            className="method-select"
          >
            <option value="nearestNeighbor">Nearest Neighbor</option>
            <option value="twoOpt">2-Opt Optimization</option>
          </select>
          
          <button 
            onClick={optimizeRoute}
            disabled={isOptimizing || waypoints.length < 3}
            className="btn btn-primary"
          >
            {isOptimizing ? (
              <>
                <Navigation size={16} className="spinning" />
                Optimizing...
              </>
            ) : (
              <>
                <Navigation size={16} />
                Optimize Route
              </>
            )}
          </button>
          
          <button onClick={resetRoute} className="btn btn-secondary">
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      {/* Waypoint Management */}
      <div className="waypoint-manager">
        <h4>📍 Waypoints</h4>
        <div className="waypoint-list">
          {waypoints.map((waypoint, index) => (
            <div key={index} className={`waypoint-item ${index === 0 ? 'origin' : index === waypoints.length - 1 ? 'destination' : 'waypoint'}`}>
              <div className="waypoint-info">
                <span className="waypoint-number">{index + 1}</span>
                <span className="waypoint-name">{waypoint.name}</span>
                <span className="waypoint-type">
                  {index === 0 ? 'Origin' : index === waypoints.length - 1 ? 'Destination' : 'Waypoint'}
                </span>
              </div>
              {index !== 0 && index !== waypoints.length - 1 && (
                <button 
                  onClick={() => removeWaypoint(index)}
                  className="remove-waypoint"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="add-waypoint">
          <select 
            onChange={(e) => {
              if (e.target.value) {
                addWaypoint(e.target.value)
                e.target.value = ''
              }
            }}
            className="waypoint-select"
          >
            <option value="">Add waypoint...</option>
            {Object.keys(cityCoordinates)
              .filter(city => !waypoints.find(w => w.name === city))
              .map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
          </select>
        </div>
      </div>

      {/* Route Statistics */}
      {routeStats && (
        <div className="route-stats">
          <h4>📊 Route Statistics</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <MapPin size={20} />
              <div>
                <span className="stat-value">{routeStats.totalDistance} km</span>
                <span className="stat-label">Total Distance</span>
              </div>
            </div>
            
            <div className="stat-item">
              <Clock size={20} />
              <div>
                <span className="stat-value">{routeStats.estimatedTime} hrs</span>
                <span className="stat-label">Estimated Time</span>
              </div>
            </div>
            
            <div className="stat-item">
              <DollarSign size={20} />
              <div>
                <span className="stat-value">${routeStats.fuelCost}</span>
                <span className="stat-label">Fuel Cost</span>
              </div>
            </div>
            
            <div className="stat-item">
              <Truck size={20} />
              <div>
                <span className="stat-value">{routeStats.estimatedCO2} kg</span>
                <span className="stat-label">CO₂ Emissions</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Route Map */}
      <div className="route-map">
        <MapContainer
          center={waypoints[0] ? [waypoints[0].lat, waypoints[0].lng] : [40.7128, -74.0060]}
          zoom={3}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Waypoint markers */}
          {optimizedRoute.map((waypoint, index) => (
            <Marker
              key={index}
              position={[waypoint.lat, waypoint.lng]}
              icon={L.divIcon({
                className: 'route-marker',
                html: `<div class="marker-number ${index === 0 ? 'origin' : index === optimizedRoute.length - 1 ? 'destination' : 'waypoint'}">${index + 1}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
              })}
            >
              <Popup>
                <div>
                  <h4>{waypoint.name}</h4>
                  <p>{index === 0 ? 'Origin' : index === optimizedRoute.length - 1 ? 'Destination' : `Waypoint ${index}`}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Route line */}
          {optimizedRoute.length > 1 && (
            <Polyline
              positions={optimizedRoute.map(wp => [wp.lat, wp.lng])}
              color="#3b82f6"
              weight={4}
              opacity={0.8}
            />
          )}
        </MapContainer>
      </div>
    </div>
  )
}

export default RouteOptimizerComponent
