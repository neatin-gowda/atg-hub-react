/* ATLAS Logo — Bold filled letters + iconic details
   Variants: dark (white+orange), light (navy+orange), onOrange (white+navy), loading (white+white dim)
*/

const V = {
  dark:     { at: '#FFFFFF', las: '#FFFFFF', detail: '#DE6211' },
  light:    { at: '#DE6211', las: '#011B58', detail: '#011B58' },
  onOrange: { at: '#FFFFFF', las: '#FFFFFF', detail: '#011B58' },
  loading:  { at: '#FFFFFF', las: 'rgba(255,255,255,0.4)', detail: 'rgba(255,255,255,0.3)' },
};

const SIZES = { xs: 20, sm: 30, md: 42, lg: 52, xl: 72 };

export default function AtlasLogo({ height, size = 'md', variant = 'dark', style = {}, className = '' }) {
  const h = height || SIZES[size] || 42;
  const { at, las, detail } = V[variant] || V.dark;
  const w = h * 5.2;

  return (
    <svg viewBox="0 0 520 100" width={w} height={h} className={className} style={{ display: 'block', ...style }} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ATLAS">
      {/* A — filled bold */}
      <path d="M5 88 L35 12 Q37 8 40 8 L42 8 Q45 8 47 12 L77 88 Q78 90 76 92 L68 92 Q66 92 65 88 L58 72 L24 72 L17 88 Q16 92 14 92 L6 92 Q4 92 5 88 Z M28 62 L54 62 L41 26 Z" fill={at}/>

      {/* T — filled bold */}
      <path d="M92 8 L168 8 Q172 8 172 12 L172 18 Q172 22 168 22 L136 22 L136 88 Q136 92 132 92 L128 92 Q124 92 124 88 L124 22 L92 22 Q88 22 88 18 L88 12 Q88 8 92 8 Z" fill={at}/>

      {/* L — filled bold + locate crosshair */}
      <path d="M194 8 Q194 4 198 4 L202 4 Q206 4 206 8 L206 78 L252 78 Q256 78 256 82 L256 86 Q256 90 252 90 L198 90 Q194 90 194 86 Z" fill={las}/>
      <circle cx="198" cy="86" r="9" stroke={detail} strokeWidth="3" fill="none"/>
      <line x1="189" y1="86" x2="207" y2="86" stroke={detail} strokeWidth="3" strokeLinecap="round"/>
      <line x1="198" y1="77" x2="198" y2="95" stroke={detail} strokeWidth="3" strokeLinecap="round"/>

      {/* A — filled bold + access key */}
      <path d="M270 88 L300 12 Q302 8 305 8 L307 8 Q310 8 312 12 L342 88 Q343 90 341 92 L333 92 Q331 92 330 88 L323 72 L289 72 L282 88 Q281 92 279 92 L271 92 Q269 92 270 88 Z M293 62 L319 62 L306 26 Z" fill={las}/>
      <rect x="299" y="56" width="14" height="10" rx="2" fill="none" stroke={detail} strokeWidth="3"/>
      <circle cx="314" cy="62" r="3.5" fill={detail}/>
      <line x1="317" y1="62" x2="323" y2="62" stroke={detail} strokeWidth="3" strokeLinecap="round"/>

      {/* S — filled bold + share nodes */}
      <path d="M385 26 Q385 8 405 8 L435 8 Q455 8 455 26 L455 32 Q455 46 435 46 L405 46 Q395 46 395 56 L395 64 Q395 78 405 78 L435 78 Q455 78 455 90 L450 90 Q450 90 405 90 Q385 90 385 72 L385 64 Q385 50 405 50 L435 50 Q445 50 445 40 L445 32 Q445 22 435 22 L405 22 Q395 22 395 32 L395 38 Q395 42 391 42 L389 42 Q385 42 385 38 Z" fill={las}/>
      <circle cx="450" cy="14" r="5" fill={detail}/>
      <circle cx="464" cy="8" r="4.5" fill={detail}/>
      <circle cx="476" cy="14" r="4" fill={detail}/>
      <line x1="450" y1="14" x2="464" y2="8" stroke={detail} strokeWidth="3" strokeLinecap="round"/>
      <line x1="464" y1="8" x2="476" y2="14" stroke={detail} strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

/* Brand text — "ATLAS" in styled font, used below the icon on login */
export function AtlasTitle({ variant = 'dark', style = {} }) {
  const color1 = variant === 'light' ? '#DE6211' : '#FFFFFF';
  const color2 = variant === 'light' ? '#011B58' : '#DE6211';
  return (
    <div style={{ textAlign: 'center', fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 600, letterSpacing: 2, ...style }}>
      <span style={{ color: color1 }}>ATL</span>
      <span style={{ color: color2 }}>AS</span>
    </div>
  );
}

/* Square icon — orange gradient box with ATLAS logo inside */
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
      <AtlasLogo height={size * 0.35} variant="onOrange" style={{ zIndex: 1 }}/>
    </div>
  );
}
