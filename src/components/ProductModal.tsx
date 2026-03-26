import { useState } from 'react';
import type { Product } from '../types';

interface Props {
  product: Product;
  onClose: () => void;
}

function sizeLabel(index: number): string {
  return String(index + 1);
}

export default function ProductModal({ product, onClose }: Props) {
  const [expandedSize, setExpandedSize] = useState<number | null>(null);
  const formatPrice = (p: number) => `₩${p.toLocaleString('ko-KR')}`;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          backgroundColor: 'rgba(0,0,0,0.03)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 201,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <div
          style={{
            pointerEvents: 'auto',
            backgroundColor: 'var(--bg)',
            width: '90vw', maxWidth: '860px',
            maxHeight: '85vh',
            display: 'flex',
            overflow: 'hidden',
            animation: 'modalIn 0.3s ease',
          }}
          className="product-modal"
        >
          {/* Image */}
          <div className="modal-image" style={{
            flex: '1 1 50%', minHeight: '400px',
            backgroundColor: 'var(--bg2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {product.image_url ? (
              <img src={product.image_url} alt={product.code} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: 400, letterSpacing: '0.12em', color: 'var(--text3)' }}>
                {product.code}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="modal-info" style={{
            flex: '1 1 50%', padding: '48px 40px',
            display: 'flex', flexDirection: 'column', gap: '24px',
            overflowY: 'auto',
            position: 'relative',
          }}>
            {/* Close */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: '20px', right: '20px',
                fontSize: '18px', color: 'var(--text2)', padding: '4px',
              }}
            >
              ✕
            </button>

            <span style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--text2)', fontWeight: 500 }}>
              {product.code}
            </span>

            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, letterSpacing: '0.06em' }}>
              {product.name}
            </h2>

            <span style={{ fontSize: '15px', fontWeight: 400, letterSpacing: '0.04em' }}>
              {formatPrice(product.price)}
            </span>

            {/* Specs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              {(product.specs || []).map((spec, i) => (
                <span key={i} style={{ fontSize: '12px', letterSpacing: '1px', color: 'var(--text2)', fontWeight: 400 }}>{spec}</span>
              ))}
            </div>

            {/* Sizes as 1, 2, 3 — click to reveal */}
            {product.sizes && product.sizes.length > 0 && (
              <div style={{ paddingTop: '12px' }}>
                <span style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text2)', fontWeight: 500, display: 'block', marginBottom: '12px' }}>
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
                      {sizeLabel(i)}
                    </button>
                  ))}
                </div>
                {expandedSize !== null && product.sizes[expandedSize] && (
                  <div style={{
                    marginTop: '12px', padding: '12px 16px',
                    backgroundColor: 'var(--bg2)',
                    fontSize: '12px', color: 'var(--text2)', fontWeight: 400,
                    letterSpacing: '1px',
                  }}>
                    Size {expandedSize + 1} — {product.sizes[expandedSize]}
                  </div>
                )}
              </div>
            )}

            <p style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 400, lineHeight: '1.8', marginTop: 'auto' }}>
              Available in BOX
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .product-modal {
            flex-direction: column !important;
            max-height: 90vh !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw !important;
          }
          .modal-image {
            flex: 0 0 45vh !important;
            min-height: 0 !important;
          }
          .modal-info {
            flex: 1 !important;
          }
        }
      `}</style>
    </>
  );
}
