import { useState, useRef, useEffect } from 'react'
import { Bell, X, Check, CheckCheck, Trash2, Settings } from 'lucide-react'
import { useSocket } from '../../contexts/SocketContext'

function NotificationCenter() {
  const { notifications, unreadCount, markNotificationAsRead, markAllAsRead, clearNotifications } = useSocket()
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState('all') // all, unread, shipments, system
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'shipment_created':
        return '📦'
      case 'shipment_updated':
        return '🔄'
      case 'shipment_delivered':
        return '✅'
      case 'system_alert':
        return '⚠️'
      case 'user_mention':
        return '👤'
      default:
        return '🔔'
    }
  }

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return 'notification-high'
    if (priority === 'medium') return 'notification-medium'
    
    switch (type) {
      case 'shipment_delivered':
        return 'notification-success'
      case 'system_alert':
        return 'notification-warning'
      case 'shipment_created':
        return 'notification-info'
      default:
        return 'notification-default'
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read
    if (filter === 'shipments') return notification.type.startsWith('shipment')
    if (filter === 'system') return notification.type.startsWith('system')
    return true
  })

  const formatTime = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now - time) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return time.toLocaleDateString()
  }

  return (
    <div className="notification-center" ref={dropdownRef}>
      <button 
        className={`notification-bell ${unreadCount > 0 ? 'has-notifications' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="action-btn"
                  title="Mark all as read"
                >
                  <CheckCheck size={16} />
                </button>
              )}
              <button 
                onClick={clearNotifications}
                className="action-btn"
                title="Clear all"
              >
                <Trash2 size={16} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="action-btn"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="notification-filters">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({notifications.filter(n => !n.read).length})
            </button>
            <button 
              className={`filter-btn ${filter === 'shipments' ? 'active' : ''}`}
              onClick={() => setFilter('shipments')}
            >
              Shipments
            </button>
            <button 
              className={`filter-btn ${filter === 'system' ? 'active' : ''}`}
              onClick={() => setFilter('system')}
            >
              System
            </button>
          </div>

          <div className="notification-list">
            {filteredNotifications.length === 0 ? (
              <div className="notification-empty">
                <Bell size={48} />
                <p>No notifications</p>
                <span>You're all caught up!</span>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''} ${getNotificationColor(notification.type, notification.priority)}`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                      {!notification.read && <span className="unread-dot"></span>}
                    </div>
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-time">
                      {formatTime(notification.timestamp)}
                    </div>
                  </div>
                  {!notification.read && (
                    <button 
                      className="mark-read-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        markNotificationAsRead(notification.id)
                      }}
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {filteredNotifications.length > 0 && (
            <div className="notification-footer">
              <button className="view-all-btn">
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationCenter
