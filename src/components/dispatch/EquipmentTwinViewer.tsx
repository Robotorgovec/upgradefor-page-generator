"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, Center, Html, OrbitControls, useGLTF } from "@react-three/drei";
import type { Object3D } from "three";

import type {
  EquipmentTwinAssemblyState,
  EquipmentTwinConfig,
  EquipmentTwinExplodedTransform,
  EquipmentTwinId,
} from "../../lib/dispatch/equipmentTwinTypes";

type EquipmentTwinViewerProps = {
  equipment: EquipmentTwinConfig;
  state: EquipmentTwinAssemblyState;
  onOpenPassport: () => void;
};

type ModelErrorBoundaryProps = {
  children: React.ReactNode;
  fallback: React.ReactNode;
};

type ModelErrorBoundaryState = {
  hasError: boolean;
};

class ModelErrorBoundary extends React.Component<ModelErrorBoundaryProps, ModelErrorBoundaryState> {
  state: ModelErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(previousProps: ModelErrorBoundaryProps) {
    if (previousProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

type BaseTransform = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};

type FallbackTwinPart = {
  id: string;
  label: string;
};

const fallbackTwinParts: Record<EquipmentTwinId, FallbackTwinPart[]> = {
  "ahu-pv1": [
    { id: "damper", label: "Damper" },
    { id: "filter", label: "Filter" },
    { id: "coil", label: "Coil" },
    { id: "fan", label: "Fan" },
    { id: "panel", label: "Panels" },
  ],
  chiller: [
    { id: "shell", label: "Shell" },
    { id: "compressor", label: "Compressor" },
    { id: "exchanger", label: "HX" },
    { id: "fan", label: "Fan" },
    { id: "pipes", label: "Pipes" },
  ],
  "cooling-tower-small": [
    { id: "shell", label: "Tower" },
    { id: "fan", label: "Fan" },
    { id: "fill", label: "Fill pack" },
    { id: "spray", label: "Spray" },
    { id: "basin", label: "Basin" },
  ],
  "fancoil-fc92": [
    { id: "shell", label: "Casing" },
    { id: "filter", label: "Filter" },
    { id: "coil", label: "Coil" },
    { id: "fan", label: "Fan" },
    { id: "tray", label: "Drain" },
  ],
  "multi-split-system": [
    { id: "outdoor", label: "Outdoor" },
    { id: "indoorA", label: "Indoor 1" },
    { id: "indoorB", label: "Indoor 2" },
    { id: "compressor", label: "Compressor" },
    { id: "routes", label: "Pipes" },
  ],
};

function collectBaseTransforms(root: Object3D) {
  const transforms = new Map<string, BaseTransform>();

  root.traverse((object) => {
    if (!object.name) return;

    transforms.set(object.name, {
      position: [object.position.x, object.position.y, object.position.z],
      rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
      scale: [object.scale.x, object.scale.y, object.scale.z],
    });
  });

  return transforms;
}

function applyAbsoluteTransform(
  object: Object3D,
  base: BaseTransform,
  transform?: EquipmentTwinExplodedTransform,
) {
  const position = transform?.position ?? base.position;
  const rotation = transform?.rotation ?? base.rotation;
  const scale = transform?.scale ?? base.scale;

  object.position.set(position[0], position[1], position[2]);
  object.rotation.set(rotation[0], rotation[1], rotation[2]);
  object.scale.set(scale[0], scale[1], scale[2]);
}

function LoadedTwinModel({
  equipment,
  state,
  onOpenPassport,
}: {
  equipment: EquipmentTwinConfig;
  state: EquipmentTwinAssemblyState;
  onOpenPassport: () => void;
}) {
  const gltf = useGLTF(equipment.modelPath, true);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const baseTransforms = useMemo(() => collectBaseTransforms(gltf.scene), [gltf.scene]);

  useEffect(() => {
    scene.traverse((object) => {
      const base = object.name ? baseTransforms.get(object.name) : undefined;
      if (!base) return;

      applyAbsoluteTransform(
        object,
        base,
        state === "exploded" ? equipment.explodedTransforms[object.name] : undefined,
      );
    });
  }, [baseTransforms, equipment.explodedTransforms, scene, state]);

  useEffect(() => {
    return () => {
      scene.traverse((object) => {
        const mesh = object as Object3D & {
          geometry?: { dispose?: () => void };
          material?: { dispose?: () => void } | Array<{ dispose?: () => void }>;
        };

        mesh.geometry?.dispose?.();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material) => material.dispose?.());
        } else {
          mesh.material?.dispose?.();
        }
      });
    };
  }, [scene]);

  return (
    <group
      onClick={(event) => {
        event.stopPropagation();
        onOpenPassport();
      }}
      rotation={[0, -0.32, 0]}
      scale={[1.04, 1.04, 1.04]}
    >
      <primitive object={scene} />
    </group>
  );
}

