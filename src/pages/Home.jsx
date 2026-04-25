import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { getConfig } from '../config';
import { APPS, SEED_ANNOUNCEMENTS, SEED_KUDOS } from '../data/registry';
import Avatar, { getInitials } from '../components/Avatar';
import AppCard from '../components/AppCard';
import Carousel from '../components/Carousel';
import { IconLayers, IconSun, IconMoon, IconHeart, IconPulse, IconBolt, IconHelp, IconCalendar, IconCard } from '../components/Icons';

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'now'; if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`; return `${Math.floor(s / 86400)}d`;
}

const ANN_IMG = [
  'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
  'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
  'https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
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
  const agents = APPS.filter(a => a.type === 'agent' || a.type === 'voice').slice(0, 3);
  const apps = APPS.filter(a => a.type === 'app').slice(0, 2);

  return (
    <div className="page-enter">
      <div className="content">
        <div className="brand-strip">
          <div className="logo">
            <div className="logo-mark"><IconLayers /></div>
            <div className="logo-text">{cfg.companyName}<em>{cfg.appName}</em></div>
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
          <Avatar name={user?.name} size="md" className="notif-wrap" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, var(--bg3), var(--bg4))', color: 'var(--accent)', border: '1.5px solid var(--bd2)' }} onClick={() => navigate('/profile')}>
            <div className="notif-dot" />
          </Avatar>
        </header>

        <div className="stagger">
          <Carousel />

          <div className="qstats">
            <div className="qs"><div className="n">8</div><div className="l">Apps live</div></div>
            <div className="qs"><div className="n">5</div><div className="l">AI agents</div></div>
            <div className="qs"><div className="n">{stats.given || 0}</div><div className="l">Kudos</div></div>
          </div>

          <div className="sh"><h2>AI <em>Agents</em></h2><a onClick={() => navigate('/apps')}>See all →</a></div>
          <div className="app-list">{agents.map(a => <AppCard key={a.id} app={a} />)}</div>

          <div className="sh"><h2>HR <em>Engagement</em></h2></div>
          <div className="hr-cards">
            <div className="hr-card" onClick={() => navigate('/leave')}>
              <div className="hr-icon ic-leave"><IconCalendar width="20" height="20" /></div>
              <h4>Leave Details</h4>
              <div className="hr-sub">Leave balance & requests</div>
              <div className="hr-badge hr-badge-pending">2 pending</div>
            </div>
            <div className="hr-card" onClick={() => show('April salary processed ✓', 'success')}>
              <div className="hr-icon ic-salary"><IconCard width="20" height="20" /></div>
              <h4>Salary Status</h4>
              <div className="hr-sub">April payroll processed</div>
              <div className="hr-badge hr-badge-ok">✓ Deposited</div>
            </div>
          </div>

          <div className="sh"><h2>Internal <em>Apps</em></h2></div>
          <div className="app-list">{apps.map(a => <AppCard key={a.id} app={a} />)}</div>

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
                <div className="ann-img">
                  <img src={ANN_IMG[i % ANN_IMG.length]} alt="" loading="lazy" />
                  <span className="ann-badge">{a.category || 'News'}</span>
                </div>
                <div className="ann-body">
                  <h3>{a.title}</h3>
                  <p>{a.body}</p>
                  <div className="ann-meta">
                    <div className="author">
                      <div className="av av-sm" style={{ width: 18, height: 18, fontSize: 8, background: 'var(--gbrand)', color: '#fff' }}>{getInitials(a.author_name)}</div>
                      <span>{a.author_name}</span>
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--t4)' }}>{timeAgo(a.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="sh"><h2>Kudos <em>Feed</em></h2><a onClick={() => navigate('/kudos/give')}>Give →</a></div>
          <div className="kudos-feed">
            {kudos.slice(0, 5).map((k, i) => (
              <div className="kudo" key={i}>
                <div className="kh">
                  <div className="av av-sm kav">{getInitials(k.from_name)}</div>
                  <div className="kwho"><strong>{k.from_name}</strong> → <em>{k.to_name}</em></div>
                  <div className="kt">{timeAgo(k.created_at)}</div>
                </div>
                <div className="km">"{k.message}"</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
