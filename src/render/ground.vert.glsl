// Fullscreen pass: the quad's positions are already clip-space; the camera
// is deliberately ignored so the ground is a screen, not a wall in the
// scene.
varying vec2 vUv;

void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
