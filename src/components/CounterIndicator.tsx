import { useNavigate } from 'react-router-dom';

export default function CounterIndicator() {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'fixed', top: '28px', left: 0, right: 0, zIndex: 100, pointerEvents: 'none' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 40px', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => navigate('/counter')} style={{
          fontSize: '10px', textTransform: 'uppercase', letterSpacing: '3px',
          color: 'var(--text2)', fontWeight: 400, pointerEvents: 'auto',
        }}>
          COUNTER
        </button>
      </div>
    </div>
  );
}
