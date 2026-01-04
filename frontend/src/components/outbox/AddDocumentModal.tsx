import React, { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import Button from '../Button'

interface AddDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (document: any) => void
}

const AddDocumentModal: React.FC<AddDocumentModalProps> = ({ isOpen, onClose, onAdd }) => {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState('basic')
  const [formData, setFormData] = useState({
    subject: '',
    documentType: '',
    sourceType: '',
    internalOriginatingOffice: '',
    internalOriginatingEmployee: '',
    externalOriginatingOffice: '',
    externalOriginatingEmployee: '',
    noOfPages: '',
    attachedDocumentFilename: '',
    attachmentList: '',
    userid: '',
    inSequence: '',
    remarks: '',
    referenceDocumentControlNo1: '',
    referenceDocumentControlNo2: '',
    referenceDocumentControlNo3: '',
    referenceDocumentControlNo4: '',
    referenceDocumentControlNo5: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const RequiredAsterisk = () => <span className={theme === 'dark' ? 'text-red-400' : 'text-red-500'}>*</span>

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }
    if (!formData.internalOriginatingOffice.trim()) {
      newErrors.internalOriginatingOffice = 'Internal Originating Office is required'
    }
    if (!formData.internalOriginatingEmployee.trim()) {
      newErrors.internalOriginatingEmployee = 'Internal Originating Employee is required'
    }
    if (formData.sourceType === 'External' && !formData.externalOriginatingEmployee.trim()) {
      newErrors.externalOriginatingEmployee = 'External Originating Employee is required'
    }
    if (!formData.remarks.trim()) {
      newErrors.remarks = 'Remarks is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validate()) {
      onAdd({
        id: Date.now(),
        ...formData
      })
      
      // Reset form
      const emptyForm = {
        subject: '',
        documentType: '',
        sourceType: '',
        internalOriginatingOffice: '',
        internalOriginatingEmployee: '',
        externalOriginatingOffice: '',
        externalOriginatingEmployee: '',
        noOfPages: '',
        attachedDocumentFilename: '',
        attachmentList: '',
        userid: '',
        inSequence: '',
        remarks: '',
        referenceDocumentControlNo1: '',
        referenceDocumentControlNo2: '',
        referenceDocumentControlNo3: '',
        referenceDocumentControlNo4: '',
        referenceDocumentControlNo5: ''
      }
      setFormData(emptyForm)
      setErrors({})
      setActiveTab('basic')
      onClose()
    }
  }

  const handleClose = () => {
    const emptyForm = {
      subject: '',
      documentType: '',
      sourceType: '',
      internalOriginatingOffice: '',
      internalOriginatingEmployee: '',
      externalOriginatingOffice: '',
      externalOriginatingEmployee: '',
      noOfPages: '',
      attachedDocumentFilename: '',
      attachmentList: '',
      userid: '',
      inSequence: '',
      remarks: '',
      referenceDocumentControlNo1: '',
      referenceDocumentControlNo2: '',
      referenceDocumentControlNo3: '',
      referenceDocumentControlNo4: '',
      referenceDocumentControlNo5: ''
    }
    setFormData(emptyForm)
    setErrors({})
    setActiveTab('basic')
    onClose()
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'basic', label: 'Basic Information' },
    { id: 'originating', label: 'Originating Information' },
    { id: 'attachments', label: 'Attachments' },
    { id: 'references', label: 'References' },
    { id: 'additional', label: 'Additional' }
  ]

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]" onClick={handleClose}>
      <div className={`rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col ${
        theme === 'dark' ? 'bg-discord-dark' : 'bg-white'
      }`} onClick={(e) => e.stopPropagation()}>
        <div 
          className={`px-6 py-4 border-b ${theme === 'dark' ? '' : 'border-gray-200'}`}
          style={theme === 'dark' ? { borderColor: '#4a4b4c' } : undefined}
        >
          <h2 className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>Add New Document</h2>
        </div>
        
        {/* Tabs */}
        <div 
          className={`border-b px-6 ${theme === 'dark' ? '' : 'border-gray-200'}`}
          style={theme === 'dark' ? { borderColor: '#4a4b4c' } : undefined}
        >
          <div className="flex space-x-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-green-500 border-b-2 border-green-500'
                    : theme === 'dark'
                      ? 'text-discord-text hover:text-white hover:bg-discord-hover'
                      : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
            <div className="space-y-4">
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
                    errors.subject 
                      ? 'border-red-500' 
                      : theme === 'dark'
                        ? 'bg-discord-dark text-white'
                        : 'border-gray-300'
                  }`}
                />
                {errors.subject && (
                  <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{errors.subject}</p>
                )}
              </div>

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
                      ? 'border-discord-hover bg-discord-dark text-white'
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
                      ? 'border-discord-hover bg-discord-dark text-white'
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">Select source type</option>
                  <option value="Internal">Internal</option>
                  <option value="External">External</option>
                </select>
              </div>
            </div>
          )}

          {/* Originating Information Tab */}
          {activeTab === 'originating' && (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Internal Originating Office <RequiredAsterisk />
                </label>
                <input
                  type="text"
                  name="internalOriginatingOffice"
                  value={formData.internalOriginatingOffice}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    errors.internalOriginatingOffice ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.internalOriginatingOffice && (
                  <p className="mt-1 text-sm text-red-600">{errors.internalOriginatingOffice}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Internal Originating Employee <RequiredAsterisk />
                </label>
                <input
                  type="text"
                  name="internalOriginatingEmployee"
                  value={formData.internalOriginatingEmployee}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    errors.internalOriginatingEmployee ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.internalOriginatingEmployee && (
                  <p className="mt-1 text-sm text-red-600">{errors.internalOriginatingEmployee}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  If External Source, Originating Office
                </label>
                <input
                  type="text"
                  name="externalOriginatingOffice"
                  value={formData.externalOriginatingOffice}
                  onChange={handleChange}
                  disabled={formData.sourceType !== 'External'}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    formData.sourceType !== 'External' ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  If External Source, Originating Employee <RequiredAsterisk />
                </label>
                <input
                  type="text"
                  name="externalOriginatingEmployee"
                  value={formData.externalOriginatingEmployee}
                  onChange={handleChange}
                  disabled={formData.sourceType !== 'External'}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    formData.sourceType !== 'External' ? 'bg-gray-100 cursor-not-allowed' : ''
                  } ${
                    errors.externalOriginatingEmployee ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.externalOriginatingEmployee && (
                  <p className="mt-1 text-sm text-red-600">{errors.externalOriginatingEmployee}</p>
                )}
              </div>
            </div>
          )}

          {/* Attachments Tab */}
          {activeTab === 'attachments' && (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  No. of Pages
                </label>
                <input
                  type="number"
                  name="noOfPages"
                  value={formData.noOfPages}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    theme === 'dark'
                      ? 'border-discord-hover bg-discord-dark text-white'
                      : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Attached Document Filename
                </label>
                <input
                  type="text"
                  name="attachedDocumentFilename"
                  value={formData.attachedDocumentFilename}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    theme === 'dark'
                      ? 'border-discord-hover bg-discord-dark text-white'
                      : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Attachment List
                </label>
                <textarea
                  name="attachmentList"
                  value={formData.attachmentList}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    theme === 'dark'
                      ? 'border-discord-hover bg-discord-dark text-white'
                      : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
          )}

          {/* References Tab */}
          {activeTab === 'references' && (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Reference Document Control No. (1)
                </label>
                <input
                  type="text"
                  name="referenceDocumentControlNo1"
                  value={formData.referenceDocumentControlNo1}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    theme === 'dark'
                      ? 'border-discord-hover bg-discord-dark text-white'
                      : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Reference Document Control No. (2)
                </label>
                <input
                  type="text"
                  name="referenceDocumentControlNo2"
                  value={formData.referenceDocumentControlNo2}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    theme === 'dark'
                      ? 'border-discord-hover bg-discord-dark text-white'
                      : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Reference Document Control No. (3)
                </label>
                <input
                  type="text"
                  name="referenceDocumentControlNo3"
                  value={formData.referenceDocumentControlNo3}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    theme === 'dark'
                      ? 'border-discord-hover bg-discord-dark text-white'
                      : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Reference Document Control No. (4)
                </label>
                <input
                  type="text"
                  name="referenceDocumentControlNo4"
                  value={formData.referenceDocumentControlNo4}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    theme === 'dark'
                      ? 'border-discord-hover bg-discord-dark text-white'
                      : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Reference Document Control No. (5)
                </label>
                <input
                  type="text"
                  name="referenceDocumentControlNo5"
                  value={formData.referenceDocumentControlNo5}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    theme === 'dark'
                      ? 'border-discord-hover bg-discord-dark text-white'
                      : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Additional Tab */}
          {activeTab === 'additional' && (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  User ID
                </label>
                <input
                  type="text"
                  name="userid"
                  value={formData.userid}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    theme === 'dark'
                      ? 'border-discord-hover bg-discord-dark text-white'
                      : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  In Sequence (action)
                </label>
                <input
                  type="text"
                  name="inSequence"
                  value={formData.inSequence}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    theme === 'dark'
                      ? 'border-discord-hover bg-discord-dark text-white'
                      : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Remarks <RequiredAsterisk />
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    errors.remarks 
                      ? 'border-red-500' 
                      : theme === 'dark'
                        ? 'bg-discord-dark text-white'
                        : 'border-gray-300'
                  }`}
                />
                {errors.remarks && (
                  <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{errors.remarks}</p>
                )}
              </div>
            </div>
          )}
          </div>

          {/* Sticky Footer with Buttons */}
          <div 
            className={`border-t px-6 py-4 flex justify-end space-x-3 ${
              theme === 'dark' 
                ? 'bg-discord-dark' 
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
              Add Document
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddDocumentModal

