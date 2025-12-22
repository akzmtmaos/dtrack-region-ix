import React from 'react'

const Calendar: React.FC = () => {
  return (
    <div className="container mx-auto px-4 pt-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Calendar</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-700">Calendar content will be displayed here.</p>
      </div>
    </div>
  )
}

export default Calendar