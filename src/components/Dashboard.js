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
  { id: 'dashboard', label: 'Dashboard', icon: '~' },
  { id: 'customers', label: 'Customers', icon: '>' },
  { id: 'team', label: 'Team', icon: '+' },
  { id: 'content', label: 'Content', icon: '#' },
  { id: 'notifications', label: 'Notifications', icon: '!' },
  { id: 'analytics', label: 'Analytics', icon: '%' },
  { id: 'settings', label: 'Settings', icon: '*' },
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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    const topicLabel = topics.find((t) => t.value === topic)?.label || topic;
    if (!confirm(`Send notification to topic "${topicLabel}"?\n\nTitle: ${title}\nBody: ${body}`)) return;

    setSending(true);
    setResult(null);
    setError('');

    const data = await apiFetch('/api/admin/send-notification', session, {
      method: 'POST',
      body: JSON.stringify({ title: title.trim(), body: body.trim(), topic }),
    });

    if (data.success) {
      setResult(data);
      setTitle('');
      setBody('');
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
                {sending ? 'Sending...' : `Send to "${topics.find((t) => t.value === topic)?.label}"`}
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
            Notification sent to topic &quot;{result.topic}&quot;
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
