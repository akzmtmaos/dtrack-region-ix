import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useNavbar } from '../context/NavbarContext'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import LogoutConfirmation from './LogoutConfirmation'

const REFERENCE_TABLE_ITEMS = [
  { path: '/reference-tables/action-required', label: 'Action Required' },
  { path: '/reference-tables/action-officer', label: 'Action Officer' },
  { path: '/reference-tables/action-taken', label: 'Action Taken' },
  { path: '/reference-tables/document-type', label: 'Document Type' },
  { path: '/reference-tables/document-action-required-days', label: 'Doc/Action Req. Days' },
  { path: '/reference-tables/office', label: 'Office' },
  { path: '/reference-tables/region', label: 'Region' },
  { path: '/reference-tables/user-levels', label: 'User Levels' },
]

const REPORT_ITEMS = [
  { path: '/reports/document-by-releasing-officer', label: 'By Releasing Officer' },
  { path: '/reports/document-by-date-and-time', label: 'By Date and Time' },
  { path: '/reports/document-by-control-no', label: 'By Control No.' },
  { path: '/reports/document-by-subject', label: 'By Subject' },
  { path: '/reports/document-by-office', label: 'By Office' },
  { path: '/reports/document-by-office-control-no', label: 'By Office Control No.' },
  { path: '/reports/document-by-action-officer', label: 'By Action Officer' },
  { path: '/reports/overdue-report', label: 'Overdue Report' },
  { path: '/reports/audit-trail', label: 'Audit Trail' },
]

