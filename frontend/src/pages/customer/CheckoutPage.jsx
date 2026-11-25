import { AlertTriangle, Lock } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EmptyState, LoadingState } from '../../components/ui/StateFeedback';
import { PAYMENT_METHODS } from '../../constants/paymentMethods';
import { fetchProducts, submitCheckout } from '../../data/api/storefront.api';
import { useCart } from '../../data/context/useCart';
import { useCustomerAuth } from '../../data/context/useCustomerAuth';
import { calculateLineCents, formatPeso, fromCents } from '../../utils/money';
import { validateCheckoutForm } from '../../utils/validators';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, total, clearCart, syncWithLatestProducts } = useCart();
  const { user, isAuthenticated, checking } = useCustomerAuth();

  const [form, setForm] = useState({
    customer_name: user?.name || '',
    customer_email: user?.email || '',
    customer_contact: '',
    delivery_address: '',
    payment_method: PAYMENT_METHODS[0],
    order_notes: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [conflictChanges, setConflictChanges] = useState([]);

  if (checking) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <LoadingState label="Checking your account session..." />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          title="Cannot checkout with an empty cart"
          description="Add at least one ENVY product to your cart first."
          action={
            <Link
              to="/products"
              className="rounded-sm bg-[#24FF6A] px-5 py-2.5 font-mono text-xs font-black uppercase tracking-wider text-[#0B0E11] hover:bg-[#4dff88]"
            >
              Browse Products
            </Link>
          }
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-[#262E36] bg-[#171C21] p-8 text-center">
          <Lock className="mx-auto h-9 w-9 text-[#24FF6A]" />
          <h1 className="mt-3 font-mono text-xl font-black uppercase tracking-wider text-[#F3F6F8]">
            Sign in to Checkout
          </h1>
          <p className="mt-2 text-sm text-[#8A99AD]">
            Your cart ({items.length} item line{items.length > 1 ? 's' : ''}) is saved. Sign in or create a customer account to place your order.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/login"
              state={{ from: '/checkout' }}
              className="rounded-sm bg-[#24FF6A] px-6 py-2.5 font-mono text-xs font-black uppercase tracking-wider text-[#0B0E11] hover:bg-[#4dff88]"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              state={{ from: '/checkout' }}
              className="rounded-sm border border-[#262E36] bg-[#111518] px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-[#F3F6F8] hover:border-[#24FF6A]"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleRefreshCart = async () => {
    try {
      const res = await fetchProducts();
      syncWithLatestProducts(res.data || []);
      setConflictChanges([]);
      setServerError('');
    } catch {
      setServerError('Could not refresh product catalog. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setConflictChanges([]);

    const errors = validateCheckoutForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          expected_unit_price: Number(item.price),
        })),
      };

      const res = await submitCheckout(payload);
      clearCart();
      navigate('/order-confirmation', { state: { order: res.data } });
    } catch (err) {
      if (err.status === 409 && err.data?.changes) {
        setConflictChanges(err.data.changes);
        setServerError(err.message);
      } else if (err.status === 422 && err.data?.errors) {
        const mapped = {};
        Object.entries(err.data.errors).forEach(([k, msgs]) => {
          mapped[k] = msgs[0];
        });
        setFieldErrors(mapped);
        setServerError('Please fix the highlighted fields.');
      } else {
        setServerError(err.message || 'Unable to place your order. Your cart has been preserved.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'mt-1.5 w-full rounded-sm border border-[#262E36] bg-[#111518] px-3 py-2 text-sm text-[#F3F6F8] placeholder-[#8A99AD] focus:border-[#24FF6A] focus:outline-none';

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-mono text-2xl font-black uppercase tracking-wider text-[#F3F6F8] sm:text-3xl">
        Checkout
      </h1>
      <p className="mt-1 text-sm text-[#8A99AD]">
        Confirm your delivery details and payment selection.
      </p>

      {serverError && (
        <div className="mt-6 rounded-lg border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <div className="flex-1">
              <p className="font-semibold">{serverError}</p>
              {conflictChanges.length > 0 && (
                <>
                  <ul className="mt-2 list-disc space-y-1 pl-4">
                    {conflictChanges.map((c, idx) => (
                      <li key={idx}>{c.message}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={handleRefreshCart}
                    className="mt-3 cursor-pointer rounded-sm bg-[#24FF6A] px-3.5 py-1.5 font-mono text-xs font-black uppercase tracking-wider text-[#0B0E11] hover:bg-[#4dff88]"
                  >
                    Sync Cart with Latest Prices & Stock
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} noValidate className="space-y-5 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#8A99AD]">
                Customer Name *
              </label>
              <input
                type="text"
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                className={inputClass}
                placeholder="Juan Dela Cruz"
              />
              {fieldErrors.customer_name && (
                <p className="mt-1 text-xs font-medium text-red-400">{fieldErrors.customer_name}</p>
              )}
            </div>

            <div>
              <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#8A99AD]">
                Email Address *
              </label>
              <input
                type="email"
                value={form.customer_email}
                onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                className={inputClass}
                placeholder="juan@example.com"
              />
              {fieldErrors.customer_email && (
                <p className="mt-1 text-xs font-medium text-red-400">{fieldErrors.customer_email}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#8A99AD]">
                Contact Number *
              </label>
              <input
                type="tel"
                value={form.customer_contact}
                onChange={(e) => setForm({ ...form, customer_contact: e.target.value })}
                className={inputClass}
                placeholder="+63 917 123 4567"
              />
              {fieldErrors.customer_contact && (
                <p className="mt-1 text-xs font-medium text-red-400">{fieldErrors.customer_contact}</p>
              )}
            </div>

            <div>
              <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#8A99AD]">
                Payment Method *
              </label>
              <select
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                className={inputClass}
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
              {fieldErrors.payment_method && (
                <p className="mt-1 text-xs font-medium text-red-400">{fieldErrors.payment_method}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#8A99AD]">
              Delivery Address *
            </label>
            <textarea
              rows={3}
              value={form.delivery_address}
              onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
              className={inputClass}
              placeholder="Street, Barangay, City"
            />
            {fieldErrors.delivery_address && (
              <p className="mt-1 text-xs font-medium text-red-400">{fieldErrors.delivery_address}</p>
            )}
          </div>

          <div>
            <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#8A99AD]">
              Order Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={form.order_notes}
              onChange={(e) => setForm({ ...form, order_notes: e.target.value })}
              className={inputClass}
              placeholder="Delivery instructions or notes..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full cursor-pointer rounded-sm bg-[#24FF6A] px-6 py-3.5 font-mono text-xs font-black uppercase tracking-wider text-[#0B0E11] transition hover:bg-[#4dff88] disabled:cursor-not-allowed disabled:bg-[#262E36] disabled:text-[#8A99AD]"
          >
            {submitting ? 'Placing Order...' : `Place Order (${formatPeso(total)})`}
          </button>
        </form>

        <aside className="h-fit rounded-lg border border-[#262E36] bg-[#171C21] p-6">
          <h2 className="font-mono text-base font-black uppercase tracking-wider text-[#F3F6F8]">
            Review Items
          </h2>
          <ul className="mt-4 divide-y divide-[#262E36] text-sm">
            {items.map((item) => {
              const lineTotal = fromCents(calculateLineCents(item.price, item.quantity));
              return (
                <li key={item.product_id} className="flex justify-between gap-3 py-3">
                  <div>
                    <p className="font-semibold text-[#F3F6F8]">{item.name}</p>
                    <p className="font-mono text-xs text-[#8A99AD]">
                      {item.quantity} × {formatPeso(item.price)}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-[#F3F6F8]">{formatPeso(lineTotal)}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 space-y-1.5 border-t border-[#262E36] pt-4 text-sm">
            <div className="flex justify-between text-[#8A99AD]">
              <span>Subtotal</span>
              <span className="font-mono">{formatPeso(subtotal)}</span>
            </div>
            <div className="flex justify-between font-mono text-base font-black text-[#F3F6F8]">
              <span>Total</span>
              <span className="text-[#24FF6A]">{formatPeso(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
