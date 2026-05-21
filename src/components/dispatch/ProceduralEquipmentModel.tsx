"use client";

import { Html } from "@react-three/drei";

import type {
  EquipmentTwinAssemblyState,
  EquipmentTwinId,
} from "../../lib/dispatch/equipmentTwinTypes";

type ProceduralEquipmentModelProps = {
  equipmentId: EquipmentTwinId;
  title: string;
  state: EquipmentTwinAssemblyState;
  onOpenPassport: () => void;
};

type Vec3 = [number, number, number];

const isExploded = (state: EquipmentTwinAssemblyState) => state === "exploded";

function PartBox({
  position,
  scale,
  color,
  opacity = 1,
}: {
  position: Vec3;
  scale: Vec3;
  color: string;
  opacity?: number;
}) {
  return (
    <mesh position={position} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} transparent={opacity < 1} opacity={opacity} roughness={0.48} metalness={0.18} />
    </mesh>
  );
}

function Pipe({
  position,
  rotation = [0, 0, Math.PI / 2],
  length,
  radius = 0.035,
  color = "#38bdf8",
}: {
  position: Vec3;
  rotation?: Vec3;
  length: number;
  radius?: number;
  color?: string;
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[radius, radius, length, 20]} />
      <meshStandardMaterial color={color} roughness={0.36} metalness={0.46} />
    </mesh>
  );
}

function FanDisc({
  position,
  rotation = [0, 0, 0],
  radius = 0.3,
  color = "#0f172a",
}: {
  position: Vec3;
  rotation?: Vec3;
  radius?: number;
  color?: string;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <cylinderGeometry args={[radius, radius, 0.045, 48]} />
        <meshStandardMaterial color={color} roughness={0.42} metalness={0.2} />
      </mesh>
      {[0, 1, 2, 3].map((index) => (
        <mesh key={index} rotation={[0, (Math.PI / 4) * index, 0]} position={[0, 0.032, 0]}>
          <boxGeometry args={[radius * 1.55, 0.025, 0.085]} />
          <meshStandardMaterial color="#67e8f9" roughness={0.34} metalness={0.24} />
        </mesh>
      ))}
    </group>
  );
}

function SlatSet({
  count,
  start,
  step,
  scale,
  color = "#bae6fd",
}: {
  count: number;
  start: Vec3;
  step: Vec3;
  scale: Vec3;
  color?: string;
}) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <PartBox
          key={index}
          position={[start[0] + step[0] * index, start[1] + step[1] * index, start[2] + step[2] * index]}
          scale={scale}
          color={color}
        />
      ))}
    </>
  );
}

function SceneLabel({ title, state }: { title: string; state: EquipmentTwinAssemblyState }) {
  return (
    <Html position={[0, 1.55, 0]} center distanceFactor={6}>
      <div className="equipmentTwinModelLabel">
        <strong>{title}</strong>
        <span>Demo procedural 3D</span>
        <small>{isExploded(state) ? "Разобрано" : "Собрано"}</small>
      </div>
    </Html>
  );
}

