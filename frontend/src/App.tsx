import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Navbar from './components/Navbar'

// main navbar item stuff
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
import Calendar from './pages/reference-tables/Calendar'
import Office from './pages/reference-tables/Office'
import Region from './pages/reference-tables/Region'
import UserLevels from './pages/reference-tables/UserLevels'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Navbar />
        <div className="ml-64 pt-20">
          <Routes>
            {/* main navbar item stuff */}
            <Route path="/" element={<Outbox />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/personal-group" element={<PersonalGroup />} />
            <Route path="/reports" element={<Reports />} />

            {/* reference tables stuff */}
            <Route path="/reference-tables/action-required" element={<ActionRequired />} />
            <Route path="/reference-tables/action-officer" element={<ActionOfficer />} />
            <Route path="/reference-tables/action-taken" element={<ActionTaken />} />
            <Route path="/reference-tables/document-type" element={<DocumentType />} />
            <Route path="/reference-tables/document-action-required-days" element={<DocumentActionRequiredDays />} />
            <Route path="/reference-tables/calendar" element={<Calendar />} />
            <Route path="/reference-tables/office" element={<Office />} />
            <Route path="/reference-tables/region" element={<Region />} />
            <Route path="/reference-tables/user-levels" element={<UserLevels />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App

