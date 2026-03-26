import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Main from './pages/Main';

const Product = lazy(() => import('./pages/Product'));
const Counter = lazy(() => import('./pages/Counter'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Complete = lazy(() => import('./pages/Complete'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminOrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminReport = lazy(() => import('./pages/admin/Report'));
const OrderCheck = lazy(() => import('./pages/OrderCheck'));
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
          <Route path="/counter" element={<Counter />} />
          <Route path="/counter/checkout" element={<Checkout />} />
          <Route path="/counter/complete" element={<Complete />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/report" element={<AdminReport />} />
          <Route path="/order" element={<OrderCheck />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
