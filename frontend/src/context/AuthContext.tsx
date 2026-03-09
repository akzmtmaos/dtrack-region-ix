import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiService } from '../services/api'

const STORAGE_KEY = 'doh_user'

interface User {
  id: string | number
  username?: string
  email?: string
  employeeCode?: string
  firstName?: string
  lastName?: string
  middleName?: string
  fullName?: string
  userLevel?: string
  office?: string
  officeRepresentative?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  login: (employeeCode: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function backendUserToAppUser(backendUser: Record<string, unknown>): User {
  const id = backendUser.id ?? ''
  const firstName = (backendUser.firstName ?? backendUser.first_name ?? '') as string
  const lastName = (backendUser.lastName ?? backendUser.last_name ?? '') as string
  const middleName = (backendUser.middleName ?? backendUser.middle_name ?? '') as string
  const fullName = [lastName, firstName, middleName].filter(Boolean).join(', ')
  return {
    id,
    username: (backendUser.employeeCode ?? backendUser.employee_code ?? '') as string,
    employeeCode: (backendUser.employeeCode ?? backendUser.employee_code ?? '') as string,
    firstName,
    lastName,
    middleName,
    fullName,
    userLevel: (backendUser.userLevel ?? backendUser.user_level ?? '') as string,
    office: (backendUser.office ?? '') as string,
    officeRepresentative: (backendUser.officeRepresentative ?? backendUser.office_representative ?? '') as string,
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as User
        if (parsed && (parsed.id !== undefined || parsed.employeeCode)) setUser(parsed)
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
    setLoading(false)
  }, [])

  const login = async (employeeCode: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiService.login(employeeCode.trim(), password)
      if (!res.success) {
        return { success: false, error: (res as { error?: string }).error || 'Invalid employee code or password' }
      }
      const data = res as { success: boolean; user?: Record<string, unknown> }
      if (!data.user) return { success: false, error: 'Invalid response' }
      const appUser = backendUserToAppUser(data.user)
      setUser(appUser)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appUser))
      return { success: true }
    } catch (e) {
      console.error('Login error:', e)
      return { success: false, error: e instanceof Error ? e.message : 'Login failed' }
    }
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        login,
        logout,
        user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
