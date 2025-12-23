import React, { createContext, useContext, useState, useEffect } from 'react'

interface NavbarContextType {
  isMinimized: boolean
  toggleNavbar: () => void
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined)

export const NavbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    const saved = localStorage.getItem('navbarMinimized')
    return saved === 'true'
  })

  useEffect(() => {
    localStorage.setItem('navbarMinimized', String(isMinimized))
  }, [isMinimized])

  const toggleNavbar = () => {
    setIsMinimized(!isMinimized)
  }

  return (
    <NavbarContext.Provider value={{ isMinimized, toggleNavbar }}>
      {children}
    </NavbarContext.Provider>
  )
}

export const useNavbar = () => {
  const context = useContext(NavbarContext)
  if (context === undefined) {
    throw new Error('useNavbar must be used within a NavbarProvider')
  }
  return context
}

