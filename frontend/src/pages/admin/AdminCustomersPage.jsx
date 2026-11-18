import { EmptyState, ErrorState, LoadingState } from '../../components/ui/StateFeedback';
import { fetchAdminCustomers } from '../../data/api/admin.api';
import { useAsyncData } from '../../hooks/useAsyncData';
import { formatPeso } from '../../utils/money';

export function AdminCustomersPage() {
  const { data, loading, error, retry } = useAsyncData(() => fetchAdminCustomers(), []);
  const customers = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950">Customers</h1>
        <p className="mt-1 text-sm text-slate-600">
          Read-only summary derived from guest checkout orders (grouped by normalized email).
        </p>
      </div>

      {loading ? (
        <LoadingState label="Loading customer summary..." />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : customers.length === 0 ? (
        <EmptyState
          title="No customers yet"
          description="Customers appear here automatically once guest orders are placed."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3 text-right">Orders</th>
                <th className="px-4 py-3 text-right">Completed Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {customers.map((c) => (
                <tr key={c.email} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-950">{c.name}</td>
                  <td className="px-4 py-3 text-slate-600">{c.email}</td>
                  <td className="px-4 py-3 text-slate-600">{c.contact}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">{c.order_count}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-950">
                    {formatPeso(c.completed_total)}
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
