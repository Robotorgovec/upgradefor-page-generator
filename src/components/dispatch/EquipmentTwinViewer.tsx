"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import type { Object3D } from "three";

import type {
  EquipmentTwinAssemblyState,
  EquipmentTwinConfig,
  EquipmentTwinExplodedTransform,
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
  const gltf = useGLTF(equipment.modelPath);
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

function AssetErrorLabel({ onOpenPassport }: { onOpenPassport: () => void }) {
  return (
    <button className="equipmentTwinFallback" type="button" onClick={onOpenPassport}>
      <strong>3D-модель пока не загружена</strong>
      <span className="equipmentTwinAssetBadge">GLB asset не найден</span>
      <span>Паспорт оборудования доступен в demo/read-only режиме.</span>
    </button>
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

export default function EquipmentTwinViewer({
  equipment,
  state,
  onOpenPassport,
}: EquipmentTwinViewerProps) {
  const [assetStatus, setAssetStatus] = useState<"checking" | "available" | "missing">("checking");

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
        {assetStatus === "missing" ? <AssetErrorLabel onOpenPassport={onOpenPassport} /> : null}
        {assetStatus === "available" ? (
          <Canvas camera={{ position: [5, 3.2, 5], fov: 42 }} dpr={[1, 1.7]} gl={{ antialias: true, alpha: true }}>
            <color attach="background" args={["#06111f"]} />
            <ambientLight intensity={0.68} />
            <directionalLight position={[5, 6, 4]} intensity={1.45} />
            <pointLight position={[-3, 2.4, 2]} intensity={1.05} color="#67e8f9" />
            <gridHelper args={[7, 14, "#155e75", "#0f2738"]} position={[0, -0.82, 0]} />
            <Suspense fallback={<LoaderLabel />}>
              <ModelErrorBoundary fallback={<LoaderLabel />}>
                <LoadedTwinModel equipment={equipment} state={state} onOpenPassport={onOpenPassport} />
              </ModelErrorBoundary>
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
      `}</style>
      <style jsx>{`
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
