/**
 * Cubic-bezier easing, equivalent to CSS cubic-bezier(x1, y1, x2, y2).
 * Solved by Newton–Raphson with a bisection fallback — no dependency, no
 * lookup table, exact enough that the acceptance durations hold.
 */
export function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): (u: number) => number {
  const ax = 3 * x1 - 3 * x2 + 1;
  const bx = 3 * x2 - 6 * x1;
  const cx = 3 * x1;
  const ay = 3 * y1 - 3 * y2 + 1;
  const by = 3 * y2 - 6 * y1;
  const cy = 3 * y1;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (u: number): number => {
    if (u <= 0) return 0;
    if (u >= 1) return 1;
    let t = u;
    for (let i = 0; i < 6; i++) {
      const x = sampleX(t) - u;
      const d = sampleDX(t);
      if (Math.abs(x) < 1e-5) return sampleY(t);
      if (Math.abs(d) < 1e-6) break;
      t -= x / d;
    }
    let lo = 0;
    let hi = 1;
    t = u;
    while (hi - lo > 1e-5) {
      if (sampleX(t) < u) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return sampleY(t);
  };
}

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
