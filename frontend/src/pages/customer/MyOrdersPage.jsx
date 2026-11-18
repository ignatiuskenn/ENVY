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
          <h1 className="text-3xl font-black tracking-tight text-neutral-950">My Orders</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Track the live status of your ENVY orders.
          </p>
        </div>
        <button
          type="button"
          onClick={retry}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-bold text-neutral-800 hover:border-neutral-950"
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
              className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-neutral-800"
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
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                <div>
                  <p className="font-mono text-sm font-black text-neutral-950">
                    {order.order_number}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {new Date(order.created_at).toLocaleString()} · {order.payment_method}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <span className="text-base font-black text-neutral-950">
                    {formatPeso(order.total)}
                  </span>
                </div>
              </div>

              <ul className="mt-3 divide-y divide-neutral-100 text-sm">
                {(order.items || []).map((item) => (
                  <li key={item.id} className="flex justify-between py-2">
                    <span className="text-neutral-800">
                      {item.product_name_snapshot}{' '}
                      <span className="text-neutral-500">
                        ({item.quantity} × {formatPeso(item.unit_price_snapshot)})
                      </span>
                    </span>
                    <span className="font-semibold text-neutral-900">
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
              className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-neutral-800"
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
