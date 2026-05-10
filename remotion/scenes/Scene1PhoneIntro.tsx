import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { GOLD, GOLD_GLOW_SOFT, DEEP_BLACK } from '../utils/colors';
import { lerp, expoOut, cinematic, seed } from '../utils/easings';
import { IPhoneFrame } from '../components/IPhoneFrame';
import { LockScreen } from '../components/LockScreen';
import { GoldParticles } from '../components/GoldParticles';

// Fog / light-streak layer
const FogLayer: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity }}>
      {Array.from({ length: 6 }, (_, i) => {
        const angle = seed(i + 900) * 360;
        const length = 200 + seed(i + 910) * 500;
        const top = 20 + seed(i + 920) * 60;
        const left = 10 + seed(i + 930) * 80;
        const drift = Math.sin(frame * 0.008 + seed(i + 940) * Math.PI * 2) * 30;
        return (
          <div key={i} style={{
            position: 'absolute',
            top: `${top}%`,
            left: `${left + drift * 0.05}%`,
            width: 2,
            height: length,
            background: `linear-gradient(180deg, transparent, rgba(201,168,76,0.12) 40%, rgba(201,168,76,0.06) 70%, transparent)`,
            transform: `rotate(${angle}deg)`,
            transformOrigin: 'top center',
            filter: 'blur(6px)',
          }} />
        );
      })}
    </div>
  );
};

export const Scene1PhoneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ── Gold seed-light ──────────────────────────────────────────
  const seedGlowOp = lerp(frame, 0, 50, 0, 1, expoOut);

  // ── iPhone entrance ─────────────────────────────────────────
  const phoneEntrance = spring({
    frame: frame - 50,
    fps,
    config: { damping: 160, stiffness: 40, mass: 1.2 },
    durationInFrames: 90,
  });
  const phoneOp = lerp(frame, 50, 100, 0, 1, expoOut);
  const phoneBlur = lerp(frame, 50, 120, 28, 0, cinematic);
  const phoneScale = 0.55 + phoneEntrance * 0.45;

  // ── Float & rotation (deterministic, frame-driven) ───────────
  const rotY = Math.sin(frame * 0.022) * 9;
  const rotX = Math.sin(frame * 0.015 + 1) * 3;
  const floatY = Math.sin(frame * 0.028 + 0.5) * 18;

  // ── Camera push (scale up over the last ~120 frames) ─────────
  const camPush = lerp(frame, 300, 480, 1.0, 1.10, cinematic);

  // ── Particle intensity ───────────────────────────────────────
  const particleIntensity = lerp(frame, 80, 220, 0, 1, expoOut);

  // ── Vignette ────────────────────────────────────────────────
  const vignetteOp = lerp(frame, 0, 40, 0, 1, expoOut);

  const PHONE_W = 380;
  const PHONE_H = 800;
  const SCREEN_W = PHONE_W - 22;
  const SCREEN_H = PHONE_H - 22;

  return (
    <div style={{
      width, height,
      background: DEEP_BLACK,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      transform: `scale(${camPush})`,
      transformOrigin: '50% 50%',
    }}>
      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
        background: `radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.7) 100%)`,
        opacity: vignetteOp,
      }} />

      {/* Ambient gold seed glow */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 600,
        background: `radial-gradient(circle, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0.06) 35%, transparent 70%)`,
        opacity: seedGlowOp,
        pointerEvents: 'none',
        filter: 'blur(2px)',
      }} />

      {/* Fog streaks */}
      <FogLayer opacity={particleIntensity * 0.7} />

      {/* Gold particles */}
      <GoldParticles count={48} intensity={particleIntensity} />

      {/* iPhone */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: `
          translate(-50%, -50%)
          translateY(${floatY}px)
          scale(${phoneScale})
        `,
        opacity: phoneOp,
        filter: `blur(${phoneBlur}px)`,
        zIndex: 1,
      }}>
        <IPhoneFrame
          width={PHONE_W}
          height={PHONE_H}
          rotateY={rotY}
          rotateX={rotX}
          glowIntensity={lerp(frame, 80, 200, 0, 0.8, expoOut)}
        >
          <LockScreen screenW={SCREEN_W} screenH={SCREEN_H} />
        </IPhoneFrame>
      </div>

      {/* Floor reflection */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: `translate(-50%, ${PHONE_H * phoneScale * 0.5 + floatY + 8}px) scaleY(-0.18) scaleX(0.9)`,
        width: PHONE_W,
        height: PHONE_H,
        opacity: phoneOp * 0.25,
        filter: 'blur(4px)',
        background: `linear-gradient(180deg, ${GOLD_GLOW_SOFT} 0%, transparent 60%)`,
        borderRadius: 52,
      }} />
    </div>
  );
};
