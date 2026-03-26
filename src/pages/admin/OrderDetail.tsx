import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { sizeToNumber } from '../../lib/size';
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
  const [authed, setAuthed] = useState(false);
  const [trackingCompany, setTrackingCompany] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showTrackingForm, setShowTrackingForm] = useState(false);
  const [adminMemo, setAdminMemo] = useState('');
  const [memoSaving, setMemoSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate('/admin/login'); return; }
      setAuthed(true);
    });
  }, [navigate]);

  useEffect(() => {
    async function fetchOrder() {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      setOrder(data);
      if (data) {
        setTrackingCompany(data.tracking_company || '');
        setTrackingNumber(data.tracking_number || '');
        setAdminMemo(data.admin_memo || '');
      }
      setLoading(false);
    }
    fetchOrder();
  }, [id, authed]);

  async function changeStatus(newStatus: string) {
    if (!order || updating) return;

    // Shipped requires tracking info
    if (newStatus === 'shipped') {
      if (!showTrackingForm) {
        setShowTrackingForm(true);
        return;
      }
      if (!trackingCompany.trim() || !trackingNumber.trim()) {
        alert('택배사와 운송장 번호를 입력해주세요.');
        return;
      }
    }

    setUpdating(true);
    const updates: Record<string, unknown> = { status: newStatus };

    if (newStatus === 'paid') updates.paid_at = new Date().toISOString();
    if (newStatus === 'shipped') {
      updates.shipped_at = new Date().toISOString();
      updates.tracking_company = trackingCompany.trim();
      updates.tracking_number = trackingNumber.trim();
      setShowTrackingForm(false);
    }

    // Cancel: restore stock only if not already cancelled
    if (newStatus === 'cancelled' && order.status !== 'cancelled') {
      updates.cancelled_at = new Date().toISOString();
      if (order.items) {
        for (const item of order.items) {
          const { data: cur } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
          if (cur) {
            await supabase.from('products').update({ stock: cur.stock + item.quantity }).eq('id', item.product_id);
          }
        }
      }
    }

    const { data } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', order.id)
      .select('*')
      .single();

    if (data) setOrder(data);
    setUpdating(false);
  }

  async function saveMemo() {
    if (!order) return;
    setMemoSaving(true);
    const { data } = await supabase
      .from('orders')
      .update({ admin_memo: adminMemo.trim() || null })
      .eq('id', order.id)
      .select('*')
      .single();
    if (data) setOrder(data);
    setMemoSaving(false);
  }

  if (!authed || loading) return <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }} />;
  if (!order) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text2)' }}>주문을 찾을 수 없습니다.</div>;

  const formatPrice = (p: number) => `₩${p.toLocaleString('ko-KR')}`;

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

  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', border: '1px solid var(--border)',
    backgroundColor: 'transparent', fontSize: '13px', color: 'var(--text)', outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '24px', maxWidth: '720px', margin: '0 auto' }}>
      <Link to="/admin" style={{ fontSize: '12px', color: 'var(--text2)', letterSpacing: '2px', textTransform: 'uppercase' }}>
        &larr; 주문 관리
      </Link>

      <h1 style={{ fontFamily: 'monospace', fontSize: '20px', fontWeight: 400, marginTop: '24px', marginBottom: '8px' }}>
        {order.order_number}
      </h1>

      <span style={{
        display: 'inline-block', fontSize: '10px', letterSpacing: '2px', padding: '4px 10px',
        border: '1px solid var(--border)',
        color: order.status === 'cancelled' ? '#c44' : order.status === 'delivered' ? '#4a8' : 'var(--text2)',
        marginBottom: '32px',
      }}>
        {STATUS_LABELS[order.status]}
      </span>

      {/* Status buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {STATUS_LIST.map(s => (
          <button
            key={s}
            onClick={() => changeStatus(s)}
            disabled={updating || order.status === s || order.status === 'cancelled'}
            style={{
              fontSize: '11px', letterSpacing: '2px', padding: '8px 16px',
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
            fontSize: '11px', letterSpacing: '2px', padding: '8px 16px',
            border: '1px solid',
            borderColor: order.status === 'cancelled' ? '#c44' : 'var(--border)',
            color: '#c44', backgroundColor: 'transparent',
            opacity: (updating || order.status === 'cancelled') ? 0.4 : 1,
            cursor: (updating || order.status === 'cancelled') ? 'default' : 'pointer',
          }}
        >
          취소
        </button>
      </div>

      {/* Tracking form — shows when clicking 배송중 */}
      {showTrackingForm && (
        <div style={{ padding: '16px', border: '1px solid var(--border)', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text2)' }}>운송장 정보 (필수)</span>
          <input
            placeholder="택배사 (예: CJ대한통운)"
            value={trackingCompany}
            onChange={e => setTrackingCompany(e.target.value)}
            style={fieldStyle}
          />
          <input
            placeholder="운송장 번호"
            value={trackingNumber}
            onChange={e => setTrackingNumber(e.target.value)}
            style={fieldStyle}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => changeStatus('shipped')}
              disabled={updating}
              style={{
                padding: '8px 20px', fontSize: '11px', letterSpacing: '2px',
                backgroundColor: 'var(--text)', color: 'var(--bg)', cursor: 'pointer',
              }}
            >
              배송중 처리
            </button>
            <button
              onClick={() => setShowTrackingForm(false)}
              style={{ padding: '8px 20px', fontSize: '11px', letterSpacing: '2px', color: 'var(--text2)', border: '1px solid var(--border)' }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Tracking info display */}
      {order.tracking_company && order.tracking_number && (
        <div style={{ ...infoStyle, marginBottom: '32px', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
          <span style={labelStyle}>택배사</span><span>{order.tracking_company}</span>
          <span style={labelStyle}>운송장</span><span>{order.tracking_number}</span>
        </div>
      )}

      {/* Items */}
      <p className="label" style={{ marginBottom: '12px', marginTop: '24px' }}>제품</p>
      <div style={{ marginBottom: '32px' }}>
        {order.items && order.items.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: '12px', letterSpacing: '2px', color: 'var(--text2)' }}>{item.code}</span>
                  <span style={{ fontSize: '13px', marginLeft: '12px' }}>{item.name.replace(/^HAYANI\s*/i, '')}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text2)', marginLeft: '12px' }}>Size {sizeToNumber(item.size)} / {item.quantity}EA</span>
                </div>
                <span style={{ fontSize: '13px' }}>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        ) : (
          <span style={{ fontSize: '13px', color: 'var(--text3)' }}>-</span>
        )}
        <div style={{ ...infoStyle, marginTop: '16px' }}>
          <span style={labelStyle}>소계</span><span>{formatPrice(order.subtotal)}</span>
          <span style={labelStyle}>배송비</span><span>{formatPrice(order.shipping_fee)}</span>
          <span style={labelStyle}>합계</span><span style={{ fontWeight: 500 }}>{formatPrice(order.total_price)}</span>
        </div>
      </div>

      {/* Customer */}
      <p className="label" style={{ marginBottom: '12px' }}>고객</p>
      <div style={{ ...infoStyle, marginBottom: '32px' }}>
        <span style={labelStyle}>이름</span><span>{order.customer_name}</span>
        <span style={labelStyle}>이메일</span><span>{order.customer_email}</span>
        <span style={labelStyle}>연락처</span><span>{order.customer_phone}</span>
        <span style={labelStyle}>주소</span><span>{order.customer_address} {order.customer_address_detail || ''}</span>
        <span style={labelStyle}>배송메모</span><span>{order.delivery_memo || '-'}</span>
      </div>

      {/* Payment */}
      <p className="label" style={{ marginBottom: '12px' }}>결제</p>
      <div style={{ ...infoStyle, marginBottom: '32px' }}>
        <span style={labelStyle}>입금자명</span><span>{order.depositor_name}</span>
        <span style={labelStyle}>금액</span><span>{formatPrice(order.total_price)}</span>
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

      {/* Admin memo */}
      <p className="label" style={{ marginBottom: '12px' }}>관리자 메모</p>
      <div style={{ marginBottom: '32px' }}>
        <textarea
          value={adminMemo}
          onChange={e => setAdminMemo(e.target.value)}
          placeholder="내부 메모 (고객에게 보이지 않음)"
          style={{
            ...fieldStyle,
            minHeight: '80px',
            resize: 'vertical',
            fontFamily: 'inherit',
            marginBottom: '8px',
          }}
        />
        <button
          onClick={saveMemo}
          disabled={memoSaving}
          style={{
            padding: '6px 16px', fontSize: '11px', letterSpacing: '2px',
            backgroundColor: 'var(--text)', color: 'var(--bg)', cursor: 'pointer',
            opacity: memoSaving ? 0.5 : 1,
          }}
        >
          {memoSaving ? '저장중...' : '메모 저장'}
        </button>
      </div>
    </div>
  );
}
