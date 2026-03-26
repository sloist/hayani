import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: err } = await supabase.auth.signInWithPassword({ email, password });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    navigate('/admin');
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <Link to="/" style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '28px',
        fontWeight: 300,
        letterSpacing: '0.14em',
        marginBottom: '12px',
      }}>
        HAYANI
      </Link>

      <span className="label" style={{ marginBottom: '48px' }}>Admin</span>

      <form onSubmit={handleSubmit} style={{
        width: '100%',
        maxWidth: '320px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '12px 0',
            border: 'none',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'transparent',
            color: 'var(--text)',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '12px 0',
            border: 'none',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'transparent',
            color: 'var(--text)',
            fontSize: '14px',
            outline: 'none',
          }}
        />

        {error && (
          <p style={{ fontSize: '12px', color: '#c44' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '8px',
            padding: '14px',
            backgroundColor: 'var(--text)',
            color: 'var(--bg)',
            fontSize: '12px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontWeight: 300,
          }}
        >
          {loading ? '...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
