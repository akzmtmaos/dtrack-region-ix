import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiService } from '../services/api'
import SearchableSelect from '../components/SearchableSelect'
import PasswordInputWithToggle from '../components/PasswordInputWithToggle'
import { useToast } from '../context/ToastContext'
import logo from '../assets/doh-logo.png'
import { EMPLOYEE_CODE_MAX_LENGTH } from '../constants/user'

const Register: React.FC = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [middleInitial, setMiddleInitial] = useState('')
  const [employeeCode, setEmployeeCode] = useState('')
  const [office, setOffice] = useState('')
  const [userLevel, setUserLevel] = useState('')
  const [officeRepresentative, setOfficeRepresentative] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [userLevels, setUserLevels] = useState<Array<{ id: number; user_level_name: string }>>([])
  const [offices, setOffices] = useState<Array<{ id: number; office: string }>>([])
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

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
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      const msg = 'Passwords do not match'
      setError(msg)
      showError(msg)
      return
    }
    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters'
      setError(msg)
      showError(msg)
      return
    }
    if (!userLevel.trim()) {
      const msg = 'Please select a user level'
      setError(msg)
      showError(msg)
      return
    }
    if (!firstName.trim()) {
      const msg = 'First name is required'
      setError(msg)
      showError(msg)
      return
    }
    if (!lastName.trim()) {
      const msg = 'Last name is required'
      setError(msg)
      showError(msg)
      return
    }
    if (!employeeCode.trim()) {
      const msg = 'Employee code is required'
      setError(msg)
      showError(msg)
      return
    }
    const middleNameForBackend = middleInitial.trim() || '-'

    setIsLoading(true)
    setError('')
    setSuccessMessage('')
    try {
      const backendRes = await apiService.register({
        employeeCode: employeeCode.trim(),
        lastName: lastName.trim(),
        firstName: firstName.trim(),
        middleName: middleNameForBackend,
        office: office.trim() || undefined,
        userPassword: password,
        userLevel: userLevel.trim(),
        officeRepresentative: officeRepresentative.trim() || undefined,
      })
      if (!backendRes.success) {
        const msg = backendRes.error || 'Registration failed'
        setError(msg)
        showError(msg)
        return
      }
      const okMsg =
        'Account created successfully. You will be able to sign in after an administrator or your office head approves your account.'
      setSuccessMessage(okMsg)
      showSuccess(okMsg)
      setTimeout(() => navigate('/login', { replace: true }), 3000)
    } catch (err) {
      setError('An error occurred. Please try again.')
      showError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = 'w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors'
  const labelClass = 'block text-xs font-medium text-gray-700 mb-2'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8" style={{ backgroundColor: '#f0f4f8' }}>
      <div className="max-w-2xl w-full space-y-6 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <img src={logo} alt="DOH Logo" className="w-20 h-20 object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              DTRAK REGION IX
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Online Document Tracking Information System — Register account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-2.5 py-1.5 rounded-md text-xs">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-2.5 py-1.5 rounded-md text-xs">
                {successMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Name in one row: First name, Last name, Middle initial */}
              <div className="md:col-span-2 flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[100px]">
                  <label className={labelClass}>First name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className={inputClass}
                  />
                </div>
                <div className="flex-1 min-w-[100px]">
                  <label className={labelClass}>Last name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className={inputClass}
                  />
                </div>
                <div className="w-20 flex-shrink-0">
                  <label className={labelClass}>Middle initial</label>
                  <input
                    type="text"
                    value={middleInitial}
                    onChange={(e) => setMiddleInitial(e.target.value.slice(0, 5))}
                    placeholder="M"
                    className={inputClass}
                    maxLength={5}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Employee code <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value.slice(0, EMPLOYEE_CODE_MAX_LENGTH))}
                  maxLength={EMPLOYEE_CODE_MAX_LENGTH}
                  placeholder="Employee code"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Office</label>
                <SearchableSelect
                  options={offices.map((o) => ({
                    id: o.id,
                    value: o.office,
                    label: o.office,
                  }))}
                  value={office}
                  onChange={setOffice}
                  placeholder="Select office (optional)"
                  searchPlaceholder="Find office..."
                />
              </div>

              <div>
                <label className={labelClass}>User level <span className="text-red-500">*</span></label>
                <SearchableSelect
                  options={userLevels.map((l) => ({
                    id: l.id,
                    value: l.user_level_name,
                    label: l.user_level_name,
                  }))}
                  value={userLevel}
                  onChange={setUserLevel}
                  placeholder="Select user level"
                  searchPlaceholder="Find user level..."
                />
              </div>

              <div>
                <span className={labelClass}>Office representative</span>
                <div className="flex items-center gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="officeRepresentative"
                      value="Yes"
                      checked={officeRepresentative === 'Yes'}
                      onChange={() => setOfficeRepresentative('Yes')}
                      className="h-3.5 w-3.5 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <span className="text-xs text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="officeRepresentative"
                      value="No"
                      checked={officeRepresentative === 'No'}
                      onChange={() => setOfficeRepresentative('No')}
                      className="h-3.5 w-3.5 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <span className="text-xs text-gray-700">No</span>
                  </label>
                </div>
              </div>

              <div>
                <label className={labelClass}>Password <span className="text-red-500">*</span></label>
                <PasswordInputWithToggle
                  value={password}
                  onChange={setPassword}
                  placeholder="At least 6 characters"
                  required
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className={labelClass}>Confirm password <span className="text-red-500">*</span></label>
                <PasswordInputWithToggle
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Re-enter password"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-3 border border-transparent rounded-md text-xs font-medium text-white"
                style={{
                  backgroundColor: 'rgba(100, 154, 70)',
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {isLoading ? 'Creating account...' : 'Register'}
              </button>

              <p className="text-center text-xs text-gray-600 mt-4">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500">
          © 2026 Department of Health. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default Register
