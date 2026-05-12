import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui'
import { api } from '../../lib/api'

function SessionCard({ session, completed, locked, onClick }) {
  let color = 'bg-slate-100 border-slate-300 text-slate-700'
  let label = 'Available / ಲಭ್ಯವಿದೆ'

  if (completed) {
    color = 'bg-green-500 border-green-600 text-white'
    label = 'Completed / ಪೂರ್ಣಗೊಂಡಿದೆ'
  }

  if (locked) {
    color = 'bg-slate-200 border-slate-300 text-slate-400'
    label = 'Locked / ಲಾಕ್ ಮಾಡಲಾಗಿದೆ'
  }

  return (
    <button
      disabled={locked}
      onClick={onClick}
      className={`rounded-2xl border-2 p-4 text-left shadow-sm transition hover:shadow-md disabled:cursor-not-allowed ${color}`}
    >
      <div className="text-lg font-bold">
        Session {session} / ಸೆಷನ್ {session}
      </div>

      <div className="mt-1 text-xs opacity-90">
        {label}
      </div>
    </button>
  )
}

export function PracticeSessionsPage() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const nav = useNavigate()

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      try {
        const { data } = await api.get('/api/parents/sessions')

        setSessions(data.sessions || [])

      } catch (err) {
        setError(
          err?.response?.data?.error ||
          'Failed to load sessions / ಸೆಷನ್‌ಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ'
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <div className="mx-auto w-full max-w-4xl">

      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
          Practice Sessions / ಅಭ್ಯಾಸ ಸೆಷನ್‌ಗಳು
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          Select a session to practice strategies and submit progress.
          <br />
          ತಂತ್ರಗಳನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿ ಮತ್ತು ಪ್ರಗತಿಯನ್ನು ಸಲ್ಲಿಸಲು ಸೆಷನ್ ಆಯ್ಕೆಮಾಡಿ.
        </p>
      </div>

      {/* {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )} */}

      <Card className="mt-5">
        {loading ? (
          <div className="text-sm text-slate-600">
            Loading sessions… / ಸೆಷನ್‌ಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">

            {sessions.map((session) => (
              <SessionCard
                key={session.sessionNumber}
                session={session.sessionNumber}
                completed={session.submitted}
                locked={session.locked}
                onClick={() => {
                  if (!session.locked) {
                    nav(
                      `/parent/dashboard/session/${session.sessionNumber}`
                    )
                  }
                }}
              />
            ))}

          </div>
        )}
      </Card>
    </div>
  )
}


// import { useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { Card } from '../../components/ui'
// import { api } from '../../lib/api'

// const SESSION_COUNT = 10

// function SessionCard({ session, completed, partial, onClick }) {
//   let color = 'bg-slate-100 border-slate-300 text-slate-700'
//   let label = 'Not started'

//   if (completed && !partial) {
//     color = 'bg-green-500 border-green-600 text-white'
//     label = 'Completed'
//   } else if (partial) {
//     color = 'bg-yellow-400 border-yellow-500 text-white'
//     label = 'Partially done'
//   }

//   return (
//     <button
//       onClick={onClick}
//       className={`rounded-2xl border-2 p-4 text-left shadow-sm transition hover:shadow-md ${color}`}
//     >
//       <div className="text-lg font-bold">Session {session}</div>
//       <div className="mt-1 text-xs opacity-90">{label}</div>
//     </button>
//   )
// }

// export function PracticeSessionsPage() {
//   const [sessions, setSessions] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const nav = useNavigate()

//   useEffect(() => {
//     async function load() {
//       setLoading(true)
//       setError(null)
//       try {
//         const { data } = await api.get('/api/parents/sessions')
//         setSessions(data.sessions || [])
//       } catch (err) {
//         setError(err?.response?.data?.error || 'Failed to load sessions')
//       } finally {
//         setLoading(false)
//       }
//     }
//     load()
//   }, [])

//   return (
//     <div className="mx-auto w-full max-w-4xl">
//       <div>
//         <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
//           Practice Sessions
//         </h2>
//         <p className="mt-1 text-sm text-slate-600">
//           Select a session to practice all assigned strategies and submit your progress.
//         </p>
//       </div>

//       {error && (
//         <div className="mt-4 text-sm font-medium text-red-700">
//           {error}
//         </div>
//       )}

//       <Card className="mt-5">
//         {loading ? (
//           <div className="text-sm text-slate-600">Loading sessions…</div>
//         ) : (
//           <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
//             {Array.from({ length: SESSION_COUNT }, (_, i) => {
//               const sessionNumber = i + 1
//               return (
//                 <SessionCard
//                   key={sessionNumber}
//                   session={sessionNumber}
//                   completed={sessions[i]?.completed}
//                   partial={sessions[i]?.partial}
//                   onClick={() =>
//                     nav(`/parent/dashboard/session/${sessionNumber}`)
//                   }
//                 />
//               )
//             })}
//           </div>
//         )}
//       </Card>
//     </div>
//   )
// }

