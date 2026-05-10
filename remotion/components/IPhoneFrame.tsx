import React from 'react';
import { GOLD, GOLD_DIM } from '../utils/colors';

interface Props {
  width?: number;
  height?: number;
  rotateY?: number;
  rotateX?: number;
  children?: React.ReactNode;
  glowIntensity?: number; // 0–1
}

export const IPhoneFrame: React.FC<Props> = ({
  width = 380,
  height = 800,
  rotateY = 0,
  rotateX = 0,
  children,
  glowIntensity = 0.5,
}) => {
  const radius = 52;
  const borderW = 9;
  const screenInset = borderW + 2;
  const screenW = width - screenInset * 2;
  const screenH = height - screenInset * 2;
  const islandW = Math.round(screenW * 0.31);
  const islandH = 32;

  return (
    <div style={{
      width, height,
      perspective: 1600,
      perspectiveOrigin: '50% 50%',
    }}>
      <div style={{
        width, height,
        transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.05s linear',
        position: 'relative',
      }}>
        {/* Outer shell — titanium/gold border */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: radius,
          background: `linear-gradient(160deg, ${GOLD} 0%, ${GOLD_DIM} 25%, #2a2a2a 50%, ${GOLD_DIM} 75%, ${GOLD} 100%)`,
          boxShadow: `
            0 0 0 1px rgba(0,0,0,0.8),
            0 0 ${40 + glowIntensity * 80}px ${10 + glowIntensity * 30}px rgba(201,168,76,${0.15 + glowIntensity * 0.45}),
            0 60px 120px rgba(0,0,0,0.85),
            0 20px 60px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,255,255,0.25),
            inset 0 -1px 0 rgba(0,0,0,0.4)
          `,
        }} />

        {/* Inner glass edge */}
        <div style={{
          position: 'absolute',
          top: borderW - 1, left: borderW - 1,
          right: borderW - 1, bottom: borderW - 1,
          borderRadius: radius - borderW + 2,
          background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, transparent 50%)',
          border: '1px solid rgba(255,255,255,0.08)',
        }} />

        {/* Screen area */}
        <div style={{
          position: 'absolute',
          top: screenInset, left: screenInset,
          width: screenW, height: screenH,
          borderRadius: radius - screenInset - 2,
          overflow: 'hidden',
          background: '#000',
        }}>
          {children}

          {/* Specular reflection */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(
              135deg,
              rgba(255,255,255,${0.06 + rotateY * 0.004}) 0%,
              rgba(255,255,255,0.02) 25%,
              transparent 55%
            )`,
            pointerEvents: 'none',
            borderRadius: radius - screenInset - 2,
          }} />
        </div>

        {/* Dynamic Island */}
        <div style={{
          position: 'absolute',
          top: screenInset + 12,
          left: '50%',
          transform: 'translateX(-50%)',
          width: islandW,
          height: islandH,
          borderRadius: islandH / 2,
          background: '#000',
          zIndex: 10,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
        }} />

        {/* Power button */}
        <div style={{
          position: 'absolute',
          right: -4,
          top: height * 0.28,
          width: 4, height: 68,
          borderRadius: '0 3px 3px 0',
          background: `linear-gradient(180deg, ${GOLD} 0%, ${GOLD_DIM} 100%)`,
        }} />

        {/* Volume buttons */}
        {[height * 0.22, height * 0.31].map((top, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: -4, top,
            width: 4, height: 44,
            borderRadius: '3px 0 0 3px',
            background: `linear-gradient(180deg, ${GOLD} 0%, ${GOLD_DIM} 100%)`,
          }} />
        ))}

        {/* Silent switch */}
        <div style={{
          position: 'absolute',
          left: -4, top: height * 0.15,
          width: 4, height: 22,
          borderRadius: '3px 0 0 3px',
          background: GOLD_DIM,
        }} />

        {/* Edge reflection — left */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: radius,
          background: `linear-gradient(90deg, rgba(255,255,255,${0.08 - rotateY * 0.006}) 0%, transparent 10%, transparent 90%, rgba(255,255,255,${0.04 + rotateY * 0.004}) 100%)`,
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  );
};
