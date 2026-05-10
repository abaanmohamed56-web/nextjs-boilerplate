import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { DEEP_BLACK, GOLD, GOLD_LIGHT, GOLD_GLOW } from '../utils/colors';
import { lerp, expoOut, cinematic, expoIn } from '../utils/easings';
import { IPhoneFrame } from '../components/IPhoneFrame';
import { TelegramApp } from '../components/TelegramApp';
import { GoldParticles } from '../components/GoldParticles';
import { GlowBurst } from '../components/GlowBurst';

// Finger descending toward the JOIN button
const FingerIndicator: React.FC<{ descendProgress: number; tapProgress: number }> = ({
  descendProgress,
  tapProgress,
}) => {
  const scale = 1 - tapProgress * 0.25;
  const op = Math.min(descendProgress * 3, 1) * (1 - tapProgress * 0.8);

  return (
    <div style={{
      position: 'absolute',
      bottom: `${4 + (1 - descendProgress) * 18}%`,
      left: '50%',
      transform: `translateX(-50%) scale(${scale})`,
      opacity: op,
      pointerEvents: 'none',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    }}>
      {/* Ripple rings */}
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: 'absolute',
          width: 70 + i * 22,
          height: 70 + i * 22,
          borderRadius: '50%',
          border: `2px solid rgba(201,168,76,${0.5 - i * 0.14})`,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          boxShadow: `0 0 12px rgba(201,168,76,0.3)`,
          opacity: descendProgress > 0.5 ? 1 : 0,
        }} />
      ))}
      {/* Finger dot */}
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: 'rgba(255,255,255,0.18)',
        border: '2px solid rgba(255,255,255,0.6)',
        boxShadow: `0 0 24px ${GOLD_GLOW}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26,
      }}>👆</div>
    </div>
  );
};

export const Scene4Join: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PHONE_W = 380;
  const PHONE_H = 800;
  const SCREEN_W = PHONE_W - 22;
  const SCREEN_H = PHONE_H - 22;

  // ── Scene fade-in ─────────────────────────────────────────────
  const sceneOp = lerp(frame, 0, 25, 0, 1, expoOut);

  // ── Cinematic slow-mo camera push (frames 0-110) ──────────────
  const camScale = lerp(frame, 0, 110, 1.28, 1.52, cinematic);

  // ── Tension build: everything dims slightly except phone ──────
  const bgDim = lerp(frame, 0, 90, 0, 0.45, cinematic);

  // ── Finger descends (frames 60-120) ──────────────────────────
  const descendProgress = lerp(frame, 60, 120, 0, 1, cinematic);

  // ── Tap moment (frame 120) ───────────────────────────────────
  const tapSpring = spring({
    frame: frame - 120,
    fps,
    config: { damping: 80, stiffness: 200 },
    durationInFrames: 20,
  });
  const hasTapped = frame >= 120;

  // ── POST-TAP: screen-punch scale ─────────────────────────────
  const punchScale = hasTapped
    ? 1 + spring({ frame: frame - 120, fps, config: { damping: 60, stiffness: 400 }, durationInFrames: 15 }) * 0.05
    : 1;

  // ── Gold particles intensify pre-tap ─────────────────────────
  const particleIntensity = lerp(frame, 0, 100, 0.8, 1.8, expoOut);

  // ── Whiteout / light-sweep transition (frames 155-240) ───────
  const sweepOp = lerp(frame, 155, 220, 0, 1, expoIn);

  // ── Phone float ───────────────────────────────────────────────
  const floatY = Math.sin(frame * 0.04) * 5;
  const rotY = Math.sin(frame * 0.025) * 2;

  return (
    <div style={{
      width, height,
      background: DEEP_BLACK,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      opacity: sceneOp,
    }}>
      {/* Dark tension overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `rgba(0,0,0,${bgDim})`,
        pointerEvents: 'none', zIndex: 0,
      }} />

      <GoldParticles count={60} intensity={particleIntensity} />

      {/* iPhone */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: `
          translate(-50%, -50%)
          translateY(${floatY}px)
          scale(${camScale * punchScale})
        `,
        zIndex: 1,
      }}>
        <IPhoneFrame
          width={PHONE_W} height={PHONE_H}
          rotateY={rotY} rotateX={-0.5}
          glowIntensity={0.8 + 0.2 * Math.sin(frame * 0.1)}
        >
          <TelegramApp
            screenW={SCREEN_W}
            screenH={SCREEN_H}
            showJoin
            joinGlowIntensity={1}
            onJoinTap={hasTapped}
          />
          {/* Finger */}
          <FingerIndicator
            descendProgress={descendProgress}
            tapProgress={hasTapped ? tapSpring : 0}
          />
        </IPhoneFrame>

        {/* Glow burst on tap */}
        {hasTapped && <GlowBurst trigger={0} />}
      </div>

      {/* Full-screen gold light sweep */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 10,
        background: `radial-gradient(ellipse at 50% 60%, ${GOLD_LIGHT} 0%, ${GOLD} 20%, rgba(201,168,76,0.4) 50%, transparent 75%)`,
        opacity: sweepOp,
        mixBlendMode: 'screen',
        pointerEvents: 'none',
      }} />
      {/* Black fade-to-next */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 11,
        background: '#000',
        opacity: lerp(frame, 190, 240, 0, 1, expoIn),
        pointerEvents: 'none',
      }} />
    </div>
  );
};
