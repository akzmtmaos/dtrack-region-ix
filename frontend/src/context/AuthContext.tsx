import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: number
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
}

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  user: User | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<User | null>(null)

  // Check if user is logged in on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated')
    const storedUser = localStorage.getItem('user')
    if (storedAuth === 'true' && storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setIsAuthenticated(true)
        setUser(userData)
      } catch (error) {
        // If parsing fails, treat as old string format
        setIsAuthenticated(true)
        setUser({ id: 0, username: storedUser, email: storedUser })
      }
    }
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // TODO: Replace with actual API call to Django backend
      // For now, using mock authentication
      if (username && password) {
        // When you connect to the API, parse the user object from response
        // For now, create a simple user object
        const userData: User = {
          id: 0,
          username: username,
          email: username
        }
        setIsAuthenticated(true)
        setUser(userData)
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('user', JSON.stringify(userData))
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
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

