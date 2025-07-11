import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, X, AlertCircle } from 'lucide-react'
import { shipmentAPI } from '../services/api'

function ShipmentForm({ shipments, setShipments, backendStatus }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    trackingNumber: '',
    origin: '',
    destination: '',
    status: 'Pending',
    estimatedDelivery: '',
    cargo: '',
    weight: '',
    description: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.trackingNumber.trim()) {
      newErrors.trackingNumber = 'Tracking number is required'
    }
    
    if (!formData.origin.trim()) {
      newErrors.origin = 'Origin is required'
    }
    
    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required'
    }
    
    if (!formData.cargo.trim()) {
      newErrors.cargo = 'Cargo description is required'
    }
    
    if (!formData.weight.trim()) {
      newErrors.weight = 'Weight is required'
    }
    
    if (!formData.estimatedDelivery) {
      newErrors.estimatedDelivery = 'Estimated delivery date is required'
    }
    
    // Check if tracking number already exists
    if (formData.trackingNumber && shipments.some(s => s.trackingNumber === formData.trackingNumber)) {
      newErrors.trackingNumber = 'Tracking number already exists'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      if (backendStatus === 'connected') {
        // Use API to create shipment
        const newShipment = await shipmentAPI.create(formData)
        setShipments(prev => [...prev, newShipment])
      } else {
        // Fallback to local state for offline mode
        const newShipment = {
          _id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setShipments(prev => [...prev, newShipment])
      }

      navigate('/shipments')
    } catch (error) {
      console.error('Failed to create shipment:', error)
      setErrors({ submit: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/shipments')
  }

  return (
    <div className="shipment-form">
      <div className="form-header">
        <h2>Add New Shipment</h2>
        <p>Enter the details for the new cargo shipment</p>
      </div>

      {backendStatus === 'disconnected' && (
        <div className="offline-notice">
          <AlertCircle size={16} />
          <span>You're in offline mode. Changes will only be saved locally.</span>
        </div>
      )}

      {errors.submit && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{errors.submit}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="trackingNumber">Tracking Number *</label>
            <input
              type="text"
              id="trackingNumber"
              name="trackingNumber"
              value={formData.trackingNumber}
              onChange={handleChange}
              className={errors.trackingNumber ? 'error' : ''}
              placeholder="e.g., CST001"
            />
            {errors.trackingNumber && <span className="error-message">{errors.trackingNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Pending">Pending</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="origin">Origin *</label>
            <input
              type="text"
              id="origin"
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              className={errors.origin ? 'error' : ''}
              placeholder="e.g., New York, USA"
            />
            {errors.origin && <span className="error-message">{errors.origin}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="destination">Destination *</label>
            <input
              type="text"
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              className={errors.destination ? 'error' : ''}
              placeholder="e.g., London, UK"
            />
            {errors.destination && <span className="error-message">{errors.destination}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="cargo">Cargo Description *</label>
            <input
              type="text"
              id="cargo"
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              className={errors.cargo ? 'error' : ''}
              placeholder="e.g., Electronics"
            />
            {errors.cargo && <span className="error-message">{errors.cargo}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="weight">Weight *</label>
            <input
              type="text"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className={errors.weight ? 'error' : ''}
              placeholder="e.g., 500 kg"
            />
            {errors.weight && <span className="error-message">{errors.weight}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="estimatedDelivery">Estimated Delivery Date *</label>
            <input
              type="date"
              id="estimatedDelivery"
              name="estimatedDelivery"
              value={formData.estimatedDelivery}
              onChange={handleChange}
              className={errors.estimatedDelivery ? 'error' : ''}
            />
            {errors.estimatedDelivery && <span className="error-message">{errors.estimatedDelivery}</span>}
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Additional Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Any additional notes or description..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleCancel} className="btn btn-secondary">
            <X size={16} />
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            <Save size={16} />
            {isSubmitting ? 'Saving...' : 'Save Shipment'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ShipmentForm
