import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import Input from '../components/Input'

interface Office {
  id: number
  name: string
}

const OfficeWithOverdue: React.FC = () => {
  const { theme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  
  // Sample data - replace with actual API call later
  const offices: Office[] = [
    { id: 1, name: 'MSD - Accounting' },
    { id: 2, name: 'MSD - Budget' },
    { id: 3, name: 'MSD - Cashier' },
    { id: 4, name: 'MSD - Chief Admin' },
    { id: 5, name: 'MSD - Information Technology' },
    { id: 6, name: 'MSD - Planning' },
    { id: 7, name: 'MSD - Supply' },
    { id: 8, name: 'Regional Director' }
  ]

  // Filter offices based on search query
  const filteredOffices = offices.filter(office =>
    office.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOfficeClick = (office: Office) => {
    // Handle office click - navigate to office details or show modal
    console.log('Clicked office:', office.name)
    // TODO: Implement navigation or modal display
  }

  return (
    <div className="pt-4 pb-8">
      <h1 className={`text-2xl font-semibold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-800'
      }`}>Office With Overdue</h1>
      
      <div className="flex justify-end items-center gap-3 mb-3">
        <Input
          type="text"
          placeholder="Search offices..."
          className="w-48"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          iconPosition="left"
        />
      </div>
      
      <hr 
        className={`mb-6 ${theme === 'dark' ? '' : 'border-gray-300'}`}
        style={theme === 'dark' ? { borderColor: '#4a4b4c' } : undefined}
      />
      
      {filteredOffices.length === 0 ? (
        <div className={`rounded-lg p-8 text-center ${
          theme === 'dark'
            ? 'bg-dark-panel border'
            : 'bg-white shadow-md'
        }`}
        style={theme === 'dark' ? { borderColor: '#4a4b4c' } : undefined}>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
            No offices found matching your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOffices.map((office) => (
            <button
              key={office.id}
              onClick={() => handleOfficeClick(office)}
              className={`group relative rounded-lg p-6 text-left transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-dark-panel border border-[#4a4b4c] hover:bg-dark-hover hover:border-[#5a5b5c]'
                  : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold mb-1 truncate ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {office.name}
                  </h3>
                </div>
                <svg
                  className={`w-5 h-5 flex-shrink-0 ml-2 transition-transform duration-200 group-hover:translate-x-1 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
              <div className={`mt-3 text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Click to view overdue documents
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default OfficeWithOverdue