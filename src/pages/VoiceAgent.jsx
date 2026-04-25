import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getConfig } from '../config';
import { ALL_APPS, HR_QA, HR_QUICK_CHIPS } from '../data/registry';
import { IconChevLeft, IconPhone, IconChat, IconSend, IconStar } from '../components/Icons';

export default function VoiceAgent() {
  const app = ALL_APPS.find(a => a.id === 'hr-voice');
  const navigate = useNavigate();
  const { apiFetch } = useAuth();
  const { show } = useToast();
  const cfg = getConfig();
  const [tab, setTab] = useState('chat');
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Hello! I\'m your MYHR AI Agent. Ask me about policies, benefits, leave, payroll, or anything HR-related.' }]);
  const [input, setInput] = useState('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const chatRef = useRef(null);

  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight); }, [messages]);

  const findAnswer = (msg) => {
    const ml = msg.toLowerCase();
    for (const [q, a] of Object.entries(HR_QA)) {
      const words = q.toLowerCase().replace(/[?]/g, '').split(' ');
      if (words.some(w => w.length > 3 && ml.includes(w))) return a;
    }
    return 'I understand your question. Let me connect you with our HR team for a detailed response. You can also tap the Call tab to speak directly.';
  };

  const send = (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setMessages(prev => [...prev, { from: 'user', text: msg }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'bot', text: findAnswer(msg) }]);
    }, 1000);
  };

  const submitFeedback = async () => {
    if (!rating) { show('Please tap a star rating', 'error'); return; }
    try {
      await apiFetch('/feedback', { method: 'POST', body: { text: `[MYHR Voice Agent] ${rating}/5. ${feedback}`, rating, agent: 'hr-voice' } });
      show('Thank you for your feedback', 'success');
      setRating(0); setFeedback('');
    } catch { show('Could not submit', 'error'); }
  };

  if (!app) return null;

  return (
    <div className="page-enter"><div className="content">
      <div className="subh">
        <button className="back-btn" onClick={() => navigate(-1)}><IconChevLeft /></button>
        <h1><em>{app.name}</em></h1>
      </div>

      <div className="voice-hero" style={{ background: `linear-gradient(0deg,var(--bg) 0%,rgba(0,0,0,.35) 50%),url('${app.img}') center/cover` }}>
        <div className="av av-lg ic-voice" style={{ width: 64, height: 64, borderRadius: 18, margin: '0 auto 14px', boxShadow: '0 8px 28px rgba(222,98,17,.35)' }}>
          <IconPhone width="30" height="30" />
        </div>
        <h2 style={{ color: '#fff', fontFamily: 'var(--fd)', fontSize: 24 }}>{app.name}</h2>
        <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 12.5 }}>{app.tagline}</p>
      </div>

      {/* Tabs */}
      <div className="voice-tabs">
        <div className={`vtab ${tab === 'chat' ? 'on' : ''}`} onClick={() => setTab('chat')}><IconChat width="16" height="16" /> Chat</div>
        <div className={`vtab ${tab === 'call' ? 'on' : ''}`} onClick={() => setTab('call')}><IconPhone width="16" height="16" /> Call</div>
      </div>

      {/* Chat view */}
      {tab === 'chat' && (
        <div className="voice-chat" style={{ margin: '16px 24px' }}>
          <div className="ch">
            <div className="status-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ok)', boxShadow: '0 0 8px var(--ok)' }} />
            <div className="nm">MYHR AI Agent</div>
            <div className="tg" style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--t4)' }}>Online</div>
          </div>
          <div className="chat-msgs" ref={chatRef}>
            {messages.map((m, i) => <div key={i} className={`bubble ${m.from === 'bot' ? 'bot' : 'usr'}`}>{m.text}</div>)}
          </div>
          <div className="qq-chips">
            {HR_QUICK_CHIPS.map(q => <button key={q} className="qq" onClick={() => send(q)}>{q}</button>)}
          </div>
          <div className="chat-bar">
            <input placeholder="Type your HR question…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
            <button className="send-btn" onClick={() => send()}><IconSend /></button>
          </div>
        </div>
      )}

      {/* Call view */}
      {tab === 'call' && (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <a href={cfg.hrPhoneNumber} className="call-btn"><IconPhone width="32" height="32" /></a>
          <div className="call-label">Tap to Call MYHR Agent</div>
          <div className="call-sub">AI voice support · Available 24/7</div>
        </div>
      )}

      {/* Capabilities */}
      <div className="sh" style={{ padding: '0 24px 4px' }}><h2>What you can <em>ask</em></h2></div>
      <div className="voice-caps">
        {app.features.map((f, i) => (
          <div className="vc" key={i}><div className="vdot" /><div><div className="vt">{f.t}</div><div className="vd">{f.d}</div></div></div>
        ))}
      </div>

      {/* Feedback */}
      <div className="voice-fb">
        <h4>Rate your experience</h4>
        <div className="vfs">Help us improve the MYHR AI Agent</div>
        <div className="stars">
          {[1,2,3,4,5].map(n => (
            <div key={n} className={`star ${n <= rating ? 'on' : ''}`} onClick={() => setRating(n)}>
              <IconStar />
            </div>
          ))}
        </div>
        <textarea className="fi" style={{ minHeight: 70, resize: 'vertical', marginBottom: 10 }} placeholder="Share your feedback…" value={feedback} onChange={e => setFeedback(e.target.value)} />
        <button className="btn btn-brand" onClick={submitFeedback}>Submit Feedback</button>
      </div>

      <div style={{ padding: '0 24px 20px' }}>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>Back</button>
      </div>
    </div></div>
  );
}
