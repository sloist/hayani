import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('로그인 실패');
      setLoading(false);
      return;
    }

    navigate('/admin');
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 0',
    border: 'none',
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'transparent',
    fontSize: '13px',
    fontWeight: 300,
    color: 'var(--text)',
    outline: 'none',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px',
    }}>
      <Link to="/" style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '16px',
        fontWeight: 300,
        letterSpacing: '0.12em',
        color: 'var(--text2)',
        marginBottom: '16px',
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
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        {error && (
          <span style={{ fontSize: '11px', color: 'var(--text2)' }}>{error}</span>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '24px',
            padding: '14px 0',
            backgroundColor: 'var(--text)',
            color: 'var(--bg)',
            fontSize: '10px',
            letterSpacing: '4px',
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
