import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavbar } from '../context/NavbarContext'
import logo from '../assets/doh-logo.png'

const Header: React.FC = () => {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { toggleMobileNavbar } = useNavbar()

  return (
    <header 
      className="w-full fixed top-0 left-0 right-0 z-50 shadow-sm border-b border-green-600/20"
      style={{ backgroundColor: 'rgba(100, 154, 70)', height: '80px' }}
    >
      <div className="container mx-auto h-full px-4 md:px-6">
        <div className="flex items-center justify-between h-full">
          {/* Left Section: Mobile Menu + Logo + Title */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileNavbar}
              className="md:hidden flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              title="Toggle menu"
            >
              <svg 
                className="w-6 h-6 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Logo and Title */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <img 
                src={logo} 
                alt="Department of Health Logo" 
                className="w-12 h-12 flex-shrink-0 object-contain"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-base md:text-xl font-bold text-white truncate">
                  DEPARTMENT OF HEALTH - ZPCHD DOCUMENT TRACKING 4.0
                </h1>
                <p className="text-xs md:text-sm text-white/90 hidden sm:block truncate">
                  ONLINE DOCUMENT TRACKING INFORMATION SYSTEM
                </p>
              </div>
            </div>
          </div>
          
          {/* Right Section: User Info + Theme Toggle + Logout */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {user && (
              <div className="hidden md:flex items-center space-x-3 text-white">
                <span className="text-sm">
                  Welcome, {user.displayName || user.username || user.email}
                </span>
              </div>
            )}
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleTheme()
              }}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-150"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg 
                  className="w-5 h-5 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg 
                  className="w-5 h-5 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <Link 
              to="/logout"
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              title="Logout"
            >
              <svg 
                className="w-6 h-6 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

