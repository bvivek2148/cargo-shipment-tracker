import { useEffect, useRef, useState } from 'react'

// Skip to main content link
export function SkipToMain() {
  return (
    <a 
      href="#main-content" 
      className="skip-to-main"
      onFocus={(e) => e.target.classList.add('focused')}
      onBlur={(e) => e.target.classList.remove('focused')}
    >
      Skip to main content
    </a>
  )
}

// Focus trap for modals and dropdowns
export function FocusTrap({ children, isActive = true, restoreFocus = true }) {
  const containerRef = useRef(null)
  const previousActiveElement = useRef(null)

  useEffect(() => {
    if (!isActive) return

    // Store the currently focused element
    previousActiveElement.current = document.activeElement

    const container = containerRef.current
    if (!container) return

    // Get all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Focus the first element
    if (firstElement) {
      firstElement.focus()
    }

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        // Let parent handle escape
        e.stopPropagation()
      }
    }

    document.addEventListener('keydown', handleTabKey)
    document.addEventListener('keydown', handleEscapeKey)

    return () => {
      document.removeEventListener('keydown', handleTabKey)
      document.removeEventListener('keydown', handleEscapeKey)
      
      // Restore focus to previous element
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [isActive, restoreFocus])

  return (
    <div ref={containerRef} className="focus-trap">
      {children}
    </div>
  )
}

// Accessible button with proper ARIA attributes
export function AccessibleButton({ 
  children, 
  onClick, 
  disabled = false,
  loading = false,
  ariaLabel,
  ariaDescribedBy,
  ariaExpanded,
  ariaHaspopup,
  className = '',
  variant = 'primary',
  size = 'medium',
  ...props 
}) {
  const buttonRef = useRef(null)

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault()
      return
    }
    onClick?.(e)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick(e)
    }
  }

  return (
    <button
      ref={buttonRef}
      className={`accessible-button btn-${variant} btn-${size} ${className} ${loading ? 'loading' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHaspopup}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className="button-loading">
          <span className="sr-only">Loading...</span>
          <span className="loading-spinner" aria-hidden="true"></span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}

// Screen reader only text
export function ScreenReaderOnly({ children, as: Component = 'span' }) {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  )
}

// Live region for announcements
export function LiveRegion({ 
  children, 
  politeness = 'polite', 
  atomic = false,
  relevant = 'additions text'
}) {
  return (
    <div
      className="live-region sr-only"
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
    >
      {children}
    </div>
  )
}

// Accessible form field with proper labeling
export function AccessibleField({ 
  label, 
  children, 
  error, 
  hint, 
  required = false,
  id,
  className = ''
}) {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`
  const errorId = error ? `${fieldId}-error` : undefined
  const hintId = hint ? `${fieldId}-hint` : undefined

  return (
    <div className={`accessible-field ${className} ${error ? 'has-error' : ''}`}>
      <label htmlFor={fieldId} className="field-label">
        {label}
        {required && (
          <span className="required-indicator" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {hint && (
        <div id={hintId} className="field-hint">
          {hint}
        </div>
      )}
      
      <div className="field-input">
        {typeof children === 'function' 
          ? children({ 
              id: fieldId, 
              'aria-describedby': [hintId, errorId].filter(Boolean).join(' '),
              'aria-invalid': !!error,
              'aria-required': required
            })
          : children
        }
      </div>
      
      {error && (
        <div id={errorId} className="field-error" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}

// Keyboard navigation helper
export function useKeyboardNavigation(items, options = {}) {
  const {
    loop = true,
    orientation = 'vertical',
    onSelect,
    onEscape
  } = options

  const [activeIndex, setActiveIndex] = useState(-1)
  const itemRefs = useRef([])

  const handleKeyDown = (e) => {
    const { key } = e
    const isVertical = orientation === 'vertical'
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight'
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft'

    switch (key) {
      case nextKey:
        e.preventDefault()
        setActiveIndex(prev => {
          const next = prev + 1
          if (next >= items.length) {
            return loop ? 0 : prev
          }
          return next
        })
        break

      case prevKey:
        e.preventDefault()
        setActiveIndex(prev => {
          const next = prev - 1
          if (next < 0) {
            return loop ? items.length - 1 : prev
          }
          return next
        })
        break

      case 'Home':
        e.preventDefault()
        setActiveIndex(0)
        break

      case 'End':
        e.preventDefault()
        setActiveIndex(items.length - 1)
        break

      case 'Enter':
      case ' ':
        e.preventDefault()
        if (activeIndex >= 0 && onSelect) {
          onSelect(items[activeIndex], activeIndex)
        }
        break

      case 'Escape':
        e.preventDefault()
        if (onEscape) {
          onEscape()
        }
        break

      default:
        break
    }
  }

  useEffect(() => {
    if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex].focus()
    }
  }, [activeIndex])

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    itemRefs
  }
}

// High contrast mode detector
export function useHighContrastMode() {
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    const checkHighContrast = () => {
      // Check for Windows high contrast mode
      const isWindows = navigator.platform.indexOf('Win') > -1
      if (isWindows) {
        const testElement = document.createElement('div')
        testElement.style.border = '1px solid'
        testElement.style.borderColor = 'rgb(31, 31, 31)'
        testElement.style.position = 'absolute'
        testElement.style.height = '5px'
        testElement.style.top = '-999px'
        testElement.style.backgroundColor = 'rgb(31, 31, 31)'
        
        document.body.appendChild(testElement)
        
        const computedStyle = window.getComputedStyle(testElement)
        const backgroundColor = computedStyle.backgroundColor
        const borderTopColor = computedStyle.borderTopColor
        
        setIsHighContrast(backgroundColor !== borderTopColor)
        
        document.body.removeChild(testElement)
      }

      // Check for prefers-contrast media query
      if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-contrast: high)')
        setIsHighContrast(prev => prev || mediaQuery.matches)
        
        const handleChange = (e) => setIsHighContrast(e.matches)
        mediaQuery.addEventListener('change', handleChange)
        
        return () => mediaQuery.removeEventListener('change', handleChange)
      }
    }

    checkHighContrast()
  }, [])

  return isHighContrast
}

// Reduced motion detector
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setPrefersReducedMotion(mediaQuery.matches)
      
      const handleChange = (e) => setPrefersReducedMotion(e.matches)
      mediaQuery.addEventListener('change', handleChange)
      
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}
