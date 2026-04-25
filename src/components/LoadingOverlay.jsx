import AtlasLogo from './AtlasLogo';

export default function LoadingOverlay({ visible, text = 'Signing you in', sub = 'Connecting securely…' }) {
  return (
    <div className={`auth-overlay ${visible ? 'on' : ''}`}>
      <div className="ao-mark" style={{ background: 'none', boxShadow: 'none', animation: 'aoPulse 1.6s ease-in-out infinite' }}>
        <AtlasLogo size="lg" variant="white" />
      </div>
      <div className="ao-text">{text}</div>
      <div className="ao-sub">{sub}</div>
      <div className="ao-dots"><span /><span /><span /></div>
    </div>
  );
}
