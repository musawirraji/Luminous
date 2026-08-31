precision highp float;

uniform float uEmission;
uniform float uCoreBias;
uniform float uRim;
uniform float uDissolve;
uniform float uAccentMix;
uniform float uHaloBoost;
uniform vec3 uColShadow;
uniform vec3 uColBody;
uniform vec3 uColGlow;
uniform vec3 uColHighlight;
uniform vec3 uColWhiteout;
uniform vec3 uColAccent;

varying float vDisp;
varying vec3 vWorldPos;
varying vec3 vObj;
#ifdef NORMALS_TANGENT
varying vec3 vNormalW;
#endif

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

// The sampled luminance ladder, walked in order: shadow -> body -> glow ->
// highlight -> white-out. Piecewise on purpose - every sampled step is a
// colour the surface actually passes through, and green survives into the
// highlight instead of dying to white (biolum-fungi-05).
vec3 ramp(float t) {
  vec3 c = mix(uColShadow, uColBody, smoothstep(0.0, 0.30, t));
  c = mix(c, uColGlow, smoothstep(0.30, 0.58, t));
  c = mix(c, uColHighlight, smoothstep(0.58, 0.84, t));
  c = mix(c, uColWhiteout, smoothstep(0.84, 1.0, t));
  return c;
}

void main() {
#ifdef NORMALS_TANGENT
  vec3 N = normalize(vNormalW);
#else
  // Low tier: the undisplaced sphere direction. Smooth and cheap; the rim
  // stops responding to deformation, which is part of what the low tier
  // knowingly gives up (docs/01-research.md §1b).
  vec3 N = normalize(vObj);
#endif
  vec3 V = normalize(cameraPosition - vWorldPos);
  float ndv = clamp(dot(N, V), 0.0, 1.0);

  // Displacement crests glow brighter than valleys: the fungus lights its
  // own structure. This is where "alive" comes from - emission follows
  // form, not a spotlight.
  float ridge = pow(smoothstep(-0.1, 1.0, vDisp), 1.6);

  float fresnel = pow(1.0 - ndv, 3.0);
  float facing = pow(ndv, 1.2);

  // Two lighting postures crossfaded by uCoreBias: surface posture (rim +
  // lit ridges - attention pointed outward) against core posture (glow
  // through the facing axis - light that has withdrawn inside). THINKING
  // is the crossfade, not a speed change.
  float surfaceE = fresnel * uRim * 2.2 + ridge * 1.3;
  float coreE = facing * (0.45 + 1.2 * ridge);
  // Interior origin: a facing-axis core gradient present in BOTH postures,
  // brightest at the centre of the body and fading limb-ward - light
  // shining out through the medium, not falling onto it. The crossfade
  // only decides how far that light reaches the skin.
  float inner = facing * facing * (0.55 + 0.45 * ridge);
  float energy = uEmission * 0.95 *
    (mix(surfaceE + 0.5 * coreE, 1.35 * coreE + 0.15 * fresnel, uCoreBias) + 0.75 * inner);

  // Bloom's halo, approximated in-shader when bloom is off (low tier):
  // a wider, weaker rim lobe.
  energy += uEmission * uHaloBoost * pow(1.0 - ndv, 1.5);

  float e = clamp(energy, 0.0, 1.0);
  vec3 col = ramp(e);

  // The accent's one job: DORMANT light is olive/moss (#324816), a
  // different kind of light from the waking phosphor - not just dimmer.
  // Proportional to energy (no floor) so the ember dies at the limb and
  // the sphere never reads as a lit disc while asleep.
  col = mix(col, uColAccent * (2.6 * e), uAccentMix);

  // Dissolve: noise-threshold skin erosion for the return-to-dormant.
  // The band just above the threshold brightens: edges that are letting
  // go burn briefly before they end.
  float alpha = 1.0;
  if (uDissolve > 0.001) {
    float nz = clamp(0.55 + 0.40 * vDisp + 0.18 * (hash13(vObj * 7.3) - 0.5), 0.0, 1.0);
    alpha = smoothstep(uDissolve - 0.06, uDissolve + 0.06, nz);
    float band = smoothstep(uDissolve, uDissolve + 0.05, nz) *
                 (1.0 - smoothstep(uDissolve + 0.05, uDissolve + 0.16, nz));
    col += uColGlow * band * 0.8;
  }

  gl_FragColor = vec4(col, alpha);
}
