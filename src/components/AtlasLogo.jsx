/* ATLAS Logo - refined wordmark and monogram for dark/light themes. */

const V = {
  dark:     { primary: '#FFFFFF', accent: '#DE6211', detail: 'rgba(255,255,255,0.42)' },
  light:    { primary: '#011B58', accent: '#DE6211', detail: 'rgba(1,27,88,0.34)' },
  onOrange: { primary: '#FFFFFF', accent: '#011B58', detail: 'rgba(255,255,255,0.46)' },
  loading:  { primary: '#FFFFFF', accent: 'rgba(255,255,255,0.72)', detail: 'rgba(255,255,255,0.28)' },
};

const SIZES = { xs: 20, sm: 30, md: 42, lg: 52, xl: 72 };

export default function AtlasLogo({ height, size = 'md', variant = 'dark', style = {}, className = '' }) {
  const h = height || SIZES[size] || 42;
  const { primary, accent, detail } = V[variant] || V.dark;
  const w = h * 4.7;

  return (
    <svg viewBox="0 0 470 100" width={w} height={h} className={className} style={{ display: 'block', ...style }} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ATLAS">
      <text
        x="0"
        y="70"
        fill={primary}
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize="72"
        fontWeight="600"
        letterSpacing="12"
      >
        ATL
      </text>
      <text
        x="282"
        y="70"
        fill={accent}
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize="72"
        fontWeight="600"
        letterSpacing="12"
      >
        AS
      </text>
      <path d="M6 88 H424" stroke={detail} strokeWidth="2" strokeLinecap="round" />
      <path d="M300 88 H424" stroke={accent} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* Brand text — "ATLAS" in styled font, used below the icon on login */
export function AtlasTitle({ variant = 'dark', style = {} }) {
  const color1 = variant === 'light' ? '#011B58' : '#FFFFFF';
  const color2 = '#DE6211';
  return (
    <div style={{ textAlign: 'center', fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 600, letterSpacing: 3, lineHeight: 1, ...style }}>
      <span style={{ color: color1 }}>ATL</span>
      <span style={{ color: color2 }}>AS</span>
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
      <svg viewBox="0 0 100 100" width={size * 0.58} height={size * 0.58} style={{ zIndex: 1 }} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ATLAS icon">
        <path d="M18 80 L45 20 Q47 16 50 16 Q53 16 55 20 L82 80" fill="none" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M34 58 H66" stroke="rgba(255,255,255,.74)" strokeWidth="7" strokeLinecap="round" />
        <path d="M40 80 H60" stroke="#011B58" strokeWidth="5" strokeLinecap="round" opacity=".72" />
      </svg>
    </div>
  );
}
