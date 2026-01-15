import React from 'react'
import { useTheme } from '../context/ThemeContext'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  itemName?: string
  isBulk?: boolean
  count?: number
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isBulk = false,
  count = 0
}) => {
  const { theme } = useTheme()

  if (!isOpen) return null

  const modalBg = theme === 'dark' ? '#171717' : '#ffffff'
  const borderColor = theme === 'dark' ? '#262626' : '#e5e5e5'
  const textPrimary = theme === 'dark' ? '#fafafa' : '#171717'
  const textSecondary = theme === 'dark' ? '#a3a3a3' : '#525252'

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999]"
      onClick={onClose}
      style={{ backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        className="rounded-lg max-w-md w-full mx-4 overflow-hidden flex flex-col shadow-xl"
        style={{ backgroundColor: modalBg, border: `1px solid ${borderColor}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fee2e2' }}>
              <svg className="w-5 h-5" style={{ color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-1" style={{ color: textPrimary }}>
                {title || (isBulk ? 'Delete Multiple Items' : 'Delete Item')}
              </h2>
              <p className="text-xs" style={{ color: textSecondary }}>
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6" style={{ color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm" style={{ color: textPrimary }}>
                {isBulk ? (
                  <>Are you sure you want to delete <span className="font-semibold">{count} selected item(s)</span>? This action cannot be undone.</>
                ) : (
                  <>Are you sure you want to delete <span className="font-semibold">{itemName || 'this item'}</span>? This action cannot be undone.</>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex justify-end gap-2"
          style={{ borderTop: `1px solid ${borderColor}`, backgroundColor: modalBg }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
            style={{
              color: textSecondary,
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#262626' : '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
            style={{
              color: '#ffffff',
              backgroundColor: '#ef4444'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationModal
