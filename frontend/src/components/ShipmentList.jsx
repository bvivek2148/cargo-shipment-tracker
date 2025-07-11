import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Edit, Trash2, Package, AlertCircle, Download, CheckSquare } from 'lucide-react'
import { shipmentAPI } from '../services/api'
import AdvancedFilters from './AdvancedFilters'
import ExportModal from './ExportModal'

function ShipmentList({ shipments, setShipments, backendStatus }) {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    startDate: '',
    endDate: '',
    minWeight: '',
    maxWeight: '',
    cargoType: '',
    origin: '',
    destination: '',
    priority: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null)
  const [selectedShipments, setSelectedShipments] = useState(new Set())
  const [bulkOperating, setBulkOperating] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  // Advanced filtering logic
  const filteredShipments = useMemo(() => {
    return shipments.filter(shipment => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          shipment.trackingNumber.toLowerCase().includes(searchLower) ||
          shipment.origin.toLowerCase().includes(searchLower) ||
          shipment.destination.toLowerCase().includes(searchLower) ||
          shipment.cargo.toLowerCase().includes(searchLower) ||
          (shipment.customerInfo?.name && shipment.customerInfo.name.toLowerCase().includes(searchLower))

        if (!matchesSearch) return false
      }

      // Status filter
      if (filters.status !== 'all' && shipment.status !== filters.status) {
        return false
      }

      // Priority filter
      if (filters.priority !== 'all' && shipment.priority !== filters.priority) {
        return false
      }

      // Date range filter
      if (filters.startDate || filters.endDate) {
        const shipmentDate = new Date(shipment.createdAt || shipment.estimatedDelivery)
        if (filters.startDate && shipmentDate < new Date(filters.startDate)) {
          return false
        }
        if (filters.endDate && shipmentDate > new Date(filters.endDate + 'T23:59:59')) {
          return false
        }
      }

      // Weight range filter
      if (filters.minWeight || filters.maxWeight) {
        const weightMatch = shipment.weight.match(/(\d+(?:\.\d+)?)/);
        if (weightMatch) {
          const weight = parseFloat(weightMatch[1])
          if (filters.minWeight && weight < parseFloat(filters.minWeight)) {
            return false
          }
          if (filters.maxWeight && weight > parseFloat(filters.maxWeight)) {
            return false
          }
        }
      }

      // Cargo type filter
      if (filters.cargoType && !shipment.cargo.toLowerCase().includes(filters.cargoType.toLowerCase())) {
        return false
      }

      // Origin filter
      if (filters.origin && !shipment.origin.toLowerCase().includes(filters.origin.toLowerCase())) {
        return false
      }

      // Destination filter
      if (filters.destination && !shipment.destination.toLowerCase().includes(filters.destination.toLowerCase())) {
        return false
      }

      return true
    }).sort((a, b) => {
      // Sorting logic
      let aValue, bValue

      switch (filters.sortBy) {
        case 'trackingNumber':
          aValue = a.trackingNumber
          bValue = b.trackingNumber
          break
        case 'estimatedDelivery':
          aValue = new Date(a.estimatedDelivery)
          bValue = new Date(b.estimatedDelivery)
          break
        case 'updatedAt':
          aValue = new Date(a.updatedAt || a.estimatedDelivery)
          bValue = new Date(b.updatedAt || b.estimatedDelivery)
          break
        default: // createdAt
          aValue = new Date(a.createdAt || a.estimatedDelivery)
          bValue = new Date(b.createdAt || b.estimatedDelivery)
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [shipments, filters])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shipment?')) {
      return
    }

    setDeletingId(id)
    setError(null)

    try {
      if (backendStatus === 'connected') {
        // Use API to delete shipment
        await shipmentAPI.delete(id)
      }

      // Remove from local state regardless of backend status
      setShipments(shipments.filter(shipment => (shipment._id || shipment.id) !== id))

      // Remove from selection if selected
      setSelectedShipments(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    } catch (error) {
      console.error('Failed to delete shipment:', error)
      setError(`Failed to delete shipment: ${error.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  const handleBulkOperation = async (operation, updateData = {}) => {
    if (selectedShipments.size === 0) {
      setError('Please select shipments to perform bulk operations')
      return
    }

    const confirmMessage = operation === 'delete'
      ? `Are you sure you want to delete ${selectedShipments.size} shipments?`
      : `Are you sure you want to update ${selectedShipments.size} shipments?`

    if (!window.confirm(confirmMessage)) {
      return
    }

    setBulkOperating(true)
    setError(null)

    try {
      const shipmentIds = Array.from(selectedShipments)

      if (backendStatus === 'connected') {
        await shipmentAPI.bulkOperation(operation, shipmentIds, updateData)
      }

      // Update local state
      if (operation === 'delete') {
        setShipments(shipments.filter(shipment =>
          !selectedShipments.has(shipment._id || shipment.id)
        ))
      } else if (operation === 'updateStatus') {
        setShipments(shipments.map(shipment => {
          const shipmentId = shipment._id || shipment.id
          if (selectedShipments.has(shipmentId)) {
            return {
              ...shipment,
              status: updateData.status,
              updatedAt: new Date().toISOString(),
              statusHistory: [
                ...(shipment.statusHistory || []),
                {
                  status: updateData.status,
                  timestamp: new Date().toISOString(),
                  notes: updateData.notes || `Status updated to ${updateData.status}`
                }
              ]
            }
          }
          return shipment
        }))
      } else if (operation === 'updatePriority') {
        setShipments(shipments.map(shipment => {
          const shipmentId = shipment._id || shipment.id
          if (selectedShipments.has(shipmentId)) {
            return {
              ...shipment,
              priority: updateData.priority,
              updatedAt: new Date().toISOString()
            }
          }
          return shipment
        }))
      }

      setSelectedShipments(new Set())
    } catch (error) {
      console.error('Bulk operation failed:', error)
      setError(`Bulk operation failed: ${error.message}`)
    } finally {
      setBulkOperating(false)
    }
  }

  const handleSelectShipment = (id) => {
    setSelectedShipments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedShipments.size === filteredShipments.length) {
      setSelectedShipments(new Set())
    } else {
      setSelectedShipments(new Set(filteredShipments.map(s => s._id || s.id)))
    }
  }

  return (
    <div className="shipment-list">
      <div className="list-header">
        <h2>All Shipments ({filteredShipments.length})</h2>
        <div className="list-actions">
          <button
            onClick={() => setShowExportModal(true)}
            className="btn btn-secondary"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters
        onFiltersChange={setFilters}
        initialFilters={filters}
      />

      {/* Enhanced Bulk Operations */}
      {selectedShipments.size > 0 && (
        <div className="bulk-operations">
          <div className="bulk-info">
            <CheckSquare size={16} />
            <span>{selectedShipments.size} shipments selected</span>
          </div>
          <div className="bulk-actions">
            <div className="bulk-action-group">
              <label>Status Update:</label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkOperation('updateStatus', {
                      status: e.target.value,
                      notes: `Bulk status update to ${e.target.value}`
                    })
                    e.target.value = ''
                  }
                }}
                disabled={bulkOperating}
              >
                <option value="">Select Status...</option>
                <option value="Pending">Set to Pending</option>
                <option value="In Transit">Set to In Transit</option>
                <option value="Delivered">Set to Delivered</option>
                <option value="Cancelled">Set to Cancelled</option>
              </select>
            </div>

            <div className="bulk-action-group">
              <label>Priority Update:</label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkOperation('updatePriority', {
                      priority: e.target.value
                    })
                    e.target.value = ''
                  }
                }}
                disabled={bulkOperating}
              >
                <option value="">Select Priority...</option>
                <option value="Low">Set to Low</option>
                <option value="Medium">Set to Medium</option>
                <option value="High">Set to High</option>
                <option value="Critical">Set to Critical</option>
              </select>
            </div>

            <div className="bulk-action-group">
              <button
                onClick={() => {
                  const selectedData = shipments.filter(s =>
                    selectedShipments.has(s._id || s.id)
                  )
                  // Export selected shipments
                  console.log('Exporting selected shipments:', selectedData)
                }}
                disabled={bulkOperating}
                className="btn btn-secondary"
              >
                <Download size={16} />
                Export Selected
              </button>
            </div>

            <div className="bulk-action-group">
              <button
                onClick={() => handleBulkOperation('delete')}
                disabled={bulkOperating}
                className="btn btn-danger"
              >
                <Trash2 size={16} />
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {backendStatus === 'disconnected' && (
        <div className="offline-notice">
          <AlertCircle size={16} />
          <span>You're in offline mode. Changes will only be saved locally.</span>
        </div>
      )}

      {error && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="shipments-table">
        <div className="table-header">
          <div className="table-row">
            <div className="table-cell checkbox-cell">
              <input
                type="checkbox"
                checked={selectedShipments.size === filteredShipments.length && filteredShipments.length > 0}
                onChange={handleSelectAll}
              />
            </div>
            <div className="table-cell">Tracking Number</div>
            <div className="table-cell">Origin</div>
            <div className="table-cell">Destination</div>
            <div className="table-cell">Status</div>
            <div className="table-cell">Cargo</div>
            <div className="table-cell">ETA</div>
            <div className="table-cell">Actions</div>
          </div>
        </div>
        
        <div className="table-body">
          {filteredShipments.length === 0 ? (
            <div className="empty-state">
              <Package size={48} />
              <h3>No shipments found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredShipments.map(shipment => {
              const shipmentId = shipment._id || shipment.id
              const isDeleting = deletingId === shipmentId
              const isSelected = selectedShipments.has(shipmentId)

              return (
                <div key={shipmentId} className={`table-row ${isSelected ? 'selected' : ''}`}>
                  <div className="table-cell checkbox-cell">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectShipment(shipmentId)}
                    />
                  </div>
                  <div className="table-cell">
                    <strong>{shipment.trackingNumber}</strong>
                    {shipment.priority && (
                      <span className={`priority-indicator priority-${shipment.priority.toLowerCase()}`}>
                        {shipment.priority}
                      </span>
                    )}
                  </div>
                  <div className="table-cell">{shipment.origin}</div>
                  <div className="table-cell">{shipment.destination}</div>
                  <div className="table-cell">
                    <span className={`status status-${shipment.status.toLowerCase().replace(' ', '-')}`}>
                      {shipment.status}
                    </span>
                  </div>
                  <div className="table-cell">{shipment.cargo}</div>
                  <div className="table-cell">
                    {shipment.estimatedDelivery ?
                      new Date(shipment.estimatedDelivery).toLocaleDateString() :
                      'Not set'
                    }
                  </div>
                  <div className="table-cell">
                    <div className="action-buttons">
                      <Link to={`/shipment/${shipmentId}`} className="action-btn view-btn">
                        <Eye size={16} />
                      </Link>
                      <button className="action-btn edit-btn">
                        <Edit size={16} />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(shipmentId)}
                        disabled={isDeleting || bulkOperating}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        shipments={filteredShipments}
        filters={filters}
      />
    </div>
  )
}

export default ShipmentList
