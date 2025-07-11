import { useState, useEffect } from 'react'
import { useSocket } from '../../contexts/SocketContext'
import { Activity, TrendingUp, Package, Clock, AlertTriangle } from 'lucide-react'
import EventSimulator from './EventSimulator'

function RealTimeDashboard() {
  const { socket, isConnected, emitEvent } = useSocket()
  const [liveStats, setLiveStats] = useState({
    totalShipments: 0,
    activeShipments: 0,
    deliveredToday: 0,
    pendingShipments: 0,
    delayedShipments: 0,
    lastUpdate: new Date()
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (socket && isConnected) {
      setupRealTimeListeners()
      requestInitialData()
    }
  }, [socket, isConnected])

  const setupRealTimeListeners = () => {
    // Listen for real-time statistics updates
    socket.on('stats:update', (data) => {
      console.log('Received stats update:', data)
      setLiveStats(prev => ({
        ...prev,
        ...data,
        lastUpdate: new Date()
      }))
    })

    // Listen for shipment activity
    socket.on('activity:new', (activity) => {
      console.log('New activity:', activity)
      setRecentActivity(prev => [activity, ...prev.slice(0, 9)]) // Keep last 10 activities
    })

    // Listen for shipment events to update stats
    socket.on('shipment:created', (data) => {
      setLiveStats(prev => ({
        ...prev,
        totalShipments: prev.totalShipments + 1,
        activeShipments: prev.activeShipments + 1,
        lastUpdate: new Date()
      }))
      
      addActivity({
        id: Date.now(),
        type: 'shipment_created',
        message: `New shipment ${data.trackingNumber} created`,
        timestamp: new Date(),
        icon: '📦'
      })
    })

    socket.on('shipment:delivered', (data) => {
      setLiveStats(prev => ({
        ...prev,
        deliveredToday: prev.deliveredToday + 1,
        activeShipments: Math.max(0, prev.activeShipments - 1),
        lastUpdate: new Date()
      }))
      
      addActivity({
        id: Date.now(),
        type: 'shipment_delivered',
        message: `Shipment ${data.trackingNumber} delivered`,
        timestamp: new Date(),
        icon: '✅'
      })
    })

    socket.on('shipment:delayed', (data) => {
      setLiveStats(prev => ({
        ...prev,
        delayedShipments: prev.delayedShipments + 1,
        lastUpdate: new Date()
      }))
      
      addActivity({
        id: Date.now(),
        type: 'shipment_delayed',
        message: `Shipment ${data.trackingNumber} delayed`,
        timestamp: new Date(),
        icon: '⚠️'
      })
    })
  }

  const requestInitialData = () => {
    // Request initial dashboard data
    emitEvent('dashboard:subscribe', { userId: 'current-user' })
    
    // Simulate initial data for demo
    setTimeout(() => {
      setLiveStats({
        totalShipments: 156,
        activeShipments: 42,
        deliveredToday: 8,
        pendingShipments: 23,
        delayedShipments: 3,
        lastUpdate: new Date()
      })
      
      setRecentActivity([
        {
          id: 1,
          type: 'shipment_delivered',
          message: 'Shipment CST001 delivered to London, UK',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          icon: '✅'
        },
        {
          id: 2,
          type: 'shipment_created',
          message: 'New shipment CST156 created from Tokyo to Paris',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          icon: '📦'
        },
        {
          id: 3,
          type: 'shipment_updated',
          message: 'Shipment CST089 status updated to In Transit',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          icon: '🔄'
        }
      ])
      
      setIsLoading(false)
    }, 1000)
  }

  const addActivity = (activity) => {
    setRecentActivity(prev => [activity, ...prev.slice(0, 9)])
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

  const getActivityColor = (type) => {
    switch (type) {
      case 'shipment_delivered':
        return 'activity-success'
      case 'shipment_created':
        return 'activity-info'
      case 'shipment_delayed':
        return 'activity-warning'
      case 'shipment_updated':
        return 'activity-default'
      default:
        return 'activity-default'
    }
  }

  if (isLoading) {
    return (
      <div className="realtime-dashboard loading">
        <div className="loading-spinner">
          <Activity size={32} className="loading-icon" />
          <p>Loading real-time dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="realtime-dashboard">
      <div className="dashboard-header">
        <h2>
          <Activity size={24} />
          Real-time Dashboard
        </h2>
        <div className="last-update">
          Last updated: {formatTime(liveStats.lastUpdate)}
        </div>
      </div>

      <div className="live-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{liveStats.totalShipments}</div>
            <div className="stat-label">Total Shipments</div>
          </div>
          <div className="stat-trend positive">
            <TrendingUp size={16} />
            +12%
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{liveStats.activeShipments}</div>
            <div className="stat-label">Active Shipments</div>
          </div>
          <div className="stat-trend positive">
            <TrendingUp size={16} />
            +5%
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{liveStats.deliveredToday}</div>
            <div className="stat-label">Delivered Today</div>
          </div>
          <div className="stat-trend positive">
            <TrendingUp size={16} />
            +3
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{liveStats.pendingShipments}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{liveStats.delayedShipments}</div>
            <div className="stat-label">Delayed</div>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {recentActivity.length === 0 ? (
            <div className="activity-empty">
              <Activity size={32} />
              <p>No recent activity</p>
            </div>
          ) : (
            recentActivity.map(activity => (
              <div key={activity.id} className={`activity-item ${getActivityColor(activity.type)}`}>
                <div className="activity-icon">
                  {activity.icon}
                </div>
                <div className="activity-content">
                  <div className="activity-message">
                    {activity.message}
                  </div>
                  <div className="activity-time">
                    {formatTime(activity.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Event Simulator for Demo */}
      <EventSimulator />
    </div>
  )
}

export default RealTimeDashboard
