import React, { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import Button from '../Button'

interface Document {
  id: number
  documentControlNo: string
  routeNo: string
  officeControlNo: string
  subject: string
  documentType: string
  sourceType: string
  internalOriginatingOffice: string
  internalOriginatingEmployee: string
  externalOriginatingOffice: string
  externalOriginatingEmployee: string
  noOfPages: string
  attachedDocumentFilename: string
  attachmentList: string
  userid: string
  inSequence: string
  remarks: string
  referenceDocumentControlNo1: string
  referenceDocumentControlNo2: string
  referenceDocumentControlNo3: string
  referenceDocumentControlNo4: string
  referenceDocumentControlNo5: string
}

interface InlineEditModalProps {
  isOpen: boolean
  onClose: () => void
  document: Document | null
  onSave: (document: Document) => void
}

const InlineEditModal: React.FC<InlineEditModalProps> = ({ isOpen, onClose, document, onSave }) => {
  const { theme } = useTheme()
  const [formData, setFormData] = useState<Document | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (document) {
      setFormData(document)
    }
  }, [document])

  const RequiredAsterisk = () => <span className={theme === 'dark' ? 'text-red-400' : 'text-red-500'}>*</span>

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!formData) return
    const { name, value } = e.target
    setFormData(prev => prev ? ({
      ...prev,
      [name]: value
    }) : null)
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validate = () => {
    if (!formData) return false
    const newErrors: Record<string, string> = {}
    
    if (!formData.documentControlNo.trim()) {
      newErrors.documentControlNo = 'Document Control No. is required'
    }
    if (!formData.routeNo.trim()) {
      newErrors.routeNo = 'Route No. is required'
    }
    if (!formData.officeControlNo.trim()) {
      newErrors.officeControlNo = 'Office Control No. is required'
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return
    
    if (validate()) {
      onSave(formData)
      onClose()
    }
  }

  const handleClose = () => {
    if (document) {
      setFormData(document)
    }
    setErrors({})
    onClose()
  }

  if (!isOpen || !document || !formData) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]" onClick={handleClose}>
      <div className={`rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col ${
        theme === 'dark' ? 'bg-dark-panel' : 'bg-white'
      }`} onClick={(e) => e.stopPropagation()}>
        <div className={`px-6 py-4 border-b ${
          theme === 'dark' ? '' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>Inline Edit</h2>
          <p className={`text-sm mt-1 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>Quick edit for essential fields</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid grid-cols-2 gap-4">
            {/* Document Control No. */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Document Control No. <RequiredAsterisk />
              </label>
              <input
                type="text"
                name="documentControlNo"
                value={formData.documentControlNo}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                  errors.documentControlNo 
                    ? 'border-red-500' 
                    : theme === 'dark'
                        ? 'bg-dark-panel text-white'
                      : 'border-gray-300'
                }`}
              />
              {errors.documentControlNo && (
                <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{errors.documentControlNo}</p>
              )}
            </div>

            {/* Route No. */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Route No. <RequiredAsterisk />
              </label>
              <input
                type="text"
                name="routeNo"
                value={formData.routeNo}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                  errors.routeNo ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.routeNo && (
                <p className="mt-1 text-sm text-red-600">{errors.routeNo}</p>
              )}
            </div>

            {/* Office Control No. */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Office Control No. <RequiredAsterisk />
              </label>
              <input
                type="text"
                name="officeControlNo"
                value={formData.officeControlNo}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                  errors.officeControlNo ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.officeControlNo && (
                <p className="mt-1 text-sm text-red-600">{errors.officeControlNo}</p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Subject <RequiredAsterisk />
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                  errors.subject ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
              )}
            </div>

            {/* Document Type */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Document Type
              </label>
              <select
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                  theme === 'dark'
                        ? 'bg-dark-panel text-white'
                    : 'border-gray-300'
                }`}
              >
                <option value="">Select document type</option>
                <option value="Memo">Memo</option>
                <option value="Letter">Letter</option>
                <option value="Report">Report</option>
                <option value="Order">Order</option>
              </select>
            </div>

            {/* Source Type */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Source Type
              </label>
              <select
                name="sourceType"
                value={formData.sourceType}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                  theme === 'dark'
                        ? 'bg-dark-panel text-white'
                    : 'border-gray-300'
                }`}
              >
                <option value="">Select source type</option>
                <option value="Internal">Internal</option>
                <option value="External">External</option>
              </select>
            </div>

            {/* Remarks */}
            <div className="col-span-2">
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                  theme === 'dark'
                        ? 'bg-dark-panel text-white'
                    : 'border-gray-300'
                }`}
              />
            </div>
          </div>
          </div>

          {/* Sticky Footer with Buttons */}
          <div className={`border-t px-6 py-4 flex justify-end space-x-3 ${
            theme === 'dark' 
              ? 'border-dark-hover bg-dark-panel' 
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
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InlineEditModal

