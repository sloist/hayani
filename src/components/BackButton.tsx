import { useNavigate } from 'react-router-dom';

interface Props {
  to?: string;
}

export default function BackButton({ to }: Props) {
  const navigate = useNavigate();

  function handleClick() {
    // Always set flag so Main restores slide position on back-nav
    sessionStorage.setItem('hayani_navigated', '1');
    if (to) {
      navigate(to);
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
  }

  return (
    <button
      onClick={handleClick}
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '20px',
        fontWeight: 300,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text)',
        padding: '0',
      }}
    >
      &larr;
    </button>
  );
}
