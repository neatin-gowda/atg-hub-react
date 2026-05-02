import { useLocation, useNavigate } from 'react-router-dom';
import { IconHome, IconGrid, IconMic, IconStar, IconUser } from './Icons';

const TABS = [
  { path: '/', icon: IconHome, label: 'Home' },
  { path: '/apps', icon: IconGrid, label: 'Apps' },
  { path: '/app/hr-voice', icon: IconMic, label: 'ATLAS' },
  { path: '/kudos/give', icon: IconStar, label: 'Kudos' },
  { path: '/profile', icon: IconUser, label: 'You' },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bnav">
      <div className="bnav-inner">
        {TABS.map(t => {
          const active = t.path === '/' ? pathname === '/' : pathname.startsWith(t.path);
          return (
            <button key={t.path} className={`ni ${active ? 'on' : ''}`} onClick={() => { navigate(t.path); if (navigator.vibrate) navigator.vibrate(5); }}>
              <t.icon />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
