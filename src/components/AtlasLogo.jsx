/* ATLAS Logo - refined wordmark and monogram for dark/light themes. */

const V = {
  dark:     { primary: '#FFFFFF', accent: '#DE6211' },
  light:    { primary: '#011B58', accent: '#DE6211' },
  onOrange: { primary: '#FFFFFF', accent: '#FFFFFF' },
  loading:  { primary: '#FFFFFF', accent: '#FFFFFF' },
};

const SIZES = { xs: 20, sm: 30, md: 42, lg: 52, xl: 72 };

export default function AtlasLogo({ height, size = 'md', variant = 'dark', style = {}, className = '' }) {
  const h = height || SIZES[size] || 42;
  const { primary, accent } = V[variant] || V.dark;
  const isPlain = variant === 'loading' || variant === 'onOrange';

  return (
    <div
      className={`atlas-wordmark ${className}`}
      style={{
        '--atlas-size': `${h}px`,
        '--atlas-at': isPlain ? primary : accent,
        '--atlas-las': primary,
        ...style,
      }}
      role="img"
      aria-label="ATLAS"
    >
      <span>AT</span><strong>LAS</strong>
    </div>
  );
}

/* Brand text — "ATLAS" in styled font, used below the icon on login */
export function AtlasTitle({ variant = 'dark', tone = 'split', style = {} }) {
  const color1 = tone === 'plain' ? '#FFFFFF' : '#DE6211';
  const color2 = tone === 'plain' ? '#FFFFFF' : (variant === 'light' ? '#011B58' : '#FFFFFF');
  return (
    <div style={{ textAlign: 'center', fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 600, letterSpacing: 2, lineHeight: 1, whiteSpace: 'nowrap', ...style }}>
      <span style={{ color: color1 }}>AT</span>
      <span style={{ color: color2 }}>LAS</span>
    </div>
  );
}

/* Square icon - quiet premium monogram for compact spaces. */
export function AtlasIcon({ size = 56, className = '', style = {} }) {
  return (
    <div className={className} style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: 'linear-gradient(135deg, #F07A2A, #DE6211, #B84E0D)',
      display: 'grid', placeItems: 'center',
      boxShadow: '0 10px 32px rgba(222,98,17,.35)',
      position: 'relative', overflow: 'hidden', ...style
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,.25), transparent 50%)' }}/>
      <svg viewBox="0 0 100 100" width={size * 0.62} height={size * 0.62} style={{ zIndex: 1 }} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ATLAS icon">
        <path d="M18 80 L44 22 Q46.5 16 50 16 Q53.5 16 56 22 L82 80" fill="none" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M34 58 H66" stroke="rgba(255,255,255,.82)" strokeWidth="7" strokeLinecap="round" />
      </svg>
    </div>
  );
}
