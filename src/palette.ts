/**
 * The only colour definitions in the codebase.
 *
 * Every hex is a sampled value from docs/01-research.md (green family,
 * pooled luminance ladder + biolum-fungi-05 / aurora-green-04 spot
 * samples). No colour may be introduced anywhere else — shaders receive
 * these via uniforms, CSS duplicates `ground` by necessity (see
 * styles.css).
 */
export const PALETTE = {
  /** green-family L05 pool — the toned near-black, never #000000 */
  ground: "#040703",
  /** green-family L25 — moss shadow */
  shadow: "#081306",
  /** green-family L50 — body */
  body: "#1a3011",
  /** green-family L75 — phosphor glow */
  glow: "#297217",
  /** green-family L95 — gill highlight */
  highlight: "#3ae05b",
  /** biolum-fungi-05 core — green survives into the white-out */
  whiteout: "#acffc3",
  /** aurora-green-04 dominant — olive/moss accent, −17° from the body hue;
   *  its job is to tint the DORMANT ember and ground halo so sleeping
   *  light reads as a different kind of light from waking light */
  accent: "#324816",
} as const;

export type PaletteKey = keyof typeof PALETTE;

/**
 * Hex → [r, g, b] in 0..1. Raw values: colour management and tone mapping
 * are disabled (Canvas `flat linear`), so what is sampled is what is
 * displayed.
 */
export function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 0xff) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255];
}
