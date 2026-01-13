import React from 'react'
import { useTheme } from '../context/ThemeContext'

export interface TableProps {
  children: React.ReactNode
  className?: string
  pagination?: React.ReactNode
}

const Table: React.FC<TableProps> = ({ children, className = '', pagination }) => {
  const { theme } = useTheme()

  return (
    <div 
      className={`rounded-xl shadow-sm overflow-hidden ${
        theme === 'dark'
          ? 'bg-dark-panel border'
          : 'bg-white border border-gray-200/50'
      } ${className}`}
      style={theme === 'dark' ? { borderColor: '#4a4b4c' } : undefined}
    >
      <div className="overflow-x-auto -mx-1" style={{ minWidth: 0 }}>
        <table className={`w-full divide-y ${
          theme === 'dark' ? 'divide-dark-hover' : 'divide-gray-200'
        }`} style={{ minWidth: 'max-content' }}>
          {children}
        </table>
      </div>
      {pagination}
    </div>
  )
}

export default Table

