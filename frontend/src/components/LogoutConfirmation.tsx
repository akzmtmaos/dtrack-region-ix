import React, { useState } from 'react'

interface LogoutConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

const LogoutConfirmation: React.FC<LogoutConfirmationProps> = ({ isOpen, onClose, onConfirm }) => {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleConfirm = () => {
    if (isLoading) return // Prevent double clicks
    
    setIsLoading(true)
    // Close modal immediately
    onClose()
    // Execute logout
    setTimeout(() => {
      onConfirm()
    }, 100)
  }

  const handleClose = () => {
    if (isLoading) return // Prevent closing during logout
    onClose()
  }

  return (
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      style={{ margin: 0, padding: 0 }}
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            Confirm Logout
          </h3>
          
          <p className="text-sm text-gray-600 text-center mb-6">
            Are you sure you want to logout? You will need to login again to access the system.
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium transition-colors ${
                isLoading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                isLoading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
              style={{ backgroundColor: 'rgba(100, 154, 70)' }}
            >
              {isLoading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LogoutConfirmation

