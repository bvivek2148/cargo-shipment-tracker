// Email Notification Service
// This service handles email notifications for critical shipment events

class EmailService {
  constructor() {
    this.isEnabled = true
    this.emailQueue = []
    this.templates = {
      shipmentCreated: {
        subject: 'New Shipment Created - {{trackingNumber}}',
        template: `
          <h2>New Shipment Created</h2>
          <p>A new shipment has been created with the following details:</p>
          <ul>
            <li><strong>Tracking Number:</strong> {{trackingNumber}}</li>
            <li><strong>Origin:</strong> {{origin}}</li>
            <li><strong>Destination:</strong> {{destination}}</li>
            <li><strong>Cargo:</strong> {{cargo}}</li>
            <li><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</li>
          </ul>
          <p>You can track this shipment using the tracking number above.</p>
        `
      },
      shipmentDelivered: {
        subject: 'Shipment Delivered - {{trackingNumber}}',
        template: `
          <h2>Shipment Successfully Delivered</h2>
          <p>Your shipment has been successfully delivered:</p>
          <ul>
            <li><strong>Tracking Number:</strong> {{trackingNumber}}</li>
            <li><strong>Delivered To:</strong> {{recipient}}</li>
            <li><strong>Delivery Time:</strong> {{deliveryTime}}</li>
            <li><strong>Destination:</strong> {{destination}}</li>
          </ul>
          <p>Thank you for using our cargo tracking service!</p>
        `
      },
      shipmentDelayed: {
        subject: 'Shipment Delayed - {{trackingNumber}}',
        template: `
          <h2>Shipment Delay Notification</h2>
          <p>We regret to inform you that your shipment has been delayed:</p>
          <ul>
            <li><strong>Tracking Number:</strong> {{trackingNumber}}</li>
            <li><strong>Reason:</strong> {{reason}}</li>
            <li><strong>New Estimated Delivery:</strong> {{newEstimatedDelivery}}</li>
            <li><strong>Current Location:</strong> {{currentLocation}}</li>
          </ul>
          <p>We apologize for any inconvenience and are working to minimize the delay.</p>
        `
      },
      systemAlert: {
        subject: 'System Alert - {{alertType}}',
        template: `
          <h2>System Alert Notification</h2>
          <p>A system alert has been triggered:</p>
          <ul>
            <li><strong>Alert Type:</strong> {{alertType}}</li>
            <li><strong>Priority:</strong> {{priority}}</li>
            <li><strong>Message:</strong> {{message}}</li>
            <li><strong>Time:</strong> {{timestamp}}</li>
          </ul>
          <p>Please review this alert and take appropriate action if necessary.</p>
        `
      }
    }
  }

  // Initialize email service with user preferences
  initialize(userPreferences) {
    this.isEnabled = userPreferences?.notifications?.email ?? true
    this.userEmail = userPreferences?.email
    this.notificationTypes = {
      shipmentCreated: userPreferences?.notifications?.shipmentCreated ?? true,
      shipmentDelivered: userPreferences?.notifications?.shipmentDelivered ?? true,
      shipmentDelayed: userPreferences?.notifications?.shipmentDelayed ?? true,
      systemAlerts: userPreferences?.notifications?.systemAlerts ?? true
    }
  }

  // Send email notification
  async sendNotification(type, data, recipients = []) {
    if (!this.isEnabled) {
      console.log('Email notifications are disabled')
      return { success: false, reason: 'disabled' }
    }

    if (!this.notificationTypes[type]) {
      console.log(`Email notifications for ${type} are disabled`)
      return { success: false, reason: 'type_disabled' }
    }

    const template = this.templates[type]
    if (!template) {
      console.error(`No email template found for type: ${type}`)
      return { success: false, reason: 'no_template' }
    }

    try {
      const emailData = this.prepareEmail(template, data, recipients)
      
      // In a real application, this would send to an email service
      // For demo purposes, we'll simulate the email sending
      const result = await this.simulateEmailSending(emailData)
      
      if (result.success) {
        this.addToQueue(emailData)
        console.log(`Email notification sent for ${type}:`, emailData.subject)
      }
      
      return result
    } catch (error) {
      console.error('Error sending email notification:', error)
      return { success: false, reason: 'send_error', error: error.message }
    }
  }

