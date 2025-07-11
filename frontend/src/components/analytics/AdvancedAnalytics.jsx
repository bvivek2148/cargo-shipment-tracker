import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Clock, MapPin, AlertTriangle, Target, Zap, Globe } from 'lucide-react'

// Machine Learning-inspired prediction algorithms
const PredictionEngine = {
  // Predict delivery time based on historical data
  predictDeliveryTime: (shipment, historicalData) => {
    const baseTime = calculateBaseDeliveryTime(shipment)
    const weatherFactor = getWeatherDelayFactor(shipment.route)
    const seasonalFactor = getSeasonalFactor(new Date())
    const routeFactor = getRouteComplexityFactor(shipment.route)
    
    const predictedTime = baseTime * weatherFactor * seasonalFactor * routeFactor
    const confidence = calculateConfidence(historicalData, shipment)
    
    return {
      estimatedDays: Math.round(predictedTime * 10) / 10,
      confidence: Math.round(confidence * 100),
      factors: {
        weather: weatherFactor,
        seasonal: seasonalFactor,
        route: routeFactor
      }
    }
  },

  // Predict potential delays
  predictDelayRisk: (shipment) => {
    const riskFactors = {
      weather: getWeatherRisk(shipment.route),
      customs: getCustomsRisk(shipment.origin, shipment.destination),
      port: getPortCongestionRisk(shipment.route),
      seasonal: getSeasonalRisk(new Date()),
      cargo: getCargoRisk(shipment.cargo)
    }

    const totalRisk = Object.values(riskFactors).reduce((sum, risk) => sum + risk, 0) / 5
    
    return {
      riskLevel: totalRisk > 0.7 ? 'high' : totalRisk > 0.4 ? 'medium' : 'low',
      riskScore: Math.round(totalRisk * 100),
      factors: riskFactors,
      recommendations: generateRecommendations(riskFactors)
    }
  },

  // Analyze route efficiency
  analyzeRouteEfficiency: (route, alternatives) => {
    const efficiency = {
      distance: calculateRouteDistance(route),
      time: calculateRouteTime(route),
      cost: calculateRouteCost(route),
      emissions: calculateEmissions(route)
    }

    const optimizationPotential = calculateOptimizationPotential(route, alternatives)
    
    return {
      efficiency,
      optimizationPotential,
      score: calculateEfficiencyScore(efficiency),
      recommendations: generateEfficiencyRecommendations(efficiency, optimizationPotential)
    }
  }
}

// Helper functions for predictions
function calculateBaseDeliveryTime(shipment) {
  const distances = {
    'New York, USA-London, UK': 12,
    'Shanghai, China-Los Angeles, USA': 18,
    'Tokyo, Japan-Sydney, Australia': 8,
    'Hamburg, Germany-Mumbai, India': 15
  }
  
  const routeKey = `${shipment.origin}-${shipment.destination}`
  return distances[routeKey] || 14 // Default 14 days
}

function getWeatherDelayFactor(route) {
  // Simulate weather impact (1.0 = no delay, 1.5 = 50% delay)
  return 1.0 + Math.random() * 0.3
}

function getSeasonalFactor(date) {
  const month = date.getMonth()
  // Winter months have higher delays
  return month >= 11 || month <= 2 ? 1.2 : 1.0
}

function getRouteComplexityFactor(route) {
  // More complex routes have higher delays
  return 1.0 + Math.random() * 0.2
}

function calculateConfidence(historicalData, shipment) {
  // Simulate confidence based on historical accuracy
  return 0.75 + Math.random() * 0.2
}

function getWeatherRisk(route) {
  return Math.random() * 0.4 // 0-40% weather risk
}

function getCustomsRisk(origin, destination) {
  const highRiskRoutes = ['China', 'India', 'Russia']
  const isHighRisk = highRiskRoutes.some(country => 
    origin.includes(country) || destination.includes(country)
  )
  return isHighRisk ? 0.3 + Math.random() * 0.4 : Math.random() * 0.2
}

