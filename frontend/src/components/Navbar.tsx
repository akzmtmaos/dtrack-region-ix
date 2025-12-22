import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import LogoutConfirmation from './LogoutConfirmation'

const Navbar: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isReferenceTablesOpen, setIsReferenceTablesOpen] = useState(false)
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)

  // Keep menu open if we're on any reference-tables route
  useEffect(() => {
    if (location.pathname.startsWith('/reference-tables')) {
      setIsReferenceTablesOpen(true)
    }
  }, [location.pathname])

  const toggleReferenceTables = () => {
    setIsReferenceTablesOpen(!isReferenceTablesOpen)
  }

  return (
    <nav className="bg-white shadow-md fixed top-20 left-0 w-64 flex flex-col z-30" style={{ top: '80px', height: 'calc(100vh - 80px)' }}>
      <div className="flex flex-col h-full">
        {/* Scrollable Navigation Links */}
        <div className="flex-1 overflow-y-auto py-8 px-4">
          <div className="flex flex-col w-full space-y-3">
          <Link 
            to="/" 
            className={`transition-colors font-medium px-4 py-2 rounded ${
              location.pathname === '/' 
                ? 'bg-green-100 text-green-900' 
                : 'text-green-700 hover:text-green-900 hover:bg-green-50'
            }`}
          >
            Outbox
          </Link>
          <Link 
            to="/inbox" 
            className={`transition-colors font-medium px-4 py-2 rounded ${
              location.pathname === '/inbox' 
                ? 'bg-green-100 text-green-900' 
                : 'text-green-700 hover:text-green-900 hover:bg-green-50'
            }`}
          >
            Inbox
          </Link>
          <Link 
            to="/personal-group" 
            className={`transition-colors font-medium px-4 py-2 rounded ${
              location.pathname === '/personal-group' 
                ? 'bg-green-100 text-green-900' 
                : 'text-green-700 hover:text-green-900 hover:bg-green-50'
            }`}
          >
            Personal Group
          </Link>
          
          {/* Reference Tables with Sub-items */}
          <div className="flex flex-col w-full">
            <button 
              onClick={toggleReferenceTables}
              className="text-green-700 hover:text-green-900 transition-colors font-medium px-4 py-2 rounded hover:bg-green-50 flex items-center justify-between w-full"
            >
              <span>Reference Tables</span>
              <svg 
                className={`w-5 h-5 transition-transform ${isReferenceTablesOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Sub-items */}
            {isReferenceTablesOpen && (
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

          <Link 
            to="/reports" 
            className={`transition-colors font-medium px-4 py-2 rounded ${
              location.pathname === '/reports' 
                ? 'bg-green-100 text-green-900' 
                : 'text-green-700 hover:text-green-900 hover:bg-green-50'
            }`}
          >
            Reports
          </Link>
          <Link 
            to="/office-with-overdue" 
            className={`transition-colors font-medium px-4 py-2 rounded ${
              location.pathname === '/office-with-overdue' 
                ? 'bg-green-100 text-green-900' 
                : 'text-green-700 hover:text-green-900 hover:bg-green-50'
            }`}
          >
            Office with Overdue
          </Link>
          <button
            onClick={() => setShowLogoutConfirmation(true)}
            disabled={showLogoutConfirmation}
            className={`transition-colors font-medium px-4 py-2 rounded w-full text-left ${
              location.pathname === '/logout' 
                ? 'bg-green-100 text-green-900' 
                : 'text-green-700 hover:text-green-900 hover:bg-green-50'
            } ${showLogoutConfirmation ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Logout
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