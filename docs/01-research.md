# 01 — Research

Phase 1 output. Palette extraction from the culled references in `references/`,
technique research for the renderer, motion research, and the anti-target.

---

## 1a. Reading the references

### Method

Every hex in this document is sampled from the images, not invented. Pipeline:

1. Each image downscaled to ≤260px, all pixels weighted by
   `luminance × saturation` — this weighting selects the *emissive subject*
   and zeroes out neutral walls, letterbox black, and desaturated context.
2. A 36-bin weighted hue histogram finds the peak hue per image; the
   "dominant" is the weighted mean of pixels within ±25° of that peak.
3. "Darkest non-black" is the mean of the 2–8 percentile luminance band,
   excluding crushed pixels (L < 2), so it reports the *toned* dark, not
   JPEG black.
4. Falloff is measured as radial mean luminance from the brightest pixel
   outward: the radius (as a fraction of the image diagonal) at which
   luminance drops to 50% and to 10% of peak. Small radii = hard-edged
   source; large = diffuse wash.
5. The palette ladders at the end are pooled from saturated pixels inside a
   *strict* hue window across the family's images, reported at luminance
   percentiles 5/25/50/75/95. The red window is capped at 15° precisely so
   the warm Eliasson embers cannot drag the ladder toward amber.

### Per-image notes

