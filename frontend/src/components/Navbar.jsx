import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/houses',     label: 'Houses',     icon: '🏰' },
  { to: '/characters', label: 'Characters', icon: '🧙' },
  { to: '/students',   label: 'Students',   icon: '📚' },
  { to: '/staff',      label: 'Staff',      icon: '⚗️'  },
];

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const navigate  = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const activeCls = 'text-[#d4af37] border-b-2 border-[#d4af37]';
  const baseCls   = 'text-slate-300 hover:text-[#d4af37] transition-colors duration-200 text-sm font-medium pb-0.5';
  const isAdmin   = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-50 border-b border-[#2a2a4a] bg-[#0d0d1a]/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">⚡</span>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-[#d4af37]">HP</span>
              <span className="text-white"> API</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `${baseCls} ${isActive ? activeCls : ''}`
                }
              >
                <span className="mr-1">{icon}</span>{label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/submissions"
                className={({ isActive }) => `${baseCls} ${isActive ? activeCls : ''}`}
              >
                <span className="mr-1">📋</span>Submissions
              </NavLink>
            )}
          </nav>

          {/* Auth section */}
          <div className="hidden md:flex items-center gap-3">
            {token ? (
              <>
                <span className="text-xs text-slate-400 max-w-[140px] truncate">
                  {user?.name ?? user?.email ?? 'Wizard'}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-[#2a2a4a] px-4 py-1.5 text-sm font-medium text-slate-300
                             hover:border-red-500/50 hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-[#d4af37] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-[#d4af37] px-4 py-1.5 text-sm font-semibold text-[#0d0d0d]
                             hover:bg-[#e0c04a] transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-slate-300 hover:text-white p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#2a2a4a] bg-[#0d0d1a] px-4 pb-4">
          <nav className="flex flex-col gap-1 pt-3">
            {NAV_LINKS.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                   ${isActive ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'text-slate-300 hover:bg-[#1a1a2e] hover:text-white'}`
                }
              >
                <span>{icon}</span>{label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/submissions"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                   ${isActive ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'text-slate-300 hover:bg-[#1a1a2e] hover:text-white'}`
                }
              >
                <span>📋</span>Submissions
              </NavLink>
            )}

            <div className="mt-3 pt-3 border-t border-[#2a2a4a] flex flex-col gap-2">
              {token ? (
                <button
                  onClick={() => { setOpen(false); handleLogout(); }}
                  className="w-full text-left rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login"    onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-[#1a1a2e]">Sign in</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="rounded-lg bg-[#d4af37] px-3 py-2 text-sm font-semibold text-[#0d0d0d] text-center">Register</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
