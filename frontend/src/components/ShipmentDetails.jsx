import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Package, MapPin, Calendar, Weight, FileText,
  Clock, CheckCircle, AlertCircle, Truck, Plane, Ship as ShipIcon,
  Edit, Save, X, Upload, Download, Eye
} from 'lucide-react'
import { format } from 'date-fns'

function ShipmentDetails({ shipments }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [editedShipment, setEditedShipment] = useState(null)
  const [newStatusUpdate, setNewStatusUpdate] = useState({
    status: '',
    location: '',
    notes: ''
  })
  const [showAddStatus, setShowAddStatus] = useState(false)

  const shipment = shipments.find(s => (s._id || s.id) === id)
  
  if (!shipment) {
    return (
      <div className="shipment-details">
        <div className="error-state">
          <Package size={48} />
          <h2>Shipment Not Found</h2>
          <p>The shipment you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/shipments')} className="btn btn-primary">
            Back to Shipments
          </button>
        </div>
      </div>
    )
  }

  // Enhanced timeline data with more realistic tracking events
  const getEnhancedTimeline = (shipment) => {
    const timeline = []

    // Always start with shipment created
    timeline.push({
      id: 1,
      status: 'Created',
      timestamp: shipment.createdAt || shipment.estimatedDelivery,
      location: shipment.origin,
      notes: 'Shipment registered in system',
      icon: Package,
      completed: true
    })

    // Add status history if available
    if (shipment.statusHistory && shipment.statusHistory.length > 0) {
      shipment.statusHistory.forEach((history, index) => {
        timeline.push({
          id: index + 2,
          status: history.status,
          timestamp: history.timestamp,
          location: history.location || '',
          notes: history.notes || `Status updated to ${history.status}`,
          icon: getStatusIcon(history.status),
          completed: true
        })
      })
    } else {
      // Generate realistic timeline based on current status
      if (shipment.status !== 'Pending') {
        timeline.push({
          id: 2,
          status: 'Processing',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          location: shipment.origin,
          notes: 'Shipment prepared for dispatch',
          icon: Package,
          completed: true
        })
      }

      if (shipment.status === 'In Transit' || shipment.status === 'Delivered') {
        timeline.push({
          id: 3,
          status: 'In Transit',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          location: 'Transit Hub',
          notes: 'Shipment in transit to destination',
          icon: Truck,
          completed: true
        })
      }

      if (shipment.status === 'Delivered') {
        timeline.push({
          id: 4,
          status: 'Delivered',
          timestamp: shipment.estimatedDelivery,
          location: shipment.destination,
          notes: 'Shipment successfully delivered',
          icon: CheckCircle,
          completed: true
        })
      }
    }

    // Add future events if not delivered
    if (shipment.status !== 'Delivered' && shipment.status !== 'Cancelled') {
      timeline.push({
        id: timeline.length + 1,
        status: 'Delivery',
        timestamp: shipment.estimatedDelivery,
        location: shipment.destination,
        notes: 'Expected delivery',
        icon: CheckCircle,
        completed: false,
        estimated: true
      })
    }

    return timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  }

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return Clock
      case 'processing': return Package
      case 'in transit': return Truck
      case 'delivered': return CheckCircle
      case 'cancelled': return AlertCircle
      default: return Package
    }
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'green'
      case 'in transit': return 'orange'
      case 'pending': return 'red'
      case 'cancelled': return 'gray'
      case 'processing': return 'blue'
      default: return 'blue'
    }
  }

  return (
    <div className="shipment-details">
      <div className="details-header">
        <button onClick={() => navigate('/shipments')} className="back-btn">
          <ArrowLeft size={20} />
          Back to Shipments
        </button>
        <div className="header-content">
          <h1>Shipment Details</h1>
          <div className="tracking-info">
            <h2>{shipment.trackingNumber}</h2>
            <span className={`status status-${getStatusColor(shipment.status)}`}>
              {shipment.status}
            </span>
          </div>
        </div>
      </div>

      <div className="details-content">
        <div className="details-grid">
          <div className="detail-card">
            <div className="card-header">
              <MapPin className="card-icon" />
              <h3>Route Information</h3>
            </div>
            <div className="card-content">
              <div className="route-info">
                <div className="route-point">
                  <div className="route-dot origin"></div>
                  <div className="route-details">
                    <h4>Origin</h4>
                    <p>{shipment.origin}</p>
                  </div>
                </div>
                <div className="route-line"></div>
                <div className="route-point">
                  <div className="route-dot destination"></div>
                  <div className="route-details">
                    <h4>Destination</h4>
                    <p>{shipment.destination}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <div className="card-header">
              <Package className="card-icon" />
              <h3>Cargo Information</h3>
            </div>
            <div className="card-content">
              <div className="info-row">
                <span className="info-label">Cargo Type:</span>
                <span className="info-value">{shipment.cargo}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Weight:</span>
                <span className="info-value">{shipment.weight}</span>
              </div>
              {shipment.description && (
                <div className="info-row">
                  <span className="info-label">Description:</span>
                  <span className="info-value">{shipment.description}</span>
                </div>
              )}
            </div>
          </div>

          <div className="detail-card">
            <div className="card-header">
              <Calendar className="card-icon" />
              <h3>Timeline</h3>
            </div>
            <div className="card-content">
              <div className="info-row">
                <span className="info-label">Estimated Delivery:</span>
                <span className="info-value">
                  {shipment.estimatedDelivery ?
                    new Date(shipment.estimatedDelivery).toLocaleDateString() :
                    shipment.estimatedDelivery
                  }
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Current Status:</span>
                <span className="info-value">{shipment.status}</span>
              </div>
            </div>
          </div>

          <div className="detail-card full-width">
            <div className="card-header">
              <FileText className="card-icon" />
              <h3>Tracking Timeline</h3>
              <button
                onClick={() => setShowAddStatus(!showAddStatus)}
                className="btn btn-sm btn-secondary"
              >
                <Edit size={14} />
                Add Update
              </button>
            </div>
            <div className="card-content">
              {/* Add Status Update Form */}
              {showAddStatus && (
                <div className="add-status-form">
                  <h4>Add Status Update</h4>
                  <div className="status-form-grid">
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={newStatusUpdate.status}
                        onChange={(e) => setNewStatusUpdate(prev => ({
                          ...prev,
                          status: e.target.value
                        }))}
                      >
                        <option value="">Select Status</option>
                        <option value="Processing">Processing</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input
                        type="text"
                        placeholder="Current location..."
                        value={newStatusUpdate.location}
                        onChange={(e) => setNewStatusUpdate(prev => ({
                          ...prev,
                          location: e.target.value
                        }))}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Notes</label>
                      <textarea
                        placeholder="Additional notes..."
                        value={newStatusUpdate.notes}
                        onChange={(e) => setNewStatusUpdate(prev => ({
                          ...prev,
                          notes: e.target.value
                        }))}
                        rows="2"
                      />
                    </div>
                  </div>
                  <div className="status-form-actions">
                    <button
                      onClick={() => setShowAddStatus(false)}
                      className="btn btn-secondary btn-sm"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        // In a real app, this would call an API
                        console.log('Adding status update:', newStatusUpdate)
                        setShowAddStatus(false)
                        setNewStatusUpdate({ status: '', location: '', notes: '' })
                      }}
                      className="btn btn-primary btn-sm"
                      disabled={!newStatusUpdate.status}
                    >
                      <Save size={14} />
                      Add Update
                    </button>
                  </div>
                </div>
              )}

              {/* Enhanced Timeline */}
              <div className="enhanced-timeline">
                {getEnhancedTimeline(shipment).map((event, index) => {
                  const IconComponent = event.icon
                  const isLast = index === getEnhancedTimeline(shipment).length - 1

                  return (
                    <div
                      key={event.id}
                      className={`timeline-event ${event.completed ? 'completed' : 'pending'} ${event.estimated ? 'estimated' : ''}`}
                    >
                      <div className="timeline-connector">
                        <div className={`timeline-icon ${getStatusColor(event.status)}`}>
                          <IconComponent size={16} />
                        </div>
                        {!isLast && <div className="timeline-line"></div>}
                      </div>

                      <div className="timeline-details">
                        <div className="timeline-header">
                          <h4>{event.status}</h4>
                          <span className="timeline-timestamp">
                            {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm')}
                            {event.estimated && <span className="estimated-badge">Estimated</span>}
                          </span>
                        </div>

                        {event.location && (
                          <div className="timeline-location">
                            <MapPin size={14} />
                            <span>{event.location}</span>
                          </div>
                        )}

                        <p className="timeline-notes">{event.notes}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShipmentDetails
