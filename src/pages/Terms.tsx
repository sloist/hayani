import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div style={{ minHeight: '100vh', padding: '120px 40px 80px', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'fixed', top: 0, left: 0, right: 0, padding: '28px 40px', zIndex: 100, backgroundColor: 'var(--bg)' }}>
        <Link to="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: 300, letterSpacing: '0.12em' }}>
          HAYANI
        </Link>
        <Link to="/" style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text2)' }}>
          Back
        </Link>
      </div>

      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 300, letterSpacing: '0.08em', marginBottom: '48px' }}>
        Terms of Service
      </h1>

      <div style={{ fontSize: '12px', fontWeight: 300, lineHeight: '2.2', color: 'var(--text2)', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <section>
          <h2 style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '16px', fontWeight: 400 }}>주문 및 결제</h2>
          <p>모든 상품은 프리오더 방식으로 운영됩니다. 주문 후 무통장 입금 확인 시 제작이 시작되며, 입금 확인까지 최대 24시간이 소요될 수 있습니다. 제작 기간은 상품별로 상이하며, 상세 페이지에 안내됩니다.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '16px', fontWeight: 400 }}>배송</h2>
          <p>배송비는 전 상품 ₩4,000이며, 제작 완료 후 순차적으로 발송됩니다. 배송은 CJ대한통운을 이용하며, 발송 후 1~3일 이내 수령 가능합니다.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '16px', fontWeight: 400 }}>교환 및 반품</h2>
          <p>프리오더 특성상 단순 변심에 의한 교환 및 반품은 불가합니다. 상품 하자 시 수령 후 7일 이내 hello@hayani.kr로 문의해 주세요.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '16px', fontWeight: 400 }}>기타</h2>
          <p>본 약관은 2026년 3월부터 적용됩니다. 약관 변경 시 사이트를 통해 공지합니다.</p>
        </section>
      </div>
    </div>
  );
}
