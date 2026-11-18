import { CheckCircle2, Clock, DollarSign, Package, ShoppingCart, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/ui/StateFeedback';
import { fetchAdminOverview } from '../../data/api/admin.api';
import { useAsyncData } from '../../hooks/useAsyncData';
import { formatPeso } from '../../utils/money';

export function AdminOverviewPage() {
  const { data, loading, error, retry } = useAsyncData(() => fetchAdminOverview(), []);
  const summary = data?.data;

  if (loading) return <LoadingState label="Loading dashboard metrics..." />;
  if (error || !summary) return <ErrorState message={error} onRetry={retry} />;

  const cards = [
    {
      label: 'Total Products',
      note: 'Includes inactive records',
      value: summary.total_products,
      icon: Package,
      to: '/admin/products',
    },
    {
      label: 'Total Orders',
      note: 'Includes cancelled orders',
      value: summary.total_orders,
      icon: ShoppingCart,
      to: '/admin/orders',
    },
    {
      label: 'Pending / Completed',
      note: `${summary.pending_orders} pending · ${summary.completed_orders} completed`,
      value: `${summary.pending_orders} / ${summary.completed_orders}`,
      icon: Clock,
      to: '/admin/orders',
    },
    {
      label: 'Total Customers',
      note: 'Unique normalized checkout emails',
      value: summary.total_customers,
      icon: Users,
      to: '/admin/customers',
    },
    {
      label: 'Total Sales',
      note: 'Completed orders only',
      value: formatPeso(summary.total_sales),
      icon: DollarSign,
      highlight: true,
      to: '/admin/orders',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-slate-600">
          Live store metrics derived directly from PostgreSQL orders and products.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.to}
              className={`rounded-2xl border p-5 transition hover:shadow-md ${
                card.highlight
                  ? 'border-slate-900 bg-slate-950 text-white'
                  : 'border-slate-200 bg-white text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    card.highlight ? 'text-lime-400' : 'text-slate-500'
                  }`}
                >
                  {card.label}
                </span>
                <Icon className={`h-5 w-5 ${card.highlight ? 'text-lime-400' : 'text-slate-400'}`} />
              </div>
              <p className="mt-3 text-2xl font-black tracking-tight">{card.value}</p>
              <p className={`mt-1 text-xs ${card.highlight ? 'text-slate-300' : 'text-slate-500'}`}>
                {card.note}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Quick Actions
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            to="/admin/products"
            className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            Manage Products
          </Link>
          <Link
            to="/admin/orders"
            className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-800 hover:border-slate-950"
          >
            Review Orders
          </Link>
          <Link
            to="/admin/categories"
            className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-800 hover:border-slate-950"
          >
            Manage Categories
          </Link>
        </div>
      </div>
    </div>
  );
}
