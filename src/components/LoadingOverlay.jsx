import { IconLayers } from './Icons';

export default function LoadingOverlay({ visible, text = 'Signing you in', sub = 'Connecting securely…' }) {
  return (
    <div className={`auth-overlay ${visible ? 'on' : ''}`}>
      <div className="ao-mark">
        <IconLayers />
      </div>
      <div className="ao-text">{text}</div>
      <div className="ao-sub">{sub}</div>
      <div className="ao-dots"><span /><span /><span /></div>
    </div>
  );
}
