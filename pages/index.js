import { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
import Login from '../src/components/Login';
import Dashboard from '../src/components/Dashboard';

export default function Home() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession((currentSession) => {
        if (event === 'SIGNED_OUT') return null;

        // Supabase emits TOKEN_REFRESHED (and sometimes SIGNED_IN) again when
        // a background tab becomes active. The signed-in user has not changed,
        // so preserve the existing object identity to avoid remounting/reloading
        // every admin screen. API requests retrieve the latest token directly.
        if (
          currentSession?.user?.id &&
          currentSession.user.id === nextSession?.user?.id
        ) {
          return currentSession;
        }

        return nextSession;
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (session) => {
    setSession(session);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard onLogout={handleLogout} session={session} />;
}
