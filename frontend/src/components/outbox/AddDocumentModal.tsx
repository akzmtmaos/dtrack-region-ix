import React, { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'

interface AddDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (document: any) => void
}

const AddDocumentModal: React.FC<AddDocumentModalProps> = ({ isOpen, onClose, onAdd }) => {
  const { theme } = useTheme()
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
    referenceDocuments: ['']
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

  const handleReferenceDocumentChange = (index: number, value: string) => {
    setFormData(prev => {
      const newReferences = [...prev.referenceDocuments]
      newReferences[index] = value
      return {
        ...prev,
        referenceDocuments: newReferences
      }
    })
  }

  const addReferenceDocument = () => {
    setFormData(prev => {
      if (prev.referenceDocuments.length >= 5) {
        return prev
      }
      return {
        ...prev,
        referenceDocuments: [...prev.referenceDocuments, '']
      }
    })
  }

  const removeReferenceDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      referenceDocuments: prev.referenceDocuments.filter((_, i) => i !== index)
    }))
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
      const referenceDocs = formData.referenceDocuments.filter(ref => ref.trim() !== '')
      const documentData: any = {
        id: Date.now(),
        subject: formData.subject,
        documentType: formData.documentType,
        sourceType: formData.sourceType,
        internalOriginatingOffice: formData.internalOriginatingOffice,
        internalOriginatingEmployee: formData.internalOriginatingEmployee,
        externalOriginatingOffice: formData.externalOriginatingOffice,
        externalOriginatingEmployee: formData.externalOriginatingEmployee,
        noOfPages: formData.noOfPages,
        attachedDocumentFilename: formData.attachedDocumentFilename,
        attachmentList: formData.attachmentList,
        userid: formData.userid,
        inSequence: formData.inSequence,
        remarks: formData.remarks,
        referenceDocumentControlNo1: referenceDocs[0] || '',
        referenceDocumentControlNo2: referenceDocs[1] || '',
        referenceDocumentControlNo3: referenceDocs[2] || '',
        referenceDocumentControlNo4: referenceDocs[3] || '',
        referenceDocumentControlNo5: referenceDocs[4] || ''
      }
      
      onAdd(documentData)
      
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
        referenceDocuments: ['']
      }
      setFormData(emptyForm)
      setErrors({})
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
      referenceDocuments: ['']
    }
    setFormData(emptyForm)
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  const modalBg = theme === 'dark' ? '#171717' : '#ffffff'
  const borderColor = theme === 'dark' ? '#262626' : '#e5e5e5'
  const textPrimary = theme === 'dark' ? '#fafafa' : '#171717'
  const textSecondary = theme === 'dark' ? '#a3a3a3' : '#525252'
  const inputBg = theme === 'dark' ? '#171717' : '#ffffff'
  const inputBorder = theme === 'dark' ? '#262626' : '#e5e5e5'

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[9999]" 
      onClick={handleClose}
      style={{ backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)' }}
    >
      <div 
        className="rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
        style={{ backgroundColor: modalBg, border: `1px solid ${borderColor}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: textPrimary }}>
            Add New Document
          </h2>
          <p className="text-xs" style={{ color: textSecondary }}>
            Fill in the document details below. All required fields are marked with an asterisk.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              {/* Subject */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  Subject <RequiredAsterisk />
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Enter document subject"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${errors.subject ? '#ef4444' : inputBorder}`,
                      color: textPrimary
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                    onBlur={(e) => e.target.style.borderColor = errors.subject ? '#ef4444' : inputBorder}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.subject}</p>
                  )}
                </div>
              </div>

              {/* Reference Documents */}
              <div>
                <div className="flex items-start gap-3 mb-2">
                  <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px', paddingTop: '4px' }}>
                    Reference Document Control No.
                  </label>
                  <div className="flex-1 space-y-2">
                    {formData.referenceDocuments.map((refDoc, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={`Reference Document ${index + 1}`}
                          value={refDoc}
                          onChange={(e) => handleReferenceDocumentChange(index, e.target.value)}
                          className="flex-1 px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                          style={{
                            backgroundColor: inputBg,
                            border: `1px solid ${inputBorder}`,
                            color: textPrimary
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                          onBlur={(e) => e.target.style.borderColor = inputBorder}
                        />
                        {formData.referenceDocuments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeReferenceDocument(index)}
                            className="p-1.5 rounded-md transition-colors"
                            style={{
                              color: '#ef4444',
                              backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)'}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addReferenceDocument}
                      disabled={formData.referenceDocuments.length >= 5}
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-dashed transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        borderColor: formData.referenceDocuments.length >= 5 ? inputBorder : inputBorder,
                        color: formData.referenceDocuments.length >= 5 ? textSecondary : textSecondary,
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (formData.referenceDocuments.length < 5) {
                          e.currentTarget.style.borderColor = '#3ecf8e'
                          e.currentTarget.style.color = '#3ecf8e'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (formData.referenceDocuments.length < 5) {
                          e.currentTarget.style.borderColor = inputBorder
                          e.currentTarget.style.color = textSecondary
                        }
                      }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Reference Document
                    </button>
                  </div>
                </div>
              </div>

              {/* Document Type */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  Document Type
                </label>
                <select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleChange}
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                  style={{
                    backgroundColor: inputBg,
                    border: `1px solid ${inputBorder}`,
                    color: textPrimary
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                  onBlur={(e) => e.target.style.borderColor = inputBorder}
                >
                  <option value="">Select document type</option>
                  <option value="Memo">Memo</option>
                  <option value="Letter">Letter</option>
                  <option value="Report">Report</option>
                  <option value="Order">Order</option>
                </select>
              </div>

              {/* Source Type */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  Source Type
                </label>
                <select
                  name="sourceType"
                  value={formData.sourceType}
                  onChange={handleChange}
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                  style={{
                    backgroundColor: inputBg,
                    border: `1px solid ${inputBorder}`,
                    color: textPrimary
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                  onBlur={(e) => e.target.style.borderColor = inputBorder}
                >
                  <option value="">Select source type</option>
                  <option value="Internal">Internal</option>
                  <option value="External">External</option>
                </select>
              </div>

              {/* Internal sub-form */}
              {formData.sourceType === 'Internal' && (
                <div className="space-y-4 pl-4" style={{ borderLeft: `2px solid ${borderColor}` }}>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '183px' }}>
                      Internal Originating Office <RequiredAsterisk />
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        name="internalOriginatingOffice"
                        value={formData.internalOriginatingOffice}
                        onChange={handleChange}
                        placeholder="Enter internal originating office"
                        className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                        style={{
                          backgroundColor: inputBg,
                          border: `1px solid ${errors.internalOriginatingOffice ? '#ef4444' : inputBorder}`,
                          color: textPrimary
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                        onBlur={(e) => e.target.style.borderColor = errors.internalOriginatingOffice ? '#ef4444' : inputBorder}
                      />
                      {errors.internalOriginatingOffice && (
                        <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.internalOriginatingOffice}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '183px' }}>
                      Internal Originating Employee <RequiredAsterisk />
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        name="internalOriginatingEmployee"
                        value={formData.internalOriginatingEmployee}
                        onChange={handleChange}
                        placeholder="Enter internal originating employee"
                        className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                        style={{
                          backgroundColor: inputBg,
                          border: `1px solid ${errors.internalOriginatingEmployee ? '#ef4444' : inputBorder}`,
                          color: textPrimary
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                        onBlur={(e) => e.target.style.borderColor = errors.internalOriginatingEmployee ? '#ef4444' : inputBorder}
                      />
                      {errors.internalOriginatingEmployee && (
                        <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.internalOriginatingEmployee}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* External sub-form */}
              {formData.sourceType === 'External' && (
                <div className="space-y-4 pl-4" style={{ borderLeft: `2px solid ${borderColor}` }}>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '183px' }}>
                      External Originating Office
                    </label>
                    <input
                      type="text"
                      name="externalOriginatingOffice"
                      value={formData.externalOriginatingOffice}
                      onChange={handleChange}
                      placeholder="Enter external originating office"
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                      style={{
                        backgroundColor: inputBg,
                        border: `1px solid ${inputBorder}`,
                        color: textPrimary
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                      onBlur={(e) => e.target.style.borderColor = inputBorder}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '183px' }}>
                      External Originating Employee <RequiredAsterisk />
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        name="externalOriginatingEmployee"
                        value={formData.externalOriginatingEmployee}
                        onChange={handleChange}
                        placeholder="Enter external originating employee"
                        className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                        style={{
                          backgroundColor: inputBg,
                          border: `1px solid ${errors.externalOriginatingEmployee ? '#ef4444' : inputBorder}`,
                          color: textPrimary
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                        onBlur={(e) => e.target.style.borderColor = errors.externalOriginatingEmployee ? '#ef4444' : inputBorder}
                      />
                      {errors.externalOriginatingEmployee && (
                        <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.externalOriginatingEmployee}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* No. of Pages */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  No. of Pages
                </label>
                <input
                  type="number"
                  name="noOfPages"
                  value={formData.noOfPages}
                  onChange={handleChange}
                  min="0"
                  placeholder="Enter number of pages"
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                  style={{
                    backgroundColor: inputBg,
                    border: `1px solid ${inputBorder}`,
                    color: textPrimary
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                  onBlur={(e) => e.target.style.borderColor = inputBorder}
                />
              </div>

              {/* Attach Document */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  Attach Document Filename
                </label>
                <div className="flex-1">
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      setFormData(prev => ({
                        ...prev,
                        attachedDocumentFilename: file ? file.name : ''
                      }))
                    }}
                    className="w-full text-xs file:mr-3 file:px-2.5 file:py-1.5 file:rounded-md file:border-0 file:text-xs file:font-medium cursor-pointer"
                    style={{
                      color: textSecondary
                    }}
                  />
                  {formData.attachedDocumentFilename && (
                    <p className="mt-1.5 text-xs" style={{ color: textSecondary }}>
                      Selected: {formData.attachedDocumentFilename}
                    </p>
                  )}
                </div>
              </div>

              {/* Remarks */}
              <div className="flex items-start gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px', paddingTop: '4px' }}>
                  Remarks <RequiredAsterisk />
                </label>
                <div className="flex-1">
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Enter remarks or additional notes"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors resize-none"
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${errors.remarks ? '#ef4444' : inputBorder}`,
                      color: textPrimary
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                    onBlur={(e) => e.target.style.borderColor = errors.remarks ? '#ef4444' : inputBorder}
                  />
                  {errors.remarks && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.remarks}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div 
            className="px-6 py-4 flex justify-end gap-2"
            style={{ borderTop: `1px solid ${borderColor}`, backgroundColor: modalBg }}
          >
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
              style={{
                color: textSecondary,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#262626' : '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
              style={{
                color: '#ffffff',
                backgroundColor: '#3ecf8e'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#35b87a'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3ecf8e'}
            >
              Add Destination
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddDocumentModal
