import { Link, useSearchParams } from 'react-router-dom';
import StepIndicator from '../components/StepIndicator';

export default function Complete() {
  const [params] = useSearchParams();
  const orderNumber = params.get('order_number');
  const totalPrice = params.get('total');
  const formatPrice = (p: number) => `₩${p.toLocaleString('ko-KR')}`;

  return (
    <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: '40px' }} />
        <StepIndicator current={3} />
        <span style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text2)' }}>3 / 3</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 40px', textAlign: 'center', gap: '14px' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, letterSpacing: '0.06em' }}>감사합니다</h1>
        {orderNumber && <span style={{ fontSize: '13px', letterSpacing: '2px', color: 'var(--text)', fontFamily: 'monospace', fontWeight: 500 }}>{orderNumber}</span>}

        <div style={{ padding: '24px 36px', border: '1px solid var(--border)', marginTop: '8px', textAlign: 'center', minWidth: '260px' }}>
          <div style={{ fontSize: '13px', fontWeight: 400, lineHeight: '2' }}>
            <div>카카오뱅크</div>
            <div style={{ fontWeight: 500, fontSize: '15px' }}>계좌번호 안내 예정</div>
            <div style={{ fontSize: '11px', color: 'var(--text2)' }}>예금주: 하야니</div>
          </div>
          {totalPrice && !isNaN(Number(totalPrice)) && (
            <div style={{ marginTop: '14px', fontSize: '18px', fontWeight: 500 }}>{formatPrice(Number(totalPrice))}</div>
          )}
        </div>

        <p style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text2)' }}>입금 확인 후 순차 발송됩니다.</p>
        <p style={{ fontSize: '11px', color: 'var(--text2)' }}>이 화면을 저장해 주세요.</p>

        <div style={{ marginTop: '20px', display: 'flex', gap: '24px' }}>
          <Link to="/order" style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--text2)', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>Order</Link>
          <Link to="/" style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--text2)', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>Home</Link>
        </div>
      </div>
    </div>
  );
}
