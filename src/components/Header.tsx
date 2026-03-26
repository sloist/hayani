interface HeaderProps {
  onLogoClick?: () => void;
}

export default function Header({ onLogoClick }: HeaderProps) {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: '28px 40px',
      pointerEvents: 'none',
    }}>
      <button
        onClick={onLogoClick}
        style={{
          pointerEvents: 'auto',
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '18px',
          fontWeight: 300,
          letterSpacing: '0.12em',
          color: 'var(--text)',
        }}
      >
        HAYANI
      </button>
    </header>
  );
}
