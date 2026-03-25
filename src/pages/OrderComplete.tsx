import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';

export default function OrderComplete() {
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
        gap: '24px',
      }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '32px',
          fontWeight: 300,
          letterSpacing: '0.06em',
        }}>
          감사합니다
        </h1>

        <p style={{
          fontSize: '13px',
          fontWeight: 200,
          color: 'var(--text2)',
          lineHeight: '1.8',
        }}>
          입금 확인 후 순차 발송됩니다.
        </p>

        <Link
          to="/"
          style={{
            marginTop: '40px',
            fontSize: '10px',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            color: 'var(--text2)',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '4px',
            transition: 'color 0.3s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text2)')}
        >
          Home
        </Link>
      </div>
    </PageTransition>
  );
}
