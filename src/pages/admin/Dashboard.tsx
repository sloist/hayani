import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Order } from '../../types';

const STATUSES = ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'] as const;

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/admin/login');
    });
  }, [navigate]);

  useEffect(() => {
    async function fetchOrders() {
      const { data } = await supabase
        .from('orders')
        .select('*, product:products(*)')
        .order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    }
    fetchOrders();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/admin/login');
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <Link to="/" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '22px',
          fontWeight: 300,
          letterSpacing: '0.14em',
        }}>
          HAYANI
        </Link>
        <button onClick={handleLogout} className="label" style={{ color: 'var(--text2)' }}>
          Logout
        </button>
      </div>

      {/* Nav tabs */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <span className="label" style={{ color: 'var(--text)' }}>Orders</span>
        <Link to="/admin/products" className="label" style={{ color: 'var(--text3)' }}>Products</Link>
      </div>

      {/* Status filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              padding: '6px 12px',
              border: '1px solid',
              borderColor: filter === s ? 'var(--text)' : 'var(--border)',
              color: filter === s ? 'var(--text)' : 'var(--text2)',
              backgroundColor: filter === s ? 'var(--bg2)' : 'transparent',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <p style={{ color: 'var(--text2)', fontSize: '13px' }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text2)', fontSize: '13px' }}>No orders found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: 'var(--border)' }}>
          {/* Header row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr 100px 60px 100px 90px 100px',
            gap: '12px',
            padding: '10px 16px',
            backgroundColor: 'var(--bg2)',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            color: 'var(--text2)',
          }}>
            <span>Order</span>
            <span>Customer</span>
            <span>Product</span>
            <span>Size</span>
            <span style={{ textAlign: 'right' }}>Total</span>
            <span>Status</span>
            <span>Date</span>
          </div>

          {filtered.map(order => (
            <Link
              key={order.id}
              to={`/admin/orders/${order.id}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 100px 60px 100px 90px 100px',
                gap: '12px',
                padding: '14px 16px',
                backgroundColor: 'var(--bg)',
                fontSize: '13px',
                alignItems: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg2)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg)')}
            >
              <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{order.order_number}</span>
              <span>{order.customer_name}</span>
              <span style={{ color: 'var(--text2)', fontSize: '12px' }}>{order.product?.code || '-'}</span>
              <span style={{ color: 'var(--text2)' }}>{order.size}</span>
              <span style={{ textAlign: 'right' }}>{order.total_price.toLocaleString()}원</span>
              <span style={{
                fontSize: '10px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: order.status === 'cancelled' ? '#c44' : order.status === 'delivered' ? '#4a8' : 'var(--text2)',
              }}>
                {order.status}
              </span>
              <span style={{ color: 'var(--text2)', fontSize: '12px' }}>
                {new Date(order.created_at).toLocaleDateString('ko-KR')}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
