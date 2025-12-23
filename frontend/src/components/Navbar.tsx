import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useNavbar } from '../context/NavbarContext'
import LogoutConfirmation from './LogoutConfirmation'

const Navbar: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isMinimized, toggleNavbar } = useNavbar()
  const [isReferenceTablesOpen, setIsReferenceTablesOpen] = useState(false)
  const [isReportsOpen, setIsReportsOpen] = useState(false)
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)

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
    <nav 
      className={`bg-white shadow-md fixed top-20 left-0 flex flex-col z-30 transition-all duration-300 ${
        isMinimized ? 'w-16' : 'w-64'
      }`} 
      style={{ top: '80px', height: 'calc(100vh - 80px)' }}
    >
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="flex justify-end p-2 border-b border-gray-200">
          <button
            onClick={toggleNavbar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={isMinimized ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg 
              className={`w-5 h-5 text-gray-600 transition-transform ${isMinimized ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        {/* Scrollable Navigation Links */}
        <div className="flex-1 overflow-y-auto py-8 px-4">
          <div className="flex flex-col w-full space-y-3">
            <Link 
              to="/" 
              className={`transition-colors font-medium rounded flex items-center ${
                isMinimized ? 'px-2 py-2 justify-center' : 'px-4 py-2'
              } ${
                location.pathname === '/' 
                  ? 'bg-green-100 text-green-900' 
                  : 'text-green-700 hover:text-green-900 hover:bg-green-50'
              }`}
              title="Outbox"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              {!isMinimized && <span className="ml-3">Outbox</span>}
            </Link>
            <Link 
              to="/inbox" 
              className={`transition-colors font-medium rounded flex items-center ${
                isMinimized ? 'px-2 py-2 justify-center' : 'px-4 py-2'
              } ${
                location.pathname === '/inbox' 
                  ? 'bg-green-100 text-green-900' 
                  : 'text-green-700 hover:text-green-900 hover:bg-green-50'
              }`}
              title="Inbox"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {!isMinimized && <span className="ml-3">Inbox</span>}
            </Link>
            <Link 
              to="/personal-group" 
              className={`transition-colors font-medium rounded flex items-center ${
                isMinimized ? 'px-2 py-2 justify-center' : 'px-4 py-2'
              } ${
                location.pathname === '/personal-group' 
                  ? 'bg-green-100 text-green-900' 
                  : 'text-green-700 hover:text-green-900 hover:bg-green-50'
              }`}
              title="Personal Group"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {!isMinimized && <span className="ml-3">Personal Group</span>}
            </Link>
            
            {/* Reference Tables with Sub-items */}
            <div className="flex flex-col w-full">
              <button 
                onClick={toggleReferenceTables}
                className={`text-green-700 hover:text-green-900 transition-colors font-medium rounded hover:bg-green-50 flex items-center w-full ${
                  isMinimized ? 'px-2 py-2 justify-center' : 'px-4 py-2'
                }`}
                title="Reference Tables"
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
              
              {/* Sub-items */}
              {isReferenceTablesOpen && !isMinimized && (
                <div className="ml-4 mt-2 space-y-2 border-l-2 border-green-200 pl-4">
                  <Link 
                    to="/reference-tables/action-required" 
                    className={`transition-colors text-sm font-medium px-4 py-2 rounded block ${
                      location.pathname === '/reference-tables/action-required'
                        ? 'bg-green-100 text-green-900'
                        : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Action Required
                  </Link>
                  <Link 
                    to="/reference-tables/action-officer" 
                    className={`transition-colors text-sm font-medium px-4 py-2 rounded block ${
                      location.pathname === '/reference-tables/action-officer'
                        ? 'bg-green-100 text-green-900'
                        : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Action Officer
                  </Link>
                  <Link 
                    to="/reference-tables/action-taken" 
                    className={`transition-colors text-sm font-medium px-4 py-2 rounded block ${
                      location.pathname === '/reference-tables/action-taken'
                        ? 'bg-green-100 text-green-900'
                        : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Action Taken
                  </Link>
                  <Link 
                    to="/reference-tables/document-type" 
                    className={`transition-colors text-sm font-medium px-4 py-2 rounded block ${
                      location.pathname === '/reference-tables/document-type'
                        ? 'bg-green-100 text-green-900'
                        : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Document Type
                  </Link>
                  <Link 
                    to="/reference-tables/document-action-required-days" 
                    className={`transition-colors text-sm font-medium px-4 py-2 rounded block ${
                      location.pathname === '/reference-tables/document-action-required-days'
                        ? 'bg-green-100 text-green-900'
                        : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Document/Action Required Days
                  </Link>
                  <Link 
                    to="/reference-tables/calendar" 
                    className={`transition-colors text-sm font-medium px-4 py-2 rounded block ${
                      location.pathname === '/reference-tables/calendar'
                        ? 'bg-green-100 text-green-900'
                        : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Calendar
                  </Link>
                  <Link 
                    to="/reference-tables/office" 
                    className={`transition-colors text-sm font-medium px-4 py-2 rounded block ${
                      location.pathname === '/reference-tables/office'
                        ? 'bg-green-100 text-green-900'
                        : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Office
                  </Link>
                  <Link 
                    to="/reference-tables/region" 
                    className={`transition-colors text-sm font-medium px-4 py-2 rounded block ${
                      location.pathname === '/reference-tables/region'
                        ? 'bg-green-100 text-green-900'
                        : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Region
                  </Link>
                  <Link 
                    to="/reference-tables/user-levels" 
                    className={`transition-colors text-sm font-medium px-4 py-2 rounded block ${
                      location.pathname === '/reference-tables/user-levels'
                        ? 'bg-green-100 text-green-900'
                        : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    User Levels
                  </Link>
                </div>
              )}
            </div>

            {/* Reports with Sub-items - rewritten */}
            <div className="flex flex-col w-full">
              <button 
                onClick={toggleReports}
                className={`text-green-700 hover:text-green-900 transition-colors font-medium rounded hover:bg-green-50 flex items-center w-full ${
                  isMinimized ? 'px-2 py-2 justify-center' : 'px-4 py-2'
                }`}
                title="Reports"
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
              {isReportsOpen && !isMinimized && (
                <div className="ml-4 mt-2 space-y-2 border-l-2 border-green-200 pl-4">
                  <Link 
                    to="/reports/document-by-releasing-officer" 
                    className={`transition-colors text-sm font-medium px-4 py-2 rounded block ${
                      location.pathname === '/reports/document-by-releasing-officer'
                        ? 'bg-green-100 text-green-900'
                        : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Document By Releasing Officer
                  </Link>
                  <Link 
                    to="/reports/document-by-date-and-time" 
                    className={`transition-colors text-sm font-medium px-4 py-2 rounded block ${
                      location.pathname === '/reports/document-by-date-and-time'
                        ? 'bg-green-100 text-green-900'
                        : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Document By Date and Time
                  </Link>
                  <Link 
                    to="/reports/document-by-control-no" 
                    className={`transition-colors text-sm font-medium px-4 py-2 rounded block ${
                      location.pathname === '/reports/document-by-control-no'
                        ? 'bg-green-100 text-green-900'
                        : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Document By Control No.
                  </Link>
                  <Link 
                    to="/reports/document-by-subject" 
                    className={`transition-colors text-sm font-medium px-4 py-2 rounded block ${
                      location.pathname === '/reports/document-by-subject'
                        ? 'bg-green-100 text-green-900'
                        : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Document By Subject
                  </Link>
                  <Link 
                    to="/reports/document-by-office" 
                    className={`transition-colors text-sm font-medium px-4 py-2 rounded block ${
                      location.pathname === '/reports/document-by-office'
                        ? 'bg-green-100 text-green-900'
                        : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Document By Office
                  </Link>
                  <Link 
                    to="/reports/document-by-office-control-no" 
                    className={`transition-colors text-sm font-medium px-4 py-2 rounded block ${
                      location.pathname === '/reports/document-by-office-control-no'
                        ? 'bg-green-100 text-green-900'
                        : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Document By Office Control No.
                  </Link>
                  <Link 
                    to="/reports/document-by-action-officer" 
                    className={`transition-colors text-sm font-medium px-4 py-2 rounded block ${
                      location.pathname === '/reports/document-by-action-officer'
                        ? 'bg-green-100 text-green-900'
                        : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Document By Action Officer
                  </Link>
                  <Link 
                    to="/reports/overdue-report" 
                    className={`transition-colors text-sm font-medium px-4 py-2 rounded block ${
                      location.pathname === '/reports/overdue-report'
                        ? 'bg-green-100 text-green-900'
                        : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Overdue Report
                  </Link>
                  <Link 
                    to="/reports/audit-trail" 
                    className={`transition-colors text-sm font-medium px-4 py-2 rounded block ${
                      location.pathname === '/reports/audit-trail'
                        ? 'bg-green-100 text-green-900'
                        : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Audit Trail
                  </Link>
                </div>
              )}
            </div>
            
            <Link 
              to="/office-with-overdue" 
              className={`transition-colors font-medium rounded flex items-center ${
                isMinimized ? 'px-2 py-2 justify-center' : 'px-4 py-2'
              } ${
                location.pathname === '/office-with-overdue' 
                  ? 'bg-green-100 text-green-900' 
                  : 'text-green-700 hover:text-green-900 hover:bg-green-50'
              }`}
              title="Office with Overdue"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {!isMinimized && <span className="ml-3">Office with Overdue</span>}
            </Link>
            <button
              onClick={() => setShowLogoutConfirmation(true)}
              disabled={showLogoutConfirmation}
              className={`transition-colors font-medium rounded flex items-center w-full ${
                isMinimized ? 'px-2 py-2 justify-center' : 'px-4 py-2 text-left'
              } ${
                location.pathname === '/logout' 
                  ? 'bg-green-100 text-green-900' 
                  : 'text-green-700 hover:text-green-900 hover:bg-green-50'
              } ${showLogoutConfirmation ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Logout"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!isMinimized && <span className="ml-3">Logout</span>}
            </button>
            
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
  );
};

export default Navbar;