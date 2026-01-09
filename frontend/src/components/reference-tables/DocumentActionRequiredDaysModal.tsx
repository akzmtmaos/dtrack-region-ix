import React, { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { apiService } from '../../services/api'

interface DocumentActionRequiredDaysModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { documentType: string; actionRequired: string; requiredDays: string }) => void
  initialData?: { id: number; document_type?: string; action_required?: string; required_days?: number } | null
}

const DocumentActionRequiredDaysModal: React.FC<DocumentActionRequiredDaysModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const { theme } = useTheme()
  const [formData, setFormData] = useState({
    documentType: '',
    actionRequired: '',
    requiredDays: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [documentTypes, setDocumentTypes] = useState<Array<{ id: number; document_type: string }>>([])
  const [actionRequiredList, setActionRequiredList] = useState<Array<{ id: number; action_required: string }>>([])
  const [loadingOptions, setLoadingOptions] = useState(false)

  // Fetch document types and action required options
  useEffect(() => {
    if (isOpen) {
      fetchOptions()
    }
  }, [isOpen])

  const fetchOptions = async () => {
    setLoadingOptions(true)
    try {
      // Fetch document types
      const documentTypeResponse = await apiService.getDocumentType()
      if (documentTypeResponse.success && documentTypeResponse.data) {
        const mappedTypes = documentTypeResponse.data.map((item: any) => ({
          id: item.id,
          document_type: item.document_type || ''
        }))
        setDocumentTypes(mappedTypes)
      }

      // Fetch action required
      const actionRequiredResponse = await apiService.getActionRequired()
      if (actionRequiredResponse.success && actionRequiredResponse.data) {
        const mappedActions = actionRequiredResponse.data.map((item: any) => ({
          id: item.id,
          action_required: item.action_required || ''
        }))
        setActionRequiredList(mappedActions)
      }
    } catch (err) {
      console.error('Error fetching options:', err)
    } finally {
      setLoadingOptions(false)
    }
  }

  useEffect(() => {
    if (initialData) {
      setFormData({
        documentType: initialData.document_type || '',
        actionRequired: initialData.action_required || '',
        requiredDays: initialData.required_days?.toString() || ''
      })
    } else {
      setFormData({
        documentType: '',
        actionRequired: '',
        requiredDays: ''
      })
    }
    setErrors({})
  }, [initialData, isOpen])

  const RequiredAsterisk = () => <span className={theme === 'dark' ? 'text-red-400' : 'text-red-500'}>*</span>

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    if (!formData.documentType.trim()) {
      newErrors.documentType = 'Document Type is required'
    }
    if (!formData.actionRequired.trim()) {
      newErrors.actionRequired = 'Action Required is required'
    }
    if (!formData.requiredDays.trim()) {
      newErrors.requiredDays = 'Required Days is required'
    } else if (isNaN(Number(formData.requiredDays)) || Number(formData.requiredDays) < 0) {
      newErrors.requiredDays = 'Required Days must be a valid positive number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validate()) {
      onSave({
        documentType: formData.documentType,
        actionRequired: formData.actionRequired,
        requiredDays: formData.requiredDays
      })
      setFormData({
        documentType: '',
        actionRequired: '',
        requiredDays: ''
      })
      setErrors({})
      onClose()
    }
  }

  const handleClose = () => {
    setFormData({
      documentType: '',
      actionRequired: '',
      requiredDays: ''
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
            {initialData ? 'Edit Document Action Required Days' : 'Add New Document Action Required Days'}
          </h2>
          <p className="text-xs" style={{ color: textSecondary }}>
            {initialData
              ? 'Update the document action required days information below.'
              : 'Fill in the document action required days details below. All required fields are marked with an asterisk.'
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
                  <select
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleChange}
                    disabled={loadingOptions}
                    className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${errors.documentType ? '#ef4444' : inputBorder}`,
                      color: textPrimary,
                      opacity: loadingOptions ? 0.6 : 1
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                    onBlur={(e) => e.target.style.borderColor = errors.documentType ? '#ef4444' : inputBorder}
                  >
                    <option value="">Select document type</option>
                    {documentTypes.map((type) => (
                      <option key={type.id} value={type.document_type}>
                        {type.document_type}
                      </option>
                    ))}
                  </select>
                  {errors.documentType && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.documentType}</p>
                  )}
                </div>
              </div>

              {/* Action Required */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  Action Required <RequiredAsterisk />
                </label>
                <div className="flex-1">
                  <select
                    name="actionRequired"
                    value={formData.actionRequired}
                    onChange={handleChange}
                    disabled={loadingOptions}
                    className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${errors.actionRequired ? '#ef4444' : inputBorder}`,
                      color: textPrimary,
                      opacity: loadingOptions ? 0.6 : 1
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                    onBlur={(e) => e.target.style.borderColor = errors.actionRequired ? '#ef4444' : inputBorder}
                  >
                    <option value="">Select action required</option>
                    {actionRequiredList.map((action) => (
                      <option key={action.id} value={action.action_required}>
                        {action.action_required}
                      </option>
                    ))}
                  </select>
                  {errors.actionRequired && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.actionRequired}</p>
                  )}
                </div>
              </div>

              {/* Required Days */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  Required Days <RequiredAsterisk />
                </label>
                <div className="flex-1">
                  <input
                    type="number"
                    name="requiredDays"
                    value={formData.requiredDays}
                    onChange={handleChange}
                    placeholder="Enter required days"
                    min="0"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${errors.requiredDays ? '#ef4444' : inputBorder}`,
                      color: textPrimary
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                    onBlur={(e) => e.target.style.borderColor = errors.requiredDays ? '#ef4444' : inputBorder}
                  />
                  {errors.requiredDays && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.requiredDays}</p>
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

export default DocumentActionRequiredDaysModal
