import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Skeleton } from '../../components/ui'
import { api } from '../../lib/api'
import { AnimatePresence, motion } from 'framer-motion'

export function ChildrenPage() {
  const nav = useNavigate()
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteState, setDeleteState] = useState({ open: false, step: 1, child: null, busy: false })

  async function refresh() {
    setError(null)
    setLoading(true)
    try {
      const { data } = await api.get('/api/clinicians/children')
      setChildren(data.children || [])
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load children')
    } finally {
      setLoading(false)
    }
  }

  function openDelete(child) {
    setDeleteState({ open: true, step: 1, child, busy: false })
  }

  async function confirmDelete() {
    if (!deleteState.child) return
    if (deleteState.step === 1) {
      setDeleteState((s) => ({ ...s, step: 2 }))
      return
    }
    setDeleteState((s) => ({ ...s, busy: true }))
    try {
      await api.delete(`/api/clinicians/children/${deleteState.child.id}`)
      setDeleteState({ open: false, step: 1, child: null, busy: false })
      await refresh()
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete child')
      setDeleteState((s) => ({ ...s, busy: false, open: false }))
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Children</h2>
          <p className="mt-1 text-sm text-slate-600">Accepted children linked to your clinician account.</p>
        </div>
        <Button variant="secondary" onClick={refresh}>
          Refresh
        </Button>
      </div>

      {error ? <div className="mt-4 text-sm font-medium text-red-700">{error}</div> : null}

      <div className="mt-5">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
        ) : null}
        {!loading && children.length === 0 ? (
          <Card className="text-sm text-slate-600">
            No children yet. Accept a request to add a child.
          </Card>
        ) : null}

        {!loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((c, idx) => (
              <motion.div
                key={c.id}
                className="text-left"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut', delay: Math.min(0.08 * idx, 0.3) }}
              >
              <Card className="h-full hover:border-slate-300">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Child</div>
                <div className="mt-2 text-sm text-slate-900">
                  <div className="font-semibold">{c.childName}</div>
                  <div className="text-slate-600">Age: {c.childAge}</div>
                </div>
                <div className="mt-4 text-xs text-slate-600">
                  <div>
                    Child ID: <span className="font-mono font-semibold text-slate-900">{c.childId}</span>
                  </div>
                  <div className="mt-2">
                    Parent: <span className="font-semibold text-slate-800">{c.parentName}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button className="w-full" onClick={() => nav(`/clinician/children/${c.id}`)}>
                    Open
                  </Button>
                  <Button variant="secondary" className="w-full" onClick={() => openDelete(c)}>
                    Delete
                  </Button>
                </div>
              </Card>
              </motion.div>
            ))}
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {deleteState.open ? (
          <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteState({ open: false, step: 1, child: null, busy: false })}
            />
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-[var(--fp-shadow)] backdrop-blur"
            >
              <div className="text-sm font-extrabold text-slate-900">Delete child</div>
              <div className="mt-2 text-sm text-slate-700">
                Are you sure you want to delete{' '}
                <span className="font-semibold">{deleteState.child?.childName}</span> (ID{' '}
                <span className="font-mono font-semibold">{deleteState.child?.childId}</span>)?
              </div>
              <div className="mt-2 text-xs text-slate-500">
                This will remove the child, assigned strategies, and progress submissions from the application.
              </div>

              {deleteState.step === 2 ? (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  Final confirmation: click <span className="font-semibold">Delete permanently</span>.
                </div>
              ) : null}

              <div className="mt-4 flex gap-2">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setDeleteState({ open: false, step: 1, child: null, busy: false })}
                >
                  Cancel
                </Button>
                <Button className="w-full" onClick={confirmDelete} disabled={deleteState.busy}>
                  {deleteState.busy ? 'Deleting…' : deleteState.step === 1 ? 'Yes, continue' : 'Delete permanently'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

