import { useNavigate } from 'react-router-dom';

export default function FooterSlide() {
  const navigate = useNavigate();

  const linkStyle: React.CSSProperties = {
    fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase',
    color: 'var(--text2)', fontWeight: 400, cursor: 'pointer',
    background: 'none', border: 'none', padding: 0,
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      padding: '40px', textAlign: 'center', gap: '32px',
    }}>
      {/* Links */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="mailto:white@hayani.kr" style={{ ...linkStyle, textDecoration: 'none' }}>Contact</a>
        <span style={{ color: 'var(--border)' }}>·</span>
        <button onClick={() => navigate('/order')} style={linkStyle}>Order</button>
        <span style={{ color: 'var(--border)' }}>·</span>
        <button onClick={() => navigate('/terms')} style={linkStyle}>Terms</button>
        <span style={{ color: 'var(--border)' }}>·</span>
        <button onClick={() => navigate('/privacy')} style={linkStyle}>Privacy</button>
      </div>

      {/* Copyright */}
      <span style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text3)' }}>
        &copy; 2026 HAYANI. All rights reserved.
      </span>

      {/* Legal */}
      <div style={{
        fontSize: '10px', lineHeight: '2.2', color: 'var(--text3)', fontWeight: 300,
        display: 'flex', flexDirection: 'column', gap: '0',
      }}>
        <span>HAYANI · 대표 정문수</span>
        <span>사업자등록번호 000-00-00000</span>
        <span>통신판매업 신고번호 0000-충남천안-0000</span>
        <span>충남 천안시 [주소]</span>
      </div>
    </div>
  );
}
