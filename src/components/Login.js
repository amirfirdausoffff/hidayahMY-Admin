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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <img src="/hidayahicon.png" alt="HidayahMY" className="w-12 h-12 rounded-xl mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">HidayahMY</h1>
          <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-100">{error}</div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@hidayahmy.com" required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password" required
                className="w-full px-3 py-2.5 pr-14 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400 transition"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600">
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition mt-2">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
