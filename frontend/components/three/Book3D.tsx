"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const PARCHMENT = "#f4ecd8";
const COVER = "#6b4eff";
const ACCENT = "#9d86ff";

// One half of the open book: cover board + page stack + a few "text" lines.
function Half({ side }: { side: 1 | -1 }) {
  const w = 1.55;
  const h = 2.05;
  return (
    <group rotation={[0, side * -0.5, 0]}>
      {/* cover board */}
      <mesh position={[side * (w / 2), 0, -0.12]}>
        <boxGeometry args={[w, h, 0.1]} />
        <meshStandardMaterial color={COVER} roughness={0.45} metalness={0.25} emissive="#241765" emissiveIntensity={0.3} />
      </mesh>
      {/* page stack */}
      <mesh position={[side * (w / 2), 0, 0]}>
        <boxGeometry args={[w - 0.12, h - 0.12, 0.16]} />
        <meshStandardMaterial color={PARCHMENT} roughness={0.9} />
      </mesh>
      {/* lines of text */}
      {[0.6, 0.28, -0.04, -0.36, -0.68].map((y, i) => (
        <mesh key={i} position={[side * (w / 2 + (i % 2 ? -0.05 : 0.05)), y, 0.085]}>
          <boxGeometry args={[(w - 0.55) * (i % 2 ? 0.7 : 1), 0.045, 0.01]} />
          <meshStandardMaterial color={ACCENT} transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  );
}

// A single page that gently turns back and forth across the spine.
function FlippingPage() {
  const ref = useRef<THREE.Group>(null);
  const w = 1.4;
  const h = 1.92;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const phase = (Math.sin(clock.getElapsedTime() * 0.7) + 1) / 2; // 0 → 1 → 0
    ref.current.rotation.y = -0.5 + phase * (-Math.PI + 1.0); // sweep right → left
  });

  return (
    <group ref={ref}>
      <mesh position={[w / 2, 0, 0.19]}>
        <boxGeometry args={[w, h, 0.015]} />
        <meshStandardMaterial color={PARCHMENT} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Book() {
  return (
    <Float speed={1.4} rotationIntensity={0.5} floatIntensity={1.2}>
      <group rotation={[-0.4, 0, 0.05]}>
        {/* spine binding */}
        <mesh position={[0, 0, -0.16]}>
          <boxGeometry args={[0.14, 2.05, 0.36]} />
          <meshStandardMaterial color={COVER} roughness={0.5} metalness={0.35} emissive="#241765" emissiveIntensity={0.3} />
        </mesh>
        <Half side={-1} />
        <Half side={1} />
        <FlippingPage />
      </group>
    </Float>
  );
}

/** Interactive 3D open book for the landing hero backdrop. */
export default function Book3D() {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 6], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.7} />
      <pointLight position={[5, 6, 5]} intensity={130} color="#ffffff" />
      <pointLight position={[-5, -2, 3]} intensity={80} color="#9d86ff" />
      <pointLight position={[0, 3, -4]} intensity={55} color="#2ec4dd" />

      <Book />
      <Sparkles count={50} scale={7} size={2.2} speed={0.4} color="#9d86ff" opacity={0.6} />

      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} />
    </Canvas>
  );
}
