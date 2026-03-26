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

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleClose() {
    setClosing(true);
    setTimeout(onClose, 250);
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: 'var(--bg)',
        overflowY: 'auto',
        animation: closing ? 'modalOut 0.25s ease forwards' : 'modalIn 0.3s ease',
      }}
    >
      {/* Back button */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 201, padding: '28px 40px' }}>
        <button
          onClick={handleClose}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '20px',
            fontWeight: 400,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text)',
            padding: '0',
          }}
        >
          &larr;
        </button>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '640px',
        margin: '0 auto',
        padding: '100px 40px 80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Image — large, centered */}
        <div style={{
          width: '100%',
          maxWidth: '560px',
          aspectRatio: '3/4',
          backgroundColor: 'var(--bg2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          marginBottom: '48px',
        }}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.code} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: 400, letterSpacing: '0.12em', color: 'var(--text3)' }}>
              {product.code}
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ width: '100%', maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <span style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--text2)', fontWeight: 500 }}>
            {product.code}
          </span>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 400, letterSpacing: '0.06em' }}>
              {product.name}
            </h2>
            <span style={{ fontSize: '15px', fontWeight: 500, letterSpacing: '0.04em' }}>
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Specs */}
          {product.specs && product.specs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
              {product.specs.map((spec, i) => (
                <span key={i} style={{ fontSize: '12px', letterSpacing: '1px', color: 'var(--text2)', fontWeight: 300 }}>{spec}</span>
              ))}
            </div>
          )}

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div style={{ paddingTop: '16px' }}>
              <span style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text2)', fontWeight: 300, display: 'block', marginBottom: '12px' }}>
                Size
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                {product.sizes.map((size, i) => (
                  <button
                    key={size}
                    onClick={() => setExpandedSize(expandedSize === i ? null : i)}
                    style={{
                      minWidth: '40px', height: '40px', padding: '0 10px',
                      border: expandedSize === i ? '1px solid var(--text)' : '1px solid var(--border)',
                      backgroundColor: 'transparent',
                      fontSize: '13px', fontWeight: 500,
                      color: expandedSize === i ? 'var(--text)' : 'var(--text2)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              {expandedSize !== null && product.sizes[expandedSize] && (
                <div style={{
                  marginTop: '12px', padding: '12px 16px',
                  backgroundColor: 'var(--bg2)',
                  fontSize: '12px', color: 'var(--text2)', fontWeight: 300,
                  letterSpacing: '1px',
                }}>
                  Size {expandedSize + 1} — {product.sizes[expandedSize]}
                </div>
              )}
            </div>
          )}

          <p style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 300, lineHeight: '1.8', marginTop: '24px' }}>
            In BOX
          </p>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
