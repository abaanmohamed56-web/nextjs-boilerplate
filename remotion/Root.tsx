import { Composition } from "remotion";
import SkillPipsIntro from "./SkillPipsIntro";

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="SkillPipsIntro-1080"
        component={SkillPipsIntro}
        durationInFrames={315}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="SkillPipsIntro-1920"
        component={SkillPipsIntro}
        durationInFrames={315}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
}
