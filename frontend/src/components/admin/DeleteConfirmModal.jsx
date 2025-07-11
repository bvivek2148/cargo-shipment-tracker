import { useState } from 'react'
import { X, Trash2, AlertTriangle } from 'lucide-react'

function DeleteConfirmModal({ isOpen, onClose, onConfirm, user }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleConfirm = async () => {
    if (confirmText !== 'DELETE') {
      return
    }

    setIsDeleting(true)
    
    try {
      await onConfirm(user._id)
      handleClose()
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    setConfirmText('')
    setIsDeleting(false)
    onClose()
  }

  if (!isOpen || !user) return null

  const isConfirmValid = confirmText === 'DELETE'

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-danger">
        <div className="modal-header">
          <h2>
            <AlertTriangle size={24} />
            Delete User
          </h2>
          <button onClick={handleClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="danger-warning">
            <AlertTriangle size={48} className="warning-icon" />
            <h3>This action cannot be undone!</h3>
            <p>
              You are about to permanently delete the user account for:
            </p>
            <div className="user-info-card">
              <div className="user-avatar">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <div className="user-details">
                <div className="user-name">
                  {user.firstName} {user.lastName}
                </div>
                <div className="user-email">{user.email}</div>
                <span className={`role-badge role-${user.role}`}>
                  {user.role}
                </span>
              </div>
            </div>
            <p>
              This will permanently remove all user data, including:
            </p>
            <ul>
              <li>User profile and account information</li>
              <li>Access permissions and role assignments</li>
              <li>Any associated activity logs</li>
            </ul>
          </div>

          <div className="confirmation-input">
            <label htmlFor="confirmText">
              To confirm deletion, type <strong>DELETE</strong> in the box below:
            </label>
            <input
              type="text"
              id="confirmText"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className={confirmText && !isConfirmValid ? 'error' : ''}
            />
            {confirmText && !isConfirmValid && (
              <span className="error-message">
                Please type "DELETE" exactly as shown
              </span>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-secondary"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="btn btn-danger"
            disabled={!isConfirmValid || isDeleting}
          >
            <Trash2 size={16} />
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal
