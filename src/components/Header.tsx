import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '24px 40px',
      pointerEvents: 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', pointerEvents: 'auto' }}>
        <Link to="/" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '18px',
          fontWeight: 300,
          letterSpacing: '0.12em',
        }}>
          HAYANI
        </Link>
        <Link to="/admin/login" style={{
          fontSize: '0',
          width: '8px',
          height: '8px',
          display: 'inline-block',
          opacity: 0,
        }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.15')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
          aria-label="Admin"
        >
          &middot;
        </Link>
      </div>

      {/* Bag icon */}
      <Link to="/wear" style={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
        opacity: 0.4,
        transition: 'opacity 0.3s ease',
      }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.4')}
      >
        <svg width="18" height="20" viewBox="0 0 18 20" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M1 5h16v14H1z" />
          <path d="M5 5V4a4 4 0 0 1 8 0v1" />
        </svg>
      </Link>
    </header>
  );
}
