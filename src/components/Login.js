import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else if (data.session) {
        const role = data.user?.user_metadata?.role;
        if (role !== 'admin') {
          await supabase.auth.signOut();
          setError('Access denied. Admin accounts only.');
        } else {
          onLogin(data.session);
        }
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img src="/hidayahicon.png" alt="HidayahMY" style={{ width: '48px', height: '48px', borderRadius: '12px', marginBottom: '16px' }} />
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#111', margin: '0 0 4px' }}>HidayahMY</h1>
          <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && <div style={{ background: '#fafafa', color: '#c00', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', border: '1px solid #eee' }}>{error}</div>}

          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#666', marginBottom: '6px', display: 'block' }}>Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@hidayahmy.com" required
              style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#666', marginBottom: '6px', display: 'block' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password" required
                style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box', paddingRight: '40px' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#999' }}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            style={{ padding: '10px', background: '#111', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginTop: '4px', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
