import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { GOLD, GOLD_LIGHT, GOLD_DIM, GOLD_GLOW, GOLD_GLOW_SOFT, DEEP_BLACK } from '../utils/colors';
import { lerp, expoOut, cinematic, overshoot, seed } from '../utils/easings';
import { GoldParticles } from '../components/GoldParticles';
import { CandleChart } from '../components/CandleChart';

// Individual letter with staggered spring entrance
const AnimatedLetter: React.FC<{ char: string; delay: number; fontSize: number; color: string }> = ({
  char, delay, fontSize, color,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 130, stiffness: 60 }, durationInFrames: 40 });
  const op = lerp(frame, delay, delay + 18, 0, 1, expoOut);

  return (
    <span style={{
      display: 'inline-block',
      transform: `translateY(${(1 - s) * 32}px) scale(${0.8 + s * 0.2})`,
      opacity: op,
      fontSize,
      color,
      fontFamily: 'system-ui, -apple-system, "SF Pro Display", sans-serif',
      fontWeight: 900,
      letterSpacing: 4,
      textShadow: `
        0 0 ${20 + s * 30}px ${GOLD_GLOW},
        0 0 ${50 + s * 60}px rgba(201,168,76,0.3),
        0 4px 20px rgba(0,0,0,0.8)
      `,
    }}>
      {char}
    </span>
  );
};

// Particle converge → logo effect
const ConvergingParticles: React.FC<{ intensity: number }> = ({ intensity }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {Array.from({ length: 30 }, (_, i) => {
        const startX = seed(i + 1000) * 100;
        const startY = seed(i + 1100) * 100;
        const progress = Math.min(1, intensity);
        const endX = 50 + (Math.cos((i / 30) * Math.PI * 2) * 8);
        const endY = 50 + (Math.sin((i / 30) * Math.PI * 2) * 3);
        const x = startX + (endX - startX) * progress;
        const y = startY + (endY - startY) * progress;
        const glow = seed(i + 1200) > 0.6;

        return (
          <div key={i} style={{
            position: 'absolute',
            left: `${x}%`, top: `${y}%`,
            width: seed(i + 1300) * 5 + 2,
            height: seed(i + 1300) * 5 + 2,
            borderRadius: '50%',
            background: i % 3 === 0 ? GOLD_LIGHT : GOLD,
            opacity: intensity * (0.4 + seed(i + 1400) * 0.6),
            transform: 'translate(-50%, -50%)',
            boxShadow: glow ? `0 0 12px 4px ${GOLD_GLOW_SOFT}` : undefined,
          }} />
        );
      })}
    </div>
  );
};

// Bull silhouette (SVG path approximation)
const BullSilhouette: React.FC<{ opacity: number; scale: number; x: number }> = ({ opacity, scale, x }) => (
  <div style={{
    position: 'absolute', top: '38%',
    left: `${x}%`,
    transform: `translateX(-50%) scale(${scale})`,
    opacity,
    fontSize: 140,
    lineHeight: 1,
    filter: `blur(1px) sepia(1) saturate(2) hue-rotate(-8deg)`,
    pointerEvents: 'none',
  }}>🐂</div>
);

const BearSilhouette: React.FC<{ opacity: number; scale: number; x: number }> = ({ opacity, scale, x }) => (
  <div style={{
    position: 'absolute', top: '40%',
    left: `${x}%`,
    transform: `translateX(-50%) scale(${scale})`,
    opacity,
    fontSize: 110,
    lineHeight: 1,
    filter: `blur(1.5px) sepia(1) saturate(2) hue-rotate(-8deg)`,
    pointerEvents: 'none',
  }}>🐻</div>
);

