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

  if (loading) return <div style={{ height: '100vh' }} />;
  if (!product) { navigate('/'); return null; }

  const formatPrice = (p: number) => `₩${p.toLocaleString('ko-KR')}`;
  const name = product.name.replace(/^HAYANI\s*/i, '');
  const specs = (product.specs || []).map(s => s.replace(/off-?white/i, 'Canvas-White'));
  const sizes = product.sizes || [];

  const measurements: Record<number, string> = {
    0: '가슴 52cm · 총장 68cm', 1: '가슴 55cm · 총장 71cm',
    2: '가슴 58cm · 총장 74cm', 3: '가슴 61cm · 총장 77cm',
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '28px 40px', display: 'flex', justifyContent: 'space-between' }}>
        <BackButton />
        <BoxIndicator />
      </div>

      <div className="product-layout" style={{ height: '100vh', display: 'flex' }}>
        <div className="product-image" style={{
          flex: '1 1 50%', minWidth: '300px',
          backgroundColor: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {product.image_url ? (
            <img className="product-img" src={product.image_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: 400, letterSpacing: '0.12em', color: 'var(--text3)' }}>{name}</span>
          )}
        </div>

        <div style={{ flex: '1 1 400px', padding: '100px 60px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, letterSpacing: '0.06em' }}>{name}</h1>
          <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text2)' }}>{formatPrice(product.price)}</span>

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

          {expandedSize !== null && (
            <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg2)', fontSize: '11px', color: 'var(--text2)', fontWeight: 300, letterSpacing: '0.5px' }}>
              {measurements[expandedSize] || '실측 정보 준비 중'}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .product-layout { flex-direction: column !important; }
          .product-image { flex: 0 0 45vh !important; min-width: 0 !important; }
        }
      `}</style>
    </div>
  );
}
