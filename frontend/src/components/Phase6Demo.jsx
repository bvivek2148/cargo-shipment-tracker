import { useState } from 'react'
import { BarChart3, Brain, FileText, TrendingUp, Settings, Target } from 'lucide-react'
import EnhancedDashboard from './analytics/EnhancedDashboard'
import AdvancedCharts from './charts/AdvancedCharts'
import PredictiveEngine from './analytics/PredictiveEngine'
import AutomatedReporting from './reports/AutomatedReporting'
import BusinessIntelligence from './analytics/BusinessIntelligence'

function Phase6Demo() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="phase6-demo">
      <div className="demo-header">
        <h2>📊 Phase 6: Advanced Analytics & Reporting</h2>
        <p>Business intelligence, predictive analytics, and automated reporting for strategic decision making</p>
      </div>

      {/* Feature Overview */}
      <div className="features-overview">
        <div className="feature-card">
          <div className="feature-icon">
            <BarChart3 size={32} />
          </div>
          <div className="feature-content">
            <h3>Enhanced Analytics Dashboard</h3>
            <p>Advanced KPI tracking and business intelligence with real-time insights</p>
            <ul>
              <li>Real-time KPI monitoring</li>
              <li>Predictive analytics</li>
              <li>Risk assessment</li>
              <li>Strategic insights</li>
              <li>Performance benchmarking</li>
            </ul>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <Brain size={32} />
          </div>
          <div className="feature-content">
            <h3>AI-Powered Predictions</h3>
            <p>Machine learning models for delivery predictions and trend analysis</p>
            <ul>
              <li>Delivery time prediction</li>
              <li>Demand forecasting</li>
              <li>Risk assessment models</li>
              <li>ML model accuracy tracking</li>
              <li>Confidence intervals</li>
            </ul>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <FileText size={32} />
          </div>
          <div className="feature-content">
            <h3>Automated Reporting</h3>
            <p>Scheduled reports with custom builders and automated delivery</p>
            <ul>
              <li>Custom report builder</li>
              <li>Scheduled generation</li>
              <li>Email distribution</li>
              <li>Multiple formats</li>
              <li>Report templates</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Demo Tabs */}
      <div className="demo-tabs">
        <button 
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <BarChart3 size={16} />
          Enhanced Dashboard
        </button>
        <button 
          className={`tab-button ${activeTab === 'charts' ? 'active' : ''}`}
          onClick={() => setActiveTab('charts')}
        >
          <TrendingUp size={16} />
          Advanced Charts
        </button>
        <button 
          className={`tab-button ${activeTab === 'predictions' ? 'active' : ''}`}
          onClick={() => setActiveTab('predictions')}
        >
          <Brain size={16} />
          Predictive Engine
        </button>
        <button 
          className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <FileText size={16} />
          Automated Reports
        </button>
        <button 
          className={`tab-button ${activeTab === 'business' ? 'active' : ''}`}
          onClick={() => setActiveTab('business')}
        >
          <Target size={16} />
          Business Intelligence
        </button>
      </div>

      {/* Tab Content */}
      <div className="demo-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-demo">
            <div className="demo-section">
              <h3>📊 Enhanced Analytics Dashboard</h3>
              <p>Comprehensive business intelligence with KPI tracking and strategic insights</p>
            </div>
            <EnhancedDashboard />
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="charts-demo">
            <div className="demo-section">
              <h3>📈 Advanced Data Visualization</h3>
              <p>Interactive charts and graphs with real-time data and insights</p>
            </div>
            <AdvancedCharts />
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="predictions-demo">
            <div className="demo-section">
              <h3>🧠 AI-Powered Predictive Analytics</h3>
              <p>Machine learning models for delivery predictions and business forecasting</p>
            </div>
            <PredictiveEngine />
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-demo">
            <div className="demo-section">
              <h3>📋 Automated Reporting System</h3>
              <p>Create, schedule, and distribute custom reports automatically</p>
            </div>
            <AutomatedReporting />
          </div>
        )}

        {activeTab === 'business' && (
          <div className="business-demo">
            <div className="demo-section">
              <h3>🏢 Executive Business Intelligence</h3>
              <p>Strategic insights and performance analytics for executive decision making</p>
            </div>
            <BusinessIntelligence />
          </div>
        )}
      </div>

      {/* Phase 6 Summary */}
      <div className="phase6-summary">
        <h3>🎉 Phase 6 Complete!</h3>
        <p>The Cargo Shipment Tracker now includes advanced analytics and business intelligence:</p>
        
        <div className="summary-grid">
          <div className="summary-item">
            <h4>📊 Enhanced Analytics</h4>
            <ul>
              <li>Real-time KPI monitoring</li>
              <li>Advanced data visualization</li>
              <li>Performance benchmarking</li>
              <li>Strategic insights generation</li>
              <li>Risk assessment and mitigation</li>
            </ul>
          </div>
          
          <div className="summary-item">
            <h4>🧠 Predictive Analytics</h4>
            <ul>
              <li>ML-powered delivery predictions</li>
              <li>Demand forecasting models</li>
              <li>Risk assessment algorithms</li>
              <li>Confidence interval tracking</li>
              <li>Model accuracy monitoring</li>
            </ul>
          </div>
          
          <div className="summary-item">
            <h4>📋 Automated Reporting</h4>
            <ul>
              <li>Custom report builder</li>
              <li>Scheduled report generation</li>
              <li>Multi-format export (PDF, Excel)</li>
              <li>Email distribution lists</li>
              <li>Report template library</li>
            </ul>
          </div>
          
          <div className="summary-item">
            <h4>🏢 Business Intelligence</h4>
            <ul>
              <li>Executive dashboard</li>
              <li>Strategic performance metrics</li>
              <li>Competitive analysis</li>
              <li>Market positioning insights</li>
              <li>Growth opportunity identification</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Phase6Demo
