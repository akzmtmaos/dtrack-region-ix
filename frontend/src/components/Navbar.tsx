import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useNavbar } from '../context/NavbarContext'
import { useTheme } from '../context/ThemeContext'
import LogoutConfirmation from './LogoutConfirmation'
import Tooltip from './Tooltip'

const Navbar: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isMinimized, isMobileOpen, toggleNavbar, closeMobileNavbar } = useNavbar()
  const { theme } = useTheme()
  const [isReferenceTablesOpen, setIsReferenceTablesOpen] = useState(false)
  const [isReportsOpen, setIsReportsOpen] = useState(false)
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)

  // Close mobile navbar when route changes
  useEffect(() => {
    closeMobileNavbar()
  }, [location.pathname, closeMobileNavbar])

  // Keep menu open if we're on any reference-tables or reports route
  useEffect(() => {
    if (location.pathname.startsWith('/reference-tables')) {
      setIsReferenceTablesOpen(true)
    }
    if (location.pathname.startsWith('/reports')) {
      setIsReportsOpen(true)
    }
  }, [location.pathname])

  const toggleReferenceTables = () => {
    setIsReferenceTablesOpen(!isReferenceTablesOpen)
  }

  const toggleReports = () => {
    setIsReportsOpen(!isReportsOpen)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          style={{ top: '80px' }}
          onClick={closeMobileNavbar}
        />
      )}
      
      <nav 
        className={`fixed left-0 flex flex-col z-40 transition-all duration-300 shadow-sm ${
          theme === 'dark' 
            ? '' 
            : 'bg-white'
        } ${
          // Mobile: slide in/out, Desktop: width based on minimized state
          isMinimized ? 'w-16' : 'w-64'
        } ${
          // Mobile responsive: hidden by default, slide in when open
          isMobileOpen 
            ? 'translate-x-0' 
            : '-translate-x-full md:translate-x-0'
        }`} 
        style={{ 
          top: '80px', 
          height: 'calc(100vh - 80px)',
          backgroundColor: theme === 'dark' ? '#070609' : undefined
        }}
      >
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div 
          className={`flex justify-between items-center p-3 border-b ${
            theme === 'dark' ? '' : 'border-gray-200/50'
          }`}
          style={theme === 'dark' ? { borderColor: '#4a4b4c' } : undefined}
        >
          {/* Mobile Close Button */}
          <button
            onClick={closeMobileNavbar}
            className={`md:hidden p-1.5 rounded-lg transition-all duration-150 ${
              theme === 'dark'
                ? 'hover:bg-discord-hover text-gray-300'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Close menu"
          >
            <svg 
              className="w-5 h-5"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Desktop Toggle Button */}
          <button
            onClick={toggleNavbar}
            className={`hidden md:flex p-1.5 rounded-lg transition-all duration-150 ${
              theme === 'dark'
                ? 'hover:bg-discord-hover text-gray-300'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={isMinimized ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg 
              className={`w-5 h-5 transition-transform duration-200 ${isMinimized ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        {/* Scrollable Navigation Links */}
        <div className="flex-1 overflow-y-auto py-3 px-2">
          <div className="flex flex-col w-full space-y-0.5">
            <Tooltip text="Outbox" isMinimized={isMinimized}>
              <Link 
                to="/" 
                className={`transition-all duration-150 font-medium rounded-lg flex items-center ${
                  isMinimized ? 'px-2 py-2 justify-center' : 'px-3 py-2.5'
                } ${
                  location.pathname === '/' 
                    ? 'bg-green-500 text-white shadow-sm' 
                    : theme === 'dark'
                      ? 'text-gray-300 hover:bg-discord-hover hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                {!isMinimized && <span className="ml-3">Outbox</span>}
              </Link>
            </Tooltip>
            <Tooltip text="Inbox" isMinimized={isMinimized}>
              <Link 
                to="/inbox" 
                className={`transition-all duration-150 font-medium rounded-lg flex items-center ${
                  isMinimized ? 'px-2 py-2 justify-center' : 'px-3 py-2.5'
                } ${
                  location.pathname === '/inbox' 
                    ? 'bg-green-500 text-white shadow-sm' 
                    : theme === 'dark'
                      ? 'text-gray-300 hover:bg-discord-hover hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {!isMinimized && <span className="ml-3">Inbox</span>}
              </Link>
            </Tooltip>
            <Tooltip text="Personal Group" isMinimized={isMinimized}>
              <Link 
                to="/personal-group" 
                className={`transition-all duration-150 font-medium rounded-lg flex items-center ${
                  isMinimized ? 'px-2 py-2 justify-center' : 'px-3 py-2.5'
                } ${
                  location.pathname === '/personal-group' 
                    ? 'bg-green-500 text-white shadow-sm' 
                    : theme === 'dark'
                      ? 'text-gray-300 hover:bg-discord-hover hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {!isMinimized && <span className="ml-3">Personal Group</span>}
              </Link>
            </Tooltip>
            
            {/* Reference Tables with Sub-items */}
            <div className="flex flex-col w-full">
              <Tooltip text="Reference Tables" isMinimized={isMinimized} verticalOffset={0}>
                <button 
                  onClick={toggleReferenceTables}
                  className={`transition-all duration-150 font-medium rounded-lg flex items-center w-full ${
                    isMinimized ? 'px-2 py-2 justify-center' : 'px-3 py-2.5'
                  } ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-discord-hover'
                      : 'text-gray-700 hover:text-green-600 hover:bg-gray-100'
                  }`}
                >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {!isMinimized && (
                  <>
                    <span className="ml-3 flex-1 text-left">Reference Tables</span>
                    <svg 
                      className={`w-5 h-5 transition-transform flex-shrink-0 ${isReferenceTablesOpen ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
              </Tooltip>
              
              {/* Sub-items */}
              {isReferenceTablesOpen && (
                <div 
                  className={`mt-1 space-y-0.5 ${isMinimized ? 'ml-0' : `ml-4 border-l-2 ${theme === 'dark' ? '' : 'border-green-300'} pl-3`} ${isMinimized ? `${theme === 'dark' ? 'bg-discord-hover' : 'bg-gray-50'} rounded-lg p-1` : ''}`}
                  style={theme === 'dark' && !isMinimized ? { borderColor: '#4a4b4c' } : undefined}
                >
                  <Tooltip text="Action Required" isMinimized={isMinimized}>
                    <Link 
                      to="/reference-tables/action-required" 
                      className={`transition-all duration-150 text-sm font-medium rounded-lg flex items-center ${
                        isMinimized 
                          ? 'px-2 py-2 justify-center' 
                          : 'px-3 py-2'
                      } ${
                        location.pathname === '/reference-tables/action-required'
                          ? 'bg-green-500 text-white shadow-sm'
                          : theme === 'dark'
                            ? 'text-gray-300 hover:text-white hover:bg-discord-hover'
                            : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                    {isMinimized ? (
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      "Action Required"
                    )}
                    </Link>
                  </Tooltip>
                  <Tooltip text="Action Officer" isMinimized={isMinimized}>
                    <Link 
                      to="/reference-tables/action-officer" 
                      className={`transition-all duration-150 text-sm font-medium rounded-lg flex items-center ${
                        isMinimized 
                          ? 'px-2 py-2 justify-center' 
                          : 'px-3 py-2'
                      } ${
                        location.pathname === '/reference-tables/action-officer'
                          ? 'bg-green-500 text-white shadow-sm'
                          : theme === 'dark'
                            ? 'text-gray-300 hover:text-white hover:bg-discord-hover'
                            : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                    {isMinimized ? (
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : (
                      "Action Officer"
                    )}
                    </Link>
                  </Tooltip>
                  <Tooltip text="Action Taken" isMinimized={isMinimized}>
                    <Link 
                      to="/reference-tables/action-taken" 
                      className={`transition-all duration-150 text-sm font-medium rounded-lg flex items-center ${
                        isMinimized 
                          ? 'px-2 py-2 justify-center' 
                          : 'px-3 py-2'
                      } ${
                        location.pathname === '/reference-tables/action-taken'
                          ? 'bg-green-500 text-white shadow-sm'
                          : theme === 'dark'
                            ? 'text-gray-300 hover:text-white hover:bg-discord-hover'
                            : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                    {isMinimized ? (
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      "Action Taken"
                    )}
                    </Link>
                  </Tooltip>
                  <Tooltip text="Document Type" isMinimized={isMinimized}>
                    <Link 
                      to="/reference-tables/document-type" 
                      className={`transition-all duration-150 text-sm font-medium rounded-lg flex items-center ${
                        isMinimized 
                          ? 'px-2 py-2 justify-center' 
                          : 'px-3 py-2'
                      } ${
                        location.pathname === '/reference-tables/document-type'
                          ? 'bg-green-500 text-white shadow-sm'
                          : theme === 'dark'
                            ? 'text-gray-300 hover:text-white hover:bg-discord-hover'
                            : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                    {isMinimized ? (
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ) : (
                      "Document Type"
                    )}
                    </Link>
                  </Tooltip>
                  <Tooltip text="Document/Action Required Days" isMinimized={isMinimized}>
                    <Link 
                      to="/reference-tables/document-action-required-days" 
                      className={`transition-all duration-150 text-sm font-medium rounded-lg flex items-center ${
                        isMinimized 
                          ? 'px-2 py-2 justify-center' 
                          : 'px-3 py-2'
                      } ${
                        location.pathname === '/reference-tables/document-action-required-days'
                          ? 'bg-green-500 text-white shadow-sm'
                          : theme === 'dark'
                            ? 'text-gray-300 hover:text-white hover:bg-discord-hover'
                            : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                    {isMinimized ? (
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      "Document/Action Required Days"
                    )}
                    </Link>
                  </Tooltip>
                  <Tooltip text="Office" isMinimized={isMinimized}>
                    <Link 
                      to="/reference-tables/office" 
                      className={`transition-all duration-150 text-sm font-medium rounded-lg flex items-center ${
                        isMinimized 
                          ? 'px-2 py-2 justify-center' 
                          : 'px-3 py-2'
                      } ${
                        location.pathname === '/reference-tables/office'
                          ? 'bg-green-500 text-white shadow-sm'
                          : theme === 'dark'
                            ? 'text-gray-300 hover:text-white hover:bg-discord-hover'
                            : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                    {isMinimized ? (
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    ) : (
                      "Office"
                    )}
                    </Link>
                  </Tooltip>
                  <Tooltip text="Region" isMinimized={isMinimized}>
                    <Link 
                      to="/reference-tables/region" 
                      className={`transition-all duration-150 text-sm font-medium rounded-lg flex items-center ${
                        isMinimized 
                          ? 'px-2 py-2 justify-center' 
                          : 'px-3 py-2'
                      } ${
                        location.pathname === '/reference-tables/region'
                          ? 'bg-green-500 text-white shadow-sm'
                          : theme === 'dark'
                            ? 'text-gray-300 hover:text-white hover:bg-discord-hover'
                            : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                    {isMinimized ? (
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      "Region"
                    )}
                    </Link>
                  </Tooltip>
                  <Tooltip text="User Levels" isMinimized={isMinimized}>
                    <Link 
                      to="/reference-tables/user-levels" 
                      className={`transition-all duration-150 text-sm font-medium rounded-lg flex items-center ${
                        isMinimized 
                          ? 'px-2 py-2 justify-center' 
                          : 'px-3 py-2'
                      } ${
                        location.pathname === '/reference-tables/user-levels'
                          ? 'bg-green-500 text-white shadow-sm'
                          : theme === 'dark'
                            ? 'text-gray-300 hover:text-white hover:bg-discord-hover'
                            : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                    {isMinimized ? (
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    ) : (
                      "User Levels"
                    )}
                  </Link>
                  </Tooltip>
                </div>
              )}
            </div>

            {/* Reports with Sub-items - rewritten */}
            <div className="flex flex-col w-full">
              <Tooltip text="Reports" isMinimized={isMinimized} verticalOffset={0}>
                <button 
                  onClick={toggleReports}
                  className={`transition-all duration-150 font-medium rounded-lg flex items-center w-full ${
                    isMinimized ? 'px-2 py-2 justify-center' : 'px-3 py-2.5'
                  } ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-discord-hover'
                      : 'text-gray-700 hover:text-green-600 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {!isMinimized && (
                    <>
                      <span className="ml-3 flex-1 text-left">Reports</span>
                      <svg 
                        className={`w-5 h-5 transition-transform flex-shrink-0 ${isReportsOpen ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              </Tooltip>
              {isReportsOpen && (
                <div 
                  className={`mt-1 space-y-0.5 ${isMinimized ? 'ml-0' : `ml-4 border-l-2 ${theme === 'dark' ? '' : 'border-green-300'} pl-3`} ${isMinimized ? `${theme === 'dark' ? 'bg-discord-hover' : 'bg-gray-50'} rounded-lg p-1` : ''}`}
                  style={theme === 'dark' && !isMinimized ? { borderColor: '#4a4b4c' } : undefined}
                >
                  <Tooltip text="Document By Releasing Officer" isMinimized={isMinimized}>
                    <Link 
                      to="/reports/document-by-releasing-officer" 
                      className={`transition-all duration-150 text-sm font-medium rounded-lg flex items-center ${
                        isMinimized 
                          ? 'px-2 py-2 justify-center' 
                          : 'px-3 py-2'
                      } ${
                        location.pathname === '/reports/document-by-releasing-officer'
                          ? 'bg-green-500 text-white shadow-sm'
                          : theme === 'dark'
                            ? 'text-gray-300 hover:text-white hover:bg-discord-hover'
                            : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                    {isMinimized ? (
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    ) : (
                      "Document By Releasing Officer"
                    )}
                  </Link>
                  </Tooltip>
                  <Tooltip text="Document By Date and Time" isMinimized={isMinimized}>
                    <Link 
                      to="/reports/document-by-date-and-time" 
                    className={`transition-all duration-150 text-sm font-medium rounded-lg flex items-center ${
                      isMinimized 
                        ? 'px-2 py-2 justify-center' 
                        : 'px-3 py-2'
                    } ${
                      location.pathname === '/reports/document-by-date-and-time'
                        ? 'bg-green-500 text-white shadow-sm'
                        : theme === 'dark'
                          ? 'text-gray-300 hover:text-white hover:bg-discord-hover'
                          : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    title={isMinimized ? "Document By Date and Time" : undefined}
                  >
                    {isMinimized ? (
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      "Document By Date and Time"
                    )}
                  </Link>
                  </Tooltip>
                  <Tooltip text="Document By Control No." isMinimized={isMinimized}>
                    <Link 
                      to="/reports/document-by-control-no" 
                    className={`transition-all duration-150 text-sm font-medium rounded-lg flex items-center ${
                      isMinimized 
                        ? 'px-2 py-2 justify-center' 
                        : 'px-3 py-2'
                    } ${
                      location.pathname === '/reports/document-by-control-no'
                        ? 'bg-green-500 text-white shadow-sm'
                        : theme === 'dark'
                          ? 'text-gray-300 hover:text-white hover:bg-discord-hover'
                          : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    title={isMinimized ? "Document By Control No." : undefined}
                  >
                    {isMinimized ? (
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    ) : (
                      "Document By Control No."
                    )}
                  </Link>
                  </Tooltip>
                  <Tooltip text="Document By Subject" isMinimized={isMinimized}>
                    <Link 
                      to="/reports/document-by-subject" 
                    className={`transition-all duration-150 text-sm font-medium rounded-lg flex items-center ${
                      isMinimized 
                        ? 'px-2 py-2 justify-center' 
                        : 'px-3 py-2'
                    } ${
                      location.pathname === '/reports/document-by-subject'
                        ? 'bg-green-500 text-white shadow-sm'
                        : theme === 'dark'
                          ? 'text-gray-300 hover:text-white hover:bg-discord-hover'
                          : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    title={isMinimized ? "Document By Subject" : undefined}
                  >
                    {isMinimized ? (
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ) : (
                      "Document By Subject"
                    )}
                  </Link>
                  </Tooltip>
                  <Tooltip text="Document By Office" isMinimized={isMinimized}>
                    <Link 
                      to="/reports/document-by-office" 
                    className={`transition-all duration-150 text-sm font-medium rounded-lg flex items-center ${
                      isMinimized 
                        ? 'px-2 py-2 justify-center' 
                        : 'px-3 py-2'
                    } ${
                      location.pathname === '/reports/document-by-office'
                        ? 'bg-green-500 text-white shadow-sm'
                        : theme === 'dark'
                          ? 'text-gray-300 hover:text-white hover:bg-discord-hover'
                          : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    title={isMinimized ? "Document By Office" : undefined}
                  >
                    {isMinimized ? (
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    ) : (
                      "Document By Office"
                    )}
                  </Link>
                  </Tooltip>
                  <Tooltip text="Document By Office Control No." isMinimized={isMinimized}>
                    <Link 
                      to="/reports/document-by-office-control-no" 
                    className={`transition-all duration-150 text-sm font-medium rounded-lg flex items-center ${
                      isMinimized 
                        ? 'px-2 py-2 justify-center' 
                        : 'px-3 py-2'
                    } ${
                      location.pathname === '/reports/document-by-office-control-no'
                        ? 'bg-green-500 text-white shadow-sm'
                        : theme === 'dark'
                          ? 'text-gray-300 hover:text-white hover:bg-discord-hover'
                          : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    title={isMinimized ? "Document By Office Control No." : undefined}
                  >
                    {isMinimized ? (
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    ) : (
                      "Document By Office Control No."
                    )}
                  </Link>
                  </Tooltip>
                  <Tooltip text="Document By Action Officer" isMinimized={isMinimized}>
                    <Link 
                      to="/reports/document-by-action-officer" 
                    className={`transition-all duration-150 text-sm font-medium rounded-lg flex items-center ${
                      isMinimized 
                        ? 'px-2 py-2 justify-center' 
                        : 'px-3 py-2'
                    } ${
                      location.pathname === '/reports/document-by-action-officer'
                        ? 'bg-green-500 text-white shadow-sm'
                        : theme === 'dark'
                          ? 'text-gray-300 hover:text-white hover:bg-discord-hover'
                          : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    title={isMinimized ? "Document By Action Officer" : undefined}
                  >
                    {isMinimized ? (
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : (
                      "Document By Action Officer"
                    )}
                  </Link>
                  </Tooltip>
                  <Tooltip text="Overdue Report" isMinimized={isMinimized}>
                    <Link 
                      to="/reports/overdue-report" 
                    className={`transition-all duration-150 text-sm font-medium rounded-lg flex items-center ${
                      isMinimized 
                        ? 'px-2 py-2 justify-center' 
                        : 'px-3 py-2'
                    } ${
                      location.pathname === '/reports/overdue-report'
                        ? 'bg-green-500 text-white shadow-sm'
                        : theme === 'dark'
                          ? 'text-gray-300 hover:text-white hover:bg-discord-hover'
                          : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    title={isMinimized ? "Overdue Report" : undefined}
                  >
                    {isMinimized ? (
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      "Overdue Report"
                    )}
                  </Link>
                  </Tooltip>
                  <Tooltip text="Audit Trail" isMinimized={isMinimized}>
                    <Link 
                      to="/reports/audit-trail" 
                    className={`transition-all duration-150 text-sm font-medium rounded-lg flex items-center ${
                      isMinimized 
                        ? 'px-2 py-2 justify-center' 
                        : 'px-3 py-2'
                    } ${
                      location.pathname === '/reports/audit-trail'
                        ? 'bg-green-500 text-white shadow-sm'
                        : theme === 'dark'
                          ? 'text-gray-300 hover:text-white hover:bg-discord-hover'
                          : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    title={isMinimized ? "Audit Trail" : undefined}
                  >
                    {isMinimized ? (
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    ) : (
                      "Audit Trail"
                    )}
                  </Link>
                  </Tooltip>
                </div>
              )}
            </div>
            
            <Tooltip text="Office with Overdue" isMinimized={isMinimized}>
              <Link 
                to="/office-with-overdue" 
              className={`transition-all duration-150 font-medium rounded-lg flex items-center ${
                isMinimized ? 'px-2 py-2 justify-center' : 'px-3 py-2.5'
              } ${
                location.pathname === '/office-with-overdue' 
                  ? 'bg-green-500 text-white shadow-sm' 
                  : theme === 'dark'
                    ? 'text-gray-300 hover:bg-discord-hover hover:text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'
              }`}
              title="Office with Overdue"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {!isMinimized && <span className="ml-3">Office with Overdue</span>}
            </Link>
            </Tooltip>
            <Tooltip text="Logout" isMinimized={isMinimized}>
              <button
              onClick={() => setShowLogoutConfirmation(true)}
              disabled={showLogoutConfirmation}
              className={`transition-all duration-150 font-medium rounded-lg flex items-center w-full ${
                isMinimized ? 'px-2 py-2 justify-center' : 'px-3 py-2.5 text-left'
              } ${
                location.pathname === '/logout' 
                  ? 'bg-green-500 text-white shadow-sm' 
                  : theme === 'dark'
                    ? 'text-gray-300 hover:bg-discord-hover hover:text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'
              } ${showLogoutConfirmation ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Logout"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!isMinimized && <span className="ml-3">Logout</span>}
            </button>
            </Tooltip>
            
            <LogoutConfirmation
              isOpen={showLogoutConfirmation}
              onClose={() => setShowLogoutConfirmation(false)}
              onConfirm={() => {
                setShowLogoutConfirmation(false)
                navigate('/logout')
              }}
            />
          </div>
        </div>
      </div>
    </nav>
    </>
  )
}

export default Navbar;