import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import { getBox, addToBox, removeFromBox, type BoxItem } from '../lib/box';
import BackButton from '../components/BackButton';
import BoxIndicator from '../components/BoxIndicator';

export default function Box() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [box, setBox] = useState<BoxItem[]>(getBox);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .gt('stock', 0)
        .order('sort_order');
      setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    function onBoxChange() {
      setBox(getBox());
    }
    window.addEventListener('box-change', onBoxChange);
    return () => window.removeEventListener('box-change', onBoxChange);
  }, []);

  const formatPrice = (p: number) => `₩${p.toLocaleString('ko-KR')}`;
  const subtotal = box.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const SHIPPING_FEE = 4000;

  function handleAdd(product: Product) {
    const size = selectedSizes[product.id];
    if (!size) return;
    addToBox({
      productId: product.id,
      code: product.code,
      name: product.name,
      size,
      price: product.price,
      quantity: 1,
      imageUrl: product.image_url,
    });
    setSelectedSizes(prev => ({ ...prev, [product.id]: '' }));
  }

  function handleRemove(productId: string, size: string) {
    removeFromBox(productId, size);
  }

  function handleNext() {
    if (box.length === 0) return;
    navigate('/box/order');
  }

  if (loading) return <div style={{ minHeight: '100vh' }} />;

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '100px 40px 160px' }}>
      {/* Top bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '28px 40px', display: 'flex', justifyContent: 'space-between' }}>
        <BackButton to="/" />
        <BoxIndicator />
      </div>

      <span className="label" style={{ display: 'block', marginBottom: '40px' }}>Box</span>

      {/* Product list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '48px' }}>
        {products.map(product => (
          <div key={product.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            {/* Thumbnail */}
            <div style={{
              width: '72px', height: '96px', flexShrink: 0,
              backgroundColor: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text3)' }}>{product.code}</span>
              )}
            </div>

            {/* Info + size select */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '10px', letterSpacing: '3px', color: 'var(--text2)', textTransform: 'uppercase' }}>{product.code}</span>
              <span style={{ fontSize: '13px', fontWeight: 300 }}>{product.name}</span>
              <span style={{ fontSize: '12px', fontWeight: 300, color: 'var(--text2)' }}>{formatPrice(product.price)}</span>

              {/* Size buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                {(product.sizes || []).map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSizes(prev => ({ ...prev, [product.id]: prev[product.id] === size ? '' : size }))}
                    style={{
                      minWidth: '40px', height: '32px', padding: '0 8px',
                      border: selectedSizes[product.id] === size ? '1px solid var(--text)' : '1px solid var(--border)',
                      backgroundColor: 'transparent',
                      fontSize: '9px', letterSpacing: '2px',
                      color: selectedSizes[product.id] === size ? 'var(--text)' : 'var(--text2)',
                      transition: 'border-color 0.2s ease',
                      cursor: 'pointer',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {/* Add button */}
              {selectedSizes[product.id] && (
                <button
                  onClick={() => handleAdd(product)}
                  style={{
                    alignSelf: 'flex-start',
                    padding: '6px 16px',
                    backgroundColor: 'var(--text)',
                    color: 'var(--bg)',
                    fontSize: '9px',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '4px',
                  }}
                >
                  담기
                </button>
              )}
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <p style={{ fontSize: '13px', color: 'var(--text3)', fontWeight: 200, textAlign: 'center', padding: '40px 0' }}>
            판매 중인 제품이 없습니다.
          </p>
        )}
      </div>

      {/* Box summary - fixed bottom */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: 'var(--bg)', borderTop: '1px solid var(--border)',
        padding: '20px 40px',
      }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          {box.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 200, textAlign: 'center' }}>
              아직 비어 있습니다
            </p>
          ) : (
            <>
              {/* Box items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {box.map(item => (
                  <div key={`${item.productId}-${item.size}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 300, color: 'var(--text2)' }}>
                      {item.code} / {item.size} / {item.quantity}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 300 }}>{formatPrice(item.price * item.quantity)}</span>
                      <button
                        onClick={() => handleRemove(item.productId, item.size)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: '11px', color: 'var(--text3)', padding: '0',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total + next */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text2)' }}>합계 </span>
                  <span style={{ fontSize: '13px', fontWeight: 400 }}>{formatPrice(subtotal + SHIPPING_FEE)}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text3)', marginLeft: '8px' }}>배송비 포함</span>
                </div>
                <button
                  onClick={handleNext}
                  style={{
                    padding: '10px 28px',
                    backgroundColor: 'var(--text)',
                    color: 'var(--bg)',
                    fontSize: '9px',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  다음
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
