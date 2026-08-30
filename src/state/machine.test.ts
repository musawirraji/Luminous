/**
 * The scripted key sweep (docs/02-plan.md §2e): all 30 ordered pairs of
 * {DORMANT, AWAKE, LISTENING, THINKING, SPEAKING, RETURN}, plus requests
 * fired mid-transition. Asserts: every uniform stays finite, per-tick
 * movement stays under a continuity bound (no pop), and every transition
 * lands on its destination vector.
 */
import { describe, expect, it } from "vitest";

import {
  DIST_SCALE,
  STATES,
  STATE_NAMES,
  VECTOR_KEYS,
  type StateVector,
} from "./EntityState";
import { StateMachine, type RequestName } from "./machine";

const TICK_MS = 1000 / 60;
/** max allowed range-normalised movement of one component per 60fps tick */
const CONTINUITY_BOUND = 0.2;

function normDelta(k: (typeof VECTOR_KEYS)[number], a: number, b: number): number {
  return Math.abs(a - b) * (DIST_SCALE[k] ?? 1);
}

const ALL_REQUESTS: readonly RequestName[] = [...STATE_NAMES, "RETURN"];

function destinationOf(req: RequestName): StateVector {
  return req === "RETURN" ? STATES.DORMANT : STATES[req];
}

/** tick until idle (bounded), asserting finiteness + continuity throughout */
function run(machine: StateMachine, startMs: number, maxMs = 6000): number {
  let now = startMs;
  let prev = { ...machine.vector };
  const deadline = startMs + maxMs;
  while (now < deadline) {
    now += TICK_MS;
    machine.tick(now);
    for (const k of VECTOR_KEYS) {
      const v = machine.vector[k];
      expect(Number.isFinite(v), `${k} finite`).toBe(true);
      expect(
        normDelta(k, v, prev[k]),
        `${k} continuity (${prev[k]} -> ${v})`,
      ).toBeLessThanOrEqual(CONTINUITY_BOUND);
    }
    prev = { ...machine.vector };
    if (!machine.inTransition) return now;
  }
  throw new Error("transition did not complete within bound");
}

function settleInto(machine: StateMachine, req: RequestName, now: number): number {
  machine.request(req, now);
  return run(machine, now);
}

describe("state machine key sweep", () => {
  it("covers all 30 ordered pairs without pop or NaN and lands on target", () => {
    for (const from of ALL_REQUESTS) {
      for (const to of ALL_REQUESTS) {
        if (from === to) continue;
        const machine = new StateMachine();
        let now = 0;
        now = settleInto(machine, from, now);
        machine.request(to, now);
        now = run(machine, now);
        const dest = destinationOf(to);
        for (const k of VECTOR_KEYS) {
          expect(machine.vector[k], `${from}->${to} ${k}`).toBeCloseTo(
            dest[k],
            3,
          );
        }
      }
    }
  });

  it("absorbs requests fired mid-transition from the live vector", () => {
    for (const first of ALL_REQUESTS) {
      for (const second of ALL_REQUESTS) {
        if (first === second) continue;
        const machine = new StateMachine();
        let now = settleInto(machine, "LISTENING", 0);
        machine.request(first, now);
        // interrupt one third of the way in
        for (let i = 0; i < 8; i++) {
          now += TICK_MS;
          machine.tick(now);
        }
        const before = { ...machine.vector };
        machine.request(second, now);
        now += TICK_MS;
        machine.tick(now);
        for (const k of VECTOR_KEYS) {
          expect(Number.isFinite(machine.vector[k])).toBe(true);
          expect(
            normDelta(k, machine.vector[k], before[k]),
          ).toBeLessThanOrEqual(CONTINUITY_BOUND);
        }
        run(machine, now);
      }
    }
  });

  it("key-mash storm stays continuous", () => {
    const machine = new StateMachine();
    let now = 0;
    let prev = { ...machine.vector };
    // a deterministic pseudo-random mash: request every 90ms for 12s
    let seed = 0x9e3779b9;
    const rand = () => {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return (seed >>> 0) / 0xffffffff;
    };
    for (let ms = 0; ms < 12000; ms += TICK_MS) {
      now += TICK_MS;
      if (Math.floor(ms / 90) !== Math.floor((ms - TICK_MS) / 90)) {
        const pick = ALL_REQUESTS[Math.floor(rand() * ALL_REQUESTS.length)];
        if (pick) machine.request(pick, now);
      }
      machine.tick(now);
      for (const k of VECTOR_KEYS) {
        expect(Number.isFinite(machine.vector[k])).toBe(true);
        expect(normDelta(k, machine.vector[k], prev[k])).toBeLessThanOrEqual(
          CONTINUITY_BOUND,
        );
      }
      prev = { ...machine.vector };
    }
  });
});
