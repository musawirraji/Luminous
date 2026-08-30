import { Canvas } from "@react-three/fiber";

export function App() {
  return (
    <Canvas
      flat
      linear
      gl={{ antialias: false, powerPreference: "high-performance" }}
    />
  );
}
