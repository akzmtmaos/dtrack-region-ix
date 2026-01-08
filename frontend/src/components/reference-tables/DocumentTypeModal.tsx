import React, { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'

interface DocumentTypeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { documentTypeCode: string; documentType: string }) => void
  initialData?: { id: number; document_type_code?: string; document_type?: string } | null
}

const DocumentTypeModal: React.FC<DocumentTypeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const { theme } = useTheme()
  const [formData, setFormData] = useState({
    documentTypeCode: '',
    documentType: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        documentTypeCode: initialData.document_type_code || '',
        documentType: initialData.document_type || ''
      })
    } else {
      setFormData({
        documentTypeCode: '',
        documentType: ''
      })
    }
    setErrors({})
  }, [initialData, isOpen])

  const RequiredAsterisk = () => <span className={theme === 'dark' ? 'text-red-400' : 'text-red-500'}>*</span>

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (!formData.documentTypeCode.trim()) {
      newErrors.documentTypeCode = 'Document Type Code is required'
    }
    if (!formData.documentType.trim()) {
      newErrors.documentType = 'Document Type is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validate()) {
      onSave({
        documentTypeCode: formData.documentTypeCode,
        documentType: formData.documentType
      })
      setFormData({
        documentTypeCode: '',
        documentType: ''
      })
      setErrors({})
      onClose()
    }
  }

  const handleClose = () => {
    setFormData({
      documentTypeCode: '',
      documentType: ''
    })
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
        className="rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
        style={{ backgroundColor: modalBg, border: `1px solid ${borderColor}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: textPrimary }}>
            {initialData ? 'Edit Document Type' : 'Add New Document Type'}
          </h2>
          <p className="text-xs" style={{ color: textSecondary }}>
            {initialData
              ? 'Update the document type information below.'
              : 'Fill in the document type details below. All required fields are marked with an asterisk.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-4">

              {/* Document Type */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  Document Type <RequiredAsterisk />
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleChange}
                    placeholder="Enter document type"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${errors.documentType ? '#ef4444' : inputBorder}`,
                      color: textPrimary
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                    onBlur={(e) => e.target.style.borderColor = errors.documentType ? '#ef4444' : inputBorder}
                  />
                  {errors.documentType && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.documentType}</p>
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
              {initialData ? 'Save Changes' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DocumentTypeModal
