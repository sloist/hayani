import { useNavigate } from 'react-router-dom';

export default function FooterSlide() {
  const navigate = useNavigate();

  const linkStyle: React.CSSProperties = {
    fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase',
    color: 'var(--text2)', fontWeight: 400, cursor: 'pointer',
    background: 'none', border: 'none', padding: '4px 0', display: 'block',
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      padding: '40px', textAlign: 'center', gap: '40px',
    }}>
      {/* Links — vertical */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
        <a href="mailto:white@hayani.kr" style={{ ...linkStyle, textDecoration: 'none' }}>Contact</a>
        <button onClick={() => { sessionStorage.setItem('hayani_navigated', '1'); navigate('/order'); }} style={linkStyle}>Order</button>
        <button onClick={() => { sessionStorage.setItem('hayani_navigated', '1'); navigate('/terms'); }} style={linkStyle}>Terms</button>
        <button onClick={() => { sessionStorage.setItem('hayani_navigated', '1'); navigate('/privacy'); }} style={linkStyle}>Privacy</button>
      </div>

      {/* Copyright */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text3)' }}>&copy; 2026 HAYANI</span>
        <span style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text3)' }}>All rights reserved.</span>
      </div>

      {/* Legal */}
      <div style={{ fontSize: '9px', lineHeight: '2', color: 'var(--text3)', fontWeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span>HAYANI · 대표 정문수</span>
        <span>사업자등록번호 000-00-00000</span>
        <span>통신판매업 신고번호 0000-충남천안-0000</span>
        <span>충남 천안시 [주소]</span>
      </div>
    </div>
  );
}
