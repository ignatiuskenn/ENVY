import { LogOut, Menu, ShoppingBag, User, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../../data/context/useCart';
import { useCustomerAuth } from '../../data/context/useCustomerAuth';
import { EnvyPixelMark } from './EnvyPixelMark';

export function Navbar() {
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useCustomerAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navClass = ({ isActive }) =>
    `font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
      isActive ? 'text-[#24FF6A]' : 'text-[#8A99AD] hover:text-[#F3F6F8]'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-[#262E36] bg-[#111518]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-mono text-xl font-black tracking-[0.26em] text-[#F3F6F8]"
        >
          <EnvyPixelMark className="h-6 w-6" />
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
            <div className="flex items-center gap-4 text-xs">
              <NavLink to="/orders" className={navClass}>
                My Orders
              </NavLink>
              <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-[#F3F6F8]">
                <User className="h-3.5 w-3.5 text-[#24FF6A]" />
                {user?.name}
              </span>
              <button
                type="button"
                onClick={logout}
                className="inline-flex cursor-pointer items-center gap-1 font-mono font-semibold uppercase tracking-wider text-[#8A99AD] hover:text-red-400"
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
                className="rounded-sm bg-[#24FF6A] px-3.5 py-1.5 font-mono text-xs font-black uppercase tracking-wider text-[#0B0E11] transition hover:bg-[#4dff88]"
              >
                Register
              </NavLink>
            </div>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="relative inline-flex items-center gap-2 rounded-sm border border-[#262E36] bg-[#171C21] px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#F3F6F8] transition hover:border-[#24FF6A]"
          >
            <ShoppingBag className="h-4 w-4 text-[#24FF6A]" />
            <span>Cart</span>
            <span className="inline-flex min-w-5 items-center justify-center rounded-xs bg-[#24FF6A] px-1.5 py-0.5 text-[11px] font-black text-[#0B0E11]">
              {itemCount}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="inline-flex items-center justify-center rounded-sm border border-[#262E36] bg-[#171C21] p-2 text-[#F3F6F8] md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-[#262E36] bg-[#111518] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3.5">
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
              <>
                <NavLink to="/orders" className={navClass} onClick={() => setMobileOpen(false)}>
                  My Orders
                </NavLink>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="text-left font-mono text-xs font-bold uppercase tracking-wider text-red-400"
                >
                  Sign Out ({user?.name})
                </button>
              </>
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
