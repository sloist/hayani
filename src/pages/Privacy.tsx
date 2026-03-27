import BackButton from '../components/BackButton';

export default function Privacy() {
  return (
    <div style={{ height: '100vh', overflow: 'hidden', padding: '56px 24px 56px', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, backgroundColor: 'var(--bg)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px 24px' }}>
          <BackButton />
        </div>
      </div>

      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 400, letterSpacing: '0.08em', marginBottom: '28px', flexShrink: 0 }}>
        Privacy
      </h1>

      <div style={{ fontSize: '12px', fontWeight: 400, lineHeight: '2', color: 'var(--text2)', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
        <section>
          <h2 style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '16px', fontWeight: 400 }}>Information Collected</h2>
          <p>주문 시 이름, 연락처, 이메일, 배송 주소를 수집합니다. 수집된 정보는 주문 처리 및 배송 목적으로만 사용됩니다.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '16px', fontWeight: 400 }}>Data Retention</h2>
          <p>개인정보는 주문 완료 후 5년간 보관되며, 이후 안전하게 파기됩니다. 관련 법령에 따라 보관 기간이 달라질 수 있습니다.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '16px', fontWeight: 400 }}>Third Parties</h2>
          <p>수집된 개인정보는 배송 업체(한진택배)를 제외한 제3자에게 제공되지 않습니다.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '16px', fontWeight: 400 }}>Contact</h2>
          <p>개인정보 관련 문의는 hello@hayani.kr로 연락해 주세요.</p>
        </section>
      </div>
    </div>
  );
}
