import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getCollect, removeFromCollect, type CollectItem } from '../lib/collect';
import type { Product } from '../types';

export default function Collect() {
  const navigate = useNavigate();
  const [items, setItems] = useState<(CollectItem & { product: Product })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const collected = getCollect();
      if (collected.length === 0) {
        setLoading(false);
        return;
      }

      const ids = [...new Set(collected.map(c => c.productId))];
      const { data } = await supabase
        .from('products')
        .select('*')
        .in('id', ids);

      const productMap = new Map((data || []).map(p => [p.id, p]));
      const resolved = collected
        .map(c => {
          const product = productMap.get(c.productId);
          return product ? { ...c, product } : null;
        })
        .filter((x): x is CollectItem & { product: Product } => x !== null);

      setItems(resolved);
      setLoading(false);
    }
    load();
  }, []);

  function handleRemove(productId: string, size: string) {
    removeFromCollect(productId, size);
    setItems(prev => prev.filter(i => !(i.productId === productId && i.size === size)));
  }

  const formatPrice = (p: number) => `\u20A9${p.toLocaleString('ko-KR')}`;

  if (loading) return <div style={{ minHeight: '100vh' }} />;

  return (
    <div style={{ minHeight: '100vh', maxWidth: '640px', margin: '0 auto', padding: '100px 40px 80px' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, padding: '28px 40px', zIndex: 100, backgroundColor: 'var(--bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: 300, letterSpacing: '0.12em' }}>
          HAYANI
        </Link>
        <span style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text2)', fontWeight: 300 }}>
          Collect
        </span>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', paddingTop: '120px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text3)', fontWeight: 300, marginBottom: '24px' }}>
            아직 담은 상품이 없습니다.
          </p>
          <Link to="/" style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text2)', fontWeight: 300 }}>
            Browse
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {items.map((item, i) => (
            <div key={`${item.productId}-${item.size}`} style={{
              display: 'flex', gap: '24px', padding: '32px 0',
              borderTop: i === 0 ? 'none' : '1px solid var(--border)',
            }}>
              <div
                onClick={() => navigate(`/wear/${item.productId}`)}
                style={{
                  width: '100px', height: '133px', flexShrink: 0,
                  backgroundColor: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {item.product.image_url ? (
                  <img src={item.product.image_url} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', fontWeight: 300, color: 'var(--text3)', letterSpacing: '0.08em' }}>
                    {item.product.code}
                  </span>
                )}
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 300, marginBottom: '4px' }}>{item.product.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text2)', letterSpacing: '2px', marginBottom: '8px' }}>
                    {item.product.code} / {item.size}
                  </p>
                  <p style={{ fontSize: '13px', fontWeight: 300 }}>{formatPrice(item.product.price)}</p>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <button
                    onClick={() => navigate(`/order?product_id=${item.productId}&size=${item.size}`)}
                    style={{
                      fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase',
                      color: item.product.stock > 0 ? 'var(--text)' : 'var(--text3)',
                      fontWeight: 300, background: 'none', border: 'none', padding: 0, cursor: item.product.stock > 0 ? 'pointer' : 'default',
                    }}
                    disabled={item.product.stock <= 0}
                  >
                    {item.product.stock > 0 ? 'Order' : 'Sold Out'}
                  </button>
                  <button
                    onClick={() => handleRemove(item.productId, item.size)}
                    style={{
                      fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase',
                      color: 'var(--text3)', fontWeight: 300, background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
