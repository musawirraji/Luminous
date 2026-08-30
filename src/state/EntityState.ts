/**
 * The state model as data — docs/02-plan.md §2b, verbatim.
 *
 * Each state is a point in uniform space. Two transitions are authored
 * (T1 wake, T5 return); every other ordered pair is derived from the
 * grammar constants at the bottom of this file.
 */

export const VECTOR_KEYS = [
  "emission",
  "coreBias",
  "rim",
  "dispAmp",
  "dispFreq",
  "flowSpeed",
  "warp",
  "condense",
  "drift",
  "dissolve",
  "accentMix",
  "breathPeriod",
  "breathAmp",
] as const;

export type VectorKey = (typeof VECTOR_KEYS)[number];
export type StateVector = Record<VectorKey, number>;

export type EntityStateName =
  | "DORMANT"
  | "AWAKE"
  | "LISTENING"
  | "THINKING"
  | "SPEAKING";

export const STATE_NAMES: readonly EntityStateName[] = [
  "DORMANT",
  "AWAKE",
  "LISTENING",
  "THINKING",
  "SPEAKING",
];

export const STATES: Record<EntityStateName, StateVector> = {
  DORMANT: {
    emission: 0.04,
    coreBias: 0.9,
    rim: 0.05,
    dispAmp: 0.02,
    dispFreq: 0.8,
    flowSpeed: 0.05,
    warp: 0.1,
    condense: 0.955,
    drift: 0,
    dissolve: 0,
    accentMix: 1,
    breathPeriod: 6.8,
    breathAmp: 0.15,
  },
  AWAKE: {
    emission: 0.55,
    coreBias: 0.35,
    rim: 0.5,
    dispAmp: 0.12,
    dispFreq: 1.0,
    flowSpeed: 0.4,
    warp: 0.2,
    condense: 1.0,
    drift: 0.15,
    dissolve: 0,
    accentMix: 0,
    breathPeriod: 5.2,
    breathAmp: 0.5,
  },
  LISTENING: {
    emission: 0.6,
    coreBias: 0.3,
    rim: 0.65,
    dispAmp: 0.13,
    dispFreq: 1.0,
    flowSpeed: 0.55,
    warp: 0.2,
    condense: 1.0,
    drift: 0.25,
    dissolve: 0,
    accentMix: 0,
    breathPeriod: 4.6,
    breathAmp: 0.6,
  },
  THINKING: {
    emission: 0.5,
    coreBias: 0.7,
    rim: 0.35,
    dispAmp: 0.1,
    dispFreq: 1.6,
    flowSpeed: 0.3,
    warp: 0.65,
    condense: 0.975,
    drift: 0.05,
    dissolve: 0,
    accentMix: 0,
    breathPeriod: 6.0,
    breathAmp: 0.3,
  },
  SPEAKING: {
    emission: 0.5,
    coreBias: 0.45,
    rim: 0.55,
    dispAmp: 0.11,
    dispFreq: 1.1,
    flowSpeed: 0.45,
    warp: 0.35,
    condense: 1.0,
    drift: 0.1,
    dissolve: 0,
    accentMix: 0,
    breathPeriod: 5.2,
    breathAmp: 0.35,
  },
};

export function cloneVector(v: StateVector): StateVector {
  return { ...v };
}

/* ------------------------------------------------------------------ */
/* Easing                                                              */
/* ------------------------------------------------------------------ */

export type EaseName =
  | "arrive"
  | "engage"
  | "inward"
  | "release"
  | "settle"
  | "gather";

/** cubic-bezier control points; none are linear */
export const EASE_POINTS: Record<EaseName, [number, number, number, number]> = {
  arrive: [0.16, 1, 0.3, 1], // enters fast, decelerates into place
  engage: [0.33, 0, 0.2, 1],
  inward: [0.65, 0, 0.35, 1],
  release: [0.55, 0, 1, 0.45], // accelerates away
  settle: [0.25, 0, 0.5, 1],
  gather: [0.5, 0, 0.9, 0.4], // the intake before T1's ignite
};

/* ------------------------------------------------------------------ */
/* Derived-transition grammar (all 30 ordered pairs)                   */
/* ------------------------------------------------------------------ */

