"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Bounds, Center, Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

const equipmentItems = [
  {
    id: "supply-vent-unit-01",
    label: "Приточная вентустановка ПВ-1",
    type: "Вентиляция",
    modelPath: "/models/equipment/supply-vent-unit-01-assembled.glb",
    explodedModelPath: "/models/equipment/supply-vent-unit-01-exploded.glb",
    status: "В работе",
    mode: "Auto",
    location: "Asia Park Astana / Венткамера / +11.400",
    model: "Приточная вентиляционная установка / TO VERIFY",
    serialNumber: "TO VERIFY",
    inventoryNumber: "INV-VENT-0001",
    manufacturer: "TO VERIFY",
    year: "TO VERIFY",
    lastEvent: "Без активных аварий",
    linkedSystems: ["Вентиляция", "Фанкойлы", "BMS/SCADA"],
    trends: [
      "Температура приточного воздуха",
      "Температура обратки",
      "Давление",
      "Расход воздуха",
      "Состояние фильтра",
    ],
    documents: ["Паспорт", "Параметры", "ТО", "Документы"],
    service: {
      status: "Плановый обход",
      note: "Замечаний нет, режим read-only",
    },
  },
];

type EquipmentItem = (typeof equipmentItems)[number];

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ModelErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(previousProps: ErrorBoundaryProps) {
    if (previousProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function LoadedAhuModel({
  item,
  exploded,
  onSelect,
}: {
  item: EquipmentItem;
  exploded: boolean;
  onSelect: () => void;
}) {
  const modelPath = exploded ? item.explodedModelPath : item.modelPath;
  const gltf = useGLTF(modelPath, true);
  const model = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  return (
    <group
      key={modelPath}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      rotation={[0, -0.42, 0]}
    >
      <primitive object={model} />
    </group>
  );
}

function LoadingBadge({ exploded }: { exploded: boolean }) {
  return (
    <Html center>
      <div className="modelLabel">
        <strong>Загружаем модель ПВ-1</strong>
        <span>{exploded ? "Разобранная версия" : "Собранная версия"}</span>
      </div>
    </Html>
  );
}

function LabelBadge({ item, exploded }: { item: EquipmentItem; exploded: boolean }) {
  return (
    <Html position={[0, 1.3, 0]} center distanceFactor={6}>
      <div className="modelLabel">
        <strong>{item.label}</strong>
        <span>{item.status}</span>
        <small>{exploded ? "Разобранная модель" : "Собранная модель"}</small>
      </div>
    </Html>
  );
}

function ModelFallback({ item, exploded, onSelect }: { item: EquipmentItem; exploded: boolean; onSelect: () => void }) {
  return (
    <group
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      rotation={[0, -0.38, 0]}
    >
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[4.9, 1.25, 1.45]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.22} roughness={0.5} />
      </mesh>
      <mesh position={[-1.3, 0.04, 0.78]}>
        <boxGeometry args={[0.22, 0.92, 0.08]} />
        <meshStandardMaterial color="#334155" metalness={0.1} roughness={0.38} />
      </mesh>
      <mesh position={[-0.15, 0.06, 0.82]}>
        <boxGeometry args={[0.48, 0.92, 0.09]} />
        <meshStandardMaterial color="#b45309" metalness={0.42} roughness={0.32} />
      </mesh>
      <mesh position={[1.05, 0.03, 0.82]}>
        <cylinderGeometry args={[0.38, 0.38, 0.11, 36]} />
        <meshStandardMaterial color="#111827" metalness={0.35} roughness={0.38} />
      </mesh>
      {exploded ? (
        <mesh position={[0, 0.94, 0.18]}>
          <boxGeometry args={[4.7, 0.09, 1.35]} />
          <meshStandardMaterial color="#cbd5e1" transparent opacity={0.42} metalness={0.2} roughness={0.28} />
        </mesh>
      ) : null}
      <LabelBadge item={item} exploded={exploded} />
    </group>
  );
}

function AhuScene({
  item,
  exploded,
  onSelect,
}: {
  item: EquipmentItem;
  exploded: boolean;
  onSelect: () => void;
}) {
  return (
    <Canvas camera={{ position: [6.4, 3.2, 6.2], fov: 38 }} dpr={[1, 1.7]} gl={{ antialias: true, alpha: true }} shadows>
      <color attach="background" args={["#06111f"]} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[5, 6, 4]} intensity={1.65} castShadow />
      <pointLight position={[-3, 2.4, 2.8]} intensity={1.05} color="#67e8f9" />
      <pointLight position={[3, 1.3, -2.3]} intensity={0.65} color="#38bdf8" />
      <gridHelper args={[8, 16, "#155e75", "#0f2738"]} position={[0, -1, 0]} />
      <Suspense fallback={<LoadingBadge exploded={exploded} />}>
        <ModelErrorBoundary fallback={<ModelFallback item={item} exploded={exploded} onSelect={onSelect} />}>
          <Bounds fit clip observe margin={1.18}>
            <Center>
              <LoadedAhuModel item={item} exploded={exploded} onSelect={onSelect} />
            </Center>
          </Bounds>
          <LabelBadge item={item} exploded={exploded} />
        </ModelErrorBoundary>
      </Suspense>
      <OrbitControls enableDamping makeDefault minDistance={2.8} maxDistance={9.5} />
    </Canvas>
  );
}

