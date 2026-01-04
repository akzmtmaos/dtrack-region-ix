import React, { createContext, useContext, useState, useEffect } from 'react'

interface NavbarContextType {
  isMinimized: boolean
  isMobileOpen: boolean
  toggleNavbar: () => void
  toggleMobileNavbar: () => void
  closeMobileNavbar: () => void
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined)

export const NavbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    const saved = localStorage.getItem('navbarMinimized')
    return saved === 'true'
  })
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false)

  useEffect(() => {
    localStorage.setItem('navbarMinimized', String(isMinimized))
  }, [isMinimized])

  // Close mobile navbar on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleNavbar = () => {
    setIsMinimized(!isMinimized)
  }

  const toggleMobileNavbar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const closeMobileNavbar = () => {
    setIsMobileOpen(false)
  }

  return (
    <NavbarContext.Provider value={{ isMinimized, isMobileOpen, toggleNavbar, toggleMobileNavbar, closeMobileNavbar }}>
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

