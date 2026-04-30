import AtlasLogo, { AtlasIcon } from './AtlasLogo';

const ATLAS_STEPS = [
  { letter: 'A', word: 'App' },
  { letter: 'T', word: 'To' },
  { letter: 'L', word: 'Locate' },
  { letter: 'A', word: 'Access' },
  { letter: 'S', word: 'Share' },
];

export default function LoadingOverlay({ visible, text = 'Signing you in', sub = 'Connecting securely…' }) {
  return (
    <div className={`auth-overlay ${visible ? 'on' : ''}`}>
      <div className="atlas-loader">
        <div className="atlas-orbit atlas-orbit-one" />
        <div className="atlas-orbit atlas-orbit-two" />
        <AtlasIcon size={76} className="atlas-loader-icon" />
      </div>
      <AtlasLogo variant="loading" size="lg" className="atlas-loader-wordmark" />
      <div className="atlas-meaning" aria-label="ATLAS means App To Locate Access Share">
        {ATLAS_STEPS.map((step) => (
          <div className="atlas-step" key={`${step.letter}-${step.word}`}>
            <span>{step.letter}</span>
            <strong>{step.word}</strong>
          </div>
        ))}
      </div>
      <div className="ao-text">{text}</div>
      <div className="ao-sub">{sub}</div>
      <div className="ao-dots"><span /><span /><span /></div>
    </div>
  );
}
