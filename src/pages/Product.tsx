import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product as ProductType } from '../types';
import BackButton from '../components/BackButton';

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!id) return;
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) console.error('Product fetch failed:', error);
      setProduct(data);
      setLoading(false);
    }
    fetch();
  }, [id]);

  useEffect(() => {
    if (!loading && !product) navigate('/');
  }, [loading, product, navigate]);

  if (loading || !product) return <div style={{ height: '100vh' }} />;

  const formatPrice = (p: number) => `₩${p.toLocaleString('ko-KR')}`;
  const name = product.name.replace(/^HAYANI\s*/i, '');
  const specs = (product.specs || []).map(s => s.replace(/off-?white/i, 'Canvas-White'));

  return (
    <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 40px', flexShrink: 0, maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <BackButton />
      </div>

      {/* Image above, info below — like a caption */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 40px', gap: '20px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
        <div style={{
          width: '100%', maxHeight: '55vh', aspectRatio: '3/4',
          backgroundColor: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {product.image_url ? (
            <img className="product-img" src={product.image_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 400, letterSpacing: '0.12em', color: 'var(--text3)' }}>{name}</span>
          )}
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <h1 style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '3px', textTransform: 'uppercase' }}>{name}</h1>
            <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text2)' }}>{formatPrice(product.price)}</span>
          </div>
          {(() => {
            const material = specs.filter(s => !/(white|black|grey|cream|ivory|canvas-|made in)/i.test(s));
            const origin = specs.find(s => /made in/i.test(s));
            return (
              <>
                {material.length > 0 && <span style={{ fontSize: '10px', color: 'var(--text2)', fontWeight: 300, letterSpacing: '0.5px' }}>{material.join(' · ')}</span>}
                {origin && <span style={{ fontSize: '10px', color: 'var(--text2)', fontWeight: 300, letterSpacing: '0.5px' }}>{origin}</span>}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
