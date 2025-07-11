import { useState, useEffect } from 'react'
import { Calendar, Clock, Mail, Download, Settings, Play, Pause, Edit, Trash2, Plus, FileText, BarChart3, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

// Automated Reporting System with Scheduling and Custom Report Builder
function AutomatedReporting() {
  const [reports, setReports] = useState([])
  const [schedules, setSchedules] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [reportBuilder, setReportBuilder] = useState({
    name: '',
    description: '',
    type: 'performance',
    frequency: 'weekly',
    recipients: [],
    filters: {},
    metrics: [],
    format: 'pdf'
  })

  // Sample reports and schedules
  useEffect(() => {
    const sampleReports = [
      {
        id: '1',
        name: 'Weekly Performance Summary',
        description: 'Comprehensive weekly performance metrics and KPIs',
        type: 'performance',
        frequency: 'weekly',
        nextRun: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        lastRun: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        recipients: ['manager@company.com', 'ceo@company.com'],
        status: 'active',
        metrics: ['revenue', 'shipments', 'onTimeDelivery', 'customerSatisfaction'],
        format: 'pdf',
        createdAt: new Date('2024-01-01'),
        runCount: 12
      },
      {
        id: '2',
        name: 'Monthly Financial Report',
        description: 'Detailed financial analysis and cost breakdown',
        type: 'financial',
        frequency: 'monthly',
        nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        lastRun: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        recipients: ['finance@company.com', 'accounting@company.com'],
        status: 'active',
        metrics: ['revenue', 'costs', 'profit', 'margins'],
        format: 'excel',
        createdAt: new Date('2024-01-01'),
        runCount: 3
      },
      {
        id: '3',
        name: 'Daily Operations Dashboard',
        description: 'Real-time operational metrics and alerts',
        type: 'operational',
        frequency: 'daily',
        nextRun: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        lastRun: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        recipients: ['operations@company.com'],
        status: 'active',
        metrics: ['activeShipments', 'delays', 'alerts', 'efficiency'],
        format: 'pdf',
        createdAt: new Date('2024-01-05'),
        runCount: 25
      },
      {
        id: '4',
        name: 'Customer Satisfaction Analysis',
        description: 'Customer feedback and satisfaction trends',
        type: 'customer',
        frequency: 'monthly',
        nextRun: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        lastRun: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        recipients: ['customer-service@company.com'],
        status: 'paused',
        metrics: ['satisfaction', 'feedback', 'complaints', 'resolution'],
        format: 'pdf',
        createdAt: new Date('2024-01-10'),
        runCount: 2
      }
    ]

    setReports(sampleReports)
  }, [])

  const reportTypes = [
    { id: 'performance', name: 'Performance Report', icon: BarChart3, description: 'KPIs and performance metrics' },
    { id: 'financial', name: 'Financial Report', icon: TrendingUp, description: 'Revenue, costs, and profitability' },
    { id: 'operational', name: 'Operational Report', icon: Settings, description: 'Daily operations and efficiency' },
    { id: 'customer', name: 'Customer Report', icon: FileText, description: 'Customer satisfaction and feedback' },
    { id: 'custom', name: 'Custom Report', icon: Edit, description: 'Build your own custom report' }
  ]

  const frequencies = [
    { id: 'daily', name: 'Daily', description: 'Every day at specified time' },
    { id: 'weekly', name: 'Weekly', description: 'Every week on specified day' },
    { id: 'monthly', name: 'Monthly', description: 'Every month on specified date' },
    { id: 'quarterly', name: 'Quarterly', description: 'Every quarter' },
    { id: 'yearly', name: 'Yearly', description: 'Once per year' }
  ]

  const availableMetrics = [
    { id: 'revenue', name: 'Revenue', category: 'financial' },
    { id: 'costs', name: 'Costs', category: 'financial' },
    { id: 'profit', name: 'Profit', category: 'financial' },
    { id: 'margins', name: 'Profit Margins', category: 'financial' },
    { id: 'shipments', name: 'Total Shipments', category: 'operational' },
    { id: 'onTimeDelivery', name: 'On-time Delivery', category: 'performance' },
    { id: 'delays', name: 'Delays', category: 'operational' },
    { id: 'efficiency', name: 'Efficiency Score', category: 'performance' },
    { id: 'customerSatisfaction', name: 'Customer Satisfaction', category: 'customer' },
    { id: 'feedback', name: 'Customer Feedback', category: 'customer' },
    { id: 'complaints', name: 'Complaints', category: 'customer' },
    { id: 'resolution', name: 'Resolution Time', category: 'customer' },
    { id: 'activeShipments', name: 'Active Shipments', category: 'operational' },
    { id: 'alerts', name: 'System Alerts', category: 'operational' }
  ]

  const createReport = () => {
    if (!reportBuilder.name || !reportBuilder.type || reportBuilder.metrics.length === 0) {
      toast.error('Please fill in all required fields')
      return
    }

    const newReport = {
      id: Date.now().toString(),
      ...reportBuilder,
      nextRun: calculateNextRun(reportBuilder.frequency),
      lastRun: null,
      status: 'active',
      createdAt: new Date(),
      runCount: 0
    }

    setReports(prev => [...prev, newReport])
    setReportBuilder({
      name: '',
      description: '',
      type: 'performance',
      frequency: 'weekly',
      recipients: [],
      filters: {},
      metrics: [],
      format: 'pdf'
    })
    setIsCreating(false)
    toast.success('Report created successfully')
  }

  const calculateNextRun = (frequency) => {
    const now = new Date()
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000)
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
      case 'quarterly':
        return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate())
      case 'yearly':
        return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    }
  }

  const toggleReportStatus = (reportId) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, status: report.status === 'active' ? 'paused' : 'active' }
        : report
    ))
    toast.success('Report status updated')
  }

  const runReportNow = (reportId) => {
    const report = reports.find(r => r.id === reportId)
    if (!report) return

    // Simulate report generation
    toast.loading('Generating report...', { duration: 2000 })
    
    setTimeout(() => {
      setReports(prev => prev.map(r => 
        r.id === reportId 
          ? { 
              ...r, 
              lastRun: new Date(), 
              nextRun: calculateNextRun(r.frequency),
              runCount: r.runCount + 1
            }
          : r
      ))
      toast.success(`Report "${report.name}" generated successfully`)
    }, 2000)
  }

  const deleteReport = (reportId) => {
    setReports(prev => prev.filter(r => r.id !== reportId))
    toast.success('Report deleted')
  }

  const addRecipient = (email) => {
    if (email && !reportBuilder.recipients.includes(email)) {
      setReportBuilder(prev => ({
        ...prev,
        recipients: [...prev.recipients, email]
      }))
    }
  }

  const removeRecipient = (email) => {
    setReportBuilder(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email)
    }))
  }

  const toggleMetric = (metricId) => {
    setReportBuilder(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(m => m !== metricId)
        : [...prev.metrics, metricId]
    }))
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-active'
      case 'paused': return 'status-paused'
      case 'error': return 'status-error'
      default: return 'status-default'
    }
  }

  const getFrequencyIcon = (frequency) => {
    switch (frequency) {
      case 'daily': return <Clock size={16} />
      case 'weekly': return <Calendar size={16} />
      case 'monthly': return <Calendar size={16} />
      default: return <Calendar size={16} />
    }
  }

  return (
    <div className="automated-reporting">
      <div className="reporting-header">
        <h3>📊 Automated Reporting System</h3>
        <div className="header-actions">
          <button 
            onClick={() => setIsCreating(true)}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Create Report
          </button>
        </div>
      </div>

      {/* Report Statistics */}
      <div className="reporting-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{reports.length}</div>
            <div className="stat-label">Total Reports</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Play size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{reports.filter(r => r.status === 'active').length}</div>
            <div className="stat-label">Active Reports</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Mail size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{reports.reduce((sum, r) => sum + r.runCount, 0)}</div>
            <div className="stat-label">Reports Sent</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {reports.filter(r => r.nextRun && r.nextRun < new Date(Date.now() + 24 * 60 * 60 * 1000)).length}
            </div>
            <div className="stat-label">Due Today</div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="reports-list">
        <h4>📋 Scheduled Reports</h4>
        <div className="reports-grid">
          {reports.map(report => (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <div className="report-info">
                  <h5>{report.name}</h5>
                  <p>{report.description}</p>
                </div>
                <div className="report-actions">
                  <button 
                    onClick={() => toggleReportStatus(report.id)}
                    className={`status-btn ${report.status}`}
                  >
                    {report.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button 
                    onClick={() => runReportNow(report.id)}
                    className="action-btn"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    onClick={() => deleteReport(report.id)}
                    className="action-btn delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="report-details">
                <div className="detail-item">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{reportTypes.find(t => t.id === report.type)?.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Frequency:</span>
                  <span className="detail-value">
                    {getFrequencyIcon(report.frequency)}
                    {report.frequency}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Recipients:</span>
                  <span className="detail-value">{report.recipients.length} recipients</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Format:</span>
                  <span className="detail-value">{report.format.toUpperCase()}</span>
                </div>
              </div>
              
              <div className="report-schedule">
                <div className="schedule-item">
                  <span className="schedule-label">Next Run:</span>
                  <span className="schedule-value">{formatDate(report.nextRun)}</span>
                </div>
                {report.lastRun && (
                  <div className="schedule-item">
                    <span className="schedule-label">Last Run:</span>
                    <span className="schedule-value">{formatDate(report.lastRun)}</span>
                  </div>
                )}
                <div className="schedule-item">
                  <span className="schedule-label">Run Count:</span>
                  <span className="schedule-value">{report.runCount} times</span>
                </div>
              </div>
              
              <div className="report-status">
                <span className={`status-badge ${getStatusColor(report.status)}`}>
                  {report.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Builder Modal */}
      {isCreating && (
        <div className="report-builder-modal">
          <div className="modal-overlay" onClick={() => setIsCreating(false)}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h4>🛠️ Report Builder</h4>
              <button onClick={() => setIsCreating(false)} className="close-btn">
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {/* Basic Information */}
              <div className="form-section">
                <h5>Basic Information</h5>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Report Name</label>
                    <input
                      type="text"
                      value={reportBuilder.name}
                      onChange={(e) => setReportBuilder(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter report name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={reportBuilder.description}
                      onChange={(e) => setReportBuilder(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this report contains"
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              {/* Report Type */}
              <div className="form-section">
                <h5>Report Type</h5>
                <div className="type-selector">
                  {reportTypes.map(type => {
                    const IconComponent = type.icon
                    return (
                      <button
                        key={type.id}
                        onClick={() => setReportBuilder(prev => ({ ...prev, type: type.id }))}
                        className={`type-btn ${reportBuilder.type === type.id ? 'active' : ''}`}
                      >
                        <IconComponent size={20} />
                        <span>{type.name}</span>
                        <p>{type.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Metrics Selection */}
              <div className="form-section">
                <h5>Metrics to Include</h5>
                <div className="metrics-grid">
                  {availableMetrics
                    .filter(metric => reportBuilder.type === 'custom' || metric.category === reportBuilder.type || 
                            (reportBuilder.type === 'performance' && ['operational', 'performance'].includes(metric.category)))
                    .map(metric => (
                      <label key={metric.id} className="metric-checkbox">
                        <input
                          type="checkbox"
                          checked={reportBuilder.metrics.includes(metric.id)}
                          onChange={() => toggleMetric(metric.id)}
                        />
                        <span>{metric.name}</span>
                      </label>
                    ))}
                </div>
              </div>

              {/* Schedule & Format */}
              <div className="form-section">
                <h5>Schedule & Format</h5>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Frequency</label>
                    <select
                      value={reportBuilder.frequency}
                      onChange={(e) => setReportBuilder(prev => ({ ...prev, frequency: e.target.value }))}
                    >
                      {frequencies.map(freq => (
                        <option key={freq.id} value={freq.id}>
                          {freq.name} - {freq.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Format</label>
                    <select
                      value={reportBuilder.format}
                      onChange={(e) => setReportBuilder(prev => ({ ...prev, format: e.target.value }))}
                    >
                      <option value="pdf">PDF Document</option>
                      <option value="excel">Excel Spreadsheet</option>
                      <option value="csv">CSV File</option>
                      <option value="email">Email Summary</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Recipients */}
              <div className="form-section">
                <h5>Email Recipients</h5>
                <div className="recipients-manager">
                  <div className="add-recipient">
                    <input
                      type="email"
                      placeholder="Enter email address"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addRecipient(e.target.value)
                          e.target.value = ''
                        }
                      }}
                    />
                    <button 
                      onClick={(e) => {
                        const input = e.target.previousElementSibling
                        addRecipient(input.value)
                        input.value = ''
                      }}
                      className="btn btn-secondary"
                    >
                      Add
                    </button>
                  </div>
                  
                  <div className="recipients-list">
                    {reportBuilder.recipients.map(email => (
                      <div key={email} className="recipient-tag">
                        <span>{email}</span>
                        <button onClick={() => removeRecipient(email)}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={() => setIsCreating(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={createReport} className="btn btn-primary">
                Create Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AutomatedReporting
