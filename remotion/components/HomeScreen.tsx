import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { GOLD, GOLD_GLOW_SOFT, WHITE_DIM, WHITE_SOFT } from '../utils/colors';
import { expoOut, lerp } from '../utils/easings';

const APP_ICONS = [
  { label: 'Camera', bg: '#1c1c1e', icon: '📷', glow: false },
  { label: 'Photos', bg: '#1c1c1e', icon: '🖼️', glow: false },
  { label: 'Telegram', bg: '#0088cc', icon: '✈️', glow: true },
  { label: 'Safari', bg: '#1c1c1e', icon: '🧭', glow: false },
  { label: 'Settings', bg: '#1c1c1e', icon: '⚙️', glow: false },
  { label: 'Charts', bg: '#1a1a1a', icon: '📊', glow: false },
  { label: 'News', bg: '#1c1c1e', icon: '📰', glow: false },
  { label: 'Messages', bg: '#1c1c1e', icon: '💬', glow: false },
  { label: 'FaceID', bg: '#1c1c1e', icon: '🔒', glow: false },
  { label: 'Trade', bg: '#0d2010', icon: '📈', glow: false },
  { label: 'Clock', bg: '#1c1c1e', icon: '🕐', glow: false },
  { label: 'Wallet', bg: '#1c1c1e', icon: '👜', glow: false },
];

const AppIcon: React.FC<{ app: typeof APP_ICONS[0]; idx: number }> = ({ app, idx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = idx * 4;
  const s = spring({ frame: frame - delay, fps, config: { damping: 130, stiffness: 70 }, durationInFrames: 30 });
  const telegramGlow = app.glow
    ? 0.5 + 0.5 * Math.sin(frame * 0.08)
    : 0;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      transform: `scale(${s})`,
      opacity: s,
    }}>
      <div style={{
        width: 68, height: 68, borderRadius: 18,
        background: app.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32,
        boxShadow: app.glow
          ? `0 0 ${20 + telegramGlow * 20}px ${8 + telegramGlow * 8}px ${GOLD_GLOW_SOFT}, 0 4px 12px rgba(0,0,0,0.5)`
          : '0 4px 12px rgba(0,0,0,0.5)',
        border: app.glow ? `1.5px solid rgba(201,168,76,${0.4 + telegramGlow * 0.4})` : '1px solid rgba(255,255,255,0.06)',
        transition: 'box-shadow 0.1s',
      }}>
        {app.icon}
      </div>
      <div style={{ color: WHITE_DIM, fontSize: 11, fontFamily: 'sans-serif', marginTop: 5, letterSpacing: 0.2 }}>
        {app.label}
      </div>
    </div>
  );
};

export const HomeScreen: React.FC<{ screenW: number; screenH: number; fingerProgress?: number }> = ({
  screenW, screenH, fingerProgress = 0,
}) => {
  const frame = useCurrentFrame();
  const bgOp = lerp(frame, 0, 20, 0, 1, expoOut);

  return (
    <div style={{
      width: screenW, height: screenH,
      background: 'linear-gradient(180deg, #060606 0%, #0a0a0a 50%, #060606 100%)',
      opacity: bgOp,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Wallpaper vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 40%, rgba(40,30,0,0.35) 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />

      {/* Status bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 24px 0',
        color: WHITE_SOFT, fontSize: 13, fontFamily: 'sans-serif', fontWeight: 600,
      }}>
        <span>9:41</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11 }}>●●●●</span>
          <span>WiFi</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Widget */}
      <div style={{
        margin: '18px 16px 8px',
        padding: '14px 18px',
        background: 'rgba(28,28,30,0.75)',
        backdropFilter: 'blur(14px)',
        borderRadius: 20,
        border: `1px solid rgba(201,168,76,0.2)`,
        boxShadow: `0 0 20px rgba(201,168,76,0.08)`,
        opacity: lerp(frame, 10, 30, 0, 1, expoOut),
      }}>
        <div style={{ color: GOLD, fontSize: 11, fontFamily: 'sans-serif', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>
          SkillPips VIP
        </div>
        <div style={{ color: WHITE_SOFT, fontSize: 20, fontFamily: 'sans-serif', fontWeight: 700 }}>
          +247 Pips Today 📈
        </div>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, fontFamily: 'sans-serif', marginTop: 4 }}>
          Live signal • Gold: BUY
        </div>
      </div>

      {/* Icons grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px 12px',
        padding: '12px 20px',
      }}>
        {APP_ICONS.map((app, i) => (
          <AppIcon key={i} app={app} idx={i} />
        ))}
      </div>

      {/* Finger tap */}
      {fingerProgress > 0 && (
        <div style={{
          position: 'absolute',
          top: screenH * 0.335,
          left: screenW * 0.5,
          transform: 'translate(-50%, -50%)',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.5)',
            transform: `scale(${1 - fingerProgress * 0.2})`,
            opacity: fingerProgress > 0.8 ? (1 - fingerProgress) * 5 : fingerProgress,
          }} />
        </div>
      )}
    </div>
  );
};
