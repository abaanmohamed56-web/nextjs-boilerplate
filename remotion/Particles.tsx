import { useCurrentFrame } from "remotion";

// Simple seeded LCG so particles are identical every render pass
function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

type ParticleProps = {
  count?: number;
  converge?: boolean;
  opacity?: number;
  width: number;
  height: number;
};

export default function Particles({ count = 80, converge = false, opacity = 1, width, height }: ParticleProps) {
  const frame = useCurrentFrame();
  const rand = lcg(42);

  // Build particles from seed — positions advance by frame
  const particles = Array.from({ length: count }, (_, i) => {
    const r = lcg(i * 9973 + 1);
    const startX = r() * width;
    const startY = height + r() * 120;
    const vx = (r() - 0.5) * 0.3;
    const vy = -(0.2 + r() * 0.7);
    const radius = 0.8 + r() * 1.8;
    const hue = 42 + r() * 10;
    const lifeOffset = r() * 200; // stagger spawn

    let x = startX + vx * (frame - lifeOffset);
    let y = startY + vy * (frame - lifeOffset);

    if (converge) {
      const cx = width / 2;
      const cy = height / 2;
      const pullStrength = 0.03;
      const dx = cx - x;
      const dy = cy - y;
      const dist = Math.max(20, Math.sqrt(dx * dx + dy * dy));
      x += (dx / dist) * pullStrength * frame;
      y += (dy / dist) * pullStrength * frame;
    }

    const t = Math.max(0, frame - lifeOffset) / 300;
    const fade = t < 0.15 ? t / 0.15 : t > 0.8 ? Math.max(0, 1 - (t - 0.8) / 0.2) : 1;
    const alpha = fade * opacity * 0.45;

    // wrap vertically
    const wrappedY = ((y % (height + 200)) + height + 200) % (height + 200) - 120;

    return { x, y: wrappedY, radius, hue, alpha };
  });

  return (
    <svg style={{ position: "absolute", inset: 0, pointerEvents: "none" }} width={width} height={height}>
      <defs>
        <filter id="pGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {particles.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.radius}
          fill={`hsla(${p.hue}, 80%, 65%, ${p.alpha.toFixed(3)})`}
          filter="url(#pGlow)"
        />
      ))}
    </svg>
  );
}
