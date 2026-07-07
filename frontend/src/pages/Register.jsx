import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HOUSES = ['Gryffindor', 'Hufflepuff', 'Ravenclaw', 'Slytherin'];

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    name:     '',
    email:    '',
    password: '',
    confirm:  '',
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { name, email, password } = form;
      await register({ name, email, password });
      navigate('/characters', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
         style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 50%, #16213e 100%)' }}>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-[#2a2a4a] bg-[#1a1a2e]/80 backdrop-blur-sm shadow-2xl p-8">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 mb-4">
            <span className="text-3xl">🧙</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create account</h1>
          <p className="mt-1 text-sm text-slate-400">Join the Wizarding World</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block mb-1.5 text-sm font-medium text-slate-300">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Harry Potter"
              className="w-full rounded-lg border border-[#2a2a4a] bg-[#0d0d1a] px-4 py-2.5 text-sm text-white placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37]/60 transition"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="block mb-1.5 text-sm font-medium text-slate-300">
              Email address
            </label>
            <input
              id="reg-email"
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
            <label htmlFor="reg-password" className="block mb-1.5 text-sm font-medium text-slate-300">
              Password
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-lg border border-[#2a2a4a] bg-[#0d0d1a] px-4 py-2.5 text-sm text-white placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37]/60 transition"
            />
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="confirm" className="block mb-1.5 text-sm font-medium text-slate-300">
              Confirm password
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={form.confirm}
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
            className="w-full mt-2 rounded-lg py-2.5 px-4 text-sm font-semibold text-[#0d0d0d]
                       bg-[#d4af37] hover:bg-[#e0c04a] active:bg-[#c49e2a]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-200 shadow-lg shadow-[#d4af37]/20"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-[#d4af37] hover:text-[#e0c04a] font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
