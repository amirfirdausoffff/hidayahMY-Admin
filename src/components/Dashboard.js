import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { supabase } from '../lib/supabase';
import {
  LayoutDashboard, Users, ShieldCheck, Image, Volume2,
  Bell, MessageSquareText, LogOut, ChevronDown, ChevronRight,
  Plus, Trash2, Upload, Search, Check, X, Play,
} from 'lucide-react';

const API_URL = 'https://api.hidayahmy.com';

async function apiFetch(path, session, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}`, ...options.headers },
  });
  return res.json();
}

// ─── Toast ───
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
      {type === 'success' ? <Check size={16} /> : <X size={16} />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100"><X size={14} /></button>
    </div>
  );
}

// ─── Dashboard ───
function DashboardPage({ session }) {
  const [firebaseStats, setFirebaseStats] = useState(null);
  const [apiStats, setApiStats] = useState(null);
  const [pendingFeedback, setPendingFeedback] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'app_stats', 'dashboard'), (snap) => {
      if (snap.exists()) setFirebaseStats(snap.data());
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => { apiFetch('/api/admin/stats', session).then(setApiStats).catch(() => {}); }, [session]);
  useEffect(() => { apiFetch('/api/feedback', session).then((d) => { setPendingFeedback((d.feedback || []).filter((f) => f.status === 'pending').length); }).catch(() => {}); }, [session]);

  const fmt = (n) => (n || 0).toLocaleString();
  if (loading) return <div className="flex justify-center py-20 text-gray-400">Loading...</div>;

  const stats = [
    { label: 'Total Customers', value: fmt(apiStats?.totalCustomers), color: 'text-blue-600', bg: 'bg-blue-50', icon: Users },
    { label: 'Admin Team', value: fmt(apiStats?.totalAdmins), color: 'text-violet-600', bg: 'bg-violet-50', icon: ShieldCheck },
    { label: 'App Downloads', value: fmt(firebaseStats?.downloads), color: 'text-emerald-600', bg: 'bg-emerald-50', icon: LayoutDashboard },
    { label: 'Pending Feedback', value: fmt(pendingFeedback), color: 'text-amber-600', bg: 'bg-amber-50', icon: MessageSquareText },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st) => (
          <div key={st.label} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{st.label}</span>
              <div className={`${st.bg} ${st.color} p-2 rounded-lg`}><st.icon size={18} /></div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{st.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${firebaseStats ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-500">{firebaseStats ? 'Firebase connected' : 'Firebase not connected'}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Customers ───
function CustomersPage({ session }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch('/api/admin/list-users?role=customer', session)
      .then((d) => { setCustomers(d.users || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session]);

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Loading...</div>;

  const filtered = search
    ? customers.filter((u) => (u.name || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase()))
    : customers;

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="flex items-center justify-between p-5 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-gray-900">All Customers</h2>
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{filtered.length}</span>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 w-56" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      {filtered.length === 0 ? <p className="text-gray-400 text-center py-12 text-sm">No customers found</p> : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-50">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Provider</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
            </tr></thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-sm text-gray-900 font-medium">{u.name || '-'}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{u.email}</td>
                  <td className="px-5 py-3"><span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{u.provider || 'email'}</span></td>
                  <td className="px-5 py-3 text-sm text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Team ───
function TeamPage({ session, showToast }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadAdmins = useCallback(() => {
    apiFetch('/api/admin/list-users?role=admin', session)
      .then((d) => { setAdmins(d.users || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session]);

  useEffect(() => { loadAdmins(); }, [loadAdmins]);

  const handleAdd = async (e) => {
    e.preventDefault(); setFormError(''); setSubmitting(true);
    const d = await apiFetch('/api/admin/add-user', session, { method: 'POST', body: JSON.stringify(formData) });
    if (d.success) { showToast(`Added "${formData.name || formData.email}"`); setFormData({ name: '', email: '', password: '' }); setShowForm(false); loadAdmins(); }
    else setFormError(d.error || 'Failed');
    setSubmitting(false);
  };

  const handleRemove = async (user) => {
    if (!confirm(`Remove ${user.email}?`)) return;
    const d = await apiFetch('/api/admin/remove-user', session, { method: 'DELETE', body: JSON.stringify({ user_id: user.id }) });
    if (d.success) { showToast(`Removed ${user.email}`); loadAdmins(); } else alert(d.error || 'Failed');
  };

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Loading...</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="flex items-center justify-between p-5 border-b border-gray-50">
        <h2 className="text-sm font-semibold text-gray-900">Admin Team</h2>
        <button onClick={() => { setShowForm(!showForm); setFormError(''); }} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition ${showForm ? 'bg-gray-100 text-gray-600' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
          {showForm ? 'Cancel' : <><Plus size={14} /> Add Admin</>}
        </button>
      </div>

      {showForm && (
        <div className="p-5 border-b border-gray-50 bg-gray-50/50">
          <form onSubmit={handleAdd}>
            {formError && <div className="text-red-600 text-xs mb-3 bg-red-50 px-3 py-2 rounded-lg">{formError}</div>}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <input className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <input className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400" placeholder="Email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              <input className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400" placeholder="Password" type="password" required minLength={6} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            </div>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50">{submitting ? 'Adding...' : 'Add Admin'}</button>
          </form>
        </div>
      )}

      {admins.length === 0 ? <p className="text-gray-400 text-center py-12 text-sm">No admins yet</p> : (
        <table className="w-full">
          <thead><tr className="border-b border-gray-50">
            <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Name</th>
            <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Email</th>
            <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Role</th>
            <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Added</th>
            <th className="px-5 py-3"></th>
          </tr></thead>
          <tbody>
            {admins.map((u) => (
              <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                <td className="px-5 py-3 text-sm text-gray-900 font-medium">{u.name || '-'}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{u.email}</td>
                <td className="px-5 py-3"><span className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded">admin</span></td>
                <td className="px-5 py-3 text-sm text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-5 py-3 text-right">
                  {u.email !== session?.user?.email
                    ? <button onClick={() => handleRemove(u)} className="text-red-500 hover:text-red-700 transition"><Trash2 size={14} /></button>
                    : <span className="text-xs text-gray-300">You</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Backgrounds ───
function BackgroundsPage({ session, showToast }) {
  const [backgrounds, setBackgrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [catDashboard, setCatDashboard] = useState(true);
  const [catPrayer, setCatPrayer] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const loadBackgrounds = useCallback(() => {
    setLoading(true);
    apiFetch('/api/backgrounds', session)
      .then((d) => { setBackgrounds(d.backgrounds || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session]);

  useEffect(() => { loadBackgrounds(); }, [loadBackgrounds]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!name.trim() || !imageFile) { setError('Name and image are required'); return; }
    if (!catDashboard && !catPrayer) { setError('Select at least one display location'); return; }
    setUploading(true); setError('');

    const category = catDashboard && catPrayer ? 'both' : catDashboard ? 'dashboard' : 'prayer';

    try {
      const ext = imageFile.name.split('.').pop();
      const fileName = `${category}/${Date.now()}_${name.trim().replace(/\s+/g, '_').toLowerCase()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('backgrounds')
        .upload(fileName, imageFile, { contentType: imageFile.type, upsert: false });

      if (uploadError) { setError(uploadError.message); setUploading(false); return; }

      const { data: urlData } = supabase.storage.from('backgrounds').getPublicUrl(fileName);

      const d = await apiFetch('/api/backgrounds', session, {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), category, image_url: urlData.publicUrl, storage_path: fileName }),
      });

      if (d.success) {
        showToast(`"${name}" uploaded`);
        setName(''); setImageFile(null); setImagePreview(null); setCatDashboard(true); setCatPrayer(false); setShowForm(false);
        loadBackgrounds();
      } else setError(d.error || 'Save failed');
    } catch (err) {
      setError(err.message || 'Upload failed');
    }
    setUploading(false);
  };

  const handleDelete = async (bg) => {
    if (!confirm(`Delete "${bg.name}"?`)) return;
    const d = await apiFetch(`/api/backgrounds/${bg.id}`, session, { method: 'DELETE' });
    if (d.success) { showToast(`"${bg.name}" deleted`); loadBackgrounds(); }
    else alert(d.error || 'Failed to delete');
  };

  const filtered = filter === 'all' ? backgrounds : backgrounds.filter((b) => b.category === filter || b.category === 'both');
  const filters = [{ value: 'all', label: 'All' }, { value: 'dashboard', label: 'Dashboard' }, { value: 'prayer', label: 'Prayer' }];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-gray-900">Backgrounds</h2>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{backgrounds.length}</span>
          </div>
          <button onClick={() => { setShowForm(!showForm); setError(''); }} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition ${showForm ? 'bg-gray-100 text-gray-600' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
            {showForm ? 'Cancel' : <><Upload size={14} /> Upload</>}
          </button>
        </div>

        {showForm && (
          <div className="p-5 border-b border-gray-50 bg-gray-50/50">
            <form onSubmit={handleUpload} className="max-w-md space-y-4">
              {error && <div className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                <input className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400" placeholder="e.g. Masjid Negara" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Display In</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={catDashboard} onChange={(e) => setCatDashboard(e.target.checked)} className="rounded" /> Dashboard
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={catPrayer} onChange={(e) => setCatPrayer(e.target.checked)} className="rounded" /> Prayer
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Image (max 5MB, 1080x1920 recommended)</label>
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileSelect} className="text-sm text-gray-500" />
              </div>
              {imagePreview && (
                <div className="w-24 h-40 rounded-lg overflow-hidden border border-gray-200">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <button type="submit" disabled={uploading} className="px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50">
                {uploading ? 'Uploading...' : 'Upload Background'}
              </button>
            </form>
          </div>
        )}

        <div className="p-5">
          <div className="flex gap-1.5 mb-4">
            {filters.map((f) => (
              <button key={f.value} onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${filter === f.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {f.label}
              </button>
            ))}
          </div>

          {loading ? <div className="text-gray-400 text-center py-12 text-sm">Loading...</div> :
           filtered.length === 0 ? <div className="text-gray-400 text-center py-12 text-sm">No backgrounds yet</div> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map((bg) => (
                <div key={bg.id} className="group border border-gray-100 rounded-lg overflow-hidden hover:shadow-sm transition">
                  <div className="w-full h-44 bg-gray-100">
                    <img src={bg.image_url} alt={bg.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2.5">
                    <div className="text-xs font-semibold text-gray-900 truncate mb-1">{bg.name}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{bg.category === 'both' ? 'all' : bg.category}</span>
                      <button onClick={() => handleDelete(bg)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Azan Sounds ───
function AzanSoundsPage({ session, showToast }) {
  const [azanSounds, setAzanSounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [durationSeconds, setDurationSeconds] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const loadAzanSounds = useCallback(() => {
    setLoading(true);
    apiFetch('/api/azan-sounds', session)
      .then((d) => { setAzanSounds(d.azanSounds || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session]);

  useEffect(() => { loadAzanSounds(); }, [loadAzanSounds]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { setError('Audio must be under 20MB'); return; }
    setAudioFile(file); setError('');
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.addEventListener('loadedmetadata', () => {
      setDurationSeconds(Math.round(audio.duration));
      URL.revokeObjectURL(audio.src);
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!name.trim() || !audioFile) { setError('Name and audio file are required'); return; }
    setUploading(true); setError('');

    try {
      const ext = audioFile.name.split('.').pop();
      const fileName = `${Date.now()}_${name.trim().replace(/\s+/g, '_').toLowerCase()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('azan')
        .upload(fileName, audioFile, { contentType: audioFile.type, upsert: false });

      if (uploadError) { setError(uploadError.message); setUploading(false); return; }

      const { data: urlData } = supabase.storage.from('azan').getPublicUrl(fileName);

      const d = await apiFetch('/api/azan-sounds', session, {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), file_url: urlData.publicUrl, storage_path: fileName, duration_seconds: durationSeconds }),
      });

      if (d.success) {
        showToast(`"${name}" uploaded`);
        setName(''); setAudioFile(null); setDurationSeconds(null); setShowForm(false);
        loadAzanSounds();
      } else setError(d.error || 'Save failed');
    } catch (err) {
      setError(err.message || 'Upload failed');
    }
    setUploading(false);
  };

  const handleDelete = async (sound) => {
    if (!confirm(`Delete "${sound.name}"?`)) return;
    const d = await apiFetch(`/api/azan-sounds/${sound.id}`, session, { method: 'DELETE' });
    if (d.success) { showToast(`"${sound.name}" deleted`); loadAzanSounds(); }
    else alert(d.error || 'Failed to delete');
  };

  const fmtDuration = (sec) => {
    if (!sec) return '-';
    const m = Math.floor(sec / 60);
    const s2 = sec % 60;
    return `${m}:${s2.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="flex items-center justify-between p-5 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-gray-900">Azan Sounds</h2>
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{azanSounds.length}</span>
        </div>
        <button onClick={() => { setShowForm(!showForm); setError(''); }} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition ${showForm ? 'bg-gray-100 text-gray-600' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
          {showForm ? 'Cancel' : <><Upload size={14} /> Upload Azan</>}
        </button>
      </div>

      {showForm && (
        <div className="p-5 border-b border-gray-50 bg-gray-50/50">
          <form onSubmit={handleUpload} className="max-w-md space-y-4">
            {error && <div className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
              <input className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400" placeholder="e.g. Azan Makkah" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Audio File (max 20MB, MP3/M4A/AAC/WAV)</label>
              <input type="file" accept="audio/mp3,audio/mpeg,audio/m4a,audio/aac,audio/wav,audio/x-m4a,audio/mp4" onChange={handleFileSelect} className="text-sm text-gray-500" />
            </div>
            {durationSeconds && <div className="text-xs text-gray-500">Duration: {fmtDuration(durationSeconds)}</div>}
            <button type="submit" disabled={uploading} className="px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50">
              {uploading ? 'Uploading...' : 'Upload Azan Sound'}
            </button>
          </form>
        </div>
      )}

      {loading ? <div className="text-gray-400 text-center py-12 text-sm">Loading...</div> :
       azanSounds.length === 0 ? <div className="text-gray-400 text-center py-12 text-sm">No azan sounds uploaded yet</div> : (
        <table className="w-full">
          <thead><tr className="border-b border-gray-50">
            <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Name</th>
            <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Preview</th>
            <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Duration</th>
            <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Uploaded</th>
            <th className="px-5 py-3"></th>
          </tr></thead>
          <tbody>
            {azanSounds.map((sound) => (
              <tr key={sound.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                <td className="px-5 py-3 text-sm text-gray-900 font-medium">{sound.name}</td>
                <td className="px-5 py-3"><audio controls src={sound.file_url} className="h-8 max-w-[220px]" /></td>
                <td className="px-5 py-3 text-sm text-gray-400">{fmtDuration(sound.duration_seconds)}</td>
                <td className="px-5 py-3 text-sm text-gray-400">{new Date(sound.created_at).toLocaleDateString()}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => handleDelete(sound)} className="text-red-400 hover:text-red-600 transition"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Notifications ───
function NotificationsPage({ session, showToast }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [topic, setTopic] = useState('general');
  const [sendMode, setSendMode] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
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

    setSending(true); setError('');
    const payload = { title: title.trim(), body: body.trim(), topic };
    if (sendMode === 'user') payload.user_id = selectedUser.id;

    const d = await apiFetch('/api/admin/send-notification', session, { method: 'POST', body: JSON.stringify(payload) });
    if (d.success) {
      showToast(sendMode === 'user' ? `Sent to ${selectedUser.name || selectedUser.email}` : `Sent to all users`);
      setTitle(''); setBody(''); setSelectedUser(null); setSearchQuery(''); setSearchResults([]); loadHistory();
    } else setError(d.error || 'Failed');
    setSending(false);
  };

  return (
    <div className="space-y-4">
      {/* Send form */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Send Notification</h2>
        <form onSubmit={handleSend} className="max-w-lg space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Send To</label>
            <div className="flex gap-1.5">
              {[{ value: 'all', label: 'All Users' }, { value: 'user', label: 'Specific User' }].map((m) => (
                <button key={m.value} type="button" onClick={() => { setSendMode(m.value); setSelectedUser(null); setSearchQuery(''); setSearchResults([]); setError(''); }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${sendMode === m.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {sendMode === 'all' && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Topic</label>
              <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 cursor-pointer" value={topic} onChange={(e) => setTopic(e.target.value)}>
                {topics.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          )}

          {sendMode === 'user' && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">User</label>
              {selectedUser ? (
                <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{selectedUser.name || 'No name'}</div>
                    <div className="text-xs text-gray-400">{selectedUser.email}</div>
                  </div>
                  <button type="button" onClick={() => { setSelectedUser(null); setSearchQuery(''); setSearchResults([]); }} className="text-xs text-gray-400 hover:text-gray-600">Change</button>
                </div>
              ) : (
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400" placeholder="Search by name or email..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />
                  {searching && <div className="text-xs text-gray-400 mt-1">Searching...</div>}
                  {searchResults.length > 0 && (
                    <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                      {searchResults.map((u) => (
                        <div key={u.id} onClick={() => { setSelectedUser(u); setSearchResults([]); setSearchQuery(''); }}
                          className="px-3 py-2.5 cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-0">
                          <div className="text-sm font-medium text-gray-900">{u.name || 'No name'}</div>
                          <div className="text-xs text-gray-400">{u.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchQuery.length >= 2 && !searching && searchResults.length === 0 && <div className="text-xs text-gray-400 mt-1">No users found</div>}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
            <input className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400" placeholder="Notification title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={100} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Message</label>
            <textarea className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 min-h-[80px] resize-y font-[inherit]" placeholder="Message body" value={body} onChange={(e) => setBody(e.target.value)} required maxLength={500} />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={sending} className="px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50">
              {sending ? 'Sending...' : 'Send Notification'}
            </button>
            <span className="text-[11px] text-gray-300">{title.length}/100 | {body.length}/500</span>
          </div>

          {error && <div className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
        </form>
      </div>

      {/* History */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-900">Notification History</h2>
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{history.length}</span>
        </div>
        {loadingHistory ? <div className="text-gray-400 text-center py-12 text-sm">Loading...</div> :
         history.length === 0 ? <div className="text-gray-400 text-center py-12 text-sm">No notifications sent yet</div> : (
          <table className="w-full">
            <thead><tr className="border-b border-gray-50">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Title</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Message</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Topic</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date</th>
            </tr></thead>
            <tbody>
              {history.map((n) => (
                <tr key={n.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-sm text-gray-900 font-medium max-w-[180px] truncate">{n.title}</td>
                  <td className="px-5 py-3 text-sm text-gray-500 max-w-[260px] truncate">{n.body}</td>
                  <td className="px-5 py-3"><span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{n.topic || 'general'}</span></td>
                  <td className="px-5 py-3 text-sm text-gray-400">{new Date(n.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Feedback ───
function FeedbackPage({ session, showToast }) {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [resolving, setResolving] = useState(false);

  const loadFeedback = useCallback(() => {
    apiFetch('/api/feedback', session)
      .then((d) => { setFeedback(d.feedback || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session]);

  useEffect(() => { loadFeedback(); }, [loadFeedback]);

  const handleResolve = async (item) => {
    if (!confirm('Mark this feedback as resolved? The user will be notified.')) return;
    setResolving(true);
    const d = await apiFetch(`/api/feedback/${item.id}`, session, { method: 'PUT', body: JSON.stringify({ status: 'resolved' }) });
    if (d.success) { showToast('Feedback marked as resolved'); setSelected(null); loadFeedback(); }
    else alert(d.error || 'Failed to resolve');
    setResolving(false);
  };

  const filtered = filter === 'all' ? feedback : feedback.filter((f) => f.status === filter);
  const truncate = (str, len = 60) => str && str.length > len ? str.substring(0, len) + '...' : str || '-';

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-gray-900">Feedback & Bug Reports</h2>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{filtered.length}</span>
          </div>
          <div className="flex gap-1.5">
            {[{ value: 'all', label: 'All' }, { value: 'pending', label: 'Pending' }, { value: 'resolved', label: 'Resolved' }].map((f) => (
              <button key={f.value} onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${filter === f.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? <div className="text-gray-400 text-center py-12 text-sm">No feedback yet</div> : (
          <table className="w-full">
            <thead><tr className="border-b border-gray-50">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Feature</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Message</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Images</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-5 py-3"></th>
            </tr></thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} onClick={() => setSelected(selected?.id === item.id ? null : item)} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 cursor-pointer">
                  <td className="px-5 py-3 text-sm text-gray-500">{item.email || '-'}</td>
                  <td className="px-5 py-3"><span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{item.feature || '-'}</span></td>
                  <td className="px-5 py-3 text-sm text-gray-500 max-w-[240px] truncate">{truncate(item.message)}</td>
                  <td className="px-5 py-3 text-sm text-gray-400">{item.image_urls && item.image_urls.length > 0 ? `${item.image_urls.length} img` : '-'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${item.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-400">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    {item.status === 'pending' && (
                      <button onClick={(e) => { e.stopPropagation(); handleResolve(item); }} className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg hover:bg-emerald-100 font-medium transition">
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Feedback Detail</h2>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="block text-xs font-medium text-gray-400 mb-0.5">Email</span><span className="text-gray-700">{selected.email || '-'}</span></div>
            <div><span className="block text-xs font-medium text-gray-400 mb-0.5">Feature</span><span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{selected.feature || '-'}</span></div>
            <div className="col-span-2"><span className="block text-xs font-medium text-gray-400 mb-0.5">Message</span><p className="text-gray-700 whitespace-pre-wrap">{selected.message || '-'}</p></div>
            <div><span className="block text-xs font-medium text-gray-400 mb-0.5">Submitted</span><span className="text-gray-700">{new Date(selected.created_at).toLocaleString()}</span></div>
            {selected.status === 'resolved' && selected.resolved_at && (
              <div><span className="block text-xs font-medium text-gray-400 mb-0.5">Resolved</span><span className="text-gray-700">{new Date(selected.resolved_at).toLocaleString()}</span></div>
            )}
            {selected.status === 'resolved' && selected.resolved_by && (
              <div><span className="block text-xs font-medium text-gray-400 mb-0.5">Resolved By</span><span className="text-gray-700">{selected.resolved_by}</span></div>
            )}
          </div>
          {selected.image_urls && selected.image_urls.length > 0 && (
            <div className="mt-4">
              <span className="block text-xs font-medium text-gray-400 mb-2">Attachments</span>
              <div className="flex gap-2 flex-wrap">
                {selected.image_urls.map((img, idx) => (
                  <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block w-32 h-32 rounded-lg overflow-hidden border border-gray-100 hover:shadow-md transition">
                    <img src={img} alt={`Attachment ${idx + 1}`} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}
          {selected.status === 'pending' && (
            <button disabled={resolving} onClick={() => handleResolve(selected)} className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition">
              {resolving ? 'Resolving...' : 'Mark as Resolved'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Navigation config ───
const navSections = [
  {
    label: 'Overview',
    items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Users',
    items: [
      { id: 'customers', label: 'Customers', icon: Users },
      { id: 'team', label: 'Team', icon: ShieldCheck },
    ],
  },
  {
    label: 'Content',
    items: [
      { id: 'backgrounds', label: 'Backgrounds', icon: Image },
      { id: 'azan', label: 'Azan Sounds', icon: Volume2 },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'feedback', label: 'Feedback', icon: MessageSquareText },
    ],
  },
];

const pages = {
  dashboard: DashboardPage,
  customers: CustomersPage,
  team: TeamPage,
  backgrounds: BackgroundsPage,
  azan: AzanSoundsPage,
  notifications: NotificationsPage,
  feedback: FeedbackPage,
};

const pageLabels = {};
navSections.forEach((sec) => sec.items.forEach((item) => { pageLabels[item.id] = item.label; }));

// ─── Layout ───
export default function Dashboard({ onLogout, session }) {
  const [activePage, setActivePage] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const PageComponent = pages[activePage];

  const showToast = (message, type = 'success') => setToast({ message, type });

  return (
    <div className="flex min-h-screen bg-gray-50/80">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 fixed h-screen flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-2.5">
          <img src="/hidayahicon.png" alt="" className="w-7 h-7 rounded-lg" />
          <span className="text-sm font-bold text-gray-900 tracking-tight">HidayahMY</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-5 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.label}>
              <div className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest px-2 mb-1.5">{section.label}</div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = activePage === item.id;
                  return (
                    <button key={item.id} onClick={() => setActivePage(item.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition ${active ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                      <item.icon size={16} strokeWidth={active ? 2 : 1.5} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="text-[11px] text-gray-400 truncate px-2.5 mb-2">{session?.user?.email}</div>
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[13px] text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition">
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56 p-8">
        <h1 className="text-lg font-bold text-gray-900 mb-6">{pageLabels[activePage]}</h1>
        <PageComponent session={session} showToast={showToast} />
      </main>
    </div>
  );
}
