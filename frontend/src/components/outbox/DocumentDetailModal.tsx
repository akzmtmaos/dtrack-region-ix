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

interface DocumentDetailModalProps {
  isOpen: boolean
  onClose: () => void
  document: Document | null
  onUpdate?: (document: Document) => void
  mode?: 'view' | 'edit'
}

const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  document, 
  onUpdate,
  mode = 'view' 
}) => {
  const { theme } = useTheme()
  const [isEditMode, setIsEditMode] = useState(mode === 'edit')
  const [activeTab, setActiveTab] = useState('basic')
  const [formData, setFormData] = useState<Document | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (document) {
      setFormData(document)
    }
    setIsEditMode(mode === 'edit')
  }, [document, mode])

  const RequiredAsterisk = () => <span className="text-red-500">*</span>

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

  const handleSave = () => {
    if (!formData) return
    if (validate() && onUpdate) {
      onUpdate(formData)
      setIsEditMode(false)
    }
  }

  const handleCancel = () => {
    if (document) {
      setFormData(document)
    }
    setIsEditMode(false)
    setErrors({})
  }

  if (!isOpen || !document || !formData) return null

  const tabs = [
    { id: 'basic', label: 'Basic Information' },
    { id: 'originating', label: 'Originating Information' },
    { id: 'attachments', label: 'Attachments' },
    { id: 'references', label: 'References' },
    { id: 'additional', label: 'Additional' }
  ]

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]" onClick={onClose}>
      <div className={`rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col ${
        theme === 'dark' ? 'bg-discord-dark' : 'bg-white'
      }`} onClick={(e) => e.stopPropagation()}>
        <div className={`px-6 py-4 border-b flex justify-between items-center ${
          theme === 'dark' ? '' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            {isEditMode ? 'Edit Document' : 'Document Details'}
          </h2>
          {!isEditMode && (
            <Button
              onClick={() => setIsEditMode(true)}
              variant="primary"
            >
              Edit
            </Button>
          )}
        </div>
        
        {/* Tabs */}
        <div className={`border-b px-6 ${
          theme === 'dark' ? '' : 'border-gray-200'
        }`}>
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

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Document Control No. <RequiredAsterisk />
                </label>
                {isEditMode ? (
                  <>
                    <input
                      type="text"
                      name="documentControlNo"
                      value={formData.documentControlNo}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                        errors.documentControlNo ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.documentControlNo && (
                      <p className="mt-1 text-sm text-red-600">{errors.documentControlNo}</p>
                    )}
                  </>
                ) : (
                  <p className={`px-3 py-2 rounded-lg ${
                    theme === 'dark' 
                      ? 'text-gray-300 bg-discord-hover/50' 
                      : 'text-gray-900 bg-gray-50'
                  }`}>{formData.documentControlNo || '-'}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Route No. <RequiredAsterisk />
                </label>
                {isEditMode ? (
                  <>
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
                  </>
                ) : (
                  <p className="px-3 py-2 text-gray-900 bg-gray-50 rounded-lg">{formData.routeNo || '-'}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Office Control No. <RequiredAsterisk />
                </label>
                {isEditMode ? (
                  <>
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
                  </>
                ) : (
                  <p className="px-3 py-2 text-gray-900 bg-gray-50 rounded-lg">{formData.officeControlNo || '-'}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Subject <RequiredAsterisk />
                </label>
                {isEditMode ? (
                  <>
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
                  </>
                ) : (
                  <p className="px-3 py-2 text-gray-900 bg-gray-50 rounded-lg">{formData.subject || '-'}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Document Type
                </label>
                {isEditMode ? (
                  <select
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                      theme === 'dark'
                        ? 'bg-discord-dark text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select document type</option>
                    <option value="Memo">Memo</option>
                    <option value="Letter">Letter</option>
                    <option value="Report">Report</option>
                    <option value="Order">Order</option>
                  </select>
                ) : (
                  <p className="px-3 py-2 text-gray-900 bg-gray-50 rounded-lg">{formData.documentType || '-'}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Source Type
                </label>
                {isEditMode ? (
                  <select
                    name="sourceType"
                    value={formData.sourceType}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                      theme === 'dark'
                        ? 'bg-discord-dark text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select source type</option>
                    <option value="Internal">Internal</option>
                    <option value="External">External</option>
                  </select>
                ) : (
                  <p className="px-3 py-2 text-gray-900 bg-gray-50 rounded-lg">{formData.sourceType || '-'}</p>
                )}
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
                {isEditMode ? (
                  <>
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
                  </>
                ) : (
                  <p className="px-3 py-2 text-gray-900 bg-gray-50 rounded-lg">{formData.internalOriginatingOffice || '-'}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Internal Originating Employee <RequiredAsterisk />
                </label>
                {isEditMode ? (
                  <>
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
                  </>
                ) : (
                  <p className="px-3 py-2 text-gray-900 bg-gray-50 rounded-lg">{formData.internalOriginatingEmployee || '-'}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  If External Source, Originating Office
                </label>
                {isEditMode ? (
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
                ) : (
                  <p className="px-3 py-2 text-gray-900 bg-gray-50 rounded-lg">{formData.externalOriginatingOffice || '-'}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  If External Source, Originating Employee <RequiredAsterisk />
                </label>
                {isEditMode ? (
                  <>
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
                  </>
                ) : (
                  <p className="px-3 py-2 text-gray-900 bg-gray-50 rounded-lg">{formData.externalOriginatingEmployee || '-'}</p>
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
                {isEditMode ? (
                  <input
                    type="number"
                    name="noOfPages"
                    value={formData.noOfPages}
                    onChange={handleChange}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                      theme === 'dark'
                        ? 'bg-discord-dark text-white'
                        : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <p className="px-3 py-2 text-gray-900 bg-gray-50 rounded-lg">{formData.noOfPages || '-'}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Attached Document Filename
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="attachedDocumentFilename"
                    value={formData.attachedDocumentFilename}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                      theme === 'dark'
                        ? 'bg-discord-dark text-white'
                        : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <p className="px-3 py-2 text-gray-900 bg-gray-50 rounded-lg">{formData.attachedDocumentFilename || '-'}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Attachment List
                </label>
                {isEditMode ? (
                  <textarea
                    name="attachmentList"
                    value={formData.attachmentList}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                      theme === 'dark'
                        ? 'bg-discord-dark text-white'
                        : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <p className="px-3 py-2 text-gray-900 bg-gray-50 rounded-lg whitespace-pre-wrap">{formData.attachmentList || '-'}</p>
                )}
              </div>
            </div>
          )}

          {/* References Tab */}
          {activeTab === 'references' && (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(num => {
                const fieldName = `referenceDocumentControlNo${num}` as keyof Document
                return (
                  <div key={num}>
                    <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                      Reference Document Control No. ({num})
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        name={fieldName}
                        value={formData[fieldName] || ''}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                      theme === 'dark'
                        ? 'bg-discord-dark text-white'
                        : 'border-gray-300'
                    }`}
                      />
                    ) : (
                      <p className="px-3 py-2 text-gray-900 bg-gray-50 rounded-lg">{formData[fieldName] || '-'}</p>
                    )}
                  </div>
                )
              })}
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
                {isEditMode ? (
                  <input
                    type="text"
                    name="userid"
                    value={formData.userid}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                      theme === 'dark'
                        ? 'bg-discord-dark text-white'
                        : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <p className="px-3 py-2 text-gray-900 bg-gray-50 rounded-lg">{formData.userid || '-'}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  In Sequence (action)
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="inSequence"
                    value={formData.inSequence}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                      theme === 'dark'
                        ? 'bg-discord-dark text-white'
                        : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <p className="px-3 py-2 text-gray-900 bg-gray-50 rounded-lg">{formData.inSequence || '-'}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Remarks <RequiredAsterisk />
                </label>
                {isEditMode ? (
                  <>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                        errors.remarks ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.remarks && (
                      <p className="mt-1 text-sm text-red-600">{errors.remarks}</p>
                    )}
                  </>
                ) : (
                  <p className="px-3 py-2 text-gray-900 bg-gray-50 rounded-lg whitespace-pre-wrap">{formData.remarks || '-'}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={`px-6 py-4 border-t flex justify-end space-x-3 ${
          theme === 'dark' 
            ? 'border-discord-hover bg-discord-dark' 
            : 'border-gray-200 bg-white'
        }`}>
          {isEditMode ? (
            <>
              <Button
                onClick={handleCancel}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="primary"
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              onClick={onClose}
              variant="secondary"
            >
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentDetailModal

