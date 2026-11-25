import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './components/shared/AdminLayout';
import { Footer } from './components/shared/Footer';
import { Navbar } from './components/shared/Navbar';
import { AdminAuthProvider } from './data/context/AdminAuthContext';
import { CartProvider } from './data/context/CartContext';
import { CustomerAuthProvider } from './data/context/CustomerAuthContext';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminOrderDetailPage } from './pages/admin/AdminOrderDetailPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { CartPage } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { CustomerLoginPage } from './pages/customer/CustomerLoginPage';
import { CustomerRegisterPage } from './pages/customer/CustomerRegisterPage';
import { HomePage } from './pages/customer/HomePage';
import { MyOrdersPage } from './pages/customer/MyOrdersPage';
import { OrderConfirmationPage } from './pages/customer/OrderConfirmationPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { ProductsPage } from './pages/customer/ProductsPage';

function StorefrontShell() {
  return (
    <div className="flex min-h-screen flex-col bg-[#111518] text-[#F3F6F8]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <CustomerAuthProvider>
          <CartProvider>
            <Routes>
              <Route element={<StorefrontShell />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                <Route path="/orders" element={<MyOrdersPage />} />
                <Route path="/login" element={<CustomerLoginPage />} />
                <Route path="/register" element={<CustomerRegisterPage />} />
              </Route>

              <Route path="/admin/login" element={<Navigate to="/login" replace />} />

              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverviewPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                <Route path="customers" element={<AdminCustomersPage />} />
              </Route>
            </Routes>
          </CartProvider>
        </CustomerAuthProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
