import { Link, useSearchParams } from 'react-router-dom';

export default function BoxComplete() {
  const [params] = useSearchParams();
  const orderNumber = params.get('order_number');
  const totalPrice = params.get('total');

  const formatPrice = (p: number) => `₩${p.toLocaleString('ko-KR')}`;

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

      {/* Bank info */}
      <div style={{ padding: '24px 32px', border: '1px solid var(--border)', marginTop: '8px', textAlign: 'center' }}>
        <div style={{ fontSize: '14px', fontWeight: 400, lineHeight: '2' }}>
          <div>카카오뱅크</div>
          <div style={{ fontWeight: 500 }}>계좌번호 안내 예정</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)' }}>예금주: 하야니</div>
        </div>
        {totalPrice && (
          <div style={{ marginTop: '12px', fontSize: '15px', fontWeight: 500 }}>
            {formatPrice(Number(totalPrice))}
          </div>
        )}
      </div>

      <p style={{ fontSize: '13px', fontWeight: 300, color: 'var(--text2)', lineHeight: '1.8' }}>
        입금 확인 후 순차 발송됩니다.
      </p>

      <p style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 300 }}>
        이 화면을 저장해 주세요.
      </p>

      <div style={{ marginTop: '32px', display: 'flex', gap: '24px' }}>
        <Link to="/order/check" style={{
          fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase',
          color: 'var(--text2)', borderBottom: '1px solid var(--border)', paddingBottom: '4px', fontWeight: 400,
        }}>
          Order
        </Link>
        <Link to="/" style={{
          fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase',
          color: 'var(--text2)', borderBottom: '1px solid var(--border)', paddingBottom: '4px', fontWeight: 400,
        }}>
          Home
        </Link>
      </div>
    </div>
  );
}