  // Prepare email content
  prepareEmail(template, data, recipients) {
    const subject = this.replaceTemplateVariables(template.subject, data)
    const body = this.replaceTemplateVariables(template.template, data)
    
    return {
      to: recipients.length > 0 ? recipients : [this.userEmail],
      subject,
      body,
      timestamp: new Date().toISOString(),
      data
    }
  }

  // Replace template variables with actual data
  replaceTemplateVariables(template, data) {
    let result = template
    
    // Replace all {{variable}} patterns with actual data
    const variables = template.match(/\{\{([^}]+)\}\}/g)
    if (variables) {
      variables.forEach(variable => {
        const key = variable.replace(/[{}]/g, '')
        const value = this.getNestedValue(data, key) || key
        result = result.replace(variable, value)
      })
    }
    
    return result
  }

  // Get nested object value by key path
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null
    }, obj)
  }

  // Simulate email sending (replace with actual email service)
  async simulateEmailSending(emailData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 95% success rate
        const success = Math.random() > 0.05
        
        if (success) {
          resolve({
            success: true,
            messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString()
          })
        } else {
          resolve({
            success: false,
            reason: 'service_error',
            error: 'Simulated email service error'
          })
        }
      }, 500) // Simulate network delay
    })
  }

  // Add email to queue for tracking
  addToQueue(emailData) {
    this.emailQueue.unshift({
      ...emailData,
      id: Date.now(),
      status: 'sent'
    })
    
    // Keep only last 50 emails
    if (this.emailQueue.length > 50) {
      this.emailQueue = this.emailQueue.slice(0, 50)
    }
  }

  // Get email queue for admin monitoring
  getEmailQueue() {
    return this.emailQueue
  }

  // Get email statistics
  getEmailStats() {
    const total = this.emailQueue.length
    const sent = this.emailQueue.filter(email => email.status === 'sent').length
    const failed = this.emailQueue.filter(email => email.status === 'failed').length
    
    return {
      total,
      sent,
      failed,
      successRate: total > 0 ? (sent / total * 100).toFixed(1) : 0
    }
  }

  // Enable/disable email notifications
  setEnabled(enabled) {
    this.isEnabled = enabled
    console.log(`Email notifications ${enabled ? 'enabled' : 'disabled'}`)
  }

  // Update notification type preferences
  updateNotificationTypes(types) {
    this.notificationTypes = { ...this.notificationTypes, ...types }
    console.log('Email notification types updated:', this.notificationTypes)
  }

  // Test email functionality
  async testEmail(recipientEmail) {
    const testData = {
      trackingNumber: 'TEST001',
      origin: 'Test Origin',
      destination: 'Test Destination',
      cargo: 'Test Cargo',
      estimatedDelivery: new Date().toLocaleDateString()
    }

    return await this.sendNotification('shipmentCreated', testData, [recipientEmail])
  }
}

// Create singleton instance
const emailService = new EmailService()

// Export service and helper functions
export default emailService

export const sendShipmentCreatedEmail = (shipmentData, recipients) => {
  return emailService.sendNotification('shipmentCreated', shipmentData, recipients)
}

export const sendShipmentDeliveredEmail = (shipmentData, recipients) => {
  return emailService.sendNotification('shipmentDelivered', shipmentData, recipients)
}

export const sendShipmentDelayedEmail = (shipmentData, recipients) => {
  return emailService.sendNotification('shipmentDelayed', shipmentData, recipients)
}

export const sendSystemAlertEmail = (alertData, recipients) => {
  return emailService.sendNotification('systemAlert', alertData, recipients)
}
