import React, { useRef } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { vertexShader, fragmentShader } from "../shaders/marble";

// 1️⃣ Create and extend custom material
const MarbleMaterial = shaderMaterial(
  { uTime: 0 },
  vertexShader,
  fragmentShader
);
extend({ MarbleMaterial });

function BackgroundMesh() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.uTime = clock.elapsedTime;
  });

  return (
    <mesh>
      {/* Full viewport plane */}
      <planeGeometry args={[20, 20]} />
      <marbleMaterial ref={ref} attach="material" />
    </mesh>
  );
}

export default function ShaderBackground() {
  return (
    <Canvas
      style={{
        position: "fixed", // covers entire screen
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
      }}
      camera={{ position: [0, 0, 5] }}
    >
      <BackgroundMesh />
    </Canvas>
  );
}