const Navbar: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { navbarMode, setNavbarMode, isHoverExpanded, setHoverExpanded, isMobileOpen, closeMobileNavbar } = useNavbar()
  const { theme } = useTheme()
  const { user } = useAuth()
  const level = (user?.userLevel ?? '').toLowerCase()
  const isEndUser = level === 'end-user' || level === 'end-users'
  const [isReferenceTablesOpen, setIsReferenceTablesOpen] = useState(false)
  const [isReportsOpen, setIsReportsOpen] = useState(false)
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [sidebarControlOpen, setSidebarControlOpen] = useState(false)
  const sidebarControlRef = useRef<HTMLDivElement>(null)
  const showExpanded = navbarMode === 'expanded' || (navbarMode === 'hover' && isHoverExpanded)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarControlRef.current && !sidebarControlRef.current.contains(e.target as Node)) {
        setSidebarControlOpen(false)
      }
    }
    if (sidebarControlOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [sidebarControlOpen])

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

  // DOH-inspired colors with green theme
  const colors = {
    bg: theme === 'dark' ? '#1a2e1a' : '#f0f7f0', // Light green tint for light mode, dark green for dark mode
    bgHover: theme === 'dark' ? '#2d4a2d' : '#e0efe0', // Darker green on hover
    bgActive: theme === 'dark' ? '#3d5a3d' : '#d0e7d0', // Active state green
    border: theme === 'dark' ? '#2d4a2d' : '#c0d7c0', // Green-tinted borders
    text: theme === 'dark' ? '#b8d4b8' : '#2d4a2d', // Green-tinted text
    textHover: theme === 'dark' ? '#ffffff' : '#1a2e1a', // White/dark green on hover
    textActive: theme === 'dark' ? '#ffffff' : '#1a2e1a', // White/dark green when active
    accent: '#649a46', // DOH green (matching header)
  }

  const navItemClass = (active: boolean) => `
    flex items-center gap-2 px-2 py-1.5 text-[13px] rounded-md transition-colors cursor-pointer
    ${showExpanded ? '' : 'justify-center'}
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
    ${showExpanded ? 'pl-7' : 'justify-center px-1.5'}
  `

  const subItemStyle = (active: boolean, itemId: string) => {
    const isHovered = hoveredItem === itemId && !active
    if (active) {
      return { backgroundColor: colors.bgActive, color: colors.accent }
    }
    if (isHovered) {
      return { backgroundColor: colors.bgHover, color: colors.textHover }
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
          showExpanded ? 'w-52' : 'w-12'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`} 
        style={{ 
          top: '80px', 
          height: 'calc(100vh - 80px)',
          backgroundColor: colors.bg,
          borderRight: `1px solid ${colors.border}`,
        }}
        onMouseEnter={() => {
          if (typeof window !== 'undefined' && window.innerWidth >= 768 && navbarMode === 'hover') setHoverExpanded(true)
        }}
        onMouseLeave={() => setHoverExpanded(false)}
      >
      <div className="flex flex-col h-full">
          {/* Mobile: Close button at top */}
        <div 
          className="flex md:hidden items-center h-10 px-2 flex-shrink-0"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          <button
            onClick={closeMobileNavbar}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-2 px-1.5 min-h-0">
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
                {showExpanded && <span>Outbox</span>}
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
                {showExpanded && <span>Inbox</span>}
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
                {showExpanded && (
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
                    {REFERENCE_TABLE_ITEMS.map(item => (
                    <Link 
                        key={item.path}
                        to={item.path} 
                        className={subItemClass(isActive(item.path))}
                        style={subItemStyle(isActive(item.path), `ref-${item.path}`)}
                        onMouseEnter={() => setHoveredItem(`ref-${item.path}`)}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                    {showExpanded ? item.label : (
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
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
                {showExpanded && (
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
                    {REPORT_ITEMS.map(item => (
                    <Link 
                        key={item.path}
                        to={item.path} 
                        className={subItemClass(isActive(item.path))}
                        style={subItemStyle(isActive(item.path), `report-${item.path}`)}
                        onMouseEnter={() => setHoveredItem(`report-${item.path}`)}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                    {showExpanded ? item.label : (
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                    )}
                  </Link>
                    ))}
                </div>
              )}
            </div>
            
              {/* Separator */}
              <div className="my-2" style={{ borderTop: `1px solid ${colors.border}` }} />

              {/* Registered Users – hidden for End-User */}
              {!isEndUser && (
                <Link
                  to="/registered-users"
                  className={navItemClass(isActive('/registered-users'))}
                  style={navItemStyle(isActive('/registered-users'), 'registered-users')}
                  onMouseEnter={() => setHoveredItem('registered-users')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {showExpanded && <span>Registered Users</span>}
                </Link>
              )}

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
                {showExpanded && <span>Logout</span>}
            </button>
            </div>
          </div>

          {/* Bottom: Sidebar control – single trigger opens dropdown (desktop only) */}
          <div
            className="hidden md:flex flex-shrink-0 py-2 px-1.5 mt-auto"
            style={{ borderTop: `1px solid ${colors.border}` }}
            ref={sidebarControlRef}
          >
            <div className="w-full relative">
              <button
                type="button"
                onClick={() => setSidebarControlOpen(!sidebarControlOpen)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 text-[13px] rounded-md transition-colors ${
                  showExpanded ? '' : 'justify-center'
                } ${sidebarControlOpen ? 'ring-1 ring-inset' : ''} ${
                  theme === 'dark' ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-500'
                }`}
                style={sidebarControlOpen ? { backgroundColor: colors.bgActive, color: colors.textActive } : undefined}
                title="Sidebar control"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {showExpanded && <span className="text-[13px]">Sidebar control</span>}
              </button>

              {sidebarControlOpen && (
                <div
                  className="absolute left-0 bottom-full mb-1 rounded-lg shadow-lg border py-1.5 z-50 w-[150px]"
                  style={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                  }}
                >
                  <div
                    className="px-2.5 pb-1.5 mb-1.5 text-[11px] font-semibold uppercase tracking-wide border-b"
                    style={{
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    }}
                  >
                    Sidebar control
                  </div>
                  <div className="px-0.5">
                    {[
                      { value: 'expanded' as const, label: 'Expanded' },
                      { value: 'collapsed' as const, label: 'Collapsed' },
                      { value: 'hover' as const, label: 'Expand on hover' },
                    ].map(({ value, label }) => (
                      <label
                        key={value}
                        className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-[11px] transition-colors"
                        style={{
                          backgroundColor: navbarMode === value ? (theme === 'dark' ? '#374151' : '#f3f4f6') : undefined,
                          color: theme === 'dark' ? '#e5e7eb' : '#374151',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6'
                        }}
                        onMouseLeave={(e) => {
                          if (navbarMode !== value) e.currentTarget.style.backgroundColor = ''
                        }}
                      >
                        <input
                          type="radio"
                          name="sidebar-mode"
                          checked={navbarMode === value}
                          onChange={() => {
                            setNavbarMode(value)
                            setSidebarControlOpen(false)
                          }}
                          className="h-3.5 w-3.5 text-green-600 focus:ring-green-500 border-gray-400"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
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
