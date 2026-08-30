import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Mesh, ShaderMaterial, Vector3 } from "three";

import { PALETTE, rgb } from "../palette";
import { conductor } from "../runtime";
import { diag } from "../runtime";
import { BASE_Y, SCREEN_FRAC_PER_WORLD, SINK_Y } from "./composition";
import fragSrc from "./entity.frag.glsl?raw";
import vertSrc from "./entity.vert.glsl?raw";
import { entityUniforms } from "./entityUniforms";
import { groundUniforms } from "./groundUniforms";
import { QUALITY } from "./quality";

const defines =
  `#define OCTAVES ${QUALITY.octaves}\n` +
  (QUALITY.tangentNormals ? "#define NORMALS_TANGENT\n" : "");

const GLOW = new Vector3(...rgb(PALETTE.glow));
const ACCENT = new Vector3(...rgb(PALETTE.accent));

const frameTimes: number[] = [];

export function Entity() {
  const mesh = useRef<Mesh>(null);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: entityUniforms,
        vertexShader: defines + vertSrc,
        fragmentShader: defines + fragSrc,
        transparent: true,
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ gl }, delta) => {
    const f = conductor.tick(performance.now(), delta);

    entityUniforms.uTime.value = f.time;
    entityUniforms.uEmission.value = f.emission;
    entityUniforms.uCoreBias.value = f.coreBias;
    entityUniforms.uRim.value = f.rim;
    entityUniforms.uDispAmp.value = f.dispAmp;
    entityUniforms.uDispFreq.value = f.dispFreq;
    entityUniforms.uWarp.value = f.warp;
    entityUniforms.uCondense.value = f.condense;
    entityUniforms.uDissolve.value = f.dissolve;
    entityUniforms.uAccentMix.value = f.accentMix;

    // DORMANT rests slightly lower (accentMix doubles as the sink axis);
    // drift is the conductor's, not the mesh's own idea.
    const m = mesh.current;
    const y = BASE_Y - SINK_Y * f.accentMix + f.driftY;
    if (m) m.position.set(f.driftX, y, 0);

    // The ground halo follows the entity's screen position and takes the
    // accent tint as it sleeps — sleeping light is a different light.
    groundUniforms.uGroundGlow.value = f.groundGlow;
    groundUniforms.uCenter.value.set(
      0.5 +
        (f.driftX * SCREEN_FRAC_PER_WORLD) /
          Math.max(groundUniforms.uAspect.value, 1e-6),
      0.5 + y * SCREEN_FRAC_PER_WORLD,
    );
    groundUniforms.uColHalo.value
      .copy(GLOW)
      .lerp(ACCENT, f.accentMix);

    // diagnostics snapshot (readout polls at 4Hz)
    frameTimes.push(delta * 1000);
    if (frameTimes.length > 120) frameTimes.shift();
    const sorted = [...frameTimes].sort((a, b) => a - b);
    const mean = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    diag.label = f.label;
    diag.fps = mean > 0 ? 1000 / mean : 0;
    diag.p95Ms = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
    diag.amp = f.amp;
    diag.drawCalls = gl.info.render.calls;
    diag.tier = QUALITY.tier;
  });

  return (
    <mesh ref={mesh} material={material} position={[0, BASE_Y, 0]}>
      <icosahedronGeometry args={[1, QUALITY.icoOrder]} />
    </mesh>
  );
}
