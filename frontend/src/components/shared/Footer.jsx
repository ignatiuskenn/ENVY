import { Link } from 'react-router-dom';
import { EnvyPixelMark } from './EnvyPixelMark';

export function Footer() {
  return (
    <footer className="border-t border-[#262E36] bg-[#0B0E11] text-[#8A99AD]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <EnvyPixelMark className="h-5 w-5" />
            <p className="font-mono text-lg font-black tracking-[0.24em] text-[#F3F6F8]">
              ENVY ATHLETICS
            </p>
          </div>
          <p className="mt-3 text-sm text-[#8A99AD]">
            Performance apparel and tactical streetwear engineered for daily training. (Fictional demo store for CubeTech assessment.)
          </p>
        </div>

        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#24FF6A]">
            Navigation
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-[#F3F6F8]">Home</Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-[#F3F6F8]">Shop All Products</Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-[#F3F6F8]">Shopping Cart</Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-[#F3F6F8]">Customer Sign In</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#24FF6A]">
            Demo Contact (Fictional)
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-[#8A99AD]">
            <li>Email: support@envy-demo.test</li>
            <li>Phone: +63 917 000 0000 (Fictional)</li>
            <li>Address: 9th Ave, BGC, Taguig (Demo Only)</li>
          </ul>
          <div className="mt-4 flex gap-4 font-mono text-xs font-semibold uppercase tracking-wider text-[#8A99AD]">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#24FF6A]">
              Instagram
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-[#24FF6A]">
              Facebook
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-[#24FF6A]">
              X / Twitter
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-[#1E252B] px-4 py-4 text-center font-mono text-xs text-[#8A99AD]">
        © 2026 ENVY Athletics (Fictional Demo Store). All prices in PHP.
      </div>
    </footer>
  );
}
