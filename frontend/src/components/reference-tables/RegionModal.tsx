import React, { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'

interface RegionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    regionName: string
    nscbCode: string
    nscbName: string
    addedBy: string
    status: string
  }) => void
  initialData?: {
    id: number
    region_name?: string
    nscb_code?: string
    nscb_name?: string
    added_by?: string
    status?: string
  } | null
}

const RegionModal: React.FC<RegionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const { theme } = useTheme()
  const [formData, setFormData] = useState({
    regionName: '',
    nscbCode: '',
    nscbName: '',
    addedBy: '',
    status: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        regionName: initialData.region_name || '',
        nscbCode: initialData.nscb_code || '',
        nscbName: initialData.nscb_name || '',
        addedBy: initialData.added_by || '',
        status: initialData.status || ''
      })
    } else {
      setFormData({
        regionName: '',
        nscbCode: '',
        nscbName: '',
        addedBy: '',
        status: ''
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
    
    if (!formData.regionName.trim()) {
      newErrors.regionName = 'Region Name is required'
    }
    if (!formData.nscbCode.trim()) {
      newErrors.nscbCode = 'NSCB Code is required'
    }
    if (!formData.nscbName.trim()) {
      newErrors.nscbName = 'NSCB Name is required'
    }
    if (!formData.addedBy.trim()) {
      newErrors.addedBy = 'Added By is required'
    }
    if (!formData.status.trim()) {
      newErrors.status = 'Status is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validate()) {
      onSave({
        regionName: formData.regionName,
        nscbCode: formData.nscbCode,
        nscbName: formData.nscbName,
        addedBy: formData.addedBy,
        status: formData.status
      })
      setFormData({
        regionName: '',
        nscbCode: '',
        nscbName: '',
        addedBy: '',
        status: ''
      })
      setErrors({})
      onClose()
    }
  }

  const handleClose = () => {
    setFormData({
      regionName: '',
      nscbCode: '',
      nscbName: '',
      addedBy: '',
      status: ''
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
            {initialData ? 'Edit Region' : 'Add New Region'}
          </h2>
          <p className="text-xs" style={{ color: textSecondary }}>
            {initialData 
              ? 'Update the region information below.'
              : 'Fill in the region details below. All required fields are marked with an asterisk.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-4">

              {/* Region Name */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  Region Name <RequiredAsterisk />
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    name="regionName"
                    value={formData.regionName}
                    onChange={handleChange}
                    placeholder="Enter region name"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${errors.regionName ? '#ef4444' : inputBorder}`,
                      color: textPrimary
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                    onBlur={(e) => e.target.style.borderColor = errors.regionName ? '#ef4444' : inputBorder}
                  />
                  {errors.regionName && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.regionName}</p>
                  )}
                </div>
              </div>

              {/* NSCB Code */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  NSCB Code <RequiredAsterisk />
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    name="nscbCode"
                    value={formData.nscbCode}
                    onChange={handleChange}
                    placeholder="Enter NSCB code"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${errors.nscbCode ? '#ef4444' : inputBorder}`,
                      color: textPrimary
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                    onBlur={(e) => e.target.style.borderColor = errors.nscbCode ? '#ef4444' : inputBorder}
                  />
                  {errors.nscbCode && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.nscbCode}</p>
                  )}
                </div>
              </div>

              {/* NSCB Name */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  NSCB Name <RequiredAsterisk />
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    name="nscbName"
                    value={formData.nscbName}
                    onChange={handleChange}
                    placeholder="Enter NSCB name"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${errors.nscbName ? '#ef4444' : inputBorder}`,
                      color: textPrimary
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                    onBlur={(e) => e.target.style.borderColor = errors.nscbName ? '#ef4444' : inputBorder}
                  />
                  {errors.nscbName && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.nscbName}</p>
                  )}
                </div>
              </div>

              {/* Added By */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  Added By <RequiredAsterisk />
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    name="addedBy"
                    value={formData.addedBy}
                    onChange={handleChange}
                    placeholder="Enter added by"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${errors.addedBy ? '#ef4444' : inputBorder}`,
                      color: textPrimary
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                    onBlur={(e) => e.target.style.borderColor = errors.addedBy ? '#ef4444' : inputBorder}
                  />
                  {errors.addedBy && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.addedBy}</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  Status <RequiredAsterisk />
                </label>
                <div className="flex-1">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${errors.status ? '#ef4444' : inputBorder}`,
                      color: textPrimary
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                    onBlur={(e) => e.target.style.borderColor = errors.status ? '#ef4444' : inputBorder}
                  >
                    <option value="">Select status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.status}</p>
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

export default RegionModal
