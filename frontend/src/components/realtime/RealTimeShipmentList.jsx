import { useState, useEffect } from 'react'
import { useSocket } from '../../contexts/SocketContext'
import { Package, MapPin, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function RealTimeShipmentList() {
  const { socket, isConnected } = useSocket()
  const [shipments, setShipments] = useState([])
  const [recentUpdates, setRecentUpdates] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (socket && isConnected) {
      setupRealTimeListeners()
      loadInitialShipments()
    }
  }, [socket, isConnected])

  const setupRealTimeListeners = () => {
    // Listen for new shipments
    socket.on('shipment:created', (data) => {
      console.log('New shipment created:', data)
      const newShipment = {
        _id: Date.now().toString(),
        trackingNumber: data.trackingNumber,
        status: data.status || 'Pending',
        origin: data.origin,
        destination: data.destination,
        cargo: data.cargo || 'General Cargo',
        weight: data.weight || '500 kg',
        estimatedDelivery: data.estimatedDelivery || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isNew: true // Flag for highlighting
      }

      setShipments(prev => [newShipment, ...prev])
      addRecentUpdate({
        id: Date.now(),
        type: 'created',
        trackingNumber: data.trackingNumber,
        message: `New shipment created: ${data.trackingNumber}`,
        timestamp: new Date()
      })

      // Remove the "new" flag after animation
      setTimeout(() => {
        setShipments(prev => 
          prev.map(s => s._id === newShipment._id ? { ...s, isNew: false } : s)
        )
      }, 3000)
    })

    // Listen for shipment updates
    socket.on('shipment:updated', (data) => {
      console.log('Shipment updated:', data)
      setShipments(prev => 
        prev.map(shipment => 
          shipment.trackingNumber === data.trackingNumber
            ? { 
                ...shipment, 
                status: data.status,
                location: data.location,
                estimatedDelivery: data.estimatedDelivery || shipment.estimatedDelivery,
                updatedAt: new Date().toISOString(),
                isUpdated: true
              }
            : shipment
        )
      )

      addRecentUpdate({
        id: Date.now(),
        type: 'updated',
        trackingNumber: data.trackingNumber,
        message: `Status updated to ${data.status}`,
        timestamp: new Date()
      })

      // Remove the "updated" flag after animation
      setTimeout(() => {
        setShipments(prev => 
          prev.map(s => s.trackingNumber === data.trackingNumber ? { ...s, isUpdated: false } : s)
        )
      }, 3000)
    })

    // Listen for deliveries
    socket.on('shipment:delivered', (data) => {
      console.log('Shipment delivered:', data)
      setShipments(prev => 
        prev.map(shipment => 
          shipment.trackingNumber === data.trackingNumber
            ? { 
                ...shipment, 
                status: 'Delivered',
                deliveredAt: data.deliveryTime || new Date().toISOString(),
                recipient: data.recipient,
                updatedAt: new Date().toISOString(),
                isDelivered: true
              }
            : shipment
        )
      )

      addRecentUpdate({
        id: Date.now(),
        type: 'delivered',
        trackingNumber: data.trackingNumber,
        message: `Delivered successfully`,
        timestamp: new Date()
      })

      // Remove the "delivered" flag after animation
      setTimeout(() => {
        setShipments(prev => 
          prev.map(s => s.trackingNumber === data.trackingNumber ? { ...s, isDelivered: false } : s)
        )
      }, 3000)
    })

    // Listen for delays
    socket.on('shipment:delayed', (data) => {
      console.log('Shipment delayed:', data)
      setShipments(prev => 
        prev.map(shipment => 
          shipment.trackingNumber === data.trackingNumber
            ? { 
                ...shipment, 
                status: 'Delayed',
                delayReason: data.reason,
                estimatedDelivery: data.newEstimatedDelivery || shipment.estimatedDelivery,
                updatedAt: new Date().toISOString(),
                isDelayed: true
              }
            : shipment
        )
      )

      addRecentUpdate({
        id: Date.now(),
        type: 'delayed',
        trackingNumber: data.trackingNumber,
        message: `Delayed: ${data.reason}`,
        timestamp: new Date()
      })

      // Remove the "delayed" flag after animation
      setTimeout(() => {
        setShipments(prev => 
          prev.map(s => s.trackingNumber === data.trackingNumber ? { ...s, isDelayed: false } : s)
        )
      }, 3000)
    })
  }

  const loadInitialShipments = () => {
    // Simulate loading initial shipments
    setTimeout(() => {
      const mockShipments = [
        {
          _id: '1',
          trackingNumber: 'CST001',
          status: 'In Transit',
          origin: 'New York, USA',
          destination: 'London, UK',
          cargo: 'Electronics',
          weight: '500 kg',
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '2',
          trackingNumber: 'CST002',
          status: 'Pending',
          origin: 'Shanghai, China',
          destination: 'Los Angeles, USA',
          cargo: 'Textiles',
          weight: '1200 kg',
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          _id: '3',
          trackingNumber: 'CST003',
          status: 'Delivered',
          origin: 'Tokyo, Japan',
          destination: 'Sydney, Australia',
          cargo: 'Machinery',
          weight: '2500 kg',
          estimatedDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      setShipments(mockShipments)
      setIsLoading(false)
    }, 1000)
  }

  const addRecentUpdate = (update) => {
    setRecentUpdates(prev => [update, ...prev.slice(0, 4)]) // Keep last 5 updates
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle size={16} className="status-icon delivered" />
      case 'In Transit':
        return <TrendingUp size={16} className="status-icon in-transit" />
      case 'Delayed':
        return <AlertTriangle size={16} className="status-icon delayed" />
      case 'Pending':
        return <Clock size={16} className="status-icon pending" />
      default:
        return <Package size={16} className="status-icon default" />
    }
  }

  const getStatusClass = (status) => {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now - time) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return time.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="realtime-shipments loading">
        <div className="loading-spinner">
          <Package size={32} className="loading-icon" />
          <p>Loading real-time shipments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="realtime-shipments">
      <div className="shipments-header">
        <h3>
          <Package size={20} />
          Live Shipment Updates
        </h3>
        <div className="connection-indicator">
          <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
          <span>{isConnected ? 'Live' : 'Offline'}</span>
        </div>
      </div>

      {recentUpdates.length > 0 && (
        <div className="recent-updates">
          <h4>Recent Updates</h4>
          <div className="updates-list">
            {recentUpdates.map(update => (
              <div key={update.id} className={`update-item update-${update.type}`}>
                <span className="update-message">{update.message}</span>
                <span className="update-time">{formatTime(update.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="shipments-list">
        {shipments.map(shipment => (
          <div 
            key={shipment._id} 
            className={`shipment-card ${shipment.isNew ? 'new-shipment' : ''} ${shipment.isUpdated ? 'updated-shipment' : ''} ${shipment.isDelivered ? 'delivered-shipment' : ''} ${shipment.isDelayed ? 'delayed-shipment' : ''}`}
          >
            <div className="shipment-header">
              <div className="tracking-info">
                <h4>{shipment.trackingNumber}</h4>
                <div className={`status-badge ${getStatusClass(shipment.status)}`}>
                  {getStatusIcon(shipment.status)}
                  <span>{shipment.status}</span>
                </div>
              </div>
              <div className="shipment-meta">
                <span className="last-updated">
                  Updated {formatTime(shipment.updatedAt)}
                </span>
              </div>
            </div>

            <div className="shipment-route">
              <div className="route-point">
                <MapPin size={14} />
                <span>{shipment.origin}</span>
              </div>
              <div className="route-arrow">→</div>
              <div className="route-point">
                <MapPin size={14} />
                <span>{shipment.destination}</span>
              </div>
            </div>

            <div className="shipment-details">
              <div className="detail-item">
                <span className="label">Cargo:</span>
                <span className="value">{shipment.cargo}</span>
              </div>
              <div className="detail-item">
                <span className="label">Weight:</span>
                <span className="value">{shipment.weight}</span>
              </div>
              <div className="detail-item">
                <span className="label">
                  {shipment.status === 'Delivered' ? 'Delivered:' : 'ETA:'}
                </span>
                <span className="value">
                  {formatDate(shipment.deliveredAt || shipment.estimatedDelivery)}
                </span>
              </div>
            </div>

            {shipment.delayReason && (
              <div className="delay-notice">
                <AlertTriangle size={14} />
                <span>Delayed: {shipment.delayReason}</span>
              </div>
            )}

            {shipment.recipient && (
              <div className="delivery-info">
                <CheckCircle size={14} />
                <span>Delivered to: {shipment.recipient}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default RealTimeShipmentList
