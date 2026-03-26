import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product as ProductType } from '../types';
import BackButton from '../components/BackButton';
import BoxIndicator from '../components/BoxIndicator';

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSize, setExpandedSize] = useState<number | null>(null);

  useEffect(() => {
    async function fetch() {
      if (!id) return;
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      setProduct(data);
      setLoading(false);
    }
    fetch();
  }, [id]);

  if (loading) return <div style={{ minHeight: '100vh' }} />;
  if (!product) { navigate('/'); return null; }

  const formatPrice = (p: number) => `₩${p.toLocaleString('ko-KR')}`;

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '28px 40px', display: 'flex', justifyContent: 'space-between' }}>
        <BackButton />
        <BoxIndicator />
      </div>

      <div className="product-layout" style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', flexWrap: 'wrap' }}>
        <div className="product-image" style={{
          flex: '1 1 50%', minWidth: '300px', position: 'sticky', top: 0, height: '100vh',
          backgroundColor: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: 400, letterSpacing: '0.12em', color: 'var(--text3)' }}>
              {product.code}
            </span>
          )}
        </div>

        <div style={{ flex: '1 1 400px', padding: '120px 60px 80px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <span style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--text2)', fontWeight: 500 }}>
            {product.code}
          </span>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 400, letterSpacing: '0.06em' }}>
            {product.name}
          </h1>
          <span style={{ fontSize: '15px', fontWeight: 500, letterSpacing: '0.04em' }}>{formatPrice(product.price)}</span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            {(product.specs || []).map((spec, i) => (
              <span key={i} style={{ fontSize: '12px', letterSpacing: '1px', color: 'var(--text2)', fontWeight: 300 }}>{spec}</span>
            ))}
          </div>

          {/* Sizes as 1, 2, 3 */}
          {product.sizes && product.sizes.length > 0 && (
            <div style={{ paddingTop: '12px' }}>
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

          <p style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 300, lineHeight: '1.8' }}>
            In BOX
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .product-layout {
            flex-direction: column !important;
          }
          .product-image {
            position: relative !important;
            height: auto !important;
            max-height: 55vh !important;
            top: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
