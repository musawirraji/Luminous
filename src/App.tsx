import { Canvas, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useState } from "react";
import { Color } from "three";

import { Diagnostics } from "./controls/Diagnostics";
import { useKeyboard } from "./controls/useKeyboard";
import { PALETTE } from "./palette";
import { CAMERA_FOV, CAMERA_Z } from "./render/composition";
import { Entity } from "./render/Entity";
import { Ground } from "./render/Ground";
import { Post } from "./render/Post";
import { QUALITY } from "./render/quality";
import { bus, conductor } from "./runtime";

/** re-applies the tier's DPR cap when the window moves between displays */
function DprSync() {
  const setDpr = useThree((s) => s.setDpr);
  useEffect(() => {
    let mql: MediaQueryList | null = null;
    const apply = () => setDpr(Math.min(window.devicePixelRatio, QUALITY.dprCap));
    const listen = () => {
      mql?.removeEventListener("change", onChange);
      mql = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      mql.addEventListener("change", onChange);
    };
    const onChange = () => {
      apply();
      listen();
    };
    apply();
    listen();
    return () => mql?.removeEventListener("change", onChange);
  }, [setDpr]);
  return null;
}

export function App() {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const toggleDiagnostics = useCallback(
    () => setShowDiagnostics((v) => !v),
    [],
  );

  useKeyboard(toggleDiagnostics);

  // The evaluator will background the tab: pause the amplitude bus and
  // resume without a jump (the smoother holds its value, sources advance
  // their own clamped clocks).
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) bus.pause();
      else bus.resume();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // prefers-reduced-motion: reduce breath/drift, drop the SPEAKING flare —
  // never freeze.
  useEffect(() => {
    const mql = matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => conductor.setReducedMotion(mql.matches);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  return (
    <>
      <Canvas
        flat
        linear
        dpr={Math.min(
          typeof devicePixelRatio === "number" ? devicePixelRatio : 1,
          QUALITY.dprCap,
        )}
        camera={{ position: [0, 0, CAMERA_Z], fov: CAMERA_FOV }}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          preserveDrawingBuffer: true,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(new Color(PALETTE.ground));
          // manual reset in the frame loop so diagnostics sees every pass
          gl.info.autoReset = false;
        }}
      >
        <DprSync />
        <Ground />
        <Entity />
        <Post />
      </Canvas>
      <Diagnostics visible={showDiagnostics} />
    </>
  );
}
