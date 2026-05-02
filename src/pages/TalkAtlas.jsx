import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getConfig } from '../config';
import { ALL_APPS, HR_QA, HR_QUICK_CHIPS } from '../data/registry';
import { IconChevLeft, IconPhone, IconChat, IconSend, IconStar, IconMic, IconPulse, IconBolt, IconGrid } from '../components/Icons';

const welcomeMessage = 'Hello! I\'m Talk to ATLAS. I can answer, navigate, hand off to specialist agents, and help you work across apps like Leave, Kudos, MyHR, and Knowledge Base.';

const ATLAS_CAPABILITIES = [
  { label: 'Navigate', text: 'Open Leave, Kudos, apps, profile, or MyHR voice for you.' },
  { label: 'Read context', text: 'Summarise the current app area before answering.' },
  { label: 'Orchestrate', text: 'Route HR, IT, Finance, Knowledge, and engagement requests to the right agent.' },
  { label: 'Act safely', text: 'Draft actions first, then post or submit when the request is clear.' },
];

const ORCHESTRATION_CHIPS = [
  'Open leave and check my balance',
  'Enable HR voice agent',
  'Go to Kudos',
  'Draft kudos for Priya',
  'Show all AI agents',
  ...HR_QUICK_CHIPS,
];

function resolveAtlasAction(text) {
  const msg = String(text || '').toLowerCase();
  const kudosMatch = String(text || '').match(/(?:kudos|recognition|appreciation)\\s+(?:to|for)\\s+([^,]+?)(?:\\s+(?:saying|that|message)\\s+(.+))?$/i);
  if (kudosMatch) {
    const recipient = kudosMatch[1].trim();
    const message = (kudosMatch[2] || '').trim();
    return {
      type: 'kudos',
      recipient,
      message,
      shouldPost: /\\b(post|send|submit)\\b/i.test(text) && recipient && message.length >= 10,
      reply: message
        ? `Preparing Kudos for ${recipient}. ${/\\b(post|send|submit)\\b/i.test(text) ? 'I will post it now because your request is explicit.' : 'I will open the Kudos screen with the draft ready.'}`
        : `Opening Kudos for ${recipient}. Add the recognition message, then post it.`,
    };
  }
  if (msg.includes('hr voice') || msg.includes('myhr') || msg.includes('voice agent')) {
    return { type: 'handoff', agent: 'hr', tab: 'voice', reply: 'Handing you over to the MyHR voice agent. I will tuck ATLAS down and activate HR voice now.' };
  }
  if (msg.includes('leave') || msg.includes('pto') || msg.includes('vacation')) {
    return { type: 'navigate', path: '/leave', reply: 'Opening Leave Management so you can review balances, requests, and approvals.' };
  }
  if (msg.includes('kudos') || msg.includes('recognition') || msg.includes('appreciate')) {
    return { type: 'navigate', path: '/kudos/give', reply: 'Opening Kudos so you can write and post recognition.' };
  }
  if (msg.includes('profile')) return { type: 'navigate', path: '/profile', reply: 'Opening your profile.' };
  if (msg.includes('all app') || msg.includes('apps') || msg.includes('agent list')) return { type: 'navigate', path: '/apps', reply: 'Opening the ATLAS app and agent directory.' };
  if (msg.includes('home') || msg.includes('dashboard')) return { type: 'navigate', path: '/', reply: 'Taking you back to the ATLAS home dashboard.' };
  return null;
}

