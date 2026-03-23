import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import PasswordInputWithToggle from '../components/PasswordInputWithToggle'
import logo from '../assets/doh-logo.png'
import { EMPLOYEE_CODE_MAX_LENGTH } from '../constants/user'

const Login: React.FC = () => {
  const [employeeCode, setEmployeeCode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const result = await login(employeeCode, password)
      if (result.success) {
        showSuccess('Signed in successfully')
        const from = (location.state as any)?.from?.pathname || '/'
        navigate(from, { replace: true })
      } else {
        const msg = result.error || 'Invalid employee code or password'
        setError(msg)
        showError(msg)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      showError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" style={{ backgroundColor: '#f0f4f8' }}>
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src={logo} alt="DOH Logo" className="w-20 h-20 object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              DTRAK REGION IX
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Online Document Tracking Information System
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-2.5 py-1.5 rounded-md text-xs">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="employeeCode" className="block text-xs font-medium text-gray-700 mb-2">
                Employee code
              </label>
              <input
                id="employeeCode"
                type="text"
                required
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value.slice(0, EMPLOYEE_CODE_MAX_LENGTH))}
                maxLength={EMPLOYEE_CODE_MAX_LENGTH}
                className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                placeholder="Enter your employee code"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-2">
                Password
              </label>
              <PasswordInputWithToggle
                id="password"
                value={password}
                onChange={setPassword}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-3.5 w-3.5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-700">
                  Remember me
                </label>
              </div>
              <div className="text-xs">
                <a href="#" className="font-medium text-green-600 hover:text-green-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-3 border rounded-md text-xs font-medium text-white"
              style={{
                backgroundColor: 'rgba(100, 154, 70)',
                borderColor: 'rgba(100, 154, 70)',
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <p className="text-center text-xs text-gray-600 mt-4">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
                Register
              </Link>
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500">
          © 2026 Department of Health. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default Login
