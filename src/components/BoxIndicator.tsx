import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBoxCount } from '../lib/box';

export default function BoxIndicator() {
  const [count, setCount] = useState(getBoxCount);
  const navigate = useNavigate();

  useEffect(() => {
    function onBoxChange() {
      setCount(getBoxCount());
    }
    window.addEventListener('box-change', onBoxChange);
    window.addEventListener('storage', onBoxChange);
    return () => {
      window.removeEventListener('box-change', onBoxChange);
      window.removeEventListener('storage', onBoxChange);
    };
  }, []);

  return (
    <button
      onClick={() => navigate('/box')}
      style={{
        position: 'fixed',
        top: '28px',
        right: '40px',
        zIndex: 100,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0',
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '3px',
        color: 'var(--text2)',
        fontWeight: 400,
      }}
    >
      BOX{count > 0 ? ` ${count}` : ''}
    </button>
  );
}
