/**
 * DFD Level 1 — Actor Interface: mobile login & registration gateway (Module 1).
 */
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, booting, signIn, signUp } = useAuth();
  const [mode, setMode] = useState('login'); // login | register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  if (booting) {
    return <p className="p-6 text-center text-slate-600">Starting secure session…</p>;
  }
  if (user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res =
        mode === 'login'
          ? await signIn({ email, password })
          : await signUp({ email, password, fullName });
      if (!res.success) {
        setMsg(res.error || res.errors?.[0]?.msg || 'Request failed');
      }
    } catch (err) {
      setMsg(err.response?.data?.error || err.message || 'Network error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-900">DFD Field Report</h1>
      <p className="mt-2 text-sm text-slate-600">
        Mobile-first web client — JWT session, REST API backend.
      </p>

      <div className="mt-6 flex rounded-2xl border border-slate-200 bg-slate-100 p-1">
        <button
          type="button"
          className={`tap-target flex-1 rounded-xl py-3 text-sm font-semibold ${mode === 'login' ? 'bg-white shadow-sm' : 'text-slate-600'}`}
          onClick={() => setMode('login')}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`tap-target flex-1 rounded-xl py-3 text-sm font-semibold ${mode === 'register' ? 'bg-white shadow-sm' : 'text-slate-600'}`}
          onClick={() => setMode('register')}
        >
          Register
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {mode === 'register' ? (
          <>
            <label className="block text-sm font-medium text-slate-700" htmlFor="fullName">
              Full name
            </label>
            <input
              id="fullName"
              className="tap-target w-full rounded-xl border border-slate-200 px-3 py-2 text-base"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              autoComplete="name"
            />
          </>
        ) : null}

        <label className="block text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
          className="tap-target w-full rounded-xl border border-slate-200 px-3 py-2 text-base"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <label className="block text-sm font-medium text-slate-700" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="tap-target w-full rounded-xl border border-slate-200 px-3 py-2 text-base"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={mode === 'register' ? 8 : undefined}
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
        />

        {msg ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            {msg}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="tap-target w-full rounded-xl bg-brand-800 py-3 text-base font-semibold text-white disabled:opacity-60"
        >
          {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
        Demo seeded users:
        <br />
        user@dfd.local · Password123!
        <br />
        admin@dfd.local · AdminPass123!
      </p>
    </div>
  );
}
