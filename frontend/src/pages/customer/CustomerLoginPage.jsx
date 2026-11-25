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
      <div className="rounded-lg border border-[#262E36] bg-[#171C21] p-6 sm:p-8">
        <h1 className="font-mono text-xl font-black uppercase tracking-wider text-[#F3F6F8]">
          Sign In to ENVY
        </h1>
        <p className="mt-1 text-sm text-[#8A99AD]">
          Sign in to place your order and complete checkout.
        </p>

        {error && (
          <div className="mt-4 rounded-md border border-red-500/40 bg-red-950/30 px-3.5 py-2.5 text-xs font-medium text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#8A99AD]">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1.5 w-full rounded-sm border border-[#262E36] bg-[#111518] px-3.5 py-2.5 text-sm text-[#F3F6F8] placeholder-[#8A99AD] focus:border-[#24FF6A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#8A99AD]">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-sm border border-[#262E36] bg-[#111518] px-3.5 py-2.5 text-sm text-[#F3F6F8] placeholder-[#8A99AD] focus:border-[#24FF6A] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm bg-[#24FF6A] px-5 py-3 font-mono text-xs font-black uppercase tracking-wider text-[#0B0E11] transition hover:bg-[#4dff88] disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#262E36] pt-4 text-xs">
          <button
            type="button"
            onClick={fillDemoCustomer}
            className="cursor-pointer font-mono font-bold text-[#24FF6A] hover:underline"
          >
            Fill Demo Customer
          </button>
          <span className="text-[#8A99AD]">
            New here?{' '}
            <Link
              to="/register"
              state={{ from: redirectTo }}
              className="font-bold text-[#F3F6F8] underline hover:text-[#24FF6A]"
            >
              Create an account
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
