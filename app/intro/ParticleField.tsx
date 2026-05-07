"use client";

import { useEffect, useRef } from "react";

type ParticleFieldProps = {
  /** 0..1 — overall opacity / spawn rate */
  intensity?: number;
  /** Pull all particles toward the center; used during the logo collapse */
  converge?: boolean;
  className?: string;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  maxLife: number;
  hue: number;
};

export default function ParticleField({
  intensity = 1,
  converge = false,
  className,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const stateRef = useRef({ intensity, converge });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    stateRef.current.intensity = intensity;
    stateRef.current.converge = converge;
  }, [intensity, converge]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      canvas.width = clientWidth * dpr;
      canvas.height = clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = (count: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: Math.random() * w,
          y: h + Math.random() * 80,
          vx: (Math.random() - 0.5) * 0.25,
          vy: -0.15 - Math.random() * 0.6,
          r: 0.6 + Math.random() * 1.8,
          life: 0,
          maxLife: 4000 + Math.random() * 6000,
          hue: 42 + Math.random() * 10,
        });
      }
    };

    spawn(80);

    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      const { intensity: inten, converge: conv } = stateRef.current;

      // Spawn rate scales with intensity
      if (Math.random() < 0.6 * inten) spawn(1);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;

        if (conv) {
          const dx = cx - p.x;
          const dy = cy - p.y;
          const d = Math.max(20, Math.hypot(dx, dy));
          p.vx += (dx / d) * 0.06;
          p.vy += (dy / d) * 0.06;
          p.vx *= 0.96;
          p.vy *= 0.96;
        }

        p.x += p.vx * (dt / 16);
        p.y += p.vy * (dt / 16);

        const lifeT = p.life / p.maxLife;
        const fade =
          lifeT < 0.15
            ? lifeT / 0.15
            : lifeT > 0.8
              ? Math.max(0, 1 - (lifeT - 0.8) / 0.2)
              : 1;
        const alpha = 0.35 * fade * inten;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsla(${p.hue}, 90%, 60%, ${0.6 * fade})`;
        ctx.fill();

        const offscreen =
          p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20;
        if (p.life > p.maxLife || offscreen || (conv && Math.hypot(cx - p.x, cy - p.y) < 8)) {
          particles.splice(i, 1);
        }
      }
      ctx.shadowBlur = 0;

      // Cap particle count
      if (particles.length > 280) particles.splice(0, particles.length - 280);

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
