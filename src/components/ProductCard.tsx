import type { Product } from '../types';

interface Props {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        width: '100%',
        height: '100%',
        padding: '0',
      }}
    >
      <div
        style={{
          width: '80%',
          maxWidth: '480px',
          aspectRatio: '3/4',
          backgroundColor: 'var(--bg2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transition: 'opacity 0.4s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.92'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.code}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 400,
            letterSpacing: '0.12em',
            color: 'var(--text3)',
          }}>
            {product.code}
          </span>
        )}
      </div>
    </button>
  );
}
