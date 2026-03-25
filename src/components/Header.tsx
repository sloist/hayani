import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Wear', path: '/wear' },
  { label: 'About', path: '/about' },
];

export default function Header() {
  const location = useLocation();

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
      background: 'var(--bg)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
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

      <nav style={{
        display: 'flex',
        gap: '32px',
      }}>
        {NAV_ITEMS.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              fontSize: '11px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              fontWeight: 300,
              color: location.pathname === item.path ? 'var(--text)' : 'var(--text2)',
              transition: 'color 0.3s ease',
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
