import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useMemo } from "react";
import { Vector2 } from "three";

import { QUALITY } from "./quality";

/**
 * Bloom is the whole effect and also the whole trap: mip-blurred, high
 * threshold, tuned to slightly less than wanted (docs/02-plan.md hard
 * rules). Grain doubles as full-screen dither on the entity's own dark
 * gradients; chromatic aberration is one third of a pixel — texture, not
 * a look. The low tier drops bloom and CA entirely (the shader-side halo
 * boost stands in) but keeps grain, because grain is also the dither.
 */
export function Post() {
  const caOffset = useMemo(() => new Vector2(0.00028, 0.00034), []);

  const effects = [];
  if (QUALITY.bloom) {
    effects.push(
      <Bloom
        key="bloom"
        mipmapBlur
        intensity={0.5}
        levels={QUALITY.bloomLevels}
        radius={0.7}
        luminanceThreshold={0.62}
        luminanceSmoothing={0.25}
      />,
    );
  }
  if (QUALITY.chromaticAberration) {
    effects.push(<ChromaticAberration key="ca" offset={caOffset} />);
  }
  effects.push(
    <Noise
      key="grain"
      premultiply
      blendFunction={BlendFunction.ADD}
      opacity={0.35}
    />,
  );

  return <EffectComposer multisampling={0}>{effects}</EffectComposer>;
}
