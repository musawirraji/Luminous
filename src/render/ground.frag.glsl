precision highp float;

uniform vec3 uColGround;
uniform vec3 uColHalo;
uniform float uGroundGlow;
uniform vec2 uCenter;
uniform float uAspect;

varying vec2 vUv;

// 8x8 Bayer threshold, computed from the pixel coordinate's bit pattern
// rather than a texture: three rounds of bit interleaving produce the
// classic ordered-dither matrix. Intent: dark gradients on 8-bit displays
// band; a sub-LSB ordered offset before quantisation breaks the bands
// without visible grain of its own.
float bayer8(vec2 fragCoord) {
  ivec2 p = ivec2(mod(fragCoord, 8.0));
  int x = p.x ^ p.y;
  int v = ((p.y & 1) << 5) | ((x & 1) << 4)
        | ((p.y & 2) << 2) | ((x & 2) << 1)
        | ((p.y & 4) >> 1) | ((x & 4) >> 2);
  return float(v) / 64.0;
}

void main() {
  // Radial halo around the entity's screen position; aspect-corrected so
  // it stays circular. The falloff copies the reference behaviour of a
  // diffuse source over a toned ground: quick to near-black, no hard edge.
  vec2 d2 = vec2((vUv.x - uCenter.x) * uAspect, vUv.y - uCenter.y);
  float d = length(d2);
  float halo = exp(-d * d * 7.5) * uGroundGlow;

  vec3 col = uColGround + uColHalo * halo;

  // Ordered dither, ±half an 8-bit step. Not optional: the ground is a
  // slow dark gradient, exactly where banding lives.
  col += (bayer8(gl_FragCoord.xy) - 0.5) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
