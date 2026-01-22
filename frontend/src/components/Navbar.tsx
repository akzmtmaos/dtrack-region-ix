import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useNavbar } from '../context/NavbarContext'
import { useTheme } from '../context/ThemeContext'
import LogoutConfirmation from './LogoutConfirmation'

const Navbar: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isMinimized, isMobileOpen, toggleNavbar, closeMobileNavbar } = useNavbar()
  const { theme } = useTheme()
  const [isReferenceTablesOpen, setIsReferenceTablesOpen] = useState(false)
  const [isReportsOpen, setIsReportsOpen] = useState(false)
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  useEffect(() => {
    closeMobileNavbar()
  }, [location.pathname, closeMobileNavbar])

  useEffect(() => {
    if (location.pathname.startsWith('/reference-tables')) {
      setIsReferenceTablesOpen(true)
    }
    if (location.pathname.startsWith('/reports')) {
      setIsReportsOpen(true)
    }
  }, [location.pathname])

  const isActive = (path: string) => location.pathname === path
  const isParentActive = (prefix: string) => location.pathname.startsWith(prefix)

  // Supabase-inspired colors
  const colors = {
    bg: theme === 'dark' ? '#171717' : '#ffffff',
    bgHover: theme === 'dark' ? '#262626' : '#f5f5f5',
    bgActive: theme === 'dark' ? '#262626' : '#f0f0f0',
    border: theme === 'dark' ? '#262626' : '#e5e5e5',
    text: theme === 'dark' ? '#a3a3a3' : '#525252',
    textHover: theme === 'dark' ? '#fafafa' : '#171717',
    textActive: theme === 'dark' ? '#fafafa' : '#171717',
    accent: '#3ecf8e', // Supabase green
  }

  const navItemClass = (active: boolean) => `
    flex items-center gap-2 px-2 py-1.5 text-[13px] rounded-md transition-colors cursor-pointer
    ${isMinimized ? 'justify-center' : ''}
  `

  const navItemStyle = (active: boolean, itemId: string) => {
    const isHovered = hoveredItem === itemId && !active
    if (active) {
      return { backgroundColor: colors.bgActive, color: colors.textActive }
    }
    if (isHovered) {
      return { backgroundColor: colors.bgHover, color: colors.textHover }
    }
    return { color: colors.text }
  }

  const subItemClass = (active: boolean) => `
    flex items-center gap-2 px-2 py-1 text-[12px] rounded-md transition-colors cursor-pointer
    ${isMinimized ? 'justify-center px-1.5' : 'pl-7'}
  `

  const subItemStyle = (active: boolean, itemId: string) => {
    const isHovered = hoveredItem === itemId && !active
    if (active) {
      return { color: colors.accent }
    }
    if (isHovered) {
      return { color: colors.textHover }
    }
    return { color: colors.text }
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
        className={`fixed left-0 flex flex-col z-40 transition-all duration-200 ${
          isMinimized ? 'w-12' : 'w-52'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`} 
        style={{ 
          top: '80px', 
          height: 'calc(100vh - 80px)',
          backgroundColor: colors.bg,
          borderRight: `1px solid ${colors.border}`,
        }}
      >
      <div className="flex flex-col h-full">
          {/* Toggle/Close Button */}
        <div 
            className="flex items-center h-10 px-2"
            style={{ borderBottom: `1px solid ${colors.border}` }}
        >
            {/* Mobile Close */}
          <button
            onClick={closeMobileNavbar}
              className="md:hidden p-1 rounded hover:bg-neutral-800 text-neutral-400"
          >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
            {/* Desktop Toggle */}
          <button
            onClick={toggleNavbar}
              className={`hidden md:flex p-1 rounded transition-colors ${
                theme === 'dark' ? 'hover:bg-neutral-800 text-neutral-500' : 'hover:bg-neutral-100 text-neutral-400'
            }`}
              title={isMinimized ? 'Expand' : 'Collapse'}
          >
            <svg 
                className={`w-4 h-4 transition-transform ${isMinimized ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-2 px-1.5">
            <div className="flex flex-col gap-0.5">
              
              {/* Outbox */}
              <Link 
                to="/" 
                className={navItemClass(isActive('/'))}
                style={navItemStyle(isActive('/'), 'outbox')}
                onMouseEnter={() => setHoveredItem('outbox')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                {!isMinimized && <span>Outbox</span>}
              </Link>

              {/* Inbox */}
              <Link 
                to="/inbox" 
                className={navItemClass(isActive('/inbox'))}
                style={navItemStyle(isActive('/inbox'), 'inbox')}
                onMouseEnter={() => setHoveredItem('inbox')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {!isMinimized && <span>Inbox</span>}
              </Link>

              {/* Personal Group */}
              <Link 
                to="/personal-group" 
                className={navItemClass(isActive('/personal-group'))}
                style={navItemStyle(isActive('/personal-group'), 'personal-group')}
                onMouseEnter={() => setHoveredItem('personal-group')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {!isMinimized && <span>Personal Group</span>}
              </Link>

              {/* Separator */}
              <div className="my-2" style={{ borderTop: `1px solid ${colors.border}` }} />
            
              {/* Reference Tables */}
              <div>
                <button 
                  onClick={() => setIsReferenceTablesOpen(!isReferenceTablesOpen)}
                  className={`w-full ${navItemClass(isParentActive('/reference-tables'))}`}
                  style={navItemStyle(isParentActive('/reference-tables'), 'reference-tables')}
                  onMouseEnter={() => setHoveredItem('reference-tables')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {!isMinimized && (
                  <>
                      <span className="flex-1 text-left">Reference Tables</span>
                    <svg 
                        className={`w-3 h-3 transition-transform ${isReferenceTablesOpen ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
              
              {isReferenceTablesOpen && (
                  <div className="mt-0.5 flex flex-col gap-0.5">
                    {[
                      { path: '/reference-tables/action-required', label: 'Action Required' },
                      { path: '/reference-tables/action-officer', label: 'Action Officer' },
                      { path: '/reference-tables/action-taken', label: 'Action Taken' },
                      { path: '/reference-tables/document-type', label: 'Document Type' },
                      { path: '/reference-tables/document-action-required-days', label: 'Doc/Action Req. Days' },
                      { path: '/reference-tables/office', label: 'Office' },
                      { path: '/reference-tables/region', label: 'Region' },
                      { path: '/reference-tables/user-levels', label: 'User Levels' },
                    ].map(item => (
                    <Link 
                        key={item.path}
                        to={item.path} 
                        className={subItemClass(isActive(item.path))}
                        style={subItemStyle(isActive(item.path), `ref-${item.path}`)}
                        onMouseEnter={() => setHoveredItem(`ref-${item.path}`)}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                    {isMinimized ? (
                          <span className="w-1 h-1 rounded-full" style={{ backgroundColor: isActive(item.path) ? colors.accent : colors.text }} />
                    ) : (
                          item.label
                    )}
                    </Link>
                    ))}
                </div>
              )}
            </div>

              {/* Reports */}
              <div>
                <button 
                  onClick={() => setIsReportsOpen(!isReportsOpen)}
                  className={`w-full ${navItemClass(isParentActive('/reports'))}`}
                  style={navItemStyle(isParentActive('/reports'), 'reports')}
                  onMouseEnter={() => setHoveredItem('reports')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {!isMinimized && (
                    <>
                      <span className="flex-1 text-left">Reports</span>
                      <svg 
                        className={`w-3 h-3 transition-transform ${isReportsOpen ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
                
              {isReportsOpen && (
                  <div className="mt-0.5 flex flex-col gap-0.5">
                    {[
                      { path: '/reports/document-by-releasing-officer', label: 'By Releasing Officer' },
                      { path: '/reports/document-by-date-and-time', label: 'By Date and Time' },
                      { path: '/reports/document-by-control-no', label: 'By Control No.' },
                      { path: '/reports/document-by-subject', label: 'By Subject' },
                      { path: '/reports/document-by-office', label: 'By Office' },
                      { path: '/reports/document-by-office-control-no', label: 'By Office Control No.' },
                      { path: '/reports/document-by-action-officer', label: 'By Action Officer' },
                      { path: '/reports/overdue-report', label: 'Overdue Report' },
                      { path: '/reports/audit-trail', label: 'Audit Trail' },
                    ].map(item => (
                    <Link 
                        key={item.path}
                        to={item.path} 
                        className={subItemClass(isActive(item.path))}
                        style={subItemStyle(isActive(item.path), `report-${item.path}`)}
                        onMouseEnter={() => setHoveredItem(`report-${item.path}`)}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                    {isMinimized ? (
                          <span className="w-1 h-1 rounded-full" style={{ backgroundColor: isActive(item.path) ? colors.accent : colors.text }} />
                    ) : (
                          item.label
                    )}
                  </Link>
                    ))}
                </div>
              )}
            </div>
            
              {/* Separator */}
              <div className="my-2" style={{ borderTop: `1px solid ${colors.border}` }} />

              {/* Office with Overdue */}
              <Link 
                to="/office-with-overdue" 
                className={navItemClass(isActive('/office-with-overdue'))}
                style={navItemStyle(isActive('/office-with-overdue'), 'office-with-overdue')}
                onMouseEnter={() => setHoveredItem('office-with-overdue')}
                onMouseLeave={() => setHoveredItem(null)}
            >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
                {!isMinimized && <span>Office with Overdue</span>}
            </Link>

              {/* Logout */}
              <button
              onClick={() => setShowLogoutConfirmation(true)}
              disabled={showLogoutConfirmation}
                className={`w-full ${navItemClass(false)} ${showLogoutConfirmation ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={navItemStyle(false, 'logout')}
                onMouseEnter={() => !showLogoutConfirmation && setHoveredItem('logout')}
                onMouseLeave={() => setHoveredItem(null)}
            >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
                {!isMinimized && <span>Logout</span>}
            </button>
            </div>
          </div>
        </div>
            
            <LogoutConfirmation
              isOpen={showLogoutConfirmation}
              onClose={() => setShowLogoutConfirmation(false)}
              onConfirm={() => {
                setShowLogoutConfirmation(false)
                navigate('/logout')
              }}
            />
    </nav>
    </>
  )
}

export default Navbar
