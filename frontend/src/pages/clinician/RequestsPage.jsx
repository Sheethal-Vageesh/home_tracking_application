import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Input, Skeleton } from '../../components/ui'
import { api } from '../../lib/api'

export function RequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)
  const [acceptedMsg, setAcceptedMsg] = useState(null)
  const [childIds, setChildIds] = useState({})

  const alphabet = useMemo(() => '23456789ABCDEFGHJKLMNPQRSTUVWXYZ', [])

  function generateChildId() {
    let out = ''
    for (let i = 0; i < 8; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)]
    return out
  }

  async function refresh() {
    setError(null)
    setAcceptedMsg(null)
    setLoading(true)
    try {
      const { data } = await api.get('/api/clinicians/requests')
      setRequests(data.requests || [])
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function accept(requestId) {
    setBusyId(requestId)
    setError(null)
    setAcceptedMsg(null)
    try {
      const childId = (childIds[requestId] || '').trim().toUpperCase()
      if (!childId) {
        setError('Please assign a Child ID before accepting.')
        return
      }
      const { data } = await api.post('/api/clinicians/requests/accept', { requestId, childId })
      setAcceptedMsg(
        `Accepted. Child ID: ${data.childId}. SMS to parent: ${data.smsDelivered ? 'sent' : 'not sent (check SMS config)'}.`,
      )
      await refresh()
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to accept request')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Requests</h2>
          <p className="mt-1 text-sm text-slate-600">Review parent requests and accept them by assigning a Child ID.</p>
        </div>
        <Button variant="secondary" onClick={refresh}>
          Refresh
        </Button>
      </div>

      {/* {error ? <div className="mt-4 text-sm font-medium text-red-700">{error}</div> : null} */}
      {acceptedMsg ? <div className="mt-4 text-sm font-medium text-emerald-700">{acceptedMsg}</div> : null}

      <Card className="mt-5">
        <div className="text-xs text-slate-500">Pending: {requests.length}</div>
        <div className="mt-4 grid gap-3">
          {loading ? (
            <div className="grid gap-3">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No pending requests right now.
            </div>
          ) : (
            requests.map((r) => (
              <div key={r.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="text-sm text-slate-800">
                    <div className="font-semibold">
                      {r.childName} (age {r.childAge})
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      Parent: {r.parentName} • {r.email} • {r.phone}
                    </div>

                    <div className="mt-3 grid gap-2 sm:max-w-md sm:grid-cols-[1fr_auto] sm:items-end">
                      <Input
                        label="Assign Child ID"
                        value={childIds[r.id] || ''}
                        onChange={(e) => setChildIds((s) => ({ ...s, [r.id]: e.target.value }))}
                        placeholder="e.g., 7K3Q9P2A"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setChildIds((s) => ({ ...s, [r.id]: generateChildId() }))}
                      >
                        Generate
                      </Button>
                    </div>
                  </div>

                  <div className="sm:pt-1">
                    <Button disabled={busyId === r.id} onClick={() => accept(r.id)} className="w-full sm:w-auto">
                      {busyId === r.id ? 'Accepting…' : 'Accept'}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}