| File | Dominant (sampled) | Secondary | Darkest non-black | Light behaviour |
|---|---|---|---|---|
| `aurora-green-01.jpg` † | `#523721` 25° — city-light sodium, ISS view | green arc `#37584a` | `#040304` | Aurora is a thin diffuse band on the limb; city lights are hard points. The frame is warm-dominated — **treated as context, not source** |
| `aurora-green-02.jpg` † | `#5f3b18` 25° — same warm city pull | blue limb `#546b92` | `#070203` | Hard point sources over a soft atmospheric arc |
| `aurora-green-03.jpg` | `#9c1c37` 345° — **crimson aurora fog**, the reddest source in the set | green band `#4b683a` | `#090a03` | Fully diffuse: 50% falloff at 0.17 of the diagonal, 10% at 0.71. Light behaves as a volume, no edge at all |
| `aurora-green-04.jpg` | `#324816` 85°, core `#5b9123` | — | `#070508` | Vertical curtains, soft edges, long vertical falloff over water; darkest sky carries green |
| `biolum-fungi-01.jpg` | `#35691e` 105°, core `#55b93f` | — | `#050506` | Emission *from within* the material; falloff to black within 0.25 of the diagonal; grainy, organic edge |
| `biolum-fungi-05.jpg` | `#1ea631` 125°, core `#acffc3` | — | `#030203` | The hero glow image: gill structure self-illuminates, brightest at ridges, white-out only at `#acffc3` (green survives into the highlight). Hard structural edge, soft light spill |
| `blade-runner-2049-02.jpg` | `#2b362d` 135° — murky grey-green interior | — | `#0a1110` | Everything is atmosphere; a single warm flame accent occupies <1% of frame. Falloff is roomwide and diffuse (10% at 0.67) |
| `blade-runner-2049-04.jpg` | `#3c4a46` 165° — morgue grey-green | — | `#1d2624` | Flat institutional wash: the "brightest point" is a ceiling panel with wide, even falloff. A study in how a *neutral* green-grey ground reads |
| `cinnabar-lacquer-01.jpg` † | `#b75f23` 25° — vitrine backlight, warm | — | `#191511` | The carved lacquer itself reads darker and redder than the backdrop; deep relief holds `#96431f` in shadow. Backdrop flagged as **amber pull — excluded from ladder pooling** except carved-surface reds |
| `cinnabar-lacquer-04.jpg` | `#966d64` 5°, ground `#340f0d` | — | `#340f0d` | Matte oxblood: near-Lambertian, almost no specular. Its *shadow* value `#340f0d` is the most useful sample — oxblood at low luminance |
| `darkroom-safelight-01.jpg` † | `#a2713c` 35° — **amber acrylic; flagged, excluded from the red ladder** | cool wall spill `#63656d` | `#0a0c0f` | Panel is hard-edged; wall falloff is very diffuse (50% at 0.42). Kept as a falloff/mood study, not a hue source |
| `darkroom-safelight-02.jpg` | `#602b33` 345°, mid `#582a31` — **oxblood red glow panel** | — | `#211e1a` | Glow behind a ribbed diffuser: even emission, soft gradient toward edges, hue stays red as it dims. The single best material sample for an oxblood emissive surface |
| `eliasson-light-02.jpg` † | `#974304` 25°, core `#fca902` | — | `#110403` | Weather Project: a hard disc over a fog volume. Core is orange — **only its low-luminance embers (≤15°) enter the ladder**, the orange highs are excluded |
| `eliasson-light-03.jpg` † | `#98340a` 5°, core `#f9780c` | — | `#050207` | Hard-edged arc, near-zero spill (10% falloff at 0.08 of diagonal) — light as a *drawn line* over black water. Highs excluded as orange, lows `#310d0a` kept |
| `eliasson-light-04.jpg` | `#6a301c` 5° | — | `#050202` | Shard of warm light through branches; secondary red scatter `#330f0c` in the tree mass; ground is red-black |
| `hal9000-lens-03.jpg` | `#676153` (frame is silvery wall) | red glint at center | `#2e2b26` | Lens macro: concentric rings, a tiny specular core, red only in the innermost ring. The read: an eye is a *small* hot core in a large dark housing |
| `hal9000-lens-04.jpg` | `#c2906f` warm panel cast | red eye, sampled below | `#552c31` | The eye: saturated red-orange sphere, hard circular edge, bright specular point off-center. Surround stays matte. Presence comes from stillness + a single specular highlight |
| `nothing-glyph-01.jpg` † | `#bca891` 35° — warm room light on white hardware | — | `#3b4b52` | Flat product light; near-zero falloff (50% at 0.71). Kept for hardware character (diffused strip light through translucent shell), not for hue |
| `oil-slick-01.jpg` † | `#986530` 35° warm core | blue-cyan bands `#465f72` | `#18110f` | Thin-film interference: hue varies with film thickness, luminance stays continuous. The lesson is *hue drift within a body* — *not* the amber core, which is flagged |
| `oil-slick-02.jpg` | `#44506a` — asphalt, interference rings | warm ring `#756758` | `#29272f` | Full-spectrum rings on a near-black ground; each band is narrow and continuous. Study for iridescent micro-structure, not palette |
| `turrell-light-02.jpg` † | `#a28979` 25° warm ceiling wash | — | `#09090b` | Night courtyard: single luminous plane, immaculate gradient into true dark `#09090b` with **zero visible edge** — the falloff model to copy |
| `turrell-light-03.jpg` † | `#584357` 301° — violet-pink corner glow | — | `#040405` | Alta Pink. Sampled honestly: it is violet, which is banned for this project. Kept purely as a *falloff and construction* study: a triangle of light with a knife edge on two sides and pure dissolve on the third |

Amber-pull flags, stated plainly: `darkroom-safelight-01` (amber acrylic),
`cinnabar-lacquer-01` backdrop, `oil-slick-01` core, `eliasson-light-02/03`
high-luminance orange, `nothing-glyph-01` and `turrell-light-02` warm room
light. All of these were excluded from ladder pooling either entirely or
above the 15° hue cap. `turrell-light-03` is violet and contributes no hue.

**Post-review deletion (†).** After extraction, the rows marked † above
were deleted from `references/` so no amber, violet, or context-only image
can contaminate a later re-read of that directory: `darkroom-safelight-01`,
`cinnabar-lacquer-01`, `oil-slick-01`, `eliasson-light-02`,
`eliasson-light-03`, `aurora-green-01`, `aurora-green-02`,
`nothing-glyph-01`, `turrell-light-02`, `turrell-light-03`. Their lessons
and sampled hexes are preserved in the table above; the pooled ladders below
were computed before deletion and their in-window samples remain valid.
Twelve images remain on disk.

