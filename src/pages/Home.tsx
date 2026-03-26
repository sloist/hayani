import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import PageTransition from '../components/PageTransition';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const totalSlides = useRef(0);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      setProducts(data || []);
      totalSlides.current = (data?.length || 0) + 1;
      setLoading(false);
    }
    fetch();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;

      if (Math.abs(delta) > 10) {
        const direction = delta > 0 ? 1 : -1;
        const nextIndex = Math.max(0, Math.min(currentIndex + direction, totalSlides.current - 1));
        if (nextIndex !== currentIndex) {
          setCurrentIndex(nextIndex);
          el!.scrollTo({
            left: nextIndex * window.innerWidth,
            behavior: 'smooth',
          });
        }
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [currentIndex]);

  // Update index on scroll (for touch/drag)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let timeout: number;
    function onScroll() {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        const index = Math.round(el!.scrollLeft / window.innerWidth);
        setCurrentIndex(index);
      }, 100);
    }

    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  if (loading) return <div style={{ minHeight: '100vh' }} />;

  const total = products.length + 1;

  return (
    <PageTransition>
      <div
        ref={scrollRef}
        style={{
          height: '100vh',
          display: 'flex',
          overflowX: 'hidden',
          overflowY: 'hidden',
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
              bottom: '60px',
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
                bottom: '40px',
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

        {/* Last slide */}
        <div style={{
          flexShrink: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
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
      </div>

      {/* Slide indicator dots */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        zIndex: 50,
      }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              width: currentIndex === i ? '16px' : '4px',
              height: '4px',
              borderRadius: '2px',
              backgroundColor: currentIndex === i ? 'var(--text2)' : 'var(--border)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </PageTransition>
  );
}
