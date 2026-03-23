import React, { useState } from 'react'

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const EyeOffIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
)

export interface PasswordInputWithToggleProps {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  autoComplete?: string
  /** Extra classes on the outer border wrapper */
  className?: string
}

/**
 * Password input with eye icon toggle on the right (same strip as before).
 */
const PasswordInputWithToggle: React.FC<PasswordInputWithToggleProps> = ({
  id,
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
  className = '',
}) => {
  const [show, setShow] = useState(false)

  return (
    <div
      className={`flex w-full rounded-md border border-gray-300 bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 ${className}`}
    >
      <input
        id={id}
        type={show ? 'text' : 'password'}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="flex-1 min-w-0 border-0 bg-transparent px-2.5 py-1.5 text-xs outline-none"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="shrink-0 flex items-center justify-center px-3 py-1.5 text-green-800 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 border-l border-gray-300 select-none"
        aria-label={show ? 'Hide password' : 'Show password'}
        title={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
      </button>
    </div>
  )
}

export default PasswordInputWithToggle
