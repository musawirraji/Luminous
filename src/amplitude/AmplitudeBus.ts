import { EnvelopeSmoother } from "./EnvelopeSmoother";
import type { AmplitudeSource } from "./AmplitudeSource";

/**
 * Holds the active amplitude source and owns the smoothing. SPEAKING
 * arms it; every other state disarms it. Visibility pauses hold the
 * envelope value so a backgrounded tab resumes without a jump.
 */
export class AmplitudeBus {
  private source: AmplitudeSource | null = null;
  private readonly smoother = new EnvelopeSmoother(40, 300);
  private armed = false;
  private pausedByVisibility = false;

  setSource(source: AmplitudeSource | null): void {
    if (source === this.source) return;
    this.source?.stop();
    this.source = source;
    if (this.armed) source?.start();
  }

  setArmed(armed: boolean): void {
    if (armed === this.armed) return;
    this.armed = armed;
    if (armed) this.source?.start();
    else this.source?.stop();
  }

  pause(): void {
    this.pausedByVisibility = true;
  }

  resume(): void {
    this.pausedByVisibility = false;
  }

  get sourceId(): string {
    return this.source?.id ?? "none";
  }

  get value(): number {
    return this.smoother.value;
  }

  tick(nowMs: number, dtMs: number): number {
    const raw =
      this.armed && !this.pausedByVisibility && this.source
        ? this.source.read(nowMs)
        : 0;
    return this.smoother.step(raw, dtMs);
  }
}
