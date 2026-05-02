import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { IconChevLeft } from '../components/Icons';

export default function GiveKudos() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { apiFetch } = useAuth();
  const { show } = useToast();
  const [recipient, setRecipient] = useState(state?.recipient || '');
  const [message, setMessage] = useState(state?.message || '');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSending(true);
    try {
      await apiFetch('/kudos', { method: 'POST', body: { recipient: recipient.trim(), message: message.trim() } });
      show('Kudos sent ✨', 'success');
      navigate('/');
    } catch (err) { setError(err.message); }
    finally { setSending(false); }
  };

  return (
    <div className="page-enter"><div className="content">
      <div className="subh">
        <button className="back-btn" onClick={() => navigate('/')}><IconChevLeft /></button>
        <h1>Give <em>Kudos</em></h1>
      </div>
      <div className="compose">
        {error && <div className="msg msg-err">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label className="fl">Who?</label>
          <input className="fi" style={{ marginBottom: 10 }} placeholder="Their name" required value={recipient} onChange={e => setRecipient(e.target.value)} />
          <label className="fl" style={{ marginTop: 6 }}>Message</label>
          <textarea className="fi" style={{ minHeight: 90, resize: 'vertical', marginBottom: 10 }} placeholder="What was remarkable?" required minLength="10" maxLength="280" value={message} onChange={e => setMessage(e.target.value)} />
          <button type="submit" className={`btn btn-brand ${sending ? 'btn-loading' : ''}`} disabled={sending}>Send Kudos</button>
        </form>
      </div>
    </div></div>
  );
}