function LoaderLabel() {
  return (
    <Html center>
      <span className="equipmentTwinSceneLabel">Загрузка 3D-модели...</span>
    </Html>
  );
}

function SceneFallbackLabel({ onOpenPassport }: { onOpenPassport: () => void }) {
  return (
    <Html center>
      <button className="equipmentTwinSceneFallback" type="button" onClick={onOpenPassport}>
        <strong>Built-in 3D fallback</strong>
        <span>No real equipment control</span>
      </button>
    </Html>
  );
}

function AssetCheckingLabel() {
  return (
    <div className="equipmentTwinFallback" aria-live="polite">
      <strong>Загрузка 3D-модели...</strong>
      <span>Проверяем наличие GLB-актива.</span>
    </div>
  );
}

function FallbackTwinModel({
  equipment,
  state,
  onOpenPassport,
  assetNote,
}: {
  equipment: EquipmentTwinConfig;
  state: EquipmentTwinAssemblyState;
  onOpenPassport: () => void;
  assetNote: string;
}) {
  const parts = fallbackTwinParts[equipment.id];

  return (
    <button
      className={`equipmentTwinFallbackModel fallbackTwin-${equipment.id} ${state === "exploded" ? "isExploded" : ""}`}
      type="button"
      onClick={onOpenPassport}
      aria-label={`Built-in 3D fallback for ${equipment.title}`}
      data-testid={`dispatch-equipment-twin-fallback-${equipment.id}`}
    >
      <div className="fallbackTwinHeader">
        <strong>{equipment.title}</strong>
        <span>Built-in 3D fallback · Simulated model · No real equipment control</span>
        <small>{state === "exploded" ? "Exploded demo view" : "Assembled demo view"}</small>
      </div>
      <div className="fallbackTwinStage" aria-hidden="true">
        <i className="fallbackTwinGrid" />
        {parts.map((part) => (
          <span key={part.id} className={`fallbackTwinPart part-${part.id}`}>
            <b>{part.label}</b>
          </span>
        ))}
      </div>
      <div className="fallbackTwinFooter">
        <span>{assetNote}</span>
        <span>Click model area to open passport</span>
      </div>
    </button>
  );
}

