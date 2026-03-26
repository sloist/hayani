import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import { getBox, addToBox, removeFromBox, type BoxItem } from '../lib/box';
import BackButton from '../components/BackButton';
import BoxIndicator from '../components/BoxIndicator';

export default function Box() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [box, setBox] = useState<BoxItem[]>(getBox);
  const navigate = useNavigate();
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .gt('stock', 0)
        .order('sort_order');
      setProducts(data || []);
      if (data && data.length > 0) setSelectedProduct(data[0]);
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

  // Horizontal scroll with wheel on product strip
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el!.scrollLeft += e.deltaY;
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const formatPrice = (p: number) => `₩${p.toLocaleString('ko-KR')}`;
  const subtotal = box.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const SHIPPING_FEE = 4000;

  function handleSelectProduct(product: Product) {
    setSelectedProduct(product);
    setSelectedSize('');
  }

  function handleAdd() {
    if (!selectedProduct || !selectedSize) return;
    addToBox({
      productId: selectedProduct.id,
      code: selectedProduct.code,
      name: selectedProduct.name,
      size: selectedSize,
      price: selectedProduct.price,
      quantity: 1,
      imageUrl: selectedProduct.image_url,
    });
    setSelectedSize('');
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '28px 40px', display: 'flex', justifyContent: 'space-between', backgroundColor: 'var(--bg)' }}>
        <BackButton to="/" />
        <BoxIndicator />
      </div>

      {/* Horizontal product strip */}
      <div
        ref={stripRef}
        style={{
          marginTop: '80px',
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'none',
          gap: '4px',
          padding: '0 40px',
          flexShrink: 0,
        }}
      >
        {products.map(product => (
          <button
            key={product.id}
            onClick={() => handleSelectProduct(product)}
            style={{
              flexShrink: 0,
              width: '120px',
              height: '160px',
              backgroundColor: 'var(--bg2)',
              border: selectedProduct?.id === product.id ? '2px solid var(--text)' : '2px solid transparent',
              overflow: 'hidden',
              cursor: 'pointer',
              padding: 0,
              transition: 'border-color 0.2s ease',
            }}
          >
            {product.image_url ? (
              <img src={product.image_url} alt={product.code} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text3)', fontWeight: 500 }}>{product.code}</span>
            )}
          </button>
        ))}
      </div>

      {/* Selected product detail */}
      {selectedProduct && (
        <div style={{ padding: '32px 40px', maxWidth: '520px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 500, color: 'var(--text2)' }}>
              {selectedProduct.code}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>
              {formatPrice(selectedProduct.price)}
            </span>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 400, letterSpacing: '0.04em', marginBottom: '20px' }}>
            {selectedProduct.name}
          </h2>

          {/* Size selection as 1, 2, 3 */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
            {(selectedProduct.sizes || []).map((size, i) => (
              <button
                key={size}
                onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                style={{
                  minWidth: '40px', height: '40px', padding: '0 10px',
                  border: selectedSize === size ? '1px solid var(--text)' : '1px solid var(--border)',
                  backgroundColor: selectedSize === size ? 'var(--text)' : 'transparent',
                  fontSize: '13px', fontWeight: 500,
                  color: selectedSize === size ? 'var(--bg)' : 'var(--text2)',
                  transition: 'all 0.2s ease',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Add button */}
          <button
            onClick={handleAdd}
            disabled={!selectedSize}
            style={{
              padding: '12px 32px',
              backgroundColor: selectedSize ? 'var(--text)' : 'var(--border)',
              color: selectedSize ? 'var(--bg)' : 'var(--text3)',
              fontSize: '10px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              fontWeight: 500,
              cursor: selectedSize ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              marginTop: '4px',
            }}
          >
            BOX
          </button>
        </div>
      )}

      {products.length === 0 && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: '14px', color: 'var(--text3)', fontWeight: 300, textAlign: 'center' }}>
            No items available
          </p>
        </div>
      )}

      {/* Box summary - fixed bottom */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: 'var(--bg)', borderTop: '1px solid var(--border)',
        padding: '20px 40px',
      }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          {box.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text3)', fontWeight: 300, textAlign: 'center' }}>
              Still empty
            </p>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {box.map(item => (
                  <div key={`${item.productId}-${item.size}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 300, color: 'var(--text2)' }}>
                      {item.code} / {item.size} / {item.quantity}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 500 }}>{formatPrice(item.price * item.quantity)}</span>
                      <button
                        onClick={() => handleRemove(item.productId, item.size)}
                        style={{ fontSize: '11px', color: 'var(--text3)', padding: '0' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>{formatPrice(subtotal + SHIPPING_FEE)}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text2)', marginLeft: '8px' }}>incl. delivery</span>
                </div>
                <button
                  onClick={handleNext}
                  style={{
                    padding: '12px 32px',
                    backgroundColor: 'var(--text)',
                    color: 'var(--bg)',
                    fontSize: '10px',
                    letterSpacing: '4px',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                  }}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
