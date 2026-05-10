/**
 * SkillPips — Cinematic Trading Ad
 * 1080 × 1920 · 60 fps · 25 seconds (1500 frames)
 *
 * Scene layout (absolute frames):
 *   Scene 1 — Phone Intro  :   0 –  480  (8 s)
 *   Scene 2 — Unlock       : 420 –  720  (5 s, 60-frame overlap)
 *   Scene 3 — Telegram     : 660 – 1080  (7 s, 60-frame overlap)
 *   Scene 4 — JOIN Tap     :1020 – 1260  (4 s, 60-frame overlap)
 *   Scene 5 — Brand Reveal :1200 – 1500  (5 s, 60-frame overlap)
 */

import React from 'react';
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from 'remotion';
import { Scene1PhoneIntro } from './scenes/Scene1PhoneIntro';
import { Scene2Unlock } from './scenes/Scene2Unlock';
import { Scene3Telegram } from './scenes/Scene3Telegram';
import { Scene4Join } from './scenes/Scene4Join';
import { Scene5BrandReveal } from './scenes/Scene5BrandReveal';

// Wraps a scene with fade-in and/or fade-out driven by local Sequence frame
const SceneWrapper: React.FC<{
  children: React.ReactNode;
  fadeInEnd?: number;
  fadeOutStart?: number;
  fadeOutEnd?: number;
}> = ({ children, fadeInEnd = 0, fadeOutStart = Infinity, fadeOutEnd }) => {
  const frame = useCurrentFrame();

  let opacity = 1;
  if (fadeInEnd > 0) {
    opacity = Math.min(opacity, interpolate(frame, [0, fadeInEnd], [0, 1], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    }));
  }
  if (fadeOutEnd !== undefined) {
    opacity = Math.min(opacity, interpolate(frame, [fadeOutStart, fadeOutEnd], [1, 0], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    }));
  }

  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

export const SkillPipsAd: React.FC = () => (
  <AbsoluteFill style={{ background: '#040404' }}>

    {/* Scene 1: Phone Intro — 0 to 480 */}
    <Sequence from={0} durationInFrames={480}>
      <SceneWrapper fadeOutStart={420} fadeOutEnd={480}>
        <Scene1PhoneIntro />
      </SceneWrapper>
    </Sequence>

    {/* Scene 2: Unlock — 420 to 720 */}
    <Sequence from={420} durationInFrames={300}>
      <SceneWrapper fadeInEnd={40} fadeOutStart={240} fadeOutEnd={300}>
        <Scene2Unlock />
      </SceneWrapper>
    </Sequence>

    {/* Scene 3: Telegram — 660 to 1080 */}
    <Sequence from={660} durationInFrames={420}>
      <SceneWrapper fadeInEnd={40} fadeOutStart={360} fadeOutEnd={420}>
        <Scene3Telegram />
      </SceneWrapper>
    </Sequence>

    {/* Scene 4: JOIN Tap — 1020 to 1260 (handles its own internal black transition) */}
    <Sequence from={1020} durationInFrames={240}>
      <SceneWrapper fadeInEnd={30}>
        <Scene4Join />
      </SceneWrapper>
    </Sequence>

    {/* Scene 5: Brand Reveal — 1200 to 1500 */}
    <Sequence from={1200} durationInFrames={300}>
      <SceneWrapper fadeInEnd={35}>
        <Scene5BrandReveal />
      </SceneWrapper>
    </Sequence>

  </AbsoluteFill>
);
