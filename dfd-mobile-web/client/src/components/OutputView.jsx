/**
 * DFD Level 1 — Final Output (Module 6): formatted list + PDF export (Process 3 view).
 * Uses jsPDF + autotable for downloadable report on mobile browsers.
 */
import { useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function OutputView({ payload }) {
  const exportPdf = useCallback(() => {
    if (!payload?.table?.length) return;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    doc.setFontSize(16);
    doc.text('DFD Field Report — Results Export', 40, 48);
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`Generated: ${new Date(payload.generatedAt).toLocaleString()}`, 40, 64);
    doc.text(`Actor view — sorted by priority (Process 3 formatting).`, 40, 78);

    autoTable(doc, {
      startY: 94,
      head: [['ID', 'Title', 'Category', 'Priority', 'Status', 'Owner', 'Updated']],
      body: payload.table.map(r => [
        String(r.id),
        r.title,
        r.category,
        r.priority,
        r.status,
        r.owner,
        r.updatedAt ? String(r.updatedAt).slice(0, 19).replace('T', ' ') : '',
      ]),
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [7, 89, 133] },
    });

    doc.save(`dfd-field-report-${Date.now()}.pdf`);
  }, [payload]);

  if (!payload) {
    return <p className="text-slate-600">No output yet. Open Results after login.</p>;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Structured output</h2>
          <p className="text-sm text-slate-600">Table + cards optimized for small screens.</p>
        </div>
        <button
          type="button"
          className="tap-target rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white"
          onClick={exportPdf}
          disabled={!payload.table?.length}
        >
          Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {payload.cards.map(c => (
          <article key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">{c.label}</p>
            <p className="mt-2 text-2xl font-bold text-brand-800">{c.value}</p>
            <p className="mt-1 text-xs text-slate-500">{c.hint}</p>
          </article>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-3 font-semibold text-slate-700">Title</th>
              <th className="px-3 py-3 font-semibold text-slate-700">Cat</th>
              <th className="px-3 py-3 font-semibold text-slate-700">Pri</th>
              <th className="px-3 py-3 font-semibold text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payload.table.map(row => (
              <tr key={row.id} className="bg-white">
                <td className="px-3 py-3 font-medium text-slate-900">{row.title}</td>
                <td className="px-3 py-3 text-slate-700">{row.category}</td>
                <td className="px-3 py-3 capitalize text-slate-700">{row.priority}</td>
                <td className="px-3 py-3 capitalize text-slate-700">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!payload.table.length ? (
        <p className="text-sm text-slate-600">Submit a report from Home to populate this table.</p>
      ) : null}
    </section>
  );
}
