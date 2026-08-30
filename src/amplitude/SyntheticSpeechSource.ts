import type { AmplitudeSource } from "./AmplitudeSource";

interface Syllable {
  t0: number;
  t1: number;
  peak: number;
  spike: boolean;
  finalDecay: number;
}

/** deterministic 32-bit PRNG so a demo run is reproducible per seed */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A seeded synthetic speech envelope with real structure: phrases of
 * 1.5–4s separated by 250–900ms silences (occasionally a longer paragraph
 * pause), 4–6Hz syllables with per-syllable peaks, plosive onset spikes
 * on ~20% of syllables, and a sentence-final decay. The schedule is
 * generated sequentially from the PRNG, so it is deterministic in *time*
 * regardless of frame cadence; the internal clock advances by clamped
 * deltas, so a backgrounded tab pauses the speech instead of
 * fast-forwarding it.
 */
export class SyntheticSpeechSource implements AmplitudeSource {
  readonly id = "synthetic";

  private readonly rng: () => number;
  private running = false;
  private lastNowMs: number | null = null;
  private elapsedMs = 0;
  private syllables: Syllable[] = [];
  private horizonMs = 0;

  constructor(seed = 20260830) {
    this.rng = mulberry32(seed);
  }

  start(): void {
    this.running = true;
  }

  stop(): void {
    this.running = false;
    this.lastNowMs = null;
  }

  read(nowMs: number): number {
    if (!this.running) return 0;
    if (this.lastNowMs !== null) {
      this.elapsedMs += Math.min(nowMs - this.lastNowMs, 100);
    }
    this.lastNowMs = nowMs;

    this.extendSchedule(this.elapsedMs + 1000);
    while (this.syllables.length > 0) {
      const first = this.syllables[0];
      if (first && first.t1 < this.elapsedMs) this.syllables.shift();
      else break;
    }

    const syl = this.syllables.find(
      (s) => s.t0 <= this.elapsedMs && this.elapsedMs < s.t1,
    );
    if (!syl) return 0;

    const u = (this.elapsedMs - syl.t0) / (syl.t1 - syl.t0);
    let v = Math.pow(Math.sin(Math.PI * u), 0.7) * syl.peak;
    if (syl.spike && u < 0.12) v = Math.min(1, v + 0.35 * (1 - u / 0.12));
    return v * syl.finalDecay;
  }

  dispose(): void {
    this.stop();
    this.syllables = [];
  }

  private extendSchedule(untilMs: number): void {
    while (this.horizonMs < untilMs) this.appendPhrase();
  }

  private appendPhrase(): void {
    const r = this.rng;
    const phraseMs = 1500 + r() * 2500;
    const paragraph = r() < 0.18;
    const gapMs = paragraph ? 1500 + r() * 1000 : 250 + r() * 650;

    let t = this.horizonMs;
    const phraseEnd = t + phraseMs;
    while (t < phraseEnd) {
      const sylMs = (1000 / (4 + r() * 2)) * (0.85 + r() * 0.3);
      const t1 = Math.min(t + sylMs, phraseEnd);
      this.syllables.push({
        t0: t,
        t1,
        peak: 0.5 + 0.5 * r(),
        spike: r() < 0.2,
        finalDecay: phraseEnd - t < 300 ? 0.55 : 1,
      });
      // occasional intra-phrase micro pause — breath between clauses
      t = t1 + (r() < 0.12 ? 60 + r() * 120 : 0);
    }
    this.horizonMs = phraseEnd + gapMs;
  }
}
