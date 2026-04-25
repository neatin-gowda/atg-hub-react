import { useNavigate, useParams } from 'react-router-dom';
import { AI_AGENTS, HR_APPS, INTERNAL_APPS, ALL_APPS } from '../data/registry';
import AppCard from '../components/AppCard';
import { IconChevLeft } from '../components/Icons';

const SECTIONS = {
  agents: { title: 'AI', accent: 'Hub', data: AI_AGENTS },
  hr: { title: 'HR', accent: 'Engagement', data: HR_APPS },
  internal: { title: 'Internal', accent: 'Apps', data: INTERNAL_APPS },
  all: { title: 'All', accent: 'Apps & Agents', data: ALL_APPS },
};

export default function AllApps() {
  const navigate = useNavigate();
  const { category } = useParams();
  const section = SECTIONS[category] || SECTIONS.all;

  return (
    <div className="page-enter"><div className="content">
      <div className="subh">
        <button className="back-btn" onClick={() => navigate('/')}><IconChevLeft /></button>
        <h1>{section.title} <em>{section.accent}</em></h1>
      </div>

      {category && category !== 'all' ? (
        /* Single category view */
        <div className="app-list">
          {section.data.map(a => <AppCard key={a.id} app={a} />)}
        </div>
      ) : (
        /* All apps — segregated by type */
        <>
          <div className="sh"><h2>AI <em>Agents</em></h2></div>
          <div className="app-list">
            {AI_AGENTS.map(a => <AppCard key={a.id} app={a} />)}
          </div>

          <div className="sh"><h2>HR <em>Apps</em></h2></div>
          <div className="app-list">
            {HR_APPS.map(a => <AppCard key={a.id} app={a} />)}
          </div>

          <div className="sh"><h2>Internal <em>Apps</em></h2></div>
          <div className="app-list">
            {INTERNAL_APPS.map(a => <AppCard key={a.id} app={a} />)}
          </div>
        </>
      )}
    </div></div>
  );
}
