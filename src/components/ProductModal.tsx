import { useState, useEffect } from 'react';
import type { Product } from '../types';

interface Props {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: Props) {
  const [expandedSize, setExpandedSize] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const formatPrice = (p: number) => `₩${p.toLocaleString('ko-KR')}`;
  const name = product.name.replace(/^HAYANI\s*/i, '');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleClose() { setClosing(true); setTimeout(onClose, 250); }

  const specs = (product.specs || []).map(s => s.replace(/off-?white/i, 'Canvas-White'));
  const sizes = product.sizes || [];

  // Placeholder measurements — will come from DB later
  const measurements: Record<number, string> = {
    0: '가슴 52cm · 총장 68cm',
    1: '가슴 55cm · 총장 71cm',
    2: '가슴 58cm · 총장 74cm',
    3: '가슴 61cm · 총장 77cm',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      backgroundColor: 'var(--bg)', overflow: 'hidden',
      animation: closing ? 'modalOut 0.25s ease forwards' : 'modalIn 0.3s ease',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Back */}
      <div style={{ padding: '28px 40px', flexShrink: 0 }}>
        <button onClick={handleClose} style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 400,
          color: 'var(--text)', padding: '0',
        }}>&larr;</button>
      </div>

      {/* Content — centered, no scroll */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 40px 40px' }}>
        <div style={{ display: 'flex', gap: '48px', maxWidth: '900px', width: '100%', alignItems: 'center' }} className="modal-layout">
          {/* Image */}
          <div style={{
            flex: '1 1 50%', maxHeight: '70vh', aspectRatio: '3/4',
            backgroundColor: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {product.image_url ? (
              <img className="product-img" src={product.image_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 400, letterSpacing: '0.12em', color: 'var(--text3)' }}>{name}</span>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: '1 1 40%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 400, letterSpacing: '0.06em' }}>{name}</h2>
              <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{formatPrice(product.price)}</span>
            </div>

            {/* Specs + Sizes */}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {specs.map((spec, i) => (
                  <span key={i} style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: 300, letterSpacing: '0.5px' }}>{spec}</span>
                ))}
              </div>
              {sizes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'right' }}>
                  {sizes.map((_, i) => (
                    <button key={i} onClick={() => setExpandedSize(expandedSize === i ? null : i)} style={{
                      fontSize: '11px', color: expandedSize === i ? 'var(--text)' : 'var(--text2)',
                      fontWeight: expandedSize === i ? 500 : 300, letterSpacing: '0.5px', textAlign: 'right',
                    }}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Size measurement */}
            {expandedSize !== null && (
              <div style={{
                padding: '10px 14px', backgroundColor: 'var(--bg2)',
                fontSize: '11px', color: 'var(--text2)', fontWeight: 300, letterSpacing: '0.5px',
              }}>
                {measurements[expandedSize] || '실측 정보 준비 중'}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalOut { from { opacity: 1; } to { opacity: 0; } }
        @media (max-width: 768px) {
          .modal-layout { flex-direction: column !important; gap: 24px !important; }
        }
      `}</style>
    </div>
  );
}
