import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Include cookies for authentication
})

// Request interceptor to add auth token and logging
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and auth
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)

    // Handle authentication errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']

      // Redirect to login if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// Shipment API functions
export const shipmentAPI = {
  // Get all shipments with optional query parameters
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/shipments', { params })
      return response.data.success ? response.data.data : response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch shipments')
    }
  },

  // Get shipment by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/shipments/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch shipment')
    }
  },

  // Create new shipment
  create: async (shipmentData) => {
    try {
      const response = await api.post('/shipments', shipmentData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create shipment')
    }
  },

  // Update shipment
  update: async (id, shipmentData) => {
    try {
      const response = await api.put(`/shipments/${id}`, shipmentData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update shipment')
    }
  },

  // Delete shipment
  delete: async (id) => {
    try {
      const response = await api.delete(`/shipments/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete shipment')
    }
  },

  // Get statistics
  getStats: async () => {
    try {
      const response = await api.get('/stats')
      return response.data.success ? response.data : { data: response.data }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics')
    }
  },

  // Bulk operations
  bulkOperation: async (operation, shipmentIds, updateData = {}) => {
    try {
      const response = await api.post('/shipments/bulk', {
        operation,
        shipmentIds,
        updateData
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Bulk operation failed')
    }
  }
}

// Authentication API functions
export const authAPI = {
  // Login
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  },

  // Register
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await api.post('/auth/logout')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Logout failed')
    }
  },

  // Get current user
  getMe: async () => {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get user info')
    }
  },

  // Update profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Profile update failed')
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password change failed')
    }
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/auth/refresh', { refreshToken })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Token refresh failed')
    }
  }
}

// User Management API functions (Admin only)
export const userAPI = {
  // Get all users
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/users', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users')
    }
  },

  // Get user by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user')
    }
  },

  // Create user
  create: async (userData) => {
    try {
      const response = await api.post('/users', userData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create user')
    }
  },

  // Update user
  update: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user')
    }
  },

  // Delete user
  delete: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete user')
    }
  },

  // Get user statistics
  getStats: async () => {
    try {
      const response = await api.get('/users/stats')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user statistics')
    }
  }
}

// Export the main API instance for direct use
export { api }

// For backward compatibility, also export shipmentAPI as default
export default shipmentAPI

// Health check function
export const healthCheck = async () => {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    throw new Error('Backend server is not responding')
  }
}

export default api
