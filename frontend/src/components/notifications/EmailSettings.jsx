import { useState, useEffect } from 'react'
import { Mail, Settings, TestTube, CheckCircle, AlertCircle, Send } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import emailService from '../../services/emailService'
import toast from 'react-hot-toast'

function EmailSettings() {
  const { user, updateProfile } = useAuth()
  const [emailPreferences, setEmailPreferences] = useState({
    enabled: true,
    shipmentCreated: true,
    shipmentDelivered: true,
    shipmentDelayed: true,
    systemAlerts: true
  })
  const [testEmail, setTestEmail] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [emailStats, setEmailStats] = useState(null)

  useEffect(() => {
    // Load current preferences
    if (user?.preferences?.notifications) {
      setEmailPreferences({
        enabled: user.preferences.notifications.email ?? true,
        shipmentCreated: user.preferences.notifications.shipmentCreated ?? true,
        shipmentDelivered: user.preferences.notifications.shipmentDelivered ?? true,
        shipmentDelayed: user.preferences.notifications.shipmentDelayed ?? true,
        systemAlerts: user.preferences.notifications.systemAlerts ?? true
      })
    }

    // Load email statistics
    setEmailStats(emailService.getEmailStats())
  }, [user])

  const handlePreferenceChange = (key, value) => {
    setEmailPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSavePreferences = async () => {
    setIsSaving(true)
    
    try {
      const updatedPreferences = {
        ...user.preferences,
        notifications: {
          ...user.preferences?.notifications,
          email: emailPreferences.enabled,
          shipmentCreated: emailPreferences.shipmentCreated,
          shipmentDelivered: emailPreferences.shipmentDelivered,
          shipmentDelayed: emailPreferences.shipmentDelayed,
          systemAlerts: emailPreferences.systemAlerts
        }
      }

      const result = await updateProfile({
        preferences: updatedPreferences
      })

      if (result.success) {
        // Update email service settings
        emailService.setEnabled(emailPreferences.enabled)
        emailService.updateNotificationTypes({
          shipmentCreated: emailPreferences.shipmentCreated,
          shipmentDelivered: emailPreferences.shipmentDelivered,
          shipmentDelayed: emailPreferences.shipmentDelayed,
          systemAlerts: emailPreferences.systemAlerts
        })

        toast.success('Email preferences saved successfully')
      } else {
        toast.error('Failed to save email preferences')
      }
    } catch (error) {
      console.error('Error saving email preferences:', error)
      toast.error('Failed to save email preferences')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address')
      return
    }

    setIsTesting(true)
    
    try {
      const result = await emailService.testEmail(testEmail)
      
      if (result.success) {
        toast.success(`Test email sent to ${testEmail}`)
      } else {
        toast.error(`Failed to send test email: ${result.reason}`)
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      toast.error('Failed to send test email')
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="email-settings">
      <div className="settings-header">
        <h3>
          <Mail size={20} />
          Email Notification Settings
        </h3>
        <p>Configure when and how you receive email notifications</p>
      </div>

      <div className="settings-content">
        {/* Email Statistics */}
        {emailStats && (
          <div className="email-stats">
            <h4>Email Statistics</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Sent</span>
                <span className="stat-value">{emailStats.total}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Success Rate</span>
                <span className="stat-value">{emailStats.successRate}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Failed</span>
                <span className="stat-value">{emailStats.failed}</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Email Toggle */}
        <div className="setting-section">
          <div className="setting-item main-toggle">
            <div className="setting-info">
              <h4>Email Notifications</h4>
              <p>Enable or disable all email notifications</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={emailPreferences.enabled}
                onChange={(e) => handlePreferenceChange('enabled', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Individual Notification Types */}
        <div className="setting-section">
          <h4>Notification Types</h4>
          <div className="notification-types">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">
                  <span>Shipment Created</span>
                  <span className="setting-badge">📦</span>
                </div>
                <p>Get notified when new shipments are created</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={emailPreferences.shipmentCreated}
                  onChange={(e) => handlePreferenceChange('shipmentCreated', e.target.checked)}
                  disabled={!emailPreferences.enabled}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">
                  <span>Shipment Delivered</span>
                  <span className="setting-badge">✅</span>
                </div>
                <p>Get notified when shipments are successfully delivered</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={emailPreferences.shipmentDelivered}
                  onChange={(e) => handlePreferenceChange('shipmentDelivered', e.target.checked)}
                  disabled={!emailPreferences.enabled}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">
                  <span>Shipment Delayed</span>
                  <span className="setting-badge">⚠️</span>
                </div>
                <p>Get notified when shipments are delayed</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={emailPreferences.shipmentDelayed}
                  onChange={(e) => handlePreferenceChange('shipmentDelayed', e.target.checked)}
                  disabled={!emailPreferences.enabled}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">
                  <span>System Alerts</span>
                  <span className="setting-badge">🚨</span>
                </div>
                <p>Get notified about important system alerts</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={emailPreferences.systemAlerts}
                  onChange={(e) => handlePreferenceChange('systemAlerts', e.target.checked)}
                  disabled={!emailPreferences.enabled}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Test Email */}
        <div className="setting-section">
          <h4>Test Email Notifications</h4>
          <div className="test-email">
            <div className="test-input-group">
              <input
                type="email"
                placeholder="Enter email address to test"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="test-email-input"
              />
              <button
                onClick={handleTestEmail}
                disabled={isTesting || !emailPreferences.enabled}
                className="btn btn-secondary"
              >
                {isTesting ? (
                  <>
                    <Send size={16} className="spinning" />
                    Sending...
                  </>
                ) : (
                  <>
                    <TestTube size={16} />
                    Send Test
                  </>
                )}
              </button>
            </div>
            <p className="test-description">
              Send a test email to verify your notification settings are working correctly
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="settings-actions">
          <button
            onClick={handleSavePreferences}
            disabled={isSaving}
            className="btn btn-primary"
          >
            {isSaving ? (
              <>
                <Settings size={16} className="spinning" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Save Preferences
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailSettings
