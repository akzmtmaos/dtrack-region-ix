import React, { useState } from 'react'

interface AddDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (document: any) => void
}

const AddDocumentModal: React.FC<AddDocumentModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [activeTab, setActiveTab] = useState('basic')
  const [formData, setFormData] = useState({
    documentControlNo: '',
    routeNo: '',
    officeControlNo: '',
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

  const RequiredAsterisk = () => <span className="text-red-500">*</span>

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validate()) {
      onAdd({
        id: Date.now(),
        ...formData
      })
      
      // Reset form
      const emptyForm = {
        documentControlNo: '',
        routeNo: '',
        officeControlNo: '',
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
      documentControlNo: '',
      routeNo: '',
      officeControlNo: '',
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Add New Document</h2>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Control No. <RequiredAsterisk />
                </label>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Type
                </label>
                <select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                >
                  <option value="">Select document type</option>
                  <option value="Memo">Memo</option>
                  <option value="Letter">Letter</option>
                  <option value="Report">Report</option>
                  <option value="Order">Order</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source Type
                </label>
                <select
                  name="sourceType"
                  value={formData.sourceType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. of Pages
                </label>
                <input
                  type="number"
                  name="noOfPages"
                  value={formData.noOfPages}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attached Document Filename
                </label>
                <input
                  type="text"
                  name="attachedDocumentFilename"
                  value={formData.attachedDocumentFilename}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attachment List
                </label>
                <textarea
                  name="attachmentList"
                  value={formData.attachmentList}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* References Tab */}
          {activeTab === 'references' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Document Control No. (1)
                </label>
                <input
                  type="text"
                  name="referenceDocumentControlNo1"
                  value={formData.referenceDocumentControlNo1}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Document Control No. (2)
                </label>
                <input
                  type="text"
                  name="referenceDocumentControlNo2"
                  value={formData.referenceDocumentControlNo2}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Document Control No. (3)
                </label>
                <input
                  type="text"
                  name="referenceDocumentControlNo3"
                  value={formData.referenceDocumentControlNo3}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Document Control No. (4)
                </label>
                <input
                  type="text"
                  name="referenceDocumentControlNo4"
                  value={formData.referenceDocumentControlNo4}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Document Control No. (5)
                </label>
                <input
                  type="text"
                  name="referenceDocumentControlNo5"
                  value={formData.referenceDocumentControlNo5}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Additional Tab */}
          {activeTab === 'additional' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  name="userid"
                  value={formData.userid}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  In Sequence (action)
                </label>
                <input
                  type="text"
                  name="inSequence"
                  value={formData.inSequence}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks <RequiredAsterisk />
                </label>
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
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6 pb-4 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Document
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddDocumentModal

