import type { Product } from '../types';

interface Props {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: Props) {
  const isSoldOut = product.stock <= 0;

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        width: '100%',
        height: '100%',
        padding: '0',
      }}
    >
      {/* Image area */}
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
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 300,
            letterSpacing: '0.12em',
            color: 'var(--text3)',
          }}>
            {product.code}
          </span>
        )}
      </div>

      {/* Label */}
      <div style={{ textAlign: 'center' }}>
        <span style={{
          fontSize: '10px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: 'var(--text2)',
          fontWeight: 300,
        }}>
          {product.code}
        </span>
        {isSoldOut && (
          <span style={{
            display: 'block',
            marginTop: '4px',
            fontSize: '9px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'var(--text3)',
          }}>
            Sold Out
          </span>
        )}
      </div>
    </button>
  );
}
