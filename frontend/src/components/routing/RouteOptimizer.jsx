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

  // Comprehensive city coordinates database
  const cityCoordinates = {
    // USA
    'New York, USA': { lat: 40.7128, lng: -74.0060, name: 'New York, USA' },
    'Los Angeles, USA': { lat: 34.0522, lng: -118.2437, name: 'Los Angeles, USA' },
    'Miami, USA': { lat: 25.7617, lng: -80.1918, name: 'Miami, USA' },
    'Seattle, USA': { lat: 47.6062, lng: -122.3321, name: 'Seattle, USA' },
    'Houston, USA': { lat: 29.7604, lng: -95.3698, name: 'Houston, USA' },

    // India - Major ports and cities
    'Mumbai, India': { lat: 19.0760, lng: 72.8777, name: 'Mumbai, India' },
    'Chennai, India': { lat: 13.0827, lng: 80.2707, name: 'Chennai, India' },
    'Kolkata, India': { lat: 22.5726, lng: 88.3639, name: 'Kolkata, India' },
    'Bangalore, India': { lat: 12.9716, lng: 77.5946, name: 'Bangalore, India' },
    'Delhi, India': { lat: 28.7041, lng: 77.1025, name: 'Delhi, India' },
    'Pune, India': { lat: 18.5204, lng: 73.8567, name: 'Pune, India' },
    'Hyderabad, India': { lat: 17.3850, lng: 78.4867, name: 'Hyderabad, India' },
    'Kochi, India': { lat: 9.9312, lng: 76.2673, name: 'Kochi, India' },
    'Visakhapatnam, India': { lat: 17.6868, lng: 83.2185, name: 'Visakhapatnam, India' },
    'Ahmedabad, India': { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad, India' },
    'Kandla, India': { lat: 23.0333, lng: 70.2167, name: 'Kandla, India' },
    'Tuticorin, India': { lat: 8.7642, lng: 78.1348, name: 'Tuticorin, India' },

    // China
    'Shanghai, China': { lat: 31.2304, lng: 121.4737, name: 'Shanghai, China' },
    'Shenzhen, China': { lat: 22.5431, lng: 114.0579, name: 'Shenzhen, China' },
    'Guangzhou, China': { lat: 23.1291, lng: 113.2644, name: 'Guangzhou, China' },
    'Beijing, China': { lat: 39.9042, lng: 116.4074, name: 'Beijing, China' },
    'Tianjin, China': { lat: 39.3434, lng: 117.3616, name: 'Tianjin, China' },

    // Europe
    'London, UK': { lat: 51.5074, lng: -0.1278, name: 'London, UK' },
    'Hamburg, Germany': { lat: 53.5511, lng: 9.9937, name: 'Hamburg, Germany' },
    'Rotterdam, Netherlands': { lat: 51.9244, lng: 4.4777, name: 'Rotterdam, Netherlands' },
    'Antwerp, Belgium': { lat: 51.2194, lng: 4.4025, name: 'Antwerp, Belgium' },
    'Le Havre, France': { lat: 49.4944, lng: 0.1079, name: 'Le Havre, France' },
    'Felixstowe, UK': { lat: 51.9642, lng: 1.3518, name: 'Felixstowe, UK' },
    'Frankfurt, Germany': { lat: 50.1109, lng: 8.6821, name: 'Frankfurt, Germany' },

    // Middle East
    'Dubai, UAE': { lat: 25.2048, lng: 55.2708, name: 'Dubai, UAE' },
    'Jeddah, Saudi Arabia': { lat: 21.4858, lng: 39.1925, name: 'Jeddah, Saudi Arabia' },
    'Kuwait City, Kuwait': { lat: 29.3759, lng: 47.9774, name: 'Kuwait City, Kuwait' },

    // Southeast Asia
    'Singapore': { lat: 1.3521, lng: 103.8198, name: 'Singapore' },
    'Bangkok, Thailand': { lat: 13.7563, lng: 100.5018, name: 'Bangkok, Thailand' },
    'Ho Chi Minh City, Vietnam': { lat: 10.8231, lng: 106.6297, name: 'Ho Chi Minh City, Vietnam' },
    'Jakarta, Indonesia': { lat: -6.2088, lng: 106.8456, name: 'Jakarta, Indonesia' },
    'Manila, Philippines': { lat: 14.5995, lng: 120.9842, name: 'Manila, Philippines' },

    // East Asia
    'Tokyo, Japan': { lat: 35.6762, lng: 139.6503, name: 'Tokyo, Japan' },
    'Busan, South Korea': { lat: 35.1796, lng: 129.0756, name: 'Busan, South Korea' },

    // Africa
    'Cape Town, South Africa': { lat: -33.9249, lng: 18.4241, name: 'Cape Town, South Africa' },
    'Lagos, Nigeria': { lat: 6.5244, lng: 3.3792, name: 'Lagos, Nigeria' },
    'Alexandria, Egypt': { lat: 31.2001, lng: 29.9187, name: 'Alexandria, Egypt' },
    'Casablanca, Morocco': { lat: 33.5731, lng: -7.5898, name: 'Casablanca, Morocco' },

    // South America
    'São Paulo, Brazil': { lat: -23.5505, lng: -46.6333, name: 'São Paulo, Brazil' },
    'Buenos Aires, Argentina': { lat: -34.6118, lng: -58.3960, name: 'Buenos Aires, Argentina' },
    'Valparaíso, Chile': { lat: -33.0472, lng: -71.6127, name: 'Valparaíso, Chile' },

    // Australia/Oceania
    'Sydney, Australia': { lat: -33.8688, lng: 151.2093, name: 'Sydney, Australia' },
    'Melbourne, Australia': { lat: -37.8136, lng: 144.9631, name: 'Melbourne, Australia' },
    'Perth, Australia': { lat: -31.9505, lng: 115.8605, name: 'Perth, Australia' },

    // South Asia
    'Karachi, Pakistan': { lat: 24.8607, lng: 67.0011, name: 'Karachi, Pakistan' },
    'Colombo, Sri Lanka': { lat: 6.9271, lng: 79.8612, name: 'Colombo, Sri Lanka' },

    // Additional major hubs
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
