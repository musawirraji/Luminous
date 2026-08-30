import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Mesh, ShaderMaterial } from "three";

import { BASE_Y } from "./composition";
import fragSrc from "./entity.frag.glsl?raw";
import vertSrc from "./entity.vert.glsl?raw";
import { entityUniforms } from "./entityUniforms";
import { QUALITY } from "./quality";

const defines =
  `#define OCTAVES ${QUALITY.octaves}\n` +
  (QUALITY.tangentNormals ? "#define NORMALS_TANGENT\n" : "");

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

  // Placeholder driver until the conductor lands: a fixed waking pose so
  // the surface and palette can be judged in isolation.
  useFrame((_, delta) => {
    entityUniforms.uTime.value += Math.min(delta, 1 / 30) * 0.4;
    entityUniforms.uEmission.value = 0.55;
    entityUniforms.uCoreBias.value = 0.35;
    entityUniforms.uRim.value = 0.5;
    entityUniforms.uDispAmp.value = 0.12;
    entityUniforms.uDispFreq.value = 1.0;
    entityUniforms.uWarp.value = 0.2;
    entityUniforms.uCondense.value = 1.0;
    entityUniforms.uAccentMix.value = 0;
  });

  return (
    <mesh ref={mesh} material={material} position={[0, BASE_Y, 0]}>
      <icosahedronGeometry args={[1, QUALITY.icoOrder]} />
    </mesh>
  );
}
