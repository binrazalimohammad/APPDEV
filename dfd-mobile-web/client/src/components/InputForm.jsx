/**
 * DFD Level 1 — Actor Interface (Module 1): mobile input form for new field reports.
 * Client-side validation mirrors server rules; feedback before Process 1 on server.
 */
import { useMemo, useState } from 'react';

const initial = {
  title: '',
  category: '',
  description: '',
  priority: 'medium',
  status: 'submitted',
};

function validate(state) {
  const errors = {};
  if (state.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
  if (state.title.trim().length > 200) errors.title = 'Title too long (max 200)';
  if (state.category.trim().length < 2) errors.category = 'Category is required';
  if (state.description.length > 5000) errors.description = 'Description too long';
  return errors;
}

export default function InputForm({ onSubmit, busy }) {
  const [form, setForm] = useState(initial);
  const [touched, setTouched] = useState({});

  const errors = useMemo(() => validate(form), [form]);
  const isValid = Object.keys(errors).length === 0;

  const show = field => Boolean(touched[field] && errors[field]);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ title: true, category: true, description: true });
    const v = validate(form);
    if (Object.keys(v).length) return;
    await onSubmit({
      title: form.title.trim(),
      category: form.category.trim(),
      description: form.description.trim() || undefined,
      priority: form.priority,
      status: form.status,
    });
    setForm(initial);
    setTouched({});
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      noValidate
    >
      <h2 className="text-lg font-semibold text-slate-900">Submit field report</h2>
      <p className="mt-1 text-sm text-slate-600">
        Touch-friendly form — data is validated on device and on the server (Process 1).
      </p>

      <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="title">
        Title
      </label>
      <input
        id="title"
        name="title"
        type="text"
        autoComplete="off"
        className="tap-target mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base outline-none ring-brand-600 focus:ring-2"
        value={form.title}
        onChange={e => update('title', e.target.value)}
        onBlur={() => setTouched(t => ({ ...t, title: true }))}
      />
      {show('title') ? <p className="mt-1 text-sm text-red-600">{errors.title}</p> : null}

      <label className="mt-3 block text-sm font-medium text-slate-700" htmlFor="category">
        Category
      </label>
      <input
        id="category"
        name="category"
        type="text"
        placeholder="Maintenance, Safety, …"
        className="tap-target mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base outline-none ring-brand-600 focus:ring-2"
        value={form.category}
        onChange={e => update('category', e.target.value)}
        onBlur={() => setTouched(t => ({ ...t, category: true }))}
      />
      {show('category') ? <p className="mt-1 text-sm text-red-600">{errors.category}</p> : null}

      <label className="mt-3 block text-sm font-medium text-slate-700" htmlFor="description">
        Description
      </label>
      <textarea
        id="description"
        name="description"
        rows={4}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-base outline-none ring-brand-600 focus:ring-2"
        value={form.description}
        onChange={e => update('description', e.target.value)}
        onBlur={() => setTouched(t => ({ ...t, description: true }))}
      />
      {show('description') ? (
        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="priority">
            Priority
          </label>
          <select
            id="priority"
            className="tap-target mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base"
            value={form.priority}
            onChange={e => update('priority', e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            className="tap-target mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base"
            value={form.status}
            onChange={e => update('status', e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={busy || !isValid}
        className="tap-target mt-5 w-full rounded-xl bg-brand-800 px-4 py-3 text-center text-base font-semibold text-white disabled:opacity-50"
      >
        {busy ? 'Submitting…' : 'Submit report'}
      </button>
      {!isValid ? (
        <p className="mt-2 text-center text-xs text-slate-500">Fix highlighted fields to enable submit.</p>
      ) : null}
    </form>
  );
}
