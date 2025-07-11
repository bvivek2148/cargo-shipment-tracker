import { useState, useEffect, useRef } from 'react'
import { Menu, X, Home, Package, Plus, BarChart3, Users, User, LogOut } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
// import { FocusTrap } from './AccessibilityHelpers'

function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const menuRef = useRef(null)

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleLogout = async () => {
    await logout()
    setIsOpen(false)
  }

  const menuItems = [
    {
      to: '/',
      icon: Home,
      label: 'Dashboard',
      description: 'Overview and analytics'
    },
    {
      to: '/shipments',
      icon: Package,
      label: 'Shipments',
      description: 'View all shipments'
    },
    {
      to: '/shipments/new',
      icon: Plus,
      label: 'New Shipment',
      description: 'Create new shipment'
    },
    {
      to: '/analytics',
      icon: BarChart3,
      label: 'Analytics',
      description: 'Reports and insights'
    }
  ]

  // Add admin-only items
  if (user?.role === 'admin') {
    menuItems.push({
      to: '/users',
      icon: Users,
      label: 'User Management',
      description: 'Manage system users'
    })
  }

  return (
    <>
      {/* Mobile menu toggle button */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsOpen(false)}>
          <div
            ref={menuRef}
            id="mobile-menu"
            className="mobile-menu"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
              {/* Menu header */}
              <div className="mobile-menu-header">
                <div className="user-info">
                  <div className="user-avatar">
                    <User size={24} />
                  </div>
                  <div className="user-details">
                    <div className="user-name">{user?.fullName}</div>
                    <div className={`user-role role-${user?.role}`}>
                      {user?.role}
                    </div>
                  </div>
                </div>
                <button
                  className="close-button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Menu items */}
              <nav className="mobile-menu-nav" role="navigation" aria-label="Main navigation">
                <ul className="menu-items">
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.to
                    
                    return (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          className={`menu-item ${isActive ? 'active' : ''}`}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <div className="menu-item-icon">
                            <Icon size={20} />
                          </div>
                          <div className="menu-item-content">
                            <div className="menu-item-label">{item.label}</div>
                            <div className="menu-item-description">{item.description}</div>
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>

              {/* Menu footer */}
              <div className="mobile-menu-footer">
                <Link
                  to="/profile"
                  className="menu-item"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="menu-item-icon">
                    <User size={20} />
                  </div>
                  <div className="menu-item-content">
                    <div className="menu-item-label">Profile</div>
                    <div className="menu-item-description">Account settings</div>
                  </div>
                </Link>
                
                <button
                  className="menu-item logout-item"
                  onClick={handleLogout}
                >
                  <div className="menu-item-icon">
                    <LogOut size={20} />
                  </div>
                  <div className="menu-item-content">
                    <div className="menu-item-label">Logout</div>
                    <div className="menu-item-description">Sign out of account</div>
                  </div>
                </button>
              </div>
            </div>
        </div>
      )}
    </>
  )
}

export default MobileMenu
