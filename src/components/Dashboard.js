import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const API_URL = 'https://api.hidayahmy.com';

const s = {
  input: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
  btn: { padding: '8px 16px', background: '#111', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  btnOutline: { padding: '8px 16px', background: '#fff', color: '#111', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  btnDanger: { padding: '6px 12px', background: '#fff', color: '#c00', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
  card: { background: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '20px', marginBottom: '20px' },
  th: { textAlign: 'left', padding: '8px 12px', fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #eee' },
  td: { padding: '10px 12px', fontSize: '13px', borderBottom: '1px solid #f5f5f5', color: '#333' },
  badge: (t) => ({ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '500', background: '#f5f5f5', color: '#666' }),
  label: { fontSize: '12px', fontWeight: '500', color: '#666', marginBottom: '4px', display: 'block' },
};

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'customers', label: 'Customers' },
  { id: 'team', label: 'Team' },
  { id: 'content', label: 'Content' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings', label: 'Settings' },
];

async function apiFetch(path, session, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}`, ...options.headers },
  });
  return res.json();
}

// ─── Dashboard ───
function DashboardPage({ session }) {
  const [firebaseStats, setFirebaseStats] = useState(null);
  const [apiStats, setApiStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'app_stats', 'dashboard'), (snap) => {
      if (snap.exists()) setFirebaseStats(snap.data());
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => { apiFetch('/api/admin/stats', session).then(setApiStats).catch(() => {}); }, [session]);

  const fmt = (n) => (n || 0).toLocaleString();
  if (loading) return <p style={{ color: '#999', padding: '40px', textAlign: 'center' }}>Loading...</p>;

  const stats = [
    { label: 'Customers', value: fmt(apiStats?.totalCustomers) },
    { label: 'Admins', value: fmt(apiStats?.totalAdmins) },
    { label: 'Downloads', value: fmt(firebaseStats?.downloads) },
    { label: 'Feedback', value: fmt(firebaseStats?.feedback) },
  ];

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {stats.map((st) => (
          <div key={st.label} style={s.card}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{st.label}</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#111', marginTop: '4px' }}>{st.value}</div>
          </div>
        ))}
      </div>
      <div style={s.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: firebaseStats ? '#22c55e' : '#ef4444' }} />
          <span style={{ fontSize: '13px', color: '#666' }}>{firebaseStats ? 'Firebase connected' : 'Firebase not connected'}</span>
        </div>
      </div>
    </>
  );
}

// ─── Customers ───
function CustomersPage({ session }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/admin/list-users?role=customer', session)
      .then((d) => { setCustomers(d.users || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session]);

  if (loading) return <p style={{ color: '#999', padding: '40px', textAlign: 'center' }}>Loading...</p>;

  return (
    <div style={s.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '15px', fontWeight: '600', color: '#111' }}>Customers</span>
        <span style={{ fontSize: '13px', color: '#999' }}>{customers.length}</span>
      </div>
      {customers.length === 0 ? <p style={{ color: '#999', textAlign: 'center', padding: '32px' }}>No customers yet</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={s.th}>Name</th><th style={s.th}>Email</th><th style={s.th}>Provider</th><th style={s.th}>Joined</th></tr></thead>
          <tbody>
            {customers.map((u) => (
              <tr key={u.id}>
                <td style={s.td}>{u.name || '-'}</td>
                <td style={s.td}>{u.email}</td>
                <td style={s.td}><span style={s.badge()}>{u.provider || 'email'}</span></td>
                <td style={s.td}>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Team ───
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
      .then((d) => { setAdmins(d.users || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session]);

  useEffect(() => { loadAdmins(); }, [loadAdmins]);

  const handleAdd = async (e) => {
    e.preventDefault(); setFormError(''); setFormSuccess(''); setSubmitting(true);
    const d = await apiFetch('/api/admin/add-user', session, { method: 'POST', body: JSON.stringify(formData) });
    if (d.success) { setFormSuccess(`Added "${formData.name || formData.email}"`); setFormData({ name: '', email: '', password: '' }); setShowForm(false); loadAdmins(); }
    else setFormError(d.error || 'Failed');
    setSubmitting(false);
  };

  const handleRemove = async (user) => {
    if (!confirm(`Remove ${user.email}?`)) return;
    const d = await apiFetch('/api/admin/remove-user', session, { method: 'DELETE', body: JSON.stringify({ user_id: user.id }) });
    if (d.success) loadAdmins(); else alert(d.error || 'Failed');
  };

  if (loading) return <p style={{ color: '#999', padding: '40px', textAlign: 'center' }}>Loading...</p>;

  return (
    <>
      {formSuccess && <div style={{ background: '#f0fdf4', color: '#166534', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', border: '1px solid #dcfce7' }}>{formSuccess}</div>}
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#111' }}>Admin Team</span>
          <button style={showForm ? s.btnOutline : s.btn} onClick={() => { setShowForm(!showForm); setFormError(''); }}>
            {showForm ? 'Cancel' : 'Add Admin'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAdd} style={{ marginBottom: '20px', padding: '16px', background: '#fafafa', borderRadius: '6px', border: '1px solid #eee' }}>
            {formError && <div style={{ color: '#c00', padding: '8px', fontSize: '13px', marginBottom: '8px' }}>{formError}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <input style={s.input} placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <input style={s.input} placeholder="Email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              <input style={s.input} placeholder="Password" type="password" required minLength={6} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            </div>
            <button type="submit" style={{ ...s.btn, opacity: submitting ? 0.6 : 1 }} disabled={submitting}>{submitting ? 'Adding...' : 'Add'}</button>
          </form>
        )}

        {admins.length === 0 ? <p style={{ color: '#999', textAlign: 'center', padding: '32px' }}>No admins yet</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={s.th}>Name</th><th style={s.th}>Email</th><th style={s.th}>Role</th><th style={s.th}>Added</th><th style={s.th}></th></tr></thead>
            <tbody>
              {admins.map((u) => (
                <tr key={u.id}>
                  <td style={s.td}>{u.name || '-'}</td><td style={s.td}>{u.email}</td>
                  <td style={s.td}><span style={s.badge()}>admin</span></td>
                  <td style={s.td}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={s.td}>{u.email !== session?.user?.email ? <button style={s.btnDanger} onClick={() => handleRemove(u)}>Remove</button> : <span style={{ fontSize: '12px', color: '#999' }}>You</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

// ─── Content ───
function ContentPage() {
  const content = [
    { title: 'Prayer Times Update - Ramadan 2026', type: 'Announcement', date: '2026-05-01', status: 'active' },
    { title: 'New Quran Reciter Added', type: 'Feature', date: '2026-04-28', status: 'active' },
    { title: 'Zakat Calculator v2.0', type: 'Feature', date: '2026-04-15', status: 'active' },
    { title: 'App Maintenance Notice', type: 'Announcement', date: '2026-03-20', status: 'inactive' },
  ];
  return (
    <div style={s.card}>
      <div style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '16px' }}>Content</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th style={s.th}>Title</th><th style={s.th}>Type</th><th style={s.th}>Date</th><th style={s.th}>Status</th></tr></thead>
        <tbody>
          {content.map((item) => (
            <tr key={item.title}><td style={s.td}>{item.title}</td><td style={s.td}>{item.type}</td><td style={s.td}>{item.date}</td><td style={s.td}><span style={s.badge()}>{item.status}</span></td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Notifications ───
function NotificationsPage({ session }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [topic, setTopic] = useState('general');
  const [sendMode, setSendMode] = useState('all');
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
      .then((d) => { setHistory(d.notifications || []); setLoadingHistory(false); })
      .catch(() => setLoadingHistory(false));
  }, [session]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const d = await apiFetch('/api/admin/list-users?role=customer', session);
    const q = query.toLowerCase();
    setSearchResults((d.users || []).filter((u) => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)).slice(0, 8));
    setSearching(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    if (sendMode === 'user' && !selectedUser) { setError('Select a user first'); return; }
    const target = sendMode === 'user' ? `"${selectedUser.name || selectedUser.email}"` : `all users (${topics.find((t) => t.value === topic)?.label})`;
    if (!confirm(`Send to ${target}?\n\n${title}\n${body}`)) return;

    setSending(true); setResult(null); setError('');
    const payload = { title: title.trim(), body: body.trim(), topic };
    if (sendMode === 'user') payload.user_id = selectedUser.id;

    const d = await apiFetch('/api/admin/send-notification', session, { method: 'POST', body: JSON.stringify(payload) });
    if (d.success) {
      setResult({ ...d, sendMode, userName: selectedUser?.name || selectedUser?.email });
      setTitle(''); setBody(''); setSelectedUser(null); setSearchQuery(''); setSearchResults([]); loadHistory();
    } else setError(d.error || 'Failed');
    setSending(false);
  };

  return (
    <>
      <div style={s.card}>
        <div style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '16px' }}>Send Notification</div>
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '560px' }}>
          {/* Send mode */}
          <div>
            <label style={s.label}>Send To</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[{ value: 'all', label: 'All Users' }, { value: 'user', label: 'Specific User' }].map((m) => (
                <button key={m.value} type="button" onClick={() => { setSendMode(m.value); setSelectedUser(null); setSearchQuery(''); setSearchResults([]); setError(''); }}
                  style={{ ...s.btnOutline, background: sendMode === m.value ? '#111' : '#fff', color: sendMode === m.value ? '#fff' : '#111' }}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {sendMode === 'all' && (
            <div>
              <label style={s.label}>Topic</label>
              <select style={{ ...s.input, cursor: 'pointer' }} value={topic} onChange={(e) => setTopic(e.target.value)}>
                {topics.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          )}

          {sendMode === 'user' && (
            <div>
              <label style={s.label}>User</label>
              {selectedUser ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#fafafa', borderRadius: '6px', border: '1px solid #ddd' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{selectedUser.name || 'No name'}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>{selectedUser.email}</div>
                  </div>
                  <button type="button" onClick={() => { setSelectedUser(null); setSearchQuery(''); setSearchResults([]); }} style={{ ...s.btnOutline, padding: '4px 10px', fontSize: '12px' }}>Change</button>
                </div>
              ) : (
                <>
                  <input style={s.input} placeholder="Search by name or email..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />
                  {searching && <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Searching...</div>}
                  {searchResults.length > 0 && (
                    <div style={{ border: '1px solid #eee', borderRadius: '6px', marginTop: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                      {searchResults.map((u) => (
                        <div key={u.id} onClick={() => { setSelectedUser(u); setSearchResults([]); setSearchQuery(''); }}
                          style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5', fontSize: '13px' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}>
                          <div style={{ fontWeight: '500', color: '#111' }}>{u.name || 'No name'}</div>
                          <div style={{ fontSize: '11px', color: '#999' }}>{u.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchQuery.length >= 2 && !searching && searchResults.length === 0 && <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>No users found</div>}
                </>
              )}
            </div>
          )}

          <div>
            <label style={s.label}>Title</label>
            <input style={s.input} placeholder="Notification title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={100} />
          </div>
          <div>
            <label style={s.label}>Message</label>
            <textarea style={{ ...s.input, minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }} placeholder="Message body" value={body} onChange={(e) => setBody(e.target.value)} required maxLength={500} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button type="submit" style={{ ...s.btn, opacity: sending ? 0.6 : 1 }} disabled={sending}>
              {sending ? 'Sending...' : 'Send'}
            </button>
            <span style={{ fontSize: '11px', color: '#ccc' }}>{title.length}/100 | {body.length}/500</span>
          </div>
        </form>

        {error && <div style={{ color: '#c00', padding: '10px', fontSize: '13px', marginTop: '12px', background: '#fafafa', borderRadius: '6px', border: '1px solid #eee' }}>{error}</div>}
        {result && <div style={{ color: '#166534', padding: '10px', fontSize: '13px', marginTop: '12px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #dcfce7' }}>
          {result.sendMode === 'user' ? `Sent to ${result.userName}` : `Sent to topic "${result.topic}"`}
        </div>}
      </div>

      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#111' }}>History</span>
          <span style={{ fontSize: '13px', color: '#999' }}>{history.length}</span>
        </div>
        {loadingHistory ? <p style={{ color: '#999', textAlign: 'center', padding: '32px' }}>Loading...</p> :
         history.length === 0 ? <p style={{ color: '#999', textAlign: 'center', padding: '32px' }}>No notifications sent yet</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={s.th}>Title</th><th style={s.th}>Message</th><th style={s.th}>Topic</th><th style={s.th}>Date</th></tr></thead>
            <tbody>
              {history.map((n) => (
                <tr key={n.id}>
                  <td style={{ ...s.td, fontWeight: '500', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</td>
                  <td style={{ ...s.td, maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.body}</td>
                  <td style={s.td}><span style={s.badge()}>{n.topic || 'general'}</span></td>
                  <td style={s.td}>{new Date(n.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

// ─── Analytics ───
function AnalyticsPage() {
  const data = [
    { feature: 'Prayer Times', usage: '89%', sessions: '11,087' },
    { feature: 'Al-Quran', usage: '72%', sessions: '8,965' },
    { feature: 'Qiblah Compass', usage: '56%', sessions: '6,973' },
    { feature: 'Daily Azkar', usage: '48%', sessions: '5,980' },
    { feature: 'Zakat Calculator', usage: '31%', sessions: '3,862' },
  ];
  return (
    <div style={s.card}>
      <div style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '16px' }}>Top Features</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th style={s.th}>Feature</th><th style={s.th}>Usage</th><th style={s.th}>Sessions</th></tr></thead>
        <tbody>{data.map((f) => <tr key={f.feature}><td style={s.td}>{f.feature}</td><td style={s.td}>{f.usage}</td><td style={s.td}>{f.sessions}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

// ─── Settings ───
function SettingsPage() {
  return (
    <div style={s.card}>
      <div style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '16px' }}>Settings</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
        {[['App Name', 'HidayahMY'], ['Support Email', 'support@hidayahmy.com'], ['Default Language', 'Bahasa Malaysia'], ['Prayer Time Source', 'JAKIM']].map(([label, val]) => (
          <div key={label}>
            <label style={s.label}>{label}</label>
            <input style={s.input} defaultValue={val} />
          </div>
        ))}
        <button style={{ ...s.btn, alignSelf: 'flex-start' }}>Save</button>
      </div>
    </div>
  );
}

// ─── Layout ───
const pages = { dashboard: DashboardPage, customers: CustomersPage, team: TeamPage, content: ContentPage, notifications: NotificationsPage, analytics: AnalyticsPage, settings: SettingsPage };

export default function Dashboard({ onLogout, session }) {
  const [activePage, setActivePage] = useState('dashboard');
  const PageComponent = pages[activePage];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '220px', background: '#111', color: '#fff', position: 'fixed', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/hidayahicon.png" alt="" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
          <span style={{ fontSize: '15px', fontWeight: '600' }}>HidayahMY</span>
        </div>
        <nav style={{ padding: '8px 0', flex: 1 }}>
          {navItems.map((item) => (
            <div key={item.id} onClick={() => setActivePage(item.id)}
              style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '13px', fontWeight: activePage === item.id ? '600' : '400', background: activePage === item.id ? '#222' : 'transparent', color: activePage === item.id ? '#fff' : '#888', borderLeft: activePage === item.id ? '2px solid #fff' : '2px solid transparent' }}>
              {item.label}
            </div>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #222' }}>
          <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session?.user?.email}</div>
          <div onClick={onLogout} style={{ padding: '8px', background: '#222', borderRadius: '6px', textAlign: 'center', cursor: 'pointer', fontSize: '13px', color: '#999' }}>Sign Out</div>
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: '220px', padding: '24px 32px', background: '#fafafa' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#111', marginBottom: '24px' }}>{navItems.find((n) => n.id === activePage)?.label}</h1>
        <PageComponent session={session} />
      </main>
    </div>
  );
}
