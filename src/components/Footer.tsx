export default function Footer() {
  return (
    <footer style={{
      padding: '60px 40px 40px',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    }}>
      <span style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '14px',
        fontWeight: 300,
        letterSpacing: '0.1em',
        color: 'var(--text2)',
      }}>
        HAYANI
      </span>
      <span style={{
        fontSize: '10px',
        letterSpacing: '3px',
        color: 'var(--text3)',
        textTransform: 'uppercase',
      }}>
        &copy; {new Date().getFullYear()}
      </span>
    </footer>
  );
}