export const Scene5BrandReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ── Fade in from black ─────────────────────────────────────────
  const sceneOp = lerp(frame, 0, 35, 0, 1, expoOut);

  // ── Converging particles (frames 0-80) ─────────────────────────
  const convergeIntensity = lerp(frame, 0, 80, 0, 1, cinematic);

  // ── Candlestick chart background (frames 20+) ──────────────────
  const chartOp = lerp(frame, 20, 70, 0, 1, expoOut);

  // ── SKILLPIPS logo letter-by-letter (starts frame 55) ──────────
  const logoLetters = 'SKILLPIPS'.split('');

  // ── Bull/bear silhouettes (frames 90-130) ──────────────────────
  const animalOp = lerp(frame, 90, 140, 0, 0.09, expoOut);
  const animalScale = lerp(frame, 90, 160, 0.85, 1, overshoot);

  // ── "JOIN THE ELITE" (frames 130-170) ─────────────────────────
  const eliteS = spring({ frame: frame - 130, fps, config: { damping: 140, stiffness: 55 }, durationInFrames: 45 });
  const eliteOp = lerp(frame, 130, 155, 0, 1, expoOut);

  // ── CTA line (frames 185-220) ──────────────────────────────────
  const ctaS = spring({ frame: frame - 185, fps, config: { damping: 150, stiffness: 50 }, durationInFrames: 40 });
  const ctaOp = lerp(frame, 185, 210, 0, 1, expoOut);

  // ── Divider line (frames 160-185) ─────────────────────────────
  const lineW = lerp(frame, 160, 195, 0, 240, expoOut);
  const lineOp = lerp(frame, 160, 180, 0, 1, expoOut);

  // ── Final glow pulse ──────────────────────────────────────────
  const glowPulse = 0.5 + 0.5 * Math.sin(frame * 0.07);

  // ── Vignette ──────────────────────────────────────────────────
  const vigOp = lerp(frame, 0, 40, 0, 1, expoOut);

  return (
    <div style={{
      width, height,
      background: DEEP_BLACK,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      opacity: sceneOp,
    }}>
      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 25%, rgba(0,0,0,0.75) 100%)',
        opacity: vigOp, pointerEvents: 'none', zIndex: 2,
      }} />

      {/* Candlestick chart background */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        opacity: chartOp * 0.22,
      }}>
        <CandleChart width={width} height={height * 0.45} animated opacity={1} />
      </div>

      {/* Volumetric gold light */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 900, height: 600,
        background: `radial-gradient(ellipse, rgba(201,168,76,${0.08 + glowPulse * 0.06}) 0%, transparent 70%)`,
        pointerEvents: 'none',
        filter: 'blur(8px)',
      }} />

      {/* Gold particles */}
      <GoldParticles count={65} intensity={0.7 + glowPulse * 0.3} />

      {/* Converging particles */}
      <ConvergingParticles intensity={convergeIntensity} />

      {/* Bull & bear silhouettes */}
      <BullSilhouette opacity={animalOp} scale={animalScale} x={72} />
      <BearSilhouette opacity={animalOp} scale={animalScale} x={28} />

      {/* Main content stack */}
      <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>

        {/* JOIN THE ELITE */}
        <div style={{
          transform: `translateY(${(1 - eliteS) * -24}px)`,
          opacity: eliteOp,
          color: GOLD_LIGHT,
          fontSize: 22,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: 300,
          letterSpacing: 10,
          textTransform: 'uppercase',
          marginBottom: 20,
          textShadow: `0 0 30px ${GOLD_GLOW}`,
        }}>
          JOIN THE ELITE
        </div>

        {/* SKILLPIPS letters */}
        <div style={{ display: 'flex', gap: 0 }}>
          {logoLetters.map((char, i) => (
            <AnimatedLetter
              key={i}
              char={char}
              delay={55 + i * 7}
              fontSize={96}
              color={i % 2 === 0 ? GOLD_LIGHT : GOLD}
            />
          ))}
        </div>

        {/* Gold divider line */}
        <div style={{
          width: lineW,
          height: 1.5,
          background: `linear-gradient(90deg, transparent, ${GOLD}, ${GOLD_LIGHT}, ${GOLD}, transparent)`,
          opacity: lineOp,
          margin: '18px auto',
          boxShadow: `0 0 14px ${GOLD_GLOW}`,
        }} />

        {/* CTA */}
        <div style={{
          transform: `translateY(${(1 - ctaS) * 20}px)`,
          opacity: ctaOp,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 17,
            fontFamily: 'sans-serif',
            fontWeight: 300,
            letterSpacing: 5,
            textTransform: 'uppercase',
          }}>
            FREE ENTRY
          </div>
          <div style={{
            background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 50%, ${GOLD} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: 20,
            fontFamily: 'sans-serif',
            fontWeight: 700,
            letterSpacing: 3,
          }}>
            MESSAGE US NOW ✦
          </div>
        </div>

        {/* Subtle tagline */}
        <div style={{
          marginTop: 36,
          color: GOLD_DIM,
          fontSize: 13,
          fontFamily: 'sans-serif',
          fontWeight: 300,
          letterSpacing: 4,
          textTransform: 'uppercase',
          opacity: ctaOp * 0.7,
        }}>
          Live Signals · Elite Community · Real Results
        </div>
      </div>

      {/* Bottom glow bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 3,
        background: `linear-gradient(90deg, transparent, ${GOLD}, ${GOLD_LIGHT}, ${GOLD}, transparent)`,
        opacity: ctaOp * (0.5 + glowPulse * 0.5),
        boxShadow: `0 0 30px 8px ${GOLD_GLOW}`,
      }} />
    </div>
  );
};
