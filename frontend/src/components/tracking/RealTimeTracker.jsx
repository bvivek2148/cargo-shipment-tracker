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
      'New York, USA': { lat: 40.7128, lng: -74.0060, name: 'New York Port' },
      'London, UK': { lat: 51.5074, lng: -0.1278, name: 'London Gateway' },
      'Shanghai, China': { lat: 31.2304, lng: 121.4737, name: 'Shanghai Port' },
      'Los Angeles, USA': { lat: 34.0522, lng: -118.2437, name: 'LA Port' },
      'Tokyo, Japan': { lat: 35.6762, lng: 139.6503, name: 'Tokyo Bay' },
      'Sydney, Australia': { lat: -33.8688, lng: 151.2093, name: 'Sydney Harbor' }
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
