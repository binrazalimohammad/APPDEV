/**
 * DFD Level 1 — Actor Interface: navigation shell between mobile screens.
 */
import { Link, NavLink } from 'react-router-dom';

const linkBase =
  'tap-target inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium';

export default function Navbar({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link to="/" className="text-base font-semibold text-brand-800">
          DFD Field Report
        </Link>
        {user ? (
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-700'}`
              }
              end
            >
              Home
            </NavLink>
            <NavLink
              to="/results"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-700'}`
              }
            >
              Results
            </NavLink>
            <button
              type="button"
              onClick={onLogout}
              className={`${linkBase} border border-slate-200 text-slate-700`}
            >
              Sign out
            </button>
          </nav>
        ) : (
          <Link to="/login" className={`${linkBase} bg-brand-800 text-white`}>
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