function getPortCongestionRisk(route) {
  return Math.random() * 0.3 // 0-30% port congestion risk
}

function getSeasonalRisk(date) {
  const month = date.getMonth()
  return month >= 11 || month <= 2 ? 0.3 : 0.1 // Higher risk in winter
}

function getCargoRisk(cargo) {
  const highRiskCargo = ['Electronics', 'Chemicals', 'Pharmaceuticals']
  return highRiskCargo.includes(cargo) ? 0.2 : 0.1
}

function generateRecommendations(riskFactors) {
  const recommendations = []
  
  if (riskFactors.weather > 0.5) {
    recommendations.push('Monitor weather conditions and consider route alternatives')
  }
  if (riskFactors.customs > 0.4) {
    recommendations.push('Ensure all customs documentation is complete')
  }
  if (riskFactors.port > 0.4) {
    recommendations.push('Consider alternative ports to avoid congestion')
  }
  
  return recommendations
}

function calculateRouteDistance(route) {
  return 8500 + Math.random() * 3000 // km
}

function calculateRouteTime(route) {
  return 12 + Math.random() * 8 // days
}

function calculateRouteCost(route) {
  return 15000 + Math.random() * 10000 // USD
}

function calculateEmissions(route) {
  return 2.5 + Math.random() * 1.5 // tons CO2
}

function calculateOptimizationPotential(route, alternatives) {
  return {
    timeReduction: Math.random() * 20, // % improvement possible
    costReduction: Math.random() * 15,
    emissionReduction: Math.random() * 25
  }
}

function calculateEfficiencyScore(efficiency) {
  // Simplified scoring algorithm
  return Math.round(75 + Math.random() * 20) // 75-95 score
}

function generateEfficiencyRecommendations(efficiency, optimization) {
  const recommendations = []
  
  if (optimization.timeReduction > 10) {
    recommendations.push('Route optimization could reduce delivery time by up to ' + Math.round(optimization.timeReduction) + '%')
  }
  if (optimization.costReduction > 8) {
    recommendations.push('Alternative routes could reduce costs by up to ' + Math.round(optimization.costReduction) + '%')
  }
  if (optimization.emissionReduction > 15) {
    recommendations.push('Eco-friendly routing could reduce emissions by up to ' + Math.round(optimization.emissionReduction) + '%')
  }
  
  return recommendations
}

