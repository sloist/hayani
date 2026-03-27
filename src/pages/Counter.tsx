import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import { getCounter, addToCounter, removeFromCounter, type CounterItem } from '../lib/counter';
import { sizeToNumber } from '../lib/size';
import BackButton from '../components/BackButton';
import StepIndicator from '../components/StepIndicator';

export default function Counter() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [counter, setCounter] = useState<CounterItem[]>(getCounter);
  const navigate = useNavigate();
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('products').select('*').eq('is_active', true).order('sort_order');
      if (error) console.error('Products fetch failed:', error);
      const prods = data || [];
      setProducts(prods);
      if (prods.length > 0) setSelectedProduct(prods[0]);
      const activeIds = new Set(prods.map(p => p.id));
      const cur = getCounter();
      for (const item of cur) { if (!activeIds.has(item.productId)) removeFromCounter(item.productId, item.size); }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    function onChange() { setCounter(getCounter()); }
    window.addEventListener('counter-change', onChange);
    return () => window.removeEventListener('counter-change', onChange);
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
  const subtotal = counter.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const SHIPPING_FEE = 4000;
  const stripName = (n: string) => n.replace(/^HAYANI\s*/i, '');

  function handleSelectProduct(product: Product) { setSelectedProduct(product); setSelectedSize(''); }

  function handleAdd() {
    if (!selectedProduct || !selectedSize) return;
    addToCounter({ productId: selectedProduct.id, code: selectedProduct.code, name: selectedProduct.name, size: selectedSize, sizeDisplay: selectedSize, price: selectedProduct.price, quantity: 1, imageUrl: selectedProduct.image_url });
    setSelectedSize('');
  }

  if (loading) return <div style={{ height: '100vh' }} />;

  const sizeGuide = selectedProduct?.size_guide;
  const sizes = selectedProduct?.sizes || [];
  const selectedSizeIdx = sizes.indexOf(selectedSize);

  // Get measurement for selected size
  let sizeInfo = '';
  if (selectedSize && selectedSize !== 'F' && selectedSizeIdx >= 0) {
    const guide = sizeGuide?.[selectedSizeIdx];
    sizeInfo = guide
      ? Object.entries(guide).map(([k, v]) => `${k} ${v}`).join(' · ')
      : `가슴 ${52 + selectedSizeIdx * 3} · 총장 ${68 + selectedSizeIdx * 3}`;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>

      {/* Top bar */}
      <div style={{ padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <BackButton to="/" />
        <StepIndicator current={1} />
        <span style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text2)' }}>1 / 3</span>
      </div>

      {/* Thumbnails — flex 2.5, pushed up */}
      <div style={{ flex: 2.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '4px', minHeight: 0 }}>
        <div ref={stripRef} style={{
          display: 'flex', justifyContent: 'center', overflowX: 'auto', overflowY: 'hidden',
          scrollbarWidth: 'none', gap: '10px', padding: '0 40px', width: '100%',
        }}>
          {products.map(product => (
            <button key={product.id} onClick={() => handleSelectProduct(product)} style={{
              flexShrink: 0, width: 'min(140px, 28vw)', height: 'min(186px, 37vw)',
              backgroundColor: 'var(--bg2)',
              border: selectedProduct?.id === product.id ? '1px solid var(--text3)' : '1px solid transparent',
              overflow: 'hidden', padding: 0,
              transition: 'all 0.3s ease',
              opacity: selectedProduct?.id === product.id ? 1 : 0.75,
            }}>
              {product.image_url ? (
                <img className="product-img" src={product.image_url} alt={stripName(product.name)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '9px', letterSpacing: '2px', color: 'var(--text3)' }}>{stripName(product.name)}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Action bar — flex 1.5, tight to thumbnails */}
      <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '8px 40px 0', minHeight: 0 }}>
        {selectedProduct ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '320px' }}>
            {/* Name + Price */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '3px', textTransform: 'uppercase' }}>
                {stripName(selectedProduct.name)}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text2)' }}>{formatPrice(selectedProduct.price)}</span>
            </div>

            {selectedProduct.stock <= 0 ? (
              <span style={{ fontSize: '10px', letterSpacing: '3px', color: 'var(--text3)', textTransform: 'uppercase' }}>Sold Out</span>
            ) : (
              <>
                {/* Size + ADD — one row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                  {sizes.map((size) => {
                    const sizeStock = selectedProduct.stock_by_size?.[size];
                    const isSizeOut = sizeStock !== undefined && sizeStock <= 0;
                    return (
                      <button key={size} onClick={() => !isSizeOut && setSelectedSize(selectedSize === size ? '' : size)} disabled={isSizeOut} style={{
                        minWidth: '32px', height: '32px', padding: '0 8px',
                        border: selectedSize === size ? '1px solid var(--text)' : '1px solid var(--border)',
                        backgroundColor: selectedSize === size ? 'var(--text)' : 'transparent',
                        fontSize: '11px', fontWeight: 500,
                        color: isSizeOut ? 'var(--text3)' : selectedSize === size ? 'var(--bg)' : 'var(--text2)',
                        opacity: isSizeOut ? 0.4 : 1, cursor: isSizeOut ? 'default' : 'pointer',
                        textDecoration: isSizeOut ? 'line-through' : 'none', transition: 'all 0.15s ease',
                      }}>
                        {size}
                      </button>
                    );
                  })}
                  <div style={{ flex: 1 }} />
                  <button onClick={handleAdd} disabled={!selectedSize} style={{
                    padding: '8px 22px',
                    backgroundColor: selectedSize ? 'var(--text)' : 'transparent',
                    color: selectedSize ? 'var(--bg)' : 'var(--text2)',
                    border: selectedSize ? 'none' : '1px solid var(--text3)',
                    fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 500,
                    cursor: selectedSize ? 'pointer' : 'default', transition: 'all 0.2s ease',
                  }}>
                    ADD
                  </button>
                </div>

                {/* Size info — fixed height so nothing shifts */}
                <div style={{ height: '14px', width: '100%' }}>
                  {sizeInfo && (
                    <span style={{ fontSize: '9px', color: 'var(--text3)', fontWeight: 300, letterSpacing: '0.5px' }}>
                      {selectedSize} — {sizeInfo}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        ) : products.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text3)', fontWeight: 300 }}>No items available</p>
        ) : null}
      </div>

      {/* Bottom summary — flex 2.5, closer to action */}
      <div style={{ flex: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', borderTop: '1px solid var(--text3)', padding: '12px 40px', minHeight: 0 }}>
        <div style={{ maxWidth: '520px', margin: '0 auto', width: '100%' }}>
          {counter.length === 0 ? (
            <p style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 300, textAlign: 'center' }}>Still empty</p>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px', maxHeight: '25vh', overflowY: 'auto' }}>
                {counter.map(item => (
                  <div key={`${item.productId}-${item.size}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text2)' }}>
                      {stripName(item.name)} · {item.sizeDisplay || sizeToNumber(item.size, products.find(p => p.id === item.productId)?.sizes)} · {item.quantity}EA
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 500 }}>{formatPrice(item.price * item.quantity)}</span>
                      <button onClick={() => removeFromCounter(item.productId, item.size)} style={{ fontSize: '9px', color: 'var(--text3)', padding: '2px' }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>{formatPrice(subtotal + SHIPPING_FEE)}</span>
                  <span style={{ fontSize: '8px', color: 'var(--text3)', marginLeft: '6px' }}>Shipping included</span>
                </div>
                <button onClick={() => counter.length > 0 && navigate('/counter/checkout')} style={{
                  padding: '11px 28px', backgroundColor: 'var(--text)', color: 'var(--bg)',
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
