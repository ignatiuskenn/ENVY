import { RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OrderStatusBadge } from '../../components/shared/OrderStatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/StateFeedback';
import { fetchAdminOrders } from '../../data/api/admin.api';
import { useAsyncData } from '../../hooks/useAsyncData';
import { formatPeso } from '../../utils/money';

export function AdminOrdersPage() {
  const { data, loading, error, retry } = useAsyncData(() => fetchAdminOrders(), []);
  const orders = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">Orders</h1>
          <p className="mt-1 text-sm text-slate-600">
            Newest orders first. Click View Details to inspect snapshots or update status.
          </p>
        </div>
        <button
          type="button"
          onClick={retry}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:border-slate-950"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {loading ? (
        <LoadingState label="Loading orders..." />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders placed yet"
          description="Submitted customer orders will appear here newest first."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-slate-950">
                    {order.order_number}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {order.customer_name}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{order.payment_method}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-950">
                    {formatPeso(order.total)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
