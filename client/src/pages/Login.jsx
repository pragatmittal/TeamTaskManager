import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      await login('/auth/login', form);
      toast.success('Welcome back!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = getErrorMessage(err);
      setErrors(err.response?.data?.details || [msg]);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white">Log in</h1>
        <p className="mt-1 text-sm text-slate-400">
          No account?{' '}
          <Link to="/signup" className="text-indigo-400 hover:underline">
            Sign up
          </Link>
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {errors.length ? (
            <ul className="list-inside list-disc rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
              {errors.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          ) : null}
          <div>
            <label className="block text-sm font-medium text-slate-300">Email</label>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-indigo-500 focus:ring-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Password</label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-indigo-500 focus:ring-2"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
