import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import ShieldLogo from "./ShieldLogo";
import Particles from "./Particles";

// ── Scene boundaries (frames at 30fps) ──────────────────────
const S1_END = 75;   // 0 – 2.5 s
const S2_END = 150;  // 2.5 – 5 s
const S3_END = 210;  // 5 – 7 s
const S4_END = 270;  // 7 – 9 s
// S5: 270 – 315     // 9 – 10.5 s

const CANDLES = [
  { bullish: true,  startFrame: 5  },
  { bullish: true,  startFrame: 14 },
  { bullish: false, startFrame: 22 },
  { bullish: true,  startFrame: 30 },
  { bullish: true,  startFrame: 38 },
  { bullish: true,  startFrame: 46 },
  { bullish: false, startFrame: 54 },
];

const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, t), 3);

export default function SkillPipsIntro() {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ── per-scene local progress 0→1 ──
  const s1 = Math.min(1, frame / S1_END);
  const s2 = Math.min(1, Math.max(0, frame - S1_END) / (S2_END - S1_END));
  const s3 = Math.min(1, Math.max(0, frame - S2_END) / (S3_END - S2_END));
  const s4 = Math.min(1, Math.max(0, frame - S3_END) / (S4_END - S3_END));
  const s5 = Math.min(1, Math.max(0, frame - S4_END) / (315 - S4_END));

  const scene =
    frame < S1_END ? 1 :
    frame < S2_END ? 2 :
    frame < S3_END ? 3 :
    frame < S4_END ? 4 : 5;

  // ── background ──
  const bgBrightness = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const greenAmount = scene >= 3 ? easeOut(Math.min(1, (frame - S2_END) / 36)) : 0;

  // ── candles opacity during scene 2 fade-out ──
  const candlesOpacity = scene <= 1 ? easeOut(Math.min(1, s1 * 4)) : Math.max(0, 1 - easeOut(Math.min(1, s2 * 3)));

  // ── grid opacity ──
  const gridOpacity = Math.min(candlesOpacity, 0.25);

  // ── bull & bear ──
  const bullBearOpacity = scene === 2
    ? s2 < 0.15 ? easeOut(s2 / 0.15)
      : s2 > 0.75 ? 1 - easeOut((s2 - 0.75) / 0.25)
      : 1
    : 0;

  const bullBearSlide = scene === 2
    ? (1 - easeOut(Math.min(1, s2 * 4))) * 80
    : 0;

  const energyOpacity = scene === 2
    ? bullBearOpacity * Math.abs(Math.sin(s2 * Math.PI * 3)) * 0.75
    : 0;

  // ── logo spring in ──
  const logoScale = scene >= 3
    ? spring({ frame: frame - S2_END, fps, config: { damping: 14, stiffness: 140, mass: 0.9 } })
    : 0;
  const logoOpacity = scene >= 3 ? easeOut(Math.min(1, s3 * 3)) : 0;
  const logoPulse = scene === 5 ? Math.sin(s5 * Math.PI) : 0;

  // ── shine sweep: moves from -20% → 130% during scene 3 ──
  const shineX = scene === 3
    ? interpolate(s3, [0, 0.8], [-20, 130], { extrapolateRight: "clamp" })
    : -100;
  const shineVisible = scene === 3 && s3 > 0.05 && s3 < 0.88;

  // ── lens flare ──
  const flareOpacity = scene === 3 && s3 > 0.5 && s3 < 0.92
    ? easeOut((s3 - 0.5) / 0.42) * 0.5
    : 0;

  // ── text entrance ──
  const textOpacity = scene >= 4 ? easeOut(Math.min(1, s4 * 2.5)) : 0;
  const textY = scene >= 4 ? (1 - easeOut(Math.min(1, s4 * 2))) * 22 : 22;
  const textGlow = scene >= 4
    ? s4 < 0.5 ? easeOut(s4 * 2) : 1 - easeOut((s4 - 0.5) * 2) * 0.5
    : 0;

  // ── logo drop-shadow intensity ──
  const logoGlow = 28 + logoPulse * 18;
  const logoGlowAlpha = (0.55 + logoPulse * 0.3).toFixed(2);

  // ── centering ──
  const cx = width / 2;
  const cy = height / 2;

  const logoSize = Math.min(width, height) * 0.32;
  const logoH = logoSize * (480 / 400);

  return (
    <div style={{
      width, height,
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: `radial-gradient(ellipse at center,
        rgba(11,61,46,${((0.45 + greenAmount * 0.5) * bgBrightness).toFixed(2)}) 0%,
        rgba(5,20,12,${(0.97 * bgBrightness).toFixed(2)}) 55%,
        rgba(0,0,0,${bgBrightness.toFixed(2)}) 100%)`,
    }}>

      {/* ── particles ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <Particles
          width={width}
          height={height}
          count={90}
          converge={scene === 3 && s3 < 0.55}
          opacity={scene <= 2 ? 0.9 : scene === 3 ? 0.55 : 0.35 + logoPulse * 0.2}
        />
      </div>

      {/* ── golden vignette ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 35%, rgba(212,175,55,0.04) 60%, rgba(212,175,55,0.12) 85%, rgba(180,140,20,0.2) 100%)",
      }} />

      {/* ── SCENE 1: grid + candles ── */}
      <div style={{ position: "absolute", inset: 0, opacity: candlesOpacity, pointerEvents: "none" }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <filter id="cGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* grid lines */}
          {[0.25, 0.45, 0.65, 0.8].map((t, i) => (
            <line key={`h${i}`} x1={width * 0.05} y1={height * t} x2={width * 0.95} y2={height * t}
              stroke="#D4AF37" strokeWidth="0.6" strokeDasharray="6 6" opacity={gridOpacity} />
          ))}
          {[0.15, 0.32, 0.49, 0.66, 0.83].map((t, i) => (
            <line key={`v${i}`} x1={width * t} y1={height * 0.1} x2={width * t} y2={height * 0.9}
              stroke="#D4AF37" strokeWidth="0.6" strokeDasharray="6 6" opacity={gridOpacity} />
          ))}

          {/* candles */}
          {CANDLES.map((c, i) => {
            const localF = Math.max(0, frame - c.startFrame);
            const rise = easeOut(Math.min(1, localF / 18));
            if (rise <= 0) return null;

            const spacing = width / (CANDLES.length + 1);
            const cx2 = spacing * (i + 1);
            const midY = height * 0.52;
            const bodyH = (c.bullish ? 70 : 50) * (height / 1080);
            const bodyW = spacing * 0.28;
            const bodyTop = c.bullish ? midY - bodyH * rise : midY;
            const bodyBottom = c.bullish ? midY : midY + bodyH * rise;
            const wickTop = bodyTop - 18 * (height / 1080) * rise;
            const wickBottom = bodyBottom + 12 * (height / 1080) * rise;
            const color = c.bullish ? "#D4AF37" : "#9A7421";

            return (
              <g key={i} opacity={Math.min(1, rise * 3)}>
                <line x1={cx2} y1={wickTop} x2={cx2} y2={wickBottom}
                  stroke={color} strokeWidth="2" strokeLinecap="round" filter="url(#cGlow)" />
                <rect x={cx2 - bodyW / 2} y={bodyTop} width={bodyW}
                  height={Math.max(2, bodyBottom - bodyTop)} rx="2"
                  fill={c.bullish ? color : "transparent"} stroke={color} strokeWidth="1.5" filter="url(#cGlow)" />
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── SCENE 2: bull & bear ── */}
      <div style={{ position: "absolute", inset: 0, opacity: bullBearOpacity, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>

        {/* energy line */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: width * 0.28,
          height: 2,
          background: "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.8) 40%, rgba(248,231,161,1) 50%, rgba(212,175,55,0.8) 60%, transparent 100%)",
          borderRadius: 2,
          opacity: energyOpacity,
          filter: "blur(1px)",
        }} />

        {/* Bear */}
        <div style={{ transform: `translateX(-${bullBearSlide + width * 0.15}px)`, filter: "drop-shadow(0 0 18px rgba(212,175,55,0.5))" }}>
          <svg viewBox="0 0 160 130" width={width * 0.18} height={width * 0.18 * 130 / 160}>
            <defs>
              <linearGradient id="bBearG" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F4D87A" /><stop offset="100%" stopColor="#9A7421" />
              </linearGradient>
              <filter id="bBearGlow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <g fill="url(#bBearG)" filter="url(#bBearGlow)">
              <ellipse cx="75" cy="80" rx="42" ry="28" />
              <ellipse cx="115" cy="60" rx="22" ry="18" />
              <circle cx="105" cy="44" r="8" /><circle cx="122" cy="42" r="8" />
              <ellipse cx="133" cy="64" rx="10" ry="7" />
              <rect x="42" y="98" width="14" height="22" rx="4" />
              <rect x="62" y="100" width="14" height="20" rx="4" />
              <rect x="82" y="100" width="14" height="20" rx="4" />
              <rect x="100" y="98" width="14" height="22" rx="4" />
              <circle cx="36" cy="76" r="7" />
            </g>
            {[0,1,2,3].map(i => (
              <line key={i} x1={32+i*20} y1={88-i*6} x2={22+i*20} y2={105-i*4}
                stroke="#D4AF37" strokeWidth="1.5" opacity={0.4+i*0.1} strokeLinecap="round" />
            ))}
          </svg>
        </div>

        {/* Bull */}
        <div style={{ transform: `translateX(${bullBearSlide + width * 0.15}px) scaleX(-1)`, filter: "drop-shadow(0 0 18px rgba(212,175,55,0.5))" }}>
          <svg viewBox="0 0 160 130" width={width * 0.18} height={width * 0.18 * 130 / 160}>
            <defs>
              <linearGradient id="bBullG" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F4D87A" /><stop offset="100%" stopColor="#9A7421" />
              </linearGradient>
              <filter id="bBullGlow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <g fill="url(#bBullG)" filter="url(#bBullGlow)">
              <ellipse cx="80" cy="82" rx="45" ry="30" />
              <ellipse cx="42" cy="58" rx="20" ry="22" />
              <path d="M26,40 Q10,20 20,12 Q30,20 32,38 Z" />
              <path d="M58,38 Q72,18 64,10 Q52,18 48,36 Z" />
              <ellipse cx="28" cy="66" rx="12" ry="9" />
              <ellipse cx="28" cy="44" rx="7" ry="5" transform="rotate(-20,28,44)" />
              <rect x="44" y="100" width="15" height="24" rx="4" />
              <rect x="64" y="102" width="15" height="22" rx="4" />
              <rect x="84" y="102" width="15" height="22" rx="4" />
              <rect x="104" y="100" width="15" height="24" rx="4" />
              <path d="M124,78 Q144,70 140,58 Q136,50 128,56" fill="none" stroke="url(#bBullG)" strokeWidth="6" strokeLinecap="round" />
            </g>
            {[0,1,2,3].map(i => (
              <line key={i} x1={128-i*20} y1={88-i*6} x2={142-i*20} y2={105-i*4}
                stroke="#D4AF37" strokeWidth="1.5" opacity={0.4+i*0.1} strokeLinecap="round" />
            ))}
          </svg>
        </div>
      </div>

      {/* ── SCENE 3+: logo ── */}
      {scene >= 3 && (
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: `translate(-50%, -${height * 0.07}px) scale(${logoScale})`,
          opacity: logoOpacity,
          filter: `drop-shadow(0 0 ${logoGlow}px rgba(212,175,55,${logoGlowAlpha}))`,
          transformOrigin: "center center",
          overflow: "hidden",
        }}>
          {/* shine sweep */}
          {shineVisible && (
            <div style={{
              position: "absolute",
              top: "-20%", left: `${shineX}%`,
              width: "28%", height: "140%",
              background: "linear-gradient(105deg, transparent 0%, rgba(255,248,200,0) 30%, rgba(255,248,200,0.85) 50%, rgba(255,248,200,0) 70%, transparent 100%)",
              transform: "skewX(-15deg)",
              pointerEvents: "none",
              zIndex: 2,
            }} />
          )}
          <ShieldLogo size={logoSize} />
        </div>
      )}

      {/* ── lens flare ── */}
      {scene >= 3 && (
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: Math.min(width, height) * 0.6,
          height: Math.min(width, height) * 0.6,
          borderRadius: "50%",
          background: "radial-gradient(circle at center, rgba(248,231,161,0.22) 0%, rgba(212,175,55,0.1) 30%, transparent 70%)",
          opacity: flareOpacity,
          pointerEvents: "none",
        }} />
      )}

      {/* ── SCENE 4+: text ── */}
      {scene >= 4 && (
        <div style={{
          position: "absolute",
          bottom: height * 0.1,
          left: 0, right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          pointerEvents: "none",
        }}>
          <div style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: 700,
            fontSize: Math.min(width, height) * 0.055,
            letterSpacing: "0.28em",
            background: "linear-gradient(180deg, #F8E7A1 0%, #D4AF37 50%, #9A7421 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "none",
            filter: `drop-shadow(0 0 ${12 + textGlow * 32}px rgba(212,175,55,${(0.5 + textGlow * 0.5).toFixed(2)}))`,
            lineHeight: 1,
          }}>
            SKILLPIPS
          </div>
          {/* reflection */}
          <div style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: 700,
            fontSize: Math.min(width, height) * 0.055,
            letterSpacing: "0.28em",
            background: "linear-gradient(180deg, rgba(154,116,33,0.6) 0%, transparent 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            transform: "scaleY(-1)",
            marginTop: 2,
            lineHeight: 1,
            opacity: 0.4,
          }}>
            SKILLPIPS
          </div>
        </div>
      )}
    </div>
  );
}
