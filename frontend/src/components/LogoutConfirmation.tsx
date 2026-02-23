import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from '../context/ThemeContext'

interface LogoutConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

const LogoutConfirmation: React.FC<LogoutConfirmationProps> = ({ isOpen, onClose, onConfirm }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { theme } = useTheme()

  if (!isOpen) return null

  const modalBg = theme === 'dark' ? '#171717' : '#ffffff'
  const borderColor = theme === 'dark' ? '#262626' : '#e5e5e5'
  const textPrimary = theme === 'dark' ? '#fafafa' : '#171717'
  const textSecondary = theme === 'dark' ? '#a3a3a3' : '#525252'

  const handleConfirm = () => {
    if (isLoading) return
    setIsLoading(true)
    onClose()
    setTimeout(() => onConfirm(), 100)
  }

  const handleClose = () => {
    if (isLoading) return
    onClose()
  }

  const modal = (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999]"
      onClick={handleClose}
      style={{ backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        className="rounded-lg max-w-md w-full mx-4 overflow-hidden flex flex-col shadow-xl"
        style={{ backgroundColor: modalBg, border: `1px solid ${borderColor}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - same pattern as DeleteConfirmationModal */}
        <div className="px-6 py-5" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fee2e2' }}>
              <svg className="w-5 h-5" style={{ color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold mb-1" style={{ color: textPrimary }}>
                Confirm Logout
              </h2>
              <p className="text-xs" style={{ color: textSecondary }}>
                You will need to login again to access the system.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <p className="text-sm" style={{ color: textPrimary }}>
            Are you sure you want to logout?
          </p>
        </div>

        {/* Footer - same as other modals */}
        <div
          className="px-6 py-4 flex justify-end gap-2"
          style={{ borderTop: `1px solid ${borderColor}`, backgroundColor: modalBg }}
        >
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
            style={{ color: textSecondary, backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = theme === 'dark' ? '#262626' : '#f5f5f5' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
            style={{ color: '#ffffff', backgroundColor: '#ef4444' }}
            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#dc2626' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ef4444' }}
          >
            {isLoading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

export default LogoutConfirmation
