import { Easing, interpolate } from 'remotion';

export const expoOut = Easing.bezier(0.16, 1, 0.3, 1);
export const expoIn = Easing.bezier(0.7, 0, 1, 1);
export const cinematic = Easing.bezier(0.25, 0.46, 0.45, 0.94);
export const overshoot = Easing.bezier(0.34, 1.56, 0.64, 1);
export const smoothIn = Easing.bezier(0.42, 0, 1, 1);

export const lerp = (
  frame: number,
  from: number,
  to: number,
  startVal: number,
  endVal: number,
  easing: (t: number) => number = expoOut,
): number =>
  interpolate(frame, [from, to], [startVal, endVal], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

// Deterministic pseudo-random seeded by index
export const seed = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
