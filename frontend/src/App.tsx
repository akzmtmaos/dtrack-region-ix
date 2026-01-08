import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { useNavbar } from './context/NavbarContext'
import { useTheme } from './context/ThemeContext'
import Header from './components/Header'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

// main navbar stuff
import Login from './pages/Login'
import Logout from './pages/Logout'
import Outbox from './pages/Outbox'
import Inbox from './pages/Inbox'
import PersonalGroup from './pages/PersonalGroup'
import Reports from './pages/Reports'
// reference tables stuff
import ActionRequired from './pages/reference-tables/ActionRequired'
import ActionOfficer from './pages/reference-tables/ActionOfficer'
import ActionTaken from './pages/reference-tables/ActionTaken'
import DocumentType from './pages/reference-tables/DocumentType'
import DocumentActionRequiredDays from './pages/reference-tables/DocumentActionRequiredDays'
import Office from './pages/reference-tables/Office'
import Region from './pages/reference-tables/Region'
import UserLevels from './pages/reference-tables/UserLevels'
import OfficeWithOverdue from './pages/OfficeWithOverdue'
// reports stuff
import DocumentByReleasingOfficer from './pages/reports/DocumentByReleasingOfficer'
import DocumentByDateAndTime from './pages/reports/DocumentByDateAndTime'
import DocumentByControlNo from './pages/reports/DocumentByControlNo'
import DocumentBySubject from './pages/reports/DocumentBySubject'
import DocumentByOffice from './pages/reports/DocumentByOffice'
import DocumentByOfficeControlNo from './pages/reports/DocumentByOfficeControlNo'
import DocumentByActionOfficer from './pages/reports/DocumentByActionOfficer'
import OverdueReport from './pages/reports/OverdueReport'
import AuditTrail from './pages/reports/AuditTrail'

function AppContent() {
  const { isAuthenticated } = useAuth()
  const { isMinimized } = useNavbar()
  const { theme } = useTheme()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        } />

        {/* Protected Routes */}
        <Route path="/logout" element={<Logout />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <div className={`min-h-screen transition-colors duration-300 ${
              theme === 'dark' ? '' : 'bg-[#f7f8fa]'
            }`}
            style={theme === 'dark' ? { backgroundColor: '#0d0c0e' } : undefined}
            >
              <Header />
              <Navbar />
              <div 
                className="pt-6 transition-all duration-300"
                style={{ 
                  marginTop: '80px',
                  marginLeft: isMobile 
                    ? '0' 
                    : (isMinimized ? '48px' : '208px'),
                  marginRight: '0',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  minHeight: 'calc(100vh - 80px)'
                }}
              >
                <Routes>
                  {/* main routes */}
                  <Route path="/" element={<Outbox />} />
                  <Route path="/inbox" element={<Inbox />} />
                  <Route path="/personal-group" element={<PersonalGroup />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/office-with-overdue" element={<OfficeWithOverdue />} />
                  {/* reference tables routes */}
                  <Route path="/reference-tables/action-required" element={<ActionRequired />} />
                  <Route path="/reference-tables/action-officer" element={<ActionOfficer />} />
                  <Route path="/reference-tables/action-taken" element={<ActionTaken />} />
                  <Route path="/reference-tables/document-type" element={<DocumentType />} />
                  <Route path="/reference-tables/document-action-required-days" element={<DocumentActionRequiredDays />} />
                  <Route path="/reference-tables/office" element={<Office />} />
                  <Route path="/reference-tables/region" element={<Region />} />
                  <Route path="/reference-tables/user-levels" element={<UserLevels />} />
                  {/* reports routes */}
                  <Route path="/reports/document-by-releasing-officer" element={<DocumentByReleasingOfficer />} />
                  <Route path="/reports/document-by-date-and-time" element={<DocumentByDateAndTime />} />
                  <Route path="/reports/document-by-control-no" element={<DocumentByControlNo />} />
                  <Route path="/reports/document-by-subject" element={<DocumentBySubject />} />
                  <Route path="/reports/document-by-office" element={<DocumentByOffice />} />
                  <Route path="/reports/document-by-office-control-no" element={<DocumentByOfficeControlNo />} />
                  <Route path="/reports/document-by-action-officer" element={<DocumentByActionOfficer />} />
                  <Route path="/reports/overdue-report" element={<OverdueReport />} />
                  <Route path="/reports/audit-trail" element={<AuditTrail />} />
                </Routes>
              </div>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

function App() {
  return <AppContent />
}

export default App

