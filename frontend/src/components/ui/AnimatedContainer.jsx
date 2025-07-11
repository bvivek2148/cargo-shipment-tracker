import { useState, useEffect, useRef } from 'react'

// Animated Container for smooth transitions
function AnimatedContainer({ 
  children, 
  animation = 'fadeIn', 
  duration = 300, 
  delay = 0,
  className = '',
  trigger = true,
  onAnimationComplete
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (trigger && !hasAnimated) {
      const timer = setTimeout(() => {
        setIsVisible(true)
        setHasAnimated(true)
        
        if (onAnimationComplete) {
          const completeTimer = setTimeout(() => {
            onAnimationComplete()
          }, duration)
          
          return () => clearTimeout(completeTimer)
        }
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [trigger, hasAnimated, delay, duration, onAnimationComplete])

  const getAnimationClass = () => {
    const baseClass = 'animated-container'
    const animationClass = `animate-${animation}`
    const visibilityClass = isVisible ? 'animate-in' : 'animate-out'
    
    return `${baseClass} ${animationClass} ${visibilityClass} ${className}`.trim()
  }

  const getAnimationStyle = () => {
    return {
      '--animation-duration': `${duration}ms`,
      '--animation-delay': `${delay}ms`
    }
  }

  return (
    <div 
      ref={containerRef}
      className={getAnimationClass()}
      style={getAnimationStyle()}
    >
      {children}
    </div>
  )
}

// Stagger Animation for lists
export function StaggeredList({ 
  children, 
  staggerDelay = 100, 
  animation = 'slideUp',
  className = ''
}) {
  const [visibleItems, setVisibleItems] = useState(new Set())
  const itemsRef = useRef([])

  useEffect(() => {
    const items = itemsRef.current
    
    items.forEach((item, index) => {
      if (item) {
        const timer = setTimeout(() => {
          setVisibleItems(prev => new Set([...prev, index]))
        }, index * staggerDelay)

        return () => clearTimeout(timer)
      }
    })
  }, [staggerDelay])

  return (
    <div className={`staggered-list ${className}`}>
      {children.map((child, index) => (
        <AnimatedContainer
          key={index}
          animation={animation}
          trigger={visibleItems.has(index)}
          className="staggered-item"
        >
          <div ref={el => itemsRef.current[index] = el}>
            {child}
          </div>
        </AnimatedContainer>
      ))}
    </div>
  )
}

// Fade Transition for route changes
export function FadeTransition({ children, isVisible = true, duration = 200 }) {
  return (
    <AnimatedContainer
      animation="fade"
      duration={duration}
      trigger={isVisible}
      className="fade-transition"
    >
      {children}
    </AnimatedContainer>
  )
}

// Scale Animation for modals and popups
export function ScaleTransition({ children, isVisible = true, duration = 150 }) {
  return (
    <AnimatedContainer
      animation="scale"
      duration={duration}
      trigger={isVisible}
      className="scale-transition"
    >
      {children}
    </AnimatedContainer>
  )
}

// Slide Animation for panels and drawers
export function SlideTransition({ 
  children, 
  direction = 'right', 
  isVisible = true, 
  duration = 250 
}) {
  return (
    <AnimatedContainer
      animation={`slide${direction.charAt(0).toUpperCase() + direction.slice(1)}`}
      duration={duration}
      trigger={isVisible}
      className={`slide-transition slide-${direction}`}
    >
      {children}
    </AnimatedContainer>
  )
}

// Loading Animation
export function LoadingAnimation({ 
  type = 'spinner', 
  size = 'medium', 
  color = 'primary',
  className = ''
}) {
  const sizeClasses = {
    small: 'loading-sm',
    medium: 'loading-md',
    large: 'loading-lg'
  }

  const colorClasses = {
    primary: 'loading-primary',
    secondary: 'loading-secondary',
    success: 'loading-success',
    warning: 'loading-warning',
    error: 'loading-error'
  }

  return (
    <div className={`loading-animation loading-${type} ${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
      {type === 'spinner' && (
        <div className="spinner">
          <div className="spinner-circle"></div>
        </div>
      )}
      {type === 'dots' && (
        <div className="dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      )}
      {type === 'pulse' && (
        <div className="pulse">
          <div className="pulse-circle"></div>
        </div>
      )}
      {type === 'bars' && (
        <div className="bars">
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      )}
    </div>
  )
}

// Intersection Observer Animation
export function InViewAnimation({ 
  children, 
  animation = 'fadeInUp', 
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
  className = ''
}) {
  const [isInView, setIsInView] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const elementRef = useRef(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!triggerOnce || !hasTriggered)) {
          setIsInView(true)
          setHasTriggered(true)
        } else if (!triggerOnce) {
          setIsInView(entry.isIntersecting)
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, triggerOnce, hasTriggered])

  return (
    <div ref={elementRef} className={`in-view-animation ${className}`}>
      <AnimatedContainer
        animation={animation}
        trigger={isInView}
      >
        {children}
      </AnimatedContainer>
    </div>
  )
}

export default AnimatedContainer