function ChillerModel({ state }: { state: EquipmentTwinAssemblyState }) {
  const exploded = isExploded(state);
  const panelPosition: Vec3 = exploded ? [0, 0.24, 0.86] : [0, 0.24, 0.54];
  const compressorPosition: Vec3 = exploded ? [1.02, -0.24, 0.56] : [0.58, -0.24, 0.22];
  const coilPosition: Vec3 = exploded ? [-1.08, -0.03, 0.58] : [-0.75, -0.03, 0.24];
  const fanYOffset = exploded ? 0.36 : 0;

  return (
    <group>
      <PartBox position={[0, 0, 0]} scale={[2.85, 0.82, 1.12]} color="#dbeafe" />
      <PartBox position={[0, -0.5, 0]} scale={[3.05, 0.16, 1.28]} color="#334155" />
      <PartBox position={panelPosition} scale={[2.7, 0.52, 0.08]} color="#94a3b8" opacity={0.82} />
      <PartBox position={coilPosition} scale={[0.56, 0.54, 0.16]} color="#38bdf8" opacity={0.84} />
      <PartBox position={compressorPosition} scale={[0.42, 0.42, 0.46]} color="#1e293b" />
      <Pipe position={[1.24, -0.02, -0.52]} length={0.82} radius={0.045} />
      <Pipe position={[-1.24, -0.02, -0.52]} length={0.82} radius={0.045} color="#22c55e" />
      {[-0.82, 0, 0.82].map((x) => (
        <FanDisc key={x} position={[x, 0.48 + fanYOffset, 0]} radius={0.24} color="#0f172a" />
      ))}
      <SlatSet count={8} start={[-1.25, 0.03, 0.61]} step={[0.36, 0, 0]} scale={[0.18, 0.46, 0.018]} />
    </group>
  );
}

function CoolingTowerModel({ state }: { state: EquipmentTwinAssemblyState }) {
  const exploded = isExploded(state);
  const fanPosition: Vec3 = exploded ? [0, 1.18, 0] : [0, 0.72, 0];
  const fillPackPosition: Vec3 = exploded ? [-0.84, 0.02, 0.32] : [-0.3, 0.02, 0.18];
  const sprayPipePosition: Vec3 = exploded ? [0.82, 0.45, 0.24] : [0.1, 0.45, 0.18];
  const topCoverPosition: Vec3 = exploded ? [0, 1.03, 0] : [0, 0.58, 0];

  return (
    <group>
      <PartBox position={[0, -0.12, 0]} scale={[1.36, 1.32, 1.16]} color="#cbd5e1" opacity={0.92} />
      <PartBox position={[0, -0.85, 0]} scale={[1.62, 0.22, 1.32]} color="#334155" />
      <PartBox position={topCoverPosition} scale={[1.52, 0.12, 1.28]} color="#94a3b8" />
      <PartBox position={fillPackPosition} scale={[0.54, 0.92, 0.18]} color="#38bdf8" opacity={0.74} />
      <Pipe position={sprayPipePosition} rotation={[Math.PI / 2, 0, 0]} length={1.12} radius={0.03} color="#7dd3fc" />
      <FanDisc position={fanPosition} radius={0.36} color="#0f172a" />
      <SlatSet count={7} start={[-0.52, -0.28, 0.61]} step={[0.17, 0, 0]} scale={[0.04, 0.84, 0.018]} color="#e0f2fe" />
      <SlatSet count={5} start={[-0.61, 0.28, 0.61]} step={[0, -0.18, 0]} scale={[1.02, 0.03, 0.02]} color="#bae6fd" />
    </group>
  );
}

function FancoilModel({ state }: { state: EquipmentTwinAssemblyState }) {
  const exploded = isExploded(state);
  const frontPanelPosition: Vec3 = exploded ? [0, 0.05, 0.74] : [0, 0.05, 0.42];
  const filterPosition: Vec3 = exploded ? [-0.82, 0.03, 0.56] : [-0.38, 0.03, 0.25];
  const fanPosition: Vec3 = exploded ? [0.62, 0.02, 0.58] : [0.25, 0.02, 0.27];
  const drainPosition: Vec3 = exploded ? [0, -0.42, 0.48] : [0, -0.34, 0.24];

  return (
    <group>
      <PartBox position={[0, 0, 0]} scale={[1.92, 0.54, 0.58]} color="#e2e8f0" />
      <PartBox position={frontPanelPosition} scale={[1.72, 0.38, 0.055]} color="#94a3b8" opacity={0.86} />
      <PartBox position={filterPosition} scale={[0.42, 0.34, 0.055]} color="#67e8f9" opacity={0.72} />
      <FanDisc position={fanPosition} rotation={[Math.PI / 2, 0, 0]} radius={0.18} color="#111827" />
      <PartBox position={[-0.1, 0.02, 0.3]} scale={[0.54, 0.34, 0.08]} color="#38bdf8" opacity={0.74} />
      <PartBox position={drainPosition} scale={[1.36, 0.08, 0.14]} color="#334155" />
      <Pipe position={[1.08, 0.05, -0.05]} length={0.44} radius={0.03} color="#22c55e" />
      <SlatSet count={7} start={[-0.68, 0.16, 0.49]} step={[0.23, 0, 0]} scale={[0.12, 0.026, 0.016]} />
      <SlatSet count={4} start={[-0.72, -0.06, 0.49]} step={[0, -0.08, 0]} scale={[1.44, 0.018, 0.016]} />
    </group>
  );
}

