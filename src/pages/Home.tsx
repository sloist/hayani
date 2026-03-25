import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';

export default function Home() {
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
      }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(48px, 8vw, 96px)',
          fontWeight: 300,
          letterSpacing: '0.12em',
          marginBottom: '48px',
        }}>
          HAYANI
        </h1>

        <Link to="/wear" style={{ display: 'block', marginBottom: '48px' }}>
          <div style={{
            width: 'min(400px, 70vw)',
            aspectRatio: '3/4',
            backgroundColor: 'var(--bg2)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.4s ease',
          }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(0.985)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <span style={{
              fontSize: '10px',
              letterSpacing: '4px',
              color: 'var(--text3)',
              textTransform: 'uppercase',
            }}>
              Image
            </span>
          </div>
        </Link>

        <p style={{
          fontSize: '13px',
          fontWeight: 200,
          color: 'var(--text2)',
          letterSpacing: '0.04em',
          marginBottom: '80px',
        }}>
          덜어낸 뒤에 남는 것만 만든다.
        </p>

        <span style={{
          fontSize: '10px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: 'var(--text3)',
          fontWeight: 300,
        }}>
          Pre-Order — Summer 2026
        </span>
      </div>
    </PageTransition>
  );
}
