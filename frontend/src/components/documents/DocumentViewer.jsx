import { useState, useEffect, useRef } from 'react'
import { X, Download, ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2, ChevronLeft, ChevronRight, FileText, Image, File } from 'lucide-react'
import toast from 'react-hot-toast'

// Document viewer for different file types
function DocumentViewer({ document, isOpen, onClose, onDownload }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const viewerRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    if (isOpen && document) {
      loadDocument()
    }
  }, [isOpen, document])

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return
      
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          previousPage()
          break
        case 'ArrowRight':
          nextPage()
          break
        case '+':
        case '=':
          zoomIn()
          break
        case '-':
          zoomOut()
          break
        case 'r':
          rotate()
          break
        case 'f':
          toggleFullscreen()
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, currentPage, totalPages])

  const loadDocument = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo purposes, set mock total pages based on file type
      if (document.type === 'application/pdf') {
        setTotalPages(Math.floor(Math.random() * 10) + 1)
      } else {
        setTotalPages(1)
      }
      
      setCurrentPage(1)
      setZoom(100)
      setRotation(0)
      setIsLoading(false)
    } catch (err) {
      setError('Failed to load document')
      setIsLoading(false)
    }
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300))
  }

  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25))
  }

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (viewerRef.current?.requestFullscreen) {
        viewerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const handleDownload = () => {
    if (onDownload) {
      onDownload(document)
    } else {
      // Default download behavior
      const link = document.createElement('a')
      link.href = document.url
      link.download = document.name
      link.click()
      toast.success(`Downloading ${document.name}`)
    }
  }

  const renderDocumentContent = () => {
    if (isLoading) {
      return (
        <div className="viewer-loading">
          <div className="loading-spinner">
            <FileText size={48} className="loading-icon" />
            <p>Loading document...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="viewer-error">
          <div className="error-content">
            <File size={48} />
            <h3>Failed to load document</h3>
            <p>{error}</p>
            <button onClick={loadDocument} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      )
    }

    const contentStyle = {
      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
      transformOrigin: 'center center',
      transition: 'transform 0.3s ease'
    }

    // Render based on document type
    switch (document.type) {
      case 'application/pdf':
        return (
          <div className="pdf-viewer" style={contentStyle}>
            <div className="pdf-page">
              <div className="pdf-placeholder">
                <FileText size={64} />
                <h3>PDF Document</h3>
                <p>{document.name}</p>
                <p>Page {currentPage} of {totalPages}</p>
                <div className="pdf-content">
                  {/* In a real implementation, this would render the actual PDF */}
                  <div className="mock-pdf-content">
                    <div className="pdf-header">
                      <h2>BILL OF LADING</h2>
                      <p>Document No: {document.name.split('.')[0]}</p>
                    </div>
                    <div className="pdf-body">
                      <div className="pdf-section">
                        <h4>Shipper Information</h4>
                        <p>Global Shipping Co.</p>
                        <p>123 Port Street, New York, NY 10001</p>
                      </div>
                      <div className="pdf-section">
                        <h4>Consignee Information</h4>
                        <p>Tech Solutions Inc.</p>
                        <p>456 Business Ave, London, UK</p>
                      </div>
                      <div className="pdf-section">
                        <h4>Cargo Details</h4>
                        <table className="cargo-table">
                          <thead>
                            <tr>
                              <th>Description</th>
                              <th>Quantity</th>
                              <th>Weight</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Electronics Equipment</td>
                              <td>50 units</td>
                              <td>500 kg</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
        return (
          <div className="image-viewer" style={contentStyle}>
            <img 
              src={document.url} 
              alt={document.name}
              className="document-image"
              onLoad={() => setIsLoading(false)}
              onError={() => setError('Failed to load image')}
            />
          </div>
        )

      case 'text/plain':
        return (
          <div className="text-viewer" style={contentStyle}>
            <div className="text-content">
              <h3>{document.name}</h3>
              <div className="text-body">
                {/* Mock text content */}
                <p>This is a sample text document content.</p>
                <p>In a real implementation, this would display the actual file content.</p>
                <p>The document viewer supports various file formats including:</p>
                <ul>
                  <li>PDF documents</li>
                  <li>Image files (JPEG, PNG, GIF)</li>
                  <li>Text files</li>
                  <li>Microsoft Office documents</li>
                </ul>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="unsupported-viewer" style={contentStyle}>
            <div className="unsupported-content">
              <File size={64} />
              <h3>Preview not available</h3>
              <p>This file type cannot be previewed in the browser.</p>
              <p>{document.name}</p>
              <button onClick={handleDownload} className="btn btn-primary">
                <Download size={16} />
                Download to view
              </button>
            </div>
          </div>
        )
    }
  }

  if (!isOpen || !document) {
    return null
  }

  return (
    <div className="document-viewer-overlay" onClick={onClose}>
      <div 
        ref={viewerRef}
        className={`document-viewer ${isFullscreen ? 'fullscreen' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Viewer Header */}
        <div className="viewer-header">
          <div className="document-info">
            <h3>{document.name}</h3>
            <span className="document-meta">
              {document.size && `${(document.size / 1024).toFixed(1)} KB`} • 
              {document.type.split('/')[1].toUpperCase()}
            </span>
          </div>
          
          <div className="viewer-controls">
            {/* Navigation Controls */}
            {totalPages > 1 && (
              <div className="page-controls">
                <button 
                  onClick={previousPage} 
                  disabled={currentPage === 1}
                  className="control-btn"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="page-info">
                  {currentPage} / {totalPages}
                </span>
                <button 
                  onClick={nextPage} 
                  disabled={currentPage === totalPages}
                  className="control-btn"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
            
            {/* Zoom Controls */}
            <div className="zoom-controls">
              <button onClick={zoomOut} className="control-btn">
                <ZoomOut size={16} />
              </button>
              <span className="zoom-info">{zoom}%</span>
              <button onClick={zoomIn} className="control-btn">
                <ZoomIn size={16} />
              </button>
            </div>
            
            {/* Action Controls */}
            <div className="action-controls">
              <button onClick={rotate} className="control-btn">
                <RotateCw size={16} />
              </button>
              <button onClick={toggleFullscreen} className="control-btn">
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button onClick={handleDownload} className="control-btn">
                <Download size={16} />
              </button>
              <button onClick={onClose} className="control-btn close-btn">
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Viewer Content */}
        <div ref={contentRef} className="viewer-content">
          {renderDocumentContent()}
        </div>

        {/* Viewer Footer */}
        <div className="viewer-footer">
          <div className="keyboard-shortcuts">
            <span>Shortcuts: </span>
            <span>ESC (close)</span>
            <span>← → (navigate)</span>
            <span>+ - (zoom)</span>
            <span>R (rotate)</span>
            <span>F (fullscreen)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentViewer
