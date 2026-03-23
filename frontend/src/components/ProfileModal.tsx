import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { apiService } from '../services/api'
import SearchableSelect from './SearchableSelect'
import PasswordInputWithToggle from './PasswordInputWithToggle'
import { useToast } from '../context/ToastContext'
import type { User } from '../context/AuthContext'
import { EMPLOYEE_CODE_MAX_LENGTH } from '../constants/user'

function parseProfileFullNameForForm(user: User): {
  lastName: string
  firstName: string
  middleName: string
} {
  if (user.source !== 'profiles') {
    return {
      lastName: user.lastName || '',
      firstName: user.firstName || '',
      middleName: user.middleName ?? '',
    }
  }
  const raw = (user.firstName || '').trim()
  if (!raw) {
    return { lastName: '', firstName: '', middleName: '-' }
  }
  const idx = raw.indexOf(',')
  if (idx === -1) {
    return { lastName: '', firstName: raw, middleName: '-' }
  }
  const lastName = raw.slice(0, idx).trim()
  const rest = raw.slice(idx + 1).trim()
  const words = rest.split(/\s+/).filter(Boolean)
  const firstName = words[0] || ''
  const middleName = words.length > 1 ? words.slice(1).join(' ') : '-'
  return { lastName, firstName, middleName }
}

interface ProfileModalProps {
  open: boolean
  onClose: () => void
}

const LABEL_COL = '200px'

const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  const { user, syncUserFromBackend } = useAuth()
  const { theme } = useTheme()
  const { showSuccess, showError } = useToast()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [employeeCode, setEmployeeCode] = useState('')
  const [office, setOffice] = useState('')
  const [userLevel, setUserLevel] = useState('')
  const [officeRepresentative, setOfficeRepresentative] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [userLevels, setUserLevels] = useState<Array<{ id: number; user_level_name: string }>>([])
  const [offices, setOffices] = useState<Array<{ id: number; office: string }>>([])

  const isProfiles = user?.source === 'profiles'

  const RequiredAsterisk = () => <span className={theme === 'dark' ? 'text-red-400' : 'text-red-500'}>*</span>

  useEffect(() => {
    const load = async () => {
      const [levelRes, officeRes] = await Promise.all([
        apiService.getUserLevels(),
        apiService.getOffice(),
      ])
      if (levelRes.success && levelRes.data) {
        setUserLevels((levelRes.data as any[]).map((x: any) => ({
          id: x.id,
          user_level_name: x.user_level_name ?? x.userLevelName ?? '',
        })))
      }
      if (officeRes.success && officeRes.data) {
        setOffices((officeRes.data as any[]).map((x: any) => ({
          id: x.id,
          office: x.office ?? '',
        })))
      }
    }
    if (open) load()
  }, [open])

  useEffect(() => {
    if (!open || !user) return
    const p = parseProfileFullNameForForm(user)
    setFirstName(p.firstName)
    setLastName(p.lastName)
    setMiddleName(p.middleName || '-')
    setEmployeeCode((user.employeeCode || '').slice(0, EMPLOYEE_CODE_MAX_LENGTH))
    setOffice(user.office || '')
    setUserLevel(user.userLevel || '')
    setOfficeRepresentative(user.officeRepresentative || 'No')
    setNewPassword('')
    setConfirmPassword('')
    setFormError('')
  }, [open, user])

  if (!open || !user) return null

  const modalBg = theme === 'dark' ? '#171717' : '#ffffff'
  const borderColor = theme === 'dark' ? '#262626' : '#e5e5e5'
  const textPrimary = theme === 'dark' ? '#fafafa' : '#171717'
  const textSecondary = theme === 'dark' ? '#a3a3a3' : '#525252'
  const inputBg = theme === 'dark' ? '#171717' : '#ffffff'
  const inputBorder = theme === 'dark' ? '#262626' : '#e5e5e5'

  const passwordFieldClass =
    theme === 'dark'
      ? '!border-[#262626] !bg-[#171717] [&_input]:!text-[#fafafa] [&_button]:!border-[#262626] [&_button]:!bg-[#262626] [&_button]:hover:!bg-[#404040]'
      : '!border-[#e5e5e5] !bg-white'

  const handleBackdrop = () => onClose()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match')
      return
    }
    if (newPassword && newPassword.length < 6) {
      setFormError('Password must be at least 6 characters')
      return
    }
    if (!userLevel.trim()) {
      setFormError('Please select a user level')
      return
    }
    if (!firstName.trim()) {
      setFormError('First name is required')
      return
    }
    if (!lastName.trim()) {
      setFormError('Last name is required')
      return
    }
    if (!employeeCode.trim()) {
      setFormError('Employee code is required')
      return
    }

    const payload: Record<string, unknown> = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      middleName: (middleName.trim() || '-'),
      employeeCode: employeeCode.trim(),
      office: office.trim() || undefined,
      userLevel: userLevel.trim(),
      officeRepresentative: officeRepresentative.trim() || undefined,
    }
    if (!isProfiles && newPassword.trim()) {
      payload.userPassword = newPassword.trim()
    }

    setSaving(true)
    try {
      const res = (await apiService.updateUser(user.id, payload)) as {
        success: boolean
        user?: Record<string, unknown>
        error?: string
      }
      if (!res.success) {
        const msg = res.error || 'Could not update profile'
        setFormError(msg)
        showError(msg)
        return
      }
      if (res.user) {
        syncUserFromBackend(res.user)
      }
      showSuccess('Profile updated.')
      setNewPassword('')
      setConfirmPassword('')
      onClose()
    } catch {
      const msg = 'An error occurred while saving'
      setFormError(msg)
      showError(msg)
    } finally {
      setSaving(false)
    }
  }

  const inputBaseClass =
    'w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors'

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999]"
      onClick={handleBackdrop}
      style={{ backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)' }}
      role="presentation"
    >
      <div
        className="rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
        style={{ backgroundColor: modalBg, border: `1px solid ${borderColor}` }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="profile-modal-title"
      >
        {/* Header — matches AddDocumentModal */}
        <div className="px-6 py-5" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <h2 id="profile-modal-title" className="text-lg font-semibold mb-1" style={{ color: textPrimary }}>
            My profile
          </h2>
          <p className="text-xs" style={{ color: textSecondary }}>
            Update your name, employee code, office, and other account details. Required fields are marked with an asterisk.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              {formError && (
                <div
                  className="px-3 py-2 rounded-md text-xs"
                  style={{
                    border: `1px solid ${theme === 'dark' ? '#7f1d1d' : '#fecaca'}`,
                    backgroundColor: theme === 'dark' ? 'rgba(127, 29, 29, 0.25)' : '#fef2f2',
                    color: theme === 'dark' ? '#fecaca' : '#991b1b',
                  }}
                >
                  {formError}
                </div>
              )}

              <div className="flex items-center gap-3">
                <label
                  className="text-xs font-medium whitespace-nowrap shrink-0"
                  style={{ color: textPrimary, width: LABEL_COL }}
                >
                  First name <RequiredAsterisk />
                </label>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputBaseClass}
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${inputBorder}`,
                      color: textPrimary,
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3ecf8e'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = inputBorder
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label
                  className="text-xs font-medium whitespace-nowrap shrink-0"
                  style={{ color: textPrimary, width: LABEL_COL }}
                >
                  Last name <RequiredAsterisk />
                </label>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputBaseClass}
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${inputBorder}`,
                      color: textPrimary,
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3ecf8e'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = inputBorder
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label
                  className="text-xs font-medium whitespace-nowrap shrink-0"
                  style={{ color: textPrimary, width: LABEL_COL }}
                >
                  Middle name / initial
                </label>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="Use - if none"
                    className={inputBaseClass}
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${inputBorder}`,
                      color: textPrimary,
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3ecf8e'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = inputBorder
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label
                  className="text-xs font-medium whitespace-nowrap shrink-0"
                  style={{ color: textPrimary, width: LABEL_COL }}
                >
                  Employee code <RequiredAsterisk />
                </label>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    required
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value.slice(0, EMPLOYEE_CODE_MAX_LENGTH))}
                    maxLength={EMPLOYEE_CODE_MAX_LENGTH}
                    className={inputBaseClass}
                    style={{
                      backgroundColor: inputBg,
                      border: `1px solid ${inputBorder}`,
                      color: textPrimary,
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3ecf8e'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = inputBorder
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label
                  className="text-xs font-medium whitespace-nowrap shrink-0"
                  style={{ color: textPrimary, width: LABEL_COL }}
                >
                  Office
                </label>
                <div className="flex-1 min-w-0">
                  <SearchableSelect
                    options={[...offices]
                      .sort((a, b) => a.office.localeCompare(b.office))
                      .map((o) => ({
                        id: o.id,
                        value: o.office,
                        label: o.office,
                      }))}
                    value={office}
                    onChange={setOffice}
                    placeholder="Select office (optional)"
                    searchPlaceholder="Find office..."
                    style={{ borderColor: inputBorder }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label
                  className="text-xs font-medium whitespace-nowrap shrink-0"
                  style={{ color: textPrimary, width: LABEL_COL }}
                >
                  User level <RequiredAsterisk />
                </label>
                <div className="flex-1 min-w-0">
                  <SearchableSelect
                    options={[...userLevels]
                      .sort((a, b) => a.user_level_name.localeCompare(b.user_level_name))
                      .map((l) => ({
                        id: l.id,
                        value: l.user_level_name,
                        label: l.user_level_name,
                      }))}
                    value={userLevel}
                    onChange={setUserLevel}
                    placeholder="Select user level"
                    searchPlaceholder="Find user level..."
                    style={{ borderColor: inputBorder }}
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <label
                  className="text-xs font-medium whitespace-nowrap shrink-0 pt-1"
                  style={{ color: textPrimary, width: LABEL_COL }}
                >
                  Office representative
                </label>
                <div className="flex-1 flex flex-wrap items-center gap-6 pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="profileOfficeRepresentative"
                      value="Yes"
                      checked={officeRepresentative === 'Yes'}
                      onChange={() => setOfficeRepresentative('Yes')}
                      className="h-3.5 w-3.5"
                      style={{ accentColor: '#3ecf8e' }}
                    />
                    <span className="text-xs" style={{ color: textPrimary }}>
                      Yes
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="profileOfficeRepresentative"
                      value="No"
                      checked={officeRepresentative === 'No'}
                      onChange={() => setOfficeRepresentative('No')}
                      className="h-3.5 w-3.5"
                      style={{ accentColor: '#3ecf8e' }}
                    />
                    <span className="text-xs" style={{ color: textPrimary }}>
                      No
                    </span>
                  </label>
                </div>
              </div>

              {!isProfiles && (
                <>
                  <div className="flex items-start gap-3">
                    <label
                      className="text-xs font-medium whitespace-nowrap shrink-0 pt-1"
                      style={{ color: textPrimary, width: LABEL_COL }}
                    >
                      New password
                    </label>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-xs mb-1" style={{ color: textSecondary }}>
                        Optional — leave blank to keep your current password.
                      </p>
                      <PasswordInputWithToggle
                        value={newPassword}
                        onChange={setNewPassword}
                        placeholder="Leave blank to keep current"
                        autoComplete="new-password"
                        className={passwordFieldClass}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label
                      className="text-xs font-medium whitespace-nowrap shrink-0"
                      style={{ color: textPrimary, width: LABEL_COL }}
                    >
                      Confirm password
                    </label>
                    <div className="flex-1 min-w-0">
                      <PasswordInputWithToggle
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        className={passwordFieldClass}
                      />
                    </div>
                  </div>
                </>
              )}

              {isProfiles && (
                <div className="flex items-start gap-3">
                  <label
                    className="text-xs font-medium whitespace-nowrap shrink-0 pt-1"
                    style={{ color: textPrimary, width: LABEL_COL }}
                  >
                    Password
                  </label>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs rounded-md px-2.5 py-1.5"
                      style={{
                        border: `1px solid ${borderColor}`,
                        color: textSecondary,
                        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa',
                      }}
                    >
                      Managed through your administrator or Supabase Auth. Sign in with your employee code and password as usual.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer — matches AddDocumentModal */}
          <div
            className="px-6 py-4 flex justify-end gap-2"
            style={{ borderTop: `1px solid ${borderColor}`, backgroundColor: modalBg }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
              style={{
                color: textSecondary,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#262626' : '#f5f5f5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
              style={{
                color: '#ffffff',
                backgroundColor: '#3ecf8e',
              }}
              onMouseEnter={(e) => {
                if (!saving) e.currentTarget.style.backgroundColor = '#35b87a'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3ecf8e'
              }}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileModal
