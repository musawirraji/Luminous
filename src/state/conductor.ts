import { AmplitudeBus } from "../amplitude/AmplitudeBus";
import { StateMachine, type MachineLabel } from "./machine";

const TAU = Math.PI * 2;

/** deterministic 1-D value noise for slow modulations */
function hash(n: number): number {
  const s = Math.sin(n) * 43758.5453;
  return s - Math.floor(s);
}

function vnoise(t: number): number {
  const i = Math.floor(t);
  const f = t - i;
  const u = f * f * (3 - 2 * f);
  return hash(i) * (1 - u) + hash(i + 1) * u;
}

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/**
 * One breath cycle, phase 0..1 → 0..1. Never a sine: inhale 35% (active,
 * ease-in-out), exhale 55% (passive decaying recoil), rest 10% — the
 * sampled I:E ≈ 1:2 physiology from docs/01-research.md §1c.
 */
export function breathEnvelope(phase: number): number {
  if (phase < 0.35) {
    const u = phase / 0.35;
    return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  }
  if (phase < 0.9) {
    const u = (phase - 0.35) / 0.55;
    return Math.pow(1 - u, 1.5);
  }
  return 0;
}

/** final per-frame values, written onto the uniforms by the renderer */
export interface UniformFrame {
  /** pre-integrated flow time (dt × flowSpeed summed) */
  time: number;
  emission: number;
  coreBias: number;
  rim: number;
  dispAmp: number;
  dispFreq: number;
  warp: number;
  condense: number;
  dissolve: number;
  accentMix: number;
  driftX: number;
  driftY: number;
  amp: number;
  groundGlow: number;
  label: MachineLabel;
}

/**
 * The conductor sits between the machine (what the entity is doing) and
 * the renderer (what the uniforms are this frame). It owns the clocks —
 * breath, drift, flow-time integration, the dormant swell — and folds in
 * the amplitude bus. Pure TS; the renderer reads its output and nothing
 * here touches three.js.
 */
export class Conductor {
  private time = 0;
  private flowTime = 0;
  private breathPhase = 0;
  private reducedMotion = false;

  constructor(
    private readonly machine: StateMachine,
    private readonly bus: AmplitudeBus,
  ) {}

  setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
  }

  tick(nowMs: number, rawDtSec: number): UniformFrame {
    // Clamp: a backgrounded tab resumes mid-breath, not mid-lurch.
    const dt = Math.min(rawDtSec, 1 / 30);
    this.time += dt;

    this.machine.tick(nowMs);
    const v = this.machine.vector;
    const label = this.machine.label;

    // SPEAKING intent (state or transition target) arms the envelope so
    // the first syllable lands together with the T4 arrival.
    const speaking = this.machine.targetName === "SPEAKING";
    this.bus.setArmed(speaking);
    const amp = this.bus.tick(nowMs, dt * 1000);

    // Breath: period wobbles ±7% on a 0.013Hz noise so the loop never
    // sits on a lockable period; phase integrates through period changes.
    const period = v.breathPeriod * (1 + 0.07 * (vnoise(this.time * 0.013) * 2 - 1));
    this.breathPhase = (this.breathPhase + dt / period) % 1;
    let breath = breathEnvelope(this.breathPhase) * v.breathAmp;
    if (speaking) breath *= 1 - 0.6 * amp; // breath yields to the voice
    if (this.reducedMotion) breath *= 0.4;

    // DORMANT residual presence: a noise-gated ember swell, roughly every
    // 20s, never periodic.
    const swell =
      label === "DORMANT"
        ? smoothstep(0.78, 0.86, vnoise(this.time * 0.05 + 17.3))
        : 0;

    // Self-initiated micro-drift on three incommensurate frequencies
    // (0.11 / 0.047 / 0.019 Hz) — attention, not orbit.
    const driftAmp = v.drift * (this.reducedMotion ? 0.5 : 1) * 0.06;
    const t = this.time;
    const driftX =
      driftAmp *
      (0.55 * Math.sin(TAU * 0.047 * t + 1.7) + 0.35 * Math.sin(TAU * 0.11 * t + 0.4));
    const driftY =
      driftAmp *
      (0.55 * Math.sin(TAU * 0.019 * t + 4.2) + 0.3 * Math.sin(TAU * 0.11 * t + 2.9));

    // Flow time integrates dt × flowSpeed so a flow-rate change bends the
    // surface motion instead of jumping it.
    this.flowTime += dt * v.flowSpeed;

    // Reduced motion drops the SPEAKING displacement flare entirely and
    // softens the emission response; the piece never freezes.
    const ampEmission = amp * (this.reducedMotion ? 0.4 : 1) * 0.22;
    const ampDisp = this.reducedMotion ? 0 : amp * 0.09;

    const emission = v.emission * (1 + 0.1 * breath + 0.5 * swell) + ampEmission;

    return {
      time: this.flowTime,
      emission,
      coreBias: v.coreBias,
      rim: v.rim,
      dispAmp: v.dispAmp * (1 + 0.35 * breath) + ampDisp,
      dispFreq: v.dispFreq,
      warp: v.warp,
      condense:
        v.condense * (1 + 0.006 * breath + 0.004 * swell) +
        0.012 * amp * (this.reducedMotion ? 0.4 : 1),
      dissolve: v.dissolve,
      accentMix: v.accentMix,
      driftX,
      driftY,
      amp,
      groundGlow: 0.02 + 0.24 * emission,
      label,
    };
  }
}
