'use client';

import { Player } from '@remotion/player';
import { SkillPipsAd } from '../../remotion/SkillPipsAd';

export default function VideoPlayer() {
  return (
    <Player
      component={SkillPipsAd}
      durationInFrames={1500}
      fps={60}
      compositionWidth={1080}
      compositionHeight={1920}
      style={{
        width: '100%',
        maxWidth: 420,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.15)',
      }}
      controls
      loop
    />
  );
}
