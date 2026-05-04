import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Home } from './pages/Home'
import { GetStarted } from './pages/GetStarted'
import { ClinicianAuth } from './pages/ClinicianAuth'
import { ParentRequest } from './pages/ParentRequest'
import { ParentLogin } from './pages/ParentLogin'
import { ClinicianLayout } from './pages/clinician/ClinicianLayout'
import { RequestsPage } from './pages/clinician/RequestsPage'
import { ChildrenPage } from './pages/clinician/ChildrenPage'
import { StrategiesPage } from './pages/clinician/StrategiesPage'
import { ClinicianChildPage } from './pages/clinician/ClinicianChildPage'
import { ParentStrategyPage } from './pages/parent/ParentStrategyPage'
import { ParentLayout } from './pages/parent/ParentLayout'
import { AssignedStrategiesPage } from './pages/parent/AssignedStrategiesPage'
import { CompletedStrategiesPage } from './pages/parent/CompletedStrategiesPage'
import { ParentMessagesPage } from './pages/parent/ParentMessagesPage'
import { PracticeSessionsPage } from   './pages/parent/PracticeSessionPage'

export default function App() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/get-started" element={<GetStarted />} />

          <Route path="/clinician/auth" element={<ClinicianAuth />} />
          <Route element={<ProtectedRoute role="clinician" />}>
            <Route path="/clinician/dashboard" element={<ClinicianLayout />}>
              <Route index element={<Navigate to="/clinician/dashboard/requests" replace />} />
              <Route path="requests" element={<RequestsPage />} />
              <Route path="children" element={<ChildrenPage />} />
              <Route path="strategies" element={<StrategiesPage />} />
            </Route>
            <Route path="/clinician/children/:childId" element={<ClinicianChildPage />} />
          </Route>

          <Route path="/parent/request" element={<ParentRequest />} />
          <Route path="/parent/login" element={<ParentLogin />} />
          <Route element={<ProtectedRoute role="parent" />}>
            <Route path="/parent/dashboard" element={<ParentLayout />}>
              <Route index element={<Navigate to="/parent/dashboard/assigned" replace />} />
              <Route path="assigned" element={<AssignedStrategiesPage />} />
              <Route path="completed" element={<CompletedStrategiesPage />} />
              <Route path="messages" element={<ParentMessagesPage />} />
              <Route path="practice" element={<PracticeSessionsPage />} />
            </Route>
            <Route path="/parent/strategies/:assignmentId" element={<ParentStrategyPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}
