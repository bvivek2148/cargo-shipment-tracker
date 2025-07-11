import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { AlertCircle, Shield } from 'lucide-react'

function ProtectedRoute({ children, requiredRole, requiredPermission }) {
  const { isAuthenticated, isLoading, user, hasPermission, hasRole } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <Shield size={48} className="loading-icon" />
          <h3>Verifying Access...</h3>
          <p>Please wait while we check your permissions</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <AlertCircle size={64} className="access-denied-icon" />
          <h2>Access Denied</h2>
          <p>
            You need <strong>{requiredRole}</strong> role to access this page.
          </p>
          <p>
            Your current role: <strong>{user?.role}</strong>
          </p>
          <button 
            onClick={() => window.history.back()}
            className="btn btn-secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <AlertCircle size={64} className="access-denied-icon" />
          <h2>Insufficient Permissions</h2>
          <p>
            You need <strong>{requiredPermission}</strong> level permissions or higher to access this page.
          </p>
          <p>
            Your current role: <strong>{user?.role}</strong>
          </p>
          <button 
            onClick={() => window.history.back()}
            className="btn btn-secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Render children if all checks pass
  return children
}

export default ProtectedRoute
