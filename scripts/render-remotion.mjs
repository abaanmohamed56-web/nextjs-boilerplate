#!/usr/bin/env node
/**
 * Render both SkillPips intro compositions using @remotion/renderer.
 * Usage: node scripts/render-remotion.mjs
 */

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const entry = path.join(root, "remotion", "index.ts");

const CHROME = "/root/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome";

const OUTPUTS = [
  { id: "SkillPipsIntro-1080", out: "public/skillpips-intro-1080x1080.mp4" },
  { id: "SkillPipsIntro-1920", out: "public/skillpips-intro-1920x1080.mp4" },
];

async function main() {
  console.log("Bundling Remotion composition...");
  const bundleLocation = await bundle({
    entryPoint: entry,
    onProgress: (p) => process.stdout.write(`\r  bundle ${p}%   `),
  });
  console.log("\nBundle ready:", bundleLocation);

  for (const { id, out } of OUTPUTS) {
    console.log(`\nRendering ${id} -> ${out}`);

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id,
      browserExecutable: CHROME,
      chromiumOptions: { disableWebSecurity: true },
    });

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: path.join(root, out),
      browserExecutable: CHROME,
      chromiumOptions: { disableWebSecurity: true },
      crf: 18,
      onProgress: ({ renderedFrames, encodedFrames, stitchStage }) => {
        process.stdout.write(
          `\r  rendered=${renderedFrames}/${composition.durationInFrames}  encoded=${encodedFrames}  stage=${stitchStage}   `
        );
      },
    });

    console.log(`\nDone: ${out}`);
  }

  console.log("\nAll renders complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
