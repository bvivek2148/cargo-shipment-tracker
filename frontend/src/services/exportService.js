import jsPDF from 'jspdf'
import 'jspdf-autotable'
import Papa from 'papaparse'
import { saveAs } from 'file-saver'
import { format } from 'date-fns'

class ExportService {
  // Export shipments to CSV
  exportToCSV(shipments, filename = 'shipments') {
    try {
      const csvData = shipments.map(shipment => ({
        'Tracking Number': shipment.trackingNumber,
        'Origin': shipment.origin,
        'Destination': shipment.destination,
        'Status': shipment.status,
        'Cargo': shipment.cargo,
        'Weight': shipment.weight,
        'Priority': shipment.priority || 'Medium',
        'Estimated Delivery': shipment.estimatedDelivery ? 
          format(new Date(shipment.estimatedDelivery), 'yyyy-MM-dd') : '',
        'Created Date': shipment.createdAt ? 
          format(new Date(shipment.createdAt), 'yyyy-MM-dd HH:mm') : '',
        'Customer Name': shipment.customerInfo?.name || '',
        'Customer Email': shipment.customerInfo?.email || '',
        'Customer Phone': shipment.customerInfo?.phone || '',
        'Description': shipment.description || ''
      }))

      const csv = Papa.unparse(csvData)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm')
      saveAs(blob, `${filename}_${timestamp}.csv`)
      
      return { success: true, message: 'CSV export completed successfully' }
    } catch (error) {
      console.error('CSV export failed:', error)
      return { success: false, message: 'CSV export failed: ' + error.message }
    }
  }

  // Export shipments to PDF
  exportToPDF(shipments, filename = 'shipments', options = {}) {
    try {
      const doc = new jsPDF()
      const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm')
      
      // Header
      doc.setFontSize(20)
      doc.text('Cargo Shipment Report', 14, 22)
      
      doc.setFontSize(12)
      doc.text(`Generated on: ${timestamp}`, 14, 32)
      doc.text(`Total Shipments: ${shipments.length}`, 14, 40)
      
      // Summary statistics
      const statusCounts = this.getStatusCounts(shipments)
      let yPos = 50
      
      doc.setFontSize(14)
      doc.text('Summary:', 14, yPos)
      yPos += 10
      
      doc.setFontSize(10)
      Object.entries(statusCounts).forEach(([status, count]) => {
        doc.text(`${status}: ${count}`, 20, yPos)
        yPos += 6
      })
      
      yPos += 10

      // Prepare table data
      const tableData = shipments.map(shipment => [
        shipment.trackingNumber,
        shipment.origin,
        shipment.destination,
        shipment.status,
        shipment.cargo,
        shipment.weight,
        shipment.estimatedDelivery ? 
          format(new Date(shipment.estimatedDelivery), 'MM/dd/yyyy') : 'Not set'
      ])

      // Table
      doc.autoTable({
        head: [['Tracking #', 'Origin', 'Destination', 'Status', 'Cargo', 'Weight', 'ETA']],
        body: tableData,
        startY: yPos,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { top: 10 }
      })

      // Footer
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 10
        )
      }

      const pdfTimestamp = format(new Date(), 'yyyy-MM-dd_HH-mm')
      doc.save(`${filename}_${pdfTimestamp}.pdf`)
      
