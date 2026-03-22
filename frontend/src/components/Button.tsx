import React from 'react'
import { useTheme } from '../context/ThemeContext'

const TrashOutlineIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={`flex-shrink-0 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
)

export interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  disabled?: boolean
  className?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
  icon,
  iconPosition = 'left',
  fullWidth = false
}) => {
  const { theme } = useTheme()

  const getVariantClasses = () => {
    if (variant === 'primary') {
      // Green: #3BA55C – border matches icon/background
      return 'bg-[#3BA55C] text-white border border-[#3BA55C] hover:bg-[#2d8f4a] hover:border-[#2d8f4a] active:bg-[#267a3f] active:border-[#267a3f]'
    }
    if (variant === 'secondary') {
      if (theme === 'dark') {
        return 'bg-dark-hover text-gray-300 border hover:bg-dark-hover/80 hover:text-white'
      }
      return 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
    }
    if (variant === 'danger') {
      // Outline delete: red border + red icon/text (matches Trash / reference tables)
      if (theme === 'dark') {
        return 'bg-transparent text-red-400 border border-red-500 hover:bg-red-950/30 active:bg-red-950/40'
      }
      return 'bg-transparent text-red-600 border border-red-500 hover:bg-red-50 active:bg-red-100'
    }
    if (variant === 'success') {
      // Blue: #5865F2 – border matches icon/background
      return 'bg-[#5865F2] text-white border border-[#5865F2] hover:bg-[#4752C4] hover:border-[#4752C4] active:bg-[#3c45a5] active:border-[#3c45a5]'
    }
    return ''
  }

  const baseClasses = `
    px-2.5 py-1.5 
    text-xs font-medium
    rounded-md
    transition-all duration-200
    flex items-center justify-center
    gap-1.5
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none
    whitespace-nowrap
  `

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${getVariantClasses()}
        ${widthClass}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      style={
        variant === 'secondary' && theme === 'dark'
          ? { borderColor: '#4a4b4c' }
          : undefined
      }
    >
      {variant === 'danger' && !icon && <TrashOutlineIcon />}
      {icon && iconPosition === 'left' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </button>
  )
}

export default Button

