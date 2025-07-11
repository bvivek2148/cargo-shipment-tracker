import { useState } from 'react'
import { FileText, Smartphone, Cloud, Download, Upload, Eye, Settings } from 'lucide-react'
import DocumentManager from './documents/DocumentManager'
import DocumentViewer from './documents/DocumentViewer'
import MobileFeatures from './mobile/MobileFeatures'

function Phase5Demo() {
  const [activeTab, setActiveTab] = useState('documents')
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  // Sample documents for demo
  const sampleDocuments = [
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
    }
  ]

  const handleDocumentView = (document) => {
    setSelectedDocument(document)
    setIsViewerOpen(true)
  }

  const handleDocumentUpdate = (documents) => {
    console.log('Documents updated:', documents)
  }

  return (
    <div className="phase5-demo">
      <div className="demo-header">
        <h2>📄 Phase 5: Document Management & PWA</h2>
        <p>Comprehensive document management system with Progressive Web App features</p>
      </div>

      {/* Feature Overview */}
      <div className="features-overview">
        <div className="feature-card">
          <div className="feature-icon">
            <FileText size={32} />
          </div>
          <div className="feature-content">
            <h3>Document Management</h3>
            <p>Upload, organize, and manage shipping documents with version control and preview capabilities</p>
            <ul>
              <li>Drag & drop file upload</li>
              <li>Document categorization</li>
              <li>Version control</li>
              <li>In-app document viewer</li>
              <li>Search and filtering</li>
            </ul>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <Smartphone size={32} />
          </div>
          <div className="feature-content">
            <h3>Progressive Web App</h3>
            <p>Mobile-first experience with offline functionality and native app features</p>
            <ul>
              <li>Offline data access</li>
              <li>Push notifications</li>
              <li>Install to home screen</li>
              <li>Background sync</li>
              <li>Mobile optimizations</li>
            </ul>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <Cloud size={32} />
          </div>
          <div className="feature-content">
            <h3>Offline Sync</h3>
            <p>Seamless data synchronization between offline and online states</p>
            <ul>
              <li>Automatic sync when online</li>
              <li>Conflict resolution</li>
              <li>Pending operations queue</li>
              <li>Background sync</li>
              <li>Data integrity</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Demo Tabs */}
      <div className="demo-tabs">
        <button 
          className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <FileText size={16} />
          Document Manager
        </button>
        <button 
          className={`tab-button ${activeTab === 'mobile' ? 'active' : ''}`}
          onClick={() => setActiveTab('mobile')}
        >
          <Smartphone size={16} />
          Mobile Features
        </button>
        <button 
          className={`tab-button ${activeTab === 'pwa' ? 'active' : ''}`}
          onClick={() => setActiveTab('pwa')}
        >
          <Settings size={16} />
          PWA Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="demo-content">
        {activeTab === 'documents' && (
          <div className="documents-demo">
            <div className="demo-section">
              <h3>📁 Document Management System</h3>
              <p>Upload, organize, and manage all your shipping documents in one place</p>
              
              <div className="demo-features">
                <div className="demo-feature">
                  <Upload size={20} />
                  <span>Drag & Drop Upload</span>
                </div>
                <div className="demo-feature">
                  <Eye size={20} />
                  <span>In-app Preview</span>
                </div>
                <div className="demo-feature">
                  <Download size={20} />
                  <span>Bulk Download</span>
                </div>
                <div className="demo-feature">
                  <FileText size={20} />
                  <span>Version Control</span>
                </div>
              </div>
            </div>

            <DocumentManager 
              shipmentId="CST001"
              documents={sampleDocuments}
              onDocumentUpdate={handleDocumentUpdate}
            />
          </div>
        )}

        {activeTab === 'mobile' && (
          <div className="mobile-demo">
            <div className="demo-section">
              <h3>📱 Mobile & PWA Features</h3>
              <p>Experience the full mobile app capabilities and Progressive Web App features</p>
            </div>

            <MobileFeatures />
          </div>
        )}

        {activeTab === 'pwa' && (
          <div className="pwa-demo">
            <div className="demo-section">
              <h3>⚙️ PWA Configuration</h3>
              <p>Configure Progressive Web App settings and offline capabilities</p>
            </div>

            <div className="pwa-settings">
              <div className="setting-group">
                <h4>🔔 Notification Settings</h4>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Shipment status updates
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Delivery notifications
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" />
                    Route optimization alerts
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" />
                    Document upload confirmations
                  </label>
                </div>
              </div>

              <div className="setting-group">
                <h4>💾 Offline Storage</h4>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Cache shipment data
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Store documents offline
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" />
                    Sync in background
                  </label>
                </div>
              </div>

              <div className="setting-group">
                <h4>🔄 Sync Preferences</h4>
                <div className="setting-item">
                  <label>Auto-sync frequency:</label>
                  <select>
                    <option>Every 5 minutes</option>
                    <option>Every 15 minutes</option>
                    <option>Every hour</option>
                    <option>Manual only</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Sync on WiFi only
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" />
                    Show sync notifications
                  </label>
                </div>
              </div>

              <div className="setting-group">
                <h4>📱 App Behavior</h4>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Show install prompt
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Enable haptic feedback
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" />
                    Dark mode support
                  </label>
                </div>
              </div>
            </div>

            <div className="pwa-actions">
              <button className="btn btn-primary">Save Settings</button>
              <button className="btn btn-secondary">Reset to Defaults</button>
              <button className="btn btn-outline">Clear Cache</button>
            </div>
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewer 
        document={selectedDocument}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        onDownload={(doc) => console.log('Download:', doc.name)}
      />

      {/* Phase 5 Summary */}
      <div className="phase5-summary">
        <h3>🎉 Phase 5 Complete!</h3>
        <p>The Cargo Shipment Tracker now includes:</p>
        
        <div className="summary-grid">
          <div className="summary-item">
            <h4>📄 Document Management</h4>
            <ul>
              <li>File upload with drag & drop</li>
              <li>Document categorization & tagging</li>
              <li>Version control & approval workflow</li>
              <li>In-app document viewer</li>
              <li>Search & filtering capabilities</li>
            </ul>
          </div>
          
          <div className="summary-item">
            <h4>📱 Progressive Web App</h4>
            <ul>
              <li>Service worker for offline functionality</li>
              <li>App manifest for installation</li>
              <li>Push notifications support</li>
              <li>Mobile-optimized interface</li>
              <li>Native app-like experience</li>
            </ul>
          </div>
          
          <div className="summary-item">
            <h4>🔄 Offline Capabilities</h4>
            <ul>
              <li>Offline data storage</li>
              <li>Background synchronization</li>
              <li>Conflict resolution</li>
              <li>Pending operations queue</li>
              <li>Seamless online/offline transitions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Phase5Demo
