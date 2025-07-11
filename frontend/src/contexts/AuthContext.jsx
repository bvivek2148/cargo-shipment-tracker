import { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI, api } from '../services/api'

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
}

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR'
}

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,
        error: null
      }
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }
    
    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      }
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }
    
    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load user on app start
  useEffect(() => {
    loadUser()
  }, [])

  // Load user from token
  const loadUser = async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE, payload: 'No token found' })
      return
    }

    try {
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_START })

      // Check if we're in offline mode (mock data)
      const userData = localStorage.getItem('userData')
      if (userData) {
        const user = JSON.parse(userData)
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
          payload: user
        })
        return
      }

      // Try to load from API
      try {
        // Set token in API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`

        const response = await authAPI.getMe()

        if (response.data.success) {
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
            payload: response.data.data
          })
        } else {
          throw new Error('Failed to load user')
        }
      } catch (apiError) {
        console.warn('API not available, using offline mode')
        // Fallback to mock user data
        const mockUser = {
          id: '1',
          firstName: 'Demo',
          lastName: 'User',
          fullName: 'Demo User',
          email: 'demo@cargotracker.com',
          role: 'admin',
          department: 'Demo Department'
        }
        localStorage.setItem('userData', JSON.stringify(mockUser))
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
          payload: mockUser
        })
      }
    } catch (error) {
      console.error('Load user error:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('userData')
      delete api.defaults.headers.common['Authorization']
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_FAILURE,
        payload: 'Failed to load user'
      })
    }
  }

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })

      // Mock users for demo
      const mockUsers = [
        {
          id: '1',
          firstName: 'System',
          lastName: 'Administrator',
          fullName: 'System Administrator',
          email: 'admin@cargotracker.com',
          password: 'Admin123!@#',
          role: 'admin',
          department: 'IT Administration'
        },
        {
          id: '2',
          firstName: 'John',
          lastName: 'Manager',
          fullName: 'John Manager',
          email: 'manager@cargotracker.com',
          password: 'Manager123!@#',
          role: 'manager',
          department: 'Operations'
        },
        {
          id: '3',
          firstName: 'Jane',
          lastName: 'User',
          fullName: 'Jane User',
          email: 'user@cargotracker.com',
          password: 'User123!@#',
          role: 'user',
          department: 'Customer Service'
        }
      ]

      // Try API first, fallback to mock
      try {
        const response = await authAPI.login(email, password)

        if (response.data.success) {
          const { token, user } = response.data.data

          // Store token and user data
          localStorage.setItem('token', token)
          localStorage.setItem('userData', JSON.stringify(user))

          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`

          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user, token }
          })

          return { success: true, user }
        } else {
          throw new Error(response.data.message || 'Login failed')
        }
      } catch (apiError) {
        console.warn('API not available, using mock authentication')

        // Mock authentication
        const user = mockUsers.find(u => u.email === email && u.password === password)

        if (user) {
          const token = `mock-token-${user.id}-${Date.now()}`
          const userWithoutPassword = { ...user }
          delete userWithoutPassword.password

          // Store token and user data
          localStorage.setItem('token', token)
          localStorage.setItem('userData', JSON.stringify(userWithoutPassword))

          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user: userWithoutPassword, token }
          })

          return { success: true, user: userWithoutPassword }
        } else {
          throw new Error('Invalid email or password')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error.message || 'Login failed'
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.warn('Logout API call failed, continuing with local logout')
    } finally {
      // Clear local storage and state regardless of API call result
      localStorage.removeItem('token')
      localStorage.removeItem('userData')
      delete api.defaults.headers.common['Authorization']
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })
      
      const response = await authAPI.register(userData)
      
      if (response.data.success) {
        const { token, user } = response.data.data
        
        // Store token
        localStorage.setItem('token', token)
        
        // Set token in API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        dispatch({ 
          type: AUTH_ACTIONS.LOGIN_SUCCESS, 
          payload: { user, token } 
        })
        
        return { success: true, user }
      } else {
        throw new Error(response.data.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = error.response?.data?.message || 'Registration failed'
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData)
      
      if (response.data.success) {
        dispatch({ 
          type: AUTH_ACTIONS.UPDATE_USER, 
          payload: response.data.data 
        })
        return { success: true, user: response.data.data }
      } else {
        throw new Error(response.data.message || 'Profile update failed')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      const errorMessage = error.response?.data?.message || 'Profile update failed'
      return { success: false, error: errorMessage }
    }
  }

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authAPI.changePassword(currentPassword, newPassword)
      
      if (response.data.success) {
        return { success: true, message: response.data.message }
      } else {
        throw new Error(response.data.message || 'Password change failed')
      }
    } catch (error) {
      console.error('Password change error:', error)
      const errorMessage = error.response?.data?.message || 'Password change failed'
      return { success: false, error: errorMessage }
    }
  }

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }

  // Check if user has permission
  const hasPermission = (requiredRole) => {
    if (!state.user) return false
    
    const roleHierarchy = {
      'user': 1,
      'manager': 2,
      'admin': 3
    }
    
    return roleHierarchy[state.user.role] >= roleHierarchy[requiredRole]
  }

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role
  }

  const value = {
    ...state,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    clearError,
    hasPermission,
    hasRole,
    loadUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
