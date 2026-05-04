import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Skeleton } from '../../components/ui'
import { api } from '../../lib/api'
import { motion } from 'framer-motion'

export function CompletedStrategiesPage() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    setError(null)
    setLoading(true)
    try {
      const { data } = await api.get('/api/parents/assignments/completed')
      setAssignments(data.assignments || [])
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load completed strategies')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Completed strategies</h2>
          <p className="mt-1 text-sm text-slate-600">Strategies you already submitted.</p>
        </div>
        <Button variant="secondary" onClick={load}>
          Refresh
        </Button>
      </div>

      {error ? <div className="mt-4 text-sm font-medium text-red-700">{error}</div> : null}

      <Card className="mt-5">
        <div className="text-xs text-slate-500">Total: {assignments.length}</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {loading ? (
            <>
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </>
          ) : assignments.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No completed strategies yet. After you submit a strategy practice, it will appear here.
            </div>
          ) : (
            assignments.map((a) => (
              <Link key={a.id} to={`/parent/strategies/${a.id}`} className="block">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
                >
                  <div className="text-sm font-semibold text-slate-900">{a.strategy?.title || 'Strategy'}</div>
                  <div className="mt-1 text-xs text-slate-600">
                    Completed: {a.completedAt ? new Date(a.completedAt).toLocaleDateString() : '—'}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">Assigned: {new Date(a.assignedAt).toLocaleDateString()}</div>
                </motion.div>
              </Link>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}

