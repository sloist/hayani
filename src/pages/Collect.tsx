import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getCollect, removeFromCollect, type CollectItem } from '../lib/collect';
import type { Product } from '../types';

export default function Collect() {
  const navigate = useNavigate();
  const [items, setItems] = useState<(CollectItem & { product: Product })[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const collected = getCollect();
      if (collected.length === 0) { setLoading(false); return; }

      const ids = [...new Set(collected.map(c => c.productId))];
      const { data } = await supabase.from('products').select('*').in('id', ids);
      const productMap = new Map((data || []).map(p => [p.id, p]));

      setItems(
        collected
          .map(c => {
            const product = productMap.get(c.productId);
            return product ? { ...c, product } : null;
          })
          .filter((x): x is CollectItem & { product: Product } => x !== null)
      );
      setLoading(false);
    }
    load();
  }, []);

  function handleRemove(productId: string, size: string) {
    const key = `${productId}-${size}`;
    setRemoving(key);
    setTimeout(() => {
      removeFromCollect(productId, size);
      setItems(prev => prev.filter(i => !(i.productId === productId && i.size === size)));
      setRemoving(null);
    }, 300);
  }

  const formatPrice = (p: number) => `\u20A9${p.toLocaleString('ko-KR')}`;
  const total = items.reduce((sum, i) => sum + i.product.price, 0);
  const hasOrderable = items.some(i => i.product.stock > 0);

  if (loading) return <div style={{ minHeight: '100vh' }} />;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, padding: '28px 40px', zIndex: 100, backgroundColor: 'var(--bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: 300, letterSpacing: '0.12em' }}>
          HAYANI
        </Link>
        <Link to="/" style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text3)', fontWeight: 300 }}>
          Back
        </Link>
      </div>

      {items.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '32px' }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(20px, 3vw, 28px)',
            fontWeight: 300,
            letterSpacing: '0.06em',
            color: 'var(--text3)',
          }}>
            Nothing yet
          </p>
          <Link to="/" style={{
            fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase',
            color: 'var(--text2)', fontWeight: 300,
            borderBottom: '1px solid var(--border)', paddingBottom: '4px',
          }}>
            Browse Collection
          </Link>
        </div>
      ) : (
        <>
          {/* Title */}
          <div style={{ padding: '100px 40px 40px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h1 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(28px, 4vw, 40px)',
                fontWeight: 300,
                letterSpacing: '0.08em',
              }}>
                Collected
              </h1>
              <span style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 300, letterSpacing: '2px' }}>
                {items.length} {items.length === 1 ? 'piece' : 'pieces'}
              </span>
            </div>
          </div>

          {/* Items */}
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 40px 200px' }}>
            {items.map((item, i) => {
              const key = `${item.productId}-${item.size}`;
              const isRemoving = removing === key;

              return (
                <div
                  key={key}
                  style={{
                    display: 'flex', alignItems: 'stretch', gap: '0',
                    borderTop: i === 0 ? '1px solid var(--border)' : 'none',
                    borderBottom: '1px solid var(--border)',
                    opacity: isRemoving ? 0 : 1,
                    transform: isRemoving ? 'translateX(40px)' : 'translateX(0)',
                    transition: 'opacity 0.3s ease, transform 0.3s ease',
                  }}
                >
                  {/* Number */}
                  <div style={{
                    width: '48px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', color: 'var(--text3)', fontWeight: 300, letterSpacing: '2px',
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>

                  {/* Thumbnail */}
                  <div
                    onClick={() => navigate(`/wear/${item.productId}`)}
                    style={{
                      width: '120px', height: '160px', flexShrink: 0,
                      backgroundColor: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', overflow: 'hidden',
                    }}
                  >
                    {item.product.image_url ? (
                      <img src={item.product.image_url} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{
                        fontFamily: "'Cormorant Garamond', serif", fontSize: '18px',
                        fontWeight: 300, color: 'var(--text3)', letterSpacing: '0.08em',
                      }}>
                        {item.product.code}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{
                    flex: 1, padding: '24px 24px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  }}>
                    <div>
                      <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '16px', fontWeight: 300, letterSpacing: '0.04em', marginBottom: '6px',
                      }}>
                        {item.product.name}
                      </p>
                      <p style={{ fontSize: '10px', color: 'var(--text3)', letterSpacing: '3px', textTransform: 'uppercase' }}>
                        {item.size}
                      </p>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 300, letterSpacing: '0.02em' }}>
                      {formatPrice(item.product.price)}
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(item.productId, item.size)}
                    style={{
                      width: '48px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '16px', color: 'var(--text3)',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {/* Bottom bar */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            backgroundColor: 'var(--bg)',
            borderTop: '1px solid var(--border)',
            padding: '20px 40px',
            zIndex: 100,
          }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text3)', fontWeight: 300 }}>
                  Total
                </span>
                <p style={{ fontSize: '16px', fontWeight: 300, letterSpacing: '0.02em', marginTop: '4px' }}>
                  {formatPrice(total)}
                </p>
              </div>
              <button
                onClick={() => navigate('/order?from=collect')}
                disabled={!hasOrderable}
                style={{
                  padding: '14px 48px',
                  backgroundColor: hasOrderable ? 'var(--text)' : 'var(--border)',
                  color: hasOrderable ? 'var(--bg)' : 'var(--text3)',
                  fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 300,
                  cursor: hasOrderable ? 'pointer' : 'default',
                  transition: 'opacity 0.3s ease',
                }}
              >
                Order All
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
