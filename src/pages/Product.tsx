import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product as ProductType } from '../types';
import PageTransition from '../components/PageTransition';

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    async function fetch() {
      if (!id) return;
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      setProduct(data);
      setLoading(false);
    }
    fetch();
  }, [id]);

  if (loading) return <div style={{ minHeight: '100vh' }} />;
  if (!product) {
    navigate('/wear');
    return null;
  }

  const isSoldOut = product.stock <= 0;
  const canOrder = selectedSize && !isSoldOut;

  function handleOrder() {
    if (!canOrder) return;
    const params = new URLSearchParams({
      product_id: product!.id,
      size: selectedSize,
    });
    navigate(`/order?${params.toString()}`);
  }

  const formatPrice = (price: number) =>
    `₩${price.toLocaleString('ko-KR')}`;

  return (
    <PageTransition>
      <div style={{
        paddingTop: '80px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
      }}>
        {/* Left: Image */}
        <div style={{
          flex: '1 1 50%',
          minWidth: '300px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          backgroundColor: 'var(--bg2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{
              fontSize: '11px',
              letterSpacing: '4px',
              color: 'var(--text3)',
              textTransform: 'uppercase',
            }}>
              {product.code}
            </span>
          )}
        </div>

        {/* Right: Info */}
        <div style={{
          flex: '1 1 400px',
          padding: '120px 60px 80px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}>
          {/* Code */}
          <span className="label">{product.code}</span>

          {/* Name */}
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '28px',
            fontWeight: 300,
            letterSpacing: '0.06em',
          }}>
            {product.name}
          </h1>

          {/* Price */}
          <span style={{
            fontSize: '14px',
            fontWeight: 300,
            letterSpacing: '0.04em',
          }}>
            {formatPrice(product.price)}
          </span>

          {/* Specs */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border)',
          }}>
            {(product.specs || []).map((spec, i) => (
              <span key={i} style={{
                fontSize: '11px',
                letterSpacing: '2px',
                color: 'var(--text2)',
                fontWeight: 300,
              }}>
                {spec}
              </span>
            ))}
          </div>

          {/* Size selection */}
          <div style={{
            display: 'flex',
            gap: '12px',
            paddingTop: '16px',
          }}>
            {(product.sizes || []).map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                disabled={isSoldOut}
                style={{
                  width: '48px',
                  height: '48px',
                  border: selectedSize === size
                    ? '1px solid var(--text)'
                    : '1px solid var(--border)',
                  backgroundColor: 'transparent',
                  fontSize: '10px',
                  letterSpacing: '2px',
                  color: isSoldOut ? 'var(--text3)' : 'var(--text)',
                  transition: 'border-color 0.2s ease',
                }}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Order button */}
          <button
            onClick={handleOrder}
            disabled={!canOrder}
            style={{
              marginTop: '16px',
              padding: '16px 0',
              backgroundColor: canOrder ? 'var(--text)' : 'var(--border)',
              color: canOrder ? 'var(--bg)' : 'var(--text3)',
              fontSize: '10px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              fontWeight: 300,
              transition: 'opacity 0.3s ease',
              cursor: canOrder ? 'pointer' : 'default',
            }}
            onMouseEnter={e => { if (canOrder) e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            {isSoldOut ? 'Sold Out' : 'Order'}
          </button>

          {/* Pre-order notice */}
          {!isSoldOut && (
            <p style={{
              fontSize: '11px',
              color: 'var(--text3)',
              fontWeight: 200,
              lineHeight: '1.8',
            }}>
              프리오더 상품입니다.<br />
              주문 순서대로 순차 발송됩니다.
            </p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
