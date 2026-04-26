import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { getConfig } from '../config';
import { AtlasIcon, AtlasTitle } from '../components/AtlasLogo';
import LoadingOverlay from '../components/LoadingOverlay';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', role: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [overlay, setOverlay] = useState({ visible: false, text: '', sub: '' });
  const { register } = useAuth();
  const { show } = useToast();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const cfg = getConfig();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setOverlay({ visible: true, text: 'Creating your account', sub: 'Setting up…' });
    try {
      const user = await register(form.name.trim(), form.email.trim().toLowerCase(), form.role.trim(), form.password);
      setOverlay({ visible: true, text: 'Welcome to ATLAS', sub: user.name });
      await new Promise(r => setTimeout(r, 600));
      setOverlay({ visible: false, text: '', sub: '' });
      navigate('/');
      show('Welcome to ATLAS', 'success');
    } catch (err) {
      setOverlay({ visible: false, text: '', sub: '' });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay {...overlay} />
      <div className="auth-page">
        <div className="auth-inner">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <AtlasIcon size={64} style={{ margin: '0 auto 18px' }} />
            <AtlasTitle variant={theme === 'dark' ? 'dark' : 'light'} />
            <p className="auth-sub" style={{ marginTop: 6 }}>{cfg.tagline}</p>
          </div>
          <div className="auth-eye">Get started</div>
          <h2 className="auth-heading">Create <em>your account</em></h2>
          {error && <div className="msg msg-err">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="fg"><label className="fl">Full name</label><input className="fi" required placeholder="Your name" value={form.name} onChange={set('name')} /></div>
            <div className="fg"><label className="fl">Work email</label><input className="fi" type="email" required placeholder="you@company.com" value={form.email} onChange={set('email')} /></div>
            <div className="fg"><label className="fl">Department / Role</label><input className="fi" required placeholder="Engineering · AI Architect" value={form.role} onChange={set('role')} /></div>
            <div className="fg"><label className="fl">Password</label><input className="fi" type="password" required minLength="8" placeholder="At least 8 characters" value={form.password} onChange={set('password')} /></div>
            <button type="submit" className={`btn btn-brand ${loading ? 'btn-loading' : ''}`} disabled={loading} style={{ marginTop: 10 }}>Create account</button>
            <button type="button" className="btn btn-outline" style={{ marginTop: 14 }} onClick={() => navigate('/login')}>Back to sign in</button>
          </form>
        </div>
      </div>
    </>
  );
}
