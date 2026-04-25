import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { getConfig } from '../config';
import { AI_AGENTS, HR_APPS, INTERNAL_APPS, SEED_ANNOUNCEMENTS, SEED_KUDOS } from '../data/registry';
import Avatar, { getInitials } from '../components/Avatar';
import AppCard from '../components/AppCard';
import Carousel from '../components/Carousel';
import AtlasLogo from '../components/AtlasLogo';
import { IconSun, IconMoon, IconHeart, IconPulse, IconBolt, IconHelp } from '../components/Icons';

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'now'; if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`; return `${Math.floor(s / 86400)}d`;
}

const ANN_IMG = [
  '/assets/images/announcements/ann-1-copilot.jpg',
  '/assets/images/announcements/ann-2-cowork.jpg',
  '/assets/images/announcements/ann-3-agents.jpg',
];

export default function Home() {
  const { user, apiFetch } = useAuth();
  const { theme, toggle } = useTheme();
  const { show } = useToast();
  const navigate = useNavigate();
  const cfg = getConfig();
  const [announcements, setAnnouncements] = useState(SEED_ANNOUNCEMENTS);
  const [kudos, setKudos] = useState(SEED_KUDOS);
  const [stats, setStats] = useState({ given: 0 });

  useEffect(() => {
    (async () => {
      const [ann, kud, sta] = await Promise.allSettled([
        apiFetch('/announcements'), apiFetch('/kudos'), apiFetch('/me/stats'),
      ]);
      if (ann.status === 'fulfilled' && ann.value?.length) setAnnouncements(ann.value);
      if (kud.status === 'fulfilled' && kud.value?.length) setKudos(kud.value);
      if (sta.status === 'fulfilled' && sta.value) setStats(sta.value);
    })();
  }, [apiFetch]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="page-enter">
      <div className="content">
        <div className="brand-strip">
          <div className="logo">
            <AtlasLogo size="sm" variant={theme === 'dark' ? 'dark' : 'light'} />
          </div>
          <button className="theme-btn" onClick={toggle} title="Toggle theme">
            {theme === 'dark' ? <IconSun /> : <IconMoon />}
          </button>
        </div>
        <header className="header">
          <div className="greeting">
            <div className="date">{dateStr}</div>
            <div className="name">{greeting}, <em>{user?.name?.split(' ')[0]}</em></div>
          </div>
          <Avatar name={user?.name} size="md" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, var(--bg3), var(--bg4))', color: 'var(--accent)', border: '1.5px solid var(--bd2)' }} onClick={() => navigate('/profile')} />
        </header>
        <div className="stagger">
          <Carousel />
          <div className="sh"><h2>AI <em>Hub</em></h2><a onClick={() => navigate('/apps/agents')}>See all →</a></div>
          <div className="app-list">{AI_AGENTS.slice(0, 3).map(a => <AppCard key={a.id} app={a} />)}</div>
          <div className="sh"><h2>HR <em>Engagement</em></h2><a onClick={() => navigate('/apps/hr')}>See all →</a></div>
          <div className="app-list">{HR_APPS.slice(0, 2).map(a => <AppCard key={a.id} app={a} />)}</div>
          <div className="sh"><h2>Internal <em>Apps</em></h2><a onClick={() => navigate('/apps/internal')}>See all →</a></div>
          <div className="app-list">{INTERNAL_APPS.slice(0, 2).map(a => <AppCard key={a.id} app={a} />)}</div>
          <div className="sh"><h2>Wellbeing</h2></div>
          <div className="wb-grid">
            <div className="wb" onClick={() => show('Opening mindfulness…')}><div className="wi ic-wellbeing"><IconHeart width="18" height="18" /></div><h4>Mindfulness</h4><div className="ws">5-min guided session</div></div>
            <div className="wb" onClick={() => show('Quick pulse check…')}><div className="wi ic-onboard"><IconPulse width="18" height="18" /></div><h4>Pulse Check</h4><div className="ws">How are you today?</div></div>
            <div className="wb" onClick={() => show('Fitness challenge active!')}><div className="wi ic-data"><IconBolt width="18" height="18" /></div><h4>Fitness Challenge</h4><div className="ws">Team competition</div></div>
            <div className="wb" onClick={() => show('Opening support portal…')}><div className="wi ic-finance"><IconHelp width="18" height="18" /></div><h4>EAP Support</h4><div className="ws">Confidential counselling</div></div>
          </div>
          <div className="sh"><h2>Announcements</h2></div>
          <div className="ann-list">
            {announcements.slice(0, 4).map((a, i) => (
              <div className="ann-card" key={i}>
                <div className="ann-img"><img src={ANN_IMG[i % ANN_IMG.length]} alt="" loading="lazy" /><span className="ann-badge">{a.category || 'News'}</span></div>
                <div className="ann-body"><h3>{a.title}</h3><p>{a.body}</p>
                  <div className="ann-meta"><div className="author"><div className="av av-sm" style={{ width: 18, height: 18, fontSize: 8, background: 'var(--gbrand)', color: '#fff' }}>{getInitials(a.author_name)}</div><span>{a.author_name}</span></div><span style={{ fontSize: 10, color: 'var(--t4)' }}>{timeAgo(a.created_at)}</span></div>
                </div>
              </div>
            ))}
          </div>
          <div className="sh"><h2>Kudos <em>Feed</em></h2><a onClick={() => navigate('/kudos/give')}>Give →</a></div>
          <div className="kudos-feed">
            {kudos.slice(0, 5).map((k, i) => (
              <div className="kudo" key={i}>
                <div className="kh"><div className="av av-sm kav">{getInitials(k.from_name)}</div><div className="kwho"><strong>{k.from_name}</strong> → <em>{k.to_name}</em></div><div className="kt">{timeAgo(k.created_at)}</div></div>
                <div className="km">"{k.message}"</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
