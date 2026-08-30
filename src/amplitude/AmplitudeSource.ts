/**
 * A source of instantaneous amplitude, 0..1, unsmoothed.
 *
 * The seam for future real inputs (docs/02-plan.md §2c): a microphone
 * source is an AnalyserNode RMS in read(); a TTS source taps an <audio>
 * element the same way. Sources are pull-based — the render loop calls
 * read() once per frame — and never touch a uniform, a material, or
 * React. Smoothing is the renderer's job (EnvelopeSmoother), so sources
 * are allowed to be raw and jittery.
 */
export interface AmplitudeSource {
  readonly id: string;
  /** Begin producing values (idempotent). */
  start(): void;
  /** Stop producing values; read() returns 0 after this. */
  stop(): void;
  /** Instantaneous amplitude at `nowMs`. Called once per frame. */
  read(nowMs: number): number;
  /** Release any held resources (audio nodes, timers). */
  dispose(): void;
}
