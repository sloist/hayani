import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { sizeToNumber } from '../../lib/size';
import { useAdminAuth } from '../../lib/useAdminAuth';
import type { Order } from '../../types';

export default function Report() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const authed = useAdminAuth();

  useEffect(() => {
    if (!authed) return;
    async function fetch() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false });
      if (error) console.error('Report data fetch failed:', error);
      setOrders(data || []);
      setLoading(false);
    }
    fetch();
  }, [authed]);

  if (!authed) return <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }} />;

  // Monthly revenue
  const monthlyMap = new Map<string, number>();
  for (const o of orders) {
    const month = o.created_at.slice(0, 7);
    monthlyMap.set(month, (monthlyMap.get(month) || 0) + o.total_price);
  }
  const monthly = [...monthlyMap.entries()].sort((a, b) => b[0].localeCompare(a[0]));

  // Product sales
  const productMap = new Map<string, { code: string; name: string; qty: number; revenue: number }>();
  for (const o of orders) {
    if (!o.items) continue;
    for (const item of o.items) {
      const key = item.code;
      const cur = productMap.get(key) || { code: item.code, name: item.name, qty: 0, revenue: 0 };
      cur.qty += item.quantity;
      cur.revenue += item.price * item.quantity;
      productMap.set(key, cur);
    }
  }
  const productSales = [...productMap.values()].sort((a, b) => b.revenue - a.revenue);

  // Size distribution
  const sizeMap = new Map<string, number>();
  for (const o of orders) {
    if (!o.items) continue;
    for (const item of o.items) {
      const sizeLabel = sizeToNumber(item.size);
      sizeMap.set(sizeLabel, (sizeMap.get(sizeLabel) || 0) + item.quantity);
    }
  }
  const sizeDist = [...sizeMap.entries()].sort((a, b) => b[1] - a[1]);
  const totalQty = sizeDist.reduce((s, [, q]) => s + q, 0);

  const formatPrice = (p: number) => `₩${p.toLocaleString('ko-KR')}`;
  const labelStyle: React.CSSProperties = { fontSize: '10px', letterSpacing: '3px', color: 'var(--text2)', textTransform: 'uppercase' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <Link to="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 300, letterSpacing: '0.14em' }}>
          HAYANI
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <Link to="/admin" className="label" style={{ color: 'var(--text3)' }}>주문 관리</Link>
        <Link to="/admin/products" className="label" style={{ color: 'var(--text3)' }}>제품 관리</Link>
        <span className="label" style={{ color: 'var(--text)' }}>매출</span>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text2)', fontSize: '13px' }}>로딩중...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {/* Monthly */}
          <div>
            <p style={{ ...labelStyle, marginBottom: '16px' }}>월별 매출</p>
            {monthly.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text3)' }}>데이터 없음</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {monthly.map(([month, rev]) => (
                  <div key={month} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '13px', fontFamily: 'monospace' }}>{month}</span>
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{formatPrice(rev)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product sales */}
          <div>
            <p style={{ ...labelStyle, marginBottom: '16px' }}>제품별 판매</p>
            {productSales.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text3)' }}>데이터 없음</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {productSales.map(p => (
                  <div key={p.code} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', alignItems: 'baseline' }}>
                    <div>
                      <span style={{ fontSize: '12px', letterSpacing: '2px', color: 'var(--text2)' }}>{p.code}</span>
                      <span style={{ fontSize: '13px', marginLeft: '12px' }}>{p.name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{p.qty}개</span>
                      <span style={{ fontSize: '12px', color: 'var(--text2)', marginLeft: '12px' }}>{formatPrice(p.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Size distribution */}
          <div>
            <p style={{ ...labelStyle, marginBottom: '16px' }}>사이즈별 비율</p>
            {sizeDist.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text3)' }}>데이터 없음</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sizeDist.map(([size, qty]) => (
                  <div key={size} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '13px' }}>{size}</span>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{qty}개</span>
                      <span style={{ fontSize: '12px', color: 'var(--text2)', marginLeft: '12px' }}>
                        {totalQty > 0 ? Math.round(qty / totalQty * 100) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
