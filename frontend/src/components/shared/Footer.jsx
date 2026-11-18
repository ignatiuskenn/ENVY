import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-950 text-neutral-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="text-lg font-black tracking-tight text-white">ENVY ATHLETICS</p>
          <p className="mt-2 text-sm text-neutral-400">
            Performance apparel and streetwear engineered for daily training. (Fictional demo store for CubeTech assessment.)
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Navigation</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-white">Home</Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-white">Shop All Products</Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-white">Shopping Cart</Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-white">Customer Sign In</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Demo Contact (Fictional)
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-neutral-400">
            <li>Email: support@envy-demo.test</li>
            <li>Phone: +63 917 000 0000 (Fictional)</li>
            <li>Address: 9th Ave, BGC, Taguig (Demo Only)</li>
          </ul>
          <div className="mt-4 flex gap-4 text-xs font-medium text-neutral-400">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white">
              Instagram
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white">
              Facebook
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-white">
              X / Twitter
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-800 px-4 py-4 text-center text-xs text-neutral-500">
        © 2026 ENVY Athletics (Fictional Demo Store). All prices in PHP.
      </div>
    </footer>
  );
}
