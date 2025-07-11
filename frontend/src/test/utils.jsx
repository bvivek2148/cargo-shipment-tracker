import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Custom render function that includes providers
export function renderWithProviders(ui, options = {}) {
  const {
    initialEntries = ['/'],
    ...renderOptions
  } = options

  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        {children}
      </BrowserRouter>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

// Mock data generators
export const mockShipment = (overrides = {}) => ({
  id: '1',
  trackingNumber: 'CST001',
  status: 'In Transit',
  origin: 'New York, USA',
  destination: 'London, UK',
  cargo: 'Electronics',
  weight: '500 kg',
  dimensions: '120x80x60 cm',
  value: '$25,000',
  estimatedDelivery: '2024-01-15',
  currentLocation: 'Atlantic Ocean',
  carrier: 'Global Shipping Co.',
  vessel: 'MV Ocean Explorer',
  container: 'GSTU1234567',
  createdAt: '2024-01-10',
  customer: {
    name: 'Tech Solutions Inc.',
    email: 'orders@techsolutions.com',
    phone: '+1-555-0123'
  },
  route: {
    origin: 'New York, USA',
    destination: 'London, UK',
    waypoints: ['Halifax, Canada'],
    distance: 5585,
    estimatedTime: 12.5
  },
  documents: [
    { name: 'Bill of Lading', type: 'PDF', size: '245 KB' },
    { name: 'Commercial Invoice', type: 'PDF', size: '189 KB' }
  ],
  ...overrides
})

export const mockDocument = (overrides = {}) => ({
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
  viewCount: 5,
  ...overrides
})

export const mockAnalytics = (overrides = {}) => ({
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
  predictions: {
    nextMonthRevenue: 3200000,
    nextMonthShipments: 1450,
    riskFactors: [
      { factor: 'Weather Delays', probability: 23, impact: 'Medium' },
      { factor: 'Port Congestion', probability: 15, impact: 'High' }
    ]
  },
  ...overrides
})

// Mock API responses
export const mockApiResponse = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: vi.fn().mockResolvedValue(data),
  text: vi.fn().mockResolvedValue(JSON.stringify(data)),
})

// Mock fetch with different scenarios
export const mockFetch = {
  success: (data) => {
    global.fetch = vi.fn().mockResolvedValue(mockApiResponse(data))
  },
  error: (status = 500, message = 'Internal Server Error') => {
    global.fetch = vi.fn().mockResolvedValue(mockApiResponse({ error: message }, status))
  },
  networkError: () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'))
  },
  loading: () => {
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}))
  }
}

// Mock WebSocket
export const mockWebSocket = () => {
  const mockWs = {
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    readyState: WebSocket.OPEN,
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
  }

  global.WebSocket = vi.fn().mockImplementation(() => mockWs)
  return mockWs
}

// Mock geolocation
export const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
}

// Mock localStorage
export const mockLocalStorage = () => {
  const store = new Map()
  
  return {
    getItem: vi.fn((key) => store.get(key) || null),
    setItem: vi.fn((key, value) => store.set(key, value)),
    removeItem: vi.fn((key) => store.delete(key)),
    clear: vi.fn(() => store.clear()),
    get length() {
      return store.size
    },
    key: vi.fn((index) => Array.from(store.keys())[index] || null),
  }
}

// Mock IndexedDB
export const mockIndexedDB = () => {
  const databases = new Map()
  
  const mockRequest = (result = null, error = null) => ({
    result,
    error,
    onsuccess: null,
    onerror: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })

  const mockObjectStore = (name) => ({
    name,
    add: vi.fn(() => mockRequest()),
    put: vi.fn(() => mockRequest()),
    get: vi.fn(() => mockRequest()),
    delete: vi.fn(() => mockRequest()),
    clear: vi.fn(() => mockRequest()),
    count: vi.fn(() => mockRequest(0)),
    getAll: vi.fn(() => mockRequest([])),
    getAllKeys: vi.fn(() => mockRequest([])),
    index: vi.fn(() => mockObjectStore(`${name}-index`)),
    createIndex: vi.fn(),
    deleteIndex: vi.fn(),
  })

  const mockTransaction = (storeNames, mode = 'readonly') => ({
    objectStore: vi.fn((name) => mockObjectStore(name)),
    abort: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    mode,
    db: null,
    error: null,
    oncomplete: null,
    onerror: null,
    onabort: null,
  })

  const mockDatabase = (name) => ({
    name,
    version: 1,
    objectStoreNames: ['test-store'],
    transaction: vi.fn((storeNames, mode) => mockTransaction(storeNames, mode)),
    createObjectStore: vi.fn((name) => mockObjectStore(name)),
    deleteObjectStore: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })

  global.indexedDB = {
    open: vi.fn((name, version) => {
      const request = mockRequest()
      setTimeout(() => {
        const db = mockDatabase(name)
        request.result = db
        databases.set(name, db)
        if (request.onsuccess) request.onsuccess({ target: request })
      }, 0)
      return request
    }),
    deleteDatabase: vi.fn(() => mockRequest()),
    databases: vi.fn(() => Promise.resolve(Array.from(databases.keys()).map(name => ({ name })))),
  }

  return { databases, mockRequest, mockObjectStore, mockTransaction, mockDatabase }
}

// Test helpers for async operations
export const waitFor = (callback, options = {}) => {
  const { timeout = 1000, interval = 50 } = options
  
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    const check = () => {
      try {
        const result = callback()
        if (result) {
          resolve(result)
          return
        }
      } catch (error) {
        // Continue checking
      }
      
      if (Date.now() - startTime >= timeout) {
        reject(new Error('Timeout waiting for condition'))
        return
      }
      
      setTimeout(check, interval)
    }
    
    check()
  })
}

// Mock file for testing file uploads
export const createMockFile = (name = 'test.pdf', size = 1024, type = 'application/pdf') => {
  const file = new File(['test content'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

// Mock drag and drop events
export const createMockDragEvent = (type, files = []) => {
  const event = new Event(type, { bubbles: true })
  Object.defineProperty(event, 'dataTransfer', {
    value: {
      files,
      items: files.map(file => ({ kind: 'file', type: file.type, getAsFile: () => file })),
      types: ['Files'],
    },
  })
  return event
}

// Performance testing utilities
export const measurePerformance = async (fn, iterations = 1) => {
  const times = []
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    await fn()
    const end = performance.now()
    times.push(end - start)
  }
  
  return {
    average: times.reduce((sum, time) => sum + time, 0) / times.length,
    min: Math.min(...times),
    max: Math.max(...times),
    times,
  }
}

// Accessibility testing helpers
export const checkAccessibility = (element) => {
  const issues = []
  
  // Check for alt text on images
  const images = element.querySelectorAll('img')
  images.forEach(img => {
    if (!img.alt && !img.getAttribute('aria-label')) {
      issues.push('Image missing alt text')
    }
  })
  
  // Check for form labels
  const inputs = element.querySelectorAll('input, select, textarea')
  inputs.forEach(input => {
    const id = input.id
    const label = element.querySelector(`label[for="${id}"]`)
    const ariaLabel = input.getAttribute('aria-label')
    const ariaLabelledBy = input.getAttribute('aria-labelledby')
    
    if (!label && !ariaLabel && !ariaLabelledBy) {
      issues.push('Form input missing label')
    }
  })
  
  // Check for heading hierarchy
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6')
  let lastLevel = 0
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1))
    if (level > lastLevel + 1) {
      issues.push('Heading hierarchy skipped')
    }
    lastLevel = level
  })
  
  return issues
}

// Export all utilities
export * from '@testing-library/react'
export { vi } from 'vitest'
