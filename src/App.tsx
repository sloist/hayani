import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Wear from './pages/Wear';
import Product from './pages/Product';
import Order from './pages/Order';
import OrderComplete from './pages/OrderComplete';
import About from './pages/About';
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import OrderDetail from './pages/admin/OrderDetail';

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/wear" element={<PublicLayout><Wear /></PublicLayout>} />
        <Route path="/wear/:id" element={<PublicLayout><Product /></PublicLayout>} />
        <Route path="/order" element={<PublicLayout><Order /></PublicLayout>} />
        <Route path="/order/complete" element={<PublicLayout><OrderComplete /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />

        {/* Admin — no header/footer */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/orders/:id" element={<OrderDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
