import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { GOLD, GOLD_LIGHT, GOLD_GLOW_SOFT, WHITE_DIM, WHITE_SOFT } from '../utils/colors';
import { expoOut, lerp } from '../utils/easings';

interface Message {
  text: string;
  time: string;
  isBot: boolean;
  delay: number;
}

const MESSAGES: Message[] = [
  { text: '📊 GOLD BUY @ 2315\nTP: 2350 | SL: 2290', time: '09:15', isBot: true, delay: 20 },
  { text: '🔥 Entry confirmed! Following SP signals 💪', time: '09:16', isBot: false, delay: 45 },
  { text: '✅ TP1 HIT — +120 PIPS 🚀', time: '10:44', isBot: true, delay: 70 },
  { text: 'Gold flying today!! 🙌🏆', time: '10:45', isBot: false, delay: 95 },
  { text: '💎 VIP 2.0 NOW OPEN\nLimited spots only', time: '10:46', isBot: true, delay: 120 },
  { text: '🏅 +$840 today. SkillPips never misses', time: '10:47', isBot: false, delay: 145 },
];

const ChatBubble: React.FC<{ msg: Message }> = ({ msg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - msg.delay;
  const s = spring({ frame: f, fps, config: { damping: 140, stiffness: 70 }, durationInFrames: 30 });
  const op = lerp(f, 0, 10, 0, 1, expoOut);

  if (f < 0) return null;

  return (
    <div style={{
      display: 'flex',
      justifyContent: msg.isBot ? 'flex-start' : 'flex-end',
      marginBottom: 10,
      transform: `translateY(${(1 - s) * 16}px)`,
      opacity: op,
    }}>
      {msg.isBot && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, marginRight: 8, flexShrink: 0, alignSelf: 'flex-end',
          boxShadow: `0 0 10px ${GOLD_GLOW_SOFT}`,
        }}>S</div>
      )}
      <div style={{
        maxWidth: '78%',
        background: msg.isBot
          ? `linear-gradient(135deg, #1a1500 0%, #1e1800 100%)`
          : 'rgba(0,120,210,0.85)',
        borderRadius: msg.isBot ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
        padding: '9px 13px',
        border: msg.isBot ? `1px solid rgba(201,168,76,0.3)` : '1px solid rgba(255,255,255,0.1)',
        boxShadow: msg.isBot ? `0 0 16px rgba(201,168,76,0.12)` : '0 2px 8px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          color: msg.isBot ? GOLD_LIGHT : WHITE_SOFT,
          fontSize: 13,
          fontFamily: 'sans-serif',
          lineHeight: 1.5,
          whiteSpace: 'pre-line',
        }}>{msg.text}</div>
        <div style={{
          color: 'rgba(255,255,255,0.35)',
          fontSize: 10,
          fontFamily: 'sans-serif',
          textAlign: 'right',
          marginTop: 4,
        }}>{msg.time} ✓✓</div>
      </div>
    </div>
  );
};

interface Props {
  screenW: number;
  screenH: number;
  showJoin?: boolean;
  joinGlowIntensity?: number;
  onJoinTap?: boolean;
}

export const TelegramApp: React.FC<Props> = ({
  screenW, screenH, showJoin = false, joinGlowIntensity = 0, onJoinTap = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({ frame, fps, config: { damping: 140, stiffness: 80 }, durationInFrames: 30 });
  const headerOp = lerp(frame, 0, 20, 0, 1, expoOut);

  const joinPulse = 0.7 + 0.3 * Math.sin(frame * 0.12);
  const joinScale = spring({ frame: frame - 140, fps, config: { damping: 120, stiffness: 60 }, durationInFrames: 30 });

  const tapFlash = onJoinTap
    ? interpolate(frame, [0, 4, 18], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  return (
    <div style={{
      width: screenW, height: screenH,
      background: '#0a0a0a',
      display: 'flex', flexDirection: 'column',
      transform: `translateY(${(1 - slideIn) * screenH * 0.08}px)`,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(14,14,16,0.95)',
        backdropFilter: 'blur(12px)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: `1px solid rgba(201,168,76,0.15)`,
        opacity: headerOp,
        flexShrink: 0,
      }}>
        <span style={{ color: '#0088cc', fontSize: 18 }}>‹</span>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 17, color: '#000',
          boxShadow: `0 0 16px ${GOLD_GLOW_SOFT}`,
          flexShrink: 0,
        }}>SP</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: WHITE_SOFT, fontSize: 15, fontFamily: 'sans-serif', fontWeight: 700 }}>
            SkillPips VIP
          </div>
          <div style={{ color: GOLD, fontSize: 11, fontFamily: 'sans-serif' }}>
            2,847 members • 124 online
          </div>
        </div>
        <div style={{
          background: `rgba(201,168,76,0.15)`,
          border: `1px solid ${GOLD}`,
          borderRadius: 8, padding: '3px 8px',
          color: GOLD, fontSize: 11, fontFamily: 'sans-serif', fontWeight: 700,
        }}>VIP</div>
      </div>

      {/* Chat messages */}
      <div style={{
        flex: 1, overflowY: 'hidden',
        padding: '12px 14px',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}>
        {MESSAGES.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
      </div>

      {/* JOIN Button */}
      {showJoin && (
        <div style={{
          padding: '14px 16px 20px',
          background: 'rgba(10,10,10,0.95)',
          borderTop: `1px solid rgba(201,168,76,0.2)`,
          transform: `scale(${joinScale})`,
          opacity: joinScale,
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 50%, ${GOLD} 100%)`,
            borderRadius: 16,
            padding: '16px',
            textAlign: 'center',
            fontSize: 17,
            fontWeight: 800,
            fontFamily: 'sans-serif',
            color: '#000',
            letterSpacing: 1,
            boxShadow: `
              0 0 ${30 + joinGlowIntensity * 40}px ${8 + joinGlowIntensity * 20}px rgba(201,168,76,${0.3 + joinGlowIntensity * 0.5}),
              0 8px 24px rgba(0,0,0,0.6)
            `,
            transform: `scale(${1 + joinGlowIntensity * 0.04 * joinPulse})`,
          }}>
            JOIN THE VIP GROUP ✦
          </div>
          {tapFlash > 0 && (
            <div style={{
              position: 'absolute', inset: 0,
              background: `rgba(247,217,119,${tapFlash * 0.4})`,
              borderRadius: 16,
              pointerEvents: 'none',
            }} />
          )}
        </div>
      )}
    </div>
  );
};
