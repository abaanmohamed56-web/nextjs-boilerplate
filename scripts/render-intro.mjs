#!/usr/bin/env node
/**
 * Render the SkillPips intro animation to an MP4.
 *
 * Strategy: launch headless Chromium, override the page's clock (Date.now,
 * performance.now, requestAnimationFrame) so we can advance time
 * deterministically frame-by-frame. Capture each frame as PNG via CDP, then
 * encode with ffmpeg.
 *
 * Usage: node scripts/render-intro.mjs <width> <height> <output.mp4>
 */

import puppeteer from "puppeteer";
import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const [, , widthArg, heightArg, outArg] = process.argv;
const WIDTH = parseInt(widthArg ?? "1080", 10);
const HEIGHT = parseInt(heightArg ?? "1080", 10);
const OUT = outArg ?? `public/skillpips-intro-${WIDTH}x${HEIGHT}.mp4`;
const FPS = 30;
const DURATION_MS = 10500;
const TOTAL_FRAMES = Math.ceil((DURATION_MS / 1000) * FPS);
const URL = `http://127.0.0.1:3210/intro?autoplay=1&hideControls=1`;

const FRAMES_DIR = path.resolve(`.render-frames-${WIDTH}x${HEIGHT}`);

async function main() {
  await rm(FRAMES_DIR, { recursive: true, force: true });
  await mkdir(FRAMES_DIR, { recursive: true });

  console.log(`[render] launching chromium @ ${WIDTH}x${HEIGHT}…`);
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--hide-scrollbars",
      "--disable-web-security",
      `--window-size=${WIDTH},${HEIGHT}`,
    ],
    defaultViewport: { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 },
  });

  const page = await browser.newPage();

  // Inject deterministic clock BEFORE any page script runs.
  await page.evaluateOnNewDocument(() => {
    const w = window;
    let virtualNow = 0;
    const epoch = 1700000000000;
    const rafQueue = [];

    w.__virtualNow = () => virtualNow;
    w.__advanceTime = (ms) => {
      virtualNow += ms;
    };
    w.__flushRaf = () => {
      const callbacks = rafQueue.splice(0, rafQueue.length);
      for (const cb of callbacks) {
        try { cb(virtualNow); } catch (e) { console.error(e); }
      }
    };

    const origPerf = w.performance;
    w.performance = new Proxy(origPerf, {
      get(target, prop) {
        if (prop === "now") return () => virtualNow;
        const v = target[prop];
        return typeof v === "function" ? v.bind(target) : v;
      },
    });

    const origDateNow = Date.now;
    Date.now = () => epoch + virtualNow;

    w.requestAnimationFrame = (cb) => {
      rafQueue.push(cb);
      return rafQueue.length;
    };
    w.cancelAnimationFrame = (id) => {
      // best-effort no-op for our deterministic loop
    };
  });

  console.log(`[render] navigating ${URL}`);
  await page.goto(URL, { waitUntil: "networkidle0", timeout: 30000 });

  // Wait for React to mount.
  await page.waitForSelector(".intro-root", { timeout: 10000 });
  // Give React a moment to mount + setTimeout(50) inside autoplay to fire.
  await page.evaluate(async () => {
    await new Promise((r) => setTimeout(r, 200));
  });

  // The setTimeout(50) inside autoplay uses real time; flush it.
  await page.evaluate(() => {
    // ensure component state has actually started
    return new Promise((r) => setTimeout(r, 100));
  });

  const client = await page.createCDPSession();

  console.log(`[render] capturing ${TOTAL_FRAMES} frames…`);
  const frameMs = 1000 / FPS;

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    // Advance virtual clock + flush rAF callbacks (twice — particle field
    // schedules a follow-up rAF inside its tick).
    await page.evaluate((dt) => {
      window.__advanceTime(dt);
      window.__flushRaf();
      window.__flushRaf();
    }, frameMs);

    // Allow React to commit any state updates triggered by the rAF callbacks.
    await page.evaluate(
      () => new Promise((r) => setTimeout(r, 0)),
    );

    const { data } = await client.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
    });
    const buf = Buffer.from(data, "base64");
    const name = `frame-${String(i).padStart(5, "0")}.png`;
    await writeFile(path.join(FRAMES_DIR, name), buf);

    if (i % 30 === 0) {
      console.log(`[render]   frame ${i}/${TOTAL_FRAMES}`);
    }
  }

  await browser.close();

  console.log(`[render] encoding ${OUT}…`);
  await new Promise((resolve, reject) => {
    const ff = spawn(
      "ffmpeg",
      [
        "-y",
        "-framerate", String(FPS),
        "-i", path.join(FRAMES_DIR, "frame-%05d.png"),
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "medium",
        "-crf", "18",
        "-movflags", "+faststart",
        OUT,
      ],
      { stdio: "inherit" },
    );
    ff.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
  });

  await rm(FRAMES_DIR, { recursive: true, force: true });
  console.log(`[render] done → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
