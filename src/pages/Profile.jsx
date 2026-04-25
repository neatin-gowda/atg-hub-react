import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/Avatar';
import { IconChevLeft, IconSun, IconLock, IconLogout } from '../components/Icons';

export default function Profile() {
  const { user, logout, updateProfile, apiFetch } = useAuth();
  const { theme, toggle } = useTheme();
  const { show } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', role: '', location: '', bio: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ given: 0, received: 0 });

  useEffect(() => {
    if (user) setForm({ name: user.name || '', role: user.role || '', location: user.location || '', bio: user.bio || '' });
    apiFetch('/me/stats').then(s => { if (s) setStats(s); });
  }, [user, apiFetch]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      await updateProfile({ name: form.name.trim(), role: form.role.trim(), location: form.location.trim(), bio: form.bio.trim() });
      show('Profile updated', 'success');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); show('Signed out'); };

  return (
    <div className="page-enter"><div className="content">
      <div className="subh">
        <button className="back-btn" onClick={() => navigate('/')}><IconChevLeft /></button>
        <h1>Your <em>Profile</em></h1>
      </div>
      <div className="prof-hero">
        <Avatar name={user?.name} size="lg" style={{ background: 'linear-gradient(135deg, var(--bg3), var(--bg4))', color: 'var(--accent)', border: '2px solid var(--bd2)', margin: '0 auto 14px', boxShadow: '0 0 30px rgba(222,98,17,.08)' }} />
        <div className="prof-name">{user?.name}</div>
        <div className="prof-role">{user?.role}{user?.location ? ` · ${user.location}` : ''}</div>
        <div className="prof-badges"><span className="badge br">{user?.isAdmin ? '★ Admin' : '★ Member'}</span></div>
      </div>
      <div className="qstats">
        <div className="qs"><div className="n">{stats.given || 0}</div><div className="l">Kudos given</div></div>
        <div className="qs"><div className="n">{stats.received || 0}</div><div className="l">Received</div></div>
        <div className="qs"><div className="n">8</div><div className="l">Apps used</div></div>
      </div>
      <div className="sh"><h2>Edit <em>Profile</em></h2></div>
      <div style={{ padding: '0 24px 20px' }}>
        {error && <div className="msg msg-err">{error}</div>}
        <form onSubmit={handleSave}>
          <div className="fg"><label className="fl">Name</label><input className="fi" required value={form.name} onChange={set('name')} /></div>
          <div className="fg"><label className="fl">Role</label><input className="fi" required value={form.role} onChange={set('role')} /></div>
          <div className="fg"><label className="fl">Location</label><input className="fi" placeholder="Dubai, UAE" value={form.location} onChange={set('location')} /></div>
          <div className="fg"><label className="fl">Bio</label><textarea className="fi" style={{ minHeight: 70, resize: 'vertical' }} placeholder="About you…" value={form.bio} onChange={set('bio')} /></div>
          <button type="submit" className={`btn btn-brand ${saving ? 'btn-loading' : ''}`} disabled={saving}>Save Changes</button>
        </form>
      </div>
      <div className="sh"><h2>Settings</h2></div>
      <div className="slist">
        <div className="srow" onClick={toggle}><div className="si"><IconSun width="16" height="16" /></div><div className="sl">Theme</div><div className="sv">{theme === 'dark' ? 'Dark' : 'Light'}</div></div>
        <div className="srow"><div className="si"><IconLock width="16" height="16" /></div><div className="sl">Security</div><div className="sv">Entra · ✓</div></div>
        <div className="srow danger" onClick={handleLogout}><div className="si"><IconLogout width="16" height="16" /></div><div className="sl">Sign out</div></div>
      </div>
    </div></div>
  );
}
