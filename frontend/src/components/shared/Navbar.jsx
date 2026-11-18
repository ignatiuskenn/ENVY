import { LogOut, Menu, ShoppingBag, User, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../../data/context/useCart';
import { useCustomerAuth } from '../../data/context/useCustomerAuth';

export function Navbar() {
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useCustomerAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-neutral-950 underline underline-offset-4' : 'text-neutral-600 hover:text-neutral-950'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-black tracking-tighter text-neutral-950">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-neutral-950 text-xs font-black text-lime-400">
            E
          </span>
          ENVY
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <NavLink to="/" className={navClass} end>
            Home
          </NavLink>
          <NavLink to="/products" className={navClass}>
            Shop All
          </NavLink>
          {isAuthenticated ? (
            <div className="flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 font-semibold text-neutral-800">
                <User className="h-4 w-4 text-neutral-500" />
                {user?.name}
              </span>
              <button
                type="button"
                onClick={logout}
                className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-red-600"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <NavLink to="/login" className={navClass}>
                Sign In
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-full bg-neutral-950 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-neutral-800"
              >
                Register
              </NavLink>
            </div>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="relative inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-sm font-semibold text-neutral-900 transition hover:border-neutral-950"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Cart</span>
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-neutral-950 px-1.5 py-0.5 text-xs font-bold text-lime-400">
              {itemCount}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="inline-flex items-center justify-center rounded-lg border border-neutral-200 p-2 text-neutral-700 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-neutral-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            <NavLink to="/" className={navClass} end onClick={() => setMobileOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/products" className={navClass} onClick={() => setMobileOpen(false)}>
              Shop All
            </NavLink>
            <NavLink to="/cart" className={navClass} onClick={() => setMobileOpen(false)}>
              Cart ({itemCount})
            </NavLink>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="text-left text-sm font-semibold text-red-600"
              >
                Sign Out ({user?.name})
              </button>
            ) : (
              <>
                <NavLink to="/login" className={navClass} onClick={() => setMobileOpen(false)}>
                  Sign In
                </NavLink>
                <NavLink to="/register" className={navClass} onClick={() => setMobileOpen(false)}>
                  Register
                </NavLink>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