### The two families

The surviving set is dominated by exactly two hue families, as intended:

- **Oxblood / crimson red** (hue 345°–15°): the safelight panel, carved
  cinnabar, the crimson aurora fog, the HAL eye, the Eliasson embers.
- **Phosphor green** (hue 85°–165°): bioluminescent fungi, the green aurora
  curtains, and the two BR2049 grey-green interiors that show green carried
  in shadow and ground rather than in the source.

### Sampled luminance ladders

Pooled from saturated in-window pixels; percentile means. These are the only
values the palette may draw from.

**Red family, window [335°, 15°]** — pooled from `aurora-green-03`,
`darkroom-safelight-02`, `cinnabar-lacquer-01/04`, `eliasson-light-03/04`,
`hal9000-lens-04` (77,142 px):

| Step | Hex | Reads as |
|---|---|---|
| L05 | `#0a0405` | red-black ground |
| L25 | `#300d0b` | ember shadow (matches `eliasson-light-03` mid `#310d0a`, `cinnabar-lacquer-04` shadow `#340f0d`) |
| L50 | `#71171e` | crimson body |
| L75 | `#892830` | crimson glow |
| L95 | `#8e5752` | rose white-out (red desaturates toward rose, never toward orange) |
| peak sat. | `#a41837` | hottest fully-saturated crimson in the set (`aurora-green-03` mid) |

**Green family, window [85°, 165°]** — pooled from `aurora-green-04`,
`biolum-fungi-01/05`, `blade-runner-2049-02/04` (33,470 px):

| Step | Hex | Reads as |
|---|---|---|
| L05 | `#040703` | green-black ground |
| L25 | `#081306` | moss shadow |
| L50 | `#1a3011` | body green |
| L75 | `#297217` | phosphor glow |
| L95 | `#3ae05b` | gill highlight (toward `biolum-fungi-05` core `#acffc3`) |

### Semantic check

The first draft of this document committed to the red family. The palette
was derived correctly — but it was committed without asking what the colour
*means* on this product, and that check changes the answer.

This entity is the face of a consumer ambient device that lives in a home
and listens. On that product, a glowing red core is not a neutral
aesthetic choice: red is HAL's colour, and it is the universal hardware
signifier for **recording, error, and alarm** — a red light on a
microphone-bearing object reads as *surveillance* to a meaningful share of
viewers before any styling can argue otherwise. Green carries the opposite
semantic load in this set's own references: bioluminescence, growth,
something alive rather than something armed. It is equally distant from the
blue/cyan/violet default (see 1d), and its main cultural risk — hacker/
Matrix green — attaches to glyphs, scanlines, and saturated terminal text,
none of which survive contact with this palette's organic, low-luminance
character. **Committed dominant: the green family.** The red family remains
fully sampled above and will be presented in Phase 2 as the
counter-direction, with this same reasoning stated.

### Extracted palette (committed)

One dominant family, one in-family accent, a toned ground, four luminance
steps — all from the pooled green ladder and the fungi hero image.

| Role | Hex | Hue | Source |
|---|---|---|---|
| Ground | `#040703` | — | green-family L05 pool; corroborated by `biolum-fungi-05` ground `#030203`, `aurora-green-04` ground `#070508` |
| Step 1 — moss shadow | `#081306` | ~103° | green-family L25 |
| Step 2 — body | `#1a3011` | 103° | green-family L50 |
| Step 3 — glow | `#297217` | 108° | green-family L75 |
| Step 4 — highlight | `#3ae05b` | 132° | green-family L95 |
| White-out | `#acffc3` | — | `biolum-fungi-05` core — green survives into the highlight instead of dying to white |
| Accent | `#324816` | 86° | `aurora-green-04.jpg` dominant — the olive/moss shift on the *far side* of the body hue |

