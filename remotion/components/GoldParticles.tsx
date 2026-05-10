import React from 'react';
import { useCurrentFrame } from 'remotion';
import { GOLD, GOLD_LIGHT } from '../utils/colors';
import { seed } from '../utils/easings';

interface Props {
  count?: number;
  intensity?: number; // 0-1
  width?: number;
  height?: number;
}

const PARTICLE_DATA = Array.from({ length: 80 }, (_, i) => ({
  x: seed(i) * 100,
  y: seed(i + 80) * 100,
  size: seed(i + 160) * 4 + 1,
  speed: seed(i + 240) * 0.4 + 0.2,
  phase: seed(i + 320) * Math.PI * 2,
  freq: seed(i + 400) * 0.03 + 0.01,
  xFreq: seed(i + 480) * 0.02 + 0.005,
  xAmp: seed(i + 560) * 60 + 20,
  baseOpacity: seed(i + 640) * 0.7 + 0.15,
  color: seed(i + 720) > 0.5 ? GOLD : GOLD_LIGHT,
}));

export const GoldParticles: React.FC<Props> = ({
  count = 50,
  intensity = 1,
  width = 1080,
  height = 1920,
}) => {
  const frame = useCurrentFrame();
  const particles = PARTICLE_DATA.slice(0, count);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map((p, i) => {
        const yRaw = p.y - (frame * p.speed * 0.05) * 100;
        const yPct = ((yRaw % 100) + 100) % 100;
        const xPct = p.x + Math.sin(frame * p.xFreq + p.phase) * (p.xAmp / width * 100);
        const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(frame * p.freq + p.phase));
        const opacity = p.baseOpacity * twinkle * intensity;
        const glow = p.size > 3.5;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${xPct}%`,
              top: `${yPct}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: p.color,
              opacity,
              boxShadow: glow ? `0 0 ${p.size * 3}px ${p.size}px ${p.color}` : undefined,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}
    </div>
  );
};
