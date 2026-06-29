'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Hooks ──────────────────────────────────────────────────────────────────

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

function useMouseParallax() {
  const mouse = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, []);
  return mouse;
}

// ─── Particle ────────────────────────────────────────────────────────────────

const PARTICLE_COLORS = ['#2563eb', '#818cf8', '#60a5fa'];
const PARTICLE_COUNT = 10;

function Particle({
  index,
  reducedMotion,
}: {
  index: number;
  reducedMotion: boolean;
}) {
  const ref = useRef<THREE.Mesh | null>(null);
  const p = useMemo(
    () => ({
      baseAngle: (index / PARTICLE_COUNT) * Math.PI * 2,
      radius: 0.92 + (index % 3) * 0.19,
      speed: 0.30 + (index % 5) * 0.07,
      yOffset: ((index % 3) - 1) * 0.38,
      yWave: 0.07 + (index % 3) * 0.04,
      yFreq: 1.1 + (index % 4) * 0.18,
      phase: index * 0.85,
    }),
    [index]
  );
  const color = PARTICLE_COLORS[index % 3];

  useFrame(({ clock }) => {
    if (reducedMotion || !ref.current) return;
    const t = clock.elapsedTime * p.speed + p.baseAngle;
    ref.current.position.x = Math.cos(t) * p.radius;
    ref.current.position.z = Math.sin(t) * p.radius;
    ref.current.position.y = p.yOffset + Math.sin(t * p.yFreq + p.phase) * p.yWave;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.036, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.6}
        roughness={0}
        metalness={0}
      />
    </mesh>
  );
}

// ─── Internal grid lines (subdivisions on cube faces) ────────────────────────

function GridLines() {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const h = 0.7; // half-size
    // 2 interior divisions per axis
    for (let i = 1; i <= 2; i++) {
      const v = -h + (i / 3) * h * 2;
      // Front / back Z faces: vertical & horizontal
      positions.push(v, -h, h, v, h, h);
      positions.push(v, -h, -h, v, h, -h);
      positions.push(-h, v, h, h, v, h);
      positions.push(-h, v, -h, h, v, -h);
      // Left / right X faces
      positions.push(-h, v, -h, -h, v, h);
      positions.push(h, v, -h, h, v, h);
      positions.push(-h, -h, v, -h, h, v);
      positions.push(h, -h, v, h, h, v);
      // Top / bottom Y faces
      positions.push(v, h, -h, v, h, h);
      positions.push(v, -h, -h, v, -h, h);
      positions.push(-h, h, v, h, h, v);
      positions.push(-h, -h, v, h, -h, v);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#bfdbfe" transparent opacity={0.1} />
    </lineSegments>
  );
}

// ─── Main cube ───────────────────────────────────────────────────────────────

function InventoryCube({
  reducedMotion,
  mouse,
}: {
  reducedMotion: boolean;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const outerRef = useRef<THREE.Group | null>(null);
  const innerRef = useRef<THREE.Group | null>(null);
  const smoothMouse = useRef({ x: 0, y: 0 });

  const outerEdges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.4, 1.4, 1.4)), []);
  const glowEdges  = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.45, 1.45, 1.45)), []);
  const innerEdges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.84, 0.84, 0.84)), []);

  useEffect(() => () => { outerEdges.dispose(); glowEdges.dispose(); innerEdges.dispose(); }, [outerEdges, glowEdges, innerEdges]);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;

    if (innerRef.current && !reducedMotion) {
      innerRef.current.rotation.y += delta * 0.22;
      innerRef.current.rotation.x  = Math.sin(t * 0.37) * 0.08;
      innerRef.current.position.y  = Math.sin(t * 0.53) * 0.1;
    }

    if (outerRef.current && !reducedMotion) {
      smoothMouse.current.x += (mouse.current.x * 0.18 - smoothMouse.current.x) * 0.06;
      smoothMouse.current.y += (-mouse.current.y * 0.13 - smoothMouse.current.y) * 0.06;
      outerRef.current.rotation.y = smoothMouse.current.x;
      outerRef.current.rotation.x = smoothMouse.current.y;
    }
  });

  return (
    <group ref={outerRef}>
      <group ref={innerRef}>
        {/* Glass panels */}
        <mesh>
          <boxGeometry args={[1.4, 1.4, 1.4]} />
          <meshPhysicalMaterial
            color="#dbeafe"
            transparent
            opacity={0.06}
            roughness={0.04}
            metalness={0}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Soft glow halo edges */}
        <lineSegments geometry={glowEdges}>
          <lineBasicMaterial color="#93c5fd" transparent opacity={0.2} />
        </lineSegments>

        {/* Primary sharp edges */}
        <lineSegments geometry={outerEdges}>
          <lineBasicMaterial color="#2563eb" transparent opacity={0.88} />
        </lineSegments>

        {/* Inner ghost cube */}
        <lineSegments geometry={innerEdges}>
          <lineBasicMaterial color="#818cf8" transparent opacity={0.22} />
        </lineSegments>

        {/* Face subdivision grid */}
        <GridLines />

        {/* Orbiting particles */}
        {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
          <Particle key={i} index={i} reducedMotion={reducedMotion} />
        ))}
      </group>
    </group>
  );
}

// ─── Scene root ──────────────────────────────────────────────────────────────

function Scene() {
  const reducedMotion = useReducedMotion();
  const mouse = useMouseParallax();

  return (
    <>
      <ambientLight intensity={1.1} color="#f8fafc" />
      <pointLight position={[3, 4, 3]}  intensity={10} color="#2563eb" />
      <pointLight position={[-3, -2, -3]} intensity={5} color="#818cf8" />
      <pointLight position={[1, -3, 4]}  intensity={3} color="#60a5fa" />
      <InventoryCube reducedMotion={reducedMotion} mouse={mouse} />
    </>
  );
}

// ─── Public export ───────────────────────────────────────────────────────────

export function Dashboard3DScene({ className = '' }: { className?: string }) {
  return (
    <Canvas
      className={className}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.3, 3.5], fov: 45 }}
      dpr={[1, 2]}
      style={{ background: 'transparent', pointerEvents: 'none' }}
    >
      <Scene />
    </Canvas>
  );
}