**Accent separation, stated:** the accent sits at hue 86° against the
body's 103° — a **−17° in-family shift** (minimum bar: 12°). The direction
matters as much as the distance: the ladder itself already rotates emerald
as it brightens (103° → 108° → 132° → toward `#acffc3`), so any accent on
that side of the body — including the previous draft's `#1ea631` at 128° —
reads as "a brighter bit of the same light", a point on the ladder rather
than perpendicular to it. `#324816` sits on the *other* side: olive/moss,
the colour of the aurora's dark curtain rather than the fungus's bright
gill. (The first draft's `#582a31` at Δ4° was a luminance step; the second
draft's `#1ea631` at +20° was on the ladder's own drift axis; both
rejected.)

**The accent's job:** it tints the DORMANT ember and its faint ground halo.
Sleeping light is visibly a *different kind* of light from waking light —
olive-moss at rest, phosphor when awake — so the DORMANT→AWAKE transition
carries a hue statement, not just a luminance ramp.

**What the entity's hue is not: it is not blue, not gold, not violet, not
cyan.** The committed dominant runs hue 103–132° — moss into phosphor
green, drifting emerald as luminance rises, exactly as sampled in
`biolum-fungi-05`. It never reaches 165°+ where green would start reading
cyan (the BR2049 morgue's 165° grey-green stays an *environment* note, not
an entity colour).

---

## 1b. Technique research

