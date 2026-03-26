import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Main from './pages/Main';

const Product = lazy(() => import('./pages/Product'));
const Box = lazy(() => import('./pages/Box'));
const BoxOrder = lazy(() => import('./pages/BoxOrder'));
const BoxComplete = lazy(() => import('./pages/BoxComplete'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminOrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
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
          <Route path="/box" element={<Box />} />
          <Route path="/box/order" element={<BoxOrder />} />
          <Route path="/box/complete" element={<BoxComplete />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/order/check" element={<OrderCheck />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
