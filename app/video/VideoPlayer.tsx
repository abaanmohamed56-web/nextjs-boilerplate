"use client";

import { Player } from "@remotion/player";
import { MyComposition } from "../../remotion/MyComposition";

export default function VideoPlayer() {
  return (
    <Player
      component={MyComposition}
      durationInFrames={150}
      fps={30}
      compositionWidth={1280}
      compositionHeight={720}
      style={{ width: "100%", borderRadius: 8, overflow: "hidden" }}
      controls
    />
  );
}