function WebGlPreview({ item, exploded }: { item: EquipmentItem; exploded: boolean }) {
  return (
    <div className="webglFallback">
      <div className={`fallbackAhu ${exploded ? "isExploded" : ""}`}>
        <span />
        <i />
        <b />
      </div>
      <strong>{item.label}</strong>
      <small>WebGL недоступен: показан read-only fallback preview.</small>
    </div>
  );
}

export default function Equipment3DViewer() {
  const [selectedEquipment, setSelectedEquipment] = useState(equipmentItems[0].id);
  const [isExploded, setIsExploded] = useState(false);
  const [hasWebGl, setHasWebGl] = useState<boolean | null>(null);
  const activeItem = equipmentItems.find((item) => item.id === selectedEquipment) ?? equipmentItems[0];

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const supported = Boolean(window.WebGLRenderingContext && (canvas.getContext("webgl2") || canvas.getContext("webgl")));
    setHasWebGl(supported);
  }, []);

  useEffect(() => {
    useGLTF.preload(activeItem.modelPath);
    useGLTF.preload(activeItem.explodedModelPath);
  }, [activeItem.explodedModelPath, activeItem.modelPath]);

  const selectModel = () => setSelectedEquipment(activeItem.id);
  const controlButtons = ["Пуск", "Стоп", "Auto/Manual", "Изменить уставку", "Сброс аварии"];
  const passportButtons = ["Паспорт", "Параметры", "ТО", "Документы", "Открыть тренды", "Создать заявку"];

  return (
    <section className="equipment3DSection" aria-label="3D паспорт приточной вентустановки">
      <div className="viewerPanel">
        <div className="viewerHeader">
          <div>
            <p>3D digital twin</p>
            <h2>3D digital twin — {activeItem.label}</h2>
            <small>Presentation MVP поверх существующей BMS/SCADA. Demo/read-only, без реальных команд управления.</small>
          </div>
          <button type="button" onClick={() => setIsExploded((value) => !value)}>
            {isExploded ? "Собрать установку" : "Разобрать установку"}
          </button>
        </div>
        <div className="viewerViewport" onClick={selectModel}>
          {hasWebGl === false ? (
            <WebGlPreview item={activeItem} exploded={isExploded} />
          ) : (
            <AhuScene item={activeItem} exploded={isExploded} onSelect={selectModel} />
          )}
        </div>
        <div className="viewerHints">
          <span>Drag to rotate</span>
          <span>Scroll to zoom</span>
          <span>Click model to open passport</span>
          <span>{isExploded ? "Разобранная GLB модель" : "Собранная GLB модель"}</span>
        </div>
      </div>

      <aside className="passportPanel">
        <div className="passportTop">
          <p>Equipment passport</p>
          <h3>{activeItem.label}</h3>
          <div className="statusRow">
            <span>{activeItem.status}</span>
            <span>{activeItem.mode}</span>
            <span>{activeItem.type}</span>
          </div>
        </div>

        <dl className="passportGrid">
          <div><dt>Локация</dt><dd>{activeItem.location}</dd></div>
          <div><dt>Модель</dt><dd>{activeItem.model}</dd></div>
          <div><dt>Производитель</dt><dd>{activeItem.manufacturer}</dd></div>
          <div><dt>Серийный номер</dt><dd>{activeItem.serialNumber}</dd></div>
          <div><dt>Инвентарный номер</dt><dd>{activeItem.inventoryNumber}</dd></div>
          <div><dt>Год выпуска</dt><dd>{activeItem.year}</dd></div>
          <div><dt>Последнее событие</dt><dd>{activeItem.lastEvent}</dd></div>
          <div><dt>Сервис</dt><dd>{activeItem.service.status}: {activeItem.service.note}</dd></div>
        </dl>

        <div className="chipBlock">
          <strong>Связанные системы</strong>
          <div>{activeItem.linkedSystems.map((item) => <span key={item}>{item}</span>)}</div>
        </div>
        <div className="chipBlock">
          <strong>Тренды</strong>
          <div>{activeItem.trends.map((item) => <span key={item}>{item}</span>)}</div>
        </div>
        <div className="chipBlock">
          <strong>Документы и действия</strong>
          <div>{passportButtons.map((item) => <button type="button" key={item}>{item}</button>)}</div>
        </div>
        <button className="explodeButton" type="button" onClick={() => setIsExploded((value) => !value)}>
          {isExploded ? "Собрать установку" : "Разобрать установку"}
        </button>
        <div className="controlsLocked">
          <strong>Read-only / control locked</strong>
          <div>{controlButtons.map((item) => <button type="button" disabled key={item}>{item}</button>)}</div>
        </div>
      </aside>

      <style jsx global>{`
        .modelLabel{min-width:220px;border:1px solid rgba(125,211,252,.42);border-radius:8px;background:rgba(2,8,23,.82);box-shadow:0 0 24px rgba(34,211,238,.22);padding:8px 10px;text-align:center;color:#e0f2fe;font-family:Inter,system-ui,sans-serif}.modelLabel strong,.modelLabel span,.modelLabel small{display:block}.modelLabel span{margin-top:4px;color:#bbf7d0;font-size:11px;font-weight:800}.modelLabel small{color:#93c5fd;font-size:10px}
      `}</style>
      <style jsx>{`
        .equipment3DSection{display:grid;grid-template-columns:minmax(0,1.28fr) minmax(320px,.72fr);gap:14px;padding:18px;background:radial-gradient(circle at 48% 8%,rgba(14,165,233,.18),transparent 34%),linear-gradient(135deg,#020617,#06111f 48%,#020617);color:#dbeafe;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.viewerPanel,.passportPanel{border:1px solid rgba(56,189,248,.28);border-radius:8px;background:linear-gradient(145deg,rgba(8,20,38,.92),rgba(2,8,23,.78));box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 18px 52px rgba(0,0,0,.34)}.viewerPanel{padding:14px}.viewerHeader{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:12px}.viewerHeader p,.passportTop p{margin:0 0 6px;color:#67e8f9;font-size:11px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}.viewerHeader h2,.passportTop h3{margin:0;color:#f8fafc;letter-spacing:0}.viewerHeader h2{font-size:clamp(18px,1.7vw,25px)}.viewerHeader small{display:block;margin-top:6px;color:#bfdbfe}.viewerHeader button,.explodeButton{border:1px solid rgba(34,211,238,.42);border-radius:8px;background:rgba(14,165,233,.14);color:#e0f2fe;font-weight:800;padding:10px 12px;cursor:pointer}.viewerHeader button:hover,.explodeButton:hover{border-color:rgba(34,211,238,.8)}.viewerViewport{height:430px;overflow:hidden;border:1px solid rgba(34,211,238,.24);border-radius:8px;background:linear-gradient(rgba(125,211,252,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(125,211,252,.05) 1px,transparent 1px),radial-gradient(circle at 50% 38%,rgba(34,211,238,.14),transparent 31%),#06111f;background-size:28px 28px,28px 28px,auto,auto;cursor:pointer}.viewerHints{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}.viewerHints span,.statusRow span,.chipBlock span,.chipBlock button{border:1px solid rgba(125,211,252,.2);border-radius:999px;background:rgba(15,23,42,.62);color:#dbeafe;font-size:11px;font-weight:800;padding:6px 8px}.passportPanel{padding:14px}.statusRow{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.statusRow span:first-child{border-color:rgba(34,197,94,.42);color:#bbf7d0}.passportGrid{display:grid;gap:7px;margin:14px 0}.passportGrid div{display:grid;grid-template-columns:128px 1fr;gap:10px;border-bottom:1px solid rgba(125,211,252,.12);padding-bottom:7px}.passportGrid dt{color:#93c5fd;font-size:12px}.passportGrid dd{margin:0;color:#f8fafc;font-size:13px;line-height:1.35}.chipBlock{display:grid;gap:8px;margin-top:12px}.chipBlock strong,.controlsLocked strong{color:#e0f2fe;font-size:13px}.chipBlock div,.controlsLocked div{display:flex;flex-wrap:wrap;gap:7px}.chipBlock button{border-radius:8px;cursor:pointer}.explodeButton{width:100%;margin-top:14px}.controlsLocked{display:grid;gap:9px;margin-top:14px;border:1px solid rgba(248,113,113,.22);border-radius:8px;background:rgba(127,29,29,.12);padding:10px}.controlsLocked button{border:1px solid rgba(148,163,184,.2);border-radius:8px;background:rgba(15,23,42,.5);color:#94a3b8;padding:8px 9px}.webglFallback{height:100%;display:grid;place-items:center;text-align:center;color:#dbeafe}.webglFallback strong{display:block;margin-top:12px}.webglFallback small{color:#bfdbfe}.fallbackAhu{position:relative;width:min(420px,82%);height:140px;border:1px solid rgba(125,211,252,.34);border-radius:8px;background:linear-gradient(90deg,#9ca3af,#d1d5db);box-shadow:0 0 40px rgba(34,211,238,.18)}.fallbackAhu span,.fallbackAhu i,.fallbackAhu b{position:absolute;display:block}.fallbackAhu span{left:0;top:16px;bottom:16px;width:58px;background:repeating-linear-gradient(0deg,rgba(14,116,144,.4) 0 8px,rgba(226,232,240,.9) 8px 16px)}.fallbackAhu i{left:138px;top:20px;bottom:20px;width:32px;background:#334155}.fallbackAhu b{right:42px;top:48px;width:46px;height:46px;border-radius:50%;background:#111827}.fallbackAhu.isExploded::after{content:"";position:absolute;left:34%;right:10%;top:-26px;height:18px;border:1px solid rgba(125,211,252,.28);background:rgba(226,232,240,.45)}@media(max-width:980px){.equipment3DSection{grid-template-columns:1fr;padding:14px}.viewerHeader{display:grid}.viewerViewport{height:360px}.passportGrid div{grid-template-columns:1fr}}
      `}</style>
    </section>
  );
}
