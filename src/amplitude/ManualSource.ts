import type { AmplitudeSource } from "./AmplitudeSource";

/**
 * Keyboard-held amplitude level: ArrowUp/ArrowDown nudge ±0.1 (keyboard
 * only, per the controls constraint). Reports the held level directly —
 * the bus's smoother still shapes it.
 */
export class ManualSource implements AmplitudeSource {
  readonly id = "manual";

  private level = 0;
  private running = false;

  nudge(delta: number): void {
    this.level = Math.min(1, Math.max(0, this.level + delta));
  }

  get current(): number {
    return this.level;
  }

  start(): void {
    this.running = true;
  }

  stop(): void {
    this.running = false;
  }

  read(): number {
    return this.running ? this.level : 0;
  }

  dispose(): void {
    this.stop();
  }
}
