import {
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  Store,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../data/context/useAdminAuth';
import { LoadingState } from '../ui/StateFeedback';

const NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/customers', label: 'Customers', icon: Users },
];

export function AdminLayout() {
  const { isAuthenticated, checking, user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20">
        <LoadingState label="Verifying demo admin session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
      isActive
        ? 'bg-lime-400 text-slate-950'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-slate-950 p-5 text-white lg:flex">
        <div className="flex items-center gap-2.5 pb-6">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-lime-400 text-sm font-black text-slate-950">
            E
          </span>
          <div>
            <p className="text-sm font-black tracking-tight">ENVY ADMIN</p>
            <p className="text-[11px] font-medium text-slate-400">Demo Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-slate-800 pt-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <Store className="h-4 w-4" />
            View Storefront
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-red-400 hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
            Sign Out ({user?.name})
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open admin menu"
            className="rounded-lg border border-slate-200 p-2 text-slate-700"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-black tracking-tight text-slate-950">ENVY ADMIN</span>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign out"
            className="rounded-lg p-2 text-red-600"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>

        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="fixed inset-0 bg-slate-950/60" onClick={() => setDrawerOpen(false)} />
            <div className="relative flex w-64 flex-col bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between pb-6">
                <span className="text-sm font-black">ENVY ADMIN</span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close admin menu"
                  className="rounded-lg p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1.5">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setDrawerOpen(false)}
                      className={linkClass}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>
              <Link
                to="/"
                onClick={() => setDrawerOpen(false)}
                className="mt-4 flex items-center gap-2 rounded-xl border border-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-300"
              >
                <Store className="h-4 w-4" />
                View Storefront
              </Link>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
