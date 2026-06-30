'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type TabMode = 'inventory' | 'receipts';

// ─── Hooks ───────────────────────────────────────────────────────────────────

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

// ─── Inventory: Orbiting particles ───────────────────────────────────────────

const INV_COLORS = ['#3b82f6', '#60a5fa', '#818cf8'];
const INV_COUNT = 8;

function InvParticle({ index, rm }: { index: number; rm: boolean }) {
  const ref = useRef<THREE.Mesh | null>(null);
  const p = useMemo(
    () => ({
      base: (index / INV_COUNT) * Math.PI * 2,
      r: 1.05 + (index % 3) * 0.18,
      speed: 0.24 + (index % 4) * 0.055,
      yOff: ((index % 3) - 1) * 0.28,
      yW: 0.055 + (index % 3) * 0.025,
      yF: 0.95 + (index % 4) * 0.18,
      ph: index * 0.72,
    }),
    [index]
  );
  const color = INV_COLORS[index % 3];

  useFrame(({ clock }) => {
    if (rm || !ref.current) return;
    const t = clock.elapsedTime * p.speed + p.base;
    ref.current.position.x = Math.cos(t) * p.r;
    ref.current.position.z = Math.sin(t) * p.r;
    ref.current.position.y = p.yOff + Math.sin(t * p.yF + p.ph) * p.yW;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.026, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.2} roughness={0} />
    </mesh>
  );
}

// ─── Inventory: Supply crate ──────────────────────────────────────────────────

function InventoryCrate({ rm }: { rm: boolean }) {
  const group = useRef<THREE.Group | null>(null);

  const outerE = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.28, 1.08, 1.28)), []);
  const glowE  = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.34, 1.14, 1.34)), []);
  const b1E    = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.54, 0.40, 0.52)), []);
  const b2E    = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.62, 0.33, 0.58)), []);
  const b3E    = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.38, 0.28, 0.38)), []);

  useEffect(
    () => () => { outerE.dispose(); glowE.dispose(); b1E.dispose(); b2E.dispose(); b3E.dispose(); },
    [outerE, glowE, b1E, b2E, b3E]
  );

  useFrame(({ clock }) => {
    if (rm || !group.current) return;
    const t = clock.elapsedTime;
    group.current.rotation.y = t * 0.17;
    group.current.rotation.x = Math.sin(t * 0.32) * 0.055;
    group.current.position.y = Math.sin(t * 0.49) * 0.11;
  });

  return (
    <group ref={group}>
      {/* Glassy outer shell */}
      <mesh>
        <boxGeometry args={[1.28, 1.08, 1.28]} />
        <meshPhysicalMaterial
          color="#dbeafe"
          transparent
          opacity={0.048}
          roughness={0.04}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Soft glow outline */}
      <lineSegments geometry={glowE}>
        <lineBasicMaterial color="#93c5fd" transparent opacity={0.16} />
      </lineSegments>

      {/* Primary crisp edges */}
      <lineSegments geometry={outerE}>
        <lineBasicMaterial color="#2563eb" transparent opacity={0.88} />
      </lineSegments>

      {/* Stacked inner box 1 — centre bottom */}
      <group position={[0, -0.14, 0]}>
        <lineSegments geometry={b1E}>
          <lineBasicMaterial color="#60a5fa" transparent opacity={0.52} />
        </lineSegments>
      </group>

      {/* Stacked inner box 2 — slightly left, mid */}
      <group position={[-0.09, 0.06, 0.09]}>
        <lineSegments geometry={b2E}>
          <lineBasicMaterial color="#818cf8" transparent opacity={0.42} />
        </lineSegments>
      </group>

      {/* Stacked inner box 3 — top right */}
      <group position={[0.14, 0.24, -0.09]}>
        <lineSegments geometry={b3E}>
          <lineBasicMaterial color="#60a5fa" transparent opacity={0.48} />
        </lineSegments>
      </group>

      {Array.from({ length: INV_COUNT }, (_, i) => (
        <InvParticle key={i} index={i} rm={rm} />
      ))}
    </group>
  );
}

// ─── Receipts: Animated scan beam ────────────────────────────────────────────

function ScanBeam({ rm }: { rm: boolean }) {
  const ref = useRef<THREE.Mesh | null>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    if (!rm) {
      ref.current.position.y = Math.sin(clock.elapsedTime * 1.15) * 0.58;
    }
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = rm ? 1.4 : 1.3 + Math.sin(clock.elapsedTime * 3.2) * 0.55;
  });

  return (
    <mesh ref={ref} position={[0, 0, 0.04]}>
      <boxGeometry args={[1.05, 0.022, 0.018]} />
      <meshStandardMaterial
        color="#4ade80"
        emissive="#4ade80"
        emissiveIntensity={1.4}
        transparent
        opacity={0.88}
        roughness={0}
      />
    </mesh>
  );
}

