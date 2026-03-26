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
  const name = product.name.replace(/^HAYANI\s*/i, '');
  const specs = (product.specs || []).map(s => s.replace(/off-?white/i, 'Canvas-White'));
  const sizes = product.sizes || [];

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
            <img className="product-img" src={product.image_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: 400, letterSpacing: '0.12em', color: 'var(--text3)' }}>
              {name}
            </span>
          )}
        </div>

        <div style={{ flex: '1 1 400px', padding: '120px 60px 80px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, letterSpacing: '0.06em' }}>
            {name}
          </h1>
          <span style={{ fontSize: '13px', fontWeight: 400, letterSpacing: '0.04em', color: 'var(--text2)' }}>{formatPrice(product.price)}</span>

          {/* Specs + Sizes paired */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {specs.map((spec, i) => (
                <span key={i} style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 300, letterSpacing: '0.5px' }}>{spec}</span>
              ))}
            </div>
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

          <p style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 300 }}>
            Added
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .product-layout { flex-direction: column !important; }
          .product-image { position: relative !important; height: auto !important; max-height: 55vh !important; top: auto !important; }
        }
      `}</style>
    </div>
  );
}
