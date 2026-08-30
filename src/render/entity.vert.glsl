uniform float uTime; // pre-integrated flow time: the conductor sums dt * uFlowSpeed
                     // so flow-rate changes bend the motion instead of jumping it
uniform float uDispAmp;
uniform float uDispFreq;
uniform float uWarp;
uniform float uCondense;

varying float vDisp;
varying vec3 vWorldPos;
varying vec3 vObj;
#ifdef NORMALS_TANGENT
varying vec3 vNormalW;
#endif

// Simplex 3D noise by Ian McEwan & Stefan Gustavson (ashima/webgl-noise,
// MIT). Procedural: no texture fetches anywhere in the pipeline.
vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 1.0 / 7.0;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float displacementAt(vec3 p, float t) {
  // Domain warp first: a low-frequency vector field bends the sampling
  // domain so surface features migrate and shear rather than scrolling
  // past - the difference between weather and a texture pan.
  vec3 w = uWarp * vec3(
    snoise(p * 0.9 + vec3(0.0, t * 0.31, 0.0)),
    snoise(p * 0.9 + vec3(4.7, t * 0.27, 1.3)),
    snoise(p * 0.9 + vec3(9.1, 2.2, t * 0.23)));
  vec3 q = p * uDispFreq + w;
  // Octave ratios are deliberately off-integer (2.03, 4.11) and each layer
  // advects on its own axis mix, so no combination of layers ever
  // phase-locks into a loop the eye can grab.
  float d = snoise(q + vec3(t * 0.10, t * 0.07, t * 0.13));
  d += 0.5 * snoise(q * 2.03 + vec3(-t * 0.08, t * 0.11, t * 0.05));
#if OCTAVES >= 3
  d += 0.25 * snoise(q * 4.11 + vec3(t * 0.06, -t * 0.04, t * 0.09));
  return d / 1.75;
#else
  return d / 1.5;
#endif
}

vec3 displacedPoint(vec3 unit, float t) {
  return unit * (uCondense + uDispAmp * displacementAt(unit, t));
}

void main() {
  vec3 unit = normalize(position);
  float d = displacementAt(unit, uTime);
  vDisp = d;
  vObj = unit;
  vec3 pos = unit * (uCondense + uDispAmp * d);

#ifdef NORMALS_TANGENT
  // Rebuild the true displaced normal from two tangent-frame neighbours.
  // This is what lets the fresnel rim respond to the deformation itself;
  // the low tier trades it for the undisplaced sphere normal.
  vec3 up = abs(unit.y) > 0.93 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 tangent = normalize(cross(up, unit));
  vec3 bitangent = cross(unit, tangent);
  float h = 0.05;
  vec3 pT = displacedPoint(normalize(unit + tangent * h), uTime);
  vec3 pB = displacedPoint(normalize(unit + bitangent * h), uTime);
  vec3 n = normalize(cross(pT - pos, pB - pos));
  vNormalW = normalize(mat3(modelMatrix) * (dot(n, unit) < 0.0 ? -n : n));
#endif

  vec4 world = modelMatrix * vec4(pos, 1.0);
  vWorldPos = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
