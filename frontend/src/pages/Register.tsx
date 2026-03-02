import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../services/api'
import SearchableSelect from '../components/SearchableSelect'
import logo from '../assets/doh-logo.png'

const Register: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [employeeCode, setEmployeeCode] = useState('')
  const [office, setOffice] = useState('')
  const [userLevel, setUserLevel] = useState('')
  const [officeRepresentative, setOfficeRepresentative] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userLevels, setUserLevels] = useState<Array<{ id: number; user_level_name: string }>>([])
  const [offices, setOffices] = useState<Array<{ id: number; office: string }>>([])
  const navigate = useNavigate()
  const { register } = useAuth()

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
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (!userLevel.trim()) {
      setError('Please select a user level')
      return
    }
    if (!fullName.trim()) {
      setError('Full name is required')
      return
    }
    if (!employeeCode.trim()) {
      setError('Employee code is required')
      return
    }
    setIsLoading(true)
    try {
      const result = await register({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        employeeCode: employeeCode.trim(),
        office: office.trim() || undefined,
        userLevel: userLevel.trim(),
        officeRepresentative: officeRepresentative.trim() || undefined,
      })
      if (result.success) {
        navigate('/login', { replace: true })
      } else {
        setError(result.error || 'Registration failed')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className={labelClass}>Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Full name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Last name, First name Middle name"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Employee code <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
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
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Confirm password <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={inputClass}
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
