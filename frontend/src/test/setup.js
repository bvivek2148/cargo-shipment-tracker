// Test setup file for Vitest
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock fetch
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock navigator
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: vi.fn().mockResolvedValue({}),
    ready: Promise.resolve({}),
  },
  writable: true,
})

Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
})

// Mock Notification
global.Notification = vi.fn().mockImplementation(() => ({
  close: vi.fn(),
}))

Object.defineProperty(Notification, 'permission', {
  value: 'granted',
  writable: true,
})

Object.defineProperty(Notification, 'requestPermission', {
  value: vi.fn().mockResolvedValue('granted'),
  writable: true,
})

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
}

Object.defineProperty(navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
})

// Mock console methods for cleaner test output
global.console = {
  ...console,
  // Uncomment to ignore specific console methods in tests
  // log: vi.fn(),
  // warn: vi.fn(),
  // error: vi.fn(),
}

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: vi.fn(),
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  BarElement: vi.fn(),
  ArcElement: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
  Filler: vi.fn(),
  register: vi.fn(),
}))

// Mock react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Line: vi.fn(() => <div data-testid="line-chart" />),
  Bar: vi.fn(() => <div data-testid="bar-chart" />),
  Doughnut: vi.fn(() => <div data-testid="doughnut-chart" />),
  Radar: vi.fn(() => <div data-testid="radar-chart" />),
}))

// Mock Leaflet
vi.mock('leaflet', () => ({
  map: vi.fn(() => ({
    setView: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    remove: vi.fn(),
  })),
  tileLayer: vi.fn(() => ({
    addTo: vi.fn(),
  })),
  marker: vi.fn(() => ({
    addTo: vi.fn(),
    bindPopup: vi.fn(),
    setLatLng: vi.fn(),
  })),
  icon: vi.fn(),
  divIcon: vi.fn(),
  popup: vi.fn(),
  circle: vi.fn(() => ({
    addTo: vi.fn(),
    setRadius: vi.fn(),
  })),
  polygon: vi.fn(() => ({
    addTo: vi.fn(),
  })),
  polyline: vi.fn(() => ({
    addTo: vi.fn(),
  })),
}))

// Mock react-leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: vi.fn(({ children }) => <div data-testid="map-container">{children}</div>),
  TileLayer: vi.fn(() => <div data-testid="tile-layer" />),
  Marker: vi.fn(() => <div data-testid="marker" />),
  Popup: vi.fn(({ children }) => <div data-testid="popup">{children}</div>),
  Circle: vi.fn(() => <div data-testid="circle" />),
  Polygon: vi.fn(() => <div data-testid="polygon" />),
  Polyline: vi.fn(() => <div data-testid="polyline" />),
  useMap: vi.fn(() => ({
    setView: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
  })),
}))

// Mock react-dropzone
vi.mock('react-dropzone', () => ({
  useDropzone: vi.fn(() => ({
    getRootProps: vi.fn(() => ({})),
    getInputProps: vi.fn(() => ({})),
    isDragActive: false,
    acceptedFiles: [],
    rejectedFiles: [],
  })),
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
  Toaster: vi.fn(() => <div data-testid="toaster" />),
}))

// Mock Socket.IO client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    connected: true,
  })),
}))

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  sessionStorage.clear()
})
