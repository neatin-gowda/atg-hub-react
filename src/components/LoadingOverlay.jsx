import { AtlasIcon } from './AtlasLogo';

export default function LoadingOverlay({ visible, text = 'Signing you in', sub = 'Connecting securely…' }) {
  return (
    <div className={`auth-overlay ${visible ? 'on' : ''}`}>
      <AtlasIcon size={72} style={{ marginBottom: 20, animation: 'aoPulse 1.6s ease-in-out infinite' }} />
      <div className="ao-text">{text}</div>
      <div className="ao-sub">{sub}</div>
      <div className="ao-dots"><span /><span /><span /></div>
    </div>
  );
}
