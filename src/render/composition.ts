/**
 * Composition constants (docs/02-plan.md §2a).
 *
 * The entity is centred horizontally with its resting centre at 47% of
 * viewport height — the optical-centre correction for a single mass on a
 * full-bleed dark field. DORMANT sinks ~2% of viewport height below that,
 * so waking/sleeping breathe vertically without an explicit translation.
 */
export const CAMERA_Z = 6.1;
export const CAMERA_FOV = 40; // vertical, degrees

/** world-units of half the viewport height at the entity's plane */
const HALF_HEIGHT = Math.tan((CAMERA_FOV / 2) * (Math.PI / 180)) * CAMERA_Z;

/** fraction of viewport height per world unit (for ground-halo tracking) */
export const SCREEN_FRAC_PER_WORLD = 1 / (2 * HALF_HEIGHT);

/** +3% of viewport height above geometric centre */
export const BASE_Y = 0.06 * HALF_HEIGHT;

/** DORMANT rest sits 2% of viewport height lower (scaled by uAccentMix) */
export const SINK_Y = 0.04 * HALF_HEIGHT;
