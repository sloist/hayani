import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Order } from '../../types';

const STATUS_LABELS: Record<string, string> = {
  pending: '입금대기',
  paid: '입금확인',
  shipped: '배송중',
  delivered: '배송완료',
  cancelled: '취소',
};

const STATUS_FLOW = ['pending', 'paid', 'shipped', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchOrder();
  }, [id]);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) navigate('/admin/login');
  }

  async function fetchOrder() {
    if (!id) return;
    const { data } = await supabase
      .from('orders')
      .select('*, product:products(*)')
      .eq('id', id)
      .single();
    setOrder(data);
    setLoading(false);
  }

  async function updateStatus(newStatus: string) {
    if (!order) return;

    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'paid') updates.paid_at = new Date().toISOString();
    if (newStatus === 'shipped') updates.shipped_at = new Date().toISOString();
    if (newStatus === 'cancelled') {
      updates.cancelled_at = new Date().toISOString();
      // Restore stock
      if (order.product) {
        await supabase
          .from('products')
          .update({ stock: order.product.stock + order.quantity })
          .eq('id', order.product_id);
      }
    }

    await supabase
      .from('orders')
      .update(updates)
      .eq('id', order.id);

    fetchOrder();
  }

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleString('ko-KR') : '-';
  const formatPrice = (p: number) => `₩${p.toLocaleString('ko-KR')}`;

  if (loading) return <div style={{ minHeight: '100vh' }} />;
  if (!order) return null;

  return (
    <div style={{ padding: '40px', maxWidth: '640px', margin: '0 auto' }}>
      <Link
        to="/admin"
        style={{
          fontSize: '10px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: 'var(--text2)',
          marginBottom: '48px',
          display: 'inline-block',
        }}
      >
        &larr; Orders
      </Link>

      <div style={{ marginBottom: '32px' }}>
        <span style={{
          fontSize: '11px',
          letterSpacing: '2px',
          color: 'var(--text2)',
          fontFamily: 'monospace',
        }}>
          {order.order_number}
        </span>
      </div>

      {/* Status */}
      <div style={{
        padding: '24px 0',
        borderBottom: '1px solid var(--border)',
        marginBottom: '24px',
      }}>
        <span className="label" style={{ marginBottom: '16px', display: 'block' }}>상태</span>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {STATUS_FLOW.map(s => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              style={{
                padding: '8px 16px',
                fontSize: '10px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                border: order.status === s ? '1px solid var(--text)' : '1px solid var(--border)',
                color: order.status === s ? 'var(--text)' : 'var(--text2)',
                backgroundColor: 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
          {order.status !== 'cancelled' && (
            <button
              onClick={() => {
                if (confirm('주문을 취소하시겠습니까?')) updateStatus('cancelled');
              }}
              style={{
                padding: '8px 16px',
                fontSize: '10px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                border: '1px solid var(--border)',
                color: 'var(--text3)',
                backgroundColor: 'transparent',
              }}
            >
              취소
            </button>
          )}
          {order.status === 'cancelled' && (
            <span style={{
              padding: '8px 16px',
              fontSize: '10px',
              letterSpacing: '2px',
              color: 'var(--text3)',
            }}>
              취소됨
            </span>
          )}
        </div>
      </div>

      {/* Product */}
      <div style={{
        paddingBottom: '24px',
        borderBottom: '1px solid var(--border)',
        marginBottom: '24px',
      }}>
        <span className="label" style={{ marginBottom: '12px', display: 'block' }}>제품</span>
        <div style={{ fontSize: '13px', fontWeight: 300, lineHeight: '2' }}>
          <div>{order.product?.name} ({order.product?.code})</div>
          <div>{order.size} / {order.quantity}개</div>
          <div>{formatPrice(order.total_price)}</div>
        </div>
      </div>

      {/* Customer */}
      <div style={{
        paddingBottom: '24px',
        borderBottom: '1px solid var(--border)',
        marginBottom: '24px',
      }}>
        <span className="label" style={{ marginBottom: '12px', display: 'block' }}>주문자</span>
        <div style={{ fontSize: '13px', fontWeight: 300, lineHeight: '2' }}>
          <div>{order.customer_name}</div>
          <div>{order.customer_phone}</div>
          <div>{order.customer_address} {order.customer_address_detail}</div>
          {order.delivery_memo && <div style={{ color: 'var(--text2)' }}>{order.delivery_memo}</div>}
        </div>
      </div>

      {/* Payment */}
      <div style={{
        paddingBottom: '24px',
        marginBottom: '24px',
      }}>
        <span className="label" style={{ marginBottom: '12px', display: 'block' }}>입금</span>
        <div style={{ fontSize: '13px', fontWeight: 300, lineHeight: '2' }}>
          <div>입금자명: {order.depositor_name}</div>
          <div>주문일시: {formatDate(order.created_at)}</div>
          <div>입금확인: {formatDate(order.paid_at)}</div>
          <div>배송시작: {formatDate(order.shipped_at)}</div>
        </div>
      </div>
    </div>
  );
}
