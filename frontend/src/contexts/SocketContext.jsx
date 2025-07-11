import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'
import emailService, {
  sendShipmentCreatedEmail,
  sendShipmentDeliveredEmail,
  sendShipmentDelayedEmail,
  sendSystemAlertEmail
} from '../services/emailService'

// Create Socket Context
const SocketContext = createContext()

// Socket Provider Component
export const SocketProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const socketRef = useRef(null)

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize email service with user preferences
      emailService.initialize({
        email: user.email,
        notifications: user.preferences?.notifications || {
          email: true,
          shipmentCreated: true,
          shipmentDelivered: true,
          shipmentDelayed: true,
          systemAlerts: true
        }
      })

      initializeSocket()
    } else {
      disconnectSocket()
    }

    return () => {
      disconnectSocket()
    }
  }, [isAuthenticated, user])

  const initializeSocket = () => {
    try {
      // For now, we'll simulate socket connection since backend has issues
      // In production, this would be: io(process.env.REACT_APP_SOCKET_URL)
      
      console.log('Initializing socket connection...')
      
      // Mock socket object for demonstration
      const mockSocket = {
        connected: true,
        id: `mock-socket-${Date.now()}`,
        emit: (event, data) => {
          console.log(`Socket emit: ${event}`, data)
        },
        on: (event, callback) => {
          console.log(`Socket listening for: ${event}`)
          // Store listeners for mock events
          if (!mockSocket._listeners) mockSocket._listeners = {}
          if (!mockSocket._listeners[event]) mockSocket._listeners[event] = []
          mockSocket._listeners[event].push(callback)
        },
        off: (event, callback) => {
          console.log(`Socket removing listener for: ${event}`)
          if (mockSocket._listeners && mockSocket._listeners[event]) {
            mockSocket._listeners[event] = mockSocket._listeners[event].filter(cb => cb !== callback)
          }
        },
        disconnect: () => {
          console.log('Socket disconnected')
          mockSocket.connected = false
        }
      }

      socketRef.current = mockSocket
      setSocket(mockSocket)
      setIsConnected(true)

      // Setup event listeners
      setupSocketListeners(mockSocket)

      // Simulate connection success
      setTimeout(() => {
        toast.success('Connected to real-time updates', {
          icon: '🔗',
          duration: 3000
        })
      }, 1000)

      // Simulate some real-time events for demo
      simulateRealTimeEvents(mockSocket)

    } catch (error) {
      console.error('Socket connection error:', error)
      toast.error('Failed to connect to real-time updates')
    }
  }

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setSocket(null)
      setIsConnected(false)
    }
  }

  const setupSocketListeners = (socket) => {
    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      setIsConnected(true)
      toast.success('Real-time connection established')
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
      toast.error('Real-time connection lost')
    })

    // Shipment events
    socket.on('shipment:created', async (data) => {
      console.log('New shipment created:', data)
      addNotification({
        id: Date.now(),
        type: 'shipment_created',
        title: 'New Shipment Created',
        message: `Shipment ${data.trackingNumber} has been created`,
        timestamp: new Date(),
        data
      })
      toast.success(`New shipment created: ${data.trackingNumber}`)

      // Send email notification
      try {
        await sendShipmentCreatedEmail(data)
      } catch (error) {
        console.error('Failed to send shipment created email:', error)
      }
    })

    socket.on('shipment:updated', (data) => {
      console.log('Shipment updated:', data)
      addNotification({
        id: Date.now(),
        type: 'shipment_updated',
        title: 'Shipment Updated',
        message: `Shipment ${data.trackingNumber} status changed to ${data.status}`,
        timestamp: new Date(),
        data
      })
      toast.info(`Shipment ${data.trackingNumber} updated`)
    })

    socket.on('shipment:delivered', async (data) => {
      console.log('Shipment delivered:', data)
      addNotification({
        id: Date.now(),
        type: 'shipment_delivered',
        title: 'Shipment Delivered',
        message: `Shipment ${data.trackingNumber} has been delivered`,
        timestamp: new Date(),
        data
      })
      toast.success(`📦 Shipment ${data.trackingNumber} delivered!`)

      // Send email notification
      try {
        await sendShipmentDeliveredEmail(data)
      } catch (error) {
        console.error('Failed to send shipment delivered email:', error)
      }
    })

    // System events
    socket.on('system:alert', async (data) => {
      console.log('System alert:', data)
      addNotification({
        id: Date.now(),
        type: 'system_alert',
        title: 'System Alert',
        message: data.message,
        timestamp: new Date(),
        priority: data.priority || 'medium',
        data
      })

      if (data.priority === 'high') {
        toast.error(data.message, { duration: 5000 })
      } else {
        toast(data.message, { icon: '⚠️' })
      }

      // Send email notification for high priority alerts
      if (data.priority === 'high') {
        try {
          await sendSystemAlertEmail({
            ...data,
            alertType: 'High Priority System Alert',
            timestamp: new Date().toISOString()
          })
        } catch (error) {
          console.error('Failed to send system alert email:', error)
        }
      }
    })

    // User events
    socket.on('user:mention', (data) => {
      console.log('User mentioned:', data)
      addNotification({
        id: Date.now(),
        type: 'user_mention',
        title: 'You were mentioned',
        message: data.message,
        timestamp: new Date(),
        data
      })
      toast(`You were mentioned: ${data.message}`, { icon: '👤' })
    })
  }

  const simulateRealTimeEvents = (socket) => {
    // Simulate some events for demo purposes
    setTimeout(() => {
      if (socket._listeners && socket._listeners['shipment:created']) {
        socket._listeners['shipment:created'].forEach(callback => {
          callback({
            trackingNumber: 'CST' + Math.floor(Math.random() * 1000),
            status: 'Pending',
            origin: 'New York, USA',
            destination: 'London, UK'
          })
        })
      }
    }, 5000)

    setTimeout(() => {
      if (socket._listeners && socket._listeners['system:alert']) {
        socket._listeners['system:alert'].forEach(callback => {
          callback({
            message: 'System maintenance scheduled for tonight at 2 AM',
            priority: 'medium'
          })
        })
      }
    }, 10000)
  }

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50)) // Keep last 50 notifications
    setUnreadCount(prev => prev + 1)
  }

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
    setUnreadCount(0)
  }

  const clearNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  // Emit events
  const emitEvent = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data)
    } else {
      console.warn('Socket not connected, cannot emit event:', event)
    }
  }

  // Join room (for role-based notifications)
  const joinRoom = (room) => {
    if (socket && isConnected) {
      socket.emit('join:room', { room, user: user.id })
      console.log(`Joined room: ${room}`)
    }
  }

  // Leave room
  const leaveRoom = (room) => {
    if (socket && isConnected) {
      socket.emit('leave:room', { room, user: user.id })
      console.log(`Left room: ${room}`)
    }
  }

  const value = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    emitEvent,
    joinRoom,
    leaveRoom,
    markNotificationAsRead,
    markAllAsRead,
    clearNotifications
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export default SocketContext
