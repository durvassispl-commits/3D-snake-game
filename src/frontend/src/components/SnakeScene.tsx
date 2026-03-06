import { Box, Cylinder, Grid, Sphere } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { BoxGeometry } from "three";
import type { Group, Mesh } from "three";
import type { Position } from "../hooks/useSnakeGame";

// Grid size constant - must match useSnakeGame
const GRID_SIZE = 20;
const OFFSET = GRID_SIZE / 2 - 0.5; // Center the grid

interface FoodProps {
  position: Position;
}

/** Apple made from R3F primitives: red body, brown stem, green leaf */
function AppleMesh({ position }: FoodProps) {
  const groupRef = useRef<Group>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    time.current += delta * 2;
    // Gentle hover bob + rotation
    groupRef.current.position.y = 0.55 + Math.sin(time.current) * 0.07;
    groupRef.current.rotation.y += delta * 1.2;
  });

  const px = position.x - OFFSET;
  const pz = position.y - OFFSET;

  return (
    <group ref={groupRef} position={[px, 0.55, pz]}>
      {/* Apple body */}
      <Sphere args={[0.38, 20, 20]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#d32f2f"
          emissive="#b71c1c"
          emissiveIntensity={0.6}
          roughness={0.25}
          metalness={0.15}
        />
      </Sphere>

      {/* Subtle indent at top (darker sphere) */}
      <Sphere args={[0.13, 12, 12]} position={[0, 0.3, 0]}>
        <meshStandardMaterial color="#b71c1c" roughness={0.5} metalness={0.0} />
      </Sphere>

      {/* Stem */}
      <Cylinder args={[0.025, 0.035, 0.22, 8]} position={[0.04, 0.49, 0]}>
        <meshStandardMaterial color="#4e342e" roughness={0.8} metalness={0} />
      </Cylinder>

      {/* Leaf (thin squished sphere) */}
      <Sphere
        args={[0.14, 10, 8]}
        position={[0.16, 0.54, 0]}
        scale={[1, 0.25, 0.5]}
        rotation={[0, 0, -0.4]}
      >
        <meshStandardMaterial
          color="#388e3c"
          emissive="#1b5e20"
          emissiveIntensity={0.4}
          roughness={0.4}
          metalness={0}
        />
      </Sphere>
    </group>
  );
}

interface SnakeSegmentProps {
  position: Position;
  isHead: boolean;
  index: number;
  totalLength: number;
}

function SnakeSegment({
  position,
  isHead,
  index,
  totalLength,
}: SnakeSegmentProps) {
  const meshRef = useRef<Mesh>(null);
  const time = useRef(index * 0.3);

  useFrame((_, delta) => {
    if (!meshRef.current || !isHead) return;
    time.current += delta * 3;
    meshRef.current.rotation.y = Math.sin(time.current) * 0.08;
  });

  // Body segments get slightly darker towards tail
  const bodyProgress = totalLength > 1 ? index / (totalLength - 1) : 0;
  const emissiveIntensity = isHead ? 1.2 : 0.4 + (1 - bodyProgress) * 0.4;

  return (
    <Box
      ref={meshRef}
      args={[0.85, 0.85, 0.85]}
      position={[position.x - OFFSET, 0.45, position.y - OFFSET]}
    >
      <meshStandardMaterial
        color={isHead ? "#00e5ff" : "#00c853"}
        emissive={isHead ? "#00b8d4" : "#00701a"}
        emissiveIntensity={emissiveIntensity}
        roughness={0.2}
        metalness={0.5}
      />
    </Box>
  );
}

// Create border geometry outside component to avoid recreation
const borderGeom = new BoxGeometry(GRID_SIZE, 0.1, GRID_SIZE);

function GridFloor() {
  return (
    <>
      {/* Floor plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[GRID_SIZE, GRID_SIZE]} />
        <meshStandardMaterial color="#060618" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Grid lines */}
      <Grid
        args={[GRID_SIZE, GRID_SIZE]}
        position={[0, 0.01, 0]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1a2040"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#1e3060"
        fadeDistance={50}
        fadeStrength={0}
      />
      {/* Border indicator */}
      <lineSegments position={[0, 0.05, 0]}>
        <edgesGeometry args={[borderGeom]} />
        <lineBasicMaterial color="#00e5ff" transparent opacity={0.25} />
      </lineSegments>
    </>
  );
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.3} color="#0a1a3a" />
      <directionalLight
        position={[8, 15, 8]}
        intensity={1.2}
        color="#e0f0ff"
        castShadow
      />
      <pointLight position={[0, 8, 0]} intensity={0.5} color="#00e5ff" />
      <pointLight position={[-5, 3, -5]} intensity={0.3} color="#00c853" />
    </>
  );
}

interface SnakeSceneProps {
  snake: Position[];
  food: Position;
}

function SceneContent({ snake, food }: SnakeSceneProps) {
  return (
    <>
      <SceneLights />
      <GridFloor />
      {snake.map((seg, i) => (
        <SnakeSegment
          // Using index is acceptable here: snake positions shift every tick,
          // no stable identity exists per-segment. Suppressed intentionally.
          // biome-ignore lint/suspicious/noArrayIndexKey: positional segments
          key={i}
          position={seg}
          isHead={i === snake.length - 1}
          index={i}
          totalLength={snake.length}
        />
      ))}
      <AppleMesh position={food} />
    </>
  );
}

export function SnakeScene({ snake, food }: SnakeSceneProps) {
  return (
    <Canvas
      shadows
      camera={{
        position: [0, 22, 18],
        fov: 50,
        near: 0.1,
        far: 200,
      }}
      gl={{ antialias: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <SceneContent snake={snake} food={food} />
    </Canvas>
  );
}
