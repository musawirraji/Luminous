/**
 * The state machine. Pure TypeScript: no three.js, no React.
 *
 * It owns the live uniform vector and how it moves. Two transitions are
 * authored (T1 wake, T5 return); every other ordered pair is derived from
 * the grammar in EntityState.ts. A new request always snapshots the
 * CURRENT interpolated vector — never the nominal state being left — so
 * interruption continuity is structural, not special-cased.
 */
import { cubicBezier, clamp01 } from "./easing";
import {
  DERIVED,
  DIST_SCALE,
  EASE_POINTS,
  GROUP_OF,
  STATES,
  T1_DURATION_MS,
  T1_SEGMENTS,
  T5_DURATION_MS,
  T5_SEGMENTS,
  VECTOR_KEYS,
  WINDOWS,
  cloneVector,
  type AuthoredSegment,
  type EaseName,
  type EntityStateName,
  type Group,
  type StateVector,
} from "./EntityState";

export type MachineLabel = EntityStateName | "RETURNING";
export type RequestName = EntityStateName | "RETURN";

const EASE: Record<EaseName, (u: number) => number> = Object.fromEntries(
  Object.entries(EASE_POINTS).map(([name, [x1, y1, x2, y2]]) => [
    name,
    cubicBezier(x1, y1, x2, y2),
  ]),
) as Record<EaseName, (u: number) => number>;

interface AuthoredTransition {
  kind: "authored";
  label: MachineLabel;
  target: EntityStateName;
  t0: number;
  durationMs: number;
  segments: AuthoredSegment[];
  /** cumulative absolute target vector per segment */
  cumTargets: StateVector[];
  segIndex: number;
  segStart: StateVector;
}

interface DerivedTransition {
  kind: "derived";
  target: EntityStateName;
  t0: number;
  durationMs: number;
  ease: EaseName;
  windows: Record<Group, [number, number]>;
  from: StateVector;
}

type Transition = AuthoredTransition | DerivedTransition;

/** range-normalised L2 distance, calibrated so state-to-state moves land
 *  in 0..~1 (docs/02-plan.md §2b: dist = L2 / 2) */
export function vectorDistance(a: StateVector, b: StateVector): number {
  let sum = 0;
  for (const k of VECTOR_KEYS) {
    const d = (a[k] - b[k]) * (DIST_SCALE[k] ?? 1);
    sum += d * d;
  }
  return Math.sqrt(sum) / 2;
}

export class StateMachine {
  /** live interpolated uniform vector — the renderer reads, never writes */
  readonly vector: StateVector = cloneVector(STATES.DORMANT);

  private state: EntityStateName = "DORMANT";
  private transition: Transition | null = null;

  /** the resting state, or the state being left while transitioning */
  get current(): EntityStateName {
    return this.state;
  }

  /** the state we are in or heading to */
  get targetName(): EntityStateName {
    return this.transition?.target ?? this.state;
  }

  /** what diagnostics shows: RETURNING during T5, else the destination */
  get label(): MachineLabel {
    if (!this.transition) return this.state;
    return this.transition.kind === "authored"
      ? this.transition.label
      : this.transition.target;
  }

  get inTransition(): boolean {
    return this.transition !== null;
  }

  request(name: RequestName, nowMs: number): void {
    if (name === "RETURN") {
      if (this.state === "DORMANT" && !this.transition) return;
      this.beginAuthored("DORMANT", "RETURNING", T5_SEGMENTS, T5_DURATION_MS, nowMs);
      return;
    }
    if (this.transition ? this.transition.target === name : this.state === name)
      return;
    if (name === "AWAKE" && this.state === "DORMANT" && !this.transition) {
      this.beginAuthored("AWAKE", "AWAKE", T1_SEGMENTS, T1_DURATION_MS, nowMs);
      return;
    }
    this.beginDerived(name, nowMs);
  }

  tick(nowMs: number): void {
    const t = this.transition;
    if (!t) return;
    const p = (nowMs - t.t0) / t.durationMs;
    if (p >= 1) {
      Object.assign(this.vector, STATES[t.target]);
      this.state = t.target;
      this.transition = null;
      return;
    }
    if (t.kind === "derived") this.tickDerived(t, p);
    else this.tickAuthored(t, p);

    if (import.meta.env.DEV) {
      for (const k of VECTOR_KEYS) {
        if (!Number.isFinite(this.vector[k]))
          throw new Error(`non-finite uniform ${k} during transition`);
      }
    }
  }

  private tickDerived(t: DerivedTransition, p: number): void {
    const to = STATES[t.target];
    const ease = EASE[t.ease];
    for (const k of VECTOR_KEYS) {
      const [a, b] = t.windows[GROUP_OF[k]];
      const e = ease(clamp01((p - a) / (b - a)));
      this.vector[k] = t.from[k] + (to[k] - t.from[k]) * e;
    }
  }

  private tickAuthored(t: AuthoredTransition, p: number): void {
    let idx = t.segments.findIndex((s) => p < s.to);
    if (idx === -1) idx = t.segments.length - 1;
    if (idx !== t.segIndex) {
      // A segment begins from wherever the vector actually is — this is
      // also what makes an interrupted authored transition seamless.
      t.segIndex = idx;
      t.segStart = cloneVector(this.vector);
    }
    const seg = t.segments[idx];
    const target = t.cumTargets[idx];
    if (!seg || !target) return;
    const e = EASE[seg.ease](clamp01((p - seg.from) / (seg.to - seg.from)));
    for (const k of VECTOR_KEYS) {
      this.vector[k] = t.segStart[k] + (target[k] - t.segStart[k]) * e;
    }
  }

  private beginAuthored(
    target: EntityStateName,
    label: MachineLabel,
    segments: AuthoredSegment[],
    durationMs: number,
    nowMs: number,
  ): void {
    const snapshot = cloneVector(this.vector);
    const cumTargets: StateVector[] = [];
    let acc = snapshot;
    for (const seg of segments) {
      acc = { ...acc, ...seg.targets };
      cumTargets.push(acc);
    }
    // the final segment must land exactly on the destination state
    cumTargets[cumTargets.length - 1] = cloneVector(STATES[target]);
    this.transition = {
      kind: "authored",
      label,
      target,
      t0: nowMs,
      durationMs,
      segments,
      cumTargets,
      segIndex: -1,
      segStart: snapshot,
    };
  }

  private beginDerived(target: EntityStateName, nowMs: number): void {
    const from = cloneVector(this.vector);
    const to = STATES[target];
    const dist = vectorDistance(from, to);
    const rising = to.emission >= from.emission;
    const near = dist < DERIVED.nearFar;
    const ease: EaseName = rising
      ? near
        ? "engage"
        : "arrive"
      : near
        ? "inward"
        : "release";
    const durationMs = Math.min(
      DERIVED.maxMs,
      Math.max(DERIVED.minMs, DERIVED.baseMs + DERIVED.perDistMs * dist),
    );
    this.transition = {
      kind: "derived",
      target,
      t0: nowMs,
      durationMs,
      ease,
      windows: WINDOWS[rising ? "rising" : "falling"],
      from,
    };
  }
}
