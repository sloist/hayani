import { useEffect, useState } from 'react';
import type { Product } from '../types';

interface Props {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: Props) {
  const [closing, setClosing] = useState(false);
  const formatPrice = (p: number) => `₩${p.toLocaleString('ko-KR')}`;
  const name = product.name.replace(/^HAYANI\s*/i, '');
  const specs = (product.specs || []).map(s => s.replace(/off-?white/i, 'Canvas-White'));

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleClose() { setClosing(true); setTimeout(onClose, 250); }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      backgroundColor: 'var(--bg)', overflow: 'hidden',
      animation: closing ? 'modalOut 0.25s ease forwards' : 'modalIn 0.3s ease',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '20px 40px', flexShrink: 0, maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <button onClick={handleClose} style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 400,
          color: 'var(--text)', padding: '0',
        }}>&larr;</button>
      </div>

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

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 400, letterSpacing: '0.06em' }}>{name}</h2>
            <span style={{ fontSize: '12px', color: 'var(--text2)' }}>{formatPrice(product.price)}</span>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text2)', fontWeight: 300, letterSpacing: '0.5px' }}>
            {specs.join(' · ')}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes modalIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalOut { from { opacity: 1; } to { opacity: 0; } }
      `}</style>
    </div>
  );
}
