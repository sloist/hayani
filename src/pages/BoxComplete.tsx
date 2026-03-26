import { Link, useSearchParams } from 'react-router-dom';

export default function BoxComplete() {
  const [params] = useSearchParams();
  const orderNumber = params.get('order_number');

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', padding: '40px', textAlign: 'center', gap: '24px',
    }}>
      <span style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 500 }}>
        Order Confirmed
      </span>
      {orderNumber && (
        <span style={{ fontSize: '14px', letterSpacing: '2px', color: 'var(--text)', fontFamily: 'monospace', fontWeight: 500 }}>
          {orderNumber}
        </span>
      )}
      <p style={{ fontSize: '13px', fontWeight: 300, color: 'var(--text2)', lineHeight: '1.8' }}>
        입금 확인 후 순차 발송됩니다.
      </p>
      <Link to="/" style={{
        marginTop: '40px', fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase',
        color: 'var(--text2)', borderBottom: '1px solid var(--border)', paddingBottom: '4px', fontWeight: 400,
      }}>
        Home
      </Link>
    </div>
  );
}
