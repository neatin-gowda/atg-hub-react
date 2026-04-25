const VARIANTS = {
  onOrange: { main: '#FFFFFF', detail: '#011B58' },
  dark:     { main: '#FFFFFF', detail: '#DE6211' },
  light:    { main: '#011B58', detail: '#DE6211' },
  white:    { main: '#FFFFFF', detail: 'rgba(255,255,255,0.5)' },
};

const SIZES = { sm: 24, md: 36, lg: 64, xl: 128 };

export default function AtlasLogo({ height, size = 'md', variant = 'dark', style = {}, className = '' }) {
  const h = height || SIZES[size] || 36;
  const { main, detail } = VARIANTS[variant] || VARIANTS.dark;
  const w = h * 4.5;

  return (
    <svg viewBox="0 0 540 120" width={w} height={h} className={className} style={{ display: 'block', ...style }} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ATLAS">
      <g fill="none" stroke={main} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="24" y1="100" x2="50" y2="10"/>
        <line x1="76" y1="100" x2="50" y2="10"/>
        <line x1="32" y1="62" x2="68" y2="62"/>
      </g>
      <g fill="none" stroke={main} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="100" y1="10" x2="170" y2="10"/>
        <line x1="135" y1="10" x2="135" y2="100"/>
      </g>
      <g fill="none" stroke={main} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="200" y1="10" x2="200" y2="100"/>
        <line x1="200" y1="100" x2="260" y2="100"/>
        <circle cx="200" cy="100" r="6" stroke={detail} strokeWidth="2.5" fill="none"/>
        <line x1="195" y1="100" x2="205" y2="100" stroke={detail} strokeWidth="2.5"/>
        <line x1="200" y1="95" x2="200" y2="105" stroke={detail} strokeWidth="2.5"/>
      </g>
      <g fill="none" stroke={main} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="294" y1="100" x2="320" y2="10"/>
        <line x1="346" y1="100" x2="320" y2="10"/>
        <line x1="302" y1="62" x2="338" y2="62"/>
        <rect x="312" y="56" width="16" height="12" fill="none" stroke={detail} strokeWidth="2.5" rx="1.5"/>
        <circle cx="329" cy="62" r="3" fill={detail}/>
        <line x1="332" y1="62" x2="338" y2="62" stroke={detail} strokeWidth="2.5"/>
      </g>
      <g fill="none" stroke={main} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M460,28 C460,16 448,10 433,10 C416,10 405,18 405,32 C405,44 416,48 433,55 C450,62 461,68 461,82 C461,94 449,102 433,102 C416,102 403,93 403,80"/>
        <circle cx="433" cy="10" r="3" fill={detail}/>
        <circle cx="433" cy="55" r="3" fill={detail}/>
        <circle cx="433" cy="102" r="3" fill={detail}/>
        <line x1="427" y1="8" x2="419" y2="2" stroke={detail} strokeWidth="2.5"/>
        <line x1="439" y1="8" x2="447" y2="2" stroke={detail} strokeWidth="2.5"/>
        <line x1="427" y1="104" x2="419" y2="110" stroke={detail} strokeWidth="2.5"/>
        <line x1="439" y1="104" x2="447" y2="110" stroke={detail} strokeWidth="2.5"/>
      </g>
    </svg>
  );
}

export function AtlasIcon({ size = 56, className = '', style = {} }) {
  return (
    <div className={className} style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: 'linear-gradient(135deg, #F07A2A, #DE6211, #B84E0D)',
      display: 'grid', placeItems: 'center',
      boxShadow: '0 8px 28px rgba(222,98,17,.35)',
      position: 'relative', overflow: 'hidden', ...style
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,.25), transparent 50%)' }}/>
      <AtlasLogo height={size * 0.4} variant="onOrange" style={{ zIndex: 1 }}/>
    </div>
  );
}
