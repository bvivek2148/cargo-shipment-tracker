import { useState } from 'react'
import { X, Download, FileText, FileSpreadsheet, FileImage, Calendar, Filter } from 'lucide-react'
import { format } from 'date-fns'
import exportService from '../services/exportService'

function ExportModal({ isOpen, onClose, shipments, filters }) {
  const [exportFormat, setExportFormat] = useState('csv')
  const [exportScope, setExportScope] = useState('filtered')
  const [isExporting, setIsExporting] = useState(false)
  const [exportResult, setExportResult] = useState(null)

  if (!isOpen) return null

  const exportOptions = [
    {
      value: 'csv',
      label: 'CSV Spreadsheet',
      icon: FileSpreadsheet,
      description: 'Export data in CSV format for Excel or Google Sheets'
    },
    {
      value: 'pdf',
      label: 'PDF Report',
      icon: FileText,
      description: 'Generate a formatted PDF report with summary'
    },
    {
      value: 'detailed',
      label: 'Detailed PDF Report',
      icon: FileImage,
      description: 'Comprehensive PDF report with full shipment details'
    }
  ]

  const scopeOptions = [
    {
      value: 'filtered',
      label: 'Current View',
      description: `Export ${shipments.length} shipments from current filters`
    },
    {
      value: 'all',
      label: 'All Shipments',
      description: 'Export all shipments regardless of filters'
    }
  ]

  const handleExport = async () => {
    setIsExporting(true)
    setExportResult(null)

    try {
      let dataToExport = shipments
      let filename = 'shipments'

      // Determine filename based on scope and filters
      if (exportScope === 'filtered') {
        filename = 'filtered_shipments'
        if (filters.status !== 'all') {
          filename += `_${filters.status.toLowerCase().replace(' ', '_')}`
        }
        if (filters.startDate || filters.endDate) {
          filename += '_date_range'
        }
      } else {
        filename = 'all_shipments'
      }

      let result
      switch (exportFormat) {
        case 'csv':
          result = exportService.exportToCSV(dataToExport, filename)
          break
        case 'pdf':
          result = exportService.exportToPDF(dataToExport, filename)
          break
        case 'detailed':
          result = exportService.exportDetailedReport(dataToExport, filename)
          break
        default:
          throw new Error('Invalid export format')
      }

      setExportResult(result)
      
      if (result.success) {
        setTimeout(() => {
          onClose()
          setExportResult(null)
        }, 2000)
      }
    } catch (error) {
      setExportResult({
        success: false,
        message: 'Export failed: ' + error.message
      })
    } finally {
      setIsExporting(false)
    }
  }

  const getActiveFiltersText = () => {
    const activeFilters = []
    
    if (filters.status !== 'all') {
      activeFilters.push(`Status: ${filters.status}`)
    }
    if (filters.search) {
      activeFilters.push(`Search: "${filters.search}"`)
    }
    if (filters.startDate || filters.endDate) {
      const dateRange = `${filters.startDate || 'Start'} to ${filters.endDate || 'End'}`
      activeFilters.push(`Date Range: ${dateRange}`)
    }
    if (filters.cargoType) {
      activeFilters.push(`Cargo: ${filters.cargoType}`)
    }
    if (filters.priority !== 'all') {
      activeFilters.push(`Priority: ${filters.priority}`)
    }

    return activeFilters.length > 0 ? activeFilters.join(', ') : 'No filters applied'
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content export-modal">
        <div className="modal-header">
          <h2>
            <Download size={24} />
            Export Shipments
          </h2>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Export Format Selection */}
          <div className="export-section">
            <h3>Export Format</h3>
            <div className="export-options">
              {exportOptions.map(option => (
                <label key={option.value} className="export-option">
                  <input
                    type="radio"
                    name="exportFormat"
                    value={option.value}
                    checked={exportFormat === option.value}
                    onChange={(e) => setExportFormat(e.target.value)}
                  />
                  <div className="option-content">
                    <div className="option-header">
                      <option.icon size={20} />
                      <span className="option-label">{option.label}</span>
                    </div>
                    <p className="option-description">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Export Scope Selection */}
          <div className="export-section">
            <h3>Export Scope</h3>
            <div className="scope-options">
              {scopeOptions.map(option => (
                <label key={option.value} className="scope-option">
                  <input
                    type="radio"
                    name="exportScope"
                    value={option.value}
                    checked={exportScope === option.value}
                    onChange={(e) => setExportScope(e.target.value)}
                  />
                  <div className="option-content">
                    <span className="option-label">{option.label}</span>
                    <p className="option-description">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Current Filters Info */}
          {exportScope === 'filtered' && (
            <div className="filters-info">
              <div className="filters-header">
                <Filter size={16} />
                <span>Active Filters</span>
              </div>
              <p className="filters-text">{getActiveFiltersText()}</p>
            </div>
          )}

          {/* Export Summary */}
          <div className="export-summary">
            <div className="summary-item">
              <Calendar size={16} />
              <span>Export Date: {format(new Date(), 'MMM dd, yyyy HH:mm')}</span>
            </div>
            <div className="summary-item">
              <FileText size={16} />
              <span>Records: {shipments.length} shipments</span>
            </div>
          </div>

          {/* Export Result */}
          {exportResult && (
            <div className={`export-result ${exportResult.success ? 'success' : 'error'}`}>
              {exportResult.message}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button 
            onClick={handleExport} 
            disabled={isExporting}
            className="btn btn-primary"
          >
            <Download size={16} />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportModal
