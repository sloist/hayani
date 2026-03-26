import { useEffect, useState } from 'react';
import type { Product } from '../types';

interface Props {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: Props) {
  const [closing, setClosing] = useState(false);
  const formatPrice = (p: number) => `₩${p.toLocaleString('ko-KR')}`;
  const name = product.name.replace(/^HAYANI\s*/i, '');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleClose() {
    setClosing(true);
    setTimeout(onClose, 250);
  }

  // Specs with off-white → canvas-white replacement
  const specs = (product.specs || []).map(s => s.replace(/off-?white/i, 'Canvas-White'));
  const sizes = product.sizes || [];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      backgroundColor: 'var(--bg)', overflowY: 'auto',
      animation: closing ? 'modalOut 0.25s ease forwards' : 'modalIn 0.3s ease',
    }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 201, padding: '28px 40px' }}>
        <button onClick={handleClose} style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 400,
          color: 'var(--text)', padding: '0',
        }}>
          &larr;
        </button>
      </div>

      <div style={{
        maxWidth: '640px', margin: '0 auto', padding: '100px 40px 80px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        {/* Image */}
        <div style={{
          width: '100%', maxWidth: '560px', aspectRatio: '3/4',
          backgroundColor: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', marginBottom: '36px',
        }}>
          {product.image_url ? (
            <img className="product-img" src={product.image_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: 400, letterSpacing: '0.12em', color: 'var(--text3)' }}>
              {name}
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ width: '100%', maxWidth: '560px' }}>
          {/* Name + Price */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, letterSpacing: '0.06em' }}>
              {name}
            </h2>
            <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text2)' }}>
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Specs + Sizes side by side */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            {/* Left: specs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {specs.map((spec, i) => (
                <span key={i} style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 300, letterSpacing: '0.5px' }}>{spec}</span>
              ))}
            </div>

            {/* Right: sizes */}
            {sizes.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'right' }}>
                {sizes.map((size, i) => (
                  <span key={size} style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 300, letterSpacing: '0.5px' }}>
                    {i + 1}
                  </span>
                ))}
              </div>
            )}
          </div>

          <p style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 300, marginTop: '24px' }}>
            Added
          </p>
        </div>
      </div>

      <style>{`
        @keyframes modalIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalOut { from { opacity: 1; } to { opacity: 0; } }
      `}</style>
    </div>
  );
}
