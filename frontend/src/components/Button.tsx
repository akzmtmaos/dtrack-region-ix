import React from 'react'
import { useTheme } from '../context/ThemeContext'

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
      // Discord green: #3BA55C
      return 'bg-[#3BA55C] text-white hover:bg-[#2d8f4a] active:bg-[#267a3f]'
    }
    if (variant === 'secondary') {
      if (theme === 'dark') {
        return 'bg-discord-hover text-gray-300 border hover:bg-discord-hover/80 hover:text-white'
      }
      return 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
    }
    if (variant === 'danger') {
      // Discord red: #ED4245
      return 'bg-[#ED4245] text-white hover:bg-[#d63639] active:bg-[#c02d30]'
    }
    if (variant === 'success') {
      // Discord blue: #5865F2
      return 'bg-[#5865F2] text-white hover:bg-[#4752C4] active:bg-[#3c45a5]'
    }
    return ''
  }

  const baseClasses = `
    px-4 py-2 
    text-sm font-semibold
    rounded-md
    transition-all duration-200
    flex items-center justify-center
    gap-2
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
      style={variant === 'secondary' && theme === 'dark' ? { borderColor: '#4a4b4c' } : undefined}
    >
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