export type Group = "behaviour" | "light" | "structure";

export const GROUP_OF: Record<VectorKey, Group> = {
  drift: "behaviour",
  flowSpeed: "behaviour",
  emission: "light",
  rim: "light",
  coreBias: "light",
  dispAmp: "structure",
  dispFreq: "structure",
  warp: "structure",
  condense: "structure",
  dissolve: "structure",
  accentMix: "structure",
  breathPeriod: "structure",
  breathAmp: "structure",
};

/**
 * Per-group sub-windows (fractions of the transition). Falling: behaviour
 * leads — the outward acting stops before the light changes. Rising:
 * light leads — it brightens, then starts acting.
 */
export const WINDOWS: Record<
  "rising" | "falling",
  Record<Group, [number, number]>
> = {
  rising: {
    light: [0, 0.6],
    behaviour: [0.2, 0.8],
    structure: [0.3, 1],
  },
  falling: {
    behaviour: [0, 0.4],
    light: [0.2, 0.8],
    structure: [0.3, 1],
  },
};

/** normalisation scales for the distance metric (keys outside 0..1) */
export const DIST_SCALE: Partial<Record<VectorKey, number>> = {
  breathPeriod: 1 / 5,
  dispFreq: 1 / 1.6,
};

export const DERIVED = {
  minMs: 300,
  maxMs: 1600,
  baseMs: 350,
  perDistMs: 1400,
  /** distance below which a move is "near" (engage/inward vs arrive/release) */
  nearFar: 0.5,
} as const;

/* ------------------------------------------------------------------ */
/* Authored transitions                                                */
/* ------------------------------------------------------------------ */

export interface AuthoredSegment {
  /** start/end as fractions of the transition duration */
  from: number;
  to: number;
  ease: EaseName;
  targets: Partial<StateVector>;
}

export const T1_DURATION_MS = 1400;

/**
 * T1 — DORMANT → AWAKE: gather (the intake that makes the wake read as
 * self-propelled), ignite with overshoot (energy reaches the skin), settle.
 */
export const T1_SEGMENTS: AuthoredSegment[] = [
  {
    from: 0,
    to: 0.18,
    ease: "gather",
    targets: { condense: 0.94, emission: 0.03 },
  },
  {
    from: 0.18,
    to: 0.68,
    ease: "arrive",
    targets: {
      emission: 0.62,
      condense: 1.015,
      dispAmp: 0.14,
      rim: 0.5,
      coreBias: 0.35,
      accentMix: 0,
      flowSpeed: 0.4,
      warp: 0.2,
      dispFreq: 1.0,
      drift: 0.15,
      breathPeriod: 5.2,
      breathAmp: 0.55,
    },
  },
  {
    from: 0.68,
    to: 1,
    ease: "settle",
    targets: { emission: 0.55, condense: 1.0, dispAmp: 0.12, breathAmp: 0.5 },
  },
];

export const T5_DURATION_MS = 2600;

/**
 * T5 — → DORMANT (RETURN): release (the form loosens as energy leaves —
 * an exhale, explicitly not T1 reversed), sink (light retreats inward,
 * the skin erodes), bank (what remains re-knits into the ember).
 */
export const T5_SEGMENTS: AuthoredSegment[] = [
  {
    from: 0,
    to: 0.27,
    ease: "release",
    targets: {
      dispAmp: 0.19,
      emission: 0.3,
      rim: 0.2,
      flowSpeed: 0.25,
      drift: 0.05,
    },
  },
  {
    from: 0.27,
    to: 0.73,
    ease: "inward",
    targets: {
      coreBias: 0.9,
      emission: 0.08,
      condense: 0.955,
      dispAmp: 0.03,
      dissolve: 0.3,
      warp: 0.15,
      dispFreq: 0.8,
      accentMix: 0.6,
      breathPeriod: 6.8,
      breathAmp: 0.15,
      drift: 0,
      flowSpeed: 0.05,
    },
  },
  {
    from: 0.73,
    to: 1,
    ease: "settle",
    targets: { dissolve: 0, emission: 0.04, accentMix: 1, rim: 0.05, warp: 0.1 },
  },
];
