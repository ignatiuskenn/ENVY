import { Lock, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../data/context/useAdminAuth';

export function AdminLoginPage() {
  const { isAuthenticated, login } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const fillDemo = () => {
    setEmail('admin@envy-demo.test');
    setPassword('EnvyDemo2026!');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-xl sm:p-8">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400 text-base font-black text-slate-950">
            E
          </span>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">ENVY Admin Login</h1>
            <p className="text-xs text-slate-400">Store management demo portal</p>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p>
            <strong>Demo Authentication Only:</strong> Uses demo credentials for assessment review and is unsuitable for production.
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 text-xs font-medium text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300">
              Demo Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@envy-demo.test"
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-lime-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-lime-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Lock className="h-4 w-4" />
            {submitting ? 'Signing in...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4 text-xs">
          <button
            type="button"
            onClick={fillDemo}
            className="cursor-pointer font-semibold text-lime-400 hover:underline"
          >
            Fill Demo Credentials
          </button>
          <Link to="/" className="text-slate-400 hover:text-white">
            ← Back to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
