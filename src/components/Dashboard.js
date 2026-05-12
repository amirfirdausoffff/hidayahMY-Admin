import { useState } from 'react';

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
  },
  sidebar: {
    width: '260px',
    background: 'linear-gradient(180deg, #0D7377 0%, #095456 100%)',
    color: '#fff',
    padding: '24px 0',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    overflowY: 'auto',
  },
  sidebarHeader: {
    padding: '0 24px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    marginBottom: '16px',
  },
  sidebarLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    objectFit: 'contain',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: '700',
  },
  navItem: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px',
    cursor: 'pointer',
    background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
    borderLeft: active ? '3px solid #fff' : '3px solid transparent',
    fontSize: '14px',
    fontWeight: active ? '600' : '400',
    transition: 'all 0.2s',
  }),
  navIcon: {
    fontSize: '18px',
    width: '24px',
    textAlign: 'center',
  },
  main: {
    flex: 1,
    marginLeft: '260px',
    padding: '32px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a2e',
  },
  logoutBtn: {
    padding: '10px 20px',
    background: '#fff',
    border: '2px solid #e8e8e8',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    color: '#666',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  statCard: (color) => ({
    background: '#fff',
    borderRadius: '14px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    borderLeft: `4px solid ${color}`,
  }),
  statLabel: {
    fontSize: '13px',
    color: '#888',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: '8px 0 4px',
  },
  statChange: (positive) => ({
    fontSize: '13px',
    color: positive ? '#0D7377' : '#e74c3c',
    fontWeight: '500',
  }),
  card: {
    background: '#fff',
    borderRadius: '14px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    marginBottom: '24px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #f0f0f0',
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    borderBottom: '1px solid #f5f5f5',
    color: '#333',
  },
  badge: (type) => ({
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    background: type === 'active' ? '#e6f7f7' : type === 'pending' ? '#fff3e0' : '#fce4ec',
    color: type === 'active' ? '#0D7377' : type === 'pending' ? '#e65100' : '#c62828',
  }),
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#999',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  settingsForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '500px',
  },
  settingsGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  settingsLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  settingsInput: {
    padding: '12px 16px',
    border: '2px solid #e8e8e8',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
  },
  settingsBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #0D7377, #14919B)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
};

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '~' },
  { id: 'users', label: 'Users', icon: '>' },
  { id: 'content', label: 'Content', icon: '#' },
  { id: 'notifications', label: 'Notifications', icon: '!' },
  { id: 'analytics', label: 'Analytics', icon: '%' },
  { id: 'settings', label: 'Settings', icon: '*' },
];

