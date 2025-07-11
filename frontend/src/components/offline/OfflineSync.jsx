import { useState, useEffect, useCallback } from 'react'
import { Cloud, CloudOff, RefreshCw, AlertCircle, CheckCircle, Clock, Upload, Download } from 'lucide-react'
import { useOfflineStatus, offlineStorage } from '../pwa/PWAManager'
import toast from 'react-hot-toast'

// Offline sync manager for handling data synchronization
function OfflineSync({ onSyncComplete }) {
  const isOnline = useOfflineStatus()
  const [syncStatus, setSyncStatus] = useState('idle') // idle, syncing, success, error
  const [pendingOperations, setPendingOperations] = useState([])
  const [lastSyncTime, setLastSyncTime] = useState(null)
  const [syncProgress, setSyncProgress] = useState(0)
  const [conflictResolutions, setConflictResolutions] = useState([])

  useEffect(() => {
    loadPendingOperations()
    loadLastSyncTime()
  }, [])

  useEffect(() => {
    if (isOnline && pendingOperations.length > 0) {
      // Auto-sync when coming back online
      setTimeout(() => {
        syncPendingOperations()
      }, 2000) // Wait 2 seconds to ensure stable connection
    }
  }, [isOnline, pendingOperations])

  const loadPendingOperations = async () => {
    try {
      const pending = await offlineStorage.get('pendingOperations') || []
      setPendingOperations(pending)
    } catch (error) {
      console.error('Failed to load pending operations:', error)
    }
  }

  const loadLastSyncTime = async () => {
    try {
      const lastSync = await offlineStorage.get('lastSyncTime')
      if (lastSync) {
        setLastSyncTime(new Date(lastSync))
      }
    } catch (error) {
      console.error('Failed to load last sync time:', error)
    }
  }

  const addPendingOperation = useCallback(async (operation) => {
    const newOperation = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: operation.type, // 'create', 'update', 'delete'
      entity: operation.entity, // 'shipment', 'document', etc.
      data: operation.data,
      retryCount: 0,
      maxRetries: 3
    }

    const updatedOperations = [...pendingOperations, newOperation]
    setPendingOperations(updatedOperations)
    
    await offlineStorage.store('pendingOperations', updatedOperations)
    
    // Show offline notification
    toast(`📱 Operation saved offline. Will sync when online.`, {
      icon: '💾',
      duration: 3000
    })
  }, [pendingOperations])

  const syncPendingOperations = async () => {
    if (!isOnline || pendingOperations.length === 0) return

    setSyncStatus('syncing')
    setSyncProgress(0)
    
    const successfulOperations = []
    const failedOperations = []
    const conflicts = []

    try {
      for (let i = 0; i < pendingOperations.length; i++) {
        const operation = pendingOperations[i]
        setSyncProgress(((i + 1) / pendingOperations.length) * 100)

        try {
          const result = await syncOperation(operation)
          
          if (result.success) {
            successfulOperations.push(operation)
          } else if (result.conflict) {
            conflicts.push({ operation, serverData: result.serverData })
          } else {
            operation.retryCount++
            if (operation.retryCount < operation.maxRetries) {
              failedOperations.push(operation)
            } else {
              console.error('Operation failed after max retries:', operation)
            }
          }
        } catch (error) {
          console.error('Sync operation failed:', error)
          operation.retryCount++
          if (operation.retryCount < operation.maxRetries) {
            failedOperations.push(operation)
          }
        }
      }

      // Update pending operations (remove successful ones)
      const remainingOperations = failedOperations
      setPendingOperations(remainingOperations)
      await offlineStorage.store('pendingOperations', remainingOperations)

      // Handle conflicts
      if (conflicts.length > 0) {
        setConflictResolutions(conflicts)
        setSyncStatus('error')
        toast.error(`${conflicts.length} conflicts need resolution`)
      } else {
        setSyncStatus('success')
        setLastSyncTime(new Date())
        await offlineStorage.store('lastSyncTime', new Date().toISOString())
        
        toast.success(`✅ Synced ${successfulOperations.length} operations`)
        
        if (onSyncComplete) {
          onSyncComplete({
            successful: successfulOperations.length,
            failed: failedOperations.length,
            conflicts: conflicts.length
          })
        }
      }
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncStatus('error')
      toast.error('Sync failed. Will retry later.')
    }
  }

  const syncOperation = async (operation) => {
    const { type, entity, data } = operation

    // Construct API endpoint
    let endpoint = `/api/${entity}`
    let method = 'POST'
    let body = data

    switch (type) {
      case 'create':
        method = 'POST'
        break
      case 'update':
        method = 'PUT'
        endpoint = `${endpoint}/${data.id}`
        break
      case 'delete':
        method = 'DELETE'
        endpoint = `${endpoint}/${data.id}`
        body = null
        break
    }

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: body ? JSON.stringify(body) : null
      })

      if (response.ok) {
        return { success: true }
      } else if (response.status === 409) {
        // Conflict - data was modified on server
        const serverData = await response.json()
        return { success: false, conflict: true, serverData }
      } else {
        return { success: false }
      }
    } catch (error) {
      throw error
    }
  }

  const resolveConflict = async (conflictIndex, resolution) => {
    const conflict = conflictResolutions[conflictIndex]
    const { operation, serverData } = conflict

    try {
      let resolvedData
      
      switch (resolution) {
        case 'use_local':
          resolvedData = operation.data
          break
        case 'use_server':
          resolvedData = serverData
          break
        case 'merge':
          resolvedData = mergeData(operation.data, serverData)
          break
        default:
          throw new Error('Invalid resolution')
      }

      // Apply resolution
      const result = await syncOperation({
        ...operation,
        data: resolvedData
      })

      if (result.success) {
        // Remove resolved conflict
        const updatedConflicts = conflictResolutions.filter((_, index) => index !== conflictIndex)
        setConflictResolutions(updatedConflicts)
        
        toast.success('Conflict resolved successfully')
        
        if (updatedConflicts.length === 0) {
          setSyncStatus('success')
        }
      } else {
        toast.error('Failed to resolve conflict')
      }
    } catch (error) {
      console.error('Conflict resolution failed:', error)
      toast.error('Conflict resolution failed')
    }
  }

  const mergeData = (localData, serverData) => {
    // Simple merge strategy - prefer local changes for most fields
    // but keep server timestamps and IDs
    return {
      ...serverData,
      ...localData,
      id: serverData.id,
      createdAt: serverData.createdAt,
      updatedAt: new Date().toISOString()
    }
  }

  const manualSync = () => {
    if (isOnline) {
      syncPendingOperations()
    } else {
      toast.error('Cannot sync while offline')
    }
  }

  const clearPendingOperations = async () => {
    setPendingOperations([])
    await offlineStorage.store('pendingOperations', [])
    toast.success('Pending operations cleared')
  }

  const formatTime = (date) => {
    if (!date) return 'Never'
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw size={16} className="spinning" />
      case 'success':
        return <CheckCircle size={16} />
      case 'error':
        return <AlertCircle size={16} />
      default:
        return isOnline ? <Cloud size={16} /> : <CloudOff size={16} />
    }
  }

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'text-blue-500'
      case 'success':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      default:
        return isOnline ? 'text-gray-500' : 'text-orange-500'
    }
  }

  return (
    <div className="offline-sync">
      {/* Sync Status Bar */}
      <div className="sync-status-bar">
        <div className="sync-status">
          <div className={`sync-icon ${getSyncStatusColor()}`}>
            {getSyncStatusIcon()}
          </div>
          <div className="sync-info">
            <span className="sync-text">
              {syncStatus === 'syncing' && `Syncing... ${Math.round(syncProgress)}%`}
              {syncStatus === 'success' && 'All data synced'}
              {syncStatus === 'error' && 'Sync issues detected'}
              {syncStatus === 'idle' && (isOnline ? 'Online' : 'Offline')}
            </span>
            <span className="sync-time">
              Last sync: {formatTime(lastSyncTime)}
            </span>
          </div>
        </div>

        <div className="sync-actions">
          {pendingOperations.length > 0 && (
            <span className="pending-count">
              {pendingOperations.length} pending
            </span>
          )}
          
          <button 
            onClick={manualSync}
            disabled={!isOnline || syncStatus === 'syncing'}
            className="sync-button"
          >
            <RefreshCw size={14} />
            Sync
          </button>
        </div>
      </div>

      {/* Sync Progress */}
      {syncStatus === 'syncing' && (
        <div className="sync-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${syncProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Pending Operations */}
      {pendingOperations.length > 0 && (
        <div className="pending-operations">
          <div className="pending-header">
            <h4>📤 Pending Operations</h4>
            <button onClick={clearPendingOperations} className="clear-button">
              Clear All
            </button>
          </div>
          
          <div className="operations-list">
            {pendingOperations.slice(0, 5).map((operation) => (
              <div key={operation.id} className="operation-item">
                <div className="operation-icon">
                  {operation.type === 'create' && <Upload size={16} />}
                  {operation.type === 'update' && <RefreshCw size={16} />}
                  {operation.type === 'delete' && <AlertCircle size={16} />}
                </div>
                <div className="operation-details">
                  <span className="operation-type">
                    {operation.type} {operation.entity}
                  </span>
                  <span className="operation-time">
                    {formatTime(new Date(operation.timestamp))}
                  </span>
                </div>
                <div className="operation-status">
                  {operation.retryCount > 0 && (
                    <span className="retry-count">
                      Retry {operation.retryCount}/{operation.maxRetries}
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {pendingOperations.length > 5 && (
              <div className="more-operations">
                +{pendingOperations.length - 5} more operations
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conflict Resolution */}
      {conflictResolutions.length > 0 && (
        <div className="conflict-resolution">
          <div className="conflict-header">
            <h4>⚠️ Sync Conflicts</h4>
            <p>These items were modified both locally and on the server</p>
          </div>
          
          {conflictResolutions.map((conflict, index) => (
            <div key={index} className="conflict-item">
              <div className="conflict-info">
                <h5>{conflict.operation.entity} - {conflict.operation.type}</h5>
                <p>Local and server versions differ</p>
              </div>
              
              <div className="conflict-actions">
                <button 
                  onClick={() => resolveConflict(index, 'use_local')}
                  className="btn btn-secondary"
                >
                  Use Local
                </button>
                <button 
                  onClick={() => resolveConflict(index, 'use_server')}
                  className="btn btn-secondary"
                >
                  Use Server
                </button>
                <button 
                  onClick={() => resolveConflict(index, 'merge')}
                  className="btn btn-primary"
                >
                  Merge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Hook for offline operations
export function useOfflineOperations() {
  const [offlineSync, setOfflineSync] = useState(null)
  
  const addOfflineOperation = useCallback((operation) => {
    if (offlineSync) {
      offlineSync.addPendingOperation(operation)
    }
  }, [offlineSync])
  
  return {
    addOfflineOperation,
    setOfflineSync
  }
}

export default OfflineSync
