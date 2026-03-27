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

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Name + Price */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 400, letterSpacing: '0.06em' }}>{name}</h1>
            <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text2)' }}>{formatPrice(product.price)}</span>
          </div>
          {/* Specs left + COUNTER hint right */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {specs.map((spec, i) => (
                <span key={i} style={{ fontSize: '10px', color: 'var(--text2)', fontWeight: 300, letterSpacing: '0.5px' }}>{spec}</span>
              ))}
            </div>
            <span style={{ fontSize: '9px', color: 'var(--text3)', fontWeight: 300, letterSpacing: '0.5px', textAlign: 'right', lineHeight: '1.6' }}>
              Size & order<br />available in COUNTER
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
