"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Small glowing nodes that orbit the central crystal — echoes the logo's network motif.
function OrbitingNodes() {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.35;
  });

  const nodes: { pos: [number, number, number]; color: string; size: number }[] = [
    { pos: [2.2, 0.4, 0], color: "#2ec4dd", size: 0.13 },
    { pos: [-2.1, 0.8, 0.6], color: "#ffb86b", size: 0.11 },
    { pos: [0.4, 1.9, -1.2], color: "#5eead4", size: 0.1 },
    { pos: [-0.8, -1.8, 0.9], color: "#9d86ff", size: 0.12 },
    { pos: [1.6, -1.1, 1.3], color: "#ff7eb6", size: 0.09 },
    { pos: [-1.9, -0.3, -1.1], color: "#2ec4dd", size: 0.1 },
  ];

  return (
    <group ref={group}>
      {nodes.map((n, i) => (
        <mesh key={i} position={n.pos}>
          <sphereGeometry args={[n.size, 24, 24]} />
          <meshStandardMaterial
            color={n.color}
            emissive={n.color}
            emissiveIntensity={1.6}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

function Crystal() {
  return (
    <Float speed={1.6} rotationIntensity={1.1} floatIntensity={1.6}>
      <mesh>
        <icosahedronGeometry args={[1.5, 12]} />
        <MeshDistortMaterial
          color="#7c5cff"
          emissive="#3a2a8a"
          emissiveIntensity={0.5}
          roughness={0.15}
          metalness={0.4}
          distort={0.38}
          speed={2.2}
        />
      </mesh>
    </Float>
  );
}

/** Interactive 3D centerpiece for the landing hero. Drag to spin. */
export default function KnowledgeOrb() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={120} color="#9d86ff" />
      <pointLight position={[-5, -3, 2]} intensity={90} color="#ffb86b" />
      <pointLight position={[0, 3, -4]} intensity={60} color="#2ec4dd" />

      <Crystal />
      <OrbitingNodes />
      <Sparkles count={60} scale={7} size={2.4} speed={0.4} color="#9d86ff" opacity={0.7} />

      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}
