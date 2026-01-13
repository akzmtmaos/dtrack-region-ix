import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from '../context/ThemeContext'

interface SearchableSelectProps {
  options: Array<{ id: number | string; value: string; label: string }>
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string // Placeholder for search input
  className?: string
  style?: React.CSSProperties
  onFocus?: () => void
  onBlur?: () => void
  disabled?: boolean
  showSearch?: boolean // Option to show/hide search bar
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Find option...',
  className = '',
  style,
  onFocus,
  onBlur,
  disabled = false,
  showSearch = true // Default to showing search
}) => {
  const { theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  // Filter options based on search query
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate dropdown position when opening and on scroll/resize
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        // Use getBoundingClientRect() which gives viewport coordinates (no need for scrollY/scrollX with fixed positioning)
        setDropdownPosition({
          top: rect.bottom + 4, // 4px gap below the button
          left: rect.left,
          width: rect.width
        })
      }
    }

    if (isOpen) {
      updatePosition()
      // Focus search input when dropdown opens (only if search is enabled)
      if (showSearch) {
        setTimeout(() => {
          searchInputRef.current?.focus()
        }, 0)
      }
      
      // Update position on scroll and resize
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        setSearchQuery('')
      }
    }
  }

  const modalBg = theme === 'dark' ? '#171717' : '#ffffff'
  const borderColor = theme === 'dark' ? '#262626' : '#e5e5e5'
  const textPrimary = theme === 'dark' ? '#fafafa' : '#171717'
  const textSecondary = theme === 'dark' ? '#a3a3a3' : '#525252'
  const inputBg = theme === 'dark' ? '#171717' : '#ffffff'
  const hoverBg = theme === 'dark' ? '#262626' : '#f5f5f5'

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Selected Value Display */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors flex items-center justify-between"
        style={{
          backgroundColor: inputBg,
          border: `1px solid ${style?.borderColor || borderColor}`,
          color: selectedOption ? textPrimary : textSecondary,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1
        }}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ color: textSecondary }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu - Rendered via Portal */}
      {isOpen && typeof window !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          className="fixed rounded-md shadow-lg"
          style={{
            backgroundColor: modalBg,
            border: `1px solid ${borderColor}`,
            maxHeight: '300px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 99999,
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            position: 'fixed'
          }}
        >
          {/* Search Input - Only show if showSearch is true */}
          {showSearch && (
            <div className="p-2 border-b" style={{ borderColor }}>
              <div className="relative">
                <svg
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: textSecondary }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-md outline-none"
                  style={{
                    backgroundColor: inputBg,
                    border: `1px solid ${borderColor}`,
                    color: textPrimary
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto" style={{ maxHeight: '250px' }}>
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-center" style={{ color: textSecondary }}>
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className="w-full px-3 py-2 text-xs text-left transition-colors flex items-center justify-between"
                  style={{
                    color: textPrimary,
                    backgroundColor: value === option.value ? hoverBg : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (value !== option.value) {
                      e.currentTarget.style.backgroundColor = hoverBg
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (value !== option.value) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <span>{option.label}</span>
                  {value === option.value && (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: '#3ecf8e' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default SearchableSelect
