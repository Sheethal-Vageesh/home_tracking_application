import { NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { AppShell } from '../../components/AppShell'
import { Button, Container } from '../../components/ui'
import { api } from '../../lib/api'

function SideLink({ to, children }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        clsx(
          'block rounded-xl px-3 py-2 text-sm font-semibold transition focus-visible:fp-focus',
          isActive
            ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-sm'
            : 'text-slate-700 hover:bg-white hover:shadow-sm',
        )
      }
    >
      {children}
    </NavLink>
  )
}

export function ClinicianLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [clinicianName, setClinicianName] = useState('')

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const { data } = await api.get('/api/clinicians/me')
        if (mounted) setClinicianName(data?.clinician?.name || '')
      } catch {
        if (mounted) setClinicianName('')
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const Sidebar = (
    <div className="h-full w-72 border-r border-slate-200/60 bg-white/70 p-4 backdrop-blur">
      <div className="text-sm font-extrabold tracking-tight text-slate-900">Clinician</div>
      <div className="mt-1 text-xs text-slate-500">{clinicianName || 'Dashboard'}</div>
      <nav className="mt-4 grid gap-1">
        <SideLink to="/clinician/dashboard/requests">Requests</SideLink>
        <SideLink to="/clinician/dashboard/children">Children</SideLink>
        <SideLink to="/clinician/dashboard/strategies">Strategies</SideLink>
      </nav>
      <div className="mt-4 rounded-xl border border-slate-200/60 bg-white/70 p-3 text-xs text-slate-600">
        Tip: Start with <span className="font-semibold text-slate-900">Requests</span> to accept parents and assign Child
        IDs.
      </div>
    </div>
  )

  return (
    <AppShell>
      <Container className="lg:px-0">
        <div className="mb-4 flex items-center justify-between gap-2 lg:hidden">
          <div>
            <div className="text-sm font-extrabold tracking-tight text-slate-900">Clinician dashboard</div>
            <div className="text-xs text-slate-500">{clinicianName || '—'}</div>
          </div>
          <Button variant="secondary" onClick={() => setMobileOpen(true)}>
            Menu
          </Button>
        </div>

        <div className="grid lg:grid-cols-[18rem_1fr]">
          <div className="hidden lg:block">{Sidebar}</div>
          <div className="min-w-0 p-0 lg:p-6">
            <Outlet />
          </div>
        </div>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 h-full">
              <div className="h-full w-80 max-w-[85vw]">
                <div className="flex items-center justify-end border-b border-slate-200 bg-white p-3">
                  <Button variant="secondary" onClick={() => setMobileOpen(false)}>
                    Close
                  </Button>
                </div>
                <div onClick={() => setMobileOpen(false)}>{Sidebar}</div>
              </div>
            </div>
          </div>
        ) : null}
      </Container>
    </AppShell>
  )
}

