import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Package, Clock, Globe, AlertTriangle, Target, Zap } from 'lucide-react'

// Advanced Analytics Dashboard with Business Intelligence
function EnhancedDashboard() {
  const [timeRange, setTimeRange] = useState('30d') // 7d, 30d, 90d, 1y
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  useEffect(() => {
    generateAnalytics()
  }, [timeRange])

  const generateAnalytics = async () => {
    setLoading(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate comprehensive analytics data
    const data = {
      overview: {
        totalRevenue: 2847500,
        revenueGrowth: 12.5,
        totalShipments: 1247,
        shipmentsGrowth: 8.3,
        avgDeliveryTime: 11.2,
        deliveryTimeImprovement: -5.7,
        customerSatisfaction: 94.8,
        satisfactionGrowth: 2.1,
        onTimeDelivery: 92.3,
        onTimeGrowth: 1.8,
        costEfficiency: 87.6,
        efficiencyGrowth: 4.2
      },
      trends: {
        revenue: generateTrendData('revenue'),
        shipments: generateTrendData('shipments'),
        deliveryTime: generateTrendData('deliveryTime'),
        satisfaction: generateTrendData('satisfaction')
      },
      predictions: {
        nextMonthRevenue: 3200000,
        nextMonthShipments: 1450,
        seasonalTrends: generateSeasonalData(),
        riskFactors: [
          { factor: 'Weather Delays', probability: 23, impact: 'Medium' },
          { factor: 'Port Congestion', probability: 15, impact: 'High' },
          { factor: 'Fuel Price Increase', probability: 67, impact: 'Low' },
          { factor: 'Currency Fluctuation', probability: 45, impact: 'Medium' }
        ]
      },
      performance: {
        topRoutes: [
          { route: 'Shanghai - Los Angeles', volume: 234, revenue: 567000, efficiency: 94.2 },
          { route: 'Hamburg - New York', volume: 189, revenue: 445000, efficiency: 91.8 },
          { route: 'Singapore - Dubai', volume: 156, revenue: 378000, efficiency: 89.5 },
          { route: 'Tokyo - Sydney', volume: 143, revenue: 334000, efficiency: 87.3 },
          { route: 'Rotterdam - Mumbai', volume: 128, revenue: 298000, efficiency: 85.9 }
        ],
        topCustomers: [
          { name: 'Global Tech Solutions', shipments: 89, revenue: 234000, satisfaction: 96.5 },
          { name: 'International Trading Co.', shipments: 76, revenue: 198000, satisfaction: 94.2 },
          { name: 'Pacific Logistics Ltd.', shipments: 65, revenue: 167000, satisfaction: 93.8 },
          { name: 'Euro-Asian Imports', shipments: 54, revenue: 145000, satisfaction: 92.1 },
          { name: 'Maritime Solutions Inc.', shipments: 43, revenue: 123000, satisfaction: 91.7 }
        ],
        cargoTypes: [
          { type: 'Electronics', volume: 342, revenue: 789000, margin: 23.4 },
          { type: 'Textiles', volume: 298, revenue: 567000, margin: 18.7 },
          { type: 'Machinery', volume: 234, revenue: 678000, margin: 28.9 },
          { type: 'Automotive', volume: 189, revenue: 445000, margin: 21.3 },
          { type: 'Consumer Goods', volume: 184, revenue: 368000, margin: 16.8 }
        ]
      },
      insights: [
        {
          type: 'opportunity',
          title: 'Route Optimization Potential',
          description: 'Shanghai-LA route shows 15% efficiency improvement opportunity',
          impact: '$89,000 potential monthly savings',
          priority: 'high',
          action: 'Implement advanced route optimization'
        },
        {
          type: 'warning',
          title: 'Seasonal Demand Spike',
          description: 'Q4 demand expected to increase by 34% based on historical data',
          impact: 'Capacity planning required',
          priority: 'medium',
          action: 'Scale operations and secure additional vessels'
        },
        {
          type: 'success',
          title: 'Customer Satisfaction Improvement',
          description: 'Overall satisfaction increased by 2.1% this quarter',
          impact: 'Reduced churn risk by 12%',
          priority: 'low',
          action: 'Continue current service quality initiatives'
        }
      ]
    }
    
    setAnalytics(data)
    setLoading(false)
  }

  const generateTrendData = (type) => {
    const baseValue = {
      revenue: 2500000,
      shipments: 1000,
      deliveryTime: 12,
      satisfaction: 92
    }[type]
    
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: baseValue + (Math.random() - 0.5) * baseValue * 0.2,
      target: baseValue * 1.1
    }))
  }

  const generateSeasonalData = () => {
    return [
      { month: 'Jan', historical: 2100000, predicted: 2300000, confidence: 87 },
      { month: 'Feb', historical: 2200000, predicted: 2400000, confidence: 89 },
      { month: 'Mar', historical: 2400000, predicted: 2600000, confidence: 91 },
      { month: 'Apr', historical: 2300000, predicted: 2500000, confidence: 88 },
      { month: 'May', historical: 2500000, predicted: 2700000, confidence: 92 },
      { month: 'Jun', historical: 2600000, predicted: 2800000, confidence: 90 },
      { month: 'Jul', historical: 2700000, predicted: 2900000, confidence: 93 },
      { month: 'Aug', historical: 2800000, predicted: 3000000, confidence: 91 },
      { month: 'Sep', historical: 2900000, predicted: 3100000, confidence: 89 },
      { month: 'Oct', historical: 3200000, predicted: 3400000, confidence: 94 },
      { month: 'Nov', historical: 3500000, predicted: 3700000, confidence: 96 },
      { month: 'Dec', historical: 3800000, predicted: 4000000, confidence: 95 }
    ]
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number)
  }

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getGrowthColor = (growth) => {
    return growth > 0 ? 'text-green-500' : 'text-red-500'
  }

  const getGrowthIcon = (growth) => {
    return growth > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />
  }

  if (loading) {
    return (
      <div className="enhanced-dashboard loading">
        <div className="loading-content">
          <BarChart3 size={48} className="loading-icon" />
          <h3>Generating Advanced Analytics...</h3>
          <p>Processing business intelligence data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="enhanced-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h2>📊 Business Intelligence Dashboard</h2>
          <p>Advanced analytics and predictive insights for strategic decision making</p>
        </div>
        
        <div className="header-controls">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="kpi-section">
        <h3>🎯 Key Performance Indicators</h3>
        <div className="kpi-grid">
          <div className="kpi-card revenue">
            <div className="kpi-header">
              <div className="kpi-icon">
                <DollarSign size={24} />
              </div>
              <div className="kpi-trend">
                <span className={getGrowthColor(analytics.overview.revenueGrowth)}>
                  {getGrowthIcon(analytics.overview.revenueGrowth)}
                  {formatPercentage(analytics.overview.revenueGrowth)}
                </span>
              </div>
            </div>
            <div className="kpi-content">
              <div className="kpi-value">{formatCurrency(analytics.overview.totalRevenue)}</div>
              <div className="kpi-label">Total Revenue</div>
              <div className="kpi-subtitle">vs. previous period</div>
            </div>
          </div>

          <div className="kpi-card shipments">
            <div className="kpi-header">
              <div className="kpi-icon">
                <Package size={24} />
              </div>
              <div className="kpi-trend">
                <span className={getGrowthColor(analytics.overview.shipmentsGrowth)}>
                  {getGrowthIcon(analytics.overview.shipmentsGrowth)}
                  {formatPercentage(analytics.overview.shipmentsGrowth)}
                </span>
              </div>
            </div>
            <div className="kpi-content">
              <div className="kpi-value">{formatNumber(analytics.overview.totalShipments)}</div>
              <div className="kpi-label">Total Shipments</div>
              <div className="kpi-subtitle">vs. previous period</div>
            </div>
          </div>

          <div className="kpi-card delivery">
            <div className="kpi-header">
              <div className="kpi-icon">
                <Clock size={24} />
              </div>
              <div className="kpi-trend">
                <span className={getGrowthColor(analytics.overview.deliveryTimeImprovement)}>
                  {getGrowthIcon(analytics.overview.deliveryTimeImprovement)}
                  {formatPercentage(Math.abs(analytics.overview.deliveryTimeImprovement))}
                </span>
              </div>
            </div>
            <div className="kpi-content">
              <div className="kpi-value">{analytics.overview.avgDeliveryTime} days</div>
              <div className="kpi-label">Avg Delivery Time</div>
              <div className="kpi-subtitle">improvement this period</div>
            </div>
          </div>

          <div className="kpi-card satisfaction">
            <div className="kpi-header">
              <div className="kpi-icon">
                <Target size={24} />
              </div>
              <div className="kpi-trend">
                <span className={getGrowthColor(analytics.overview.satisfactionGrowth)}>
                  {getGrowthIcon(analytics.overview.satisfactionGrowth)}
                  {formatPercentage(analytics.overview.satisfactionGrowth)}
                </span>
              </div>
            </div>
            <div className="kpi-content">
              <div className="kpi-value">{analytics.overview.customerSatisfaction}%</div>
              <div className="kpi-label">Customer Satisfaction</div>
              <div className="kpi-subtitle">vs. previous period</div>
            </div>
          </div>

          <div className="kpi-card efficiency">
            <div className="kpi-header">
              <div className="kpi-icon">
                <Zap size={24} />
              </div>
              <div className="kpi-trend">
                <span className={getGrowthColor(analytics.overview.efficiencyGrowth)}>
                  {getGrowthIcon(analytics.overview.efficiencyGrowth)}
                  {formatPercentage(analytics.overview.efficiencyGrowth)}
                </span>
              </div>
            </div>
            <div className="kpi-content">
              <div className="kpi-value">{analytics.overview.costEfficiency}%</div>
              <div className="kpi-label">Cost Efficiency</div>
              <div className="kpi-subtitle">vs. previous period</div>
            </div>
          </div>

          <div className="kpi-card ontime">
            <div className="kpi-header">
              <div className="kpi-icon">
                <Globe size={24} />
              </div>
              <div className="kpi-trend">
                <span className={getGrowthColor(analytics.overview.onTimeGrowth)}>
                  {getGrowthIcon(analytics.overview.onTimeGrowth)}
                  {formatPercentage(analytics.overview.onTimeGrowth)}
                </span>
              </div>
            </div>
            <div className="kpi-content">
              <div className="kpi-value">{analytics.overview.onTimeDelivery}%</div>
              <div className="kpi-label">On-time Delivery</div>
              <div className="kpi-subtitle">vs. previous period</div>
            </div>
          </div>
        </div>
      </div>

      {/* Predictive Analytics */}
      <div className="predictions-section">
        <h3>🔮 Predictive Analytics</h3>
        <div className="predictions-grid">
          <div className="prediction-card">
            <h4>📈 Revenue Forecast</h4>
            <div className="prediction-value">
              {formatCurrency(analytics.predictions.nextMonthRevenue)}
            </div>
            <div className="prediction-label">Predicted next month</div>
            <div className="prediction-confidence">
              <span className="confidence-bar">
                <span className="confidence-fill" style={{ width: '89%' }}></span>
              </span>
              <span className="confidence-text">89% confidence</span>
            </div>
          </div>

          <div className="prediction-card">
            <h4>📦 Shipment Volume</h4>
            <div className="prediction-value">
              {formatNumber(analytics.predictions.nextMonthShipments)}
            </div>
            <div className="prediction-label">Predicted next month</div>
            <div className="prediction-confidence">
              <span className="confidence-bar">
                <span className="confidence-fill" style={{ width: '92%' }}></span>
              </span>
              <span className="confidence-text">92% confidence</span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="risk-section">
        <h3>⚠️ Risk Analysis</h3>
        <div className="risk-grid">
          {analytics.predictions.riskFactors.map((risk, index) => (
            <div key={index} className={`risk-card ${risk.impact.toLowerCase()}`}>
              <div className="risk-header">
                <AlertTriangle size={20} />
                <span className="risk-probability">{risk.probability}%</span>
              </div>
              <div className="risk-content">
                <h4>{risk.factor}</h4>
                <div className="risk-impact">Impact: {risk.impact}</div>
                <div className="risk-bar">
                  <div 
                    className="risk-fill" 
                    style={{ width: `${risk.probability}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Business Insights */}
      <div className="insights-section">
        <h3>💡 Strategic Insights</h3>
        <div className="insights-list">
          {analytics.insights.map((insight, index) => (
            <div key={index} className={`insight-card ${insight.type}`}>
              <div className="insight-header">
                <div className={`insight-icon ${insight.type}`}>
                  {insight.type === 'opportunity' && <TrendingUp size={20} />}
                  {insight.type === 'warning' && <AlertTriangle size={20} />}
                  {insight.type === 'success' && <Target size={20} />}
                </div>
                <div className="insight-priority">
                  <span className={`priority-badge ${insight.priority}`}>
                    {insight.priority} priority
                  </span>
                </div>
              </div>
              <div className="insight-content">
                <h4>{insight.title}</h4>
                <p>{insight.description}</p>
                <div className="insight-impact">
                  <strong>Impact:</strong> {insight.impact}
                </div>
                <div className="insight-action">
                  <strong>Recommended Action:</strong> {insight.action}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EnhancedDashboard
