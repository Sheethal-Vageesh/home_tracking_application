import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, setAuthToken } from '../lib/api'
import { clearAuth, loadAuth, saveAuth } from '../lib/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => loadAuth())

  useEffect(() => {
    setAuthToken(auth?.token)
  }, [auth?.token])

  const value = useMemo(() => {
    return {
      auth,
      isAuthed: Boolean(auth?.token),
      role: auth?.role || null,
      loginAsClinician: async ({ email, password }) => {
        const { data } = await api.post('/api/auth/clinician/login', { email, password })
        const next = { token: data.token, role: 'clinician' }
        setAuth(next)
        saveAuth(next)
        return data
      },
      registerClinician: async (payload) => {
        const { data } = await api.post('/api/auth/clinician/register', payload)
        const next = { token: data.token, role: 'clinician' }
        setAuth(next)
        saveAuth(next)
        return data
      },
      loginAsParent: async ({ childId }) => {
        const { data } = await api.post('/api/auth/parent/login', { childId })
        const next = { token: data.token, role: 'parent' }
        setAuth(next)
        saveAuth(next)
        return data
      },
      logout: () => {
        setAuth(null)
        clearAuth()
        setAuthToken(null)
      },
    }
  }, [auth])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

