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

  function handleClose() {
    setClosing(true);
    setTimeout(onClose, 250);
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        backgroundColor: 'var(--bg)', overflowY: 'auto',
        animation: closing ? 'modalOut 0.25s ease forwards' : 'modalIn 0.3s ease',
      }}
    >
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
          overflow: 'hidden', marginBottom: '40px',
        }}>
          {product.image_url ? (
            <img src={product.image_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: 400, letterSpacing: '0.12em', color: 'var(--text3)' }}>
              {name}
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ width: '100%', maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, letterSpacing: '0.06em' }}>
              {name}
            </h2>
            <span style={{ fontSize: '13px', fontWeight: 400, letterSpacing: '0.04em', color: 'var(--text2)' }}>
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Specs — tighter */}
          {product.specs && product.specs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              {product.specs.map((spec, i) => (
                <span key={i} style={{ fontSize: '12px', letterSpacing: '0.5px', color: 'var(--text2)', fontWeight: 300 }}>{spec}</span>
              ))}
            </div>
          )}

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div style={{ paddingTop: '12px' }}>
              <span style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text3)', fontWeight: 300, display: 'block', marginBottom: '10px' }}>
                Size
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {product.sizes.map((size, i) => (
                  <button
                    key={size}
                    onClick={() => setExpandedSize(expandedSize === i ? null : i)}
                    style={{
                      minWidth: '36px', height: '36px', padding: '0 8px',
                      border: expandedSize === i ? '1px solid var(--text)' : '1px solid var(--border)',
                      backgroundColor: 'transparent',
                      fontSize: '12px', fontWeight: 500,
                      color: expandedSize === i ? 'var(--text)' : 'var(--text2)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              {expandedSize !== null && (
                <div style={{
                  marginTop: '10px', padding: '10px 14px',
                  backgroundColor: 'var(--bg2)',
                  fontSize: '11px', color: 'var(--text2)', fontWeight: 300, letterSpacing: '0.5px',
                }}>
                  실측 정보 준비 중
                </div>
              )}
            </div>
          )}

          <p style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 300, marginTop: '20px' }}>
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
