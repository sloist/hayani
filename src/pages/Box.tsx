import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import { getBox, addToBox, removeFromBox, type BoxItem } from '../lib/box';
import { sizeToNumber } from '../lib/size';
import BackButton from '../components/BackButton';
import StepIndicator from '../components/StepIndicator';

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
      const { data, error } = await supabase.from('products').select('*').eq('is_active', true).order('sort_order');
      if (error) console.error('Products fetch failed:', error);
      const prods = data || [];
      setProducts(prods);
      if (prods.length > 0) setSelectedProduct(prods[0]);

      // Clean stale BOX items (inactive or removed products)
      const activeIds = new Set(prods.map(p => p.id));
      const currentBox = getBox();
      const staleItems = currentBox.filter(item => !activeIds.has(item.productId));
      for (const item of staleItems) {
        removeFromBox(item.productId, item.size);
      }

      setLoading(false);
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    function onBoxChange() { setBox(getBox()); }
    window.addEventListener('box-change', onBoxChange);
    return () => window.removeEventListener('box-change', onBoxChange);
  }, []);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { e.preventDefault(); el!.scrollLeft += e.deltaY; }
    }
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const formatPrice = (p: number) => `₩${p.toLocaleString('ko-KR')}`;
  const subtotal = box.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const SHIPPING_FEE = 4000;
  const stripName = (n: string) => n.replace(/^HAYANI\s*/i, '');

  function handleSelectProduct(product: Product) { setSelectedProduct(product); setSelectedSize(''); }

  function handleAdd() {
    if (!selectedProduct || !selectedSize) return;
    addToBox({ productId: selectedProduct.id, code: selectedProduct.code, name: selectedProduct.name, size: selectedSize, price: selectedProduct.price, quantity: 1, imageUrl: selectedProduct.image_url });
    setSelectedSize('');
  }

  if (loading) return <div style={{ height: '100vh' }} />;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{ padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <BackButton to="/" />
        <StepIndicator current={1} />
        <span style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text2)', fontWeight: 400 }}>1 / 3</span>
      </div>

      {/* Product strip */}
      <div ref={stripRef} style={{
        display: 'flex', justifyContent: 'center', overflowX: 'auto', overflowY: 'hidden',
        scrollbarWidth: 'none', gap: '4px', padding: '0 40px', flexShrink: 0,
      }}>
        {products.map(product => (
          <button key={product.id} onClick={() => handleSelectProduct(product)} style={{
            flexShrink: 0, width: 'min(110px, 22vw)', height: 'min(146px, 29vw)',
            backgroundColor: selectedProduct?.id === product.id ? 'var(--border)' : 'var(--bg2)',
            border: 'none', overflow: 'hidden', padding: 0,
            transition: 'background-color 0.3s ease',
            opacity: selectedProduct?.id === product.id ? 1 : 0.85,
          }}>
            {product.image_url ? (
              <img className="product-img" src={product.image_url} alt={stripName(product.name)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text3)' }}>{stripName(product.name)}</span>
            )}
          </button>
        ))}
      </div>

      {/* Selected product — flex grows to fill */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 40px' }}>
        {selectedProduct ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%', maxWidth: '300px' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 400, letterSpacing: '0.04em' }}>
                {stripName(selectedProduct.name)}
              </h2>
              <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text2)' }}>{formatPrice(selectedProduct.price)}</span>
            </div>

            {selectedProduct.stock <= 0 ? (
              <span style={{ fontSize: '10px', letterSpacing: '3px', color: 'var(--text3)', textTransform: 'uppercase' }}>Sold Out</span>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(selectedProduct.sizes || []).map((size, i) => {
                    const sizeStock = selectedProduct.stock_by_size?.[size];
                    const isSizeOut = sizeStock !== undefined && sizeStock <= 0;
                    return (
                      <button key={size} onClick={() => !isSizeOut && setSelectedSize(selectedSize === size ? '' : size)} disabled={isSizeOut} style={{
                        minWidth: '36px', height: '36px', padding: '0 8px',
                        border: selectedSize === size ? '1px solid var(--text)' : '1px solid var(--border)',
                        backgroundColor: selectedSize === size ? 'var(--text)' : 'transparent',
                        fontSize: '12px', fontWeight: 500,
                        color: isSizeOut ? 'var(--text3)' : selectedSize === size ? 'var(--bg)' : 'var(--text2)',
                        opacity: isSizeOut ? 0.4 : 1, cursor: isSizeOut ? 'default' : 'pointer',
                        textDecoration: isSizeOut ? 'line-through' : 'none', transition: 'all 0.2s ease',
                      }}>
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
                <button onClick={handleAdd} disabled={!selectedSize} style={{
                  padding: '10px 28px', backgroundColor: selectedSize ? 'var(--text)' : 'var(--border)',
                  color: selectedSize ? 'var(--bg)' : 'var(--text3)',
                  fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 500,
                  cursor: selectedSize ? 'pointer' : 'default', transition: 'all 0.2s ease',
                }}>
                  BOX
                </button>
              </>
            )}
          </div>
        ) : products.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text3)', fontWeight: 300 }}>No items available</p>
        ) : null}
      </div>

      {/* Bottom summary */}
      <div style={{ flexShrink: 0, borderTop: '1px solid var(--border)', padding: '16px 40px' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          {box.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 300, textAlign: 'center' }}>Still empty</p>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {box.map(item => (
                  <div key={`${item.productId}-${item.size}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text2)' }}>
                      {stripName(item.name)} · {sizeToNumber(item.size)} · {item.quantity}EA
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 500 }}>{formatPrice(item.price * item.quantity)}</span>
                      <button onClick={() => removeFromBox(item.productId, item.size)} style={{ fontSize: '10px', color: 'var(--text3)', padding: '2px' }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: '15px', fontWeight: 500 }}>{formatPrice(subtotal + SHIPPING_FEE)}</span>
                  <span style={{ fontSize: '9px', color: 'var(--text3)', marginLeft: '8px' }}>Shipping included</span>
                </div>
                <button onClick={() => box.length > 0 && navigate('/box/order')} style={{
                  padding: '12px 32px', backgroundColor: 'var(--text)', color: 'var(--bg)',
                  fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 500,
                }}>Continue</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
