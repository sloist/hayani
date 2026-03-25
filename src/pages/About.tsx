import PageTransition from '../components/PageTransition';

export default function About() {
  return (
    <PageTransition>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto',
        gap: '32px',
      }}>
        <span className="label" style={{ marginBottom: '24px' }}>About</span>

        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '20px',
          fontWeight: 300,
          lineHeight: '2',
          letterSpacing: '0.04em',
          color: 'var(--text)',
        }}>
          전부 질려버린 어느 날,<br />
          다 버리고 하얀색만 남겼다.<br />
          머릿속이 맑아졌다.
        </p>

        <p style={{
          fontSize: '13px',
          fontWeight: 200,
          color: 'var(--text2)',
          lineHeight: '2',
        }}>
          덜어낸 뒤에 남는 것만 만든다.
        </p>

        <p style={{
          fontSize: '10px',
          letterSpacing: '4px',
          color: 'var(--text3)',
          textTransform: 'uppercase',
          fontWeight: 300,
          marginTop: '40px',
        }}>
          할인 없음 · 유통 없음 · 이곳에서만
        </p>
      </div>
    </PageTransition>
  );
}
