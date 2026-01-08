import React from 'react'
import { useTheme } from '../context/ThemeContext'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const { theme } = useTheme()

  const baseInputClasses = `
    px-2.5 py-1.5
    text-xs
    rounded-md
    transition-all duration-150
    focus:ring-1 focus:ring-green-500 focus:border-green-500
    outline-none
    border
    ${fullWidth ? 'w-full' : ''}
    ${error ? 'border-red-500' : theme === 'dark' ? '' : 'border-gray-300'}
    ${theme === 'dark'
      ? 'bg-[#202225] text-white placeholder-gray-400'
      : 'bg-white text-gray-900 placeholder-gray-400'
    }
  `

  const iconWrapperClasses = `
    absolute inset-y-0 flex items-center pointer-events-none
    ${iconPosition === 'left' ? 'left-0 pl-2' : 'right-0 pr-2'}
  `

  const inputWithIconClasses = iconPosition === 'left' 
    ? 'pl-7' 
    : iconPosition === 'right' 
      ? 'pr-7' 
      : ''

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className={`block text-xs font-medium mb-1 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className={iconWrapperClasses}>
            <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              {icon}
            </span>
          </div>
        )}
        <input
          className={`${baseInputClasses} ${inputWithIconClasses} ${className}`.trim().replace(/\s+/g, ' ')}
          style={theme === 'dark' ? { 
            backgroundColor: '#202225',
            borderColor: error ? undefined : '#4a4b4c'
          } : undefined}
          {...props}
        />
      </div>
      {error && (
        <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
          {error}
        </p>
      )}
    </div>
  )
}

export default Input

