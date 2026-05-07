type Props = { size?: number; className?: string };

export default function ShieldLogo({ size = 360, className }: Props) {
  const h = size * (480 / 400);
  return (
    <svg viewBox="0 0 400 480" width={size} height={h} className={className}>
      <defs>
        <linearGradient id="rGoldStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F8E7A1" />
          <stop offset="45%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8C6B16" />
        </linearGradient>
        <linearGradient id="rShieldFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0F4A38" />
          <stop offset="100%" stopColor="#062018" />
        </linearGradient>
        <linearGradient id="rQuartRed" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5a1a1a" />
          <stop offset="100%" stopColor="#3a0e0e" />
        </linearGradient>
        <linearGradient id="rGoldFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F4D87A" />
          <stop offset="55%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#9A7421" />
        </linearGradient>
        <radialGradient id="rInnerGlow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="rgba(212,175,55,0.18)" />
          <stop offset="100%" stopColor="rgba(212,175,55,0)" />
        </radialGradient>
        <filter id="rGoldGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <clipPath id="rShieldClip">
          <path d="M200 30 L370 80 Q370 280 200 450 Q30 280 30 80 Z" />
        </clipPath>
      </defs>

      {/* Shield */}
      <path d="M200 30 L370 80 Q370 280 200 450 Q30 280 30 80 Z" fill="url(#rShieldFill)" stroke="url(#rGoldStroke)" strokeWidth="8" />
      <g clipPath="url(#rShieldClip)">
        <rect x="30" y="30" width="170" height="200" fill="url(#rQuartRed)" />
        <rect x="200" y="230" width="170" height="220" fill="url(#rQuartRed)" />
        <rect x="0" y="0" width="400" height="480" fill="url(#rInnerGlow)" />
      </g>
      <path d="M200 50 L355 92 Q355 275 200 430 Q45 275 45 92 Z" fill="none" stroke="url(#rGoldStroke)" strokeWidth="2.5" opacity="0.85" />

      {/* Bear (top-left) */}
      <g transform="translate(78,110)" fill="url(#rGoldFill)" filter="url(#rGoldGlow)">
        <path d="M5,40 C5,18 25,8 40,10 C46,2 56,2 60,8 C70,8 78,16 78,28 L82,30 L86,28 C90,28 92,32 90,36 L86,38 L86,46 C92,46 98,52 98,58 L98,62 L92,62 L92,66 L86,66 L86,62 L40,62 L40,66 L34,66 L34,62 L28,62 L28,66 L22,66 L22,60 C12,58 5,52 5,40 Z" />
      </g>

      {/* Bull (top-right) */}
      <g transform="translate(220,100)" fill="url(#rGoldFill)" filter="url(#rGoldGlow)">
        <path d="M2,30 L8,22 L14,28 L18,18 L26,26 C30,16 38,12 48,14 C56,8 66,10 70,18 L82,16 L78,26 L84,30 C90,30 96,36 96,42 L100,52 L94,52 L94,60 L88,60 L88,72 L82,72 L82,60 L52,60 L52,72 L46,72 L46,60 L40,60 L40,52 C32,50 26,46 22,40 C16,42 8,38 4,34 Z" />
      </g>

      {/* S monogram */}
      <text x="200" y="285" textAnchor="middle" fontFamily="Georgia,'Times New Roman',serif" fontWeight="700" fontSize="180" fill="url(#rGoldFill)" stroke="#3a2a08" strokeWidth="2">S</text>

      {/* Arrow up (lower-left) */}
      <g stroke="url(#rGoldFill)" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <line x1="92" y1="350" x2="150" y2="288" />
        <polyline points="132,288 150,288 150,306" />
      </g>

      {/* Candlesticks (lower-right) */}
      <line x1="252" y1="298" x2="252" y2="370" stroke="url(#rGoldFill)" strokeWidth="2" />
      <rect x="244" y="312" width="16" height="40" fill="#7a1a1a" stroke="url(#rGoldFill)" strokeWidth="1.5" />
      <line x1="284" y1="285" x2="284" y2="375" stroke="url(#rGoldFill)" strokeWidth="2" />
      <rect x="276" y="300" width="16" height="55" fill="#7a1a1a" stroke="url(#rGoldFill)" strokeWidth="1.5" />

      {/* Banner */}
      <path d="M50,400 L60,392 L120,398 L200,392 L280,398 L340,392 L350,400 L335,418 L350,432 L290,438 L200,432 L110,438 L50,432 L65,418 Z" fill="#0B1F19" stroke="url(#rGoldStroke)" strokeWidth="3" />
      <text x="200" y="425" textAnchor="middle" fontFamily="Georgia,'Times New Roman',serif" fontWeight="700" fontSize="26" letterSpacing="3" fill="url(#rGoldFill)">SKILLPIPS</text>
    </svg>
  );
}