// ─── Receipts: Orbiting mini-receipts ────────────────────────────────────────

const REC_COLORS = ['#4ade80', '#60a5fa', '#86efac'];
const REC_COUNT = 6;

function RecParticle({ index, rm }: { index: number; rm: boolean }) {
  const ref = useRef<THREE.Mesh | null>(null);
  const p = useMemo(
    () => ({
      base: (index / REC_COUNT) * Math.PI * 2,
      r: 1.0 + (index % 2) * 0.24,
      speed: 0.19 + (index % 3) * 0.07,
      yOff: ((index % 3) - 1) * 0.32,
      ph: index * 0.88,
    }),
    [index]
  );
  const color = REC_COLORS[index % 3];

  useFrame(({ clock }) => {
    if (rm || !ref.current) return;
    const t = clock.elapsedTime * p.speed + p.base;
    ref.current.position.x = Math.cos(t) * p.r;
    ref.current.position.z = Math.sin(t) * p.r;
    ref.current.position.y = p.yOff + Math.sin(t * 0.78 + p.ph) * 0.07;
    ref.current.rotation.z = t * 0.45;
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.17, 0.23, 0.019]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.15}
        transparent
        opacity={0.68}
        roughness={0}
      />
    </mesh>
  );
}

// ─── Receipts: Receipt sheet ──────────────────────────────────────────────────

function ReceiptScanner({ rm }: { rm: boolean }) {
  const group = useRef<THREE.Group | null>(null);

  const receiptE = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.08, 1.56, 0.038)), []);
  const glowE    = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.12, 1.60, 0.065)), []);

  // Receipt "text" lines — varying widths for realism
  const textLines = useMemo(() => {
    const widths = [0.44, 0.30, 0.40, 0.22, 0.38, 0.28];
    const positions: number[] = [];
    widths.forEach((w, i) => {
      const y = 0.52 - i * 0.22;
      positions.push(-w, y, 0.024, w, y, 0.024);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  useEffect(
    () => () => { receiptE.dispose(); glowE.dispose(); textLines.dispose(); },
    [receiptE, glowE, textLines]
  );

  useFrame(({ clock }) => {
    if (rm || !group.current) return;
    const t = clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.27) * 0.24;
    group.current.rotation.x = Math.sin(t * 0.34) * 0.07;
    group.current.position.y = Math.sin(t * 0.47) * 0.11;
  });

  return (
    <group ref={group}>
      {/* Receipt body */}
      <mesh>
        <boxGeometry args={[1.08, 1.56, 0.038]} />
        <meshPhysicalMaterial
          color="#e0f2fe"
          transparent
          opacity={0.055}
          roughness={0.1}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Soft green glow outline */}
      <lineSegments geometry={glowE}>
        <lineBasicMaterial color="#86efac" transparent opacity={0.14} />
      </lineSegments>

      {/* Primary receipt border */}
      <lineSegments geometry={receiptE}>
        <lineBasicMaterial color="#4ade80" transparent opacity={0.72} />
      </lineSegments>

      {/* Simulated text rows */}
      <lineSegments geometry={textLines}>
        <lineBasicMaterial color="#60a5fa" transparent opacity={0.28} />
      </lineSegments>

      <ScanBeam rm={rm} />

      {Array.from({ length: REC_COUNT }, (_, i) => (
        <RecParticle key={i} index={i} rm={rm} />
      ))}
    </group>
  );
}

// ─── Scene root ───────────────────────────────────────────────────────────────

function Scene({ tab }: { tab: TabMode }) {
  const rm = useReducedMotion();

  return (
    <>
      <ambientLight intensity={1.05} color="#f0f9ff" />
      {tab === 'inventory' ? (
        <>
          <pointLight position={[2, 3, 2]} intensity={8} color="#3b82f6" />
          <pointLight position={[-2, -2, -2]} intensity={4} color="#818cf8" />
          <InventoryCrate rm={rm} />
        </>
      ) : (
        <>
          <pointLight position={[2, 3, 2]} intensity={6} color="#4ade80" />
          <pointLight position={[-2, -2, -2]} intensity={4} color="#60a5fa" />
          <ReceiptScanner rm={rm} />
        </>
      )}
    </>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export function RoomTab3DVisual({ tab, className = '' }: { tab: TabMode; className?: string }) {
  return (
    <Canvas
      className={className}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.15, 3.6], fov: 48 }}
      dpr={[1, 2]}
      style={{ background: 'transparent', pointerEvents: 'none' }}
    >
      <Scene tab={tab} />
    </Canvas>
  );
}
