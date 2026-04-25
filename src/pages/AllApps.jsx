import { useNavigate } from 'react-router-dom';
import { APPS } from '../data/registry';
import AppCard from '../components/AppCard';
import { IconChevLeft } from '../components/Icons';

export default function AllApps() {
  const navigate = useNavigate();
  return (
    <div className="page-enter"><div className="content">
      <div className="subh">
        <button className="back-btn" onClick={() => navigate('/')}><IconChevLeft /></button>
        <h1>All <em>Apps & Agents</em></h1>
      </div>
      <div className="app-list">{APPS.map(a => <AppCard key={a.id} app={a} />)}</div>
    </div></div>
  );
}