      return { success: true, message: 'PDF export completed successfully' }
    } catch (error) {
      console.error('PDF export failed:', error)
      return { success: false, message: 'PDF export failed: ' + error.message }
    }
  }

  // Export detailed shipment report
  exportDetailedReport(shipments, filename = 'detailed_shipment_report') {
    try {
      const doc = new jsPDF()
      const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm')
      
      // Header
      doc.setFontSize(20)
      doc.text('Detailed Cargo Shipment Report', 14, 22)
      
      doc.setFontSize(12)
      doc.text(`Generated on: ${timestamp}`, 14, 32)
      
      // Analytics section
      const analytics = this.generateAnalytics(shipments)
      let yPos = 50
      
      doc.setFontSize(16)
      doc.text('Analytics Overview', 14, yPos)
      yPos += 15
      
      doc.setFontSize(12)
      Object.entries(analytics).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 20, yPos)
        yPos += 8
      })
      
      yPos += 15

      // Detailed shipment information
      doc.setFontSize(16)
      doc.text('Shipment Details', 14, yPos)
      yPos += 15

      shipments.forEach((shipment, index) => {
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(12)
        doc.setFont(undefined, 'bold')
        doc.text(`${index + 1}. ${shipment.trackingNumber}`, 14, yPos)
        yPos += 8

        doc.setFont(undefined, 'normal')
        doc.setFontSize(10)
        
        const details = [
          `Origin: ${shipment.origin}`,
          `Destination: ${shipment.destination}`,
          `Status: ${shipment.status}`,
          `Cargo: ${shipment.cargo}`,
          `Weight: ${shipment.weight}`,
          `Priority: ${shipment.priority || 'Medium'}`,
          `ETA: ${shipment.estimatedDelivery ? 
            format(new Date(shipment.estimatedDelivery), 'MMM dd, yyyy') : 'Not set'}`,
          `Created: ${shipment.createdAt ? 
            format(new Date(shipment.createdAt), 'MMM dd, yyyy HH:mm') : 'Unknown'}`
        ]

        if (shipment.customerInfo?.name) {
          details.push(`Customer: ${shipment.customerInfo.name}`)
        }
        if (shipment.customerInfo?.email) {
          details.push(`Email: ${shipment.customerInfo.email}`)
        }
        if (shipment.description) {
          details.push(`Description: ${shipment.description}`)
        }

        details.forEach(detail => {
          doc.text(detail, 20, yPos)
          yPos += 6
        })
        
        yPos += 8
      })

      const pdfTimestamp = format(new Date(), 'yyyy-MM-dd_HH-mm')
      doc.save(`${filename}_${pdfTimestamp}.pdf`)
      
      return { success: true, message: 'Detailed report exported successfully' }
    } catch (error) {
      console.error('Detailed report export failed:', error)
      return { success: false, message: 'Detailed report export failed: ' + error.message }
    }
  }

  // Helper method to get status counts
  getStatusCounts(shipments) {
    return shipments.reduce((counts, shipment) => {
      counts[shipment.status] = (counts[shipment.status] || 0) + 1
      return counts
    }, {})
  }

  // Helper method to generate analytics
  generateAnalytics(shipments) {
    const total = shipments.length
    const statusCounts = this.getStatusCounts(shipments)
    const delivered = statusCounts['Delivered'] || 0
    const inTransit = statusCounts['In Transit'] || 0
    const pending = statusCounts['Pending'] || 0
    const cancelled = statusCounts['Cancelled'] || 0
    
    const deliveryRate = total > 0 ? ((delivered / total) * 100).toFixed(1) : 0
    
    const overdue = shipments.filter(s => {
      const eta = new Date(s.estimatedDelivery)
      const today = new Date()
      return eta < today && (s.status === 'Pending' || s.status === 'In Transit')
    }).length

    return {
      'Total Shipments': total,
      'Delivered': delivered,
      'In Transit': inTransit,
      'Pending': pending,
      'Cancelled': cancelled,
      'Delivery Success Rate': `${deliveryRate}%`,
      'Overdue Shipments': overdue
    }
  }

  // Export filtered data based on current filters
  exportFiltered(shipments, filters, format = 'csv') {
    const filename = `filtered_shipments_${filters.status !== 'all' ? filters.status : 'all'}`
    
    if (format === 'csv') {
      return this.exportToCSV(shipments, filename)
    } else if (format === 'pdf') {
      return this.exportToPDF(shipments, filename)
    } else if (format === 'detailed') {
      return this.exportDetailedReport(shipments, filename)
    }
  }
}

export default new ExportService()
