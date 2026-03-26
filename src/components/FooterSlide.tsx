import { useNavigate } from 'react-router-dom';

export default function FooterSlide() {
  const navigate = useNavigate();

  const linkStyle = {
    fontSize: '9px',
    letterSpacing: '3px',
    textTransform: 'uppercase' as const,
    color: 'var(--text3)',
    fontWeight: 300,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px',
      textAlign: 'center',
      gap: '40px',
    }}>
      <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(16px, 2.5vw, 20px)',
          fontWeight: 300,
          lineHeight: '2.2',
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
          marginTop: '8px',
        }}>
          덜어낸 뒤에 남는 것만 만든다.
        </p>
      </div>

      <div style={{ marginTop: '60px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="mailto:hello@hayani.kr" style={{ ...linkStyle, textDecoration: 'none' }}>
            Contact
          </a>
          <button onClick={() => navigate('/terms')} style={linkStyle}>
            Terms
          </button>
          <button onClick={() => navigate('/privacy')} style={linkStyle}>
            Privacy
          </button>
        </div>
        <span style={{
          fontSize: '9px',
          letterSpacing: '3px',
          color: 'var(--text3)',
          marginTop: '8px',
        }}>
          &copy; 2026 HAYANI
        </span>
      </div>
    </div>
  );
}
