import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { GOLD, GOLD_LIGHT } from '../utils/colors';
import { expoOut } from '../utils/easings';

interface Props {
  trigger?: number; // frame to start burst
}

export const GlowBurst: React.FC<Props> = ({ trigger = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - trigger;

  const ring1 = spring({ frame: f, fps, config: { damping: 80, stiffness: 60 }, durationInFrames: 40 });
  const ring2 = spring({ frame: f - 6, fps, config: { damping: 80, stiffness: 50 }, durationInFrames: 40 });
  const ring3 = spring({ frame: f - 12, fps, config: { damping: 80, stiffness: 40 }, durationInFrames: 40 });

  const ringOpacity = (s: number) =>
    interpolate(f, [0, 8, 40, 55], [0, 1, 0.6, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: expoOut,
    });

  const flashOpacity = interpolate(f, [0, 4, 20], [0, 0.9, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (f < 0) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* Flash */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 50% 62%, ${GOLD_LIGHT} 0%, transparent 60%)`,
        opacity: flashOpacity,
        mixBlendMode: 'screen',
      }} />
      {/* Rings */}
      {[
        { s: ring1, delay: 0, color: GOLD_LIGHT },
        { s: ring2, delay: 6, color: GOLD },
        { s: ring3, delay: 12, color: GOLD_LIGHT },
      ].map(({ s, delay, color }, idx) => (
        <div key={idx} style={{
          position: 'absolute',
          left: '50%', top: '62%',
          transform: `translate(-50%, -50%) scale(${s * 3})`,
          width: 300, height: 300,
          borderRadius: '50%',
          border: `3px solid ${color}`,
          opacity: ringOpacity(s) * (f > delay ? 1 : 0),
          boxShadow: `0 0 30px 10px ${color}`,
        }} />
      ))}
      {/* Gold shards */}
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const dist = spring({ frame: f - i * 2, fps, config: { damping: 60, stiffness: 40 } }) * 380;
        const op = interpolate(f, [i * 2, i * 2 + 8, i * 2 + 40], [0, 1, 0], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        });
        return (
          <div key={i} style={{
            position: 'absolute',
            left: '50%', top: '62%',
            width: 4, height: 4,
            borderRadius: '50%',
            background: i % 2 === 0 ? GOLD_LIGHT : GOLD,
            transform: `translate(-50%, -50%) translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`,
            opacity: op,
            boxShadow: `0 0 8px 3px ${GOLD}`,
          }} />
        );
      })}
    </div>
  );
};
