import { useNavigate } from 'react-router-dom';
import { AGENT_ICONS, IconChevRight } from './Icons';

export default function AppCard({ app }) {
  const navigate = useNavigate();
  const Icon = AGENT_ICONS[app.icon];

  return (
    <div className="card app-card" onClick={() => navigate(`/app/${app.id}`)}>
      <div className="head">
        <div className={`icon ic-${app.icon}`}>
          {Icon && <Icon />}
        </div>
        <div className="info">
          <div className="app-name">{app.name}</div>
          <div className="app-desc">{app.desc}</div>
        </div>
        <div className="chev"><IconChevRight /></div>
      </div>
      <div className="tags">
        {app.tags.map(t => (
          <span key={t} className={`tag ${t.startsWith('AI') ? 'tag-ai' : t === 'Live' ? 'tag-live' : t === 'Beta' ? 'tag-beta' : 'tag-int'}`}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
