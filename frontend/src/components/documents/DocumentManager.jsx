import { useState, useRef, useCallback } from 'react'
import { Upload, File, Image, FileText, Download, Eye, Trash2, Plus, Search, Filter, FolderPlus, Folder, Star, Clock, User } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

// Document categories and types
const DOCUMENT_CATEGORIES = {
  SHIPPING: {
    name: 'Shipping Documents',
    icon: '🚢',
    color: '#3b82f6',
    types: ['Bill of Lading', 'Commercial Invoice', 'Packing List', 'Certificate of Origin']
  },
  CUSTOMS: {
    name: 'Customs & Compliance',
    icon: '🛃',
    color: '#f59e0b',
    types: ['Export Declaration', 'Import License', 'Customs Invoice', 'Duty Assessment']
  },
  INSURANCE: {
    name: 'Insurance & Risk',
    icon: '🛡️',
    color: '#10b981',
    types: ['Insurance Certificate', 'Risk Assessment', 'Damage Report', 'Claim Form']
  },
  QUALITY: {
    name: 'Quality & Inspection',
    icon: '✅',
    color: '#8b5cf6',
    types: ['Inspection Certificate', 'Quality Report', 'Test Results', 'Compliance Certificate']
  },
  FINANCIAL: {
    name: 'Financial Documents',
    icon: '💰',
    color: '#ef4444',
    types: ['Payment Receipt', 'Credit Note', 'Bank Guarantee', 'Letter of Credit']
  }
}

const FILE_TYPES = {
  'application/pdf': { icon: FileText, color: '#ef4444', name: 'PDF' },
  'image/jpeg': { icon: Image, color: '#10b981', name: 'JPEG' },
  'image/png': { icon: Image, color: '#10b981', name: 'PNG' },
  'image/gif': { icon: Image, color: '#10b981', name: 'GIF' },
  'application/msword': { icon: FileText, color: '#2563eb', name: 'DOC' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, color: '#2563eb', name: 'DOCX' },
  'application/vnd.ms-excel': { icon: FileText, color: '#16a34a', name: 'XLS' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: FileText, color: '#16a34a', name: 'XLSX' },
  'text/plain': { icon: File, color: '#6b7280', name: 'TXT' },
  'default': { icon: File, color: '#6b7280', name: 'FILE' }
}

