import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { Footer } from './components/shared/Footer';
import { Navbar } from './components/shared/Navbar';
import { CartProvider } from './data/context/CartContext';
import { CartPage } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { HomePage } from './pages/customer/HomePage';
import { OrderConfirmationPage } from './pages/customer/OrderConfirmationPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { ProductsPage } from './pages/customer/ProductsPage';

function AdminPlaceholder() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-black text-neutral-950">Admin Dashboard (Phase 3)</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Demo admin login and management screens will be wired in Phase 3.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white"
      >
        Back to Storefront
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="flex min-h-screen flex-col bg-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
              <Route path="/admin/*" element={<AdminPlaceholder />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
