import { Vector2, Vector3, type IUniform } from "three";

import { PALETTE, rgb } from "../palette";

export interface GroundUniforms {
  uColGround: IUniform<Vector3>;
  uColHalo: IUniform<Vector3>;
  uGroundGlow: IUniform<number>;
  uCenter: IUniform<Vector2>;
  uAspect: IUniform<number>;
  [uniform: string]: IUniform;
}

/**
 * Singleton: the conductor-driven frame writes into these each tick
 * (halo colour and intensity follow the entity's state) and the Ground
 * material reads them.
 */
export const groundUniforms: GroundUniforms = {
  uColGround: { value: new Vector3(...rgb(PALETTE.ground)) },
  uColHalo: { value: new Vector3(...rgb(PALETTE.glow)) },
  uGroundGlow: { value: 0.02 },
  uCenter: { value: new Vector2(0.5, 0.53) },
  uAspect: { value: 1 },
};
