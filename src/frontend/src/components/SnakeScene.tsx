import { Box, Grid, Sphere } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { BoxGeometry } from "three";
import type { Mesh } from "three";
import type { Position } from "../hooks/useSnakeGame";

// Grid size constant - must match useSnakeGame
const GRID_SIZE = 20;
const OFFSET = GRID_SIZE / 2 - 0.5; // Center the grid

interface FoodProps {
  position: Position;
}

function FoodMesh({ position }: FoodProps) {
  const meshRef = useRef<Mesh>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    time.current += delta * 2.5;
    const scale = 0.38 + Math.sin(time.current) * 0.08;
    meshRef.current.scale.setScalar(scale);
    meshRef.current.rotation.y += delta * 1.5;
  });

  return (
    <Sphere
      ref={meshRef}
      args={[0.38, 16, 16]}
      position={[position.x - OFFSET, 0.5, position.y - OFFSET]}
    >
      <meshStandardMaterial
        color="#ff6d00"
        emissive="#ff3d00"
        emissiveIntensity={1.8}
        roughness={0.1}
        metalness={0.3}
      />
    </Sphere>
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
      <FoodMesh position={food} />
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
