import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../../components/AppShell'
import { Button, Card, Container, Input } from '../../components/ui'
import { api } from '../../lib/api'

function toSeconds({ h, m, s }) {
  const hh = Math.max(0, Number(h) || 0)
  const mm = Math.max(0, Number(m) || 0)
  const ss = Math.max(0, Number(s) || 0)
  return hh * 3600 + mm * 60 + ss
}

export function ParentStrategyPage() {
  const nav = useNavigate()
  const { assignmentId } = useParams()

  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [msg, setMsg] = useState(null)

  const [assignment, setAssignment] = useState(null)

  const [rating, setRating] = useState(3)
  const [dur, setDur] = useState({ h: '0', m: '0', s: '0' })
  const durationSeconds = useMemo(() => toSeconds(dur), [dur])
  const [practiceVideo, setPracticeVideo] = useState(null)

  async function load() {
    setError(null)
    setMsg(null)
    setLoading(true)
    try {
      const { data } = await api.get(`/api/parents/assignments/${assignmentId}`)
      setAssignment(data.assignment)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load strategy')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [assignmentId])

  async function submit() {
    setBusy(true)
    setError(null)
    setMsg(null)
    try {
      const form = new FormData()
      form.append('rating', String(rating))
      form.append('durationSeconds', String(durationSeconds))
      if (practiceVideo) form.append('practiceVideo', practiceVideo)
      await api.post(`/api/parents/assignments/${assignmentId}/progress`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setMsg('Submitted. Clinician has been notified via the dashboard progress list.')
      setPracticeVideo(null)
      setTimeout(() => nav('/parent/dashboard/completed'), 600)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to submit progress')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AppShell>
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Strategy</h2>
              <p className="mt-2 text-sm text-slate-600">Watch the demo, practice, then submit your progress.</p>
            </div>
            <Button variant="secondary" onClick={() => nav('/parent/dashboard/assigned')}>
              Back
            </Button>
          </div>

          {error ? <div className="mt-4 text-sm font-medium text-red-700">{error}</div> : null}
          {msg ? <div className="mt-4 text-sm font-medium text-emerald-700">{msg}</div> : null}

          <Card className="mt-5">
            {loading ? (
              <div className="text-sm text-slate-600">Loading…</div>
            ) : assignment?.strategy ? (
              <>
                <div className="text-sm font-semibold text-slate-900">{assignment.strategy.title}</div>
                {assignment.strategy.demoVideoUrl ? (
                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Demo video</div>
                    <video className="mt-2 w-full rounded-xl border border-slate-200 bg-black" controls>
                      <source src={assignment.strategy.demoVideoUrl} />
                    </video>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-slate-600">No demo video provided by clinician.</div>
                )}

                <div className="mt-6 grid gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Rating (1–5)</div>
                    <div className="mt-2 flex gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRating(n)}
                          className={`h-10 w-10 rounded-xl border text-sm font-semibold ${
                            rating === n ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-800'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-slate-900">Duration practiced</div>
                    <div className="mt-2 grid gap-3 sm:grid-cols-3">
                      <Input label="Hours" value={dur.h} onChange={(e) => setDur((p) => ({ ...p, h: e.target.value }))} />
                      <Input label="Minutes" value={dur.m} onChange={(e) => setDur((p) => ({ ...p, m: e.target.value }))} />
                      <Input label="Seconds" value={dur.s} onChange={(e) => setDur((p) => ({ ...p, s: e.target.value }))} />
                    </div>
                    <div className="mt-1 text-xs text-slate-500">Total seconds: {durationSeconds}</div>
                  </div>

                  <label className="block">
                    <div className="mb-1 text-sm font-semibold text-slate-900">Practice video (optional)</div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setPracticeVideo(e.target.files?.[0] || null)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                    <div className="mt-1 text-xs text-slate-500">Optional video for clinician reference.</div>
                  </label>

                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button variant="secondary" onClick={() => nav('/parent/dashboard/assigned')}>
                      Back
                    </Button>
                    <Button disabled={busy} onClick={submit}>
                      {busy ? 'Submitting…' : 'Submit'}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-600">Not found.</div>
            )}
          </Card>
        </div>
      </Container>
    </AppShell>
  )
}

