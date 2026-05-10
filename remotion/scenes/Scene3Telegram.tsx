import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { DEEP_BLACK } from '../utils/colors';
import { lerp, expoOut, cinematic } from '../utils/easings';
import { IPhoneFrame } from '../components/IPhoneFrame';
import { TelegramApp } from '../components/TelegramApp';
import { GoldParticles } from '../components/GoldParticles';

export const Scene3Telegram: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PHONE_W = 380;
  const PHONE_H = 800;
  const SCREEN_W = PHONE_W - 22;
  const SCREEN_H = PHONE_H - 22;

  // ── Scene fade-in ─────────────────────────────────────────────
  const sceneOp = lerp(frame, 0, 30, 0, 1, expoOut);

  // ── Gentle float ──────────────────────────────────────────────
  const floatY = Math.sin(frame * 0.022 + 1.2) * 8;
  const rotY = Math.sin(frame * 0.016) * 3;

  // ── Camera slow zoom into phone (frames 140-420) ─────────────
  const camScale = lerp(frame, 100, 420, 1.14, 1.28, cinematic);

  // ── JOIN button appears at frame 200 ─────────────────────────
  const showJoin = frame >= 200;
  const joinGlow = lerp(frame, 200, 360, 0, 1, expoOut);

  // ── Particle intensity builds as JOIN nears ───────────────────
  const particleIntensity = lerp(frame, 160, 380, 0.3, 0.9, expoOut);

  return (
    <div style={{
      width, height,
      background: DEEP_BLACK,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      opacity: sceneOp,
      transform: `scale(${camScale})`,
      transformOrigin: '50% 60%',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <GoldParticles count={28} intensity={particleIntensity} />

      {/* iPhone with Telegram */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: `translate(-50%, -50%) translateY(${floatY}px)`,
      }}>
        <IPhoneFrame
          width={PHONE_W} height={PHONE_H}
          rotateY={rotY} rotateX={-0.5}
          glowIntensity={0.4 + joinGlow * 0.4}
        >
          <TelegramApp
            screenW={SCREEN_W}
            screenH={SCREEN_H}
            showJoin={showJoin}
            joinGlowIntensity={joinGlow}
          />
        </IPhoneFrame>
      </div>
    </div>
  );
};