function IndoorUnit({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <PartBox position={[0, 0, 0]} scale={[0.72, 0.2, 0.18]} color="#e2e8f0" />
      <PartBox position={[0, -0.04, 0.11]} scale={[0.58, 0.035, 0.025]} color="#38bdf8" />
    </group>
  );
}

function MultiSplitModel({ state }: { state: EquipmentTwinAssemblyState }) {
  const exploded = isExploded(state);
  const coverPosition: Vec3 = exploded ? [-0.32, 0.2, 0.76] : [-0.32, 0.08, 0.43];
  const fanPosition: Vec3 = exploded ? [-0.68, 0.08, 0.72] : [-0.45, 0.04, 0.49];
  const compressorPosition: Vec3 = exploded ? [0.62, -0.24, 0.62] : [0.36, -0.24, 0.24];
  const coilPosition: Vec3 = exploded ? [0.88, 0.18, 0.56] : [0.55, 0.14, 0.18];

  return (
    <group>
      <PartBox position={[-0.22, 0, 0]} scale={[1.52, 0.94, 0.74]} color="#cbd5e1" />
      <PartBox position={coverPosition} scale={[1.38, 0.62, 0.06]} color="#94a3b8" opacity={0.82} />
      <FanDisc position={fanPosition} rotation={[Math.PI / 2, 0, 0]} radius={0.28} color="#0f172a" />
      <PartBox position={compressorPosition} scale={[0.3, 0.4, 0.34]} color="#1e293b" />
      <PartBox position={coilPosition} scale={[0.22, 0.74, 0.18]} color="#38bdf8" opacity={0.76} />
      <IndoorUnit position={[1.45, 0.62, -0.4]} />
      <IndoorUnit position={[1.65, 0.08, -0.4]} />
      <IndoorUnit position={[1.45, -0.46, -0.4]} />
      <Pipe position={[0.72, 0.42, -0.32]} length={1.46} radius={0.018} color="#7dd3fc" />
      <Pipe position={[0.82, -0.02, -0.32]} length={1.64} radius={0.018} color="#22c55e" />
      <Pipe position={[0.72, -0.42, -0.32]} length={1.46} radius={0.018} color="#facc15" />
    </group>
  );
}

export default function ProceduralEquipmentModel({
  equipmentId,
  title,
  state,
  onOpenPassport,
}: ProceduralEquipmentModelProps) {
  let model: React.ReactNode = null;

  if (equipmentId === "chiller") model = <ChillerModel state={state} />;
  if (equipmentId === "cooling-tower-small") model = <CoolingTowerModel state={state} />;
  if (equipmentId === "fancoil-fc92") model = <FancoilModel state={state} />;
  if (equipmentId === "multi-split-system") model = <MultiSplitModel state={state} />;

  if (!model) return null;

  return (
    <group
      onClick={(event) => {
        event.stopPropagation();
        onOpenPassport();
      }}
      rotation={[0, -0.36, 0]}
      scale={[1.08, 1.08, 1.08]}
    >
      {model}
      <SceneLabel title={title} state={state} />
    </group>
  );
}
