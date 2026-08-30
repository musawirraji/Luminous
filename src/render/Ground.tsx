import { ScreenQuad } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { ShaderMaterial } from "three";

import fragmentShader from "./ground.frag.glsl?raw";
import { groundUniforms } from "./groundUniforms";
import vertexShader from "./ground.vert.glsl?raw";

export function Ground() {
  const size = useThree((s) => s.size);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: groundUniforms,
        vertexShader,
        fragmentShader,
        depthWrite: false,
        depthTest: false,
      }),
    [],
  );

  useEffect(() => {
    groundUniforms.uAspect.value = size.width / size.height;
  }, [size]);

  useEffect(() => () => material.dispose(), [material]);

  return <ScreenQuad material={material} renderOrder={-1} />;
}
