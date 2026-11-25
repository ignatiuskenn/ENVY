import { RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OrderStatusBadge } from '../../components/shared/OrderStatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/StateFeedback';
import { fetchMyOrders } from '../../data/api/storefront.api';
import { useCustomerAuth } from '../../data/context/useCustomerAuth';
import { useAsyncData } from '../../hooks/useAsyncData';
import { formatPeso } from '../../utils/money';

function OrdersList() {
  const { data, loading, error, retry } = useAsyncData(() => fetchMyOrders(), []);
  const orders = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-black uppercase tracking-wider text-[#F3F6F8] sm:text-3xl">
            My Orders
          </h1>
          <p className="mt-1 text-sm text-[#8A99AD]">
            Track the live status of your ENVY orders.
          </p>
        </div>
        <button
          type="button"
          onClick={retry}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-[#262E36] bg-[#171C21] px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-[#F3F6F8] hover:border-[#24FF6A] hover:text-[#24FF6A]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Status
        </button>
      </div>

      {loading ? (
        <LoadingState label="Loading your orders..." />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Once you place an order, you can track its status here."
          action={
            <Link
              to="/products"
              className="rounded-sm bg-[#24FF6A] px-5 py-2.5 font-mono text-xs font-black uppercase tracking-wider text-[#0B0E11] hover:bg-[#4dff88]"
            >
              Shop Collection
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-lg border border-[#262E36] bg-[#171C21] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#262E36] pb-4">
                <div>
                  <p className="font-mono text-sm font-black text-[#F3F6F8]">
                    {order.order_number}
                  </p>
                  <p className="font-mono text-xs text-[#8A99AD]">
                    {new Date(order.created_at).toLocaleString()} · {order.payment_method}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-mono text-base font-black text-[#24FF6A]">
                    {formatPeso(order.total)}
                  </span>
                </div>
              </div>

              <ul className="mt-3 divide-y divide-[#262E36] text-sm">
                {(order.items || []).map((item) => (
                  <li key={item.id} className="flex justify-between py-2">
                    <span className="text-[#F3F6F8]">
                      {item.product_name_snapshot}{' '}
                      <span className="font-mono text-xs text-[#8A99AD]">
                        ({item.quantity} × {formatPeso(item.unit_price_snapshot)})
                      </span>
                    </span>
                    <span className="font-mono font-semibold text-[#F3F6F8]">
                      {formatPeso(item.line_total)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MyOrdersPage() {
  const { isAuthenticated, checking } = useCustomerAuth();

  if (checking) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <LoadingState label="Checking your session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          title="Sign in to view your orders"
          description="Log in with your customer account to track your order statuses."
          action={
            <Link
              to="/login"
              state={{ from: '/orders' }}
              className="rounded-sm bg-[#24FF6A] px-5 py-2.5 font-mono text-xs font-black uppercase tracking-wider text-[#0B0E11] hover:bg-[#4dff88]"
            >
              Sign In
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <OrdersList />
    </div>
  );
}
