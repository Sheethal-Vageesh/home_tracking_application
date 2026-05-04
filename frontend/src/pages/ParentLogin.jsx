import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Button, Card, Container, Input } from '../components/ui'
import { useAuth } from '../context/AuthContext'

export function ParentLogin() {
  const nav = useNavigate()
  const { loginAsParent } = useAuth()
  const [childId, setChildId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await loginAsParent({ childId: childId.trim().toUpperCase() })
      nav('/parent/dashboard', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AppShell>
      <Container>
        <div className="mx-auto max-w-xl">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Parent login</h2>
          <p className="mt-2 text-sm text-slate-600">
            Enter the unique Child ID assigned by your clinician after they accept your request.
          </p>

          <Card className="mt-5">
            <form onSubmit={onSubmit} className="grid gap-3">
              <Input label="Child ID" value={childId} onChange={(e) => setChildId(e.target.value)} placeholder="e.g., 7K3Q9P2A" />
              {error ? <div className="text-sm font-medium text-red-700">{error}</div> : null}
              <Button disabled={busy || !childId.trim()}>{busy ? 'Logging in…' : 'Login'}</Button>
            </form>
          </Card>
        </div>
      </Container>
    </AppShell>
  )
}

