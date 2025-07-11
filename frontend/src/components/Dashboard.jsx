import { useState, useEffect } from 'react'
import { Package, Ship, MapPin, TrendingUp, Calendar, AlertTriangle, Clock, BarChart3, Download } from 'lucide-react'
import RealTimeDashboard from './realtime/RealTimeDashboard'
import RealTimeShipmentList from './realtime/RealTimeShipmentList'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns'
import { shipmentAPI } from '../services/api'
import exportService from '../services/exportService'

function Dashboard({ shipments }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // Calculate basic statistics
  const totalShipments = shipments.length
  const inTransitShipments = shipments.filter(s => s.status === 'In Transit').length
  const deliveredShipments = shipments.filter(s => s.status === 'Delivered').length
  const pendingShipments = shipments.filter(s => s.status === 'Pending').length
  const cancelledShipments = shipments.filter(s => s.status === 'Cancelled').length

  // Calculate overdue shipments
  const overdueShipments = shipments.filter(s => {
    const deliveryDate = new Date(s.estimatedDelivery)
    const today = new Date()
    return deliveryDate < today && (s.status === 'Pending' || s.status === 'In Transit')
  }).length

  // Fetch enhanced statistics from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await shipmentAPI.getStats()
        setStats(response.data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Prepare data for charts
  const statusData = [
    { name: 'Pending', value: pendingShipments, color: '#ef4444' },
    { name: 'In Transit', value: inTransitShipments, color: '#f59e0b' },
    { name: 'Delivered', value: deliveredShipments, color: '#10b981' },
    { name: 'Cancelled', value: cancelledShipments, color: '#6b7280' }
  ]

  // Prepare timeline data for the last 7 days
  const timelineData = []
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i)
    const dayStart = startOfDay(date)
    const dayEnd = endOfDay(date)

    const dayShipments = shipments.filter(s => {
      const createdDate = new Date(s.createdAt || s.estimatedDelivery)
      return isWithinInterval(createdDate, { start: dayStart, end: dayEnd })
    })

    timelineData.push({
      date: format(date, 'MMM dd'),
      created: dayShipments.length,
      delivered: dayShipments.filter(s => s.status === 'Delivered').length
    })
  }

  // Calculate delivery performance
  const deliveryRate = totalShipments > 0 ?
    ((deliveredShipments / totalShipments) * 100).toFixed(1) : 0

  const statCards = [
    {
      title: 'Total Shipments',
      value: totalShipments,
      icon: Package,
      color: 'blue',
      change: stats?.performance?.recentShipments || 0,
      changeLabel: 'This week'
    },
    {
      title: 'In Transit',
      value: inTransitShipments,
      icon: Ship,
      color: 'orange',
      change: null,
      changeLabel: 'Active'
    },
    {
      title: 'Delivered',
      value: deliveredShipments,
      icon: MapPin,
      color: 'green',
      change: `${deliveryRate}%`,
      changeLabel: 'Success rate'
    },
    {
      title: 'Overdue',
      value: overdueShipments,
      icon: AlertTriangle,
      color: 'red',
      change: null,
      changeLabel: 'Need attention'
    }
  ]

  const recentShipments = shipments
    .sort((a, b) => new Date(b.createdAt || b.estimatedDelivery) - new Date(a.createdAt || a.estimatedDelivery))
    .slice(0, 5)

  const handleQuickExport = (format) => {
    const filename = `dashboard_report_${format}`
    let result

    switch (format) {
      case 'csv':
        result = exportService.exportToCSV(shipments, filename)
        break
      case 'pdf':
        result = exportService.exportToPDF(shipments, filename)
        break
      case 'detailed':
        result = exportService.exportDetailedReport(shipments, filename)
        break
      default:
        return
    }

    if (!result.success) {
      console.error('Export failed:', result.message)
    }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-state">
          <BarChart3 size={48} className="loading-icon" />
          <h3>Loading Analytics...</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard Overview</h2>
        <p>Track and manage your cargo shipments with real-time analytics</p>
        <div className="dashboard-actions">
          <div className="last-updated">
            <Clock size={16} />
            <span>Last updated: {format(new Date(), 'MMM dd, HH:mm')}</span>
          </div>
          <div className="quick-export">
            <button
              onClick={() => handleQuickExport('pdf')}
              className="btn btn-secondary btn-sm"
            >
              <Download size={14} />
              Export Report
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon">
              <stat.icon size={24} />
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
              {stat.change && (
                <div className="stat-change">
                  <span className="change-value">{stat.change}</span>
                  <span className="change-label">{stat.changeLabel}</span>
                </div>
              )}
              {!stat.change && stat.changeLabel && (
                <div className="stat-label">{stat.changeLabel}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="analytics-section">
        <div className="analytics-grid">
          {/* Status Distribution Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Shipment Status Distribution</h3>
              <p>Current status breakdown</p>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Timeline Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Shipment Timeline</h3>
              <p>Last 7 days activity</p>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="created"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Created"
                  />
                  <Area
                    type="monotone"
                    dataKey="delivered"
                    stackId="2"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Delivered"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="recent-shipments">
        <div className="section-header">
          <h3>Recent Shipments</h3>
          <div className="section-actions">
            <Calendar size={16} />
            <span>Last 5 shipments</span>
          </div>
        </div>
        <div className="shipment-cards">
          {recentShipments.length > 0 ? (
            recentShipments.map(shipment => {
              const shipmentId = shipment._id || shipment.id
              return (
                <div key={shipmentId} className="shipment-card">
                  <div className="shipment-header">
                    <h4>{shipment.trackingNumber}</h4>
                    <span className={`status status-${shipment.status.toLowerCase().replace(' ', '-')}`}>
                      {shipment.status}
                    </span>
                  </div>
                  <div className="shipment-details">
                    <p><strong>From:</strong> {shipment.origin}</p>
                    <p><strong>To:</strong> {shipment.destination}</p>
                    <p><strong>Cargo:</strong> {shipment.cargo}</p>
                    <p><strong>ETA:</strong> {
                      shipment.estimatedDelivery ?
                        format(new Date(shipment.estimatedDelivery), 'MMM dd, yyyy') :
                        'Not set'
                    }</p>
                  </div>
                  {shipment.priority && (
                    <div className={`priority-badge priority-${shipment.priority.toLowerCase()}`}>
                      {shipment.priority}
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="empty-state">
              <Package size={48} />
              <h4>No shipments yet</h4>
              <p>Create your first shipment to see it here</p>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Dashboard Section */}
      <RealTimeDashboard />

      {/* Real-time Shipment List */}
      <RealTimeShipmentList />
    </div>
  )
}

export default Dashboard
