import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Order } from '../types';
import BackButton from '../components/BackButton';

const STATUS_LABELS: Record<string, string> = {
  pending: '입금대기',
  paid: '입금확인',
  shipped: '배송중',
  delivered: '배송완료',
  cancelled: '취소',
};

export default function OrderCheck() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !phone.trim()) return;

    setLoading(true);
    setSearched(false);
    setSelected(null);

    // Normalize phone: remove dashes, spaces, dots
    const normalizedPhone = phone.trim().replace(/[-\s.]/g, '');

    const { data } = await supabase
      .from('orders')
      .select('*')
      .ilike('customer_email', email.trim())
      .order('created_at', { ascending: false });

    // Filter by phone client-side (handles format differences)
    const results = (data || []).filter(o =>
      o.customer_phone.replace(/[-\s.]/g, '') === normalizedPhone
    );
    setOrders(results);
    setSearched(true);
    setLoading(false);

    if (results.length === 1) {
      setSelected(results[0]);
    }
  }

  const formatPrice = (p: number) => `₩${p.toLocaleString('ko-KR')}`;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 0', border: 'none', borderBottom: '1px solid var(--border)',
    backgroundColor: 'transparent', fontSize: '14px', fontWeight: 400, color: 'var(--text)', outline: 'none',
  };

  function renderDetail(order: Order) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {orders.length > 1 && (
          <button
            onClick={() => setSelected(null)}
            style={{ alignSelf: 'flex-start', fontSize: '12px', color: 'var(--text2)', fontWeight: 400, letterSpacing: '2px' }}
          >
            &larr; Back
          </button>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 500, letterSpacing: '1px' }}>
            {order.order_number}
          </span>
          <span style={{
            fontSize: '11px', letterSpacing: '2px', padding: '4px 10px',
            border: '1px solid var(--border)',
            color: order.status === 'cancelled' ? '#c44' : order.status === 'delivered' ? '#4a8' : 'var(--text)',
            fontWeight: 500,
          }}>
            {STATUS_LABELS[order.status]}
          </span>
        </div>

        {order.items && order.items.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: 300 }}>
                  {item.code} / {item.size} / {item.quantity}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 500 }}>
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Total</span>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{formatPrice(order.total_price)}</span>
        </div>

        {/* Tracking info */}
        {order.tracking_company && order.tracking_number && (
          <div style={{ padding: '16px', backgroundColor: 'var(--bg2)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text2)', fontWeight: 400 }}>{order.tracking_company}</span>
            <span style={{ fontSize: '14px', fontWeight: 500, letterSpacing: '1px' }}>{order.tracking_number}</span>
          </div>
        )}

        <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 300 }}>
          {new Date(order.created_at).toLocaleDateString('ko-KR')}
        </div>
      </div>
    );
  }

  function renderList() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: 'var(--border)' }}>
        {orders.map(order => (
          <button
            key={order.id}
            onClick={() => setSelected(order)}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 0', backgroundColor: 'var(--bg)', width: '100%', textAlign: 'left',
            }}
          >
            <div>
              <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 500, letterSpacing: '1px' }}>
                {order.order_number}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 300, marginLeft: '12px' }}>
                {new Date(order.created_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
            <span style={{
              fontSize: '10px', letterSpacing: '2px',
              color: order.status === 'cancelled' ? '#c44' : order.status === 'delivered' ? '#4a8' : 'var(--text2)',
              fontWeight: 500,
            }}>
              {STATUS_LABELS[order.status]}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '100px 40px 80px' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, padding: '28px 40px', zIndex: 100, backgroundColor: 'var(--bg)' }}>
        <BackButton />
      </div>

      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 400, letterSpacing: '0.06em', marginBottom: '40px' }}>
        Order
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="tel"
          placeholder="연락처"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
          style={inputStyle}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '8px',
            padding: '14px 0',
            backgroundColor: loading ? 'var(--border)' : 'var(--text)',
            color: loading ? 'var(--text3)' : 'var(--bg)',
            fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 500,
            border: 'none', cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? 'Loading...' : 'Check'}
        </button>
      </form>

      {searched && orders.length === 0 && (
        <p style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: 300, textAlign: 'center' }}>
          주문을 찾을 수 없습니다.
        </p>
      )}

      {selected ? renderDetail(selected) : orders.length > 1 ? renderList() : null}
    </div>
  );
}