function DashboardPage() {
  const stats = [
    { label: 'Total Users', value: '12,458', change: '+12.5%', positive: true, color: '#0D7377' },
    { label: 'Active Today', value: '1,847', change: '+8.2%', positive: true, color: '#14919B' },
    { label: 'Downloads', value: '45,230', change: '+24.1%', positive: true, color: '#2ecc71' },
    { label: 'Feedback', value: '89', change: '+3 new', positive: true, color: '#e67e22' },
  ];

  const recentUsers = [
    { name: 'Ahmad Rizal', email: 'ahmad@email.com', date: '2026-05-12', status: 'active' },
    { name: 'Siti Nurhaliza', email: 'siti@email.com', date: '2026-05-11', status: 'active' },
    { name: 'Muhammad Faiz', email: 'faiz@email.com', date: '2026-05-11', status: 'pending' },
    { name: 'Aisyah Rahman', email: 'aisyah@email.com', date: '2026-05-10', status: 'active' },
    { name: 'Haziq Ismail', email: 'haziq@email.com', date: '2026-05-10', status: 'active' },
  ];

  return (
    <>
      <div style={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.label} style={styles.statCard(stat.color)}>
            <div style={styles.statLabel}>{stat.label}</div>
            <div style={styles.statValue}>{stat.value}</div>
            <div style={styles.statChange(stat.positive)}>{stat.change}</div>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Recent Users</div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Joined</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((user) => (
              <tr key={user.email}>
                <td style={styles.td}>{user.name}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>{user.date}</td>
                <td style={styles.td}>
                  <span style={styles.badge(user.status)}>{user.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function UsersPage() {
  const users = [
    { name: 'Ahmad Rizal', email: 'ahmad@email.com', plan: 'Premium', date: '2026-03-15', status: 'active' },
    { name: 'Siti Nurhaliza', email: 'siti@email.com', plan: 'Free', date: '2026-04-02', status: 'active' },
    { name: 'Muhammad Faiz', email: 'faiz@email.com', plan: 'Free', date: '2026-05-11', status: 'pending' },
    { name: 'Aisyah Rahman', email: 'aisyah@email.com', plan: 'Premium', date: '2026-01-20', status: 'active' },
    { name: 'Haziq Ismail', email: 'haziq@email.com', plan: 'Free', date: '2026-05-10', status: 'active' },
    { name: 'Nurul Ain', email: 'nurul@email.com', plan: 'Premium', date: '2026-02-14', status: 'active' },
    { name: 'Irfan Hakimi', email: 'irfan@email.com', plan: 'Free', date: '2026-05-08', status: 'inactive' },
  ];

  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>All Users</div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Plan</th>
            <th style={styles.th}>Joined</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.email}>
              <td style={styles.td}>{user.name}</td>
              <td style={styles.td}>{user.email}</td>
              <td style={styles.td}>{user.plan}</td>
              <td style={styles.td}>{user.date}</td>
              <td style={styles.td}>
                <span style={styles.badge(user.status)}>{user.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
        <thead>
          <tr>
            <th style={styles.th}>Title</th>
            <th style={styles.th}>Type</th>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {content.map((item) => (
            <tr key={item.title}>
              <td style={styles.td}>{item.title}</td>
              <td style={styles.td}>{item.type}</td>
              <td style={styles.td}>{item.date}</td>
              <td style={styles.td}>
                <span style={styles.badge(item.status)}>{item.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NotificationsPage() {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Push Notifications</div>
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>!</div>
        <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>No notifications sent yet</p>
        <p style={{ fontSize: '14px' }}>Send push notifications to your app users from here.</p>
      </div>
    </div>
  );
}

function AnalyticsPage() {
  const metrics = [
    { label: 'Page Views (Today)', value: '8,432' },
    { label: 'Avg. Session Duration', value: '4m 32s' },
    { label: 'Bounce Rate', value: '24.3%' },
    { label: 'Top Feature', value: 'Prayer Times' },
  ];

  const topFeatures = [
    { feature: 'Prayer Times', usage: '89%', sessions: '11,087' },
    { feature: 'Al-Quran', usage: '72%', sessions: '8,965' },
    { feature: 'Qiblah Compass', usage: '56%', sessions: '6,973' },
    { feature: 'Daily Azkar', usage: '48%', sessions: '5,980' },
    { feature: 'Zakat Calculator', usage: '31%', sessions: '3,862' },
  ];

  return (
    <>
      <div style={styles.statsGrid}>
        {metrics.map((m) => (
          <div key={m.label} style={styles.statCard('#0D7377')}>
            <div style={styles.statLabel}>{m.label}</div>
            <div style={{ ...styles.statValue, fontSize: '24px' }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Top Features by Usage</div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Feature</th>
              <th style={styles.th}>Usage Rate</th>
              <th style={styles.th}>Sessions</th>
            </tr>
          </thead>
          <tbody>
            {topFeatures.map((f) => (
              <tr key={f.feature}>
                <td style={styles.td}>{f.feature}</td>
                <td style={styles.td}>{f.usage}</td>
                <td style={styles.td}>{f.sessions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function SettingsPage() {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>App Settings</div>
      <div style={styles.settingsForm}>
        <div style={styles.settingsGroup}>
          <label style={styles.settingsLabel}>App Name</label>
          <input style={styles.settingsInput} defaultValue="HidayahMY" />
        </div>
        <div style={styles.settingsGroup}>
          <label style={styles.settingsLabel}>Support Email</label>
          <input style={styles.settingsInput} defaultValue="support@hidayahmy.com" />
        </div>
        <div style={styles.settingsGroup}>
          <label style={styles.settingsLabel}>Default Language</label>
          <input style={styles.settingsInput} defaultValue="Bahasa Malaysia" />
        </div>
        <div style={styles.settingsGroup}>
          <label style={styles.settingsLabel}>Prayer Time Source</label>
          <input style={styles.settingsInput} defaultValue="JAKIM" />
        </div>
        <button style={styles.settingsBtn}>Save Changes</button>
      </div>
    </div>
  );
}

const pages = {
  dashboard: DashboardPage,
  users: UsersPage,
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
            <div
              key={item.id}
              style={styles.navItem(activePage === item.id)}
              onClick={() => setActivePage(item.id)}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', padding: '24px' }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {userEmail}
          </div>
          <div
            onClick={onLogout}
            style={{
              padding: '10px 16px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '10px',
              textAlign: 'center',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Sign Out
          </div>
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>
            {navItems.find((n) => n.id === activePage)?.label}
          </h1>
          <button style={styles.logoutBtn} onClick={onLogout}>
            Sign Out
          </button>
        </div>
        <PageComponent />
      </main>
    </div>
  );
}
