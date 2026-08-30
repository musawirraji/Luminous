# 03 — Decisions and measurements

What was chosen, why the alternatives lost, and what was actually
measured. Companion to `01-research.md` (evidence) and `02-plan.md`
(specification).

---

## Visual direction: PHOSPHOR (green), not SAFELIGHT (oxblood)

Two directions were designed, both palette-complete and both grounded in
the culled references (`02-plan.md` §2a). The oxblood direction was the
stronger single image; it lost on semantics: this is the face of an
ambient device that listens, and a red light on a microphone-bearing
object is the hardware language of recording and alarm — HAL's colour on
HAL's product category. Green carries bioluminescence in this project's
own references, has more sampled luminance headroom for the SPEAKING
flare (`#3ae05b` and `#acffc3` vs a red ceiling that dies into rose), and
its residual cliché (terminal/night-vision green) attaches to styling this
piece never uses — no glyphs, no scanlines, no flat green wash. The full
argument, including the semantic check that reversed the original red
commitment, is recorded in `01-research.md`.

## Technique: vertex-displaced icosphere

A raymarched SDF was the obvious prestige answer and lost on the
deployment constraint: the eventual target class is a Raspberry Pi 4/5,
where per-pixel × per-step × noise-octave work cannot hold frame rate at
native resolution, and degrading a raymarch degrades the silhouette —
the one thing it buys. GPU particles lost on fill rate and coherence (a
body, not a swarm); metaballs lost on spending budget on geometry the
state model never needs, while drifting toward the AI-blob cliché. The
icosphere puts the expensive term (3-octave domain-warped simplex) on the
axis with ~50× fewer invocations, is one draw call, and every quality
knob degrades smoothness rather than structure. Costs and sources:
`01-research.md` §1b.

Notable implementation decisions:

- **Normals** are rebuilt in the vertex shader from two tangent-frame
  neighbours. The sampling base is deliberately wider (h = 0.11) than the
  vertex spacing — at vertex scale the high noise octave aliases into
  faceted, crystalline normals, which full-resolution captures exposed
  during tuning.
- **Flow time is integrated** (`Σ dt·flowSpeed`) rather than multiplied
  (`t·flowSpeed`), so a change in flow rate bends the motion instead of
  jumping the noise field.
- **Colour fidelity**: tone mapping and colour management are disabled
  (`flat linear`); the sampled hexes are the framebuffer values. Verified
  by pixel-reading the canvas: ground rendered as rgb(5, 8, 4) against
  the sampled `#040703` = rgb(4, 7, 3), inside the ±1 dither amplitude.
- **The transition grammar is derived, not enumerated.** States are
  uniform vectors; curve family follows the sign of the emission change,
  duration follows vector distance, and per-group stagger (behaviour /
  light / structure) is a property of the grammar. Only T1 (wake) and T5
  (return) are authored. A vitest sweep drives all 30 ordered pairs plus
  mid-transition interrupts and a 12-second key-mash storm, asserting
  finiteness, continuity, and arrival.

## Palette provenance

All values sampled, never invented — extraction pipeline and per-image
table in `01-research.md` §1a.

| Role | Hex | Source image |
|---|---|---|
| Ground | `#040703` | green-family L05 pool (`biolum-fungi-05` ground, `aurora-green-04` ground) |
| Moss shadow | `#081306` | green-family L25 pool |
| Body | `#1a3011` | green-family L50 pool |
| Glow | `#297217` | green-family L75 pool |
| Highlight | `#3ae05b` | green-family L95 pool |
| White-out | `#acffc3` | `biolum-fungi-05` core |
| Accent (DORMANT tint) | `#324816` | `aurora-green-04` dominant — hue 86°, −17° from the 103° body, on the far side of the ladder's own emerald drift |

## Type

Space Mono (Colophon Foundry), self-hosted via Fontsource, appears only
in the diagnostics readout: 9px uppercase labels at 0.14em tracking,
12px values at 0.02em, line-height 1.7, coloured only with sampled
palette values. Chosen for its squared terminals and instrument-panel
character — deliberately not a code-editor default, and none of the
banned faces.

## Measured performance

Measured on the development machine: **MacBook Pro, Apple M2 Pro
(8P+4E), 16 GB, macOS 26.5, 120Hz internal display, Chromium-based
browser, 1876×1048 canvas at DPR 2.**

| Metric | High tier (default) | Low tier (`?tier=low`) |
|---|---|---|
| Sustained frame rate | 120 fps (display-capped) | 120 fps (display-capped) |
| p95 frame time | 9.1–9.6 ms | 9.3 ms |
| GPU draw calls / frame | 13 total = 2 scene + 11 post (bloom mip chain + effects) | 3 total = 2 scene + 1 effects |
| Entity geometry | icosphere order 6, 40,962 verts | order 4, 2,562 verts |
| Vertex noise cost | 3 samples × (3 warp + 3 octaves) = 18 simplex/vertex | 1 sample × (3 warp + 2 octaves) = 5 simplex/vertex |

Notes against the budget in `02-plan.md` §2d: the budget line "≤5 post
passes" was written in *passes*; the composer's mipmap bloom internally
issues 11 draw calls (downsample/upsample chain). Logical passes are 3
(scene, bloom, effects+grain). Frame-time budget (p95 ≤ 18ms) holds with
~2× headroom at double the target refresh rate. No texture fetches in
any custom shader; no per-frame allocations in the tick path (frame
object reuse verified by allocation sampling during a 60s soak).

Fragment cost by inspection: entity ≈ 60 ALU (ramp 4 mixes + 4
smoothsteps, two pow for fresnel/facing, dissolve hash behind a branch);
ground ≈ 20 ALU (exp halo + procedural Bayer).

The Raspberry Pi tier remains *modelled, not measured* — no Pi was
available in this environment. The low tier exists, is selectable, is
measurably cheaper (5.5× fewer vertex noise evaluations, 16× fewer
vertices, no bloom chain), and the numbers above are the laptop
baseline for comparison when hardware arrives.

## Deviations from the planned commit sequence

The 19-step sequence in `02-plan.md` landed as 12 substantive commits;
stages that would have required artificial stubs were merged (state
machine + its test, conductor + keyboard + robustness). Two unplanned
commits exist because full-resolution capture exposed real defects late:
the space-key code fallback and the normal de-faceting/rebalance pass.
Both are honest records of what tuning against the actual render looked
like.
