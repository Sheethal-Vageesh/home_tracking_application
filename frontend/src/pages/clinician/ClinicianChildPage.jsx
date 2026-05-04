import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card } from '../../components/ui'
import { api } from '../../lib/api'

function formatDate(d) {
  const dt = new Date(d)
  return Number.isNaN(dt.getTime()) ? '' : dt.toLocaleString()
}

function secondsToHms(seconds) {
  const s = Math.max(0, Number(seconds) || 0)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  return `${h}h ${m}m ${ss}s`
}

export function ClinicianChildPage() {
  const nav = useNavigate()
  const { childId } = useParams()
  const [child, setChild] = useState(null)
  const [strategies, setStrategies] = useState([])
  const [assigned, setAssigned] = useState([])
  const [checked, setChecked] = useState({})
  const [submissions, setSubmissions] = useState([])

  const [tab, setTab] = useState('assign') // assign | progress | messages
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [msg, setMsg] = useState(null)

  const assignedIds = useMemo(() => new Set(assigned.map((a) => a?.strategy?.id).filter(Boolean)), [assigned])

  async function loadAll() {
    setError(null)
    setMsg(null)
    setLoading(true)
    try {
      const [c, s, a, p] = await Promise.all([
        api.get(`/api/clinicians/children/${childId}`),
        api.get('/api/clinicians/strategies'),
        api.get(`/api/clinicians/children/${childId}/assignments`),
        api.get(`/api/clinicians/children/${childId}/progress`),
      ])
      setChild(c.data.child)
      setStrategies(s.data.strategies || [])
      setAssigned(a.data.assignments || [])
      setSubmissions(p.data.submissions || [])

      const initial = {}
      ;(a.data.assignments || []).forEach((x) => {
        if (x?.strategy?.id) initial[x.strategy.id] = true
      })
      setChecked(initial)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load child')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [childId])

  async function saveAssignments() {
    setBusy(true)
    setError(null)
    setMsg(null)
    try {
      const strategyIds = Object.entries(checked)
        .filter(([, v]) => v)
        .map(([k]) => k)
      await api.post(`/api/clinicians/children/${childId}/assignments`, { strategyIds })
      setMsg('Assigned strategies updated.')
      await loadAll()
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save assignments')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Child</h2>
          <p className="mt-1 text-sm text-slate-600">Assign strategies or review parent progress submissions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => nav('/clinician/dashboard/children')}>
            Back
          </Button>
          <Button variant="secondary" onClick={loadAll}>
            Refresh
          </Button>
        </div>
      </div>

      {error ? <div className="mt-4 text-sm font-medium text-red-700">{error}</div> : null}
      {msg ? <div className="mt-4 text-sm font-medium text-emerald-700">{msg}</div> : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-[22rem_1fr]">
        <Card>
          {loading ? (
            <div className="text-sm text-slate-600">Loading…</div>
          ) : child ? (
            <div className="space-y-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Child</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{child.childName}</div>
                <div className="text-sm text-slate-600">Age: {child.childAge}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Child ID</div>
                <div className="mt-1 font-mono text-sm font-semibold text-slate-900">{child.childId}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Parent</div>
                <div className="mt-1 text-sm text-slate-800">{child.parentName}</div>
                <div className="text-xs text-slate-600">{child.email}</div>
                <div className="text-xs text-slate-600">{child.phone}</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-600">Not found.</div>
          )}
        </Card>

        <div className="min-w-0">
          <div className="flex gap-2">
            <Button variant={tab === 'assign' ? 'primary' : 'secondary'} onClick={() => setTab('assign')}>
              Assign strategies
            </Button>
            <Button variant={tab === 'progress' ? 'primary' : 'secondary'} onClick={() => setTab('progress')}>
              Check progress
            </Button>
            <Button variant={tab === 'messages' ? 'primary' : 'secondary'} onClick={() => setTab('messages')}>
              Messages
            </Button>
          </div>

          {tab === 'assign' ? (
            <Card className="mt-4">
              <div className="text-sm font-semibold text-slate-900">Available strategies</div>
              <div className="mt-1 text-xs text-slate-500">
                Check strategies to assign. Assigned strategies are stored with the assignment date.
              </div>

              <div className="mt-4 grid gap-3">
                {loading ? (
                  <div className="text-sm text-slate-600">Loading…</div>
                ) : strategies.length === 0 ? (
                  <div className="text-sm text-slate-600">No strategies yet. Create them in the Strategies section.</div>
                ) : (
                  strategies.map((s) => (
                    <label key={s.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4"
                        checked={Boolean(checked[s.id])}
                        onChange={(e) => setChecked((prev) => ({ ...prev, [s.id]: e.target.checked }))}
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900">{s.title}</div>
                        {s.demoVideoUrl ? <div className="text-xs text-slate-600">Demo video attached</div> : null}
                        {assignedIds.has(s.id) ? (
                          <div className="mt-1 text-xs font-medium text-emerald-700">Currently assigned</div>
                        ) : null}
                      </div>
                    </label>
                  ))
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <Button disabled={busy} onClick={saveAssignments}>
                  {busy ? 'Saving…' : 'Save assignments'}
                </Button>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-4">
                <div className="text-sm font-semibold text-slate-900">Assigned (with date)</div>
                <div className="mt-3 grid gap-2">
                  {assigned.length === 0 ? (
                    <div className="text-sm text-slate-600">No assigned strategies yet.</div>
                  ) : (
                    assigned.map((a) => (
                      <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="text-sm font-semibold text-slate-900">{a.strategy?.title || '—'}</div>
                        <div className="mt-1 text-xs text-slate-600">Assigned: {formatDate(a.assignedAt)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          ) : tab === 'progress' ? (
            <Card className="mt-4">
              <div className="text-sm font-semibold text-slate-900">Progress submissions</div>
              <div className="mt-1 text-xs text-slate-500">Submissions sent by the parent after practice.</div>

              {!loading ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned</div>
                    <div className="mt-1 text-lg font-extrabold text-slate-900">{(assigned.length) + new Set(submissions.map((x) => x?.strategy?.id).filter(Boolean)).size}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completed</div>
                    <div className="mt-1 text-lg font-extrabold text-slate-900">
                      {new Set(submissions.map((x) => x?.strategy?.id).filter(Boolean)).size}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completion</div>
                    <div className="mt-1 text-lg font-extrabold text-slate-900">
                      {assigned.length === 0
                        ? new Set(submissions.map((x) => x?.strategy?.id).filter(Boolean)).size === 0 ? '0%' : '100%'
                        : `${Math.round(
                            (new Set(submissions.map((x) => x?.strategy?.id).filter(Boolean)).size / (assigned.length + new Set(submissions.map((x) => x?.strategy?.id).filter(Boolean)).size)) * 100,
                          )}%`}
                    </div>
                  </div>
                </div>
              ) : null}

              {!loading ? (
                <div className="mt-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date-wise submissions</div>
                  <DateWiseBars submissions={submissions} />
                </div>
              ) : null}

              <div className="mt-4 grid gap-3">
                {loading ? (
                  <div className="text-sm text-slate-600">Loading…</div>
                ) : submissions.length === 0 ? (
                  <div className="text-sm text-slate-600">No progress submissions yet.</div>
                ) : (
                  submissions.map((s) => (
                    <div key={s.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-sm font-semibold text-slate-900">{s.strategy?.title || 'Strategy'}</div>
                      <div className="mt-1 text-xs text-slate-600">Submitted: {formatDate(s.submittedAt)}</div>
                      <div className="mt-3 grid gap-2 text-sm text-slate-800 sm:grid-cols-2">
                        <div>
                          Rating: <span className="font-semibold">{s.rating}/5</span>
                        </div>
                        <div>
                          Duration: <span className="font-semibold">{secondsToHms(s.durationSeconds)}</span>
                        </div>
                      </div>
                      {s.practiceVideoUrl ? (
                        <div className="mt-3">
                          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Practice video</div>
                          <video className="mt-2 w-full max-w-xl rounded-xl border border-slate-200 bg-black" controls>
                            <source src={s.practiceVideoUrl} />
                          </video>
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </Card>
          ) : (
            <MessagesPanel childId={childId} />
          )}
        </div>
      </div>
    </div>
  )
}

function DateWiseBars({ submissions }) {
  const byDay = new Map()
  for (const s of submissions) {
    const d = new Date(s.submittedAt)
    if (Number.isNaN(d.getTime())) continue
    const key = d.toISOString().slice(0, 10)
    byDay.set(key, (byDay.get(key) || 0) + 1)
  }
  const rows = Array.from(byDay.entries()).sort((a, b) => (a[0] < b[0] ? -1 : 1))
  const max = Math.max(1, ...rows.map(([, v]) => v))

  if (rows.length === 0) {
    return <div className="mt-2 text-sm text-slate-600">No submissions yet.</div>
  }

  return (
    <div className="mt-2 grid gap-2">
      {rows.slice(-10).map(([day, count]) => (
        <div key={day} className="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-3">
          <div className="text-xs text-slate-600">{day}</div>
          <div className="h-3 rounded-full bg-slate-100">
            <div
              className="h-3 rounded-full bg-indigo-600"
              style={{ width: `${Math.max(6, Math.round((count / max) * 100))}%` }}
            />
          </div>
          <div className="text-right text-xs font-semibold text-slate-700">{count}</div>
        </div>
      ))}
      <div className="text-[11px] text-slate-500">Showing last 10 days with submissions.</div>
    </div>
  )
}

function MessagesPanel({ childId }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function load() {
    setError(null)
    setLoading(true)
    try {
      const { data } = await api.get(`/api/clinicians/children/${childId}/messages`)
      setMessages(data.messages || [])
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [childId])

  async function send() {
    const trimmed = text.trim()
    if (!trimmed) return
    setBusy(true)
    setError(null)
    try {
      const { data } = await api.post(`/api/clinicians/children/${childId}/messages`, { text: trimmed })
      setMessages((m) => [...m, data.message])
      setText('')
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to send message')
    } finally {
      setBusy(false)
    }
  }

  function formatTime(d) {
    const dt = new Date(d)
    return Number.isNaN(dt.getTime()) ? '' : dt.toLocaleString()
  }

  return (
    <Card className="mt-4">
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-slate-900">Notification from parent</div>
          <div className="mt-1 text-xs text-slate-500">This appears in the parent dashboard under “Notifications from clinician”.</div>
        </div>
        <Button variant="secondary" onClick={load}>
          Refresh
        </Button>
      </div>

      {error ? <div className="mt-3 text-sm font-medium text-red-700">{error}</div> : null}

      <div className="mt-4 max-h-[45vh] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
        {loading ? <div className="text-sm text-slate-600">Loading…</div> : null}
        {!loading && messages.length === 0 ? <div className="text-sm text-slate-600">No messages yet.</div> : null}

        <div className="grid gap-2">
          {messages.map((m) => {
            const mine = m.senderRole === 'clinician'
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${mine ? 'bg-indigo-600 text-white' : 'bg-white text-slate-900 border border-slate-200'}`}>
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  <div className={`mt-1 text-[11px] ${mine ? 'text-indigo-100' : 'text-slate-500'}`}>{formatTime(m.createdAt)}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm font-semibold text-slate-900">Notify parent</div>
        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-200 focus:ring-4"
            placeholder="Type a message to the parent…"
          />
          <Button disabled={busy} onClick={send} className="h-fit">
            {busy ? 'Sending…' : 'Send'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