Deployment constraint first, because it decides everything: the eventual
target is a Raspberry Pi 4/5 on an embedded display. Pi 5 carries a
VideoCore VII (OpenGL ES 3.1, ~2.8× the Pi 4's VideoCore VI); glmark2 lands
roughly 2200–3000 on a Pi 5 vs under 1000 on a Pi 4, and real-world browser
WebGL is far weaker than those numbers suggest — the stock WebGL Aquarium
demo runs single-digit fps in Chromium on a Pi 5 in unlucky configurations
([Phoronix](https://www.phoronix.com/review/raspberry-pi-5-graphics),
[balena issue #172](https://github.com/balena-io-experimental/browser/issues/172),
[Pi forums](https://forums.raspberrypi.com/viewtopic.php?p=2385873)).
Conclusion: fill-rate and fragment cost are the scarce resources. Anything
that runs the full algorithm per-pixel at native resolution is suspect.

### Candidate techniques

**1. Raymarched SDF sphere, noise-displaced, in a fragment shader.**
The demoscene-standard approach: sphere-trace a signed distance field per
pixel, displace the surface with fBm noise
([Quilez, raymarching distance fields](https://iquilezles.org/articles/raymarchingdf/),
[Jamie Wong's walkthrough](https://jamie-wong.com/2016/07/15/ray-marching-signed-distance-functions/),
[Maxime Heckel, Painting with Math](https://blog.maximeheckel.com/posts/painting-with-math-a-gentle-study-of-raymarching/)).
*Cost:* per-pixel × per-step evaluation of the distance function — 40–100
map() calls per fragment, each with 3–5 noise octaves; compute-bound, with
warp divergence at silhouettes. *In motion:* the gold standard — true
volumetric silhouettes, interior structure, soft self-occlusion. *Where it
breaks:* the cost is proportional to resolution × step count, so it is the
single worst fit for a Pi-class GPU at native resolution; displacement
amplitudes large relative to step size cause overstepping artifacts (holes,
banding at the silhouette) that then require smaller steps, compounding the
cost.

**2. Vertex-displaced icosphere, curl/domain-warped simplex noise.**
Displace mesh vertices along normals in the vertex shader; fragment shader
handles colour, fresnel, emission
([Clicktorelease vertex displacement](https://www.clicktorelease.com/blog/vertex-displacement-noise-3d-webgl-glsl-three-js/),
[Codrops animated displaced sphere](https://tympanus.net/codrops/2024/07/09/creating-an-animated-displaced-sphere-with-a-custom-three-js-material/),
[Ashima webgl-noise](https://github.com/ashima/webgl-noise) via those posts,
[curl noise background](https://varun.ca/noise/)).
*Cost:* noise runs per-vertex, not per-pixel — an order-6 icosphere is
~40k vertices vs ~2M fragments at 1080p; fragment work stays trivial. One
draw call. *In motion:* organic breathing and flowing deformation reads
beautifully; normals can be recomputed cheaply in-shader (neighbour
sampling or analytic gradients) for correct rim response. *Where it breaks:*
no interior volume — it is a shell, so extreme displacement shows the
polygonal nature at the silhouette; topology is fixed (it cannot split or
merge); very high displacement frequencies need subdivision the Pi cannot
afford.

**3. GPU particle systems (FBO/GPGPU ping-pong).**
Positions/velocities live in float textures, updated in a simulation pass,
drawn as points ([Barradeau FBO particles](https://barradeau.com/blog/?p=621),
[Codrops GPGPU particles](https://tympanus.net/codrops/2024/12/19/crafting-a-dreamy-particle-effect-with-three-js-and-gpgpu/),
[Three.js Journey flow-field lesson](https://threejs-journey.com/lessons/gpgpu-flow-field-particles-shaders)).
*Cost:* two extra render passes per frame plus N point sprites; float
texture support and blending bandwidth are the constraints — additive
blending of tens of thousands of points is fill-rate heavy, which is the
Pi's weakest axis. *In motion:* excellent for dissolution/materialisation
(the body can literally disperse); coherence requires a strong attractor
field or it reads as a swarm, not a being. *Where it breaks:* a "solid"
luminous body from particles alone needs very high counts + blur; overdraw
explodes on a slow GPU; simulation passes double the pipeline complexity.

**4. Metaballs / implicit surfaces.**
Either marching-cubes a scalar field into a mesh per frame
([CIS-700 marching cubes notes](https://cis700-procedural-graphics.github.io/assignments/proj6-marchingcubes/),
[fast GPU metaballs for WebGL](https://github.com/sjpt/metaballsWebgl))
or raymarch the isosurface directly
([Kanamori et al., EG'08](https://kanamori.cs.tsukuba.ac.jp/projects/metaball/eg08_metaballs.pdf)).
*Cost:* marching cubes recomputes a 3D grid every frame (CPU or GPU) —
grid³ scaling; raymarched metaballs inherit technique 1's cost. *In
motion:* blob merge/split is charming but has a strong "lava lamp / Apple
Intelligence blob" association. *Where it breaks:* grid resolution shows as
faceting; the aesthetic itself is drifting into the anti-target (see 1d).

**5. Fresnel rim, subsurface approximation, inner glow.**
Not a body-rendering technique but the surface treatment: `pow(1 - N·V, k)`
rim term; fake SSS via view-dependent thickness tinting
([Team Dogpit SSS tutorial](https://www.patreon.com/posts/shader-tutorial-77970534),
[Echoes of Somewhere fake SSS](https://echoesofsomewhere.com/2023/10/16/sub-surface-scattering/)).
*Cost:* a handful of ALU ops per fragment — effectively free, explicitly
mobile-friendly. *In motion:* rim intensity responds to deformation
automatically (normals change), which sells volume on a shell mesh. This is
how a vertex-displaced shell fakes the interior a raymarcher would give.
*Where it breaks:* fresnel-only lighting reads hollow at glancing angles if
the facing-side term is neglected; needs an interior emission gradient
(distance-from-center term) to avoid the "soap bubble" look.

**6. Post-processing: selective bloom, chromatic aberration, dithering,
grain.** Bloom via
[three.js selective UnrealBloom](https://threejs.org/examples/webgl_postprocessing_unreal_bloom_selective.html)
or pmndrs postprocessing's Bloom with luminance threshold
([SelectiveBloom docs](https://docs.pmnd.rs/react-postprocessing/effects/selective-bloom) —
note their own docs steer you to plain `Bloom` + threshold when the whole
scene is dark, which is our case; the entity is the only bright thing so
"selective" comes free). *Cost:* bloom = 6–10 downsampled blur passes; at
half or quarter resolution this is the acceptable price for the entire
aesthetic; CA and grain are single-pass trivial. *Banding:* dark gradients
on 8-bit displays band; fixes are half-float render targets plus a dither
before quantisation — ordered/Bayer or blue-noise dithering in the final
pass ([frost.kiwi on banding](https://blog.frost.kiwi/GLSL-noise-and-radial-gradient/),
[Anisoptera on dither](https://www.anisopteragames.com/how-to-fix-color-banding-with-dithering/),
[free blue-noise textures](https://momentsingraphics.de/BlueNoise.html)).
*Where it breaks:* bloom at full resolution on a Pi; and over-tuned bloom is
the defining feature of the anti-target.

### Recommendation

**Primary: vertex-displaced icosphere (order 5–6) with domain-warped
simplex in the vertex stage, fresnel + interior-gradient emission in the
fragment stage, quarter-resolution bloom, and a final dither+grain pass.**

Why the others lose, plainly:

- The **raymarched SDF** loses on the Pi constraint alone. Per-pixel × 60+
  steps × noise octaves is exactly the workload a VideoCore cannot hold at
  60fps at native resolution, and degrading it (quarter-res raymarch,
  reduced steps) degrades the *silhouette*, which is the one thing the
  technique is supposed to buy.
- **Pure GPU particles** lose on coherence and fill rate: a convincing
  *solid* luminous body needs counts and overdraw the Pi can't pay, and the
  brief calls for a body, not a swarm. (A small, capped particle pass
  remains attractive as a *garnish* for materialise/dissolve moments — the
  architecture will keep that door open without committing to it.)
- **Metaballs** lose twice: the cheap version (marching cubes) spends its
  budget on geometry we don't need (no split/merge requirement in the state
  model), and the look is converging on the current AI-blob cliché.
- The displaced icosphere wins because it puts the expensive term (noise)
  on the axis with 50× fewer invocations (vertices), leaves fragments
  nearly free for the treatment that actually defines the look (fresnel,
  emission gradient, banding-free ground), is one draw call, and degrades
  *gracefully* — every quality knob it exposes (subdivision, DPR, bloom
  resolution, noise octaves) trades smoothness rather than breaking the
  silhouette.

### Quality tiers (designed in, not bolted on)

| Knob | High tier | Low tier (Pi) |
|---|---|---|
| Device pixel ratio | native, cap 2 | 1.0, render at 0.66–0.75 scale, upscale |
| Icosphere order | 6 (~40k verts) | 4–5 (~2.5k–10k verts) |
| Noise | 3-octave warped simplex + curl drift | 2 octaves, no warp on the low octave |
| Normals | analytic/neighbour recompute | screen-space derivative normals (`dFdx/dFdy`) |
| Bloom | half-res, 5 mips | quarter-res, 3 mips — or **off**, replaced by a widened shader-side rim+halo term |
| CA + grain | on | grain stays (it is also the dither), CA off |
| Target | 60fps desktop | 60fps at 720–1080p on Pi 5; 30fps floor on Pi 4 |

What the low tier gives up, honestly: bloom's long soft tails (the halo
becomes a shader gradient with shorter reach), micro-detail in the surface
(fewer octaves/verts means broader, slower features), and resolution
crispness on the dither grain. What it must never give up: 60fps on Pi 5,
the asymmetric breathing, the banding-free ground, and the palette.

Deployment note (from review): the deliverable being judged runs in a
browser on a laptop. **The high tier is the shipped default.** The low tier
exists as a documented, selectable, measurable mode — proof the degradation
path was designed in — not as the demo configuration.

---

## 1c. Motion research

**Breathing cadence.** Healthy adult resting respiration is 12–20
breaths/min ([Healthgrades](https://resources.healthgrades.com/right-care/lungs-breathing-and-respiration/normal-respiratory-rate),
[WHOOP](https://www.whoop.com/us/en/thelocker/what-is-respiratory-rate-normal/)) —
3–5s per breath, and the calm lower end (10–14/min) lands in the brief's
4–6s window. Critically, resting breathing is *asymmetric*: inspiration is
active muscle work, expiration is passive elastic recoil, giving an I:E
ratio around 1:2 (1:3–1:5 in relaxed spontaneous breathing)
([Deranged Physiology](https://derangedphysiology.com/main/cicm-primary-exam/respiratory-system/Chapter-539/inspiratory-pause-ie-ratio-and-inspiratory-rise-time),
[respiratory therapy overview](https://www.respiratorytherapyzone.com/inspiratory-expiratory-ratio/)).
A symmetric sine reads as a machine pumping; a shortish rise, longer decay,
and a slight end-expiratory pause reads as a body at rest. Slow-breathing
research also associates extended exhale with perceived calm
([JAP, respiratory time ratio & HRV](https://journals.physiology.org/doi/full/10.1152/japplphysiol.00163.2013)).
Implementation: breathing = `asymmetric envelope(t) ` with inhale ≈ 35% of
period, exhale ≈ 55%, pause ≈ 10%, never a raw `sin()`.

**Arrival vs fade-in.** Motion-design systems agree on the physics
grammar: entering elements *decelerate into place* — they arrive already
moving and settle, implying they travelled from somewhere; exiting elements
*accelerate away*, and fades without any spatial/scale component read as a
projector dimming, not a presence arriving
([Material Design duration & easing](https://m1.material.io/motion/duration-easing.html),
[Material movement](https://m1.material.io/motion/movement.html),
[Carbon motion](https://carbondesignsystem.com/elements/motion/overview/),
[Atlassian motion](https://atlassian.design/foundations/motion)).
So AWAKE must pair its opacity/emission ramp with a decelerating change in
some spatial quantity (scale settling, surface energy calming, drift
stopping) plus a settle — and RETURN TO DORMANT must not be that curve
reversed: dissolution wants an accelerating *release* (energy leaves, the
form lets go) with residue, per IBM's productive/expressive distinction
([IBM motion](https://design-language-website.netlify.app/design/language/motion-ui/basics/)).

**Amplitude envelopes.** Raw per-frame amplitude is jagged; every audio
envelope follower smooths with separate attack and release time constants —
fast attack so onsets land, slow release so decay is continuous; when the
input exceeds the current envelope the attack constant applies, otherwise
release ([AAS envelope follower manual](https://www.applied-acoustics.com/multiphonics-cv-2/manual/envelope-follower/),
[KVR DSP thread on smooth followers](https://www.kvraudio.com/forum/viewtopic.php?t=443243) —
including the rule of thumb that release should run an order of magnitude
longer than attack). Driving deformation with unsmoothed per-frame RMS is
exactly the "broken graphic equaliser" look: the surface teleports between
amplitude states 60 times a second. A one-pole asymmetric smoother
(`attack ≈ 20–60ms, release ≈ 200–400ms`) turns the same data into speech.

**Stillness as attention; speed as loading.** Animacy perception research
(from [Heider & Simmel's 1944 shapes](https://pmc.ncbi.nlm.nih.gov/articles/PMC6396302/)
through [Tremoulet & Feldman's single-object studies](https://www.researchgate.net/publication/12184353_Perception_of_animacy_from_the_motion_of_a_single_object)
and [kinematic life-likeness work](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1167809/full))
shows animacy is read from *self-propelled changes* — speed and direction
changes that are not externally caused, arriving at irregular moments.
Perfectly periodic, constant-speed motion is the machine signature — it is
literally what loading spinners are made of, and spinner speed manipulations
show viewers read rotation rate as system state, not as thought
([spinner illusion](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5435142/)).
Newborns already discriminate self-propelled speed change as animate
([Sci. Reports](https://www.nature.com/articles/s41598-020-79451-3)).
Consequences for the state model: LISTENING = mostly still, slow breathing,
occasional small self-initiated drift (attention); THINKING = *less*
outward motion, not more — reduced drift, inward densification, slow
internal reorganisation; anything fast + periodic will read as a spinner.
And no loop may sit on a single lockable period: layered noise at
incommensurate frequencies keeps the motion from ever exactly repeating.

---

## 1d. The anti-target: what everyone else builds

The default AI entity — the one on every product landing page and Dribbble
shot ([Dribbble "orb" tag](https://dribbble.com/tags/orb),
[an entire "Spheres AI Assistant" collection](https://dribbble.com/AmazingUI/collections/7632650-Spheres-AI-Assistant-AI-Agent-by-AmazingUI),
[uiverse "voice assistant orb" as a community *challenge*](https://uiverse.io/challenges/voice-assistant-orb),
[orb gradient generators as a product](https://gradients.design/orb-gradient)) —
looks like this:

- **Palette:** indigo-to-cyan gradient (`#6366F1`-adjacent into electric
  cyan), or violet-to-magenta "plasma"; white-hot core; pure `#000000` or
  navy ground; frequently a gold/amber accent for "premium".
- **Silhouette:** a perfect centred sphere, usually glass-shelled, wisps of
  plasma or particle swirl inside; sometimes a metaball blob (the Apple-
  Intelligence-adjacent variant); soft equatorial ring optional.
- **Motion:** symmetric sine pulse ("breathing" that reads as a metronome),
  constant-rate rotation of the internal swirl, speed-up when "thinking" —
  the loading-spinner instinct — and amplitude bars or ripples when
  speaking.
- **Bloom:** far past saturation — the glow is the object rather than
  emanating from an object; long cyan tails on a black void; lens-flare
  streaks in the renders.
- **Composition:** dead centre, floating in a void, vignette, often a
  reflective floor plane.

This is the anti-target. Every subsequent decision gets checked against it,
and the checks are concrete:

| Anti-target property | Our test |
|---|---|
| Indigo/cyan/violet hue | dominant sampled at 103–132° phosphor green; **zero** blue/violet uniforms anywhere; hue capped below the 165° cyan drift |
| Gold/amber accent | accent is `#324816` olive-moss, −17° within the same family; amber flagged and excluded at extraction |
| Pure-black void ground | ground is toned `#040703` and dithered |
| Perfect centred sphere | placement is a conscious 2a decision with stated justification — differentiation comes from hue, motion and restraint, not from a layout quirk; silhouette broken by displacement either way |
| Glass shell + internal plasma | opaque emissive body; fresnel used for volume, not for "glassiness" |
| Symmetric sine pulse | asymmetric I:E breathing, incommensurate noise layers |
| Faster = thinking | THINKING turns inward: less drift, more internal density |
| Bloom as the object | bloom tuned to slightly-less-than-wanted, quarter-res; the body carries its own emission gradient |
| Reflective floor / vignette flourishes | full-bleed dark field, nothing else |
| **Night-vision / CCTV green** — the *other* surveillance cliché: scanlines, circular phosphor-mask vignette, a flat desaturated 110–120° wash over the whole frame | Phase 4 check, not an assumption: no scanlines, no circular mask or vignette, no full-frame green overlay; our green is luminance-graded and lives *in the body* (ridge-lit, organic) on a near-neutral toned ground — the frame is dark, not green |

---

*Phase 1 ends here. Awaiting review before Phase 2 (design + technical
plan).*
