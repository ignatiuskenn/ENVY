import { Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { EmptyState } from '../../components/ui/StateFeedback';
import { useCart } from '../../data/context/useCart';
import { calculateLineCents, formatPeso, fromCents } from '../../utils/money';

export function CartPage() {
  const navigate = useNavigate();
  const { items, subtotal, total, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          title="Your cart is empty"
          description="Add ENVY gear to your cart before proceeding to checkout."
          action={
            <Link
              to="/products"
              className="rounded-lg bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Browse Products
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black tracking-tight text-neutral-950">Shopping Cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            const lineTotal = fromCents(calculateLineCents(item.price, item.quantity));
            return (
              <div
                key={item.product_id}
                className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div>
                    <Link
                      to={`/products/${item.product_id}`}
                      className="text-base font-bold text-neutral-950 hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-sm text-neutral-600">
                      Unit: {formatPeso(item.price)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Max stock: {item.stock_quantity}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
                  <div className="flex items-center rounded-lg border border-neutral-300">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-2.5 py-1.5 text-sm font-bold text-neutral-700 disabled:opacity-40"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={item.stock_quantity}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.product_id, e.target.value)}
                      aria-label={`Quantity for ${item.name}`}
                      className="w-12 border-x border-neutral-300 py-1.5 text-center text-sm font-semibold focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock_quantity}
                      className="px-2.5 py-1.5 text-sm font-bold text-neutral-700 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <p className="min-w-28 text-right text-sm font-extrabold text-neutral-950">
                    {formatPeso(lineTotal)}
                  </p>

                  <button
                    type="button"
                    onClick={() => removeItem(item.product_id)}
                    aria-label={`Remove ${item.name}`}
                    className="rounded-lg p-2 text-neutral-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="h-fit rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="text-lg font-black text-neutral-950">Order Summary</h2>
          <div className="mt-4 space-y-2 border-b border-neutral-200 pb-4 text-sm">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span className="font-semibold text-neutral-900">{formatPeso(subtotal)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Shipping / Fees</span>
              <span>PHP 0.00</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-base font-black text-neutral-950">
            <span>Total</span>
            <span>{formatPeso(total)}</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="mt-6 w-full rounded-xl bg-neutral-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-800"
          >
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </div>
  );
}
