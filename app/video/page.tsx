'use client';

import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(() => import('./VideoPlayer'), { ssr: false });

export default function VideoPage() {
  return (
    <div
      style={{ background: '#050505', minHeight: '100vh' }}
      className="flex flex-col items-center justify-center px-4 py-16"
    >
      <div className="mb-10 text-center">
        <p
          style={{ color: '#C9A84C', letterSpacing: '0.3em', fontSize: 12, textTransform: 'uppercase' }}
          className="mb-3"
        >
          Remotion · Cinematic Ad
        </p>
        <h1
          style={{
            color: '#fff',
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          SkillPips VIP
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 8, fontSize: 14 }}>
          1080 × 1920 · 60 fps · 25 s
        </p>
      </div>

      <VideoPlayer />

      <p style={{ color: 'rgba(255,255,255,0.2)', marginTop: 24, fontSize: 12, letterSpacing: '0.15em' }}>
        LIVE SIGNALS · ELITE COMMUNITY · REAL RESULTS
      </p>
    </div>
  );
}
