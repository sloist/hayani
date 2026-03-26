import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Order } from '../../types';

const STATUS_LIST = ['pending', 'paid', 'shipped', 'delivered'] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: '입금대기',
  paid: '입금확인',
  shipped: '배송중',
  delivered: '배송완료',
  cancelled: '취소',
};

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
  if (!order) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text2)' }}>주문을 찾을 수 없습니다.</div>;

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
        &larr; 주문 관리
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
        padding: '4px 10px',
        border: '1px solid var(--border)',
        color: order.status === 'cancelled' ? '#c44' : order.status === 'delivered' ? '#4a8' : 'var(--text2)',
        marginBottom: '32px',
      }}>
        {STATUS_LABELS[order.status]}
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
              padding: '8px 16px',
              border: '1px solid',
              borderColor: order.status === s ? 'var(--text)' : 'var(--border)',
              color: order.status === s ? 'var(--text)' : 'var(--text2)',
              backgroundColor: order.status === s ? 'var(--bg2)' : 'transparent',
              opacity: (updating || order.status === 'cancelled') ? 0.4 : 1,
              cursor: (updating || order.status === s || order.status === 'cancelled') ? 'default' : 'pointer',
            }}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
        <button
          onClick={() => {
            if (confirm('이 주문을 취소하시겠습니까? 재고가 복구됩니다.')) changeStatus('cancelled');
          }}
          disabled={updating || order.status === 'cancelled'}
          style={{
            fontSize: '11px',
            letterSpacing: '2px',
            padding: '8px 16px',
            border: '1px solid',
            borderColor: order.status === 'cancelled' ? '#c44' : 'var(--border)',
            color: '#c44',
            backgroundColor: 'transparent',
            opacity: (updating || order.status === 'cancelled') ? 0.4 : 1,
            cursor: (updating || order.status === 'cancelled') ? 'default' : 'pointer',
          }}
        >
          취소
        </button>
      </div>

      {/* Product info */}
      <p className="label" style={{ marginBottom: '12px' }}>제품</p>
      <div style={{ ...infoStyle, marginBottom: '32px' }}>
        <span style={labelStyle}>코드</span><span>{order.product?.code || '-'}</span>
        <span style={labelStyle}>이름</span><span>{order.product?.name || '-'}</span>
        <span style={labelStyle}>사이즈</span><span>{order.size}</span>
        <span style={labelStyle}>수량</span><span>{order.quantity}</span>
        <span style={labelStyle}>합계</span><span>{order.total_price.toLocaleString()}원</span>
      </div>

      {/* Customer info */}
      <p className="label" style={{ marginBottom: '12px' }}>고객</p>
      <div style={{ ...infoStyle, marginBottom: '32px' }}>
        <span style={labelStyle}>이름</span><span>{order.customer_name}</span>
        <span style={labelStyle}>이메일</span><span>{order.customer_email}</span>
        <span style={labelStyle}>연락처</span><span>{order.customer_phone}</span>
        <span style={labelStyle}>주소</span><span>{order.customer_address} {order.customer_address_detail || ''}</span>
        <span style={labelStyle}>배송메모</span><span>{order.delivery_memo || '-'}</span>
      </div>

      {/* Payment info */}
      <p className="label" style={{ marginBottom: '12px' }}>결제</p>
      <div style={{ ...infoStyle, marginBottom: '32px' }}>
        <span style={labelStyle}>입금자명</span><span>{order.depositor_name}</span>
        <span style={labelStyle}>금액</span><span>{order.total_price.toLocaleString()}원</span>
      </div>

      {/* Timestamps */}
      <p className="label" style={{ marginBottom: '12px' }}>일시</p>
      <div style={{ ...infoStyle, marginBottom: '32px' }}>
        <span style={labelStyle}>주문일시</span><span>{formatDate(order.created_at)}</span>
        <span style={labelStyle}>입금확인</span><span>{formatDate(order.paid_at)}</span>
        <span style={labelStyle}>배송중</span><span>{formatDate(order.shipped_at)}</span>
        {order.cancelled_at && (
          <><span style={labelStyle}>취소</span><span>{formatDate(order.cancelled_at)}</span></>
        )}
      </div>
    </div>
  );
}
