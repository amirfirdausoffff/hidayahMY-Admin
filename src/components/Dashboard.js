import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const API_URL = 'https://api.hidayahmy.com';

const styles = {
  layout: { display: 'flex', minHeight: '100vh' },
  sidebar: {
    width: '260px', background: 'linear-gradient(180deg, #0D7377 0%, #095456 100%)',
    color: '#fff', padding: '24px 0', display: 'flex', flexDirection: 'column',
    position: 'fixed', height: '100vh', overflowY: 'auto',
  },
  sidebarHeader: { padding: '0 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' },
  sidebarLogo: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoBox: { width: '40px', height: '40px', borderRadius: '10px', objectFit: 'contain' },
  logoText: { fontSize: '18px', fontWeight: '700' },
  navItem: (active) => ({
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', cursor: 'pointer',
    background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
    borderLeft: active ? '3px solid #fff' : '3px solid transparent',
    fontSize: '14px', fontWeight: active ? '600' : '400', transition: 'all 0.2s',
  }),
  navIcon: { fontSize: '18px', width: '24px', textAlign: 'center' },
  main: { flex: 1, marginLeft: '260px', padding: '32px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
  pageTitle: { fontSize: '28px', fontWeight: '700', color: '#1a1a2e' },
  logoutBtn: {
    padding: '10px 20px', background: '#fff', border: '2px solid #e8e8e8',
    borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', color: '#666',
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' },
  statCard: (color) => ({
    background: '#fff', borderRadius: '14px', padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}`,
  }),
  statLabel: { fontSize: '13px', color: '#888', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' },
  statValue: { fontSize: '32px', fontWeight: '700', color: '#1a1a2e', margin: '8px 0 4px' },
  card: { background: '#fff', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '24px' },
  cardTitle: { fontSize: '18px', fontWeight: '600', color: '#1a1a2e', marginBottom: '20px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: '600',
    color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #f0f0f0',
  },
  td: { padding: '14px 16px', fontSize: '14px', borderBottom: '1px solid #f5f5f5', color: '#333' },
  badge: (type) => ({
    padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
    background: type === 'admin' ? '#e6f7f7' : type === 'customer' ? '#e8f5e9' : '#fce4ec',
    color: type === 'admin' ? '#0D7377' : type === 'customer' ? '#2e7d32' : '#c62828',
  }),
  input: {
    padding: '12px 16px', border: '2px solid #e8e8e8', borderRadius: '10px',
    fontSize: '15px', outline: 'none', width: '100%', boxSizing: 'border-box',
  },
  btnPrimary: {
    padding: '12px 24px', background: 'linear-gradient(135deg, #0D7377, #14919B)',
    color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer',
  },
  btnDanger: {
    padding: '6px 14px', background: '#fee', color: '#c00', border: '1px solid #fcc',
    borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
  },
};

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '\u{1F4CA}' },
  { id: 'customers', label: 'Customers', icon: '\u{1F465}' },
  { id: 'team', label: 'Team', icon: '\u{1F6E1}' },
  { id: 'content', label: 'Content', icon: '\u{1F4DD}' },
  { id: 'notifications', label: 'Notifications', icon: '\u{1F514}' },
  { id: 'analytics', label: 'Analytics', icon: '\u{1F4C8}' },
  { id: 'settings', label: 'Settings', icon: '\u{2699}' },
];

// ─── Helper: fetch from API with auth ───
async function apiFetch(path, session, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      ...options.headers,
    },
  });
  return res.json();
}

// ─── Dashboard Page ───
function DashboardPage({ session }) {
  const [firebaseStats, setFirebaseStats] = useState(null);
  const [apiStats, setApiStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const statsRef = doc(db, 'app_stats', 'dashboard');
    const unsubscribe = onSnapshot(statsRef, (snap) => {
      if (snap.exists()) setFirebaseStats(snap.data());
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    apiFetch('/api/admin/stats', session).then(setApiStats).catch(() => {});
  }, [session]);

  const fmt = (n) => (n || 0).toLocaleString();

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading...</div>;

  return (
    <>
      <div style={styles.statsGrid}>
        <div style={styles.statCard('#0D7377')}>
          <div style={styles.statLabel}>Customers (App Users)</div>
          <div style={styles.statValue}>{fmt(apiStats?.totalCustomers)}</div>
        </div>
        <div style={styles.statCard('#14919B')}>
          <div style={styles.statLabel}>Admin Team</div>
          <div style={styles.statValue}>{fmt(apiStats?.totalAdmins)}</div>
        </div>
        <div style={styles.statCard('#2ecc71')}>
          <div style={styles.statLabel}>Downloads</div>
          <div style={styles.statValue}>{fmt(firebaseStats?.downloads)}</div>
        </div>
        <div style={styles.statCard('#e67e22')}>
          <div style={styles.statLabel}>Feedback</div>
          <div style={styles.statValue}>{fmt(firebaseStats?.feedback)}</div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Firebase Connection</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: firebaseStats ? '#2ecc71' : '#e74c3c' }} />
          <span style={{ fontSize: '14px', color: '#333' }}>
            {firebaseStats ? 'Connected to Firebase (hidayah-my)' : 'Not connected'}
          </span>
        </div>
      </div>
    </>
  );
}

// ─── Customers Page (app users) ───
function CustomersPage({ session }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/admin/list-users?role=customer', session)
      .then((data) => { setCustomers(data.users || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session]);

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading customers...</div>;

  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={styles.cardTitle}>App Customers</div>
        <span style={{ fontSize: '14px', color: '#888' }}>{customers.length} total</span>
      </div>
      {customers.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>No customers yet</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Provider</th>
              <th style={styles.th}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((u) => (
              <tr key={u.id}>
                <td style={styles.td}>{u.name || '-'}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}><span style={styles.badge('customer')}>{u.provider || 'email'}</span></td>
                <td style={styles.td}>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Team Page (admin users) ───
function TeamPage({ session }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadAdmins = useCallback(() => {
    apiFetch('/api/admin/list-users?role=admin', session)
      .then((data) => { setAdmins(data.users || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session]);

  useEffect(() => { loadAdmins(); }, [loadAdmins]);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setFormError(''); setFormSuccess(''); setSubmitting(true);

    const data = await apiFetch('/api/admin/add-user', session, {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (data.success) {
      setFormSuccess(`Admin "${formData.name || formData.email}" added successfully`);
      setFormData({ name: '', email: '', password: '' });
      setShowForm(false);
      loadAdmins();
    } else {
      setFormError(data.error || 'Failed to add admin');
    }
    setSubmitting(false);
  };

  const handleRemove = async (user) => {
    if (!confirm(`Remove admin ${user.email}?`)) return;
    const data = await apiFetch('/api/admin/remove-user', session, {
      method: 'DELETE',
      body: JSON.stringify({ user_id: user.id }),
    });
    if (data.success) loadAdmins();
    else alert(data.error || 'Failed to remove');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading team...</div>;

  return (
    <>
      {formSuccess && (
        <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }}>
          {formSuccess}
        </div>
      )}

      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={styles.cardTitle}>Admin Team</div>
          <button style={styles.btnPrimary} onClick={() => { setShowForm(!showForm); setFormError(''); }}>
            {showForm ? 'Cancel' : '+ Add Admin'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAddAdmin} style={{ marginBottom: '24px', padding: '20px', background: '#f9fafb', borderRadius: '12px' }}>
            {formError && <div style={{ background: '#fee', color: '#c00', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>{formError}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <input
                style={styles.input} placeholder="Name" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                style={styles.input} placeholder="Email" type="email" required value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                style={styles.input} placeholder="Password" type="password" required minLength={6} value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <button type="submit" style={{ ...styles.btnPrimary, opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Admin User'}
            </button>
          </form>
        )}

        {admins.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>No admin users yet</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Added</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((u) => (
                <tr key={u.id}>
                  <td style={styles.td}>{u.name || '-'}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}><span style={styles.badge('admin')}>Admin</span></td>
                  <td style={styles.td}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    {u.email !== session?.user?.email ? (
                      <button style={styles.btnDanger} onClick={() => handleRemove(u)}>Remove</button>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#888' }}>You</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

// ─── Content Page ───
function ContentPage() {
  const content = [
    { title: 'Prayer Times Update - Ramadan 2026', type: 'Announcement', date: '2026-05-01', status: 'active' },
    { title: 'New Quran Reciter Added', type: 'Feature', date: '2026-04-28', status: 'active' },
    { title: 'Zakat Calculator v2.0', type: 'Feature', date: '2026-04-15', status: 'active' },
    { title: 'App Maintenance Notice', type: 'Announcement', date: '2026-03-20', status: 'inactive' },
  ];
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Content Management</div>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Title</th><th style={styles.th}>Type</th><th style={styles.th}>Date</th><th style={styles.th}>Status</th></tr></thead>
        <tbody>
          {content.map((item) => (
            <tr key={item.title}>
              <td style={styles.td}>{item.title}</td><td style={styles.td}>{item.type}</td>
              <td style={styles.td}>{item.date}</td><td style={styles.td}><span style={styles.badge(item.status)}>{item.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NotificationsPage({ session }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [topic, setTopic] = useState('general');
  const [sendMode, setSendMode] = useState('all'); // 'all' or 'user'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const topics = [
    { value: 'general', label: 'General' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'update', label: 'App Update' },
    { value: 'promo', label: 'Promotion' },
  ];

  const loadHistory = useCallback(() => {
    apiFetch('/api/admin/notifications', session)
      .then((data) => {
        setHistory(data.notifications || []);
        setLoadingHistory(false);
      })
      .catch(() => setLoadingHistory(false));
  }, [session]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const data = await apiFetch('/api/admin/list-users?role=customer', session);
    const users = (data.users || []).filter((u) => {
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const q = query.toLowerCase();
      return name.includes(q) || email.includes(q);
    });
    setSearchResults(users.slice(0, 8));
    setSearching(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    if (sendMode === 'user' && !selectedUser) {
      setError('Please select a user to send to');
      return;
    }

    const target = sendMode === 'user'
      ? `user "${selectedUser.name || selectedUser.email}"`
      : `all users (topic: ${topics.find((t) => t.value === topic)?.label})`;
    if (!confirm(`Send notification to ${target}?\n\nTitle: ${title}\nBody: ${body}`)) return;

    setSending(true);
    setResult(null);
    setError('');

    const payload = { title: title.trim(), body: body.trim(), topic };
    if (sendMode === 'user') {
      payload.user_id = selectedUser.id;
    }

    const data = await apiFetch('/api/admin/send-notification', session, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (data.success) {
      setResult({ ...data, sendMode, userName: selectedUser?.name || selectedUser?.email });
      setTitle('');
      setBody('');
      setSelectedUser(null);
      setSearchQuery('');
      setSearchResults([]);
      loadHistory();
    } else {
      setError(data.error || 'Failed to send notification');
    }
    setSending(false);
  };

  return (
    <>
      {/* Compose form */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Send Push Notification</div>
        <form onSubmit={handleSend}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '600px' }}>
            {/* Send mode toggle */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '8px', display: 'block' }}>Send To</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { value: 'all', label: 'All Users (Topic)' },
                  { value: 'user', label: 'Specific User' },
                ].map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => { setSendMode(mode.value); setSelectedUser(null); setSearchQuery(''); setSearchResults([]); setError(''); }}
                    style={{
                      padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                      border: sendMode === mode.value ? '2px solid #0D7377' : '2px solid #e8e8e8',
                      background: sendMode === mode.value ? '#e6f7f7' : '#fff',
                      color: sendMode === mode.value ? '#0D7377' : '#666',
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic selector (only for all users mode) */}
            {sendMode === 'all' && (
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '4px', display: 'block' }}>Topic</label>
                <select
                  style={{ ...styles.input, cursor: 'pointer' }}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                >
                  {topics.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* User search (only for specific user mode) */}
            {sendMode === 'user' && (
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '4px', display: 'block' }}>Search User</label>
                {selectedUser ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                    background: '#e6f7f7', borderRadius: '10px', border: '2px solid #0D7377',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#0D7377' }}>{selectedUser.name || 'No name'}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{selectedUser.email}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelectedUser(null); setSearchQuery(''); setSearchResults([]); }}
                      style={{ padding: '4px 10px', background: '#fff', border: '1px solid #ccc', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', color: '#666' }}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      style={styles.input}
                      placeholder="Type name or email to search..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                    {searching && <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Searching...</div>}
                    {searchResults.length > 0 && (
                      <div style={{ border: '1px solid #e8e8e8', borderRadius: '10px', marginTop: '6px', maxHeight: '240px', overflowY: 'auto' }}>
                        {searchResults.map((u) => (
                          <div
                            key={u.id}
                            onClick={() => { setSelectedUser(u); setSearchResults([]); setSearchQuery(''); }}
                            style={{
                              padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0',
                              display: 'flex', alignItems: 'center', gap: '10px',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%', background: '#e6f7f7',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '13px', fontWeight: '700', color: '#0D7377',
                            }}>
                              {(u.name || u.email || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>{u.name || 'No name'}</div>
                              <div style={{ fontSize: '11px', color: '#888' }}>{u.email}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>No users found</div>
                    )}
                  </>
                )}
              </div>
            )}

            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '4px', display: 'block' }}>Title</label>
              <input
                style={styles.input}
                placeholder="Notification title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '4px', display: 'block' }}>Message</label>
              <textarea
                style={{ ...styles.input, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }}
                placeholder="Notification message body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                maxLength={500}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="submit"
                style={{ ...styles.btnPrimary, opacity: sending ? 0.7 : 1 }}
                disabled={sending}
              >
                {sending ? 'Sending...' : sendMode === 'user'
                  ? `Send to ${selectedUser?.name || selectedUser?.email || 'User'}`
                  : `Send to All (${topics.find((t) => t.value === topic)?.label})`}
              </button>
              <span style={{ fontSize: '12px', color: '#999' }}>
                {title.length}/100 &middot; {body.length}/500
              </span>
            </div>
          </div>
        </form>

        {error && (
          <div style={{ background: '#fee', color: '#c00', padding: '12px 16px', borderRadius: '10px', marginTop: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px 16px', borderRadius: '10px', marginTop: '16px', fontSize: '14px' }}>
            {result.sendMode === 'user'
              ? `Notification sent to ${result.userName} (${result.sent} device${result.sent !== 1 ? 's' : ''})`
              : `Notification sent to topic "${result.topic}"`}
          </div>
        )}
      </div>

      {/* History */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={styles.cardTitle}>Notification History</div>
          <span style={{ fontSize: '14px', color: '#888' }}>{history.length} sent</span>
        </div>

        {loadingHistory ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading...</div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <p style={{ fontSize: '15px', fontWeight: '500' }}>No notifications sent yet</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Message</th>
                <th style={styles.th}>Topic</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((n) => (
                <tr key={n.id}>
                  <td style={{ ...styles.td, fontWeight: '600', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</td>
                  <td style={{ ...styles.td, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.body}</td>
                  <td style={styles.td}><span style={{ ...styles.badge('admin') }}>{n.topic || 'general'}</span></td>
                  <td style={styles.td}>{new Date(n.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function AnalyticsPage() {
  const topFeatures = [
    { feature: 'Prayer Times', usage: '89%', sessions: '11,087' },
    { feature: 'Al-Quran', usage: '72%', sessions: '8,965' },
    { feature: 'Qiblah Compass', usage: '56%', sessions: '6,973' },
    { feature: 'Daily Azkar', usage: '48%', sessions: '5,980' },
    { feature: 'Zakat Calculator', usage: '31%', sessions: '3,862' },
  ];
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Top Features by Usage</div>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Feature</th><th style={styles.th}>Usage Rate</th><th style={styles.th}>Sessions</th></tr></thead>
        <tbody>
          {topFeatures.map((f) => (
            <tr key={f.feature}><td style={styles.td}>{f.feature}</td><td style={styles.td}>{f.usage}</td><td style={styles.td}>{f.sessions}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SettingsPage() {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>App Settings</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
        {[['App Name', 'HidayahMY'], ['Support Email', 'support@hidayahmy.com'], ['Default Language', 'Bahasa Malaysia'], ['Prayer Time Source', 'JAKIM']].map(([label, val]) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>{label}</label>
            <input style={styles.input} defaultValue={val} />
          </div>
        ))}
        <button style={{ ...styles.btnPrimary, alignSelf: 'flex-start' }}>Save Changes</button>
      </div>
    </div>
  );
}

// ─── Main Dashboard Layout ───
const pages = {
  dashboard: DashboardPage,
  customers: CustomersPage,
  team: TeamPage,
  content: ContentPage,
  notifications: NotificationsPage,
  analytics: AnalyticsPage,
  settings: SettingsPage,
};

export default function Dashboard({ onLogout, session }) {
  const userEmail = session?.user?.email || 'Admin';
  const [activePage, setActivePage] = useState('dashboard');
  const PageComponent = pages[activePage];

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.sidebarLogo}>
            <img src="/hidayahicon.png" alt="HidayahMY" style={styles.logoBox} />
            <span style={styles.logoText}>HidayahMY</span>
          </div>
        </div>
        <nav>
          {navItems.map((item) => (
            <div key={item.id} style={styles.navItem(activePage === item.id)} onClick={() => setActivePage(item.id)}>
              <span style={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', padding: '24px' }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {userEmail}
          </div>
          <div onClick={onLogout} style={{
            padding: '10px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px',
            textAlign: 'center', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
          }}>
            Sign Out
          </div>
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>{navItems.find((n) => n.id === activePage)?.label}</h1>
          <button style={styles.logoutBtn} onClick={onLogout}>Sign Out</button>
        </div>
        <PageComponent session={session} />
      </main>
    </div>
  );
}
