import { Vector3, type IUniform } from "three";

import { PALETTE, rgb } from "../palette";
import { QUALITY } from "./quality";

/**
 * Single source of truth for the entity's uniform names and initial
 * values. The material is constructed from this registry, so a misnamed
 * uniform is a type error, not a silent no-op.
 *
 * Scalar semantics are specified in docs/02-plan.md §2b.
 */
export interface EntityUniforms {
  uTime: IUniform<number>;
  uEmission: IUniform<number>;
  uCoreBias: IUniform<number>;
  uRim: IUniform<number>;
  uDispAmp: IUniform<number>;
  uDispFreq: IUniform<number>;
  uWarp: IUniform<number>;
  uCondense: IUniform<number>;
  uDissolve: IUniform<number>;
  uAccentMix: IUniform<number>;
  uHaloBoost: IUniform<number>;
  uColShadow: IUniform<Vector3>;
  uColBody: IUniform<Vector3>;
  uColGlow: IUniform<Vector3>;
  uColHighlight: IUniform<Vector3>;
  uColWhiteout: IUniform<Vector3>;
  uColAccent: IUniform<Vector3>;
  [uniform: string]: IUniform;
}

/** Singleton, written by the conductor-driven frame, read by the material. */
export const entityUniforms: EntityUniforms = {
  uTime: { value: 0 },
  uEmission: { value: 0.04 },
  uCoreBias: { value: 0.9 },
  uRim: { value: 0.05 },
  uDispAmp: { value: 0.02 },
  uDispFreq: { value: 0.8 },
  uWarp: { value: 0.1 },
  uCondense: { value: 0.955 },
  uDissolve: { value: 0 },
  uAccentMix: { value: 1 },
  uHaloBoost: { value: QUALITY.haloBoost },
  uColShadow: { value: new Vector3(...rgb(PALETTE.shadow)) },
  uColBody: { value: new Vector3(...rgb(PALETTE.body)) },
  uColGlow: { value: new Vector3(...rgb(PALETTE.glow)) },
  uColHighlight: { value: new Vector3(...rgb(PALETTE.highlight)) },
  uColWhiteout: { value: new Vector3(...rgb(PALETTE.whiteout)) },
  uColAccent: { value: new Vector3(...rgb(PALETTE.accent)) },
};
