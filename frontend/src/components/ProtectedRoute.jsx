import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ role }) {
  const { isAuthed, role: currentRole } = useAuth()

  if (!isAuthed) return <Navigate to="/get-started" replace />
  if (role && currentRole !== role) return <Navigate to="/get-started" replace />

  return <Outlet />
}

