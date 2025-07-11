import { useState, useEffect } from 'react'
import { Download, Wifi, WifiOff, Smartphone, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'

function PWAManager() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState(null)

  useEffect(() => {
    // Register service worker
    registerServiceWorker()
    
    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('🌐 Back online! Syncing data...', { duration: 3000 })
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      toast.error('📱 You\'re offline. Some features may be limited.', { duration: 5000 })
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    // Check if already installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
      toast.success('📱 App installed successfully!')
    }
    
    window.addEventListener('appinstalled', handleAppInstalled)
    
    // Check if running as PWA
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      setIsInstalled(true)
    }
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js')
        setRegistration(reg)
        
        console.log('Service Worker registered successfully')
        
        // Listen for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true)
              toast('🔄 App update available!', {
                duration: 0,
                action: {
                  label: 'Update',
                  onClick: () => updateApp()
                }
              })
            }
          })
        })
        
        // Listen for controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload()
        })
        
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }
  }

  const installApp = async () => {
    if (!deferredPrompt) return
    
    try {
      const result = await deferredPrompt.prompt()
      console.log('Install prompt result:', result.outcome)
      
      if (result.outcome === 'accepted') {
        setShowInstallPrompt(false)
        setDeferredPrompt(null)
      }
    } catch (error) {
      console.error('Install prompt failed:', error)
    }
  }

  const updateApp = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      setUpdateAvailable(false)
    }
  }

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem('installPromptDismissed', 'true')
  }

  // Don't show install prompt if dismissed in this session
  const shouldShowInstallPrompt = showInstallPrompt && 
    !sessionStorage.getItem('installPromptDismissed') && 
    !isInstalled

  return (
    <>
      {/* Install App Prompt */}
      {shouldShowInstallPrompt && (
        <div className="install-prompt">
          <div className="install-content">
            <div className="install-icon">
              <Smartphone size={24} />
            </div>
            <div className="install-text">
              <h4>Install Cargo Tracker</h4>
              <p>Get the full app experience with offline access and push notifications</p>
            </div>
            <div className="install-actions">
              <button onClick={installApp} className="btn btn-primary">
                <Download size={16} />
                Install
              </button>
              <button onClick={dismissInstallPrompt} className="btn btn-secondary">
                <X size={16} />
                Not now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Available Notification */}
      {updateAvailable && (
        <div className="update-notification">
          <div className="update-content">
            <div className="update-icon">
              <Download size={20} />
            </div>
            <div className="update-text">
              <strong>Update Available</strong>
              <p>A new version of the app is ready</p>
            </div>
            <button onClick={updateApp} className="btn btn-primary">
              <Check size={16} />
              Update Now
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// Hook for offline functionality
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return isOnline
}

// Hook for PWA installation
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }
    
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      setIsInstalled(true)
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])
  
  const install = async () => {
    if (!deferredPrompt) return false
    
    try {
      const result = await deferredPrompt.prompt()
      setDeferredPrompt(null)
      setIsInstallable(false)
      return result.outcome === 'accepted'
    } catch (error) {
      console.error('Install failed:', error)
      return false
    }
  }
  
  return {
    isInstallable,
    isInstalled,
    install
  }
}

// Offline storage utilities
export const offlineStorage = {
  // Store data for offline use
  store: async (key, data) => {
    try {
      if ('indexedDB' in window) {
        // Use IndexedDB for larger data
        await storeInIndexedDB(key, data)
      } else {
        // Fallback to localStorage
        localStorage.setItem(`offline_${key}`, JSON.stringify(data))
      }
    } catch (error) {
      console.error('Failed to store offline data:', error)
    }
  },
  
  // Retrieve offline data
  get: async (key) => {
    try {
      if ('indexedDB' in window) {
        return await getFromIndexedDB(key)
      } else {
        const data = localStorage.getItem(`offline_${key}`)
        return data ? JSON.parse(data) : null
      }
    } catch (error) {
      console.error('Failed to retrieve offline data:', error)
      return null
    }
  },
  
  // Remove offline data
  remove: async (key) => {
    try {
      if ('indexedDB' in window) {
        await removeFromIndexedDB(key)
      } else {
        localStorage.removeItem(`offline_${key}`)
      }
    } catch (error) {
      console.error('Failed to remove offline data:', error)
    }
  },
  
  // Clear all offline data
  clear: async () => {
    try {
      if ('indexedDB' in window) {
        await clearIndexedDB()
      } else {
        Object.keys(localStorage)
          .filter(key => key.startsWith('offline_'))
          .forEach(key => localStorage.removeItem(key))
      }
    } catch (error) {
      console.error('Failed to clear offline data:', error)
    }
  }
}

// IndexedDB utilities (simplified implementation)
async function storeInIndexedDB(key, data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CargoTrackerDB', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['offline'], 'readwrite')
      const store = transaction.objectStore('offline')
      
      const putRequest = store.put({ key, data, timestamp: Date.now() })
      putRequest.onsuccess = () => resolve()
      putRequest.onerror = () => reject(putRequest.error)
    }
    
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('offline')) {
        db.createObjectStore('offline', { keyPath: 'key' })
      }
    }
  })
}

async function getFromIndexedDB(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CargoTrackerDB', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['offline'], 'readonly')
      const store = transaction.objectStore('offline')
      
      const getRequest = store.get(key)
      getRequest.onsuccess = () => {
        const result = getRequest.result
        resolve(result ? result.data : null)
      }
      getRequest.onerror = () => reject(getRequest.error)
    }
  })
}

async function removeFromIndexedDB(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CargoTrackerDB', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['offline'], 'readwrite')
      const store = transaction.objectStore('offline')
      
      const deleteRequest = store.delete(key)
      deleteRequest.onsuccess = () => resolve()
      deleteRequest.onerror = () => reject(deleteRequest.error)
    }
  })
}

async function clearIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CargoTrackerDB', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['offline'], 'readwrite')
      const store = transaction.objectStore('offline')
      
      const clearRequest = store.clear()
      clearRequest.onsuccess = () => resolve()
      clearRequest.onerror = () => reject(clearRequest.error)
    }
  })
}

export default PWAManager
