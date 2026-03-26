import { useNavigate } from 'react-router-dom';

export default function CounterIndicator() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate('/counter')} style={{
      fontSize: '10px', textTransform: 'uppercase', letterSpacing: '3px',
      color: 'var(--text2)', fontWeight: 400,
    }}>
      COUNTER
    </button>
  );
}
