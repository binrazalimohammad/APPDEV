/**
 * DFD Level 1 — Actor home: blends Module 1 (input) and Module 6 (summary output preview).
 */
import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import InputForm from '../components/InputForm';
import { useAuth } from '../context/AuthContext';
import { createRecord, fetchDashboardOutput, fetchLogs } from '../services/api';

export default function Home() {
  const { user, booting } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [dashRes, logsRes] = await Promise.all([fetchDashboardOutput(), fetchLogs()]);
      setDashboard(dashRes.data);
      setLogs(logsRes.data?.slice?.(0, 5) || []);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Failed to load dashboard');
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (booting) return null;
  if (!user) return <Navigate to="/login" replace />;

  async function handleCreate(body) {
    setBusy(true);
    setToast(null);
    try {
      await createRecord(body);
      setToast('Saved — persisted to database after server validation.');
      await reload();
    } catch (e) {
      setToast(e.response?.data?.error || e.message || 'Submit failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <header>
        <p className="text-sm text-brand-900">Signed in as</p>
        <h1 className="text-xl font-bold text-slate-900">{user.fullName}</h1>
        <p className="text-sm capitalize text-slate-600">{user.role}</p>
      </header>

      <Dashboard payload={dashboard} loading={loading} error={error} />

      {toast ? (
        <p className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800">
          {toast}
        </p>
      ) : null}

      <InputForm onSubmit={handleCreate} busy={busy} />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Recent activity (logs)</h2>
        <p className="text-xs text-slate-500">
          Audit entries written when records change (linked data store — activity_logs table).
        </p>
        <ul className="mt-3 space-y-3">
          {logs.length === 0 ? (
            <li className="text-sm text-slate-600">No log entries visible for your role yet.</li>
          ) : (
            logs.map(l => (
              <li key={l.id} className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-800">
                <span className="font-semibold text-brand-900">{l.action}</span>{' '}
                <span className="text-slate-600">
                  · {new Date(l.createdAt).toLocaleString()} ·{' '}
                  {(l.details || '').slice(0, 120)}
                  {(l.details || '').length > 120 ? '…' : ''}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
