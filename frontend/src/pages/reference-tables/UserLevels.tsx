import React from 'react'
import { useTheme } from '../../context/ThemeContext'
import Input from '../../components/Input'

const UserLevels: React.FC = () => {
  const { theme } = useTheme()
  
  return (
    <div className="pt-4 pb-8">
      <h1 className={`text-2xl font-semibold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-800'
      }`}>User Levels</h1>
      
      <div className="flex justify-end items-center gap-3 mb-3">
        <Input
          type="text"
          placeholder="Search..."
          className="w-48"
          icon={
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          iconPosition="left"
        />
      </div>
      
      <hr 
        className={`mb-4 ${theme === 'dark' ? '' : 'border-gray-300'}`}
        style={theme === 'dark' ? { borderColor: '#4a4b4c' } : undefined}
      />
      
      <div className={`rounded-lg p-6 ${
        theme === 'dark'
          ? 'bg-dark-panel border'
          : 'bg-white shadow-md'
      }`}
      style={theme === 'dark' ? { borderColor: '#4a4b4c' } : undefined}
      >
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>User Levels content will be displayed here.</p>
      </div>
    </div>
  )
}

export default UserLevels