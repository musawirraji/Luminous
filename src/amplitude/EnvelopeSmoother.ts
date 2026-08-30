/**
 * One-pole asymmetric envelope follower. Fast attack so onsets land, slow
 * release so decay is continuous — release runs ~8× the attack, per the
 * DSP guidance recorded in docs/01-research.md §1c. Raw per-frame
 * amplitude straight onto a surface is the "broken graphic equaliser";
 * this is the difference.
 */
export class EnvelopeSmoother {
  value = 0;

  constructor(
    private readonly attackMs: number,
    private readonly releaseMs: number,
  ) {}

  step(target: number, dtMs: number): number {
    const tau = target > this.value ? this.attackMs : this.releaseMs;
    this.value += (target - this.value) * (1 - Math.exp(-dtMs / tau));
    return this.value;
  }
}
