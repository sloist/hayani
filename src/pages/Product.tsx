import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { addToCollect, isCollected } from '../lib/collect';
import type { Product as ProductType } from '../types';

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [collected, setCollected] = useState(false);

  useEffect(() => {
    async function fetch() {
      if (!id) return;
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      setProduct(data);
      setLoading(false);
    }
    fetch();
  }, [id]);

  useEffect(() => {
    if (id && selectedSize) {
      setCollected(isCollected(id, selectedSize));
    } else {
      setCollected(false);
    }
  }, [id, selectedSize]);

  if (loading) return <div style={{ minHeight: '100vh' }} />;
  if (!product) { navigate('/'); return null; }

  const isSoldOut = product.stock <= 0;
  const canOrder = selectedSize && !isSoldOut;
  const formatPrice = (p: number) => `\u20A9${p.toLocaleString('ko-KR')}`;

  function handleOrder() {
    if (!canOrder) return;
    navigate(`/order?product_id=${product!.id}&size=${selectedSize}`);
  }

  function handleCollect() {
    if (!selectedSize || isSoldOut) return;
    addToCollect(product!.id, selectedSize);
    setCollected(true);
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '28px 40px', display: 'flex', justifyContent: 'space-between' }}>
        <Link to="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: 300, letterSpacing: '0.12em' }}>
          HAYANI
        </Link>
        <Link to="/collect" style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase' as const, color: 'var(--text2)' }}>
          Collect
        </Link>
      </div>

      <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', flexWrap: 'wrap' }}>
        <div style={{
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

          <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
            {(product.sizes || []).map(size => (
              <button key={size} onClick={() => setSelectedSize(size)} disabled={isSoldOut} style={{
                width: size.length > 3 ? 'auto' : '48px', minWidth: '48px', height: '48px', padding: '0 12px',
                border: selectedSize === size ? '1px solid var(--text)' : '1px solid var(--border)',
                backgroundColor: 'transparent', fontSize: '10px', letterSpacing: '2px',
                color: isSoldOut ? 'var(--text3)' : 'var(--text)', transition: 'border-color 0.2s ease',
              }}>
                {size}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button onClick={handleCollect} disabled={!selectedSize || isSoldOut || collected} style={{
              flex: 1, padding: '16px 0',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: collected ? 'var(--text3)' : (selectedSize && !isSoldOut) ? 'var(--text)' : 'var(--text3)',
              fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 300,
              transition: 'all 0.3s ease', cursor: (selectedSize && !isSoldOut && !collected) ? 'pointer' : 'default',
            }}>
              {collected ? 'Collected' : 'Collect'}
            </button>
            <button onClick={handleOrder} disabled={!canOrder} style={{
              flex: 1, padding: '16px 0',
              backgroundColor: canOrder ? 'var(--text)' : 'var(--border)',
              color: canOrder ? 'var(--bg)' : 'var(--text3)',
              fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 300,
              transition: 'opacity 0.3s ease', cursor: canOrder ? 'pointer' : 'default',
            }}>
              {isSoldOut ? 'Sold Out' : 'Order'}
            </button>
          </div>

          {!isSoldOut && (
            <p style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 200, lineHeight: '1.8' }}>
              프리오더 상품입니다. 주문 순서대로 순차 발송됩니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
