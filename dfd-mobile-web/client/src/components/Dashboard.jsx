/**
 * DFD Level 1 — Final Output (Module 6): condensed dashboard view from Process 3 payload.
 * Displays summary cards fed by /api/output/dashboard.
 */
export default function Dashboard({ payload, loading, error }) {
  if (loading) {
    return <p className="text-center text-slate-600">Loading dashboard…</p>;
  }
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
    );
  }
  if (!payload) return null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
        <p className="text-sm text-slate-600">Role-filtered records (Process 2 business rules).</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {payload.cards.map(c => (
          <article
            key={c.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">{c.label}</p>
            <p className="mt-2 text-3xl font-bold text-brand-800">{c.value}</p>
            <p className="mt-1 text-xs text-slate-500">{c.hint}</p>
          </article>
        ))}
      </div>
      {payload.summary ? (
        <p className="text-xs text-slate-500">
          Generated {new Date(payload.generatedAt).toLocaleString()} · Total {payload.summary.total}
        </p>
      ) : null}
    </section>
  );
}
