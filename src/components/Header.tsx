import { useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isProduct = location.pathname.startsWith('/wear/');
  const clickCount = useRef(0);
  const clickTimer = useRef<number>(0);

  // Triple-click HAYANI logo → admin
  function handleLogoClick(e: React.MouseEvent) {
    clickCount.current++;
    clearTimeout(clickTimer.current);

    if (clickCount.current >= 3) {
      e.preventDefault();
      clickCount.current = 0;
      navigate('/admin/login');
      return;
    }

    clickTimer.current = window.setTimeout(() => {
      clickCount.current = 0;
    }, 500);
  }

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
      <div style={{ pointerEvents: 'auto' }}>
        <Link to="/" onClick={handleLogoClick} style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '18px',
          fontWeight: 300,
          letterSpacing: '0.12em',
        }}>
          HAYANI
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'center', pointerEvents: 'auto' }}>
        {isProduct && (
          <Link to="/" style={{
            fontSize: '10px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'var(--text2)',
            transition: 'color 0.3s ease',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text2)')}
          >
            Back
          </Link>
        )}
      </div>
    </header>
  );
}
