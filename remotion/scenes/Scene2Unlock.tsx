import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { DEEP_BLACK, GOLD } from '../utils/colors';
import { lerp, expoOut, cinematic } from '../utils/easings';
import { IPhoneFrame } from '../components/IPhoneFrame';
import { LockScreen } from '../components/LockScreen';
import { HomeScreen } from '../components/HomeScreen';
import { GoldParticles } from '../components/GoldParticles';

// Swipe gesture indicator
const SwipeGesture: React.FC<{ progress: number }> = ({ progress }) => {
  const trail = Math.max(0, progress - 0.15);
  return (
    <div style={{
      position: 'absolute',
      left: '50%',
      bottom: `${15 + progress * 45}%`,
      transform: 'translateX(-50%)',
      width: 48, height: 48,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.22)',
      border: '2px solid rgba(255,255,255,0.55)',
      opacity: progress < 0.85 ? 1 : (1 - progress) * (1 / 0.15),
      boxShadow: '0 0 18px rgba(255,255,255,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 2, height: 18,
        background: 'rgba(255,255,255,0.8)',
        borderRadius: 1,
        transform: 'rotate(180deg)',
      }} />
    </div>
  );
};

export const Scene2Unlock: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PHONE_W = 380;
  const PHONE_H = 800;
  const SCREEN_W = PHONE_W - 22;
  const SCREEN_H = PHONE_H - 22;

  // ── Swipe (frames 20–60) ─────────────────────────────────────
  const swipeProgress = lerp(frame, 20, 65, 0, 1, expoOut);
  const showSwipe = frame >= 20 && frame < 80;

  // ── Lock screen slides UP (frames 55–90) ────────────────────
  const lockSlideUp = spring({
    frame: frame - 55,
    fps,
    config: { damping: 120, stiffness: 70 },
    durationInFrames: 35,
  });
  const lockScreenY = lockSlideUp * -SCREEN_H;
  const lockScreenOp = interpolate(frame, [55, 100], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: expoOut,
  });

  // ── Home screen slides IN from bottom (frames 60–100) ────────
  const homeSlide = spring({
    frame: frame - 60,
    fps,
    config: { damping: 130, stiffness: 65 },
    durationInFrames: 40,
  });
  const homeScreenY = (1 - homeSlide) * SCREEN_H * 0.15;
  const homeOp = lerp(frame, 60, 90, 0, 1, expoOut);

  // ── Finger tap animation (frames 210–260) ────────────────────
  const fingerAppear = lerp(frame, 200, 220, 0, 1, expoOut);
  const fingerTap = spring({
    frame: frame - 220,
    fps,
    config: { damping: 100, stiffness: 120 },
    durationInFrames: 20,
  });
  const fingerProgress = frame >= 200 ? Math.min(fingerAppear, fingerTap) : 0;

  // ── Ambient float after unlock ───────────────────────────────
  const floatY = frame > 100 ? Math.sin((frame - 100) * 0.028 + 0.5) * 10 : 0;
  const rotY = frame > 100 ? Math.sin((frame - 100) * 0.018) * 4 : 0;

  // ── Camera push ──────────────────────────────────────────────
  const camPush = lerp(frame, 180, 300, 1.10, 1.16, cinematic);

  // ── Scene fade-in (overlap from Scene 1) ────────────────────
  const sceneOp = lerp(frame, 0, 30, 0, 1, expoOut);

  return (
    <div style={{
      width, height,
      background: DEEP_BLACK,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      opacity: sceneOp,
      transform: `scale(${camPush})`,
      transformOrigin: '50% 50%',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <GoldParticles count={32} intensity={0.55} />

      {/* iPhone */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: `translate(-50%, -50%) translateY(${floatY}px)`,
      }}>
        <IPhoneFrame
          width={PHONE_W} height={PHONE_H}
          rotateY={rotY} rotateX={-1}
          glowIntensity={0.5}
        >
          {/* Stacked screens inside phone */}
          <div style={{ position: 'relative', width: SCREEN_W, height: SCREEN_H, overflow: 'hidden' }}>

            {/* Home screen base (always rendered below) */}
            <div style={{
              position: 'absolute', inset: 0,
              transform: `translateY(${homeScreenY}px)`,
              opacity: homeOp,
            }}>
              <HomeScreen
                screenW={SCREEN_W}
                screenH={SCREEN_H}
                fingerProgress={frame >= 220 ? fingerTap : 0}
              />
            </div>

            {/* Lock screen slides up over home */}
            <div style={{
              position: 'absolute', inset: 0,
              transform: `translateY(${lockScreenY}px)`,
              opacity: lockScreenOp,
              zIndex: 1,
            }}>
              <LockScreen screenW={SCREEN_W} screenH={SCREEN_H} />
              {showSwipe && <SwipeGesture progress={swipeProgress} />}
            </div>
          </div>
        </IPhoneFrame>
      </div>
    </div>
  );
};
