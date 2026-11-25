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
              className="rounded-sm bg-[#24FF6A] px-5 py-2.5 font-mono text-xs font-black uppercase tracking-wider text-[#0B0E11] hover:bg-[#4dff88]"
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
      <div className="rounded-lg border border-[#262E36] bg-[#171C21] p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <CheckCircle2 className="h-9 w-9 text-[#24FF6A]" />
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#24FF6A]">
              Order Placed
            </p>
            <h1 className="font-mono text-2xl font-black text-[#F3F6F8]">
              {order.order_number}
            </h1>
          </div>
          <span className="ml-auto rounded-xs bg-amber-400/15 px-3 py-1 font-mono text-xs font-bold text-amber-300 border border-amber-400/30">
            {order.status}
          </span>
        </div>

        <div className="mt-6 grid gap-4 rounded-md border border-[#262E36] bg-[#111518] p-4 text-sm sm:grid-cols-2">
          <div>
            <p className="font-mono text-xs font-semibold uppercase text-[#8A99AD]">Customer</p>
            <p className="mt-1 font-semibold text-[#F3F6F8]">{order.customer_name}</p>
            <p className="text-[#8A99AD]">{order.customer_email}</p>
            <p className="text-[#8A99AD]">{order.customer_contact}</p>
          </div>
          <div>
            <p className="font-mono text-xs font-semibold uppercase text-[#8A99AD]">Delivery & Payment</p>
            <p className="mt-1 text-[#F3F6F8]">{order.delivery_address}</p>
            <p className="mt-1 font-semibold text-[#24FF6A]">{order.payment_method}</p>
            {order.order_notes && (
              <p className="mt-1 text-xs text-[#8A99AD]">Notes: {order.order_notes}</p>
            )}
          </div>
        </div>

        <h2 className="mt-6 font-mono text-xs font-bold uppercase tracking-wider text-[#8A99AD]">
          Item Summary
        </h2>
        <ul className="mt-3 divide-y divide-[#262E36] text-sm">
          {(order.items || []).map((item) => (
            <li key={item.id} className="flex justify-between py-2.5">
              <span className="text-[#F3F6F8]">
                {item.product_name_snapshot}{' '}
                <span className="font-mono text-xs text-[#8A99AD]">
                  ({item.quantity} × {formatPeso(item.unit_price_snapshot)})
                </span>
              </span>
              <span className="font-mono font-bold text-[#F3F6F8]">{formatPeso(item.line_total)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between border-t border-[#262E36] pt-4 font-mono text-base font-black text-[#F3F6F8]">
          <span>Total</span>
          <span className="text-[#24FF6A]">{formatPeso(order.total)}</span>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/orders"
            className="rounded-sm bg-[#24FF6A] px-5 py-2.5 font-mono text-xs font-black uppercase tracking-wider text-[#0B0E11] hover:bg-[#4dff88]"
          >
            Track My Orders
          </Link>
          <Link
            to="/products"
            className="rounded-sm border border-[#262E36] bg-[#111518] px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-[#F3F6F8] hover:border-[#24FF6A]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
