import React, { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import Button from '../Button'

interface Document {
  id: number
  documentControlNo: string
  routeNo: string
  officeControlNo: string
  subject: string
  [key: string]: any
}

interface RoutingSlipModalProps {
  isOpen: boolean
  onClose: () => void
  document: Document | null
}

const RoutingSlipModal: React.FC<RoutingSlipModalProps> = ({ isOpen, onClose, document }) => {
  const { theme } = useTheme()
  const [routingData, setRoutingData] = useState({
    from: '',
    to: '',
    date: '',
    remarks: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setRoutingData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement routing slip submission logic
    console.log('Routing Slip Data:', routingData)
    onClose()
  }

  const handleClose = () => {
    setRoutingData({
      from: '',
      to: '',
      date: '',
      remarks: ''
    })
    onClose()
  }

  if (!isOpen || !document) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]" onClick={handleClose}>
      <div className={`rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col ${
        theme === 'dark' ? 'bg-discord-dark' : 'bg-white'
      }`} onClick={(e) => e.stopPropagation()}>
        <div className={`px-6 py-4 border-b ${
          theme === 'dark' ? '' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>Routing Slip</h2>
          <p className={`text-sm mt-1 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>Document Control No.: {document.documentControlNo}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
            {/* From */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                From <span className={theme === 'dark' ? 'text-red-400' : 'text-red-500'}>*</span>
              </label>
              <input
                type="text"
                name="from"
                value={routingData.from}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                  theme === 'dark'
                    ? 'bg-discord-dark text-white placeholder-gray-400'
                    : 'border-gray-300'
                }`}
                placeholder="Enter source office/employee"
              />
            </div>

            {/* To */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                To <span className={theme === 'dark' ? 'text-red-400' : 'text-red-500'}>*</span>
              </label>
              <input
                type="text"
                name="to"
                value={routingData.to}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                  theme === 'dark'
                    ? 'bg-discord-dark text-white placeholder-gray-400'
                    : 'border-gray-300'
                }`}
                placeholder="Enter destination office/employee"
              />
            </div>

            {/* Date */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Date <span className={theme === 'dark' ? 'text-red-400' : 'text-red-500'}>*</span>
              </label>
              <input
                type="date"
                name="date"
                value={routingData.date}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                  theme === 'dark'
                    ? 'border-discord-hover bg-discord-dark text-white'
                    : 'border-gray-300'
                }`}
              />
            </div>

            {/* Remarks */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Remarks
              </label>
              <textarea
                name="remarks"
                value={routingData.remarks}
                onChange={handleChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                  theme === 'dark'
                    ? 'bg-discord-dark text-white placeholder-gray-400'
                    : 'border-gray-300'
                }`}
                placeholder="Enter routing remarks"
              />
            </div>
          </div>
          </div>

          {/* Sticky Footer with Buttons */}
          <div className={`border-t px-6 py-4 flex justify-end space-x-3 ${
            theme === 'dark' 
              ? 'border-discord-hover bg-discord-dark' 
              : 'border-gray-200 bg-white'
          }`}>
            <Button
              type="button"
              onClick={handleClose}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Submit Routing Slip
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RoutingSlipModal

