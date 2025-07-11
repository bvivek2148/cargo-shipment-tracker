import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  Users, Plus, Edit, Trash2, Search, Filter, Eye,
  UserPlus, Shield, AlertCircle, CheckCircle, X
} from 'lucide-react'
import { userAPI } from '../../services/api'
import CreateUserModal from './CreateUserModal'
import EditUserModal from './EditUserModal'
import DeleteConfirmModal from './DeleteConfirmModal'

function UserManagement() {
  const { user, hasRole } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    isActive: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10
  })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [deletingUser, setDeletingUser] = useState(null)

  // Only allow admin access
  if (!hasRole('admin')) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <Shield size={64} className="access-denied-icon" />
          <h2>Admin Access Required</h2>
          <p>You need administrator privileges to access user management.</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchUsers()
  }, [filters, pagination.currentPage])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        ...filters
      }

      // Remove 'all' values
      Object.keys(params).forEach(key => {
        if (params[key] === 'all') {
          delete params[key]
        }
      })

      const response = await userAPI.getAll(params)

      if (response.success) {
        setUsers(response.data)
        setPagination(prev => ({
          ...prev,
          ...response.pagination
        }))
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setError(error.response?.data?.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleCreateUser = async (userData) => {
    try {
      const response = await userAPI.create(userData)

      if (response.success) {
        fetchUsers()
        setShowCreateModal(false)
        // Show success message
      }
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  const handleUpdateUser = async (userId, userData) => {
    try {
      const response = await userAPI.update(userId, userData)

      if (response.success) {
        fetchUsers()
        setEditingUser(null)
        // Show success message
      }
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      const response = await userAPI.delete(userId)

      if (response.success) {
        fetchUsers()
        setDeletingUser(null)
        // Show success message
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setError(error.response?.data?.message || 'Failed to delete user')
    }
  }

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'role-admin'
      case 'manager': return 'role-manager'
      case 'user': return 'role-user'
      default: return 'role-user'
    }
  }

  if (loading && users.length === 0) {
    return (
      <div className="loading-screen">
        <Users size={48} className="loading-icon" />
        <h3>Loading Users...</h3>
      </div>
    )
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <Users size={32} />
            User Management
          </h1>
          <p>Manage system users and their permissions</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <UserPlus size={16} />
          Add User
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name, email, or department..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>

          <select
            value={filters.isActive}
            onChange={(e) => handleFilterChange('isActive', e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-')
              setFilters(prev => ({ ...prev, sortBy, sortOrder }))
            }}
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="firstName-asc">Name A-Z</option>
            <option value="firstName-desc">Name Z-A</option>
            <option value="email-asc">Email A-Z</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <div className="users-table">
          <div className="table-header">
            <div className="table-row">
              <div className="table-cell">User</div>
              <div className="table-cell">Role</div>
              <div className="table-cell">Department</div>
              <div className="table-cell">Status</div>
              <div className="table-cell">Last Login</div>
              <div className="table-cell">Actions</div>
            </div>
          </div>

          <div className="table-body">
            {users.map(userItem => (
              <div key={userItem._id} className="table-row">
                <div className="table-cell">
                  <div className="user-info">
                    <div className="user-avatar">
                      {userItem.firstName?.[0]}{userItem.lastName?.[0]}
                    </div>
                    <div className="user-details">
                      <div className="user-name">
                        {userItem.firstName} {userItem.lastName}
                      </div>
                      <div className="user-email">{userItem.email}</div>
                    </div>
                  </div>
                </div>

                <div className="table-cell">
                  <span className={`role-badge ${getRoleBadgeClass(userItem.role)}`}>
                    {userItem.role}
                  </span>
                </div>

                <div className="table-cell">
                  {userItem.department || '-'}
                </div>

                <div className="table-cell">
                  <span className={`status-badge ${userItem.isActive ? 'active' : 'inactive'}`}>
                    {userItem.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="table-cell">
                  {userItem.lastLogin ? 
                    new Date(userItem.lastLogin).toLocaleDateString() : 
                    'Never'
                  }
                </div>

                <div className="table-cell">
                  <div className="action-buttons">
                    <button 
                      className="action-btn view-btn"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => setEditingUser(userItem)}
                      title="Edit User"
                    >
                      <Edit size={16} />
                    </button>
                    {userItem._id !== user.id && (
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => setDeletingUser(userItem)}
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {users.length === 0 && !loading && (
          <div className="empty-state">
            <Users size={48} />
            <h3>No users found</h3>
            <p>No users match your current filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            disabled={pagination.currentPage === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages} 
            ({pagination.totalCount} total users)
          </span>
          
          <button 
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            disabled={pagination.currentPage === pagination.totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
      />

      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={handleUpdateUser}
        user={editingUser}
      />

      <DeleteConfirmModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteUser}
        user={deletingUser}
      />
    </div>
  )
}

export default UserManagement
