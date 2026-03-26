import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Order } from '../../types';

const STATUS_LABELS: Record<string, string> = {
  pending: '입금대기',
  paid: '입금확인',
  shipped: '배송중',
  delivered: '배송완료',
  cancelled: '취소',
};

const STATUS_FILTERS = ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchOrders();
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) navigate('/admin/login');
  }

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, product:products(*)')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/admin/login');
  }

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('ko-KR');
  const formatPrice = (p: number) => `₩${p.toLocaleString('ko-KR')}`;

  return (
    <div style={{ padding: '40px', maxWidth: '960px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
      }}>
        <Link to="/" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '16px',
          fontWeight: 300,
          letterSpacing: '0.12em',
          color: 'var(--text2)',
        }}>
          HAYANI
        </Link>
        <button
          onClick={handleLogout}
          style={{
            fontSize: '10px',
            letterSpacing: '2px',
            color: 'var(--text2)',
            textTransform: 'uppercase',
          }}
        >
          Logout
        </button>
      </div>

      {/* Admin nav */}
      <div style={{
        display: 'flex',
        gap: '24px',
        marginBottom: '40px',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '12px',
      }}>
        <span className="label" style={{ color: 'var(--text)', borderBottom: '1px solid var(--text)', paddingBottom: '12px', marginBottom: '-13px' }}>
          Orders
        </span>
        <Link to="/admin/products" className="label" style={{ transition: 'color 0.2s' }}>
          Products
        </Link>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '32px',
        flexWrap: 'wrap',
      }}>
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              fontSize: '10px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: filter === s ? 'var(--text)' : 'var(--text3)',
              borderBottom: filter === s ? '1px solid var(--text)' : '1px solid transparent',
              paddingBottom: '4px',
              transition: 'color 0.2s ease',
            }}
          >
            {s === 'all' ? `전체 (${orders.length})` : `${STATUS_LABELS[s]} (${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Order list */}
      {loading ? (
        <span className="label">Loading</span>
      ) : filtered.length === 0 ? (
        <span style={{ fontSize: '13px', color: 'var(--text3)' }}>주문이 없습니다.</span>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {filtered.map(order => (
            <Link
              key={order.id}
              to={`/admin/orders/${order.id}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 0',
                borderBottom: '1px solid var(--border)',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.6')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <div style={{ display: 'flex', gap: '24px', alignItems: 'baseline' }}>
                <span style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text2)', fontFamily: 'monospace' }}>
                  {order.order_number}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 300 }}>
                  {order.customer_name}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text2)' }}>
                  {order.product?.code} / {order.size}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'baseline' }}>
                <span style={{ fontSize: '11px', color: 'var(--text2)' }}>
                  {formatPrice(order.total_price)}
                </span>
                <span style={{
                  fontSize: '9px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: order.status === 'cancelled' ? 'var(--text3)' : 'var(--text2)',
                }}>
                  {STATUS_LABELS[order.status]}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text3)' }}>
                  {formatDate(order.created_at)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
