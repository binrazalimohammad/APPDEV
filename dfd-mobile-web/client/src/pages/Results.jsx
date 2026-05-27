/**
 * DFD Level 1 — Actor results view: Module 6 full output + PDF export.
 */
import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import OutputView from '../components/OutputView';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardOutput } from '../services/api';

export default function Results() {
  const { user, booting } = useAuth();
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      const res = await fetchDashboardOutput();
      setPayload(res.data);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Failed to load');
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  if (booting) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <h1 className="text-xl font-bold text-slate-900">Results</h1>
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {error}
        </p>
      ) : null}
      <OutputView payload={payload} />
      <button
        type="button"
        className="tap-target w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800"
        onClick={() => void load()}
      >
        Refresh output
      </button>
    </div>
  );
}
