import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Evaluation, PartInput, VehicleInput } from "@/forge/sim/evaluate";
import { palette, stressTint } from "@/forge/palette";

type Props = {
  artifact: "glider" | "drone_arm";
  parts: PartInput[];
  vehicle: VehicleInput | null;
  evaluation: Evaluation;
  exaggerate: number;
  replay: number;
  ortho: boolean;
  cut: number;
};

export function ForgeViewport(props: Props) {
  const [mounted, setMounted] = useState(false);
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    setMounted(true);
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  if (!mounted) {
    return <div className="h-56 w-full bg-panel lg:h-full" />;
  }
  return (
    <Canvas
      key={props.ortho ? "ortho" : "persp"}
      orthographic={props.ortho}
      gl={{ localClippingEnabled: true, antialias: true }}
      camera={
        props.ortho
          ? { position: [0.55, 0.38, 0.72], zoom: 420, near: 0.01, far: 20 }
          : { position: [0.48, 0.28, 0.62], fov: 38, near: 0.01, far: 20 }
      }
      style={{ touchAction: "none" }}
    >
      <color attach="background" args={[palette.hangar]} />
      <ambientLight intensity={1.05} />
      <directionalLight position={[0.4, 0.8, 0.3]} intensity={1.8} />
      <Scene {...props} reduce={reduce} />
      <OrbitControls makeDefault enablePan target={[0.2, 0.02, 0]} />
    </Canvas>
  );
}

function Scene({ artifact, parts, vehicle, evaluation, exaggerate, replay, cut, reduce }: Props & { reduce: boolean }) {
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 1), []);
  plane.constant = 0.04 - cut * 0.08;
  const hot = evaluation.parts.slice().sort((a, b) => b.utilization - a.utilization)[0];
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.1, -0.04, 0]}>
        <planeGeometry args={[1.2, 0.8]} />
        <meshStandardMaterial color={palette.panel} />
      </mesh>
      {artifact === "drone_arm" ? (
        <Arm parts={parts} evaluation={evaluation} exaggerate={exaggerate} replay={replay} plane={plane} reduce={reduce} />
      ) : (
        <Glider parts={parts} vehicle={vehicle} evaluation={evaluation} exaggerate={exaggerate} plane={plane} />
      )}
      {hot && hot.utilization >= 1 ? (
        <mesh position={artifact === "drone_arm" ? [0, 0.012, 0] : [0.05, 0.02, 0]}>
          <sphereGeometry args={[0.006, 16, 16]} />
          <meshStandardMaterial color={palette.alarm} />
        </mesh>
      ) : null}
    </group>
  );
}

function Arm({
  parts,
  evaluation,
  exaggerate,
  replay,
  plane,
  reduce,
}: {
  parts: PartInput[];
  evaluation: Evaluation;
  exaggerate: number;
  replay: number;
  plane: THREE.Plane;
  reduce: boolean;
}) {
  const part = parts[0];
  const result = evaluation.parts[0];
  const length = ((part?.params.length_mm ?? 160) / 1000);
  const outer = (part?.params.outer_mm ?? 12) / 1000;
  const util = Math.min(1.4, result?.utilization ?? 0);
  const tip = ((result?.deflection_mm ?? 0) / 1000) * exaggerate;
  const geo = useMemo(() => new THREE.CylinderGeometry(outer / 2, outer / 2, length, 28, 20), [outer, length]);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo]);
  const shown = useRef(reduce ? tip : 0);
  const replaySeen = useRef(replay);
  if (replaySeen.current !== replay) {
    replaySeen.current = replay;
    shown.current = 0;
  }

  useEffect(() => {
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const y = base[i * 3 + 1] ?? 0;
      const along = (y + length / 2) / length;
      tmp.set(stressTint((1 - along) * Math.min(1, util)));
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  }, [geo, base, length, util]);

  useFrame((_, dt) => {
    const goal = reduce ? tip : tip;
    shown.current = reduce ? goal : shown.current + (goal - shown.current) * Math.min(1, dt * 6);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = base[i * 3 + 1] ?? 0;
      const xi = (y + length / 2) / Math.max(length, 1e-6);
      const shape = (3 * xi * xi - xi * xi * xi) / 2;
      pos.setXYZ(i, (base[i * 3] ?? 0) + shown.current * shape, y, base[i * 3 + 2] ?? 0);
    }
    pos.needsUpdate = true;
  });

  useEffect(() => () => geo.dispose(), [geo]);

  return (
    <group rotation={[0, 0, -Math.PI / 2]} position={[length / 2, 0, 0]}>
      <mesh geometry={geo}>
        <meshStandardMaterial vertexColors metalness={0.15} roughness={0.55} clippingPlanes={[plane]} />
      </mesh>
      <mesh position={[0, -length / 2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[outer * 1.6, outer * 1.6, outer * 1.2]} />
        <meshStandardMaterial color={palette.dust} clippingPlanes={[plane]} />
      </mesh>
    </group>
  );
}

function Glider({
  parts,
  vehicle,
  evaluation,
  exaggerate,
  plane,
}: {
  parts: PartInput[];
  vehicle: VehicleInput | null;
  evaluation: Evaluation;
  exaggerate: number;
  plane: THREE.Plane;
}) {
  const wing = parts.find((p) => p.id === "wing");
  const fuse = parts.find((p) => p.id === "fuselage");
  const tail = parts.find((p) => p.id === "tail");
  const wingUtil = evaluation.parts.find((p) => p.id === "wing")?.utilization ?? 0;
  const wingDefl = evaluation.parts.find((p) => p.id === "wing")?.deflection_mm ?? 0;
  const bow = Math.min(0.35, (wingDefl / 12) * exaggerate * 0.01);
  const span = (wing?.params.span_mm ?? 500) / 1000;
  const chord = (wing?.params.chord_mm ?? 90) / 1000;
  const thick = (wing?.params.thickness_mm ?? 4) / 1000;
  const fuseL = (fuse?.params.length_mm ?? 420) / 1000;
  const fuseW = (fuse?.params.width_mm ?? 12) / 1000;
  const fuseH = (fuse?.params.height_mm ?? 12) / 1000;
  const tailSpan = (tail?.params.span_mm ?? 160) / 1000;
  const tailChord = (tail?.params.chord_mm ?? 50) / 1000;
  const tailT = (tail?.params.thickness_mm ?? 3) / 1000;
  const le = (vehicle?.noseToWingLe_mm ?? 120) / 1000;
  const cg = (vehicle?.cg_fromNose_mm ?? 150) / 1000;
  const clip = [plane];
  return (
    <group>
      <mesh position={[fuseL / 2, 0, 0]}>
        <boxGeometry args={[fuseL, fuseH, fuseW]} />
        <meshStandardMaterial color={palette.bone} clippingPlanes={clip} />
      </mesh>
      <group position={[le + chord / 2, fuseH / 2, 0]} rotation={[0, 0, bow]}>
        <mesh>
          <boxGeometry args={[chord, thick, span]} />
          <meshStandardMaterial color={stressTint(Math.min(1, wingUtil))} clippingPlanes={clip} />
        </mesh>
      </group>
      <mesh position={[fuseL - tailChord / 2, fuseH / 2 + 0.004, 0]}>
        <boxGeometry args={[tailChord, tailT, tailSpan]} />
        <meshStandardMaterial color={palette.bone} clippingPlanes={clip} />
      </mesh>
      <mesh position={[cg, fuseH / 2 + 0.02, 0]}>
        <sphereGeometry args={[0.008, 16, 16]} />
        <meshStandardMaterial color={palette.brass} />
      </mesh>
    </group>
  );
}
