import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../data/context/useCustomerAuth';

export function CustomerRegisterPage() {
  const { isAuthenticated, register } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const firstErr = err.data?.errors
        ? Object.values(err.data.errors).flat()[0]
        : null;
      setError(firstErr || err.message || 'Unable to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-black tracking-tight text-neutral-950">Create ENVY Account</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Register as a customer to complete your order.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-neutral-700">
              Full Name
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Juan Dela Cruz"
              className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm focus:border-neutral-950 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-neutral-700">
              Email Address
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="juan@example.com"
              className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm focus:border-neutral-950 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-neutral-700">
              Password (min 8 chars)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm focus:border-neutral-950 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-neutral-700">
              Confirm Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password_confirmation}
              onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm focus:border-neutral-950 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 border-t border-neutral-200 pt-4 text-center text-xs text-neutral-600">
          Already have an account?{' '}
          <Link to="/login" state={{ from: redirectTo }} className="font-bold text-neutral-950 underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