function AdvancedAnalytics({ shipments = [], selectedShipment = null }) {
  const [analytics, setAnalytics] = useState(null)
  const [predictions, setPredictions] = useState(null)
  const [performanceMetrics, setPerformanceMetrics] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    generateAnalytics()
  }, [shipments, selectedShipment])

  const generateAnalytics = async () => {
    setLoading(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate comprehensive analytics
    const analyticsData = {
      overview: {
        totalShipments: shipments.length,
        onTimeDelivery: 94.2,
        averageDeliveryTime: 12.5,
        costEfficiency: 87.3,
        customerSatisfaction: 96.1
      },
      trends: {
        deliveryTrend: generateTrendData(),
        costTrend: generateTrendData(),
        efficiencyTrend: generateTrendData()
      },
      predictions: shipments.map(shipment => ({
        shipment,
        deliveryPrediction: PredictionEngine.predictDeliveryTime(shipment, []),
        delayRisk: PredictionEngine.predictDelayRisk(shipment),
        routeEfficiency: PredictionEngine.analyzeRouteEfficiency(shipment.route, [])
      })),
      insights: generateInsights(shipments)
    }
    
    setAnalytics(analyticsData)
    
    if (selectedShipment) {
      const shipmentPredictions = {
        delivery: PredictionEngine.predictDeliveryTime(selectedShipment, []),
        risk: PredictionEngine.predictDelayRisk(selectedShipment),
        efficiency: PredictionEngine.analyzeRouteEfficiency(selectedShipment.route, [])
      }
      setPredictions(shipmentPredictions)
    }
    
    setPerformanceMetrics(generatePerformanceMetrics(shipments))
    setLoading(false)
  }

  const generateTrendData = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
      value: 80 + Math.random() * 20
    }))
  }

  const generateInsights = (shipments) => {
    return [
      {
        type: 'optimization',
        title: 'Route Optimization Opportunity',
        description: '23% of routes could be optimized for better efficiency',
        impact: 'Potential 15% cost reduction',
        priority: 'high'
      },
      {
        type: 'prediction',
        title: 'Seasonal Delay Pattern',
        description: 'Winter months show 20% higher delay rates',
        impact: 'Plan buffer time for Q1 shipments',
        priority: 'medium'
      },
      {
        type: 'performance',
        title: 'Port Performance Analysis',
        description: 'Shanghai port shows fastest processing times',
        impact: 'Consider routing more shipments through Shanghai',
        priority: 'low'
      }
    ]
  }

  const generatePerformanceMetrics = (shipments) => {
    return {
      efficiency: {
        score: 87.3,
        trend: '+2.1%',
        factors: [
          { name: 'Route Optimization', score: 89, weight: 30 },
          { name: 'Port Efficiency', score: 85, weight: 25 },
          { name: 'Documentation', score: 92, weight: 20 },
          { name: 'Weather Impact', score: 83, weight: 15 },
          { name: 'Customs Processing', score: 88, weight: 10 }
        ]
      },
      sustainability: {
        co2Emissions: 2847, // tons
        fuelEfficiency: 91.2, // %
        ecoRoutes: 67, // % of routes using eco-friendly options
        carbonOffset: 1250 // tons offset
      },
      financial: {
        totalCost: 2450000, // USD
        costPerKm: 2.85,
        fuelCosts: 890000,
        savings: 125000 // from optimizations
      }
    }
  }

  if (loading) {
    return (
      <div className="advanced-analytics loading">
        <div className="loading-content">
          <BarChart3 size={48} className="loading-icon" />
          <h3>Generating Advanced Analytics...</h3>
          <p>Analyzing shipment data and generating predictions</p>
        </div>
      </div>
    )
  }

  return (
    <div className="advanced-analytics">
      <div className="analytics-header">
        <h3>📊 Advanced Analytics & Predictions</h3>
        <div className="analytics-summary">
          <span>AI-powered insights for {shipments.length} shipments</span>
        </div>
      </div>

      {/* Key Performance Indicators */}
      {analytics && (
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon">
              <Target size={24} />
            </div>
            <div className="kpi-content">
              <div className="kpi-value">{analytics.overview.onTimeDelivery}%</div>
              <div className="kpi-label">On-time Delivery</div>
              <div className="kpi-trend positive">+1.2%</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">
              <Clock size={24} />
            </div>
            <div className="kpi-content">
              <div className="kpi-value">{analytics.overview.averageDeliveryTime}</div>
              <div className="kpi-label">Avg Delivery (days)</div>
              <div className="kpi-trend negative">-0.3</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">
              <Zap size={24} />
            </div>
            <div className="kpi-content">
              <div className="kpi-value">{analytics.overview.costEfficiency}%</div>
              <div className="kpi-label">Cost Efficiency</div>
              <div className="kpi-trend positive">+2.1%</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">
              <Globe size={24} />
            </div>
            <div className="kpi-content">
              <div className="kpi-value">{analytics.overview.customerSatisfaction}%</div>
              <div className="kpi-label">Customer Satisfaction</div>
              <div className="kpi-trend positive">+0.8%</div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Shipment Predictions */}
      {selectedShipment && predictions && (
        <div className="shipment-predictions">
          <h4>🔮 Predictions for {selectedShipment.trackingNumber}</h4>
          
          <div className="prediction-grid">
            <div className="prediction-card">
              <h5>📅 Delivery Prediction</h5>
              <div className="prediction-content">
                <div className="prediction-value">
                  {predictions.delivery.estimatedDays} days
                </div>
                <div className="prediction-confidence">
                  {predictions.delivery.confidence}% confidence
                </div>
                <div className="prediction-factors">
                  <span>Weather: {Math.round(predictions.delivery.factors.weather * 100)}%</span>
                  <span>Seasonal: {Math.round(predictions.delivery.factors.seasonal * 100)}%</span>
                  <span>Route: {Math.round(predictions.delivery.factors.route * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="prediction-card">
              <h5>⚠️ Delay Risk Analysis</h5>
              <div className="prediction-content">
                <div className={`risk-level ${predictions.risk.riskLevel}`}>
                  {predictions.risk.riskLevel.toUpperCase()} RISK
                </div>
                <div className="risk-score">
                  {predictions.risk.riskScore}% risk score
                </div>
                <div className="risk-factors">
                  {Object.entries(predictions.risk.factors).map(([factor, value]) => (
                    <div key={factor} className="risk-factor">
                      <span>{factor}:</span>
                      <div className="risk-bar">
                        <div 
                          className="risk-fill" 
                          style={{ width: `${value * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {predictions.risk.recommendations.length > 0 && (
            <div className="recommendations">
              <h5>💡 Recommendations</h5>
              <ul>
                {predictions.risk.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Performance Metrics */}
      {performanceMetrics && (
        <div className="performance-metrics">
          <h4>📈 Performance Metrics</h4>
          
          <div className="metrics-grid">
            <div className="metric-card">
              <h5>⚡ Efficiency Score</h5>
              <div className="efficiency-score">
                <div className="score-circle">
                  <span className="score-value">{performanceMetrics.efficiency.score}</span>
                  <span className="score-trend">{performanceMetrics.efficiency.trend}</span>
                </div>
                <div className="efficiency-factors">
                  {performanceMetrics.efficiency.factors.map((factor, index) => (
                    <div key={index} className="factor-item">
                      <span className="factor-name">{factor.name}</span>
                      <div className="factor-bar">
                        <div 
                          className="factor-fill" 
                          style={{ width: `${factor.score}%` }}
                        ></div>
                      </div>
                      <span className="factor-score">{factor.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="metric-card">
              <h5>🌱 Sustainability</h5>
              <div className="sustainability-metrics">
                <div className="metric-item">
                  <span className="metric-label">CO₂ Emissions</span>
                  <span className="metric-value">{performanceMetrics.sustainability.co2Emissions.toLocaleString()} tons</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Fuel Efficiency</span>
                  <span className="metric-value">{performanceMetrics.sustainability.fuelEfficiency}%</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Eco Routes</span>
                  <span className="metric-value">{performanceMetrics.sustainability.ecoRoutes}%</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Carbon Offset</span>
                  <span className="metric-value">{performanceMetrics.sustainability.carbonOffset.toLocaleString()} tons</span>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <h5>💰 Financial Performance</h5>
              <div className="financial-metrics">
                <div className="metric-item">
                  <span className="metric-label">Total Cost</span>
                  <span className="metric-value">${performanceMetrics.financial.totalCost.toLocaleString()}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Cost per KM</span>
                  <span className="metric-value">${performanceMetrics.financial.costPerKm}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Fuel Costs</span>
                  <span className="metric-value">${performanceMetrics.financial.fuelCosts.toLocaleString()}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Savings</span>
                  <span className="metric-value positive">${performanceMetrics.financial.savings.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {analytics && (
        <div className="ai-insights">
          <h4>🤖 AI-Generated Insights</h4>
          <div className="insights-list">
            {analytics.insights.map((insight, index) => (
              <div key={index} className={`insight-card ${insight.priority}`}>
                <div className="insight-header">
                  <span className="insight-type">{insight.type}</span>
                  <span className={`insight-priority ${insight.priority}`}>
                    {insight.priority} priority
                  </span>
                </div>
                <h5>{insight.title}</h5>
                <p>{insight.description}</p>
                <div className="insight-impact">
                  <strong>Impact:</strong> {insight.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedAnalytics
