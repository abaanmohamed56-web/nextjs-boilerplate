"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ParticleField from "./ParticleField";
import ShieldLogo from "./ShieldLogo";
import "./intro.css";

/* ─── timing constants (ms) ─────────────────────────────── */
const T_SCENE1 = 0;
const T_SCENE2 = 2500;
const T_SCENE3 = 5000;
const T_SCENE4 = 7000;
const T_SCENE5 = 9000;
const T_TOTAL = 10500;

/* ─── candlestick data ───────────────────────────────────── */
const CANDLES = [
  { bullish: true,  delay: 0.1 },
  { bullish: true,  delay: 0.35 },
  { bullish: false, delay: 0.58 },
  { bullish: true,  delay: 0.78 },
  { bullish: true,  delay: 0.97 },
  { bullish: true,  delay: 1.16 },
  { bullish: false, delay: 1.34 },
];

export default function IntroAnimation() {
  const params = useSearchParams();
  const autoplay = params?.get("autoplay") === "1";
  const hideControls = params?.get("hideControls") === "1";

  const [ms, setMs] = useState(autoplay ? 0 : 0);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);

  const start = useCallback(() => {
    setMs(0);
    setDone(false);
    setPlaying(true);
  }, []);

  // auto-trigger on mount if URL has ?autoplay=1
  useEffect(() => {
    if (autoplay) {
      // small defer so first paint shows the initial state
      const id = setTimeout(() => start(), 50);
      return () => clearTimeout(id);
    }
  }, [autoplay, start]);

  useEffect(() => {
    if (!playing) return;
    const origin = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - origin;
      setMs(elapsed);
      if (elapsed >= T_TOTAL) {
        setPlaying(false);
        setDone(true);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  /* derive which scene is active */
  const scene =
    ms < T_SCENE2 ? 1 :
    ms < T_SCENE3 ? 2 :
    ms < T_SCENE4 ? 3 :
    ms < T_SCENE5 ? 4 : 5;

  /* progress 0→1 inside each scene */
  const p = (start: number, end: number) =>
    Math.min(1, Math.max(0, (ms - start) / (end - start)));

  const s1 = p(T_SCENE1, T_SCENE2);
  const s2 = p(T_SCENE2, T_SCENE3);
  const s3 = p(T_SCENE3, T_SCENE4);
  const s4 = p(T_SCENE4, T_SCENE5);
  const s5 = p(T_SCENE5, T_TOTAL);

  /* easing helpers */
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  const spring = (t: number) => {
    const c = 1 - Math.exp(-8 * t) * Math.cos(12 * t);
    return Math.min(1, c);
  };

  /* visibility helpers */
  const candlesVisible = scene <= 2;
  const bullBearVisible = scene === 2;
  const logoVisible = scene >= 3;
  const textVisible = scene >= 4;

  /* ── Scene 3: shine sweep position ── */
  const shineX = easeInOut(Math.min(1, s3 * 2.5)) * 130 - 15;

  /* ── Logo scale spring ── */
  const logoScale = scene >= 3 ? spring(easeOut(s3)) : 0;
  const logoOpacity = scene >= 3 ? easeOut(Math.min(1, s3 * 3)) : 0;

  /* ── Text ── */
  const textOpacity = scene >= 4 ? easeOut(Math.min(1, s4 * 2.5)) : 0;
  const textY = scene >= 4 ? (1 - easeOut(Math.min(1, s4 * 2))) * 22 : 22;
  const textGlow = scene >= 4
    ? s4 < 0.5
      ? easeInOut(s4 * 2)
      : 1 - easeInOut((s4 - 0.5) * 2) * 0.5
    : 0;

  /* ── Background gradient ── */
  const bgGreen = scene >= 3 ? easeOut(Math.min(1, (ms - T_SCENE3) / 1200)) : 0;

  /* ── Final pulse ── */
  const pulse = scene === 5 ? Math.sin(s5 * Math.PI) : 0;

  /* ── Bull / Bear fade ── */
  const bullBearOpacity = scene === 2
    ? s2 < 0.15
      ? easeOut(s2 / 0.15)
      : s2 > 0.75
        ? 1 - easeOut((s2 - 0.75) / 0.25)
        : 1
    : 0;

  return (
    <div
      className="intro-root"
      style={{
        background: `radial-gradient(ellipse at center,
          rgba(11,61,46,${0.55 + bgGreen * 0.4}) 0%,
          rgba(5,20,12,0.97) 55%,
          #000 100%)`,
      }}
    >
      {/* golden vignette */}
      <div className="intro-vignette" />

      {/* particle layer */}
      <div className="intro-particles">
        <ParticleField
          intensity={scene <= 2 ? 0.9 : scene === 3 ? 0.6 : 0.35 + pulse * 0.2}
          converge={scene === 3 && s3 < 0.55}
        />
      </div>

      {/* ── SCENE 1: chart grid + candles ── */}
      <div
        className="intro-scene intro-scene--grid"
        style={{ opacity: candlesVisible ? easeOut(Math.min(1, s1 * 4)) : 1 - easeOut(Math.min(1, s2 * 3)) }}
      >
        <svg className="intro-grid-svg" viewBox="0 0 600 360" preserveAspectRatio="xMidYMid meet">
          {/* grid lines */}
          {[0.2, 0.4, 0.6, 0.8].map((t, i) => (
            <line
              key={i}
              x1="20" y1={360 * t}
              x2="580" y2={360 * t}
              stroke="#D4AF37"
              strokeWidth="0.4"
              strokeDasharray="6 6"
              opacity={0.18 * Math.min(1, s1 * 6)}
            />
          ))}
          {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((t, i) => (
            <line
              key={i}
              x1={600 * t} y1="20"
              x2={600 * t} y2="340"
              stroke="#D4AF37"
              strokeWidth="0.4"
              strokeDasharray="6 6"
              opacity={0.18 * Math.min(1, s1 * 6)}
            />
          ))}

          {/* candlesticks */}
          {CANDLES.map((c, i) => {
            const cx = 68 + i * 72;
            const localT = Math.max(0, s1 * 2.2 - c.delay);
            const rise = easeOut(Math.min(1, localT / 0.6));
            const bodyH = 60 + (c.bullish ? 20 : -10);
            const bodyTop = c.bullish ? 200 - bodyH * rise : 210;
            const bodyBottom = c.bullish ? 200 : 210 + Math.abs(bodyH) * rise;
            const wickTop = bodyTop - 20 * rise;
            const wickBottom = bodyBottom + 15 * rise;
            const color = c.bullish ? "#D4AF37" : "#8B6914";
            const opacity = Math.min(1, rise * 3);
            return (
              <g key={i} opacity={opacity}>
                <line
                  x1={cx} y1={wickTop}
                  x2={cx} y2={wickBottom}
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <rect
                  x={cx - 12}
                  y={bodyTop}
                  width={24}
                  height={Math.max(2, bodyBottom - bodyTop)}
                  rx="2"
                  fill={c.bullish ? color : "transparent"}
                  stroke={color}
                  strokeWidth="1.5"
                  filter="url(#goldGlow)"
                />
              </g>
            );
          })}
          <defs>
            <filter id="goldGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
        </svg>
      </div>

      {/* ── SCENE 2: bull & bear silhouettes ── */}
      <div
        className="intro-scene intro-scene--creatures"
        style={{ opacity: bullBearOpacity, pointerEvents: "none" }}
      >
        {/* energy pulse line between them */}
        <div
          className="intro-energy-line"
          style={{
            opacity: bullBearOpacity * Math.sin(s2 * Math.PI * 3) * 0.7,
            transform: `scaleX(${easeOut(Math.min(1, s2 * 4))})`,
          }}
        />

        {/* Bear (left) */}
        <div
          className="intro-creature intro-creature--bear"
          style={{
            transform: `translateX(${(1 - easeOut(Math.min(1, s2 * 4))) * -80}px) scale(${0.85 + easeOut(Math.min(1, s2 * 3)) * 0.15})`,
          }}
        >
          <svg viewBox="0 0 160 130" width="200" height="162">
            <defs>
              <filter id="bearGlow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <linearGradient id="bearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F4D87A" />
                <stop offset="100%" stopColor="#9A7421" />
              </linearGradient>
            </defs>
            <g fill="url(#bearGrad)" filter="url(#bearGlow)">
              {/* body */}
              <ellipse cx="75" cy="80" rx="42" ry="28" />
              {/* head */}
              <ellipse cx="115" cy="60" rx="22" ry="18" />
              {/* ears */}
              <circle cx="105" cy="44" r="8" />
              <circle cx="122" cy="42" r="8" />
              {/* snout */}
              <ellipse cx="133" cy="64" rx="10" ry="7" />
              {/* legs */}
              <rect x="42" y="98" width="14" height="22" rx="4" />
              <rect x="62" y="100" width="14" height="20" rx="4" />
              <rect x="82" y="100" width="14" height="20" rx="4" />
              <rect x="100" y="98" width="14" height="22" rx="4" />
              {/* tail */}
              <circle cx="36" cy="76" r="7" />
            </g>
            {/* particle streaks overlaying the bear */}
            {[0,1,2,3,4].map(i => (
              <line
                key={i}
                x1={30 + i*22} y1={90 - i*8}
                x2={30 + i*22 - 15} y2={110 - i*5}
                stroke="#D4AF37"
                strokeWidth="1.5"
                opacity={0.3 + i*0.1}
                strokeLinecap="round"
              />
            ))}
          </svg>
        </div>

        {/* Bull (right) */}
        <div
          className="intro-creature intro-creature--bull"
          style={{
            transform: `translateX(${(1 - easeOut(Math.min(1, s2 * 4))) * 80}px) scale(${0.85 + easeOut(Math.min(1, s2 * 3)) * 0.15})`,
          }}
        >
          <svg viewBox="0 0 160 130" width="200" height="162">
            <defs>
              <filter id="bullGlow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <linearGradient id="bullGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F4D87A" />
                <stop offset="100%" stopColor="#9A7421" />
              </linearGradient>
            </defs>
            <g fill="url(#bullGrad)" filter="url(#bullGlow)">
              {/* body */}
              <ellipse cx="80" cy="82" rx="45" ry="30" />
              {/* neck + head */}
              <ellipse cx="42" cy="58" rx="20" ry="22" />
              {/* horns */}
              <path d="M26,40 Q10,20 20,12 Q30,20 32,38 Z" />
              <path d="M58,38 Q72,18 64,10 Q52,18 48,36 Z" />
              {/* snout */}
              <ellipse cx="28" cy="66" rx="12" ry="9" />
              {/* ear */}
              <ellipse cx="28" cy="44" rx="7" ry="5" transform="rotate(-20,28,44)" />
              {/* legs */}
              <rect x="44" y="100" width="15" height="24" rx="4" />
              <rect x="64" y="102" width="15" height="22" rx="4" />
              <rect x="84" y="102" width="15" height="22" rx="4" />
              <rect x="104" y="100" width="15" height="24" rx="4" />
              {/* tail */}
              <path d="M124,78 Q144,70 140,58 Q136,50 128,56" fill="none" stroke="url(#bullGrad)" strokeWidth="6" strokeLinecap="round" />
            </g>
            {/* particle streaks */}
            {[0,1,2,3,4].map(i => (
              <line
                key={i}
                x1={130 - i*22} y1={90 - i*8}
                x2={130 - i*22 + 18} y2={108 - i*5}
                stroke="#D4AF37"
                strokeWidth="1.5"
                opacity={0.3 + i*0.1}
                strokeLinecap="round"
              />
            ))}
          </svg>
        </div>
      </div>

      {/* ── SCENE 3 + 4 + 5: shield logo ── */}
      <div
        className="intro-scene intro-scene--logo"
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          filter: `drop-shadow(0 0 ${28 + pulse * 18}px rgba(212,175,55,${0.55 + pulse * 0.3}))`,
        }}
      >
        {/* shine sweep container */}
        <div className="intro-shine-wrap">
          <ShieldLogo size={260} />
          {/* shine band */}
          <div
            className="intro-shine"
            style={{
              left: `${shineX}%`,
              opacity: scene === 3 && s3 > 0.05 && s3 < 0.85 ? 0.65 : 0,
            }}
          />
        </div>
      </div>

      {/* ── SCENE 4 + 5: brand text ── */}
      <div
        className="intro-scene intro-scene--text"
        style={{
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
        }}
      >
        <div
          className="intro-brand-text"
          style={{
            textShadow: `0 0 ${12 + textGlow * 32}px rgba(212,175,55,${0.5 + textGlow * 0.5}), 0 0 ${4 + textGlow * 8}px rgba(212,175,55,0.9)`,
          }}
        >
          SKILLPIPS
        </div>
        {/* glossy reflection */}
        <div
          className="intro-brand-reflection"
          style={{ opacity: textOpacity * 0.35 }}
        >
          SKILLPIPS
        </div>
      </div>

      {/* ── lens flare (scene 3 lock-in) ── */}
      {scene >= 3 && (
        <div
          className="intro-lens-flare"
          style={{
            opacity: scene === 3 && s3 > 0.5 && s3 < 0.92 ? easeOut((s3 - 0.5) / 0.42) * 0.55 : 0,
          }}
        />
      )}

      {/* ── controls ── */}
      {!hideControls && (
        <div className="intro-controls">
          {!playing && !done && (
            <button className="intro-btn" onClick={start}>
              ▶ Play Intro
            </button>
          )}
          {done && (
            <button className="intro-btn" onClick={start}>
              ↺ Replay
            </button>
          )}
        </div>
      )}
    </div>
  );
}
