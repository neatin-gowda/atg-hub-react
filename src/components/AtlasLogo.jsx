/* ATLAS Logo — SVG component
   Orange (#DE6211) for A, T + icon elements
   Navy (#011B58) for L, A, S in dark mode → or white for dark backgrounds
   Props: height, variant ('dark' | 'light' | 'white')
*/

export default function AtlasLogo({ height = 32, variant = 'dark', style = {}, className = '' }) {
  const orange = '#DE6211';
  const secondary = variant === 'white' ? '#FFFFFF' : variant === 'light' ? '#011B58' : '#FFFFFF';
  const dotStroke = variant === 'white' ? '#FFFFFF' : orange;
  const h = height;
  const w = h * 5; // 5:1 aspect ratio

  return (
    <svg viewBox="0 0 500 100" width={w} height={h} className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      {/* A */}
      <path d="M30 85 L58 15 L62 15 L90 85 L78 85 L72 70 L48 70 L42 85 Z M52 60 L68 60 L60 35 Z" fill={orange} />
      
      {/* T */}
      <path d="M100 15 L160 15 L160 27 L136 27 L136 85 L124 85 L124 27 L100 27 Z" fill={orange} />
      
      {/* L */}
      <path d="M175 15 L187 15 L187 73 L230 73 L230 85 L175 85 Z" fill={secondary} />
      
      {/* Dot (keyhole/locate symbol between L and A) */}
      <circle cx="237" cy="75" r="6" fill="none" stroke={dotStroke} strokeWidth="2.5" />
      <circle cx="237" cy="75" r="2" fill={orange} />
      
      {/* A (with person/access triangle) */}
      <path d="M250 85 L278 15 L282 15 L310 85 L298 85 L292 70 L268 70 L262 85 Z M272 60 L288 60 L280 35 Z" fill={secondary} />
      {/* Person icon inside A */}
      <path d="M276 82 L280 72 L284 82 Z" fill={orange} />
      <circle cx="280" cy="68" r="3" fill={orange} />
      
      {/* S */}
      <path d="M330 30 Q330 15 350 15 L385 15 Q400 15 400 30 L400 40 Q400 50 385 50 L350 50 Q340 50 340 58 L340 68 Q340 73 350 73 L385 73 Q400 73 400 85 L350 85 Q330 85 330 70 L330 58 Q330 50 350 50" fill="none" stroke={secondary} strokeWidth="0" />
      {/* S - cleaner path */}
      <path d="M388 15 L345 15 Q325 15 325 32 L325 38 Q325 50 345 50 L375 50 Q390 50 390 62 L390 70 Q390 85 370 85 L330 85 L330 73 L370 73 Q378 73 378 68 L378 62 Q378 55 365 55 L345 55 Q325 55 325 42 L325 32 Q325 20 340 20 L340 15" fill={secondary} />

      {/* Share dots on S */}
      <circle cx="395" cy="22" r="4" fill={orange} />
      <circle cx="408" cy="15" r="3.5" fill={orange} />
      <circle cx="419" cy="22" r="3" fill={orange} />
      <line x1="395" y1="22" x2="408" y2="15" stroke={orange} strokeWidth="2" />
      <line x1="408" y1="15" x2="419" y2="22" stroke={orange} strokeWidth="2" />
    </svg>
  );
}

/* Small icon version — just the A mark with person */
export function AtlasIcon({ size = 56, className = '', style = {} }) {
  return (
    <div className={className} style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: 'linear-gradient(135deg, #F07A2A, #DE6211, #B84E0D)',
      display: 'grid', placeItems: 'center',
      boxShadow: '0 8px 28px rgba(222,98,17,.35)',
      position: 'relative', overflow: 'hidden',
      ...style
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,.25), transparent 50%)' }} />
      <svg viewBox="0 0 100 100" width={size * 0.55} height={size * 0.55} style={{ zIndex: 1 }}>
        {/* A letter */}
        <path d="M20 82 L46 18 L54 18 L80 82 L66 82 L60 65 L40 65 L34 82 Z M44 54 L56 54 L50 32 Z" fill="white" />
        {/* Person dot */}
        <circle cx="50" cy="60" r="3.5" fill="rgba(255,255,255,0.6)" />
        <path d="M44 75 L50 64 L56 75 Z" fill="rgba(255,255,255,0.6)" />
      </svg>
    </div>
  );
}
