import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { getConfig } from '../config';
import { IconLock } from '../components/Icons';
import { AtlasIcon, AtlasTitle } from '../components/AtlasLogo';
import LoadingOverlay from '../components/LoadingOverlay';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [overlay, setOverlay] = useState({ visible: false, text: '', sub: '' });
  const { login } = useAuth();
  const { show } = useToast();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const cfg = getConfig();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setOverlay({ visible: true, text: 'Signing you in', sub: 'Connecting securely…' });
    try {
      const user = await login(email.trim().toLowerCase(), password);
      setOverlay({ visible: true, text: 'Welcome back', sub: user.name });
      await new Promise(r => setTimeout(r, 600));
      setOverlay({ visible: false, text: '', sub: '' });
      navigate('/');
      show('Welcome back', 'success');
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
          <div className="auth-brand-lockup">
            <AtlasIcon size={66} style={{ margin: '0 auto 18px' }} />
            <AtlasTitle variant={theme === 'dark' ? 'dark' : 'light'} />
            <p className="auth-sub">{cfg.tagline}</p>
          </div>
          <div className="auth-eye">Welcome</div>
          <h2 className="auth-heading">Sign in to <em>your hub</em></h2>
          {error && <div className="msg msg-err">{error}</div>}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="fg">
              <label className="fl">Work email</label>
              <input className="fi" type="email" placeholder="you@company.com" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="fg">
              <label className="fl">Password</label>
              <input className="fi" type="password" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className={`btn btn-brand ${loading ? 'btn-loading' : ''}`} disabled={loading}>Sign in</button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/register')}>Create an account</button>
          </form>
          <div className="auth-footer">
            <div className="auth-secured"><IconLock width="12" height="12" /> Secured by Microsoft Entra ID</div>
          </div>
        </div>
      </div>
    </>
  );
}