function DocumentManager({ shipmentId, documents = [], onDocumentUpdate }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [selectedDocuments, setSelectedDocuments] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const fileInputRef = useRef(null)

  // Sample documents with enhanced metadata
  const [allDocuments, setAllDocuments] = useState([
    {
      id: '1',
      name: 'Bill of Lading - CST001.pdf',
      type: 'application/pdf',
      size: 245760,
      category: 'SHIPPING',
      documentType: 'Bill of Lading',
      uploadedAt: new Date('2024-01-10T10:30:00'),
      uploadedBy: 'John Smith',
      version: '1.0',
      status: 'approved',
      tags: ['original', 'signed'],
      description: 'Original bill of lading for shipment CST001',
      url: '/documents/bill-of-lading-cst001.pdf',
      thumbnail: '/thumbnails/bill-of-lading-cst001.jpg',
      isStarred: true,
      lastViewed: new Date('2024-01-12T14:20:00'),
      viewCount: 5
    },
    {
      id: '2',
      name: 'Commercial Invoice - CST001.pdf',
      type: 'application/pdf',
      size: 189440,
      category: 'SHIPPING',
      documentType: 'Commercial Invoice',
      uploadedAt: new Date('2024-01-10T11:15:00'),
      uploadedBy: 'Sarah Johnson',
      version: '2.1',
      status: 'approved',
      tags: ['revised', 'final'],
      description: 'Commercial invoice with updated pricing',
      url: '/documents/commercial-invoice-cst001.pdf',
      thumbnail: '/thumbnails/commercial-invoice-cst001.jpg',
      isStarred: false,
      lastViewed: new Date('2024-01-11T09:45:00'),
      viewCount: 3
    },
    {
      id: '3',
      name: 'Packing List - CST001.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 156672,
      category: 'SHIPPING',
      documentType: 'Packing List',
      uploadedAt: new Date('2024-01-10T12:00:00'),
      uploadedBy: 'Mike Wilson',
      version: '1.0',
      status: 'pending',
      tags: ['detailed', 'itemized'],
      description: 'Detailed packing list with item specifications',
      url: '/documents/packing-list-cst001.xlsx',
      thumbnail: '/thumbnails/packing-list-cst001.jpg',
      isStarred: false,
      lastViewed: new Date('2024-01-10T16:30:00'),
      viewCount: 2
    },
    {
      id: '4',
      name: 'Insurance Certificate.pdf',
      type: 'application/pdf',
      size: 298752,
      category: 'INSURANCE',
      documentType: 'Insurance Certificate',
      uploadedAt: new Date('2024-01-09T15:45:00'),
      uploadedBy: 'Lisa Chen',
      version: '1.0',
      status: 'approved',
      tags: ['marine', 'coverage'],
      description: 'Marine insurance certificate for cargo protection',
      url: '/documents/insurance-certificate.pdf',
      thumbnail: '/thumbnails/insurance-certificate.jpg',
      isStarred: true,
      lastViewed: new Date('2024-01-12T11:10:00'),
      viewCount: 7
    }
  ])

  // File upload handling with drag & drop
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach(file => {
      uploadFile(file)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  })

  const uploadFile = async (file) => {
    setIsUploading(true)
    const fileId = Date.now().toString()
    
    // Simulate upload progress
    setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))
    
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setUploadProgress(prev => ({ ...prev, [fileId]: progress }))
    }

    // Create new document entry
    const newDocument = {
      id: fileId,
      name: file.name,
      type: file.type,
      size: file.size,
      category: 'SHIPPING', // Default category
      documentType: 'Other',
      uploadedAt: new Date(),
      uploadedBy: 'Current User',
      version: '1.0',
      status: 'pending',
      tags: ['new'],
      description: `Uploaded document: ${file.name}`,
      url: URL.createObjectURL(file),
      thumbnail: null,
      isStarred: false,
      lastViewed: null,
      viewCount: 0
    }

    setAllDocuments(prev => [newDocument, ...prev])
    setUploadProgress(prev => {
      const { [fileId]: removed, ...rest } = prev
      return rest
    })
    setIsUploading(false)

    toast.success(`${file.name} uploaded successfully`)
    
    if (onDocumentUpdate) {
      onDocumentUpdate([newDocument, ...allDocuments])
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || [])
    files.forEach(uploadFile)
    event.target.value = '' // Reset input
  }

  const toggleStar = (docId) => {
    setAllDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, isStarred: !doc.isStarred } : doc
    ))
  }

  const deleteDocument = (docId) => {
    setAllDocuments(prev => prev.filter(doc => doc.id !== docId))
    toast.success('Document deleted successfully')
  }

  const downloadDocument = (doc) => {
    // Simulate download
    const link = document.createElement('a')
    link.href = doc.url
    link.download = doc.name
    link.click()
    toast.success(`Downloading ${doc.name}`)
  }

  const viewDocument = (doc) => {
    // Update view count and last viewed
    setAllDocuments(prev => prev.map(d => 
      d.id === doc.id 
        ? { ...d, viewCount: d.viewCount + 1, lastViewed: new Date() }
        : d
    ))
    
    // Open document viewer (would open in modal/new tab)
    window.open(doc.url, '_blank')
    toast.success(`Opening ${doc.name}`)
  }

  // Filter and sort documents
  const filteredDocuments = allDocuments
    .filter(doc => {
      const matchesCategory = selectedCategory === 'ALL' || doc.category === selectedCategory
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'size':
          return b.size - a.size
        case 'type':
          return a.type.localeCompare(b.type)
        case 'date':
        default:
          return new Date(b.uploadedAt) - new Date(a.uploadedAt)
      }
    })

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

  const getFileIcon = (type) => {
    const fileType = FILE_TYPES[type] || FILE_TYPES.default
    const IconComponent = fileType.icon
    return <IconComponent size={20} style={{ color: fileType.color }} />
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'status-approved'
      case 'pending': return 'status-pending'
      case 'rejected': return 'status-rejected'
      default: return 'status-default'
    }
  }

  return (
    <div className="document-manager">
      <div className="manager-header">
        <div className="header-title">
          <h3>📄 Document Manager</h3>
          <span className="document-count">{filteredDocuments.length} documents</span>
        </div>
        
        <div className="header-actions">
          <button onClick={handleFileSelect} className="btn btn-primary">
            <Plus size={16} />
            Upload Documents
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
          />
        </div>
      </div>

      {/* Upload Area */}
      <div {...getRootProps()} className={`upload-area ${isDragActive ? 'drag-active' : ''}`}>
        <input {...getInputProps()} />
        <div className="upload-content">
          <Upload size={48} />
          <h4>
            {isDragActive ? 'Drop files here...' : 'Drag & drop files here'}
          </h4>
          <p>or click to select files</p>
          <div className="upload-info">
            <span>Supported: PDF, DOC, XLS, Images</span>
            <span>Max size: 10MB per file</span>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="upload-progress">
          <h4>Uploading Files...</h4>
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="progress-item">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="progress-text">{progress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Filters and Search */}
      <div className="document-filters">
        <div className="filter-section">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="category-filter">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {Object.entries(DOCUMENT_CATEGORIES).map(([key, category]) => (
                <option key={key} value={key}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="sort-filter">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
              <option value="type">Sort by Type</option>
            </select>
          </div>
        </div>
      </div>

      {/* Document Grid/List */}
      <div className={`documents-container ${viewMode}`}>
        {filteredDocuments.map(doc => (
          <div key={doc.id} className="document-card">
            <div className="document-header">
              <div className="document-icon">
                {getFileIcon(doc.type)}
              </div>
              <div className="document-actions">
                <button 
                  onClick={() => toggleStar(doc.id)}
                  className={`star-btn ${doc.isStarred ? 'starred' : ''}`}
                >
                  <Star size={16} />
                </button>
                <button onClick={() => viewDocument(doc)} className="action-btn">
                  <Eye size={16} />
                </button>
                <button onClick={() => downloadDocument(doc)} className="action-btn">
                  <Download size={16} />
                </button>
                <button onClick={() => deleteDocument(doc.id)} className="action-btn delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="document-content">
              <h4 className="document-name">{doc.name}</h4>
              <p className="document-description">{doc.description}</p>
              
              <div className="document-meta">
                <span className="document-size">{formatFileSize(doc.size)}</span>
                <span className={`document-status ${getStatusColor(doc.status)}`}>
                  {doc.status}
                </span>
                <span className="document-version">v{doc.version}</span>
              </div>
              
              <div className="document-tags">
                {doc.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              
              <div className="document-footer">
                <div className="upload-info">
                  <User size={14} />
                  <span>{doc.uploadedBy}</span>
                </div>
                <div className="date-info">
                  <Clock size={14} />
                  <span>{formatDate(doc.uploadedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="empty-state">
          <File size={48} />
          <h4>No documents found</h4>
          <p>Upload documents or adjust your search criteria</p>
        </div>
      )}
    </div>
  )
}

export default DocumentManager
