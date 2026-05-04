import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../../components/ui';
import { api } from '../../lib/api';

const SESSION_COUNT = 10;

function SessionMarker({ session, completed, partial, onClick }) {
  let color = 'bg-slate-200 border-slate-300 text-slate-700';
  if (completed) color = 'bg-green-500 border-green-600 text-white';
  else if (partial) color = 'bg-red-500 border-red-600 text-white';
  return (
    <button
      className={`h-10 w-10 rounded-full border-2 font-bold text-lg transition ${color}`}
      onClick={onClick}
      title={`Session ${session}`}
    >
      {session}
    </button>
  );
}

export function PracticeSessionsPage() {
  const [sessions, setSessions] = useState([]); // [{ strategies: [], completed: bool, partial: bool }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get('/api/parents/sessions');
        setSessions(data.sessions || []);
      } catch (err) {
        setError(err?.response?.data?.error || 'Failed to load sessions');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Practice Sessions</h2>
          <p className="mt-1 text-sm text-slate-600">Click a session to practice assigned strategies. Each session tracks your progress for clinician review.</p>
        </div>
      </div>
      {error && <div className="mt-4 text-sm font-medium text-red-700">{error}</div>}
      <Card className="mt-5">
        <div className="flex flex-wrap gap-3 justify-center">
          {Array.from({ length: SESSION_COUNT }, (_, i) => (
            <SessionMarker
              key={i + 1}
              session={i + 1}
              completed={sessions[i]?.completed}
              partial={sessions[i]?.partial}
              onClick={() => nav(`/parent/dashboard/assigned`)}
            />
          ))}
        </div>
        
      </Card>
    </div>
  );
}
