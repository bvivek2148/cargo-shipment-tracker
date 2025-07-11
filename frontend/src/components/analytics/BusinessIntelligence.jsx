import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Users, Globe, Target, Award, AlertTriangle, Zap, BarChart3 } from 'lucide-react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

// Executive Business Intelligence Dashboard
function BusinessIntelligence() {
  const [timeframe, setTimeframe] = useState('quarter') // month, quarter, year
  const [biData, setBiData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedKPI, setSelectedKPI] = useState('revenue')

  useEffect(() => {
    generateBIData()
  }, [timeframe])

  const generateBIData = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))

    const data = {
      executiveSummary: {
        revenue: {
          current: 12450000,
          previous: 11200000,
          growth: 11.2,
          target: 13000000,
          targetProgress: 95.8
        },
        profitability: {
          grossMargin: 34.7,
          netMargin: 18.3,
          ebitda: 22.1,
          roi: 28.4
        },
        operations: {
          shipments: 4567,
          onTimeDelivery: 94.2,
          customerSatisfaction: 96.1,
          efficiency: 89.7
        },
        growth: {
          revenueGrowth: 11.2,
          customerGrowth: 8.7,
          marketShare: 15.3,
          expansion: 23.4
        }
      },
      strategicMetrics: {
        marketPosition: {
          rank: 3,
          totalMarket: 8,
          marketShare: 15.3,
          competitorGap: -2.1,
          growthRate: 11.2
        },
        customerMetrics: {
          totalCustomers: 1247,
          newCustomers: 89,
          churnRate: 3.2,
          ltv: 145000,
          acquisitionCost: 2400
        },
        operationalExcellence: {
          efficiency: 89.7,
          quality: 96.1,
          innovation: 78.4,
          sustainability: 82.3,
          digitalTransformation: 85.6
        }
      },
      riskAssessment: {
        overall: 'Medium',
        score: 42,
        factors: [
          { name: 'Market Risk', level: 'Low', score: 25, trend: 'stable' },
          { name: 'Operational Risk', level: 'Medium', score: 45, trend: 'improving' },
          { name: 'Financial Risk', level: 'Low', score: 30, trend: 'stable' },
          { name: 'Regulatory Risk', level: 'Medium', score: 55, trend: 'increasing' },
          { name: 'Technology Risk', level: 'Low', score: 35, trend: 'improving' }
        ]
      },
      opportunities: [
        {
          title: 'Asian Market Expansion',
          impact: 'High',
          effort: 'Medium',
          timeline: '6-12 months',
          revenue: 2800000,
          probability: 78
        },
        {
          title: 'AI-Powered Route Optimization',
          impact: 'Medium',
          effort: 'Low',
          timeline: '3-6 months',
          savings: 450000,
          probability: 92
        },
        {
          title: 'Green Shipping Initiative',
          impact: 'Medium',
          effort: 'Medium',
          timeline: '12-18 months',
          savings: 320000,
          probability: 65
        }
      ],
      competitiveAnalysis: {
        position: 'Strong',
        strengths: ['Technology', 'Customer Service', 'Innovation'],
        weaknesses: ['Market Share', 'Geographic Coverage'],
        threats: ['New Entrants', 'Price Competition'],
        opportunities: ['Digital Transformation', 'Sustainability']
      }
    }

    setBiData(data)
    setLoading(false)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value, showSign = true) => {
    const sign = showSign && value > 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  const getGrowthColor = (growth) => {
    return growth > 0 ? 'text-green-500' : 'text-red-500'
  }

  const getGrowthIcon = (growth) => {
    return growth > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />
  }

  const getRiskColor = (level) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-500'
      case 'medium': return 'text-yellow-500'
      case 'high': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getImpactColor = (impact) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="business-intelligence loading">
        <div className="loading-content">
          <BarChart3 size={48} className="loading-icon" />
          <h3>Generating Business Intelligence...</h3>
          <p>Analyzing strategic data and market insights</p>
        </div>
      </div>
    )
  }

  return (
    <div className="business-intelligence">
      <div className="bi-header">
        <div className="header-content">
          <h2>🏢 Executive Business Intelligence</h2>
          <p>Strategic insights and performance analytics for executive decision making</p>
        </div>
        
        <div className="header-controls">
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="timeframe-select"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="executive-summary">
        <h3>📊 Executive Summary</h3>
        <div className="summary-grid">
          {/* Revenue Card */}
          <div className="summary-card revenue">
            <div className="card-header">
              <div className="card-icon">
                <DollarSign size={28} />
              </div>
              <div className="card-trend">
                <span className={getGrowthColor(biData.executiveSummary.revenue.growth)}>
                  {getGrowthIcon(biData.executiveSummary.revenue.growth)}
                  {formatPercentage(biData.executiveSummary.revenue.growth)}
                </span>
              </div>
            </div>
            <div className="card-content">
              <div className="card-value">{formatCurrency(biData.executiveSummary.revenue.current)}</div>
              <div className="card-label">Total Revenue</div>
              <div className="card-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${biData.executiveSummary.revenue.targetProgress}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  {biData.executiveSummary.revenue.targetProgress}% of target
                </span>
              </div>
            </div>
          </div>

          {/* Profitability Card */}
          <div className="summary-card profitability">
            <div className="card-header">
              <div className="card-icon">
                <Target size={28} />
              </div>
              <div className="card-metrics">
                <span>Gross: {formatPercentage(biData.executiveSummary.profitability.grossMargin, false)}</span>
                <span>Net: {formatPercentage(biData.executiveSummary.profitability.netMargin, false)}</span>
              </div>
            </div>
            <div className="card-content">
              <div className="card-value">{formatPercentage(biData.executiveSummary.profitability.roi, false)}</div>
              <div className="card-label">Return on Investment</div>
              <div className="card-subtitle">
                EBITDA: {formatPercentage(biData.executiveSummary.profitability.ebitda, false)}
              </div>
            </div>
          </div>

          {/* Operations Card */}
          <div className="summary-card operations">
            <div className="card-header">
              <div className="card-icon">
                <Zap size={28} />
              </div>
              <div className="card-metrics">
                <span>OTD: {formatPercentage(biData.executiveSummary.operations.onTimeDelivery, false)}</span>
                <span>CSAT: {formatPercentage(biData.executiveSummary.operations.customerSatisfaction, false)}</span>
              </div>
            </div>
            <div className="card-content">
              <div className="card-value">{formatPercentage(biData.executiveSummary.operations.efficiency, false)}</div>
              <div className="card-label">Operational Efficiency</div>
              <div className="card-subtitle">
                {biData.executiveSummary.operations.shipments.toLocaleString()} shipments
              </div>
            </div>
          </div>

          {/* Growth Card */}
          <div className="summary-card growth">
            <div className="card-header">
              <div className="card-icon">
                <TrendingUp size={28} />
              </div>
              <div className="card-metrics">
                <span>Market: {formatPercentage(biData.executiveSummary.growth.marketShare, false)}</span>
                <span>Expansion: {formatPercentage(biData.executiveSummary.growth.expansion)}</span>
              </div>
            </div>
            <div className="card-content">
              <div className="card-value">{formatPercentage(biData.executiveSummary.growth.revenueGrowth)}</div>
              <div className="card-label">Revenue Growth</div>
              <div className="card-subtitle">
                Customer Growth: {formatPercentage(biData.executiveSummary.growth.customerGrowth)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Metrics */}
      <div className="strategic-metrics">
        <h3>🎯 Strategic Performance</h3>
        <div className="metrics-grid">
          {/* Market Position */}
          <div className="metric-card">
            <h4>🏆 Market Position</h4>
            <div className="position-content">
              <div className="rank-display">
                <span className="rank-number">#{biData.strategicMetrics.marketPosition.rank}</span>
                <span className="rank-label">Market Rank</span>
              </div>
              <div className="position-details">
                <div className="detail-item">
                  <span>Market Share:</span>
                  <span>{formatPercentage(biData.strategicMetrics.marketPosition.marketShare, false)}</span>
                </div>
                <div className="detail-item">
                  <span>Growth Rate:</span>
                  <span className={getGrowthColor(biData.strategicMetrics.marketPosition.growthRate)}>
                    {formatPercentage(biData.strategicMetrics.marketPosition.growthRate)}
                  </span>
                </div>
                <div className="detail-item">
                  <span>Competitor Gap:</span>
                  <span className={getGrowthColor(biData.strategicMetrics.marketPosition.competitorGap)}>
                    {formatPercentage(biData.strategicMetrics.marketPosition.competitorGap)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Metrics */}
          <div className="metric-card">
            <h4>👥 Customer Analytics</h4>
            <div className="customer-metrics">
              <div className="metric-row">
                <div className="metric-item">
                  <span className="metric-value">{biData.strategicMetrics.customerMetrics.totalCustomers.toLocaleString()}</span>
                  <span className="metric-label">Total Customers</span>
                </div>
                <div className="metric-item">
                  <span className="metric-value">{biData.strategicMetrics.customerMetrics.newCustomers}</span>
                  <span className="metric-label">New This Period</span>
                </div>
              </div>
              <div className="metric-row">
                <div className="metric-item">
                  <span className="metric-value">{formatCurrency(biData.strategicMetrics.customerMetrics.ltv)}</span>
                  <span className="metric-label">Lifetime Value</span>
                </div>
                <div className="metric-item">
                  <span className="metric-value">{formatPercentage(biData.strategicMetrics.customerMetrics.churnRate, false)}</span>
                  <span className="metric-label">Churn Rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Excellence */}
          <div className="metric-card">
            <h4>⚡ Operational Excellence</h4>
            <div className="excellence-radar">
              {Object.entries(biData.strategicMetrics.operationalExcellence).map(([key, value]) => (
                <div key={key} className="excellence-item">
                  <span className="excellence-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  <div className="excellence-bar">
                    <div 
                      className="excellence-fill" 
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                  <span className="excellence-value">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="risk-assessment">
        <h3>⚠️ Strategic Risk Assessment</h3>
        <div className="risk-overview">
          <div className="risk-summary">
            <div className={`risk-level ${biData.riskAssessment.overall.toLowerCase()}`}>
              {biData.riskAssessment.overall} Risk
            </div>
            <div className="risk-score">
              Overall Score: {biData.riskAssessment.score}/100
            </div>
          </div>
          
          <div className="risk-factors">
            {biData.riskAssessment.factors.map((factor, index) => (
              <div key={index} className="risk-factor">
                <div className="factor-header">
                  <span className="factor-name">{factor.name}</span>
                  <span className={`factor-level ${getRiskColor(factor.level)}`}>
                    {factor.level}
                  </span>
                </div>
                <div className="factor-bar">
                  <div 
                    className="factor-fill" 
                    style={{ width: `${factor.score}%` }}
                  ></div>
                </div>
                <div className="factor-trend">
                  Trend: {factor.trend}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Opportunities */}
      <div className="strategic-opportunities">
        <h3>🚀 Strategic Opportunities</h3>
        <div className="opportunities-grid">
          {biData.opportunities.map((opportunity, index) => (
            <div key={index} className="opportunity-card">
              <div className="opportunity-header">
                <h4>{opportunity.title}</h4>
                <div className="opportunity-badges">
                  <span className={`impact-badge ${getImpactColor(opportunity.impact)}`}>
                    {opportunity.impact} Impact
                  </span>
                  <span className="probability-badge">
                    {opportunity.probability}% Probability
                  </span>
                </div>
              </div>
              
              <div className="opportunity-content">
                <div className="opportunity-metrics">
                  {opportunity.revenue && (
                    <div className="metric">
                      <span className="metric-label">Revenue Potential:</span>
                      <span className="metric-value">{formatCurrency(opportunity.revenue)}</span>
                    </div>
                  )}
                  {opportunity.savings && (
                    <div className="metric">
                      <span className="metric-label">Cost Savings:</span>
                      <span className="metric-value">{formatCurrency(opportunity.savings)}</span>
                    </div>
                  )}
                  <div className="metric">
                    <span className="metric-label">Timeline:</span>
                    <span className="metric-value">{opportunity.timeline}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Effort:</span>
                    <span className="metric-value">{opportunity.effort}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitive Analysis */}
      <div className="competitive-analysis">
        <h3>🏁 Competitive Position</h3>
        <div className="swot-analysis">
          <div className="swot-grid">
            <div className="swot-card strengths">
              <h4>💪 Strengths</h4>
              <ul>
                {biData.competitiveAnalysis.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
            
            <div className="swot-card weaknesses">
              <h4>⚠️ Weaknesses</h4>
              <ul>
                {biData.competitiveAnalysis.weaknesses.map((weakness, index) => (
                  <li key={index}>{weakness}</li>
                ))}
              </ul>
            </div>
            
            <div className="swot-card opportunities">
              <h4>🚀 Opportunities</h4>
              <ul>
                {biData.competitiveAnalysis.opportunities.map((opp, index) => (
                  <li key={index}>{opp}</li>
                ))}
              </ul>
            </div>
            
            <div className="swot-card threats">
              <h4>🛡️ Threats</h4>
              <ul>
                {biData.competitiveAnalysis.threats.map((threat, index) => (
                  <li key={index}>{threat}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusinessIntelligence
