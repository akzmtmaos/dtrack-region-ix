import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  itemsPerPage?: number
  showResultsText?: boolean
  compact?: boolean
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 20,
  showResultsText = true,
  compact = false
}) => {
  const { theme } = useTheme()
  const [pageInput, setPageInput] = useState(currentPage.toString())

  useEffect(() => {
    setPageInput(currentPage.toString())
  }, [currentPage])

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = totalItems === 0 ? 0 : Math.min(currentPage * itemsPerPage, totalItems)

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value)
  }

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const page = parseInt(pageInput)
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page)
    } else {
      setPageInput(currentPage.toString())
    }
  }

  const handlePageInputBlur = () => {
    const page = parseInt(pageInput)
    if (isNaN(page) || page < 1 || page > totalPages) {
      setPageInput(currentPage.toString())
    }
  }

  return (
    <div 
      className={`${compact ? '' : 'px-4 py-3 sm:px-6'} flex items-center justify-between ${
        compact ? '' : (theme === 'dark'
          ? 'bg-dark-hover/50 border-t'
          : 'bg-gray-50 border-t border-gray-200')
      }`}
      style={compact ? {} : (theme === 'dark' ? { borderColor: '#4a4b4c' } : undefined)}
    >
      {/* Mobile pagination */}
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-4 py-1.5 border text-xs font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
            theme === 'dark'
              ? 'text-gray-300 bg-dark-panel hover:bg-dark-hover hover:text-white'
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
          }`}
          style={theme === 'dark' ? { borderColor: '#4a4b4c' } : undefined}
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`ml-3 relative inline-flex items-center px-4 py-1.5 border text-xs font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
            theme === 'dark'
              ? 'text-dark-text bg-dark-panel hover:bg-dark-hover'
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
          }`}
          style={theme === 'dark' ? { borderColor: '#4a4b4c' } : undefined}
        >
          Next
        </button>
      </div>

      {/* Desktop pagination */}
      <div className={`hidden sm:flex-1 sm:flex sm:items-center ${showResultsText ? 'sm:justify-between' : 'sm:justify-end'}`}>
        {showResultsText && (
          <div>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Showing <span className={`font-medium ${theme === 'dark' ? 'text-white' : ''}`}>{startItem}</span> to <span className={`font-medium ${theme === 'dark' ? 'text-white' : ''}`}>{endItem}</span> of{' '}
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : ''}`}>{totalItems}</span> results
            </p>
          </div>
        )}
        <div>
          <nav className="relative z-0 inline-flex items-center rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center justify-center px-2 h-[28px] rounded-l-md border text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === 'dark'
                  ? 'bg-dark-panel text-gray-300 hover:bg-dark-hover hover:text-white'
                  : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
              }`}
              style={theme === 'dark' ? { borderColor: '#4a4b4c' } : undefined}
            >
              <span className="sr-only">Previous</span>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <div 
              className={`flex items-center border-t border-b px-2 h-[28px] ${
                theme === 'dark'
                  ? 'bg-dark-panel'
                  : 'border-gray-300 bg-white'
              }`}
              style={theme === 'dark' ? { borderColor: '#4a4b4c' } : undefined}
            >
              <span className={`text-xs mr-2 leading-none ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Page</span>
              <form onSubmit={handlePageInputSubmit} className="flex items-center h-full">
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={pageInput}
                  onChange={handlePageInputChange}
                  onBlur={handlePageInputBlur}
                  className={`w-12 px-1 h-[20px] text-center text-xs border rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none leading-none ${
                    theme === 'dark'
                      ? 'text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  style={theme === 'dark' ? { 
                    backgroundColor: '#202225',
                    borderColor: '#4a4b4c'
                  } : undefined}
                />
              </form>
              <span className={`text-xs ml-2 leading-none ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>of {totalPages}</span>
            </div>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center justify-center px-2 h-[28px] rounded-r-md border text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === 'dark'
                  ? 'bg-dark-panel text-gray-300 hover:bg-dark-hover hover:text-white'
                  : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
              }`}
              style={theme === 'dark' ? { borderColor: '#4a4b4c' } : undefined}
            >
              <span className="sr-only">Next</span>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Pagination

