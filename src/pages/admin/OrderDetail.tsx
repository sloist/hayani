import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Order } from '../../types';

const STATUS_LIST = ['pending', 'paid', 'shipped', 'delivered'] as const;

function formatDate(d: string | null) {
  if (!d) return '-';
  return new Date(d).toLocaleString('ko-KR');
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/admin/login');
    });
  }, [navigate]);

  useEffect(() => {
    async function fetchOrder() {
      const { data } = await supabase
        .from('orders')
        .select('*, product:products(*)')
        .eq('id', id)
        .single();
      setOrder(data);
      setLoading(false);
    }
    fetchOrder();
  }, [id]);

  async function changeStatus(newStatus: string) {
    if (!order || updating) return;
    setUpdating(true);

    const updates: Record<string, unknown> = { status: newStatus };

    if (newStatus === 'paid') updates.paid_at = new Date().toISOString();
    if (newStatus === 'shipped') updates.shipped_at = new Date().toISOString();

    if (newStatus === 'cancelled') {
      updates.cancelled_at = new Date().toISOString();
      // Restore product stock
      if (order.product) {
        await supabase
          .from('products')
          .update({ stock: order.product.stock + order.quantity })
          .eq('id', order.product_id);
      }
    }

    const { data } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', order.id)
      .select('*, product:products(*)')
      .single();

    if (data) setOrder(data);
    setUpdating(false);
  }

  if (loading) return <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }} />;
  if (!order) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text2)' }}>Order not found.</div>;

  const infoStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '120px 1fr',
    gap: '8px 16px',
    fontSize: '13px',
    lineHeight: '2',
  };

  const labelStyle: React.CSSProperties = {
    color: 'var(--text2)',
    fontSize: '12px',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '24px', maxWidth: '720px', margin: '0 auto' }}>
      {/* Back */}
      <Link to="/admin" style={{ fontSize: '12px', color: 'var(--text2)', letterSpacing: '2px', textTransform: 'uppercase' }}>
        &larr; Orders
      </Link>

      {/* Order number */}
      <h1 style={{
        fontFamily: 'monospace',
        fontSize: '20px',
        fontWeight: 400,
        marginTop: '24px',
        marginBottom: '8px',
      }}>
        {order.order_number}
      </h1>

      <span style={{
        display: 'inline-block',
        fontSize: '10px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        padding: '4px 10px',
        border: '1px solid var(--border)',
        color: order.status === 'cancelled' ? '#c44' : order.status === 'delivered' ? '#4a8' : 'var(--text2)',
        marginBottom: '32px',
      }}>
        {order.status}
      </span>

      {/* Status buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '40px', flexWrap: 'wrap' }}>
        {STATUS_LIST.map(s => (
          <button
            key={s}
            onClick={() => changeStatus(s)}
            disabled={updating || order.status === s || order.status === 'cancelled'}
            style={{
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              padding: '8px 16px',
              border: '1px solid',
              borderColor: order.status === s ? 'var(--text)' : 'var(--border)',
              color: order.status === s ? 'var(--text)' : 'var(--text2)',
              backgroundColor: order.status === s ? 'var(--bg2)' : 'transparent',
              opacity: (updating || order.status === 'cancelled') ? 0.4 : 1,
              cursor: (updating || order.status === s || order.status === 'cancelled') ? 'default' : 'pointer',
            }}
          >
            {s}
          </button>
        ))}
        <button
          onClick={() => {
            if (confirm('Cancel this order? Stock will be restored.')) changeStatus('cancelled');
          }}
          disabled={updating || order.status === 'cancelled'}
          style={{
            fontSize: '11px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            padding: '8px 16px',
            border: '1px solid',
            borderColor: order.status === 'cancelled' ? '#c44' : 'var(--border)',
            color: '#c44',
            backgroundColor: 'transparent',
            opacity: (updating || order.status === 'cancelled') ? 0.4 : 1,
            cursor: (updating || order.status === 'cancelled') ? 'default' : 'pointer',
          }}
        >
          Cancel
        </button>
      </div>

      {/* Product info */}
      <p className="label" style={{ marginBottom: '12px' }}>Product</p>
      <div style={{ ...infoStyle, marginBottom: '32px' }}>
        <span style={labelStyle}>Code</span><span>{order.product?.code || '-'}</span>
        <span style={labelStyle}>Name</span><span>{order.product?.name || '-'}</span>
        <span style={labelStyle}>Size</span><span>{order.size}</span>
        <span style={labelStyle}>Quantity</span><span>{order.quantity}</span>
        <span style={labelStyle}>Total</span><span>{order.total_price.toLocaleString()}원</span>
      </div>

      {/* Customer info */}
      <p className="label" style={{ marginBottom: '12px' }}>Customer</p>
      <div style={{ ...infoStyle, marginBottom: '32px' }}>
        <span style={labelStyle}>Name</span><span>{order.customer_name}</span>
        <span style={labelStyle}>Email</span><span>{order.customer_email}</span>
        <span style={labelStyle}>Phone</span><span>{order.customer_phone}</span>
        <span style={labelStyle}>Address</span><span>{order.customer_address} {order.customer_address_detail || ''}</span>
        <span style={labelStyle}>Delivery Memo</span><span>{order.delivery_memo || '-'}</span>
      </div>

      {/* Payment info */}
      <p className="label" style={{ marginBottom: '12px' }}>Payment</p>
      <div style={{ ...infoStyle, marginBottom: '32px' }}>
        <span style={labelStyle}>Depositor</span><span>{order.depositor_name}</span>
        <span style={labelStyle}>Amount</span><span>{order.total_price.toLocaleString()}원</span>
      </div>

      {/* Timestamps */}
      <p className="label" style={{ marginBottom: '12px' }}>Timestamps</p>
      <div style={{ ...infoStyle, marginBottom: '32px' }}>
        <span style={labelStyle}>Created</span><span>{formatDate(order.created_at)}</span>
        <span style={labelStyle}>Paid</span><span>{formatDate(order.paid_at)}</span>
        <span style={labelStyle}>Shipped</span><span>{formatDate(order.shipped_at)}</span>
        {order.cancelled_at && (
          <><span style={labelStyle}>Cancelled</span><span>{formatDate(order.cancelled_at)}</span></>
        )}
      </div>
    </div>
  );
}
