import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Container, Button } from './ui'

export function AppShell({ children }) {
  const { isAuthed, role, logout } = useAuth()

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-50 via-slate-50 to-white">
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur">
        <Container className="flex items-center justify-between py-3">
          <Link to="/" className="text-sm font-extrabold tracking-tight text-slate-900">
            FluentPath
          </Link>
          <div className="flex items-center gap-2">
            {isAuthed ? (
              <>
                <span className="hidden rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 sm:inline">
                  {role}
                </span>
                <Button variant="secondary" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <Link className="text-sm font-semibold text-indigo-700" to="/get-started">
                Get started
              </Link>
            )}
          </div>
        </Container>
      </header>
      <main className="py-6">{children}</main>
    </div>
  )
}

