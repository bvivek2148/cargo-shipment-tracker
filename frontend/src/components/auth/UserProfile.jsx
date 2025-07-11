import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { User, Edit, Save, X, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

function UserProfile() {
  const { user, updateProfile, changePassword } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    department: user?.department || '',
    phone: user?.phone || '',
    preferences: {
      theme: user?.preferences?.theme || 'system',
      language: user?.preferences?.language || 'en',
      notifications: {
        email: user?.preferences?.notifications?.email ?? true,
        push: user?.preferences?.notifications?.push ?? true,
        shipmentUpdates: user?.preferences?.notifications?.shipmentUpdates ?? true,
        systemAlerts: user?.preferences?.notifications?.systemAlerts ?? true
      },
      dashboard: {
        defaultView: user?.preferences?.dashboard?.defaultView || 'overview',
        itemsPerPage: user?.preferences?.dashboard?.itemsPerPage || 10
      }
    }
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.includes('.')) {
      const keys = name.split('.')
      setProfileData(prev => {
        const newData = { ...prev }
        let current = newData
        
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]]
        }
        
        current[keys[keys.length - 1]] = type === 'checkbox' ? checked : value
        return newData
      })
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateProfile = () => {
    const newErrors = {}

    if (!profileData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!profileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (profileData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(profileData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePassword = () => {
    const newErrors = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters'
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateProfile()) return

    setIsSubmitting(true)
    setErrors({})
    setSuccessMessage('')

    try {
      const result = await updateProfile(profileData)
      
      if (result.success) {
        setIsEditing(false)
        setSuccessMessage('Profile updated successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setErrors({ submit: result.error })
      }
    } catch (error) {
      setErrors({ submit: 'Failed to update profile' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (!validatePassword()) return

    setIsSubmitting(true)
    setErrors({})
    setSuccessMessage('')

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword)
      
      if (result.success) {
        setIsChangingPassword(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setSuccessMessage('Password changed successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setErrors({ password: result.error })
      }
    } catch (error) {
      setErrors({ password: 'Failed to change password' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          <User size={48} />
        </div>
        <div className="profile-info">
          <h1>{user?.fullName}</h1>
          <p className="profile-email">{user?.email}</p>
          <span className={`role-badge role-${user?.role}`}>
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </span>
        </div>
      </div>

      {successMessage && (
        <div className="success-banner">
          <CheckCircle size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {errors.submit && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{errors.submit}</span>
        </div>
      )}

      <div className="profile-content">
        {/* Profile Information */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Profile Information</h2>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="btn btn-secondary"
              >
                <Edit size={16} />
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="btn btn-secondary"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button 
                  onClick={handleProfileSubmit}
                  disabled={isSubmitting}
                  className="btn btn-primary"
                >
                  <Save size={16} />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="form-grid">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && (
                  <span className="error-message">{errors.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && (
                  <span className="error-message">{errors.lastName}</span>
                )}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="disabled"
                />
                <small>Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label>Role</label>
                <input
                  type="text"
                  value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  disabled
                  className="disabled"
                />
                <small>Role is managed by administrators</small>
              </div>

              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  value={profileData.department}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  placeholder="e.g., Operations"
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  className={errors.phone ? 'error' : ''}
                  placeholder="e.g., +1234567890"
                />
                {errors.phone && (
                  <span className="error-message">{errors.phone}</span>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Password Change */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Security</h2>
            {!isChangingPassword ? (
              <button 
                onClick={() => setIsChangingPassword(true)}
                className="btn btn-secondary"
              >
                <Lock size={16} />
                Change Password
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  onClick={() => {
                    setIsChangingPassword(false)
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                    setErrors({})
                  }}
                  className="btn btn-secondary"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button 
                  onClick={handlePasswordSubmit}
                  disabled={isSubmitting}
                  className="btn btn-primary"
                >
                  <Save size={16} />
                  {isSubmitting ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            )}
          </div>

          {isChangingPassword && (
            <form onSubmit={handlePasswordSubmit} className="password-form">
              {errors.password && (
                <div className="error-banner">
                  <AlertCircle size={16} />
                  <span>{errors.password}</span>
                </div>
              )}

              <div className="form-group">
                <label>Current Password</label>
                <div className="password-input">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={errors.currentPassword ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <span className="error-message">{errors.currentPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label>New Password</label>
                <div className="password-input">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={errors.newPassword ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <span className="error-message">{errors.newPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="password-input">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword}</span>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Preferences */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Preferences</h2>
          </div>

          <div className="preferences-grid">
            <div className="preference-group">
              <h3>Theme</h3>
              <select
                name="preferences.theme"
                value={profileData.preferences.theme}
                onChange={handleProfileChange}
                disabled={!isEditing}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            <div className="preference-group">
              <h3>Default Dashboard View</h3>
              <select
                name="preferences.dashboard.defaultView"
                value={profileData.preferences.dashboard.defaultView}
                onChange={handleProfileChange}
                disabled={!isEditing}
              >
                <option value="overview">Overview</option>
                <option value="shipments">Shipments</option>
                <option value="analytics">Analytics</option>
              </select>
            </div>

            <div className="preference-group">
              <h3>Items Per Page</h3>
              <select
                name="preferences.dashboard.itemsPerPage"
                value={profileData.preferences.dashboard.itemsPerPage}
                onChange={handleProfileChange}
                disabled={!isEditing}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="notification-preferences">
            <h3>Notification Preferences</h3>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="preferences.notifications.email"
                  checked={profileData.preferences.notifications.email}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                />
                <span>Email Notifications</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="preferences.notifications.push"
                  checked={profileData.preferences.notifications.push}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                />
                <span>Push Notifications</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="preferences.notifications.shipmentUpdates"
                  checked={profileData.preferences.notifications.shipmentUpdates}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                />
                <span>Shipment Updates</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="preferences.notifications.systemAlerts"
                  checked={profileData.preferences.notifications.systemAlerts}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                />
                <span>System Alerts</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
