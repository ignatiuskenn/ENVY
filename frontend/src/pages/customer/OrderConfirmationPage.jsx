import { CheckCircle2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { EmptyState } from '../../components/ui/StateFeedback';
import { formatPeso } from '../../utils/money';

export function OrderConfirmationPage() {
  const { state } = useLocation();
  const order = state?.order;

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          title="No recent order found"
          description="Place an order from the ENVY storefront to view your confirmation."
          action={
            <Link
              to="/products"
              className="rounded-lg bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Shop Products
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-9 w-9 text-emerald-600" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Order Placed
            </p>
            <h1 className="text-2xl font-black text-neutral-950">
              {order.order_number}
            </h1>
          </div>
          <span className="ml-auto rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            {order.status}
          </span>
        </div>

        <div className="mt-6 grid gap-4 rounded-xl bg-neutral-50 p-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase text-neutral-500">Customer</p>
            <p className="mt-1 font-semibold text-neutral-900">{order.customer_name}</p>
            <p className="text-neutral-600">{order.customer_email}</p>
            <p className="text-neutral-600">{order.customer_contact}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-neutral-500">Delivery & Payment</p>
            <p className="mt-1 text-neutral-900">{order.delivery_address}</p>
            <p className="mt-1 font-semibold text-neutral-900">{order.payment_method}</p>
            {order.order_notes && (
              <p className="mt-1 text-xs text-neutral-600">Notes: {order.order_notes}</p>
            )}
          </div>
        </div>

        <h2 className="mt-6 text-sm font-bold uppercase tracking-wide text-neutral-700">
          Item Summary
        </h2>
        <ul className="mt-3 divide-y divide-neutral-200 text-sm">
          {(order.items || []).map((item) => (
            <li key={item.id} className="flex justify-between py-2.5">
              <span>
                {item.product_name_snapshot}{' '}
                <span className="text-neutral-500">
                  ({item.quantity} × {formatPeso(item.unit_price_snapshot)})
                </span>
              </span>
              <span className="font-bold text-neutral-900">{formatPeso(item.line_total)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between border-t border-neutral-200 pt-4 text-base font-black text-neutral-950">
          <span>Total</span>
          <span>{formatPeso(order.total)}</span>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/orders"
            className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-neutral-800"
          >
            Track My Orders
          </Link>
          <Link
            to="/products"
            className="rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-800 hover:border-neutral-950"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