export default function TalkAtlas() {
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
  const [realtimeProvider, setRealtimeProvider] = useState('fallback');
  const [isListening, setIsListening] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [atlasExpanded, setAtlasExpanded] = useState(true);
  const chatRef = useRef(null);
  const messagesRef = useRef(messages);
  const inputRef = useRef(input);
  const recognitionRef = useRef(null);
  const lastFinalTranscript = useRef('');
  const stopModeRef = useRef('idle');
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const audioRef = useRef(null);
  const dataChannelRef = useRef(null);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { inputRef.current = input; }, [input]);
  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight); }, [messages, tab]);

  const findAnswer = useCallback((msg) => {
    const action = resolveAtlasAction(msg);
    if (action) return action.reply;
    const ml = msg.toLowerCase();
    for (const [q, a] of Object.entries(HR_QA)) {
      const words = q.toLowerCase().replace(/[?]/g, '').split(' ');
      if (words.some(w => w.length > 3 && ml.includes(w))) return a;
    }
    return 'I can help with HR, navigation, app actions, and specialist agent handoffs. If you want me to act, try “open leave”, “go to kudos”, or “enable HR voice agent”.';
  }, []);

  const speak = useCallback((text) => {
    if (isRealtimeConnected || !('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.96;
    utterance.pitch = 0.92;
    utterance.onstart = () => setVoiceState('speaking');
    utterance.onend = () => setVoiceState('ready');
    utterance.onerror = () => setVoiceState('ready');
    window.speechSynthesis.speak(utterance);
  }, [isRealtimeConnected]);

  const applyAtlasAction = useCallback((msg, reply) => {
    const action = resolveAtlasAction(msg);
    if (!action) return false;
    setMessages(prev => [...prev, { from: 'bot', text: reply || action.reply }]);
    if (action.type === 'handoff') {
      setAtlasExpanded(false);
      setTimeout(() => navigate('/app/hr-voice', { state: { autoStartVoice: true, handoffFrom: 'atlas' } }), 650);
      return true;
    }
    if (action.type === 'navigate') {
      setTimeout(() => navigate(action.path, action.state ? { state: action.state } : undefined), 650);
      return true;
    }
    return false;
  }, [navigate]);

  const send = useCallback(async (text, options = {}) => {
    const msg = (text ?? inputRef.current).trim();
    if (!msg) return;
    const history = messagesRef.current.slice(-10);
    setMessages(prev => [...prev, { from: 'user', text: msg }]);
    setInput('');
    if (options.voice) setVoiceState('thinking');

    const localAction = resolveAtlasAction(msg);
    if (localAction) {
      setTimeout(() => {
        if (localAction.type === 'kudos') {
          if (localAction.shouldPost) {
            apiFetch('/kudos', { method: 'POST', body: { recipient: localAction.recipient, message: localAction.message } })
              .then(() => {
                setMessages(prev => [...prev, { from: 'bot', text: `Kudos posted for ${localAction.recipient}.` }]);
                if (options.voice) speak(`Kudos posted for ${localAction.recipient}.`);
              })
              .catch(() => {
                setMessages(prev => [...prev, { from: 'bot', text: 'I could not post it from here, so I am opening Kudos with the draft ready.' }]);
                navigate('/kudos/give', { state: { recipient: localAction.recipient, message: localAction.message } });
              });
          } else {
            setMessages(prev => [...prev, { from: 'bot', text: localAction.reply }]);
            navigate('/kudos/give', { state: { recipient: localAction.recipient, message: localAction.message } });
          }
          return;
        }
        applyAtlasAction(msg, localAction.reply);
        if (options.voice) speak(localAction.reply);
      }, 320);
      return;
    }

    try {
      const data = await apiFetch('/agents/hr-voice/chat', {
        method: 'POST',
        body: { message: msg, history, appContext: 'talk-to-atlas' },
      });
      const reply = data?.reply || findAnswer(msg);
      if (!applyAtlasAction(msg, reply)) setMessages(prev => [...prev, { from: 'bot', text: reply }]);
      if (options.voice) speak(reply);
    } catch (err) {
      const reply = findAnswer(msg);
      if (!applyAtlasAction(msg, reply)) setMessages(prev => [...prev, { from: 'bot', text: reply }]);
      if (options.voice) speak(reply);
    } finally {
      if (options.voice && !('speechSynthesis' in window)) setVoiceState('ready');
    }
  }, [apiFetch, applyAtlasAction, findAnswer, speak]);

  const disconnectRealtime = useCallback(() => {
    dataChannelRef.current?.close?.();
    peerRef.current?.close?.();
    streamRef.current?.getTracks?.().forEach(track => track.stop());
    if (audioRef.current) audioRef.current.srcObject = null;
    dataChannelRef.current = null;
    peerRef.current = null;
    streamRef.current = null;
    setIsRealtimeConnected(false);
    setIsListening(false);
    setVoiceState('ready');
  }, []);

  const connectRealtime = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) return false;
    setVoiceState('connecting');
    const session = await apiFetch('/agents/hr-voice/realtime-session', { method: 'POST', body: { appContext: 'talk-to-atlas' } });
    const token = session?.client_secret?.value || session?.value;
    const rtcUrl = session?.rtcUrl;
    if (!session?.configured || !token || !rtcUrl) {
      setRealtimeReady(false);
      setRealtimeProvider('fallback');
      return false;
    }

    const pc = new RTCPeerConnection();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    const audio = audioRef.current || document.createElement('audio');
    audio.autoplay = true;
    audioRef.current = audio;
    pc.ontrack = (event) => { audio.srcObject = event.streams[0]; };

    const dc = pc.createDataChannel('oai-events');
    dc.onopen = () => {
      setIsRealtimeConnected(true);
      setIsListening(true);
      setVoiceState('listening');
      setVoiceTranscript('Azure OpenAI voice session is live. Speak to ATLAS.');
    };
    dc.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const text = data?.transcript || data?.delta || data?.text || data?.item?.content?.[0]?.text;
        if (text) setVoiceTranscript(String(text).slice(0, 220));
        if (data?.type?.includes?.('response.audio_transcript.done') && data?.transcript) {
          setMessages(prev => [...prev, { from: 'bot', text: data.transcript }]);
        }
        if (data?.type?.includes?.('input_audio_buffer.speech_started')) setVoiceState('listening');
        if (data?.type?.includes?.('response.created')) setVoiceState('thinking');
        if (data?.type?.includes?.('response.done')) setVoiceState('listening');
      } catch { /* ignore non-json realtime events */ }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    const sdpResponse = await fetch(rtcUrl, {
      method: 'POST',
      body: offer.sdp,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/sdp' },
    });
    if (!sdpResponse.ok) throw new Error('Could not connect Azure OpenAI voice session.');
    await pc.setRemoteDescription({ type: 'answer', sdp: await sdpResponse.text() });

    peerRef.current = pc;
    streamRef.current = stream;
    dataChannelRef.current = dc;
    setRealtimeReady(true);
    setRealtimeProvider(session.provider || 'azure-openai');
    return true;
  }, [apiFetch]);

  useEffect(() => () => disconnectRealtime(), [disconnectRealtime]);

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
      stopModeRef.current = 'listening';
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
      stopModeRef.current = 'idle';
    };

    recognition.onend = () => {
      setIsListening(false);
      const finalText = lastFinalTranscript.current.trim();
      const shouldCancel = stopModeRef.current === 'cancel';
      stopModeRef.current = 'idle';
      if (shouldCancel) {
        setVoiceTranscript('Voice stopped. Tap the ATLAS mic when you are ready again.');
        setVoiceState('ready');
        return;
      }
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
    apiFetch('/agents/hr-voice/realtime-session', { method: 'POST', body: { probe: true } })
      .then((data) => {
        setRealtimeReady(!!data?.configured);
        setRealtimeProvider(data?.provider || 'fallback');
      })
      .catch(() => setRealtimeReady(false));
  }, [apiFetch, realtimeReady, tab]);

  const startVoice = async () => {
    setAtlasExpanded(true);
    if (isRealtimeConnected) return;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setVoiceTranscript('');
    try {
      const connected = await connectRealtime();
      if (connected) return;
    } catch (err) {
      setRealtimeReady(false);
      setRealtimeProvider('fallback');
    }
    if (!voiceSupported || !recognitionRef.current) {
      show('Voice recognition is not available in this browser', 'error');
      setVoiceState('ready');
      return;
    }
    try { recognitionRef.current.start(); }
    catch { setVoiceState('listening'); }
  };

  const stopVoice = () => {
    stopModeRef.current = 'cancel';
    disconnectRealtime();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    try { recognitionRef.current?.abort?.(); }
    catch {
      try { recognitionRef.current?.stop?.(); }
      catch { /* already stopped */ }
    }
    setIsListening(false);
    setVoiceState('ready');
    setVoiceTranscript('Voice stopped. Tap the ATLAS mic when you are ready again.');
  };

  const submitFeedback = async () => {
    if (!rating) { show('Please tap a star rating', 'error'); return; }
    try {
      await apiFetch('/feedback', { method: 'POST', body: { text: `[Talk to ATLAS] ${rating}/5. ${feedback}`, rating, agent: 'talk-to-atlas' } });
      show('Thank you for your feedback', 'success');
      setRating(0); setFeedback('');
    } catch { show('Could not submit', 'error'); }
  };

  const ChatConsole = ({ compact = false }) => (
    <div className={`voice-chat ${compact ? 'compact' : ''}`}>
      <div className="ch">
        <div className="status-dot" />
        <div className="nm">Talk to ATLAS</div>
        <div className="tg">{voiceState === 'thinking' ? 'Thinking' : isRealtimeConnected ? 'Realtime' : 'Online'}</div>
      </div>
      <div className="chat-msgs" ref={chatRef}>
        {messages.map((m, i) => <div key={`${m.from}-${i}`} className={`bubble ${m.from === 'bot' ? 'bot' : 'usr'}`}>{m.text}</div>)}
      </div>
      {!compact && (
        <div className="qq-chips">
          {ORCHESTRATION_CHIPS.map(q => <button key={q} className="qq" onClick={() => send(q)}>{q}</button>)}
        </div>
      )}
      <div className="chat-bar">
        <input placeholder="Ask ATLAS to answer, navigate, or hand off..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
        <button className="send-btn" onClick={() => send()}><IconSend /></button>
      </div>
    </div>
  );

  if (!app) return null;

  return (
    <div className="page-enter"><div className="content">
      <div className="subh">
        <button className="back-btn" onClick={() => navigate(-1)}><IconChevLeft /></button>
        <h1>Talk to <em>ATLAS</em></h1>
      </div>

      <div className="voice-hero atlas-voice-hero">
        <div className="atlas-core"><IconGrid /><span /><span /></div>
        <h2>Talk to ATLAS</h2>
        <p>One orchestration layer for answers, navigation, app actions, and specialist agent handoffs.</p>
      </div>

      <div className="voice-tabs">
        <button className={`vtab ${tab === 'chat' ? 'on' : ''}`} onClick={() => setTab('chat')}><IconChat /> Chat</button>
        <button className={`vtab ${tab === 'voice' ? 'on' : ''}`} onClick={() => setTab('voice')}><IconMic /> Voice</button>
        <button className={`vtab ${tab === 'call' ? 'on' : ''}`} onClick={() => setTab('call')}><IconPhone /> Call</button>
      </div>

      {tab === 'chat' && <ChatConsole />}

      {tab === 'voice' && (
        <div className="voice-live-wrap">
          <div className={`voice-live-card atlas-live-card ${atlasExpanded ? 'is-expanded' : 'is-docked'} agent-atlas`}>
            <div className="atlas-liquid-field" aria-hidden="true"><span /><span /><span /></div>
            <button className={`voice-orb atlas-orb ${isListening ? 'is-listening' : ''} ${voiceState === 'speaking' ? 'is-speaking' : ''} ${voiceState === 'thinking' || voiceState === 'connecting' ? 'is-thinking' : ''}`} onClick={isListening || isRealtimeConnected ? stopVoice : startVoice} aria-label="Start or stop Talk to ATLAS voice">
              <IconMic />
              <i /><i /><i /><b /><b /><em /><em />
            </button>
            <div className="voice-kicker"><IconPulse /> {realtimeProvider === 'azure-openai' ? 'Azure OpenAI realtime' : 'ATLAS voice orchestration'}</div>
            <h3>{voiceState === 'connecting' ? 'Connecting to Azure voice' : voiceState === 'listening' ? 'ATLAS is actively listening' : voiceState === 'thinking' ? 'Routing to the right agent' : voiceState === 'speaking' ? 'ATLAS is responding' : 'Tap the floating ATLAS mic'}</h3>
            <p>Speak naturally: “open leave”, “go to kudos”, “enable HR voice agent”, or ask a policy question.</p>
            <div className="voice-transcript">{voiceTranscript || 'Try: “Talk to ATLAS, open Leave and check my balance.”'}</div>
            <div className="voice-actions">
              <button className="btn btn-brand" onClick={startVoice} disabled={isListening || isRealtimeConnected}>{isListening || isRealtimeConnected ? 'Listening...' : 'Start voice'}</button>
              <button className="btn btn-outline" onClick={stopVoice}>Stop</button>
            </div>
            <div className={`voice-support ${voiceSupported || realtimeReady ? 'ok' : 'warn'}`}>
              {realtimeReady ? `${realtimeProvider} configured` : 'Browser voice fallback'} · {isRealtimeConnected ? 'Live session active' : 'Ready'}
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

      <div className="sh" style={{ padding: '0 24px 4px' }}><h2>What ATLAS can <em>orchestrate</em></h2></div>
      <div className="atlas-cap-grid">
        {ATLAS_CAPABILITIES.map((item) => (
          <div className="atlas-cap" key={item.label}><div><IconBolt /></div><strong>{item.label}</strong><span>{item.text}</span></div>
        ))}
      </div>

      <div className="voice-fb">
        <h4>Rate your experience</h4>
        <div className="vfs">Help us improve Talk to ATLAS</div>
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
