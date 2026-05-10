'use client';

import { useEffect, useRef, useState } from 'react';
import type { PlayerRef } from '@remotion/player';

const GOLD = '#C9A84C';
const TOTAL_FRAMES = 1500;
const FPS = 60;
// Render at half-res for speed; ffmpeg.wasm will still produce clean output
const SCALE = 0.5;

interface Props {
  playerRef: React.RefObject<PlayerRef | null>;
  playerEl: React.RefObject<HTMLDivElement | null>;
}

type Stage = 'idle' | 'capturing' | 'encoding' | 'done' | 'error';

export function RenderButton({ playerRef, playerEl }: Props) {
  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const abortRef = useRef(false);

  useEffect(() => () => { abortRef.current = true; }, []);

  const capture = async () => {
    if (!playerRef.current || !playerEl.current) return;
    abortRef.current = false;
    setStage('capturing');
    setProgress(0);

    const player = playerRef.current;
    const container = playerEl.current;

    // Lazy-load heavy deps only when user clicks
    const [h2c, { FFmpeg }, { fetchFile, toBlobURL }] = await Promise.all([
      import('html2canvas').then(m => m.default),
      import('@ffmpeg/ffmpeg'),
      import('@ffmpeg/util'),
    ]);

    // ── 1. Capture every other frame (30fps effective) for speed ──
    const STEP = 2; // capture every 2nd frame → 750 frames @ effective 30fps
    const frames: Uint8Array[] = [];

    for (let f = 0; f < TOTAL_FRAMES; f += STEP) {
      if (abortRef.current) return;
      player.seekTo(f);
      // Wait for React to paint the new frame
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      const canvas = await h2c(container, {
        scale: SCALE,
        useCORS: true,
        backgroundColor: '#040404',
        logging: false,
      });
      const blob = await new Promise<Blob>((res) =>
        canvas.toBlob(b => res(b!), 'image/jpeg', 0.88),
      );
      frames.push(new Uint8Array(await blob.arrayBuffer()));
      setProgress(Math.round((f / TOTAL_FRAMES) * 70)); // 0-70% = capture phase
    }

    // ── 2. Encode with ffmpeg.wasm ─────────────────────────────────
    setStage('encoding');
    setProgress(70);

    const ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.9/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    ffmpeg.on('progress', ({ progress: p }) => {
      setProgress(70 + Math.round(p * 28));
    });

    for (let i = 0; i < frames.length; i++) {
      await ffmpeg.writeFile(`frame${String(i).padStart(5, '0')}.jpg`, frames[i]);
    }

    await ffmpeg.exec([
      '-framerate', '30',
      '-i', 'frame%05d.jpg',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '20',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      'output.mp4',
    ]);

    const data = await ffmpeg.readFile('output.mp4');
    const raw = data instanceof Uint8Array ? data : new Uint8Array(data as unknown as ArrayBuffer);
    const buf = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength) as ArrayBuffer;
    const url = URL.createObjectURL(new Blob([buf], { type: 'video/mp4' }));
    setDownloadUrl(url);
    setProgress(100);
    setStage('done');
  };

  const label: Record<Stage, string> = {
    idle: '⬇ Download MP4',
    capturing: `Capturing frames… ${progress}%`,
    encoding: `Encoding MP4… ${progress}%`,
    done: '✓ Download Ready',
    error: 'Error — try again',
  };

  return (
    <div style={{ marginTop: 20, textAlign: 'center' }}>
      {stage === 'done' && downloadUrl ? (
        <a
          href={downloadUrl}
          download="skillpips-ad.mp4"
          style={{
            display: 'inline-block',
            padding: '14px 32px',
            background: `linear-gradient(135deg, ${GOLD} 0%, #F7D977 50%, ${GOLD} 100%)`,
            color: '#000',
            fontWeight: 800,
            fontSize: 15,
            borderRadius: 12,
            textDecoration: 'none',
            letterSpacing: 1,
            boxShadow: `0 0 30px rgba(201,168,76,0.5)`,
          }}
        >
          ⬇ Click to Download skillpips-ad.mp4
        </a>
      ) : (
        <button
          onClick={capture}
          disabled={stage === 'capturing' || stage === 'encoding'}
          style={{
            padding: '14px 32px',
            background: stage === 'idle'
              ? `linear-gradient(135deg, ${GOLD} 0%, #F7D977 50%, ${GOLD} 100%)`
              : 'rgba(201,168,76,0.2)',
            color: stage === 'idle' ? '#000' : GOLD,
            fontWeight: 800,
            fontSize: 15,
            borderRadius: 12,
            border: `1.5px solid ${GOLD}`,
            cursor: stage === 'idle' ? 'pointer' : 'not-allowed',
            letterSpacing: 1,
            minWidth: 260,
            transition: 'all 0.2s',
          }}
        >
          {label[stage]}
        </button>
      )}

      {(stage === 'capturing' || stage === 'encoding') && (
        <div style={{ marginTop: 12 }}>
          <div style={{
            height: 4, background: 'rgba(255,255,255,0.1)',
            borderRadius: 2, width: 260, margin: '0 auto',
          }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: `linear-gradient(90deg, ${GOLD}, #F7D977)`,
              borderRadius: 2, transition: 'width 0.3s',
            }} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 8 }}>
            {stage === 'capturing'
              ? 'Rendering frames in browser — this takes a few minutes'
              : 'Encoding with ffmpeg.wasm…'}
          </p>
        </div>
      )}
    </div>
  );
}
