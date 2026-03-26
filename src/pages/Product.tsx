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
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: 300, letterSpacing: '0.12em', color: 'var(--text3)' }}>
              {product.code}
            </span>
          )}
        </div>

        <div style={{ flex: '1 1 400px', padding: '120px 60px 80px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <span className="label">{product.code}</span>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 300, letterSpacing: '0.06em' }}>
            {product.name}
          </h1>
          <span style={{ fontSize: '14px', fontWeight: 300, letterSpacing: '0.04em' }}>{formatPrice(product.price)}</span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            {(product.specs || []).map((spec, i) => (
              <span key={i} style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text2)', fontWeight: 300 }}>{spec}</span>
            ))}
          </div>

          {/* Sizes - display only */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
            {(product.sizes || []).map(size => (
              <span key={size} style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: '48px', height: '48px', padding: '0 12px',
                border: '1px solid var(--border)',
                fontSize: '10px', letterSpacing: '2px', color: 'var(--text2)',
              }}>
                {size}
              </span>
            ))}
          </div>

          <p style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 200, lineHeight: '1.8' }}>
            BOX에서 선택 가능
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
