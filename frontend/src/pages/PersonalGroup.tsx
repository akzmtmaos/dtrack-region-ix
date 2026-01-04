import React from 'react'
import { useTheme } from '../context/ThemeContext'
import Input from '../components/Input'

const PersonalGroup: React.FC = () => {
  const { theme } = useTheme()
  
  return (
    <div className="container mx-auto px-4 pt-4 pb-8">
      <h1 className={`text-3xl font-bold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-800'
      }`}>Personal Group</h1>
      
      <div className="flex justify-end items-center gap-3 mb-3">
        <Input
          type="text"
          placeholder="Search..."
          className="w-64"
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          iconPosition="left"
        />
      </div>
      
      <hr className={`mb-4 ${
        theme === 'dark' ? '' : 'border-gray-300'
      }`} />
      
      <div className={`rounded-lg p-6 ${
        theme === 'dark'
          ? 'bg-discord-dark border'
          : 'bg-white shadow-md'
      }`}>
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Personal Group content will be displayed here.</p>
      </div>
    </div>
  )
}

export default PersonalGroup