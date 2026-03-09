import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'

export type NavbarMode = 'expanded' | 'collapsed' | 'hover'

interface NavbarContextType {
  /** Current mode: expanded (always wide), collapsed (always narrow), hover (narrow until hover) */
  navbarMode: NavbarMode
  setNavbarMode: (mode: NavbarMode) => void
  /** Only used when navbarMode === 'hover'. Navbar sets this on mouse enter/leave. */
  isHoverExpanded: boolean
  setHoverExpanded: (value: boolean) => void
  /** True when sidebar is visually narrow (for layout margin). Backward compatible. */
  isMinimized: boolean
  isMobileOpen: boolean
  toggleMobileNavbar: () => void
  closeMobileNavbar: () => void
}

const STORAGE_KEY = 'navbarMode'

const NavbarContext = createContext<NavbarContextType | undefined>(undefined)

function loadSavedMode(): NavbarMode {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'expanded' || saved === 'collapsed' || saved === 'hover') return saved
  // Migrate old boolean
  const legacy = localStorage.getItem('navbarMinimized')
  if (legacy === 'true') return 'collapsed'
  return 'expanded'
}

export const NavbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [navbarMode, setNavbarModeState] = useState<NavbarMode>(loadSavedMode)
  const [isHoverExpanded, setHoverExpanded] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const setNavbarMode = (mode: NavbarMode) => {
    setNavbarModeState(mode)
    if (mode !== 'hover') setHoverExpanded(false)
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, navbarMode)
    // Keep legacy key in sync for any code that might read it
    localStorage.setItem('navbarMinimized', String(navbarMode !== 'expanded'))
  }, [navbarMode])

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

  const toggleMobileNavbar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const closeMobileNavbar = () => {
    setIsMobileOpen(false)
  }

  /** Sidebar is narrow when: collapsed mode, or hover mode and not currently hover-expanded */
  const isMinimized = useMemo(() => {
    return navbarMode === 'collapsed' || (navbarMode === 'hover' && !isHoverExpanded)
  }, [navbarMode, isHoverExpanded])

  const value: NavbarContextType = {
    navbarMode,
    setNavbarMode,
    isHoverExpanded,
    setHoverExpanded,
    isMinimized,
    isMobileOpen,
    toggleMobileNavbar,
    closeMobileNavbar,
  }

  return (
    <NavbarContext.Provider value={value}>
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
