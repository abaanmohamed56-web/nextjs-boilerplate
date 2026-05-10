import { Composition } from 'remotion';
import { MyComposition } from './MyComposition';
import { SkillPipsAd } from './SkillPipsAd';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComposition"
        component={MyComposition}
        durationInFrames={150}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="SkillPipsAd"
        component={SkillPipsAd}
        durationInFrames={1500}
        fps={60}
        width={1080}
        height={1920}
      />
    </>
  );
};
