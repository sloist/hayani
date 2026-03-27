import BackButton from '../components/BackButton';

export default function Terms() {
  return (
    <div style={{ height: '100vh', overflow: 'hidden', padding: '60px 24px 24px', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, padding: '16px 24px', zIndex: 100, backgroundColor: 'var(--bg)' }}>
        <BackButton />
      </div>

      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 400, letterSpacing: '0.08em', marginBottom: '28px', flexShrink: 0 }}>
        Terms
      </h1>

      <div style={{ fontSize: '12px', fontWeight: 400, lineHeight: '2', color: 'var(--text2)', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
        <section>
          <h2 style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '16px', fontWeight: 400 }}>Order & Payment</h2>
          <p>주문 후 무통장 입금으로 결제가 진행됩니다. 24시간 이내 미입금 시 주문은 자동 취소됩니다.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '16px', fontWeight: 400 }}>Shipping</h2>
          <p>배송비는 전 상품 ₩4,000이며, 입금 확인 후 순차적으로 발송됩니다.</p>
          <p>배송은 한진택배를 이용하며, 발송 후 1~3일 이내 수령 가능합니다.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '16px', fontWeight: 400 }}>Exchange & Return</h2>
          <p>수령 후 7일 이내 교환 및 환불이 가능합니다.</p>
          <p>착용 또는 세탁한 제품은 교환 및 환불이 불가합니다.</p>
          <p>반송 배송비는 구매자 부담입니다.</p>
          <p>교환/환불 접수: white@hayani.kr</p>
        </section>

        <section>
          <h2 style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '16px', fontWeight: 400 }}>Notice</h2>
          <p>본 약관은 2026년 3월부터 적용됩니다. 약관 변경 시 사이트를 통해 공지합니다.</p>
        </section>
      </div>
    </div>
  );
}
