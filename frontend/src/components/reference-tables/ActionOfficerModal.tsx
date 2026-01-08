import React, { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'

interface ActionOfficerModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    employeeCode: string
    lastName: string
    firstName: string
    middleName: string
    office: string
    userPassword: string
    userLevel: string
    officeRepresentative: string
  }) => void
  initialData?: {
    id: number
    employeeCode: string
    lastName: string
    firstName: string
    middleName: string
    office: string
    userPassword: string
    userLevel: string
    officeRepresentative: string
  } | null
}

const ActionOfficerModal: React.FC<ActionOfficerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const { theme } = useTheme()
  const [formData, setFormData] = useState({
    employeeCode: '',
    lastName: '',
    firstName: '',
    middleName: '',
    office: '',
    userPassword: '',
    userLevel: '',
    officeRepresentative: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        employeeCode: initialData.employeeCode || '',
        lastName: initialData.lastName || '',
        firstName: initialData.firstName || '',
        middleName: initialData.middleName || '',
        office: initialData.office || '',
        userPassword: initialData.userPassword || '',
        userLevel: initialData.userLevel || '',
        officeRepresentative: initialData.officeRepresentative || ''
      })
    } else {
      setFormData({
        employeeCode: '',
        lastName: '',
        firstName: '',
        middleName: '',
        office: '',
        userPassword: '',
        userLevel: '',
        officeRepresentative: ''
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

    if (!formData.employeeCode.trim()) {
      newErrors.employeeCode = 'Employee Code is required'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last Name is required'
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First Name is required'
    }
    if (!formData.middleName.trim()) {
      newErrors.middleName = 'Middle Name is required'
    }
    if (!formData.userPassword.trim()) {
      newErrors.userPassword = 'User Password is required'
    }
    if (!formData.userLevel.trim()) {
      newErrors.userLevel = 'User Level is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validate()) {
      onSave({
        employeeCode: formData.employeeCode,
        lastName: formData.lastName,
        firstName: formData.firstName,
        middleName: formData.middleName,
        office: formData.office,
        userPassword: formData.userPassword,
        userLevel: formData.userLevel,
        officeRepresentative: formData.officeRepresentative
      })
      setFormData({
        employeeCode: '',
        lastName: '',
        firstName: '',
        middleName: '',
        office: '',
        userPassword: '',
        userLevel: '',
        officeRepresentative: ''
      })
      setErrors({})
      onClose()
    }
  }

  const handleClose = () => {
    setFormData({
      employeeCode: '',
      lastName: '',
      firstName: '',
      middleName: '',
      office: '',
      userPassword: '',
      userLevel: '',
      officeRepresentative: ''
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
        className="rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
        style={{ backgroundColor: modalBg, border: `1px solid ${borderColor}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: textPrimary }}>
            {initialData ? 'Edit Action Officer' : 'Add New Action Officer'}
          </h2>
          <p className="text-xs" style={{ color: textSecondary }}>
            {initialData
              ? 'Update the action officer information below.'
              : 'Fill in the action officer details below. All required fields are marked with an asterisk.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              {/* Employee Code */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  Employee Code <RequiredAsterisk />
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    name="employeeCode"
                    value={formData.employeeCode}
                    onChange={handleChange}
                    placeholder="Enter employee code"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${errors.employeeCode ? '#ef4444' : inputBorder}`,
                      color: textPrimary
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                    onBlur={(e) => e.target.style.borderColor = errors.employeeCode ? '#ef4444' : inputBorder}
                  />
                  {errors.employeeCode && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.employeeCode}</p>
                  )}
                </div>
              </div>

              {/* Last Name */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  Last Name <RequiredAsterisk />
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${errors.lastName ? '#ef4444' : inputBorder}`,
                      color: textPrimary
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                    onBlur={(e) => e.target.style.borderColor = errors.lastName ? '#ef4444' : inputBorder}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* First Name */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  First Name <RequiredAsterisk />
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${errors.firstName ? '#ef4444' : inputBorder}`,
                      color: textPrimary
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                    onBlur={(e) => e.target.style.borderColor = errors.firstName ? '#ef4444' : inputBorder}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.firstName}</p>
                  )}
                </div>
              </div>

              {/* Middle Name */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  Middle Name <RequiredAsterisk />
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    placeholder="Enter middle name"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${errors.middleName ? '#ef4444' : inputBorder}`,
                      color: textPrimary
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                    onBlur={(e) => e.target.style.borderColor = errors.middleName ? '#ef4444' : inputBorder}
                  />
                  {errors.middleName && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.middleName}</p>
                  )}
                </div>
              </div>

              {/* Office */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  Office
                </label>
                <div className="flex-1">
                  <select
                    name="office"
                    value={formData.office}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${inputBorder}`,
                      color: textPrimary
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                    onBlur={(e) => e.target.style.borderColor = inputBorder}
                  >
                    <option value="">Select office</option>
                    <option value="Office 1">Office 1</option>
                    <option value="Office 2">Office 2</option>
                    <option value="Office 3">Office 3</option>
                  </select>
                </div>
              </div>

              {/* User Password */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  User Password <RequiredAsterisk />
                </label>
                <div className="flex-1">
                  <input
                    type="password"
                    name="userPassword"
                    value={formData.userPassword}
                    onChange={handleChange}
                    placeholder="Enter user password"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${errors.userPassword ? '#ef4444' : inputBorder}`,
                      color: textPrimary
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                    onBlur={(e) => e.target.style.borderColor = errors.userPassword ? '#ef4444' : inputBorder}
                  />
                  {errors.userPassword && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.userPassword}</p>
                  )}
                </div>
              </div>

              {/* User Level */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  User Level <RequiredAsterisk />
                </label>
                <div className="flex-1">
                  <select
                    name="userLevel"
                    value={formData.userLevel}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${errors.userLevel ? '#ef4444' : inputBorder}`,
                      color: textPrimary
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3ecf8e'}
                    onBlur={(e) => e.target.style.borderColor = errors.userLevel ? '#ef4444' : inputBorder}
                  >
                    <option value="">Select user level</option>
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                  {errors.userLevel && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.userLevel}</p>
                  )}
                </div>
              </div>

              {/* Office Representative */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: textPrimary, width: '200px' }}>
                  Office Representative
                </label>
                <div className="flex-1 flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="officeRepresentative"
                      value="Yes"
                      checked={formData.officeRepresentative === 'Yes'}
                      onChange={handleChange}
                      className="w-4 h-4"
                      style={{
                        accentColor: '#3ecf8e'
                      }}
                    />
                    <span className="text-xs" style={{ color: textPrimary }}>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="officeRepresentative"
                      value="No"
                      checked={formData.officeRepresentative === 'No'}
                      onChange={handleChange}
                      className="w-4 h-4"
                      style={{
                        accentColor: '#3ecf8e'
                      }}
                    />
                    <span className="text-xs" style={{ color: textPrimary }}>No</span>
                  </label>
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

export default ActionOfficerModal
