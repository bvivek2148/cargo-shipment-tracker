import { useState, useRef, useEffect } from 'react'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

function ThemeToggle() {
  const { isDarkMode, themeMode, toggleTheme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const themeOptions = [
    {
      id: 'light',
      label: 'Light',
      icon: Sun,
      description: 'Light theme'
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: Moon,
      description: 'Dark theme'
    },
    {
      id: 'system',
      label: 'System',
      icon: Monitor,
      description: 'Follow system preference'
    }
  ]

  const getCurrentIcon = () => {
    switch (themeMode) {
      case 'light':
        return Sun
      case 'dark':
        return Moon
      case 'system':
        return Monitor
      default:
        return isDarkMode ? Moon : Sun
    }
  }

  const handleThemeSelect = (mode) => {
    setTheme(mode)
    setIsOpen(false)
  }

  const CurrentIcon = getCurrentIcon()

  return (
    <div className="theme-toggle" ref={dropdownRef}>
      <button
        className="theme-toggle-button"
        onClick={() => setIsOpen(!isOpen)}
        title={`Current theme: ${themeMode}`}
        aria-label="Toggle theme"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <CurrentIcon size={18} className="theme-icon" />
      </button>

      {isOpen && (
        <div className="theme-dropdown">
          <div className="theme-dropdown-header">
            <h4>Choose Theme</h4>
          </div>
          <div className="theme-options">
            {themeOptions.map((option) => {
              const Icon = option.icon
              const isSelected = themeMode === option.id
              
              return (
                <button
                  key={option.id}
                  className={`theme-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleThemeSelect(option.id)}
                  aria-label={`Switch to ${option.label.toLowerCase()} theme`}
                >
                  <div className="theme-option-content">
                    <div className="theme-option-icon">
                      <Icon size={16} />
                    </div>
                    <div className="theme-option-text">
                      <span className="theme-option-label">{option.label}</span>
                      <span className="theme-option-description">{option.description}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="theme-option-check">
                      <Check size={14} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default ThemeToggle
