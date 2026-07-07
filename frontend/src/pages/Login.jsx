import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const redirectTo   = location.state?.from?.pathname ?? '/characters';

  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 50%, #16213e 100%)' }}>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-[#2a2a4a] bg-[#1a1a2e]/80 backdrop-blur-sm shadow-2xl p-8">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 mb-4">
            <span className="text-3xl">⚡</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to the Wizarding World</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block mb-1.5 text-sm font-medium text-slate-300">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="wizard@hogwarts.edu"
              className="w-full rounded-lg border border-[#2a2a4a] bg-[#0d0d1a] px-4 py-2.5 text-sm text-white placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37]/60 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-slate-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-lg border border-[#2a2a4a] bg-[#0d0d1a] px-4 py-2.5 text-sm text-white placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37]/60 transition"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-2.5 px-4 text-sm font-semibold text-[#0d0d0d]
                       bg-[#d4af37] hover:bg-[#e0c04a] active:bg-[#c49e2a]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-200 shadow-lg shadow-[#d4af37]/20"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-[#d4af37] hover:text-[#e0c04a] font-medium transition-colors">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
