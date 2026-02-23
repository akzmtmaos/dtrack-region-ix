import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { apiService } from '../../services/api'
import SearchableSelect from '../SearchableSelect'

interface EditingDocument {
  id: number
  documentControlNo?: string
  routeNo?: string
  subject: string
  documentType: string
  sourceType: string
  internalOriginatingOffice: string
  internalOriginatingEmployee: string
  externalOriginatingOffice: string
  externalOriginatingEmployee: string
  noOfPages: string
  attachedDocumentFilename: string
  attachmentList?: string
  userid?: string
  inSequence?: string
  remarks: string
}

interface AddDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (document: any, pendingFile?: File | null) => void
  editingDocument?: EditingDocument | null
  onUpdate?: (document: any, pendingFile?: File | null) => void
}

const AddDocumentModal: React.FC<AddDocumentModalProps> = ({ isOpen, onClose, onAdd, editingDocument, onUpdate }) => {
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
    remarks: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [documentTypes, setDocumentTypes] = useState<Array<{ id: number; document_type: string }>>([])
  const [offices, setOffices] = useState<Array<{ id: number; office: string }>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingFileRef = useRef<File | null>(null)

  const RequiredAsterisk = () => <span className={theme === 'dark' ? 'text-red-400' : 'text-red-500'}>*</span>

  // Fetch document types and offices when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchLookups = async () => {
        try {
          const [docTypeRes, officeRes] = await Promise.all([
            apiService.getDocumentType(),
            apiService.getOffice(),
          ])

          if (docTypeRes.success && docTypeRes.data) {
            setDocumentTypes(docTypeRes.data)
          }

          if (officeRes.success && officeRes.data) {
            const mappedOffices = (officeRes.data as any[]).map((item: any) => ({
              id: item.id,
              office: item.office || '',
            }))
            setOffices(mappedOffices)
          }
        } catch (error) {
          console.error('Failed to fetch lookups:', error)
        }
      }
      fetchLookups()
    }
  }, [isOpen])

  // Prefill form when editing
  useEffect(() => {
    if (isOpen && editingDocument) {
      setFormData({
        subject: editingDocument.subject || '',
        documentType: editingDocument.documentType || '',
        sourceType: editingDocument.sourceType || '',
        internalOriginatingOffice: editingDocument.internalOriginatingOffice || '',
        internalOriginatingEmployee: editingDocument.internalOriginatingEmployee || '',
        externalOriginatingOffice: editingDocument.externalOriginatingOffice || '',
        externalOriginatingEmployee: editingDocument.externalOriginatingEmployee || '',
        noOfPages: editingDocument.noOfPages || '',
        attachedDocumentFilename: editingDocument.attachedDocumentFilename || '',
        attachmentList: editingDocument.attachmentList || '',
        userid: editingDocument.userid || '',
        inSequence: editingDocument.inSequence || '',
        remarks: editingDocument.remarks || ''
      })
    } else if (isOpen && !editingDocument) {
      setFormData({
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
        remarks: ''
      })
    }
  }, [isOpen, editingDocument])

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
    if (formData.sourceType === 'Internal') {
      if (!formData.internalOriginatingOffice.trim()) {
        newErrors.internalOriginatingOffice = 'Internal Originating Office is required'
      }
      if (!formData.internalOriginatingEmployee.trim()) {
        newErrors.internalOriginatingEmployee = 'Internal Originating Employee is required'
      }
    }
    if (formData.sourceType === 'External') {
      if (!formData.externalOriginatingOffice.trim()) {
        newErrors.externalOriginatingOffice = 'External Originating Office is required'
      }
      if (!formData.externalOriginatingEmployee.trim()) {
        newErrors.externalOriginatingEmployee = 'External Originating Employee is required'
      }
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
      const documentData: any = {
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
        remarks: formData.remarks
      }

      const file = pendingFileRef.current ?? null
      if (editingDocument && onUpdate) {
        onUpdate({
          ...editingDocument,
          ...documentData
        }, file)
      } else {
        onAdd({
          id: Date.now(),
          documentControlNo: '',
          routeNo: '',
          ...documentData
        }, file)
      }
      pendingFileRef.current = null
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
        remarks: ''
      }
      setFormData(emptyForm)
      setErrors({})
      if (fileInputRef.current) fileInputRef.current.value = ''
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
      remarks: ''
    }
    setFormData(emptyForm)
    setErrors({})
    if (fileInputRef.current) fileInputRef.current.value = ''
    pendingFileRef.current = null
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
            {editingDocument ? 'Edit Document' : 'Add New Document'}
          </h2>
          <p className="text-xs" style={{ color: textSecondary }}>
            {editingDocument ? 'Update the document details below.' : 'Fill in the document details below. All required fields are marked with an asterisk.'}
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

              {/* Document Type */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  Document Type
                </label>
                <div className="flex-1">
                  <SearchableSelect
                    options={[...documentTypes].sort((a, b) => 
                      a.document_type.localeCompare(b.document_type)
                    ).map(type => ({
                      id: type.id,
                      value: type.document_type,
                      label: type.document_type
                    }))}
                    value={formData.documentType}
                    onChange={(value) => {
                      setFormData(prev => ({
                        ...prev,
                        documentType: value
                      }))
                      if (errors.documentType) {
                        setErrors(prev => ({
                          ...prev,
                          documentType: ''
                        }))
                      }
                    }}
                    placeholder="Select document type"
                    style={{
                      borderColor: inputBorder
                    }}
                    onFocus={() => {}}
                    onBlur={() => {}}
                  />
                </div>
              </div>

              {/* Source Type */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  Source Type
                </label>
                <div className="flex-1">
                  <SearchableSelect
                    options={[
                      { id: 'internal', value: 'Internal', label: 'Internal' },
                      { id: 'external', value: 'External', label: 'External' }
                    ]}
                    value={formData.sourceType}
                    onChange={(value) => {
                      setFormData(prev => ({
                        ...prev,
                        sourceType: value
                      }))
                      if (errors.sourceType) {
                        setErrors(prev => ({
                          ...prev,
                          sourceType: ''
                        }))
                      }
                    }}
                    placeholder="Select source type"
                    showSearch={false}
                    style={{
                      borderColor: inputBorder
                    }}
                    onFocus={() => {}}
                    onBlur={() => {}}
                  />
                </div>
              </div>

              {/* Internal sub-form */}
              {formData.sourceType === 'Internal' && (
                <div className="space-y-4 pl-4" style={{ borderLeft: `2px solid ${borderColor}` }}>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '183px' }}>
                      Internal Originating Office <RequiredAsterisk />
                    </label>
                    <div className="flex-1">
                      <SearchableSelect
                        options={[...offices].sort((a, b) =>
                          a.office.localeCompare(b.office)
                        ).map(o => ({
                          id: o.id,
                          value: o.office,
                          label: o.office,
                        }))}
                        value={formData.internalOriginatingOffice}
                        onChange={(value) => {
                          setFormData(prev => ({
                            ...prev,
                            internalOriginatingOffice: value,
                          }))
                          if (errors.internalOriginatingOffice) {
                            setErrors(prev => ({
                              ...prev,
                              internalOriginatingOffice: '',
                            }))
                          }
                        }}
                        placeholder="Select internal originating office"
                        style={{
                          borderColor: errors.internalOriginatingOffice ? '#ef4444' : inputBorder,
                        }}
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
                    <div className="flex-1">
                      <SearchableSelect
                        options={[...offices].sort((a, b) =>
                          a.office.localeCompare(b.office)
                        ).map(o => ({
                          id: o.id,
                          value: o.office,
                          label: o.office,
                        }))}
                        value={formData.externalOriginatingOffice}
                        onChange={(value) => {
                          setFormData(prev => ({
                            ...prev,
                            externalOriginatingOffice: value,
                          }))
                          if (errors.externalOriginatingOffice) {
                            setErrors(prev => ({
                              ...prev,
                              externalOriginatingOffice: '',
                            }))
                          }
                        }}
                        placeholder="Select external originating office"
                        style={{
                          borderColor: errors.externalOriginatingOffice ? '#ef4444' : inputBorder,
                        }}
                      />
                      {errors.externalOriginatingOffice && (
                        <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.externalOriginatingOffice}</p>
                      )}
                    </div>
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
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      pendingFileRef.current = file ?? null
                      setFormData(prev => ({
                        ...prev,
                        attachedDocumentFilename: file ? file.name : ''
                      }))
                    }}
                    className="w-full text-xs file:mr-3 file:px-2.5 file:py-1.5 file:rounded-md file:border-0 file:text-xs file:font-medium file:cursor-pointer file:transition-colors cursor-pointer hover:file:bg-[#3ecf8e]/20 hover:file:text-[#3ecf8e]"
                    style={{
                      color: textSecondary
                    }}
                  />
                  {formData.attachedDocumentFilename && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <p className="text-xs flex-1 min-w-0 truncate" style={{ color: textSecondary }}>
                        Selected: {formData.attachedDocumentFilename}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ''
                          }
                          pendingFileRef.current = null
                          setFormData(prev => ({
                            ...prev,
                            attachedDocumentFilename: ''
                          }))
                        }}
                        className="flex-shrink-0 px-2 py-1 text-xs font-medium rounded-md transition-colors"
                        style={{
                          color: '#ef4444',
                          backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                        }}
                      >
                        Remove
                      </button>
                    </div>
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
              {editingDocument ? 'Save' : 'Add Destination'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddDocumentModal
