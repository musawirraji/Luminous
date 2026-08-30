import { Canvas } from "@react-three/fiber";
import { Color } from "three";

import { PALETTE } from "./palette";
import { CAMERA_FOV, CAMERA_Z } from "./render/composition";
import { Ground } from "./render/Ground";
import { QUALITY } from "./render/quality";

export function App() {
  return (
    <Canvas
      flat
      linear
      dpr={Math.min(
        typeof devicePixelRatio === "number" ? devicePixelRatio : 1,
        QUALITY.dprCap,
      )}
      camera={{ position: [0, 0, CAMERA_Z], fov: CAMERA_FOV }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor(new Color(PALETTE.ground))}
    >
      <Ground />
    </Canvas>
  );
}
