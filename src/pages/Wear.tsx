import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import PageTransition from '../components/PageTransition';

export default function Wear() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      setProducts(data || []);
      setLoading(false);
    }
    fetch();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el!.scrollLeft += e.deltaY;
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <PageTransition>
      <div style={{
        paddingTop: '120px',
        minHeight: '100vh',
      }}>
        {/* Header labels */}
        <div style={{
          padding: '0 40px',
          marginBottom: '48px',
          display: 'flex',
          gap: '24px',
          alignItems: 'baseline',
        }}>
          <span className="label">HAYANI / Wear</span>
          <span className="label">Summer 2026</span>
          <span className="label">Pre-Order</span>
        </div>

        {/* Horizontal scroll gallery */}
        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: '24px',
            padding: '0 40px 80px',
            overflowX: 'auto',
            overflowY: 'hidden',
          }}
        >
          {loading ? (
            <div style={{ padding: '40px', color: 'var(--text3)' }}>
              <span className="label">Loading</span>
            </div>
          ) : products.length === 0 ? (
            <div style={{ padding: '40px', color: 'var(--text3)' }}>
              <span className="label">Coming Soon</span>
            </div>
          ) : (
            products.map(product => (
              <Link
                key={product.id}
                to={`/wear/${product.id}`}
                style={{
                  flexShrink: 0,
                  width: 'min(320px, 70vw)',
                  transition: 'opacity 0.3s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <div style={{
                  width: '100%',
                  aspectRatio: '3/4',
                  backgroundColor: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{
                      fontSize: '10px',
                      letterSpacing: '4px',
                      color: 'var(--text3)',
                      textTransform: 'uppercase',
                    }}>
                      {product.code}
                    </span>
                  )}
                </div>

                <span style={{
                  fontSize: '10px',
                  letterSpacing: '4px',
                  textTransform: 'uppercase',
                  color: 'var(--text2)',
                  fontWeight: 300,
                }}>
                  {product.code}
                </span>

                {product.stock <= 0 && (
                  <span style={{
                    display: 'block',
                    fontSize: '9px',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    color: 'var(--text3)',
                    marginTop: '4px',
                  }}>
                    Sold Out
                  </span>
                )}
              </Link>
            ))
          )}
        </div>
      </div>
    </PageTransition>
  );
}
