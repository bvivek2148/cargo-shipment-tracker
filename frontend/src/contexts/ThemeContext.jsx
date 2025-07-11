import { createContext, useContext, useEffect, useState } from 'react'
import { lightTheme, darkTheme } from '../theme/theme'

// Create Theme Context
const ThemeContext = createContext()

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [systemPreference, setSystemPreference] = useState('light')
  const [themeMode, setThemeMode] = useState('light') // 'light', 'dark', 'system'

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light')

    const handleChange = (e) => {
      setSystemPreference(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Load saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-mode')
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setThemeMode(savedTheme)
    } else {
      // Set initial theme immediately
      updateDocumentTheme(false) // Start with light theme
    }
  }, [])

  // Update dark mode based on theme mode and system preference
  useEffect(() => {
    let shouldBeDark = false
    
    switch (themeMode) {
      case 'dark':
        shouldBeDark = true
        break
      case 'light':
        shouldBeDark = false
        break
      case 'system':
        shouldBeDark = systemPreference === 'dark'
        break
      default:
        shouldBeDark = false
    }

    setIsDarkMode(shouldBeDark)
    
    // Update document class and CSS variables
    updateDocumentTheme(shouldBeDark)
  }, [themeMode, systemPreference])

  const updateDocumentTheme = (isDark) => {
    const root = document.documentElement
    const theme = isDark ? darkTheme : lightTheme

    // Update CSS custom properties
    root.style.setProperty('--color-primary', theme.colors.primary[500])
    root.style.setProperty('--color-primary-hover', theme.colors.primary[600])
    root.style.setProperty('--color-primary-active', theme.colors.primary[700])
    
    root.style.setProperty('--color-background-primary', theme.colors.background.primary)
    root.style.setProperty('--color-background-secondary', theme.colors.background.secondary)
    root.style.setProperty('--color-background-tertiary', theme.colors.background.tertiary)
    root.style.setProperty('--color-background-elevated', theme.colors.background.elevated)
    root.style.setProperty('--color-background-overlay', theme.colors.background.overlay)
    
    root.style.setProperty('--color-text-primary', theme.colors.text.primary)
    root.style.setProperty('--color-text-secondary', theme.colors.text.secondary)
    root.style.setProperty('--color-text-tertiary', theme.colors.text.tertiary)
    root.style.setProperty('--color-text-disabled', theme.colors.text.disabled)
    root.style.setProperty('--color-text-inverse', theme.colors.text.inverse)
    
    root.style.setProperty('--color-border-primary', theme.colors.border.primary)
    root.style.setProperty('--color-border-secondary', theme.colors.border.secondary)
    root.style.setProperty('--color-border-focus', theme.colors.border.focus)
    root.style.setProperty('--color-border-error', theme.colors.border.error)
    
    root.style.setProperty('--color-surface-primary', theme.colors.surface.primary)
    root.style.setProperty('--color-surface-secondary', theme.colors.surface.secondary)
    root.style.setProperty('--color-surface-tertiary', theme.colors.surface.tertiary)
    root.style.setProperty('--color-surface-hover', theme.colors.surface.hover)
    root.style.setProperty('--color-surface-active', theme.colors.surface.active)
    
    // Success colors
    root.style.setProperty('--color-success', theme.colors.success[500])
    root.style.setProperty('--color-success-hover', theme.colors.success[600])
    root.style.setProperty('--color-success-light', theme.colors.success[100])
    
    // Warning colors
    root.style.setProperty('--color-warning', theme.colors.warning[500])
    root.style.setProperty('--color-warning-hover', theme.colors.warning[600])
    root.style.setProperty('--color-warning-light', theme.colors.warning[100])
    
    // Error colors
    root.style.setProperty('--color-error', theme.colors.error[500])
    root.style.setProperty('--color-error-hover', theme.colors.error[600])
    root.style.setProperty('--color-error-light', theme.colors.error[100])
    
    // Info colors
    root.style.setProperty('--color-info', theme.colors.info[500])
    root.style.setProperty('--color-info-hover', theme.colors.info[600])
    root.style.setProperty('--color-info-light', theme.colors.info[100])

    // Update body class for theme-specific styles
    document.body.classList.toggle('dark-theme', isDark)
    document.body.classList.toggle('light-theme', !isDark)
  }

  const toggleTheme = () => {
    const newMode = isDarkMode ? 'light' : 'dark'
    setThemeMode(newMode)
    localStorage.setItem('theme-mode', newMode)
  }

  const setTheme = (mode) => {
    setThemeMode(mode)
    localStorage.setItem('theme-mode', mode)
  }

  const getCurrentTheme = () => {
    return isDarkMode ? darkTheme : lightTheme
  }

  const getThemeColor = (colorPath) => {
    const theme = getCurrentTheme()
    const keys = colorPath.split('.')
    let value = theme.colors
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        return null
      }
    }
    
    return value
  }

  const value = {
    isDarkMode,
    themeMode,
    systemPreference,
    theme: getCurrentTheme(),
    toggleTheme,
    setTheme,
    getThemeColor
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeContext
