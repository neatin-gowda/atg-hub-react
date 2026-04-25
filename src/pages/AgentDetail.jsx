import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ALL_APPS, AGENT_RESPONSES } from '../data/registry';
import { AGENT_ICONS, IconChevLeft, IconSend } from '../components/Icons';
import { useToast } from '../context/ToastContext';

export default function AgentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { show } = useToast();
  const app = ALL_APPS.find(a => a.id === id);
  const [messages, setMessages] = useState([{ from: 'bot', text: `Hi! I'm ${app?.name}. How can I help?` }]);
  const [input, setInput] = useState('');
  const chatRef = useRef(null);

  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight); }, [messages]);

  if (!app || app.type === 'voice') { navigate('/'); return null; }

  const isAgent = app.type === 'agent';

  const send = () => {
    const msg = input.trim();
    if (!msg) return;
    setMessages(prev => [...prev, { from: 'user', text: msg }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'bot', text: AGENT_RESPONSES[app.id] || 'Processing your request. In production, this connects to the real AI backend.' }]);
    }, 1000);
  };

  const Icon = AGENT_ICONS[app.icon];

  return (
    <div className="page-enter"><div className="content">
      <div className="subh">
        <button className="back-btn" onClick={() => navigate(-1)}><IconChevLeft /></button>
        <h1><em>{app.name}</em></h1>
      </div>

      <div className="voice-hero" style={{ background: `linear-gradient(0deg,var(--bg) 0%,rgba(0,0,0,.35) 50%),url('${app.img}') center/cover` }}>
        <div className={`av av-lg ic-${app.icon}`} style={{ width: 60, height: 60, borderRadius: 16, margin: '0 auto 14px', boxShadow: '0 8px 24px rgba(0,0,0,.2)' }}>
          {Icon && <Icon width="28" height="28" />}
        </div>
        <h2 style={{ color: '#fff', fontFamily: 'var(--fd)', fontSize: 22 }}>{app.name}</h2>
        <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 12.5 }}>{app.tagline}</p>
      </div>

      {/* Chat — only for agents */}
      {isAgent && (
        <div className="voice-chat" style={{ margin: '16px 24px' }}>
          <div className="ch">
            <div className="status-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ok)', boxShadow: '0 0 8px var(--ok)' }} />
            <div className="nm">{app.name}</div>
            <div className="tg" style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--t4)' }}>Online</div>
          </div>
          <div className="chat-msgs" ref={chatRef}>
            {messages.map((m, i) => <div key={i} className={`bubble ${m.from === 'bot' ? 'bot' : 'usr'}`}>{m.text}</div>)}
          </div>
          <div className="chat-bar">
            <input placeholder="Ask me anything…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
            <button className="send-btn" onClick={send}><IconSend /></button>
          </div>
        </div>
      )}

      <div style={{ padding: '20px 24px' }}>
        <button className="btn btn-brand" onClick={() => show(`Launching ${app.name}…`)}>Open {app.name}</button>
        <button className="btn btn-outline" style={{ marginTop: 8 }} onClick={() => navigate(-1)}>Back</button>

        <div className="sh" style={{ padding: '16px 0 4px' }}><h2>Capabilities</h2></div>
        <div className="voice-caps">
          {app.features.map((f, i) => (
            <div className="vc" key={i}>
              <div className="vdot" />
              <div><div className="vt">{f.t}</div><div className="vd">{f.d}</div></div>
            </div>
          ))}
        </div>

        <div className="sh" style={{ padding: '16px 0 4px' }}><h2>API <em>Integration</em></h2></div>
        <div className="api-box">
          <div><span className="mt">Endpoint:</span> <span className="ep">{app.api}</span></div>
          <div><span className="mt">Payload:</span> {app.payload}</div>
          <div style={{ marginTop: 6 }}><span className="mt">Auth:</span> Bearer JWT (Entra ID)</div>
        </div>
      </div>
    </div></div>
  );
}
