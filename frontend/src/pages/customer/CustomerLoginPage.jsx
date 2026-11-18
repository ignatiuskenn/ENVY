import { LogIn } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../data/context/useCustomerAuth';

export function CustomerLoginPage() {
  const { isAuthenticated, login } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const fillDemoCustomer = () => {
    setEmail('customer@envy-demo.test');
    setPassword('EnvyCustomer2026!');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-black tracking-tight text-neutral-950">Sign In to ENVY</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Sign in to place your order and complete checkout.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-neutral-700">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm focus:border-neutral-950 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-neutral-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm focus:border-neutral-950 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 pt-4 text-xs">
          <button
            type="button"
            onClick={fillDemoCustomer}
            className="cursor-pointer font-semibold text-neutral-800 underline underline-offset-2"
          >
            Fill Demo Customer
          </button>
          <span className="text-neutral-600">
            New here?{' '}
            <Link to="/register" state={{ from: redirectTo }} className="font-bold text-neutral-950 underline">
              Create an account
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
