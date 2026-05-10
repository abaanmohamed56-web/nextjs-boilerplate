'use client';

import { useRef } from 'react';
import { Player } from '@remotion/player';
import type { PlayerRef } from '@remotion/player';
import { SkillPipsAd } from '../../remotion/SkillPipsAd';
import { RenderButton } from './RenderButton';

export default function VideoPlayer() {
  const playerRef = useRef<PlayerRef>(null);
  const playerEl = useRef<HTMLDivElement>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div ref={playerEl} style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.15)' }}>
        <Player
          ref={playerRef}
          component={SkillPipsAd}
          durationInFrames={1500}
          fps={60}
          compositionWidth={1080}
          compositionHeight={1920}
          style={{ width: '100%', maxWidth: 380 }}
          controls
          loop
        />
      </div>
      <RenderButton playerRef={playerRef} playerEl={playerEl} />
    </div>
  );
}
