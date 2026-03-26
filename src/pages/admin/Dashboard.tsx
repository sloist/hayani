import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { sizeToNumber } from '../../lib/size';
import type { Order } from '../../types';

const STATUSES = ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'] as const;
const BATCH_TARGETS = ['paid', 'shipped', 'delivered', 'cancelled'] as const;

const STATUS_LABELS: Record<string, string> = {
  all: '전체',
  pending: '입금대기',
  paid: '입금확인',
  shipped: '배송중',
  delivered: '배송완료',
  cancelled: '취소',
};

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchUpdating, setBatchUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate('/admin/login'); return; }
      setAuthed(true);
    });
  }, [navigate]);

  useEffect(() => {
    if (!authed) return;
    async function fetchOrders() {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    }
    fetchOrders();
  }, [authed]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/admin/login');
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  // Summary stats
  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter(o => o.created_at.slice(0, 10) === today).length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthRevenue = orders
    .filter(o => o.created_at.slice(0, 7) === thisMonth && o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total_price, 0);

  function getItemsSummary(order: Order): string {
    if (!order.items || order.items.length === 0) return '-';
    const name = order.items[0].name.replace(/^HAYANI\s*/i, '');
    if (order.items.length === 1) return name;
    return `${name} 외 ${order.items.length - 1}`;
  }

  function getSizesSummary(order: Order): string {
    if (!order.items || order.items.length === 0) return '-';
    return order.items.map(i => sizeToNumber(i.size)).join(', ');
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(o => o.id)));
    }
  }

  async function batchChangeStatus(newStatus: string) {
    if (selected.size === 0 || batchUpdating) return;
    const msg = `선택된 ${selected.size}건을 "${STATUS_LABELS[newStatus]}"(으)로 변경하시겠습니까?`;
    if (!confirm(msg)) return;

    setBatchUpdating(true);
    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'paid') updates.paid_at = new Date().toISOString();
    if (newStatus === 'shipped') updates.shipped_at = new Date().toISOString();
    if (newStatus === 'cancelled') updates.cancelled_at = new Date().toISOString();

    // Restore stock for cancellations
    if (newStatus === 'cancelled') {
      for (const id of selected) {
        const order = orders.find(o => o.id === id);
        if (order && order.status !== 'cancelled' && order.items) {
          for (const item of order.items) {
            const { data: cur } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
            if (cur) {
              await supabase.from('products').update({ stock: cur.stock + item.quantity }).eq('id', item.product_id);
            }
          }
        }
      }
    }

    for (const id of selected) {
      await supabase.from('orders').update(updates).eq('id', id);
    }

    // Refresh
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(data || []);
    setSelected(new Set());
    setBatchUpdating(false);
  }

  if (!authed) return <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }} />;

  const cardStyle: React.CSSProperties = {
    flex: '1 1 0', padding: '16px 20px', backgroundColor: 'var(--bg2)',
    display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '140px',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <Link to="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 300, letterSpacing: '0.14em' }}>
          HAYANI
        </Link>
        <button onClick={handleLogout} className="label" style={{ color: 'var(--text2)' }}>로그아웃</button>
      </div>

      {/* Nav tabs */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <span className="label" style={{ color: 'var(--text)' }}>주문 관리</span>
        <Link to="/admin/products" className="label" style={{ color: 'var(--text3)' }}>제품 관리</Link>
        <Link to="/admin/report" className="label" style={{ color: 'var(--text3)' }}>매출</Link>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={cardStyle}>
          <span style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text2)' }}>오늘</span>
          <span style={{ fontSize: '20px', fontWeight: 500 }}>{todayOrders}</span>
        </div>
        <div style={cardStyle}>
          <span style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text2)' }}>입금대기</span>
          <span style={{ fontSize: '20px', fontWeight: 500, color: pendingCount > 0 ? '#c44' : 'var(--text)' }}>{pendingCount}</span>
        </div>
        <div style={cardStyle}>
          <span style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text2)' }}>이번 달</span>
          <span style={{ fontSize: '20px', fontWeight: 500 }}>{monthRevenue.toLocaleString()}원</span>
        </div>
      </div>

      {/* Status filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setFilter(s); setSelected(new Set()); }} style={{
            fontSize: '11px', letterSpacing: '2px', padding: '6px 12px',
            border: '1px solid', borderColor: filter === s ? 'var(--text)' : 'var(--border)',
            color: filter === s ? 'var(--text)' : 'var(--text2)',
            backgroundColor: filter === s ? 'var(--bg2)' : 'transparent', cursor: 'pointer',
          }}>
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Batch actions */}
      {selected.size > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--text2)' }}>{selected.size}건 선택</span>
          {BATCH_TARGETS.map(s => (
            <button key={s} onClick={() => batchChangeStatus(s)} disabled={batchUpdating} style={{
              fontSize: '10px', letterSpacing: '2px', padding: '6px 12px',
              border: '1px solid var(--border)', color: s === 'cancelled' ? '#c44' : 'var(--text2)',
              opacity: batchUpdating ? 0.4 : 1, cursor: batchUpdating ? 'default' : 'pointer',
            }}>
              → {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}

      {/* Orders */}
      {loading ? (
        <p style={{ color: 'var(--text2)', fontSize: '13px' }}>로딩중...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text2)', fontSize: '13px' }}>주문 없음</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: 'var(--border)' }}>
          {/* Header row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '32px 120px 1fr 120px 80px 100px 90px 100px',
            gap: '12px', padding: '10px 16px', backgroundColor: 'var(--bg2)',
            fontSize: '10px', letterSpacing: '3px', color: 'var(--text2)',
          }}>
            <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0}
              onChange={toggleSelectAll} style={{ width: '14px', height: '14px' }} />
            <span>주문번호</span>
            <span>고객</span>
            <span>제품</span>
            <span>사이즈</span>
            <span style={{ textAlign: 'right' }}>합계</span>
            <span>상태</span>
            <span>주문일시</span>
          </div>

          {filtered.map(order => (
            <div key={order.id} style={{
              display: 'grid', gridTemplateColumns: '32px 120px 1fr 120px 80px 100px 90px 100px',
              gap: '12px', padding: '14px 16px', backgroundColor: selected.has(order.id) ? 'var(--bg2)' : 'var(--bg)',
              fontSize: '13px', alignItems: 'center',
            }}>
              <input type="checkbox" checked={selected.has(order.id)}
                onChange={() => toggleSelect(order.id)} style={{ width: '14px', height: '14px' }} />
              <Link to={`/admin/orders/${order.id}`} style={{ fontFamily: 'monospace', fontSize: '12px' }}>{order.order_number}</Link>
              <Link to={`/admin/orders/${order.id}`}>{order.customer_name}</Link>
              <span style={{ color: 'var(--text2)', fontSize: '12px' }}>{getItemsSummary(order)}</span>
              <span style={{ color: 'var(--text2)', fontSize: '12px' }}>{getSizesSummary(order)}</span>
              <span style={{ textAlign: 'right' }}>{order.total_price.toLocaleString()}원</span>
              <span style={{
                fontSize: '10px', letterSpacing: '2px',
                color: order.status === 'cancelled' ? '#c44' : order.status === 'delivered' ? '#4a8' : 'var(--text2)',
              }}>
                {STATUS_LABELS[order.status]}
              </span>
              <span style={{ color: 'var(--text2)', fontSize: '12px' }}>
                {new Date(order.created_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
