import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import PageTransition from '../components/PageTransition';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const isAnimating = useRef(false);
  const touchStartX = useRef(0);

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

  const total = products.length + 1;

  const goTo = useCallback((index: number) => {
    if (isAnimating.current) return;
    const next = Math.max(0, Math.min(index, total - 1));
    if (next === current) return;
    isAnimating.current = true;
    setCurrent(next);
    setTimeout(() => { isAnimating.current = false; }, 700);
  }, [current, total]);

  useEffect(() => {
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(delta) > 5) {
        goTo(current + (delta > 0 ? 1 : -1));
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(current + 1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goTo(current - 1);
    }

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [current, goTo]);

  // Touch support
  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      touchStartX.current = e.touches[0].clientX;
    }
    function onTouchEnd(e: TouchEvent) {
      const diff = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 60) {
        goTo(current + (diff > 0 ? 1 : -1));
      }
    }

    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [current, goTo]);

  if (loading) return <div style={{ minHeight: '100vh' }} />;

  return (
    <PageTransition>
      <div style={{
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Slides track */}
        <div style={{
          display: 'flex',
          height: '100%',
          transform: `translateX(-${current * 100}vw)`,
          transition: 'transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)',
        }}>
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
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    <span style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '24px',
                      fontWeight: 300,
                      letterSpacing: '0.08em',
                      color: 'var(--text3)',
                    }}>
                      {product.name}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 300,
                      color: 'var(--text3)',
                      letterSpacing: '0.04em',
                    }}>
                      {'\u20A9'}{product.price.toLocaleString('ko-KR')}
                    </span>
                  </div>
                )}
              </div>

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
            </Link>
          ))}

          {/* Last slide */}
          <div style={{
            flexShrink: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
        </div>

        {/* Right side: vertical counter */}
        <div style={{
          position: 'fixed',
          right: '40px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          zIndex: 50,
        }}>
          <span style={{
            fontSize: '10px',
            fontFamily: 'monospace',
            color: 'var(--text2)',
            letterSpacing: '2px',
          }}>
            {String(current + 1).padStart(2, '0')}
          </span>
          <div style={{
            width: '1px',
            height: '40px',
            backgroundColor: 'var(--border)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              width: '1px',
              height: `${((current + 1) / total) * 100}%`,
              backgroundColor: 'var(--text2)',
              transition: 'height 0.6s ease',
            }} />
          </div>
          <span style={{
            fontSize: '10px',
            fontFamily: 'monospace',
            color: 'var(--text3)',
            letterSpacing: '2px',
          }}>
            {String(total).padStart(2, '0')}
          </span>
        </div>
      </div>
    </PageTransition>
  );
}