export default function EquipmentTwinViewer({
  equipment,
  state,
  onOpenPassport,
}: EquipmentTwinViewerProps) {
  const [assetStatus, setAssetStatus] = useState<"checking" | "available" | "missing">("checking");
  const useGuaranteedPreview = false;
  const assetNote =
    assetStatus === "available" ? "GLB asset available · guaranteed demo preview" : "GLB asset can be connected later";

  useEffect(() => {
    let isMounted = true;
    setAssetStatus("checking");

    fetch(equipment.modelPath, { method: "HEAD" })
      .then((response) => {
        if (isMounted) {
          setAssetStatus(response.ok ? "available" : "missing");
        }
      })
      .catch(() => {
        if (isMounted) {
          setAssetStatus("missing");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [equipment.modelPath]);

  return (
    <div className="equipmentTwinViewer" aria-label={`3D digital twin ${equipment.title}`}>
      <div className="equipmentTwinViewport">
        {assetStatus === "checking" ? <AssetCheckingLabel /> : null}
        {assetStatus === "missing" || (assetStatus === "available" && useGuaranteedPreview) ? (
          <FallbackTwinModel
            equipment={equipment}
            state={state}
            onOpenPassport={onOpenPassport}
            assetNote={assetNote}
          />
        ) : null}
        {assetStatus === "available" && !useGuaranteedPreview ? (
          <Canvas camera={{ position: [5, 3.2, 5], fov: 42 }} dpr={[1, 1.7]} gl={{ antialias: true, alpha: true }}>
            <color attach="background" args={["#06111f"]} />
            <ambientLight intensity={0.68} />
            <directionalLight position={[5, 6, 4]} intensity={1.45} />
            <pointLight position={[-3, 2.4, 2]} intensity={1.05} color="#67e8f9" />
            <gridHelper args={[7, 14, "#155e75", "#0f2738"]} position={[0, -0.82, 0]} />
            <Suspense fallback={<LoaderLabel />}>
              <Bounds fit clip observe margin={1.25}>
                <Center>
                  <ModelErrorBoundary fallback={<SceneFallbackLabel onOpenPassport={onOpenPassport} />}>
                    <LoadedTwinModel equipment={equipment} state={state} onOpenPassport={onOpenPassport} />
                  </ModelErrorBoundary>
                </Center>
              </Bounds>
              <Html position={[0, 1.55, 0]} center distanceFactor={6}>
                <div className="equipmentTwinModelLabel">
                  <strong>{equipment.title}</strong>
                  <span>{equipment.status}</span>
                  <small>{state === "exploded" ? "Разобрано" : "Собрано"}</small>
                </div>
              </Html>
            </Suspense>
            <OrbitControls enableDamping enablePan={false} minDistance={2.8} maxDistance={9} />
          </Canvas>
        ) : null}
      </div>
      <div className="equipmentTwinHints">
        <span>Drag to rotate</span>
        <span>Scroll to zoom</span>
        <span>Click model to open passport</span>
      </div>
      <style jsx global>{`
        .equipmentTwinSceneLabel,
        .equipmentTwinModelLabel {
          border: 1px solid rgba(125, 211, 252, 0.38);
          border-radius: 8px;
          background: rgba(2, 8, 23, 0.84);
          color: #e0f2fe;
          font-family: Inter, system-ui, sans-serif;
          padding: 8px 10px;
          text-align: center;
          box-shadow: 0 0 24px rgba(34, 211, 238, 0.2);
        }

        .equipmentTwinModelLabel {
          min-width: 220px;
        }

        .equipmentTwinModelLabel strong,
        .equipmentTwinModelLabel span,
        .equipmentTwinModelLabel small {
          display: block;
        }

        .equipmentTwinModelLabel span {
          margin-top: 4px;
          color: #bbf7d0;
          font-size: 11px;
          font-weight: 800;
        }

        .equipmentTwinModelLabel small {
          color: #93c5fd;
          font-size: 10px;
        }

        .equipmentTwinFallback {
          position: absolute;
          inset: 0;
          display: grid;
          place-content: center;
          gap: 8px;
          width: 100%;
          border: 0;
          background: transparent;
          color: #dbeafe;
          cursor: pointer;
          padding: 24px;
          text-align: center;
        }

        div.equipmentTwinFallback {
          cursor: default;
        }

        .equipmentTwinFallback strong {
          display: block;
          color: #f8fafc;
          font-size: 18px;
        }

        .equipmentTwinFallback span {
          display: block;
          max-width: 420px;
          color: #93c5fd;
          font-size: 12px;
          line-height: 1.45;
        }

        .equipmentTwinFallback .equipmentTwinAssetBadge {
          justify-self: center;
          width: fit-content;
          border: 1px solid rgba(125, 211, 252, 0.28);
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.68);
          color: #bfdbfe;
          padding: 5px 10px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .equipmentTwinSceneFallback {
          display: grid;
          min-width: 220px;
          gap: 6px;
          border: 1px solid rgba(125, 211, 252, 0.38);
          border-radius: 8px;
          background: rgba(2, 8, 23, 0.88);
          color: #e0f2fe;
          cursor: pointer;
          font-family: Inter, system-ui, sans-serif;
          padding: 12px 14px;
          text-align: center;
          box-shadow: 0 0 24px rgba(34, 211, 238, 0.2);
        }

        .equipmentTwinSceneFallback strong,
        .equipmentTwinSceneFallback span {
          display: block;
        }

        .equipmentTwinSceneFallback span {
          color: #bfdbfe;
          font-size: 11px;
          font-weight: 800;
        }
      `}</style>
      <style jsx global>{`
        .equipmentTwinViewer {
          display: grid;
          gap: 10px;
        }

        .equipmentTwinViewport {
          position: relative;
          height: min(42vh, 390px);
          min-height: 300px;
          overflow: hidden;
          border: 1px solid rgba(34, 211, 238, 0.24);
          border-radius: 8px;
          background:
            linear-gradient(rgba(125, 211, 252, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(125, 211, 252, 0.05) 1px, transparent 1px),
            radial-gradient(circle at 50% 38%, rgba(34, 211, 238, 0.14), transparent 31%),
            #06111f;
          background-size: 28px 28px, 28px 28px, auto, auto;
        }

        .equipmentTwinFallbackModel {
          position: absolute;
          inset: 0;
          display: grid;
          grid-template-rows: auto 1fr auto;
          gap: 10px;
          width: 100%;
          border: 0;
          background: transparent;
          color: #e2e8f0;
          cursor: pointer;
          overflow: hidden;
          padding: 14px;
          text-align: left;
        }

        .fallbackTwinHeader,
        .fallbackTwinFooter {
          position: relative;
          z-index: 4;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 7px;
        }

        .fallbackTwinHeader {
          justify-content: space-between;
        }

        .fallbackTwinHeader strong {
          color: #f8fafc;
          font-size: 15px;
        }

        .fallbackTwinHeader span,
        .fallbackTwinHeader small,
        .fallbackTwinFooter span {
          border: 1px solid rgba(125, 211, 252, 0.24);
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.72);
          color: #bfdbfe;
          font-size: 10px;
          font-weight: 900;
          padding: 5px 8px;
        }

        .fallbackTwinHeader small {
          color: #fde68a;
        }

        .fallbackTwinFooter {
          justify-content: flex-end;
        }

        .fallbackTwinStage {
          position: relative;
          min-height: 220px;
          transform-style: preserve-3d;
          perspective: 920px;
        }

        .fallbackTwinGrid {
          position: absolute;
          left: 8%;
          right: 8%;
          top: 52%;
          height: 106px;
          transform: rotateX(64deg) rotateZ(-10deg);
          border: 1px solid rgba(148, 163, 184, 0.24);
          border-radius: 8px;
          background:
            linear-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.12) 1px, transparent 1px),
            rgba(15, 23, 42, 0.4);
          background-size: 24px 24px;
          box-shadow: 0 42px 70px rgba(0, 0, 0, 0.28);
        }

        .fallbackTwinPart {
          position: absolute;
          display: grid;
          place-items: center;
          border: 1px solid rgba(226, 232, 240, 0.32);
          border-radius: 8px;
          background:
            linear-gradient(145deg, rgba(226, 232, 240, 0.92), rgba(96, 165, 250, 0.22)),
            #dbeafe;
          color: #0f172a;
          font-size: 10px;
          font-weight: 900;
          box-shadow:
            0 18px 34px rgba(0, 0, 0, 0.32),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          transform: skewY(-4deg);
          transition: transform 0.22s ease, left 0.22s ease, top 0.22s ease;
        }

        .fallbackTwinPart::after {
          content: "";
          position: absolute;
          inset: auto 7px -10px 7px;
          height: 10px;
          transform: skewX(-26deg);
          border-radius: 0 0 8px 8px;
          background: rgba(15, 23, 42, 0.28);
          filter: blur(1px);
        }

        .fallbackTwinPart b {
          position: relative;
          z-index: 2;
        }

        .fallbackTwin-ahu-pv1 .part-damper,
        .fallbackTwin-chiller .part-shell,
        .fallbackTwin-fancoil-fc92 .part-shell,
        .fallbackTwin-multi-split-system .part-outdoor,
        .fallbackTwin-cooling-tower-small .part-shell {
          left: 25%;
          top: 31%;
          width: 50%;
          height: 38%;
        }

        .fallbackTwin-ahu-pv1 .part-filter,
        .fallbackTwin-fancoil-fc92 .part-filter,
        .fallbackTwin-cooling-tower-small .part-fill {
          left: 29%;
          top: 39%;
          width: 15%;
          height: 26%;
          background: linear-gradient(145deg, #bae6fd, #fef3c7);
        }

        .fallbackTwin-ahu-pv1 .part-coil,
        .fallbackTwin-fancoil-fc92 .part-coil,
        .fallbackTwin-multi-split-system .part-compressor,
        .fallbackTwin-chiller .part-exchanger {
          left: 47%;
          top: 38%;
          width: 17%;
          height: 25%;
          background: linear-gradient(145deg, #99f6e4, #bfdbfe);
        }

        .fallbackTwin-ahu-pv1 .part-fan,
        .fallbackTwin-fancoil-fc92 .part-fan,
        .fallbackTwin-chiller .part-fan,
        .fallbackTwin-cooling-tower-small .part-fan {
          left: 66%;
          top: 35%;
          width: 18%;
          height: 27%;
          border-radius: 999px;
          background: radial-gradient(circle, #e0f2fe 0 25%, #38bdf8 27% 43%, #0f172a 45% 48%, #dbeafe 50%);
        }

        .fallbackTwin-ahu-pv1 .part-panel,
        .fallbackTwin-chiller .part-pipes,
        .fallbackTwin-fancoil-fc92 .part-tray,
        .fallbackTwin-cooling-tower-small .part-spray,
        .fallbackTwin-multi-split-system .part-routes {
          left: 33%;
          top: 68%;
          width: 43%;
          height: 13%;
          background: linear-gradient(145deg, #cbd5e1, #93c5fd);
        }

        .fallbackTwin-chiller .part-compressor {
          left: 61%;
          top: 42%;
          width: 19%;
          height: 22%;
          border-radius: 999px;
          background: linear-gradient(145deg, #fde68a, #f97316);
        }

        .fallbackTwin-cooling-tower-small .part-shell {
          left: 35%;
          top: 26%;
          width: 31%;
          height: 46%;
          border-radius: 10px 10px 16px 16px;
        }

        .fallbackTwin-cooling-tower-small .part-basin {
          left: 30%;
          top: 69%;
          width: 42%;
          height: 12%;
          background: linear-gradient(145deg, #67e8f9, #1e3a8a);
        }

        .fallbackTwin-multi-split-system .part-indoorA,
        .fallbackTwin-multi-split-system .part-indoorB {
          left: 22%;
          top: 22%;
          width: 25%;
          height: 14%;
          background: linear-gradient(145deg, #ffffff, #bfdbfe);
        }

        .fallbackTwin-multi-split-system .part-indoorB {
          left: 55%;
          top: 25%;
        }

        .equipmentTwinFallbackModel.isExploded .fallbackTwinPart:nth-of-type(2) {
          transform: translate(-42px, -12px) skewY(-4deg);
        }

        .equipmentTwinFallbackModel.isExploded .fallbackTwinPart:nth-of-type(3) {
          transform: translate(-18px, 28px) skewY(-4deg);
        }

        .equipmentTwinFallbackModel.isExploded .fallbackTwinPart:nth-of-type(4) {
          transform: translate(22px, -28px) skewY(-4deg);
        }

        .equipmentTwinFallbackModel.isExploded .fallbackTwinPart:nth-of-type(5) {
          transform: translate(48px, 18px) skewY(-4deg);
        }

        .equipmentTwinFallbackModel.isExploded .fallbackTwinPart:nth-of-type(6) {
          transform: translate(18px, 42px) skewY(-4deg);
        }

        .equipmentTwinHints {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .equipmentTwinHints span {
          border: 1px solid rgba(125, 211, 252, 0.2);
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.62);
          color: #dbeafe;
          font-size: 11px;
          font-weight: 800;
          padding: 6px 8px;
        }
      `}</style>
    </div>
  );
}
