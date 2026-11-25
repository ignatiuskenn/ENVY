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

  const inputClass =
    'mt-1.5 w-full rounded-sm border border-[#262E36] bg-[#111518] px-3.5 py-2.5 text-sm text-[#F3F6F8] placeholder-[#8A99AD] focus:border-[#24FF6A] focus:outline-none';

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <div className="rounded-lg border border-[#262E36] bg-[#171C21] p-6 sm:p-8">
        <h1 className="font-mono text-xl font-black uppercase tracking-wider text-[#F3F6F8]">
          Create ENVY Account
        </h1>
        <p className="mt-1 text-sm text-[#8A99AD]">
          Register as a customer to complete your order.
        </p>

        {error && (
          <div className="mt-4 rounded-md border border-red-500/40 bg-red-950/30 px-3.5 py-2.5 text-xs font-medium text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#8A99AD]">
              Full Name
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Juan Dela Cruz"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#8A99AD]">
              Email Address
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="juan@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#8A99AD]">
              Password (min 8 chars)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#8A99AD]">
              Confirm Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password_confirmation}
              onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm bg-[#24FF6A] px-5 py-3 font-mono text-xs font-black uppercase tracking-wider text-[#0B0E11] transition hover:bg-[#4dff88] disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 border-t border-[#262E36] pt-4 text-center text-xs text-[#8A99AD]">
          Already have an account?{' '}
          <Link
            to="/login"
            state={{ from: redirectTo }}
            className="font-bold text-[#F3F6F8] underline hover:text-[#24FF6A]"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
