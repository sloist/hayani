import { useNavigate } from 'react-router-dom';

export default function FooterSlide() {
  const navigate = useNavigate();

  const linkStyle = {
    fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase' as const,
    color: 'var(--text2)', fontWeight: 400, cursor: 'pointer', background: 'none', border: 'none', padding: 0,
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      padding: '40px', textAlign: 'center', gap: '36px',
    }}>
      <div style={{ maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(18px, 2.5vw, 24px)',
          fontWeight: 400, lineHeight: '2', letterSpacing: '0.04em', color: 'var(--text)',
        }}>
          전부 질려버린 어느 날,<br />
          다 버리고 하얀색만 남겼다.<br />
          머릿속이 맑아졌다.
        </p>
        <p style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text2)', lineHeight: '1.8' }}>
          덜어낸 뒤에 남는 것만 만든다.
        </p>
      </div>

      <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="mailto:white@hayani.kr" style={{ ...linkStyle, textDecoration: 'none' }}>Contact</a>
          <button onClick={() => navigate('/order/check')} style={linkStyle}>Order</button>
          <button onClick={() => navigate('/terms')} style={linkStyle}>Terms</button>
          <button onClick={() => navigate('/privacy')} style={linkStyle}>Privacy</button>
        </div>
        <span style={{ fontSize: '9px', letterSpacing: '3px', color: 'var(--text3)', marginTop: '6px' }}>
          &copy; 2026 HAYANI
        </span>
        <div style={{
          marginTop: '28px', fontSize: '8px', lineHeight: '1.8',
          color: 'var(--text3)', fontWeight: 300, letterSpacing: '0.3px', opacity: 0.7,
        }}>
          <span>하야니 · 대표 (미등록)</span><br />
          <span>사업자등록번호 (미등록) · 통신판매업 신고번호 (미등록)</span><br />
          <span>사업장 주소 (미등록) · white@hayani.kr</span>
        </div>
      </div>
    </div>
  );
}
