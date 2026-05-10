import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { GOLD, GOLD_LIGHT, GOLD_GLOW_SOFT, WHITE_DIM, WHITE_SOFT } from '../utils/colors';
import { expoOut, lerp } from '../utils/easings';
import { CandleChart } from './CandleChart';

const Notification: React.FC<{
  icon: string;
  title: string;
  body: string;
  delay: number;
}> = ({ icon, title, body, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;

  const s = spring({ frame: f, fps, config: { damping: 120, stiffness: 80 }, durationInFrames: 35 });
  const op = lerp(f, 0, 12, 0, 1, expoOut);

  if (f < 0) return null;

  return (
    <div style={{
      transform: `translateY(${(1 - s) * 40}px) scale(${0.92 + s * 0.08})`,
      opacity: op,
      background: 'rgba(28,28,30,0.88)',
      backdropFilter: 'blur(20px)',
      borderRadius: 18,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 10,
      border: '0.5px solid rgba(255,255,255,0.12)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      width: '100%',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
        boxShadow: `0 0 12px ${GOLD_GLOW_SOFT}`,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ color: WHITE_SOFT, fontSize: 13, fontWeight: 600, fontFamily: 'sans-serif', marginBottom: 2 }}>
          {title}
        </div>
        <div style={{ color: WHITE_DIM, fontSize: 12, fontFamily: 'sans-serif', lineHeight: 1.3 }}>
          {body}
        </div>
      </div>
    </div>
  );
};

export const LockScreen: React.FC<{ screenW: number; screenH: number }> = ({ screenW, screenH }) => {
  const frame = useCurrentFrame();

  const timeScale = spring({ frame, fps: 60, config: { damping: 140, stiffness: 60 }, durationInFrames: 40 });
  const timeOp = lerp(frame, 0, 20, 0, 1, expoOut);

  return (
    <div style={{
      width: screenW, height: screenH,
      background: `radial-gradient(ellipse at 50% 30%, rgba(60,40,0,0.6) 0%, #050505 70%)`,
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      {/* Candlestick wallpaper */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: 0.22 }}>
        <CandleChart width={screenW} height={screenH * 0.55} animated={false} opacity={1} />
      </div>

      {/* Bull silhouette */}
      <div style={{
        position: 'absolute', bottom: screenH * 0.08, right: screenW * 0.06,
        fontSize: 90, opacity: 0.06, filter: `sepia(1) saturate(3) hue-rotate(-10deg)`,
        lineHeight: 1,
      }}>🐂</div>
      <div style={{
        position: 'absolute', bottom: screenH * 0.08, left: screenW * 0.06,
        fontSize: 72, opacity: 0.06, filter: `sepia(1) saturate(3) hue-rotate(-10deg)`,
        lineHeight: 1,
      }}>🐻</div>

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: screenW * 0.8, height: screenH * 0.3,
        background: `radial-gradient(ellipse, ${GOLD_GLOW_SOFT} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Time */}
      <div style={{
        marginTop: screenH * 0.15,
        transform: `scale(${0.85 + timeScale * 0.15})`,
        opacity: timeOp,
        textAlign: 'center',
      }}>
        <div style={{
          color: WHITE_SOFT,
          fontSize: 88,
          fontWeight: '100',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: -4,
          lineHeight: 1,
          textShadow: `0 0 40px rgba(255,255,255,0.2)`,
        }}>9:41</div>
        <div style={{
          color: WHITE_DIM,
          fontSize: 18,
          fontFamily: 'sans-serif',
          letterSpacing: 2,
          marginTop: 8,
          textTransform: 'uppercase',
        }}>Monday, May 5</div>
      </div>

      {/* Notifications */}
      <div style={{
        position: 'absolute',
        top: screenH * 0.44,
        left: 18, right: 18,
      }}>
        <Notification icon="📈" title="SkillPips VIP" body="+500 Traders Joined" delay={55} />
        <Notification icon="💰" title="Signal Alert" body="Gold Trade Hit TP ✅" delay={85} />
        <Notification icon="⚡" title="SkillPips Signals" body="VIP 2.0 OPEN — New Entry" delay={115} />
      </div>

      {/* Swipe hint */}
      <div style={{
        position: 'absolute', bottom: 36,
        color: WHITE_DIM, fontSize: 14,
        fontFamily: 'sans-serif', letterSpacing: 1,
        opacity: lerp(frame, 80, 100, 0, 0.7, expoOut),
      }}>
        Swipe up to unlock
      </div>
    </div>
  );
};
