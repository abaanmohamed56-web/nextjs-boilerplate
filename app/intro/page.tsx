import type { Metadata } from "next";
import IntroAnimation from "./IntroAnimation";

export const metadata: Metadata = {
  title: "SkillPips — Intro",
  description: "Cinematic brand intro for SkillPips premium forex trading.",
};

export default function IntroPage() {
  return <IntroAnimation />;
}
