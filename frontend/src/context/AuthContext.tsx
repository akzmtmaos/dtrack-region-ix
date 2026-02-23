import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  username: string
  email: string
  avatar?: string
  email_verified?: boolean
  date_joined?: string
  displayName?: string
  bio?: string
  phone?: string
  dob?: string
  location?: string
  employeeCode?: string
  firstName?: string
  lastName?: string
  fullName?: string
  userLevel?: string
  office?: string
  officeRepresentative?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  user: User | null
  loading: boolean
}

export interface RegisterData {
  email: string
  password: string
  fullName: string
  employeeCode: string
  office?: string
  userLevel: string
  officeRepresentative?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function authUserToAppUser(au: { id: string; email?: string | null }, profile: Record<string, unknown> | null): User {
  const email = au.email ?? ''
  const p = profile ?? {}
  const fullName = (p.full_name as string) ?? ''
  const [last = '', first = ''] = fullName.split(/\s+/).reverse()
  return {
    id: au.id,
    username: (p.employee_code as string) ?? email,
    email,
    employeeCode: p.employee_code as string,
    firstName: first || (p.first_name as string),
    lastName: last || (p.last_name as string),
    fullName,
    userLevel: p.user_level as string,
    office: p.office as string,
    officeRepresentative: p.office_representative as string,
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    if (!supabase) return null
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    return data
  }

  const setSession = async (authUser: { id: string; email?: string | null } | null) => {
    if (!authUser) {
      setUser(null)
      return
    }
    const profile = await fetchProfile(authUser.id)
    setUser(authUserToAppUser(authUser, profile))
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setSession(session.user)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setSession(session.user)
      else setUser(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend .env (same project as backend).',
      }
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) {
        const msg = error.message || 'Invalid email or password'
        return { success: false, error: msg }
      }
      if (data.user) await setSession(data.user)
      return { success: true }
    } catch (e) {
      console.error('Login error:', e)
      return { success: false, error: e instanceof Error ? e.message : 'Login failed' }
    }
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) return { success: false, error: 'Supabase not configured' }
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          data: {
            full_name: data.fullName.trim(),
            employee_code: data.employeeCode.trim(),
            office: data.office?.trim() ?? '',
            user_level: data.userLevel.trim(),
            office_representative: data.officeRepresentative?.trim() ?? '',
          },
        },
      })
      if (error) return { success: false, error: error.message }
      return { success: true }
    } catch (e) {
      console.error('Register error:', e)
      return { success: false, error: 'Registration failed' }
    }
  }

  const logout = async () => {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        login,
        register,
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
