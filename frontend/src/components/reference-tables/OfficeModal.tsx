import React, { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { apiService } from '../../services/api'

interface OfficeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { office: string; region: string; shortName: string; headOffice: string }) => void
  initialData?: { id: number; office?: string; region?: string; short_name?: string; head_office?: string } | null
}

const OfficeModal: React.FC<OfficeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const { theme } = useTheme()
  const [formData, setFormData] = useState({
    office: '',
    region: '',
    shortName: '',
    headOffice: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [regions, setRegions] = useState<Array<{ id: number; region_name: string }>>([])
  const [loadingOptions, setLoadingOptions] = useState(false)

  // Fetch regions when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchRegions()
    }
  }, [isOpen])

  const fetchRegions = async () => {
    setLoadingOptions(true)
    try {
      const response = await apiService.getRegion()
      if (response.success && response.data) {
        const mappedRegions = response.data.map((item: any) => ({
          id: item.id,
          region_name: item.region_name || ''
        }))
        setRegions(mappedRegions)
      }
    } catch (err) {
      console.error('Error fetching regions:', err)
    } finally {
      setLoadingOptions(false)
    }
  }

  useEffect(() => {
    if (initialData) {
      setFormData({
        office: initialData.office || '',
        region: initialData.region || '',
        shortName: initialData.short_name || '',
        headOffice: initialData.head_office || ''
      })
    } else {
      setFormData({
        office: '',
        region: '',
        shortName: '',
        headOffice: ''
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

    if (!formData.office.trim()) {
      newErrors.office = 'Office is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validate()) {
      onSave({
        office: formData.office,
        region: formData.region,
        shortName: formData.shortName,
        headOffice: formData.headOffice
      })
      setFormData({
        office: '',
        region: '',
        shortName: '',
        headOffice: ''
      })
      setErrors({})
      onClose()
    }
  }

  const handleClose = () => {
    setFormData({
      office: '',
      region: '',
      shortName: '',
      headOffice: ''
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
            {initialData ? 'Edit Office' : 'Add New Office'}
          </h2>
          <p className="text-xs" style={{ color: textSecondary }}>
            {initialData
              ? 'Update the office information below.'
              : 'Fill in the office details below. All required fields are marked with an asterisk.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-4">

              {/* Office */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  Office <RequiredAsterisk />
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    name="office"
                    value={formData.office}
                    onChange={handleChange}
                    placeholder="Enter office"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${errors.office ? '#ef4444' : inputBorder}`,
                      color: textPrimary
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                    onBlur={(e) => e.target.style.borderColor = errors.office ? '#ef4444' : inputBorder}
                  />
                  {errors.office && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.office}</p>
                  )}
                </div>
              </div>

              {/* Region */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  Region
                </label>
                <div className="flex-1">
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    disabled={loadingOptions}
                    className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${errors.region ? '#ef4444' : inputBorder}`,
                      color: textPrimary,
                      opacity: loadingOptions ? 0.6 : 1
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                    onBlur={(e) => e.target.style.borderColor = errors.region ? '#ef4444' : inputBorder}
                  >
                    <option value="">Select region</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.region_name}>
                        {region.region_name}
                      </option>
                    ))}
                  </select>
                  {errors.region && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.region}</p>
                  )}
                </div>
              </div>

              {/* Short Name */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  Short Name
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    name="shortName"
                    value={formData.shortName}
                    onChange={handleChange}
                    placeholder="Enter short name"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${errors.shortName ? '#ef4444' : inputBorder}`,
                      color: textPrimary
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                    onBlur={(e) => e.target.style.borderColor = errors.shortName ? '#ef4444' : inputBorder}
                  />
                  {errors.shortName && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.shortName}</p>
                  )}
                </div>
              </div>

              {/* Head Office */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  Head Office
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    name="headOffice"
                    value={formData.headOffice}
                    onChange={handleChange}
                    placeholder="Enter head office"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${errors.headOffice ? '#ef4444' : inputBorder}`,
                      color: textPrimary
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                    onBlur={(e) => e.target.style.borderColor = errors.headOffice ? '#ef4444' : inputBorder}
                  />
                  {errors.headOffice && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.headOffice}</p>
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

export default OfficeModal
