import React from 'react'

const OfficeWithOverdue: React.FC = () => {
  return (
    <div className="container mx-auto px-4 pt-4 pb-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Office With Overdue</h1>
      
      <div className="flex justify-end items-center gap-3 mb-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors w-64"
          />
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <hr className="mb-4 border-gray-300" />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-700">Document Type content will be displayed here.</p>
      </div>
    </div>
  )
}

export default OfficeWithOverdue