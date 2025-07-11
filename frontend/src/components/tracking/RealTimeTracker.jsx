import { useState, useEffect, useRef } from 'react'
import { MapPin, Clock, Truck, Package, AlertTriangle, Navigation } from 'lucide-react'

function RealTimeTracker({ shipment, onLocationUpdate }) {
  const [currentLocation, setCurrentLocation] = useState(null)
  const [trackingHistory, setTrackingHistory] = useState([])
  const [isTracking, setIsTracking] = useState(false)
  const [speed, setSpeed] = useState(0)
  const [estimatedArrival, setEstimatedArrival] = useState(null)
  const intervalRef = useRef(null)

  // Sample tracking data for simulation
  const sampleLocations = [
    { lat: 40.7128, lng: -74.0060, name: 'New York Port', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) },
    { lat: 41.8781, lng: -87.6298, name: 'Chicago Hub', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
    { lat: 39.7392, lng: -104.9903, name: 'Denver Distribution', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { lat: 37.7749, lng: -122.4194, name: 'San Francisco Bay', timestamp: new Date() }
  ]

  // Initialize tracking
  useEffect(() => {
    if (shipment) {
      initializeTracking()
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [shipment])

  const initializeTracking = () => {
    // Set initial location based on shipment status
    const initialLocation = getInitialLocation()
    setCurrentLocation(initialLocation)
    
    // Generate tracking history
    generateTrackingHistory()
    
    // Start real-time simulation if shipment is in transit
    if (shipment.status === 'In Transit') {
      startRealTimeTracking()
    }
  }

  const getInitialLocation = () => {
    const cityCoordinates = {
      // USA
      'New York, USA': { lat: 40.7128, lng: -74.0060, name: 'New York Port' },
      'Los Angeles, USA': { lat: 34.0522, lng: -118.2437, name: 'LA Port' },
      'Miami, USA': { lat: 25.7617, lng: -80.1918, name: 'Miami Port' },
      'Seattle, USA': { lat: 47.6062, lng: -122.3321, name: 'Seattle Port' },
      'Houston, USA': { lat: 29.7604, lng: -95.3698, name: 'Houston Port' },

      // India - Major ports and cities
      'Mumbai, India': { lat: 19.0760, lng: 72.8777, name: 'Mumbai Port' },
      'Chennai, India': { lat: 13.0827, lng: 80.2707, name: 'Chennai Port' },
      'Kolkata, India': { lat: 22.5726, lng: 88.3639, name: 'Kolkata Port' },
      'Bangalore, India': { lat: 12.9716, lng: 77.5946, name: 'Bangalore Hub' },
      'Delhi, India': { lat: 28.7041, lng: 77.1025, name: 'Delhi Gateway' },
      'Pune, India': { lat: 18.5204, lng: 73.8567, name: 'Pune Center' },
      'Hyderabad, India': { lat: 17.3850, lng: 78.4867, name: 'Hyderabad Hub' },
      'Kochi, India': { lat: 9.9312, lng: 76.2673, name: 'Kochi Port' },
      'Visakhapatnam, India': { lat: 17.6868, lng: 83.2185, name: 'Vizag Port' },
      'Ahmedabad, India': { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad Hub' },
      'Kandla, India': { lat: 23.0333, lng: 70.2167, name: 'Kandla Port' },
      'Tuticorin, India': { lat: 8.7642, lng: 78.1348, name: 'Tuticorin Port' },

      // China
      'Shanghai, China': { lat: 31.2304, lng: 121.4737, name: 'Shanghai Port' },
      'Shenzhen, China': { lat: 22.5431, lng: 114.0579, name: 'Shenzhen Port' },
      'Guangzhou, China': { lat: 23.1291, lng: 113.2644, name: 'Guangzhou Port' },
      'Beijing, China': { lat: 39.9042, lng: 116.4074, name: 'Beijing Hub' },
      'Tianjin, China': { lat: 39.3434, lng: 117.3616, name: 'Tianjin Port' },

      // Europe
      'London, UK': { lat: 51.5074, lng: -0.1278, name: 'London Gateway' },
      'Hamburg, Germany': { lat: 53.5511, lng: 9.9937, name: 'Hamburg Port' },
      'Rotterdam, Netherlands': { lat: 51.9244, lng: 4.4777, name: 'Rotterdam Port' },
      'Antwerp, Belgium': { lat: 51.2194, lng: 4.4025, name: 'Antwerp Port' },
      'Le Havre, France': { lat: 49.4944, lng: 0.1079, name: 'Le Havre Port' },
      'Felixstowe, UK': { lat: 51.9642, lng: 1.3518, name: 'Felixstowe Port' },
      'Frankfurt, Germany': { lat: 50.1109, lng: 8.6821, name: 'Frankfurt Hub' },

      // Middle East
      'Dubai, UAE': { lat: 25.2048, lng: 55.2708, name: 'Dubai Port' },
      'Jeddah, Saudi Arabia': { lat: 21.4858, lng: 39.1925, name: 'Jeddah Port' },
      'Kuwait City, Kuwait': { lat: 29.3759, lng: 47.9774, name: 'Kuwait Port' },

      // Southeast Asia
      'Singapore': { lat: 1.3521, lng: 103.8198, name: 'Singapore Port' },
      'Bangkok, Thailand': { lat: 13.7563, lng: 100.5018, name: 'Bangkok Port' },
      'Ho Chi Minh City, Vietnam': { lat: 10.8231, lng: 106.6297, name: 'HCMC Port' },
      'Jakarta, Indonesia': { lat: -6.2088, lng: 106.8456, name: 'Jakarta Port' },
      'Manila, Philippines': { lat: 14.5995, lng: 120.9842, name: 'Manila Port' },

      // East Asia
      'Tokyo, Japan': { lat: 35.6762, lng: 139.6503, name: 'Tokyo Bay' },
      'Busan, South Korea': { lat: 35.1796, lng: 129.0756, name: 'Busan Port' },

      // Africa
      'Cape Town, South Africa': { lat: -33.9249, lng: 18.4241, name: 'Cape Town Port' },
      'Lagos, Nigeria': { lat: 6.5244, lng: 3.3792, name: 'Lagos Port' },
      'Alexandria, Egypt': { lat: 31.2001, lng: 29.9187, name: 'Alexandria Port' },
      'Casablanca, Morocco': { lat: 33.5731, lng: -7.5898, name: 'Casablanca Port' },

      // South America
      'São Paulo, Brazil': { lat: -23.5505, lng: -46.6333, name: 'Santos Port' },
      'Buenos Aires, Argentina': { lat: -34.6118, lng: -58.3960, name: 'Buenos Aires Port' },
      'Valparaíso, Chile': { lat: -33.0472, lng: -71.6127, name: 'Valparaíso Port' },

      // Australia/Oceania
      'Sydney, Australia': { lat: -33.8688, lng: 151.2093, name: 'Sydney Harbor' },
      'Melbourne, Australia': { lat: -37.8136, lng: 144.9631, name: 'Melbourne Port' },
      'Perth, Australia': { lat: -31.9505, lng: 115.8605, name: 'Perth Port' },

      // South Asia
      'Karachi, Pakistan': { lat: 24.8607, lng: 67.0011, name: 'Karachi Port' },
      'Colombo, Sri Lanka': { lat: 6.9271, lng: 79.8612, name: 'Colombo Port' }
    }

    const origin = cityCoordinates[shipment.origin]
    const destination = cityCoordinates[shipment.destination]

    if (!origin || !destination) return null

    // Calculate current position based on status
    let progress = 0
    switch (shipment.status) {
      case 'Pending':
        progress = 0
        break
      case 'In Transit':
        progress = 0.6
        break
      case 'Delivered':
        progress = 1
        break
      case 'Delayed':
        progress = 0.4
        break
      default:
        progress = 0.5
    }

    const lat = origin.lat + (destination.lat - origin.lat) * progress
    const lng = origin.lng + (destination.lng - origin.lng) * progress

    return {
      lat,
      lng,
      name: progress === 0 ? origin.name : progress === 1 ? destination.name : 'En Route',
      timestamp: new Date(),
      speed: shipment.status === 'In Transit' ? Math.floor(Math.random() * 30) + 40 : 0
    }
  }

  const generateTrackingHistory = () => {
    const history = []
    const now = new Date()
    
    // Generate historical tracking points
    for (let i = 0; i < 5; i++) {
      const timestamp = new Date(now.getTime() - (5 - i) * 2 * 60 * 60 * 1000) // 2 hours apart
      history.push({
        id: i,
        timestamp,
        location: sampleLocations[i] || sampleLocations[sampleLocations.length - 1],
        event: getTrackingEvent(i),
        status: i === 0 ? 'Departed' : i === 4 ? 'Arrived' : 'In Transit'
      })
    }
    
    setTrackingHistory(history)
  }

  const getTrackingEvent = (index) => {
    const events = [
      'Package picked up from origin',
      'Departed from origin facility',
      'In transit to destination',
      'Arrived at destination facility',
      'Out for delivery'
    ]
    return events[index] || 'Location update'
  }

  const startRealTimeTracking = () => {
    setIsTracking(true)
    
    intervalRef.current = setInterval(() => {
      updateLocation()
    }, 5000) // Update every 5 seconds for demo
  }

  const updateLocation = () => {
    setCurrentLocation(prev => {
      if (!prev) return prev

      // Simulate movement (small random changes)
      const newLat = prev.lat + (Math.random() - 0.5) * 0.01
      const newLng = prev.lng + (Math.random() - 0.5) * 0.01
      const newSpeed = Math.floor(Math.random() * 20) + 50

      const newLocation = {
        lat: newLat,
        lng: newLng,
        name: 'En Route',
        timestamp: new Date(),
        speed: newSpeed
      }

      setSpeed(newSpeed)
      
      // Calculate estimated arrival (simplified)
      const arrivalTime = new Date(Date.now() + Math.random() * 4 * 60 * 60 * 1000) // 0-4 hours
      setEstimatedArrival(arrivalTime)

      // Notify parent component
      if (onLocationUpdate) {
        onLocationUpdate(newLocation)
      }

      return newLocation
    })
  }

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (timestamp) => {
    return timestamp.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (!shipment || !currentLocation) {
    return (
      <div className="real-time-tracker">
        <div className="tracker-header">
          <h3>📍 Real-time Tracking</h3>
        </div>
        <div className="tracker-empty">
          <Package size={48} />
          <p>No tracking data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="real-time-tracker">
      <div className="tracker-header">
        <h3>📍 Real-time Tracking</h3>
        <div className="tracking-status">
          {isTracking ? (
            <span className="status-live">
              <div className="live-indicator"></div>
              Live
            </span>
          ) : (
            <span className="status-static">Static</span>
          )}
        </div>
      </div>

      {/* Current Location */}
      <div className="current-location">
        <div className="location-header">
          <h4>🚛 Current Location</h4>
          <span className="last-update">
            Updated {formatTime(currentLocation.timestamp)}
          </span>
        </div>
        
        <div className="location-details">
          <div className="location-info">
            <MapPin size={20} />
            <div>
              <div className="location-name">{currentLocation.name}</div>
              <div className="coordinates">
                {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
              </div>
            </div>
          </div>
          
          {speed > 0 && (
            <div className="speed-info">
              <Truck size={20} />
              <div>
                <div className="speed-value">{speed} km/h</div>
                <div className="speed-label">Current Speed</div>
              </div>
            </div>
          )}
        </div>

        {estimatedArrival && (
          <div className="eta-info">
            <Clock size={20} />
            <div>
              <div className="eta-time">
                {formatTime(estimatedArrival)} - {formatDate(estimatedArrival)}
              </div>
              <div className="eta-label">Estimated Arrival</div>
            </div>
          </div>
        )}
      </div>

      {/* Tracking History */}
      <div className="tracking-history">
        <h4>📋 Tracking History</h4>
        <div className="history-timeline">
          {trackingHistory.map((entry, index) => (
            <div key={entry.id} className={`timeline-item ${index === 0 ? 'current' : ''}`}>
              <div className="timeline-marker">
                <div className="marker-dot"></div>
                {index < trackingHistory.length - 1 && <div className="marker-line"></div>}
              </div>
              
              <div className="timeline-content">
                <div className="timeline-header">
                  <span className="timeline-status">{entry.status}</span>
                  <span className="timeline-time">
                    {formatTime(entry.timestamp)} - {formatDate(entry.timestamp)}
                  </span>
                </div>
                
                <div className="timeline-location">
                  <MapPin size={16} />
                  {entry.location.name}
                </div>
                
                <div className="timeline-event">
                  {entry.event}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="tracker-actions">
        <button 
          className="btn btn-secondary"
          onClick={() => setIsTracking(!isTracking)}
        >
          <Navigation size={16} />
          {isTracking ? 'Stop Tracking' : 'Start Tracking'}
        </button>
        
        <button className="btn btn-primary">
          <AlertTriangle size={16} />
          Report Issue
        </button>
      </div>
    </div>
  )
}

export default RealTimeTracker
