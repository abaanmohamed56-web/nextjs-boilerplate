import type { Metadata } from "next";
import { Suspense } from "react";
import IntroAnimation from "./IntroAnimation";

export const metadata: Metadata = {
  title: "SkillPips — Intro",
  description: "Cinematic brand intro for SkillPips premium forex trading.",
};

export default function IntroPage() {
  return (
    <Suspense fallback={<div style={{ background: "#000", width: "100%", height: "100vh" }} />}>
      <IntroAnimation />
    </Suspense>
  );
}
