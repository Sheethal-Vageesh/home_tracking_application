import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Button } from '../../components/ui'
import { api } from '../../lib/api'
import { motion } from 'framer-motion'

export function SessionStrategiesPage() {
  const { sessionNumber } = useParams()
  const nav = useNavigate()

  const [assignments, setAssignments] = useState([])
  const [submittedIds, setSubmittedIds] = useState([])
  const [sessionSubmitted, setSessionSubmitted] = useState(false)

  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      try {
        const { data } = await api.get(
          `/api/parents/session/${sessionNumber}`
        )

        setAssignments(data.assignments || [])

        const submitted = (data.submissions || []).map(
          (s) => s.assignmentId
        )

        setSubmittedIds(submitted)
        setSessionSubmitted(data.sessionSubmitted || false)

      } catch (err) {
        setError(
          err?.response?.data?.error ||
          'Failed to load session data'
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [sessionNumber])

  async function submitSession() {
    try {
      setBusy(true)
      setError(null)

      await api.post(
        `/api/parents/session/${sessionNumber}/submit`
      )

      setSessionSubmitted(true)

    } catch (err) {
      setError(
        err?.response?.data?.error ||
        'Failed to submit session'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flex items-end justify-between gap-3">
  
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            Session {sessionNumber} / ಸೆಷನ್ {sessionNumber}
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Practice all assigned strategies and submit progress.
            <br />
            ನೀಡಲಾದ ಎಲ್ಲಾ ತಂತ್ರಗಳನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿ ಮತ್ತು ಪ್ರಗತಿಯನ್ನು ಸಲ್ಲಿಸಿ.
          </p>

          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-slate-600">
                Completed / ಪೂರ್ಣಗೊಂಡಿದೆ
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-slate-600">
                Not Practiced / ಅಭ್ಯಾಸ ಮಾಡಿಲ್ಲ
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={() => nav('/parent/dashboard/practice')}
        >
          Back / ಹಿಂದೆ
        </Button>
      </div>

      {/* {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )} */}

      <Card className="mt-5">

        {loading ? (
          <div className="text-sm text-slate-600">
            Loading strategies…
          </div>
        ) : assignments.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            No strategies assigned.
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              {assignments.map((a) => {
                const isSubmitted = submittedIds.includes(a.id)

                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <button
                      onClick={() =>
                        nav(
                          `/parent/strategies/${a.id}?session=${sessionNumber}`
                        )
                      }
                      className={`w-full rounded-2xl border p-4 text-left transition hover:shadow-md ${
                        isSubmitted
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                      }`}
                    >
                      <div className="text-sm font-semibold text-slate-900">
                        {a.strategy?.title || 'Strategy'}
                      </div>

                      <div className="mt-2 text-xs">
                        {isSubmitted ? (
                          <span className="font-medium text-green-700">
                            ✔ Practiced / ಅಭ್ಯಾಸ ಮಾಡಲಾಗಿದೆ
                          </span>
                        ) : (
                          <span className="font-medium text-red-700">
                            ✖ Not Practiced / ಅಭ್ಯಾಸ ಮಾಡಿಲ್ಲ
                          </span>
                        )}
                      </div>

                      <div className="mt-3 text-xs text-slate-500">
                        {a.strategy?.demoVideoUrl
                          ? 'Demo video available / ಡೆಮೊ ವೀಡಿಯೊ ಲಭ್ಯವಿದೆ'
                          : 'No demo video / ಡೆಮೊ ವೀಡಿಯೊ ಇಲ್ಲ'}
                      </div>

                      <div className="mt-4 text-xs font-semibold text-indigo-700">
                        Open Strategy / ತಂತ್ರ ತೆರೆಯಿರಿ →
                      </div>
                    </button>
                  </motion.div>
                )
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                disabled={busy || sessionSubmitted}
                onClick={submitSession}
              >
                {sessionSubmitted
                  ? 'Session Submitted / ಸೆಷನ್ ಸಲ್ಲಿಸಲಾಗಿದೆ'
                  : busy
                  ? 'Submitting...'
                  : 'Submit Session / ಸೆಷನ್ ಸಲ್ಲಿಸಿ'}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

// import { useEffect, useState } from 'react'
// import { useNavigate, useParams } from 'react-router-dom'
// import { Card } from '../../components/ui'
// import { api } from '../../lib/api'
// import { motion } from 'framer-motion'

// export function SessionStrategiesPage() {
//   const { sessionNumber } = useParams()
//   const nav = useNavigate()

//   const [assignments, setAssignments] = useState([])
//   const [submittedIds, setSubmittedIds] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

//   useEffect(() => {
//     async function load() {
//       setLoading(true)
//       setError(null)

//       try {
//         const { data } = await api.get(`/api/parents/session/${sessionNumber}`)

//         setAssignments(data.assignments || [])

//         // store submitted assignment IDs
//         const submitted = (data.submissions || []).map(
//           (s) => s.assignmentId
//         )
//         setSubmittedIds(submitted)

//       } catch (err) {
//         setError(err?.response?.data?.error || 'Failed to load session data')
//       } finally {
//         setLoading(false)
//       }
//     }

//     load()
//   }, [sessionNumber])

//   return (
//     <div className="mx-auto w-full max-w-4xl">
//       <div className="flex items-end justify-between gap-3">
//         <div>
//           <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
//             Session {sessionNumber}
//           </h2>
//           <p className="mt-1 text-sm text-slate-600">
//             Practice all assigned strategies. Green = completed, Red = not practiced.
//           </p>
//         </div>
//       </div>

//       {error && (
//         <div className="mt-4 text-sm font-medium text-red-700">
//           {error}
//         </div>
//       )}

//       <Card className="mt-5">
//         {loading ? (
//           <div className="text-sm text-slate-600">Loading strategies…</div>
//         ) : assignments.length === 0 ? (
//           <div className="text-sm text-slate-600">
//             No strategies assigned.
//           </div>
//         ) : (
//           <div className="grid gap-3 sm:grid-cols-2">
//             {assignments.map((a) => {
//               const isSubmitted = submittedIds.includes(a.id)

//               return (
//                 <motion.div
//                   key={a.id}
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.25 }}
//                 >
//                   <button
//                     onClick={() =>
//                       nav(`/parent/strategies/${a.id}?session=${sessionNumber}`)
//                     }
//                     className={`w-full rounded-2xl border p-4 text-left transition ${
//                       isSubmitted
//                         ? 'border-green-500 bg-green-50'
//                         : 'border-red-500 bg-red-50'
//                     }`}
//                   >
//                     <div className="text-sm font-semibold text-slate-900">
//                       {a.strategy?.title || 'Strategy'}
//                     </div>

//                     <div className="mt-1 text-xs">
//                       {isSubmitted ? (
//                         <span className="text-green-700 font-medium">
//                           ✔ Practiced
//                         </span>
//                       ) : (
//                         <span className="text-red-700 font-medium">
//                           ✖ Not practiced
//                         </span>
//                       )}
//                     </div>

//                     <div className="mt-2 text-xs text-slate-500">
//                       {a.strategy?.demoVideoUrl
//                         ? 'Demo video available'
//                         : 'No demo video'}
//                     </div>
//                   </button>
//                 </motion.div>
//               )
//             })}
//           </div>
//         )}
//       </Card>
//     </div>
//   )
// }

