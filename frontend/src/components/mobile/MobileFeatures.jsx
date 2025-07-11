import { useState, useEffect } from 'react'
import { Bell, BellOff, Smartphone, Share, QrCode, Camera, Vibrate, Volume2 } from 'lucide-react'
import { usePWAInstall } from '../pwa/PWAManager'
import toast from 'react-hot-toast'

// Mobile-specific features for PWA
function MobileFeatures() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState('default')
  const [vibrationSupported, setVibrationSupported] = useState(false)
  const [shareSupported, setShareSupported] = useState(false)
  const [cameraSupported, setCameraSupported] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState({})
  const { isInstallable, isInstalled, install } = usePWAInstall()

  useEffect(() => {
    checkFeatureSupport()
    loadNotificationSettings()
    getDeviceInfo()
  }, [])

  const checkFeatureSupport = () => {
    // Check vibration support
    setVibrationSupported('vibrate' in navigator)
    
    // Check Web Share API support
    setShareSupported('share' in navigator)
    
    // Check camera/media support
    setCameraSupported('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices)
  }

  const loadNotificationSettings = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
      setNotificationsEnabled(Notification.permission === 'granted')
    }
  }

  const getDeviceInfo = () => {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
      touchSupported: 'ontouchstart' in window,
      standalone: window.matchMedia('(display-mode: standalone)').matches
    }
    
    setDeviceInfo(info)
  }

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications not supported on this device')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      
      if (permission === 'granted') {
        setNotificationsEnabled(true)
        toast.success('Notifications enabled!')
        
        // Subscribe to push notifications
        await subscribeToPushNotifications()
        
        // Show welcome notification
        showTestNotification()
      } else {
        setNotificationsEnabled(false)
        toast.error('Notification permission denied')
      }
    } catch (error) {
      console.error('Notification permission error:', error)
      toast.error('Failed to enable notifications')
    }
  }

  const subscribeToPushNotifications = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready
        
        // Check if already subscribed
        const existingSubscription = await registration.pushManager.getSubscription()
        if (existingSubscription) {
          console.log('Already subscribed to push notifications')
          return
        }

        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9LdNnC_NNPB6Pv6RgQoOhSzlfdJ3_QkSfHcFcsr31QWdFzAOGiA' // Demo VAPID key
          )
        })

        // Send subscription to server
        await sendSubscriptionToServer(subscription)
        
        console.log('Subscribed to push notifications:', subscription)
      } catch (error) {
        console.error('Push subscription failed:', error)
      }
    }
  }

  const sendSubscriptionToServer = async (subscription) => {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(subscription)
      })
    } catch (error) {
      console.error('Failed to send subscription to server:', error)
    }
  }

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const showTestNotification = () => {
    if (notificationsEnabled) {
      new Notification('Cargo Tracker', {
        body: 'Notifications are now enabled! You\'ll receive updates about your shipments.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'welcome',
        vibrate: [200, 100, 200]
      })
    }
  }

  const disableNotifications = async () => {
    setNotificationsEnabled(false)
    
    // Unsubscribe from push notifications
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        
        if (subscription) {
          await subscription.unsubscribe()
          console.log('Unsubscribed from push notifications')
        }
      } catch (error) {
        console.error('Failed to unsubscribe:', error)
      }
    }
    
    toast.success('Notifications disabled')
  }

  const shareApp = async () => {
    if (shareSupported) {
      try {
        await navigator.share({
          title: 'Cargo Shipment Tracker',
          text: 'Track your shipments in real-time with this professional cargo tracking app',
          url: window.location.origin
        })
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error)
          fallbackShare()
        }
      }
    } else {
      fallbackShare()
    }
  }

  const fallbackShare = () => {
    // Copy URL to clipboard
    navigator.clipboard.writeText(window.location.origin)
      .then(() => {
        toast.success('App URL copied to clipboard!')
      })
      .catch(() => {
        toast.error('Failed to copy URL')
      })
  }

  const testVibration = () => {
    if (vibrationSupported) {
      navigator.vibrate([200, 100, 200, 100, 200])
      toast.success('Vibration test completed')
    } else {
      toast.error('Vibration not supported on this device')
    }
  }

  const generateQRCode = () => {
    // In a real implementation, this would generate a QR code
    // For demo, we'll show a placeholder
    toast.success('QR code feature would generate a code for easy sharing')
  }

  const testCamera = async () => {
    if (!cameraSupported) {
      toast.error('Camera not supported on this device')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera
      })
      
      // Stop the stream immediately (just testing access)
      stream.getTracks().forEach(track => track.stop())
      
      toast.success('Camera access granted! Ready for QR code scanning.')
    } catch (error) {
      console.error('Camera access failed:', error)
      toast.error('Camera access denied or not available')
    }
  }

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
  }

  const isAndroid = () => {
    return /Android/.test(navigator.userAgent)
  }

  return (
    <div className="mobile-features">
      <div className="features-header">
        <h3>📱 Mobile Features</h3>
        <p>Enhance your mobile experience with these features</p>
      </div>

      {/* Device Information */}
      <div className="device-info">
        <h4>📊 Device Information</h4>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Platform:</span>
            <span className="info-value">
              {isIOS() ? '🍎 iOS' : isAndroid() ? '🤖 Android' : '💻 Desktop'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Screen:</span>
            <span className="info-value">
              {deviceInfo.screenWidth}×{deviceInfo.screenHeight}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Viewport:</span>
            <span className="info-value">
              {deviceInfo.viewportWidth}×{deviceInfo.viewportHeight}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Touch:</span>
            <span className="info-value">
              {deviceInfo.touchSupported ? '✅ Supported' : '❌ Not supported'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">PWA Mode:</span>
            <span className="info-value">
              {deviceInfo.standalone ? '✅ Standalone' : '❌ Browser'}
            </span>
          </div>
        </div>
      </div>

      {/* PWA Installation */}
      {!isInstalled && (
        <div className="pwa-install">
          <h4>📲 Install App</h4>
          <p>Install the app for the best mobile experience</p>
          
          {isInstallable ? (
            <button onClick={install} className="btn btn-primary">
              <Smartphone size={16} />
              Install App
            </button>
          ) : (
            <div className="install-instructions">
              {isIOS() && (
                <p>
                  On iOS: Tap the share button <Share size={14} /> and select "Add to Home Screen"
                </p>
              )}
              {isAndroid() && (
                <p>
                  On Android: Tap the menu button and select "Add to Home Screen"
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Notifications */}
      <div className="notifications-section">
        <h4>🔔 Push Notifications</h4>
        <p>Get real-time updates about your shipments</p>
        
        <div className="notification-controls">
          {notificationsEnabled ? (
            <div className="notification-enabled">
              <div className="status-indicator">
                <Bell size={20} />
                <span>Notifications Enabled</span>
              </div>
              <div className="notification-actions">
                <button onClick={showTestNotification} className="btn btn-secondary">
                  Test Notification
                </button>
                <button onClick={disableNotifications} className="btn btn-outline">
                  <BellOff size={16} />
                  Disable
                </button>
              </div>
            </div>
          ) : (
            <div className="notification-disabled">
              <div className="status-indicator">
                <BellOff size={20} />
                <span>
                  {notificationPermission === 'denied' 
                    ? 'Notifications Blocked' 
                    : 'Notifications Disabled'
                  }
                </span>
              </div>
              {notificationPermission !== 'denied' && (
                <button onClick={requestNotificationPermission} className="btn btn-primary">
                  <Bell size={16} />
                  Enable Notifications
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Features */}
      <div className="mobile-capabilities">
        <h4>🚀 Mobile Capabilities</h4>
        
        <div className="capabilities-grid">
          {/* Vibration */}
          <div className="capability-item">
            <div className="capability-header">
              <Vibrate size={20} />
              <span>Haptic Feedback</span>
            </div>
            <p>Feel notifications and interactions</p>
            <button 
              onClick={testVibration}
              disabled={!vibrationSupported}
              className="btn btn-secondary"
            >
              {vibrationSupported ? 'Test Vibration' : 'Not Supported'}
            </button>
          </div>

          {/* Share */}
          <div className="capability-item">
            <div className="capability-header">
              <Share size={20} />
              <span>Native Sharing</span>
            </div>
            <p>Share the app with others</p>
            <button onClick={shareApp} className="btn btn-secondary">
              Share App
            </button>
          </div>

          {/* QR Code */}
          <div className="capability-item">
            <div className="capability-header">
              <QrCode size={20} />
              <span>QR Code</span>
            </div>
            <p>Generate QR codes for sharing</p>
            <button onClick={generateQRCode} className="btn btn-secondary">
              Generate QR
            </button>
          </div>

          {/* Camera */}
          <div className="capability-item">
            <div className="capability-header">
              <Camera size={20} />
              <span>Camera Access</span>
            </div>
            <p>Scan QR codes and documents</p>
            <button 
              onClick={testCamera}
              disabled={!cameraSupported}
              className="btn btn-secondary"
            >
              {cameraSupported ? 'Test Camera' : 'Not Supported'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tips */}
      <div className="mobile-tips">
        <h4>💡 Mobile Tips</h4>
        <div className="tips-list">
          <div className="tip-item">
            <span className="tip-icon">📱</span>
            <span>Add to home screen for app-like experience</span>
          </div>
          <div className="tip-item">
            <span className="tip-icon">🔔</span>
            <span>Enable notifications for real-time updates</span>
          </div>
          <div className="tip-item">
            <span className="tip-icon">📶</span>
            <span>Works offline - data syncs when online</span>
          </div>
          <div className="tip-item">
            <span className="tip-icon">🔄</span>
            <span>Pull down to refresh data</span>
          </div>
          <div className="tip-item">
            <span className="tip-icon">👆</span>
            <span>Swipe gestures for navigation</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileFeatures
