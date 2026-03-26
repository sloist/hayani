import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import PageTransition from '../components/PageTransition';

export default function Home() {
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
        el!.scrollLeft += e.deltaY * 1.5;
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  if (loading) return <div style={{ minHeight: '100vh' }} />;

  return (
    <PageTransition>
      <div
        ref={scrollRef}
        style={{
          height: '100vh',
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
        }}
      >
        {products.map(product => (
          <Link
            key={product.id}
            to={`/wear/${product.id}`}
            style={{
              flexShrink: 0,
              width: '100vw',
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              scrollSnapAlign: 'start',
              position: 'relative',
            }}
          >
            <div style={{
              width: 'min(480px, 65vw)',
              aspectRatio: '3/4',
              backgroundColor: 'var(--bg2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.5s ease',
              overflow: 'hidden',
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(0.985)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : null}
            </div>

            {/* Product code - bottom center */}
            <span style={{
              position: 'absolute',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '9px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              color: 'var(--text3)',
              fontWeight: 300,
            }}>
              {product.code}
            </span>

            {product.stock <= 0 && (
              <span style={{
                position: 'absolute',
                bottom: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '8px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: 'var(--text3)',
              }}>
                Sold Out
              </span>
            )}
          </Link>
        ))}

        {/* Last slide: About */}
        <div style={{
          flexShrink: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          scrollSnapAlign: 'start',
          gap: '24px',
        }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '18px',
            fontWeight: 300,
            lineHeight: '2.2',
            letterSpacing: '0.04em',
            color: 'var(--text2)',
            textAlign: 'center',
          }}>
            덜어낸 뒤에 남는 것만 만든다.
          </p>
        </div>

        {products.length === 0 && (
          <div style={{
            flexShrink: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{
              fontSize: '10px',
              letterSpacing: '4px',
              color: 'var(--text3)',
              textTransform: 'uppercase',
            }}>
              Coming Soon
            </span>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
