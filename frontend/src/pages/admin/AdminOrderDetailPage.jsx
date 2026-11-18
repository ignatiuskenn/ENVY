import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { OrderStatusBadge } from '../../components/shared/OrderStatusBadge';
import { ErrorState, LoadingState } from '../../components/ui/StateFeedback';
import { ORDER_TRANSITIONS } from '../../constants/orderStatuses';
import { fetchAdminOrderDetail, updateAdminOrderStatus } from '../../data/api/admin.api';
import { useAsyncData } from '../../hooks/useAsyncData';
import { formatPeso } from '../../utils/money';

export function AdminOrderDetailPage() {
  const { id } = useParams();
  const { data, loading, error, retry } = useAsyncData(
    () => fetchAdminOrderDetail(id),
    [id]
  );

  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const order = data?.data;

  const handleTransition = async (nextStatus) => {
    if (
      nextStatus === 'Cancelled' &&
      !window.confirm('Cancel this order and restore item stock?')
    ) {
      return;
    }

    setUpdating(true);
    setFeedback({ type: '', text: '' });
    try {
      await updateAdminOrderStatus(id, nextStatus);
      setFeedback({ type: 'success', text: `Order status updated to ${nextStatus}.` });
      retry();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update status.' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingState label="Loading order details..." />;
  if (error || !order) return <ErrorState message={error} onRetry={retry} />;

  const allowedNext = ORDER_TRANSITIONS[order.status] || [];

  return (
    <div className="space-y-6">
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div>
          <p className="font-mono text-xs font-bold uppercase text-slate-500">Order Number</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950">{order.order_number}</h1>
          <p className="mt-1 text-xs text-slate-500">
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          {order.stock_restored && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              Stock Restored
            </span>
          )}
        </div>
      </div>

      {feedback.text && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            feedback.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-900'
              : 'border-emerald-200 bg-emerald-50 text-emerald-900'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Allowed Status Transitions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">
          Status Workflow
        </h2>
        {allowedNext.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            This order is in a final status ({order.status}) and cannot be changed further.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-3">
            {allowedNext.map((nextStatus) => (
              <button
                key={nextStatus}
                type="button"
                disabled={updating}
                onClick={() => handleTransition(nextStatus)}
                className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-bold transition disabled:opacity-50 ${
                  nextStatus === 'Cancelled'
                    ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                    : 'bg-slate-950 text-white hover:bg-slate-800'
                }`}
              >
                {nextStatus === 'Cancelled' ? 'Cancel Order & Restore Stock' : `Mark as ${nextStatus}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Customer & Delivery Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer Info</h2>
          <p className="mt-2 font-bold text-slate-950">{order.customer_name}</p>
          <p className="text-slate-600">{order.customer_email}</p>
          <p className="text-slate-600">{order.customer_contact}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Delivery & Payment</h2>
          <p className="mt-2 text-slate-900">{order.delivery_address}</p>
          <p className="mt-2 font-bold text-slate-950">{order.payment_method}</p>
          {order.order_notes && (
            <p className="mt-2 text-xs text-slate-600">Notes: {order.order_notes}</p>
          )}
        </div>
      </div>

      {/* Order Item Snapshots */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Item (Snapshot)</th>
              <th className="px-4 py-3 text-right">Unit Price</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {(order.items || []).map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-semibold text-slate-950">
                  {item.product_name_snapshot}
                </td>
                <td className="px-4 py-3 text-right text-slate-700">
                  {formatPeso(item.unit_price_snapshot)}
                </td>
                <td className="px-4 py-3 text-right text-slate-700">{item.quantity}</td>
                <td className="px-4 py-3 text-right font-bold text-slate-950">
                  {formatPeso(item.line_total)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-slate-200 bg-slate-50 text-sm">
            <tr>
              <td colSpan={3} className="px-4 py-2.5 text-right font-semibold text-slate-600">
                Subtotal
              </td>
              <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                {formatPeso(order.subtotal)}
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="px-4 py-3 text-right text-base font-black text-slate-950">
                Total
              </td>
              <td className="px-4 py-3 text-right text-base font-black text-slate-950">
                {formatPeso(order.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
