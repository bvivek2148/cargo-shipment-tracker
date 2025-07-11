import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2'
import { TrendingUp, BarChart3, PieChart, Activity, Download, RefreshCw } from 'lucide-react'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function AdvancedCharts() {
  const [selectedChart, setSelectedChart] = useState('revenue-trend')
  const [timeRange, setTimeRange] = useState('30d')
  const [chartData, setChartData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateChartData()
  }, [selectedChart, timeRange])

  const generateChartData = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))

    const data = {
      'revenue-trend': {
        type: 'line',
        title: 'Revenue Trend Analysis',
        data: {
          labels: generateDateLabels(30),
          datasets: [
            {
              label: 'Actual Revenue',
              data: generateTrendData(2500000, 30, 0.1),
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Predicted Revenue',
              data: generateTrendData(2700000, 30, 0.05),
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderDash: [5, 5],
              fill: false,
              tension: 0.4
            },
            {
              label: 'Target Revenue',
              data: Array(30).fill(3000000),
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              borderDash: [10, 5],
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Revenue Performance vs Targets'
            },
            legend: {
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                callback: function(value) {
                  return '$' + (value / 1000000).toFixed(1) + 'M'
                }
              }
            }
          }
        }
      },
      'shipment-volume': {
        type: 'bar',
        title: 'Shipment Volume by Route',
        data: {
          labels: ['Shanghai-LA', 'Hamburg-NY', 'Singapore-Dubai', 'Tokyo-Sydney', 'Rotterdam-Mumbai'],
          datasets: [
            {
              label: 'Current Month',
              data: [234, 189, 156, 143, 128],
              backgroundColor: '#3b82f6',
              borderRadius: 8
            },
            {
              label: 'Previous Month',
              data: [198, 167, 134, 156, 145],
              backgroundColor: '#93c5fd',
              borderRadius: 8
            },
            {
              label: 'Target',
              data: [250, 200, 170, 160, 150],
              backgroundColor: '#f59e0b',
              borderRadius: 8
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Top Routes Performance'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Shipments'
              }
            }
          }
        }
      },
      'cargo-distribution': {
        type: 'doughnut',
        title: 'Cargo Type Distribution',
        data: {
          labels: ['Electronics', 'Textiles', 'Machinery', 'Automotive', 'Consumer Goods', 'Others'],
          datasets: [
            {
              data: [342, 298, 234, 189, 184, 156],
              backgroundColor: [
                '#3b82f6',
                '#10b981',
                '#f59e0b',
                '#ef4444',
                '#8b5cf6',
                '#6b7280'
              ],
              borderWidth: 2,
              borderColor: '#ffffff'
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Cargo Volume by Type'
            },
            legend: {
              position: 'right'
            }
          }
        }
      },
      'performance-radar': {
        type: 'radar',
        title: 'Performance Metrics Radar',
        data: {
          labels: ['On-time Delivery', 'Cost Efficiency', 'Customer Satisfaction', 'Route Optimization', 'Documentation', 'Communication'],
          datasets: [
            {
              label: 'Current Performance',
              data: [92, 87, 95, 89, 94, 91],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              pointBackgroundColor: '#3b82f6',
              pointBorderColor: '#ffffff',
              pointHoverBackgroundColor: '#ffffff',
              pointHoverBorderColor: '#3b82f6'
            },
            {
              label: 'Industry Average',
              data: [85, 82, 88, 83, 87, 86],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              pointBackgroundColor: '#10b981',
              pointBorderColor: '#ffffff',
              pointHoverBackgroundColor: '#ffffff',
              pointHoverBorderColor: '#10b981'
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Performance vs Industry Benchmarks'
            }
          },
          scales: {
            r: {
              beginAtZero: true,
              max: 100,
              ticks: {
                stepSize: 20
              }
            }
          }
        }
      },
      'delivery-timeline': {
        type: 'line',
        title: 'Delivery Time Trends',
        data: {
          labels: generateDateLabels(30),
          datasets: [
            {
              label: 'Average Delivery Time',
              data: generateTrendData(12, 30, 0.2),
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Target Delivery Time',
              data: Array(30).fill(10),
              borderColor: '#10b981',
              borderDash: [5, 5],
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Delivery Time Performance'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Days'
              }
            }
          }
        }
      },
      'cost-analysis': {
        type: 'bar',
        title: 'Cost Breakdown Analysis',
        data: {
          labels: ['Fuel', 'Port Fees', 'Insurance', 'Labor', 'Maintenance', 'Documentation'],
          datasets: [
            {
              label: 'Q4 2024',
              data: [450000, 230000, 180000, 320000, 150000, 80000],
              backgroundColor: '#3b82f6'
            },
            {
              label: 'Q3 2024',
              data: [420000, 210000, 175000, 300000, 140000, 75000],
              backgroundColor: '#93c5fd'
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Quarterly Cost Comparison'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + (value / 1000).toFixed(0) + 'K'
                }
              }
            }
          }
        }
      }
    }

    setChartData(data)
    setLoading(false)
  }

  const generateDateLabels = (days) => {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })
  }

  const generateTrendData = (baseValue, points, volatility) => {
    return Array.from({ length: points }, (_, i) => {
      const trend = baseValue * (1 + (i / points) * 0.1) // 10% growth trend
      const noise = (Math.random() - 0.5) * baseValue * volatility
      return Math.round(trend + noise)
    })
  }

  const chartTypes = [
    { id: 'revenue-trend', name: 'Revenue Trends', icon: TrendingUp },
    { id: 'shipment-volume', name: 'Shipment Volume', icon: BarChart3 },
    { id: 'cargo-distribution', name: 'Cargo Distribution', icon: PieChart },
    { id: 'performance-radar', name: 'Performance Radar', icon: Activity },
    { id: 'delivery-timeline', name: 'Delivery Timeline', icon: TrendingUp },
    { id: 'cost-analysis', name: 'Cost Analysis', icon: BarChart3 }
  ]

  const renderChart = () => {
    if (loading || !chartData[selectedChart]) {
      return (
        <div className="chart-loading">
          <RefreshCw size={32} className="loading-icon" />
          <p>Loading chart data...</p>
        </div>
      )
    }

    const chart = chartData[selectedChart]
    const ChartComponent = {
      line: Line,
      bar: Bar,
      doughnut: Doughnut,
      radar: Radar
    }[chart.type]

    return (
      <div className="chart-container">
        <ChartComponent data={chart.data} options={chart.options} />
      </div>
    )
  }

  const exportChart = () => {
    // In a real implementation, this would export the chart as image/PDF
    console.log('Exporting chart:', selectedChart)
    alert('Chart export functionality would be implemented here')
  }

  return (
    <div className="advanced-charts">
      <div className="charts-header">
        <h3>📊 Advanced Data Visualization</h3>
        <div className="charts-controls">
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
          
          <button onClick={exportChart} className="btn btn-secondary">
            <Download size={16} />
            Export
          </button>
          
          <button onClick={generateChartData} className="btn btn-primary">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="charts-layout">
        {/* Chart Type Selector */}
        <div className="chart-selector">
          <h4>Chart Types</h4>
          <div className="chart-types">
            {chartTypes.map(chart => {
              const IconComponent = chart.icon
              return (
                <button
                  key={chart.id}
                  onClick={() => setSelectedChart(chart.id)}
                  className={`chart-type-btn ${selectedChart === chart.id ? 'active' : ''}`}
                >
                  <IconComponent size={20} />
                  <span>{chart.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Chart Display */}
        <div className="chart-display">
          <div className="chart-header">
            <h4>{chartData[selectedChart]?.title || 'Loading...'}</h4>
          </div>
          {renderChart()}
        </div>
      </div>

      {/* Chart Insights */}
      <div className="chart-insights">
        <h4>📈 Key Insights</h4>
        <div className="insights-grid">
          <div className="insight-item">
            <div className="insight-icon">
              <TrendingUp size={20} />
            </div>
            <div className="insight-content">
              <h5>Revenue Growth</h5>
              <p>Revenue shows consistent 12.5% growth trend with seasonal peaks in Q4</p>
            </div>
          </div>
          
          <div className="insight-item">
            <div className="insight-icon">
              <BarChart3 size={20} />
            </div>
            <div className="insight-content">
              <h5>Route Performance</h5>
              <p>Shanghai-LA route outperforms others by 23% in volume and efficiency</p>
            </div>
          </div>
          
          <div className="insight-item">
            <div className="insight-icon">
              <PieChart size={20} />
            </div>
            <div className="insight-content">
              <h5>Cargo Mix</h5>
              <p>Electronics cargo dominates with 27% share, showing highest profit margins</p>
            </div>
          </div>
          
          <div className="insight-item">
            <div className="insight-icon">
              <Activity size={20} />
            </div>
            <div className="insight-content">
              <h5>Performance Metrics</h5>
              <p>All metrics exceed industry average, with customer satisfaction leading at 95%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdvancedCharts
