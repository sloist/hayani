import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Main from './pages/Main';

const Product = lazy(() => import('./pages/Product'));
const Order = lazy(() => import('./pages/Order'));
const OrderComplete = lazy(() => import('./pages/OrderComplete'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminOrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));

const Loading = () => <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }} />;

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/wear/:id" element={<Product />} />
          <Route path="/order" element={<Order />} />
          <Route path="/order/complete" element={<OrderComplete />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
