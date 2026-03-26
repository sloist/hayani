import { useNavigate } from 'react-router-dom';

interface Props {
  to?: string;
}

export default function BackButton({ to }: Props) {
  const navigate = useNavigate();

  function handleClick() {
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
