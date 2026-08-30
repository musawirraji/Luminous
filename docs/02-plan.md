# 02 — Design and technical plan

Phase 2 output. Visual direction, state model, amplitude architecture,
technical plan, acceptance checklist. No code until this is approved.

All hexes below are the sampled values from `01-research.md`. No hue exists
in this plan that does not exist in the references.

---

## 2a. Visual direction

Two directions, both grounded in the surviving references by filename, both
clear of the anti-target. One is recommended.

### Direction A — PHOSPHOR (recommended)

Grounded in: `biolum-fungi-05.jpg` (the hero — self-illuminating gill
structure, green carried all the way into the highlight `#acffc3`),
`biolum-fungi-01.jpg` (emission from within a dark mass, falloff to black
within a quarter of the frame), `aurora-green-04.jpg` (soft vertical
curtains, green held in the darkest sky), `blade-runner-2049-02.jpg` and
`blade-runner-2049-04.jpg` (how a *room* carries green in its shadows and
ground — the environmental tint precedent).

- **Palette:** ground `#040703`; moss shadow `#081306`; body `#1a3011`;
  glow `#297217`; highlight `#3ae05b`; white-out `#acffc3`; accent
  `#324816` (−17° olive/moss shift against the 103° body — perpendicular
  to the ladder's own emerald drift; see `01-research.md`). The accent has
  a job: it tints the DORMANT ember and its ground halo, so sleeping light
  is a visibly different kind of light from waking light.
- **Silhouette & edge:** a sphere disturbed by low-frequency noise — never
  a perfect ball, never a blob. The *structural* edge is defined (like the
  fungus's gill ridges), but the light spills softly past it; edge
  softness comes from rim falloff and emission, not blur.
- **Light behaviour:** emission from within the material. Ridges of
  displacement glow brighter than valleys (curvature-driven emission, the
  fungi's signature); luminance falls to the toned ground quickly —
  `biolum-fungi-01`'s 10%-falloff at 0.25 of the frame is the model. No
  long tails. The darkest parts of the scene still carry green
  (`blade-runner-2049-04`'s `#1d2624` ground logic, darkened to our
  `#040703`).
- **Material character:** dense living phosphor — matte, organic, faintly
  translucent at the rim (fresnel-tinted depth), zero specularity, zero
  glassiness.
- **What the viewer feels:** *something is quietly alive in the dark, and
  it is growing rather than performing.*

### Direction B — SAFELIGHT (counter-direction)

Grounded in: `darkroom-safelight-02.jpg` (oxblood glow panel behind a
ribbed diffuser — hue holds red as it dims), `cinnabar-lacquer-04.jpg`
(matte oxblood at low luminance, shadow `#340f0d`),
`aurora-green-03.jpg` (crimson fog `#9c1c37`, light as an edgeless volume),
`hal9000-lens-04.jpg` (a small hot core in a large dark housing; presence
through stillness), `eliasson-light-04.jpg` (red-black ground `#050202`).

- **Palette:** ground `#0a0405`; ember `#300d0b`; body `#71171e`; glow
  `#892830`; core `#a41837`; white-out through rose `#8e5752`; accent
  `#6a301c` (sampled from `eliasson-light-04`; hue 15° against the 355°
  body — a +20° burnt-umber shift, meeting the 12° accent bar).
- **Silhouette & edge:** stiller than A — a smoldering mass, deformation
  slower and smaller, presence carried by the breathing of emission rather
  than of form.
- **Light behaviour:** the safelight model — even interior emission with a
  soft gradient to the edge; the aurora-03 model for its widest state:
  fog, no edge at all.
- **Material character:** lacquer-dense, coal-warm, opaque.
- **What the viewer feels:** *a warm coal that knows you are there.*

### Recommendation and defence

**Direction A.** Three reasons, in order:

1. **Semantics on this product** (the deciding one, recorded in
   `01-research.md` § Semantic check): this is the face of an ambient home
   device that listens. Red on such an object is the hardware language of
   recording, error, and alarm — HAL's colour on HAL's product category —
   and a meaningful share of viewers will read surveillance before any
   styling can argue otherwise. Green's cultural load in *our own
   references* is bioluminescence: life. Direction B is the stronger
   *image* in isolation; it is the wrong *message* on this object.
2. **Dynamic headroom.** The sampled red ceiling is dim (`#a41837`, and it
   dies into rose) — a red entity smolders, which suits DORMANT and
   THINKING but starves SPEAKING: there is nowhere bright to go without
   leaving the sampled family. Green's ladder runs to `#3ae05b` and holds
   hue into `#acffc3` — SPEAKING can genuinely flare within palette.
3. **Anti-target distance is equal, cliché risk is not.** Both families
   clear the indigo-cyan orb. Green's residual risk (Matrix/terminal
   green) attaches to glyphs, scanlines and saturated text on pure black —
   none present here: this green is organic, low-luminance, matte, and
   sits on a toned ground. Red's residual risk (surveillance) attaches to
   exactly what this object is. One risk is avoidable by styling; the
   other is structural.

### Composition

**Centred horizontally, optical centre vertically — the entity's centre
sits at 47% of viewport height, 3% above geometric centre.** Justification,
as required: this display is the product's face, and a face is frontal.
The references agree — the safelight panel, the HAL eye, the Turrell
aperture all present a single luminous source dead-on and centred; an
off-centre placement here would be a differentiation gesture spent on
layout when the brief's real differentiators are hue, motion and
restraint. The 3% lift is the optical-centre correction (a geometrically
centred mass reads low on a full-bleed dark field), and it buys a quiet
secondary behaviour: dissolution residue settles ~2% *below* the entity's
resting centre, so DORMANT sits fractionally lower than AWAKE — the states
breathe vertically across the session without any explicit translation
animation. Nothing else shares the frame: full-bleed ground, no chrome, no
floor plane, no vignette.

---

## 2b. State model

Six states, five transitions. The transitions are the work; the states are
the poses between them.

### Shader uniforms referenced below

(Full typing in 2d. All motion values are unitless multipliers 0–1 unless
noted.)

| Uniform | Meaning |
|---|---|
| `uEmission` | overall emission energy |
| `uCoreBias` | 0 = light lives at the surface/rim; 1 = light retreats to the interior |
| `uRim` | fresnel rim strength (outward-facing attention) |
| `uDispAmp` | vertex displacement amplitude (surface unrest) |
| `uDispFreq` | displacement spatial frequency (feature size; higher = denser) |
| `uFlowSpeed` | rate the noise field advects (surface flow) |
| `uWarp` | domain-warp amount (internal complexity / turbulence of structure) |
| `uCondense` | radius multiplier (gather/release of the whole body) |
| `uDrift` | positional micro-drift amplitude (self-initiated attention shifts) |
| `uDissolve` | noise-threshold edge erosion (0 = intact, 1 = gone) |
| `uAccentMix` | 0 = ladder colours; 1 = light tinted toward the olive accent `#324816` (DORMANT = 1, all waking states = 0; interpolates through transitions like any other component) |
| `uBreathAmp` / breath period | breathing depth; period in seconds (JS-side, feeds a single breath scalar into displacement + emission) |
| `uAmp` | smoothed speech envelope (0–1), attack 40ms / release 300ms |

Breathing is never `sin(t)`: one cycle = inhale 35% of period (accelerating
then decelerating rise), exhale 55% (slow decaying fall), rest 10% —
the sampled I:E ≈ 1:2 physiology from `01-research.md` §1c. The period
itself is modulated ±7% by a 0.013Hz noise so no loop is lockable, and
drift runs on three incommensurate frequencies (0.11 / 0.047 / 0.019 Hz).

### The six states

| State | uEmission | uCoreBias | uRim | uDispAmp | uDispFreq | uFlowSpeed | uWarp | uCondense | uDrift | breath (period / amp) | Viewer should read |
|---|---|---|---|---|---|---|---|---|---|---|---|
| DORMANT | 0.04 | 0.90 | 0.05 | 0.02 | 0.8 | 0.05 | 0.10 | 0.955 | 0.00 | 6.8s / 0.15 | An ember below the surface of the dark. Not off — *asleep*. Residual presence: the ground immediately around it holds `#081306` faintly, and once per ~20s (noise-gated, never periodic) the ember swells ~8% for one slow breath |
| AWAKE | 0.55 | 0.35 | 0.50 | 0.12 | 1.0 | 0.40 | 0.20 | 1.000 | 0.15 | 5.2s / 0.50 | It woke and is present. Calm, whole, breathing |
| LISTENING | 0.60 | 0.30 | 0.65 | 0.13 | 1.0 | 0.55 | 0.20 | 1.000 | 0.25 | 4.6s / 0.60 | Attention pointed outward: brighter rim, livelier surface flow, small self-initiated drifts — leaning in, not performing |
| THINKING | 0.50 | 0.70 | 0.35 | 0.10 | 1.6 | 0.30 | 0.65 | 0.975 | 0.05 | 6.0s / 0.30 | Turned inward. Light retreats from the rim into the core, surface features get smaller and denser, drift nearly stops. *Slower* than listening, not faster — gathering, considering |
| SPEAKING | 0.50 + 0.28·uAmp | 0.45 | 0.55 | 0.11 + 0.09·uAmp | 1.1 | 0.45 | 0.35 | 1.0 + 0.012·uAmp | 0.10 | breath yields to envelope | The voice made visible: emission and surface push ride the smoothed envelope; pauses in speech read as micro-stillness, not as freezing |
| (RETURN → DORMANT) | — | — | — | — | — | — | — | — | — | — | Not a state but the fifth transition; see T5 |

### Transition grammar

Two transitions are hand-authored (T1 wake, T5 return — the two with
narrative structure). **Every other ordered state pair — all thirty — is
derived from one rule**, because the first thing an evaluator does with a
six-key demo is mash the keys in a random order, and five hand-authored
paths plus a hand-wave does not cover that.

Each state is already a uniform vector, so a transition is a move between
two points in that space:

- **Curve family** is chosen by the sign of the emission change: target
  `uEmission` above current → *rising* (`arrive` for far moves, `engage`
  for near); below → *falling* (`release` for far moves, `inward` for
  near). Near/far threshold: normalized vector distance 0.5.
- **Duration** derives from distance:
  `dur = clamp(300, 1600, 350 + 1400 · dist)` ms, where `dist` is the L2
  distance between range-normalized vectors. Small moves are quick, big
  moves take time; nothing pops.
- **Per-uniform stagger** is part of the grammar, not per-pair authoring.
  Uniforms belong to three groups — *behaviour* (`uDrift`, `uFlowSpeed`),
  *light* (`uEmission`, `uRim`, `uCoreBias`), *structure* (`uDispAmp`,
  `uDispFreq`, `uWarp`, `uCondense`, `uDissolve`, `uAccentMix`). In
  falling transitions behaviour leads (its sub-window is the first 40% of
  the duration), light follows (20–80%), structure completes (30–100%) —
  outward behaviour stops *before* the light changes, which is what makes
  "turning inward" legible. In rising transitions light leads (0–60%),
  behaviour follows (20–80%), structure completes (30–100%) — the thing
  brightens, *then* starts acting.
- **Interruption**: a new request snapshots the **current interpolated
  uniform vector** — never the nominal state being left — and transitions
  from there. Key-mashing therefore re-aims a moving vector instead of
  teleporting it; continuity is structural, not special-cased.

T2/T3/T4 below are not exceptions — they are the grammar's output for
those pairs, written out so the intended read is reviewable. T1 and T5
remain authored three-phase pieces; a derived DORMANT→AWAKE or →DORMANT
still exists for interrupted/mashed paths (e.g. key `1` mid-transition),
using the same rule as every other pair.

Easing curves are named as CSS cubic-bezier for precision; none are linear.
`arrive` = cubic-bezier(0.16, 1, 0.3, 1) — enters fast, decelerates into
place. `engage` = cubic-bezier(0.33, 0, 0.2, 1). `inward` =
cubic-bezier(0.65, 0, 0.35, 1). `release` = cubic-bezier(0.55, 0, 1, 0.45)
— accelerates away. `settle` = cubic-bezier(0.25, 0, 0.5, 1).

**T1 — DORMANT → AWAKE, 1400ms. "It draws breath and arrives."**
Three phases, because arrival is not an opacity ramp:
- *Gather, 0–250ms,* cubic-bezier(0.5, 0, 0.9, 0.4): `uCondense`
  0.955→0.94, `uEmission` 0.04→0.03. The ember contracts and dims — an
  intake before the first breath. This is the anticipation beat that makes
  the next phase read as self-propelled (animacy: motion must originate
  inside the body).
- *Ignite, 250–950ms,* `arrive`: `uEmission` 0.03→0.62 (overshoot),
  `uCondense` 0.94→1.015 (overshoot), `uDispAmp` 0.02→0.14, `uRim`
  0.05→0.50, `uCoreBias` 0.90→0.35, breath amp 0.15→0.55. Energy moves
  from core to surface as the form expands — light *reaches the skin*.
- *Settle, 950–1400ms,* `settle`: `uEmission` 0.62→0.55, `uCondense`
  1.015→1.0, `uDispAmp` 0.14→0.12, breath period locks to 5.2s mid-cycle
  (first breath begins on the settle, not after it).
Viewer read: it was there all along, drew itself together, and woke —
arrival with momentum and a settle, not a fade-in.

**T2 — AWAKE → LISTENING (derived: rising, near), ~600ms, `engage`. "It leans in."**
`uRim` 0.50→0.65, `uFlowSpeed` 0.40→0.55, `uDrift` 0.15→0.25, `uEmission`
0.55→0.60, breath period 5.2→4.6s / amp 0.50→0.60. Single-phase and quick:
attention is a small, willing movement. Viewer read: it noticed you and is
attending.

**T3 — LISTENING → THINKING (derived: falling, near), ~900ms, `inward`.
"It turns inward."**
The grammar's stagger does the sequencing: behaviour group first —
`uDrift` 0.25→0.05 and `uFlowSpeed` 0.55→0.30 in the opening window (the
outward behaviour stops *first*) — then the light group, `uRim` 0.65→0.35
and `uCoreBias` 0.30→0.70 (light withdraws from the skin into the body),
while the structure group `uWarp` 0.20→0.65, `uDispFreq` 1.0→1.6,
`uCondense` 1.0→0.975 completes across the tail; breath 4.6→6.0s /
0.60→0.30. Explicitly the anti-spinner: total outward motion *decreases*
while internal complexity *increases*. Viewer read: it stopped attending
to the room and started working on something inside itself.

**T4 — THINKING → SPEAKING (derived: rising, near), ~500ms, `arrive`.
"It surfaces with the answer."**
`uCoreBias` 0.70→0.45, `uRim` 0.35→0.55, `uWarp` 0.65→0.35, `uDispFreq`
1.6→1.1, `uCondense` 0.975→1.0; at t=0 the envelope bus is armed and
`uAmp` begins driving emission/displacement per the SPEAKING row. The
gathered interior light returns to the surface *as* the first syllable
lands — timed so the state change and the first envelope onset are one
event. Viewer read: the thing it was forming is now being said.

**T5 — SPEAKING → DORMANT, 2600ms. "It lets go, sinks, and banks itself."**
Explicitly not T1 reversed: energy leaves *before* form, curves accelerate
away rather than decelerate in, and it ends somewhere T1 never was.
- *Release, 0–700ms,* `release`: `uDispAmp` 0.11→0.19 (the surface
  loosens — a long exhale, form briefly *less* held, the one moment
  displacement rises while energy falls), `uEmission` 0.55→0.30, `uRim`
  0.55→0.20, envelope bus disarmed over the first 200ms.
- *Sink, 700–1900ms,* `inward`: `uCoreBias` 0.45→0.90, `uEmission`
  0.30→0.08, `uCondense` 1.0→0.955, `uDispAmp` 0.19→0.03, `uDissolve`
  0→0.30 — the outer skin erodes to noise while the core holds; the body's
  centre eases 2% downward to its dormant rest position.
- *Bank, 1900–2600ms,* `settle`: `uDissolve` 0.30→0.0 (what remains
  re-knits — the ember is intact, not damaged), `uEmission` 0.08→0.04,
  breath returns at 6.8s / 0.15 amplitude.
Viewer read: it finished, released its hold, sank back below the surface,
and banked its fire. Something remains — the same something T1 will wake.

**Key mapping (mirrors the client's enumeration exactly):** `1` DORMANT,
`2` AWAKE, `3` LISTENING, `4` THINKING, `5` SPEAKING, `6` RETURN (runs the
authored T5 into DORMANT; diagnostics shows `RETURNING` while it runs).
`space` advances the canonical sequence. Any jump between any pair, at any
moment — including mid-transition — resolves through the derived grammar
from the live vector; the developer controls cannot produce a pop.

---

## 2c. Amplitude architecture

Simulated amplitude now; microphone or TTS later, with zero renderer
changes. The seam is a two-layer design: **sources produce raw amplitude;
the renderer owns smoothing.** That way a future microphone source can be
dumb and jittery and everything still works.

```ts
/** A source of instantaneous amplitude, 0..1, unsmoothed. */
interface AmplitudeSource {
  readonly id: string;
  /** Begin producing values (idempotent). */
  start(): void;
  /** Stop producing values; read() returns 0 after this. */
  stop(): void;
  /** Instantaneous amplitude at `nowMs`. Pull-based: called once per frame. */
  read(nowMs: number): number;
  /** Release any held resources (audio nodes, timers). */
  dispose(): void;
}
```

- **Pull, not push:** the render loop calls `read()` once per frame. No
  source ever touches a uniform, a material, or React.
- **`EnvelopeSmoother`** (renderer-side, not source-side): one-pole
  asymmetric follower, `attack = 40ms`, `release = 300ms` (release ≈ 8×
  attack, per the DSP guidance in `01-research.md` §1c). Output is `uAmp`.
- **`AmplitudeBus`** holds the active source, exposes
  `setSource(s: AmplitudeSource | null)`, and returns the smoothed value.
  SPEAKING arms it; every other state disarms it.

Shipped sources (both simulated):

1. **`SyntheticSpeechSource`** — a seeded, deterministic speech envelope
   with real structure, three layers multiplied:
   *phrase* (1.5–4s bursts separated by 250–900ms silences, occasional
   1.5–2.5s paragraph pauses), *syllable* (4–6Hz amplitude modulation with
   per-syllable random peak 0.5–1.0), *articulation* (10–20ms onset spikes
   on ~20% of syllables, sentence-final decay over the last 300ms of each
   phrase). Seeded PRNG so a demo run is reproducible.
2. **`ManualSource`** — keyboard-held level: `ArrowUp`/`ArrowDown` nudge a
   target ±0.1 (clamped 0–1) which the source reports directly. Keyboard
   only, per the controls constraint; the diagnostics readout shows its
   value.

Future drop-ins (documented in README, not built): `MicrophoneSource`
(WebAudio `AnalyserNode`, RMS of the time-domain buffer in `read()`), and
`TTSStreamSource` (same, tapping an `<audio>` element's `MediaElementAudioSourceNode`).
Each implements the same four methods; nothing else in the codebase changes.

---

## 2d. Technical plan

### Stack (pinned exactly; no `^`)

| Package | Version | Why |
|---|---|---|
| `typescript` | 5.9.x (exact pin at scaffold) | strict mode, no `any` |
| `vite` | 7.x exact | build + dev server |
| `react`, `react-dom` | 19.1.x exact | required by R3F v9 |
| `three` | 0.180.x exact | renderer |
| `@react-three/fiber` | 9.x exact | React reconciler for three |
| `@react-three/drei` | 10.x exact | `shaderMaterial` helper only — no drei visual sugar |
| `@react-three/postprocessing` + `postprocessing` | 3.x / 6.x exact | bloom, noise/CA passes |
| `@fontsource/space-mono` | 5.x exact | self-hosted type; reproducible clean-clone install, no runtime font CDN |
| `vitest` (dev) | 3.x exact | scripted key-sweep verification of the state machine |

Exact versions are resolved and locked at scaffold time; the lockfile is
committed. `npm ci` from a clean clone must produce a working build with no
undocumented steps.

### Type

**Space Mono** (Colophon Foundry, via Google Fonts / Fontsource) — a
monospace with genuine character: squared terminals, an idiosyncratic
lowercase, unmistakably an *instrument* face rather than a code-editor
default. It appears in exactly one place — the diagnostics readout — and is
set with intent: labels 9px uppercase, tracking 0.14em, values 12px,
tracking 0.02em, line-height 1.7, colours only from the palette
(`#297217` labels, `#acffc3` values). No other type exists in the piece.
Banned faces (Inter, Poppins, Montserrat, Roboto, Open Sans, Lato, Nunito,
default-stack-as-decision) are absent by construction.

### File structure

```
luminous-entity/
├── docs/                      01-research.md, 02-plan.md, 03-decisions.md
├── references/                culled images + sources.md
├── public/                    (empty; favicon omitted deliberately)
├── src/
│   ├── main.tsx               mount, strict mode
│   ├── App.tsx                canvas, composition, keyboard binding
│   ├── palette.ts             the sampled hexes, exported as const — the ONLY colour definitions in the codebase
│   ├── state/
│   │   ├── EntityState.ts     the six states + transition grammar as data (state vectors, T1/T5 phase scripts, derived-rule constants — the tables in 2b, verbatim)
│   │   ├── machine.ts         StateMachine: pure TS, owns the live uniform vector, derived + authored transitions, interruption from live values; zero three.js/React imports
│   │   ├── machine.test.ts    vitest key sweep: 30 ordered pairs + mid-transition interrupts, no NaN, continuity bound
│   │   └── conductor.ts       Conductor: maps machine output + breath clock + amplitude bus → one UniformFrame per tick
│   ├── amplitude/
│   │   ├── AmplitudeSource.ts the interface (2c, verbatim)
│   │   ├── SyntheticSpeechSource.ts
│   │   ├── ManualSource.ts
│   │   ├── EnvelopeSmoother.ts
│   │   └── AmplitudeBus.ts
│   ├── render/
│   │   ├── Entity.tsx         icosphere mesh + shader material; reads UniformFrame each frame
│   │   ├── entityUniforms.ts  typed uniform registry (single source of truth for names)
│   │   ├── entity.vert.glsl   displacement: 3-octave domain-warped simplex + breath + amp
│   │   ├── entity.frag.glsl   fresnel rim, curvature emission, core gradient, palette
│   │   ├── Ground.tsx         full-bleed quad: toned ground + ordered dither
│   │   ├── ground.frag.glsl
│   │   ├── Post.tsx           bloom (half-res) + grain; tier-aware
│   │   └── quality.ts         Tier type, knob table from 01-research §1b, ?tier= override
│   ├── controls/
│   │   ├── useKeyboard.ts     1–6, space, d, arrows
│   │   └── Diagnostics.tsx    state / fps / amp readout; hidden by default
│   └── styles.css             reset, canvas full-bleed, diagnostics type
├── index.html
├── package.json / lockfile
└── README.md
```

### Where state lives and how the render loop reads it

- `StateMachine` (plain TS class, instantiated once outside React) is the
  single owner of *what the entity is doing*: current state, active
  transition, transition start time. It knows nothing about rendering.
- `Conductor.tick(nowMs, dt)` asks the machine for (state, transition,
  progress), evaluates the easing curves and staggered offsets from
  `EntityState.ts`, folds in the breath clock and `AmplitudeBus`, and
  returns a `UniformFrame` — a plain typed object of final uniform values.
- `Entity.tsx` runs `useFrame`: one `conductor.tick()`, then assigns the
  frame onto the material's uniforms. React state is used only for
  mount/unmount and the diagnostics toggle; per-frame values never touch
  React.
- Keyboard events call `machine.request(state)`; nothing else does.
  The renderer *reads*; it never owns or mutates state.

### Uniform naming and typing

All uniforms live in `entityUniforms.ts` as a single
`const ENTITY_UNIFORMS = { uTime: …, uEmission: …, … } as const` registry;
`UniformName = keyof typeof ENTITY_UNIFORMS` and `UniformFrame` derive from
it. GLSL declarations are checked against this registry by a unit-less
build assertion (the material is constructed *from* the registry, so a
misnamed string cannot compile into a silent no-op). Naming: `u` prefix,
camelCase, no abbreviations beyond `Amp`/`Disp` as established in 2b.

### Quality tiering

`quality.ts` exports the knob table from `01-research.md` §1b as data:
`{ dpr, icoOrder, noiseOctaves, normalsMode, bloom: {resolution, mips, enabled}, ca }`.
**High tier is the default** — the deliverable is judged in a laptop
browser. Low tier is selected only by explicit `?tier=low` URL param and
its frame cost is measurable live in the diagnostics readout; it exists as
proof the Pi degradation path is designed, not as the demo config.

### Performance budget (high tier, dev machine)

| Metric | Budget | How measured |
|---|---|---|
| Frame rate | 60fps sustained; p95 frame time ≤ 18ms | diagnostics rolling 120-frame window; recorded numbers go in `03-decisions.md` |
| Draw calls | ≤ 3 scene (entity, ground) + ≤ 5 post passes | `renderer.info.render.calls` surfaced in diagnostics |
| Entity geometry | icosphere order 6, ≈ 40,962 verts, one mesh | constant by construction |
| Vertex shader | ≤ 3 noise octaves + 1 warp = ~4 simplex evaluations/vertex | by inspection; octave count is a uniform-independent compile-time constant per tier |
| Fragment shader | entity ≤ ~80 ALU ops, no texture fetches; ground ≤ ~20 | by-inspection instruction counting on the final GLSL, cross-checked with a Spector.js frame capture |
| Bloom | half-resolution, 5 mips, luminance threshold ≥ 0.6 | pass config |
| Memory | no per-frame allocations in the tick path | Chrome performance profiler, allocation sampling during a 60s soak |

Measured results (not budgets) are written to `03-decisions.md` with the
machine spec they were measured on.

### Robustness (from review — the evaluator will background the tab)

- **Delta-time clamp:** `dt = min(dt, 1/30)` at the top of the tick path.
  Every integrator (transitions, breath clock, drift, envelope smoother,
  synthetic speech clock) advances on the clamped dt, so a backgrounded
  tab resumes mid-breath, not mid-lurch.
- **Visibility:** on `visibilitychange` → hidden, the amplitude bus
  pauses; on return it resumes from its paused envelope value (sources
  advance their own clamped clocks, so the synthetic speech stream
  continues from where it paused rather than fast-forwarding).
- **Resize / devicePixelRatio:** resize is continuous (R3F canvas), and a
  `matchMedia` resolution listener re-applies the tier's DPR cap when the
  window moves between displays.
- **`prefers-reduced-motion: reduce`:** honoured by *reducing*, not
  freezing — breath amplitude ×0.4, drift ×0.5, and the SPEAKING
  amplitude flare dropped (envelope still smooths emission subtly, the
  displacement push is removed). Transitions remain (single, short,
  purposeful). One line in the README states this.

### Verification tooling

`vitest` (dev-dependency, exact pin) runs a scripted key sweep against the
pure-TS machine: all 30 ordered state pairs, plus interruptions injected
mid-transition, ticked at simulated 60fps — asserting every uniform stays
finite (no NaN), per-tick deltas stay under a continuity bound (no pop),
and each transition lands on its target vector. This is the machine-level
proof behind the acceptance line; the on-screen check in Phase 4 is the
same sweep driven by real key events.

### Commit sequence (intended)

1. `scaffold: vite + react + strict typescript, pinned deps`
2. `docs: phase 0-2 documents and references`
3. `palette: sampled tokens as the only colour source`
4. `ground: full-bleed toned ground with ordered dither`
5. `entity: icosphere + displacement vertex shader`
6. `entity: fresnel, curvature emission, core gradient`
7. `motion: asymmetric breath clock, incommensurate drift`
8. `state: machine + state/transition data tables`
9. `state: conductor mapping machine output to uniforms`
10. `controls: keyboard state entry and sequence advance`
11. `transitions: T1 wake and T5 return grammar`
12. `transitions: T2-T4 listening/thinking/speaking`
13. `amplitude: source interface, bus, envelope smoother`
14. `amplitude: synthetic speech + manual sources`
15. `post: half-res bloom and grain, tier plumbing`
16. `diagnostics: space mono readout, off by default`
17. `quality: low tier knobs + measurement`
18. `docs: 03-decisions with measured numbers`
19. `docs: readme with capture`

Each commit builds and runs; no commit contains dead code or experiments.

---

## 2e. Acceptance checklist

To be executed verbatim in Phase 4. Every line is checkable by looking at
the screen, the code, or the repo — no vibes.

**Colour**
- [ ] Every colour in the codebase originates in `palette.ts`; every hex in `palette.ts` appears in `docs/01-research.md` with a named source image
- [ ] No occurrence of `#6366F1`, `#8B5CF6`, indigo→cyan, violet→magenta, teal+purple anywhere
- [ ] No gold/amber accent; no blue glow; background is not cream/off-white
- [ ] Emissive hue is green (103–132° sampled family), not blue/gold/violet/cyan; nothing drifts past 165° toward cyan
- [ ] One dominant family; accent `#1ea631` is ≥12° from the body hue (actual: +20°)
- [ ] Ground is `#040703`, never `#000000`
- [ ] Background carries ordered dither; no visible banding on a real display at full screen

**Type & icons**
- [ ] Exactly one typeface (Space Mono), self-hosted, used only in diagnostics, set with the specified sizes/tracking
- [ ] No banned faces; no icon library, no emoji, no glyph fonts anywhere including diagnostics

**Motion**
- [ ] No linear easing anywhere (grep for `linear` and for missing easing params confirms)
- [ ] Breathing is asymmetric (inhale 35% / exhale 55% / rest 10%) — verifiable in the breath clock code and on screen
- [ ] No exact-period loop: breath period noise-modulated; drift on three incommensurate frequencies
- [ ] Bloom threshold ≥ 0.6, half-res; side-by-side check: turning bloom off changes the image *less* than turning off the shader emission gradient
- [ ] THINKING has lower outward motion than LISTENING (drift and flow values in the state table, visible on screen)
- [ ] T5 is not T1 reversed: energy leaves before form; different curve family; ends in eroded-then-reknit ember

**States & transitions**
- [ ] Six states reachable; the named transitions match 2b durations ±10% and uniform from→to values
- [ ] **All 30 ordered state pairs reachable with no pop and no NaN, verified by the scripted key sweep** (vitest machine sweep + a real-keys sweep in Phase 4), including requests fired mid-transition
- [ ] DORMANT is visibly not-nothing on a real display (ember + toned halo)
- [ ] AWAKE arrival has gather → ignite-with-overshoot → settle; not an opacity ramp
- [ ] SPEAKING responds to envelope with 40ms attack / 300ms release; pauses read as stillness
- [ ] Direct 1–6 jumps never pop; they route through the transition grammar

**Controls & composition**
- [ ] Keys `1`–`6`, `space`, `d` work; `ArrowUp/Down` drive ManualSource; nothing on screen except entity + ground by default
- [ ] Diagnostics off by default; toggling shows state, fps, amplitude
- [ ] Entity centred horizontally at 47% viewport height; full-bleed; no chrome/border/watermark

**Code quality**
- [ ] `tsc --noEmit` passes with `strict: true`; zero `any` (grep confirms)
- [ ] All uniforms flow from `entityUniforms.ts`; no scattered string literals
- [ ] `StateMachine` imports nothing from three/react; renderer only reads
- [ ] Every non-obvious shader block has an intent comment; no commented-out code; no `console.log`
- [ ] Git history matches the commit sequence in spirit: small, sequenced, honest messages

**Documentation & reproducibility**
- [ ] README: what it is, one still/GIF, install+run in ≤3 commands, keyboard map, state model, amplitude plug-in point
- [ ] `03-decisions.md`: direction + technique rationale, palette provenance, measured performance numbers with machine spec
- [ ] Pinned versions + lockfile; `npm ci && npm run dev` works from a clean clone with no undocumented steps
- [ ] High tier is default; `?tier=low` works and its fps cost is measurable in diagnostics

**Robustness**
- [ ] dt clamped to 1/30 in the tick path; backgrounding the tab for 60s and returning produces no lurch, no jump in amplitude, no transition skip
- [ ] Amplitude bus pauses on `visibilitychange` and resumes without a jump
- [ ] Window resize and moving between displays (DPR change) keep the composition and sharpness correct
- [ ] `prefers-reduced-motion` reduces breath/drift and drops the SPEAKING flare; the piece never freezes; README states the behaviour

**Anti-target audit (separate pass, per Phase 4)**
- [ ] Run the 1d checklist table row by row; every resemblance to the default AI orb named plainly with a proposed fix
- [ ] Night-vision/CCTV green check: no scanlines, no circular phosphor-mask vignette, no flat desaturated 110–120° full-frame wash — the green lives in the body, the frame is dark not green

---

*Phase 2 ends here. Awaiting review before Phase 3 (build).*
