/**
 * Quality tiers, designed in from the start (docs/01-research.md §1b).
 *
 * High tier is the shipped default — the deliverable is judged in a laptop
 * browser. Low tier models the Raspberry Pi 4/5 deployment target: it is
 * selected only by an explicit `?tier=low` URL param and exists to be
 * measured (diagnostics stays available), not to be shipped as the demo.
 */
export type Tier = "high" | "low";

export interface Quality {
  readonly tier: Tier;
  /** device-pixel-ratio cap; < 1 renders at reduced scale and upscales */
  readonly dprCap: number;
  /** icosphere subdivision order (6 ≈ 41k verts, 4 ≈ 2.6k) */
  readonly icoOrder: number;
  /** displacement noise octaves compiled into the vertex shader */
  readonly octaves: 2 | 3;
  /** true: recompute normals from tangent-offset displacement samples in
   *  the vertex shader; false: cheap screen-space derivative normals */
  readonly tangentNormals: boolean;
  readonly bloom: boolean;
  readonly bloomLevels: number;
  readonly chromaticAberration: boolean;
  /** shader-side rim widening that stands in for bloom's halo when bloom
   *  is off (low tier gives up the long soft tails, not the glow) */
  readonly haloBoost: number;
}

function detect(): Quality {
  const low =
    typeof location !== "undefined" &&
    new URLSearchParams(location.search).get("tier") === "low";
  return low
    ? {
        tier: "low",
        dprCap: 0.75,
        icoOrder: 4,
        octaves: 2,
        tangentNormals: false,
        bloom: false,
        bloomLevels: 0,
        chromaticAberration: false,
        haloBoost: 0.4,
      }
    : {
        tier: "high",
        dprCap: 2,
        icoOrder: 6,
        octaves: 3,
        tangentNormals: true,
        bloom: true,
        bloomLevels: 5,
        chromaticAberration: true,
        haloBoost: 0,
      };
}

export const QUALITY: Quality = detect();
