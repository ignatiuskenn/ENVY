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
              className="rounded-sm bg-[#24FF6A] px-5 py-2.5 font-mono text-xs font-black uppercase tracking-wider text-[#0B0E11] hover:bg-[#4dff88]"
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
      <h1 className="font-mono text-2xl font-black uppercase tracking-wider text-[#F3F6F8] sm:text-3xl">
        Shopping Cart
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            const lineTotal = fromCents(calculateLineCents(item.price, item.quantity));
            return (
              <div
                key={item.product_id}
                className="flex flex-col gap-4 rounded-lg border border-[#262E36] bg-[#171C21] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-sm border border-[#262E36] bg-[#111518] p-1.5">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    ) : null}
                  </div>
                  <div>
                    <Link
                      to={`/products/${item.product_id}`}
                      className="text-base font-bold text-[#F3F6F8] hover:text-[#24FF6A]"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 font-mono text-xs text-[#8A99AD]">
                      Unit: {formatPeso(item.price)}
                    </p>
                    <p className="font-mono text-[11px] text-[#8A99AD]">
                      Max stock: {item.stock_quantity}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
                  <div className="flex items-center rounded-sm border border-[#262E36] bg-[#111518]">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="cursor-pointer px-2.5 py-1.5 text-sm font-bold text-[#F3F6F8] disabled:opacity-40"
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
                      className="w-12 border-x border-[#262E36] bg-[#111518] py-1.5 text-center font-mono text-sm font-semibold text-[#F3F6F8] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock_quantity}
                      className="cursor-pointer px-2.5 py-1.5 text-sm font-bold text-[#F3F6F8] disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <p className="min-w-28 text-right font-mono text-sm font-extrabold text-[#24FF6A]">
                    {formatPeso(lineTotal)}
                  </p>

                  <button
                    type="button"
                    onClick={() => removeItem(item.product_id)}
                    aria-label={`Remove ${item.name}`}
                    className="cursor-pointer rounded-sm p-2 text-[#8A99AD] hover:bg-red-950/50 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="h-fit rounded-lg border border-[#262E36] bg-[#171C21] p-6">
          <h2 className="font-mono text-base font-black uppercase tracking-wider text-[#F3F6F8]">
            Order Summary
          </h2>
          <div className="mt-4 space-y-2 border-b border-[#262E36] pb-4 text-sm">
            <div className="flex justify-between text-[#8A99AD]">
              <span>Subtotal</span>
              <span className="font-mono font-semibold text-[#F3F6F8]">{formatPeso(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#8A99AD]">
              <span>Shipping / Fees</span>
              <span className="font-mono">PHP 0.00</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between font-mono text-base font-black text-[#F3F6F8]">
            <span>Total</span>
            <span className="text-[#24FF6A]">{formatPeso(total)}</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="mt-6 w-full cursor-pointer rounded-sm bg-[#24FF6A] px-5 py-3 font-mono text-xs font-black uppercase tracking-wider text-[#0B0E11] transition hover:bg-[#4dff88]"
          >
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </div>
  );
}
