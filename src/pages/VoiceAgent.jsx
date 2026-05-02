import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getConfig } from '../config';
import { ALL_APPS, HR_QA, HR_QUICK_CHIPS } from '../data/registry';
import { IconChevLeft, IconPhone, IconChat, IconSend, IconStar, IconMic, IconPulse } from '../components/Icons';

const welcomeMessage = 'Hello! I\'m your MyHR AI Agent. Ask me about policies, benefits, leave, payroll, or anything HR-related.';

export default function VoiceAgent() {
  const app = ALL_APPS.find(a => a.id === 'hr-voice');
  const navigate = useNavigate();
  const { apiFetch } = useAuth();
  const { show } = useToast();
  const cfg = getConfig();
  const [tab, setTab] = useState('chat');
  const [messages, setMessages] = useState([{ from: 'bot', text: welcomeMessage }]);
  const [input, setInput] = useState('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [voiceState, setVoiceState] = useState('ready');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [realtimeReady, setRealtimeReady] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatRef = useRef(null);
  const messagesRef = useRef(messages);
  const inputRef = useRef(input);
  const recognitionRef = useRef(null);
  const lastFinalTranscript = useRef('');

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { inputRef.current = input; }, [input]);
  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight); }, [messages, tab]);

  const findAnswer = useCallback((msg) => {
    const ml = msg.toLowerCase();
    for (const [q, a] of Object.entries(HR_QA)) {
      const words = q.toLowerCase().replace(/[?]/g, '').split(' ');
      if (words.some(w => w.length > 3 && ml.includes(w))) return a;
    }
    return 'I understand your question. Let me connect you with our HR team for a detailed response. You can also tap the Call tab to speak directly.';
  }, []);

  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 0.95;
    utterance.onstart = () => setVoiceState('speaking');
    utterance.onend = () => setVoiceState('ready');
    utterance.onerror = () => setVoiceState('ready');
    window.speechSynthesis.speak(utterance);
  }, []);

  const send = useCallback(async (text, options = {}) => {
    const msg = (text ?? inputRef.current).trim();
    if (!msg) return;
    const history = messagesRef.current.slice(-10);
    setMessages(prev => [...prev, { from: 'user', text: msg }]);
    setInput('');
    if (options.voice) setVoiceState('thinking');

    try {
      const data = await apiFetch('/agents/hr-voice/chat', {
        method: 'POST',
        body: { message: msg, history },
      });
      const reply = data?.reply || findAnswer(msg);
      setMessages(prev => [...prev, { from: 'bot', text: reply }]);
      if (options.voice) speak(reply);
    } catch (err) {
      const reply = findAnswer(msg);
      setMessages(prev => [...prev, { from: 'bot', text: reply }]);
      if (options.voice) speak(reply);
    } finally {
      if (options.voice && !('speechSynthesis' in window)) setVoiceState('ready');
    }
  }, [apiFetch, findAnswer, speak]);

  useEffect(() => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceSupported(false);
      return undefined;
    }

    const recognition = new Recognition();
    recognition.lang = cfg.myHrVoiceLanguage || 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceState('listening');
      setVoiceTranscript('Listening...');
      lastFinalTranscript.current = '';
    };

    recognition.onresult = (event) => {
      let interim = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += transcript;
        else interim += transcript;
      }
      const visible = (finalText || interim).trim();
      if (visible) setVoiceTranscript(visible);
      if (finalText.trim()) lastFinalTranscript.current = finalText.trim();
    };

    recognition.onerror = () => {
      setIsListening(false);
      setVoiceState('ready');
      setVoiceTranscript('I could not hear that clearly. Try again in a quieter space.');
    };

    recognition.onend = () => {
      setIsListening(false);
      const finalText = lastFinalTranscript.current.trim();
      if (finalText) send(finalText, { voice: true });
      else setVoiceState('ready');
    };

    recognitionRef.current = recognition;
    return () => {
      try { recognition.stop(); }
      catch { /* recognition may already be idle */ }
      recognitionRef.current = null;
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [cfg.myHrVoiceLanguage, send]);

  useEffect(() => {
    if (tab !== 'voice' || realtimeReady) return;
    apiFetch('/agents/hr-voice/realtime-session', { method: 'POST', body: {} })
      .then((data) => setRealtimeReady(!!data?.client_secret?.value || !!data?.value || !!data?.configured))
      .catch(() => setRealtimeReady(false));
  }, [apiFetch, realtimeReady, tab]);

  const startVoice = () => {
    if (!voiceSupported || !recognitionRef.current) {
      show('Voice recognition is not available in this browser', 'error');
      return;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setVoiceTranscript('');
    try { recognitionRef.current.start(); }
    catch { /* recognition is already running */ }
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setVoiceState('ready');
  };

  const submitFeedback = async () => {
    if (!rating) { show('Please tap a star rating', 'error'); return; }
    try {
      await apiFetch('/feedback', { method: 'POST', body: { text: `[MyHR Voice Agent] ${rating}/5. ${feedback}`, rating, agent: 'hr-voice' } });
      show('Thank you for your feedback', 'success');
      setRating(0); setFeedback('');
    } catch { show('Could not submit', 'error'); }
  };

  const ChatConsole = ({ compact = false }) => (
    <div className={`voice-chat ${compact ? 'compact' : ''}`}>
      <div className="ch">
        <div className="status-dot" />
        <div className="nm">MyHR AI Agent</div>
        <div className="tg">{voiceState === 'thinking' ? 'Thinking' : 'Online'}</div>
      </div>
      <div className="chat-msgs" ref={chatRef}>
        {messages.map((m, i) => <div key={`${m.from}-${i}`} className={`bubble ${m.from === 'bot' ? 'bot' : 'usr'}`}>{m.text}</div>)}
      </div>
      {!compact && (
        <div className="qq-chips">
          {HR_QUICK_CHIPS.map(q => <button key={q} className="qq" onClick={() => send(q)}>{q}</button>)}
        </div>
      )}
      <div className="chat-bar">
        <input placeholder="Type your HR question..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
        <button className="send-btn" onClick={() => send()}><IconSend /></button>
      </div>
    </div>
  );

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

      <div className="voice-tabs">
        <button className={`vtab ${tab === 'chat' ? 'on' : ''}`} onClick={() => setTab('chat')}><IconChat /> Chat</button>
        <button className={`vtab ${tab === 'voice' ? 'on' : ''}`} onClick={() => setTab('voice')}><IconMic /> Voice</button>
        <button className={`vtab ${tab === 'call' ? 'on' : ''}`} onClick={() => setTab('call')}><IconPhone /> Call</button>
      </div>

      {tab === 'chat' && <ChatConsole />}

      {tab === 'voice' && (
        <div className="voice-live-wrap">
          <div className="voice-live-card">
            <div className={`voice-orb ${isListening ? 'is-listening' : ''} ${voiceState === 'speaking' ? 'is-speaking' : ''}`}>
              <IconMic />
              <span /><span /><span />
            </div>
            <div className="voice-kicker"><IconPulse /> In-app voice agent</div>
            <h3>{voiceState === 'listening' ? 'Listening to you' : voiceState === 'thinking' ? 'Finding the right HR answer' : voiceState === 'speaking' ? 'Speaking with you' : 'Tap and ask MyHR'}</h3>
            <p>Use voice when typing feels slow. Your question and the answer stay in the same MyHR transcript below.</p>
            <div className="voice-transcript">{voiceTranscript || 'Try: “How many annual leave days do I have?”'}</div>
            <div className="voice-actions">
              <button className="btn btn-brand" onClick={startVoice} disabled={isListening}>{isListening ? 'Listening...' : 'Start voice'}</button>
              <button className="btn btn-outline" onClick={stopVoice}>Stop</button>
            </div>
            <div className={`voice-support ${voiceSupported ? 'ok' : 'warn'}`}>
              {voiceSupported ? 'Speech recognition ready' : 'This browser does not support speech recognition yet'} · {realtimeReady ? 'Realtime config detected' : 'Chat fallback active'}
            </div>
          </div>
          <ChatConsole compact />
        </div>
      )}

      {tab === 'call' && (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <a href={cfg.hrPhoneNumber} className="call-btn"><IconPhone width="32" height="32" /></a>
          <div className="call-label">Tap to Call MyHR Agent</div>
          <div className="call-sub">Phone support · Available 24/7</div>
        </div>
      )}

      <div className="sh" style={{ padding: '0 24px 4px' }}><h2>What you can <em>ask</em></h2></div>
      <div className="voice-caps">
        {app.features.map((f, i) => (
          <div className="vc" key={i}><div className="vdot" /><div><div className="vt">{f.t}</div><div className="vd">{f.d}</div></div></div>
        ))}
      </div>

      <div className="voice-fb">
        <h4>Rate your experience</h4>
        <div className="vfs">Help us improve the MyHR AI Agent</div>
        <div className="stars">
          {[1,2,3,4,5].map(n => (
            <div key={n} className={`star ${n <= rating ? 'on' : ''}`} onClick={() => setRating(n)}>
              <IconStar />
            </div>
          ))}
        </div>
        <textarea className="fi" style={{ minHeight: 70, resize: 'vertical', marginBottom: 10 }} placeholder="Share your feedback..." value={feedback} onChange={e => setFeedback(e.target.value)} />
        <button className="btn btn-brand" onClick={submitFeedback}>Submit Feedback</button>
      </div>

      <div style={{ padding: '0 24px 20px' }}>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>Back</button>
      </div>
    </div></div>
  );
}
