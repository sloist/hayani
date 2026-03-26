import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCollectCount } from '../lib/collect';

interface HeaderProps {
  onLogoClick?: () => void;
}

export default function Header({ onLogoClick }: HeaderProps) {
  const navigate = useNavigate();
  const [count, setCount] = useState(getCollectCount);
  const clickCount = useRef(0);
  const clickTimer = useRef(0);

  useEffect(() => {
    function onUpdate() { setCount(getCollectCount()); }
    window.addEventListener('collect-change', onUpdate);
    return () => window.removeEventListener('collect-change', onUpdate);
  }, []);

  function handleLogoClick() {
    clickCount.current += 1;
    clearTimeout(clickTimer.current);

    if (clickCount.current >= 6) {
      clickCount.current = 0;
      navigate('/admin/login');
      return;
    }

    clickTimer.current = window.setTimeout(() => {
      onLogoClick?.();
      clickCount.current = 0;
    }, 400);
  }

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: '28px 40px',
      pointerEvents: 'none',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <button
        onClick={handleLogoClick}
        style={{
          pointerEvents: 'auto',
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '18px',
          fontWeight: 300,
          letterSpacing: '0.12em',
          color: 'var(--text)',
        }}
      >
        HAYANI
      </button>
      <button
        onClick={() => navigate('/collect')}
        style={{
          pointerEvents: 'auto',
          fontSize: '9px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: 'var(--text2)',
          fontWeight: 300,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        Collect
        {count > 0 && (
          <span style={{
            fontSize: '8px',
            color: 'var(--text)',
            fontWeight: 400,
          }}>
            {count}
          </span>
        )}
      </button>
    </header>
  );
}
