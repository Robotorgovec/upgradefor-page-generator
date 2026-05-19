"use client";

import { useState } from "react";

const equipmentItems = [
  {
    id: "supply-vent-unit-01",
    label: "Приточная вентустановка ПВ-1",
    type: "Вентиляция",
    modelPath: "/models/equipment/supply-vent-unit-01.glb",
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

type AhuModule = {
  id: string;
  label: string;
  shortLabel: string;
  className: string;
  detail: string;
};

const ahuModules: AhuModule[] = [
  { id: "intake", label: "AIR INTAKE", shortLabel: "INTAKE", className: "intakeModule", detail: "Damper blades" },
  { id: "filter", label: "FILTER", shortLabel: "FILTER", className: "filterModule", detail: "Filter grid" },
  { id: "coil", label: "HEAT EXCHANGER / COIL", shortLabel: "COIL", className: "coilModule", detail: "Copper ribs" },
  { id: "fan", label: "FAN", shortLabel: "FAN", className: "fanModule", detail: "Rotor section" },
  { id: "supply", label: "SUPPLY DUCT", shortLabel: "DUCT", className: "supplyModule", detail: "Outlet duct" },
];

function ModuleDetail({ module }: { module: AhuModule }) {
  if (module.id === "intake") {
    return (
      <span className="damperAssembly" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
    );
  }

  if (module.id === "filter") {
    return <span className="filterGrid" aria-hidden="true" />;
  }

  if (module.id === "coil") {
    return (
      <span className="coilPack" aria-hidden="true">
        {Array.from({ length: 11 }).map((_, index) => <i key={index} />)}
        <b />
        <b />
      </span>
    );
  }

  if (module.id === "fan") {
    return (
      <span className="fanRotor" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
    );
  }

  return (
    <span className="ductVanes" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

function DetailedAhuVisual({
  item,
  exploded,
  selected,
  onSelect,
}: {
  item: EquipmentItem;
  exploded: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`detailedAhuVisual ${exploded ? "isExploded" : ""} ${selected ? "isSelected" : ""}`}
      onClick={onSelect}
      aria-label={`Открыть паспорт: ${item.label}`}
    >
      <span className="ahuSceneGlow" aria-hidden="true" />
      <span className="airflowTrack airflowTrackIn" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="airflowTrack airflowTrackOut" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>

      <span className="ahuRig">
        <span className="ductConnection inletDuct">
          <span className="ductFace">
            <i />
            <i />
            <i />
            <i />
          </span>
          <strong>INLET</strong>
        </span>

        <span className="moduleRail topRail" aria-hidden="true" />
        <span className="moduleRail bottomRail" aria-hidden="true" />

        {ahuModules.map((module) => (
          <span key={module.id} className={`ahuModule ${module.className}`}>
            <span className="moduleSkin" />
            <span className="modulePanel">
              <span className="moduleCode">{module.shortLabel}</span>
              <ModuleDetail module={module} />
            </span>
            <span className="moduleLabel">
              <strong>{module.label}</strong>
              <small>{module.detail}</small>
            </span>
          </span>
        ))}

        <span className="ductConnection outletDuct">
          <span className="ductFace">
            <i />
            <i />
            <i />
          </span>
          <strong>OUTLET</strong>
        </span>

        <span className="transparentCover" aria-hidden="true" />
      </span>

      <span className="unitCaption">
        <strong>{item.label}</strong>
        <span>{item.status} · {exploded ? "Cutaway / exploded" : "Sectional AHU"}</span>
      </span>
    </button>
  );
}

export default function Equipment3DViewer() {
  const [selectedEquipment, setSelectedEquipment] = useState(equipmentItems[0].id);
  const [isExploded, setIsExploded] = useState(false);
  const activeItem = equipmentItems.find((item) => item.id === selectedEquipment) ?? equipmentItems[0];

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
        <div className="viewerViewport">
          <DetailedAhuVisual
            item={activeItem}
            exploded={isExploded}
            selected={selectedEquipment === activeItem.id}
            onSelect={selectModel}
          />
        </div>
        <div className="viewerHints">
          <span>Click AHU to open passport</span>
          <span>{isExploded ? "Cutaway details visible" : "Sectional no-assets AHU"}</span>
          <span>Filter / coil / fan / dampers</span>
          <span>Read-only / control locked</span>
        </div>
      </div>

      <aside className={`passportPanel ${selectedEquipment === activeItem.id ? "isSelected" : ""}`}>
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
        .equipment3DSection{display:grid;grid-template-columns:minmax(0,1.28fr) minmax(320px,.72fr);gap:14px;padding:18px;background:radial-gradient(circle at 48% 8%,rgba(14,165,233,.18),transparent 34%),linear-gradient(135deg,#020617,#06111f 48%,#020617);color:#dbeafe;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.viewerPanel,.passportPanel{border:1px solid rgba(56,189,248,.28);border-radius:8px;background:linear-gradient(145deg,rgba(8,20,38,.92),rgba(2,8,23,.78));box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 18px 52px rgba(0,0,0,.34)}.viewerPanel{padding:14px}.viewerHeader{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:12px}.viewerHeader p,.passportTop p{margin:0 0 6px;color:#67e8f9;font-size:11px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}.viewerHeader h2,.passportTop h3{margin:0;color:#f8fafc;letter-spacing:0}.viewerHeader h2{font-size:clamp(18px,1.7vw,25px)}.viewerHeader small{display:block;margin-top:6px;color:#bfdbfe}.viewerHeader button,.explodeButton{border:1px solid rgba(34,211,238,.42);border-radius:8px;background:rgba(14,165,233,.14);color:#e0f2fe;font-weight:800;padding:10px 12px;cursor:pointer}.viewerHeader button:hover,.explodeButton:hover{border-color:rgba(34,211,238,.8)}.viewerViewport{position:relative;height:430px;overflow:hidden;border:1px solid rgba(34,211,238,.24);border-radius:8px;background:linear-gradient(rgba(125,211,252,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(125,211,252,.05) 1px,transparent 1px),radial-gradient(circle at 50% 38%,rgba(34,211,238,.14),transparent 31%),#06111f;background-size:28px 28px,28px 28px,auto,auto}.viewerViewport::before{content:"";position:absolute;left:5%;right:5%;bottom:20%;height:38%;transform:perspective(780px) rotateX(62deg);border:1px solid rgba(14,165,233,.16);background:linear-gradient(90deg,rgba(14,165,233,.12),rgba(15,23,42,.08));box-shadow:0 0 42px rgba(34,211,238,.12)}.viewerHints{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}.viewerHints span,.statusRow span,.chipBlock span,.chipBlock button{border:1px solid rgba(125,211,252,.2);border-radius:999px;background:rgba(15,23,42,.62);color:#dbeafe;font-size:11px;font-weight:800;padding:6px 8px}.detailedAhuVisual{position:absolute;inset:0;display:block;width:100%;height:100%;border:0;background:transparent;color:inherit;cursor:pointer;text-align:left}.detailedAhuVisual:focus-visible{outline:2px solid #67e8f9;outline-offset:-5px}.ahuSceneGlow{position:absolute;left:12%;right:10%;top:27%;height:43%;border-radius:50%;background:radial-gradient(circle,rgba(34,211,238,.24),rgba(34,211,238,0) 66%);filter:blur(18px)}.ahuRig{position:absolute;left:8%;right:8%;top:39%;height:31%;transform:perspective(980px) rotateX(55deg) rotateZ(-7deg) skewX(-6deg);transform-origin:center;filter:drop-shadow(0 28px 28px rgba(0,0,0,.34));transition:transform .32s ease}.detailedAhuVisual.isExploded .ahuRig{transform:perspective(980px) rotateX(55deg) rotateZ(-7deg) skewX(-6deg) translateY(-8px)}.moduleRail{position:absolute;left:12%;right:11%;height:8px;border-radius:999px;background:linear-gradient(90deg,#1f2937,#dbeafe,#1f2937);box-shadow:0 0 18px rgba(148,163,184,.18)}.topRail{top:-12px}.bottomRail{bottom:-12px}.ahuModule,.ductConnection{position:absolute;top:0;height:100%;border:1px solid rgba(226,232,240,.38);background:linear-gradient(145deg,rgba(203,213,225,.95),rgba(100,116,139,.86));box-shadow:inset 0 1px 0 rgba(255,255,255,.38),inset -20px -18px 34px rgba(15,23,42,.24);transition:transform .3s ease,box-shadow .3s ease,border-color .3s ease}.ahuModule::before{content:"";position:absolute;inset:8px;border:1px solid rgba(15,23,42,.18);background:linear-gradient(90deg,rgba(255,255,255,.18),rgba(255,255,255,.03));clip-path:polygon(0 0,100% 8%,100% 91%,0 100%)}.ahuModule::after{content:"";position:absolute;left:0;right:0;top:-14px;height:14px;border:1px solid rgba(226,232,240,.2);background:linear-gradient(90deg,rgba(226,232,240,.86),rgba(100,116,139,.82));transform:skewX(-18deg);transform-origin:bottom}.moduleSkin{position:absolute;inset:0;background:linear-gradient(120deg,rgba(255,255,255,.22),transparent 35%,rgba(34,211,238,.08) 75%,transparent);opacity:.78}.modulePanel{position:absolute;inset:17px 12px;display:grid;place-items:center;border:1px solid rgba(15,23,42,.24);background:rgba(2,8,23,.13);overflow:hidden}.moduleCode{position:absolute;left:8px;top:7px;z-index:2;border:1px solid rgba(15,23,42,.28);border-radius:999px;background:rgba(2,8,23,.52);color:#e0f2fe;font-size:9px;font-weight:900;letter-spacing:.08em;padding:3px 6px}.moduleLabel{position:absolute;left:50%;top:calc(100% + 28px);z-index:5;min-width:112px;transform:translateX(-50%) rotateZ(7deg) skewX(6deg);border:1px solid rgba(125,211,252,.26);border-radius:8px;background:rgba(2,8,23,.86);box-shadow:0 0 18px rgba(34,211,238,.16);padding:6px 8px;text-align:center;opacity:.78}.moduleLabel strong,.moduleLabel small{display:block}.moduleLabel strong{color:#e0f2fe;font-size:9px;font-weight:900;letter-spacing:.05em}.moduleLabel small{margin-top:2px;color:#93c5fd;font-size:9px}.detailedAhuVisual.isExploded .moduleLabel{opacity:1;border-color:rgba(34,211,238,.56)}.intakeModule{left:13%;width:14%}.filterModule{left:27%;width:15%}.coilModule{left:42%;width:18%}.fanModule{left:60%;width:16%}.supplyModule{left:76%;width:12%}.inletDuct{left:2%;width:11%;border-radius:8px 0 0 8px;background:linear-gradient(145deg,rgba(148,163,184,.86),rgba(51,65,85,.92))}.outletDuct{left:88%;width:10%;border-radius:0 8px 8px 0;background:linear-gradient(145deg,rgba(148,163,184,.86),rgba(51,65,85,.92))}.ductConnection strong{position:absolute;left:50%;bottom:-24px;transform:translateX(-50%) rotateZ(7deg) skewX(6deg);color:#bae6fd;font-size:9px;font-weight:900;letter-spacing:.12em}.ductFace{position:absolute;inset:14px 12px;display:grid;gap:6px;border:1px solid rgba(15,23,42,.32);background:rgba(2,8,23,.24);padding:8px}.ductFace i{display:block;border-radius:999px;background:linear-gradient(90deg,rgba(103,232,249,.42),rgba(226,232,240,.72));box-shadow:0 0 10px rgba(34,211,238,.18)}.damperAssembly{position:absolute;inset:18px 20px;display:grid;gap:6px}.damperAssembly i{display:block;height:10px;border-radius:999px;background:linear-gradient(90deg,#475569,#e2e8f0);transform:rotate(-13deg);box-shadow:0 0 9px rgba(15,23,42,.24)}.filterGrid{position:absolute;inset:12px 18px;border:1px solid rgba(15,23,42,.45);background:linear-gradient(90deg,rgba(15,23,42,.5) 1px,transparent 1px),linear-gradient(rgba(15,23,42,.5) 1px,transparent 1px),linear-gradient(135deg,rgba(226,232,240,.86),rgba(51,65,85,.64));background-size:7px 7px,7px 7px,auto}.coilPack{position:absolute;inset:12px 17px;border:1px solid rgba(120,53,15,.42);background:repeating-linear-gradient(90deg,rgba(15,23,42,.2) 0 2px,transparent 2px 8px),rgba(251,146,60,.1)}.coilPack i{position:absolute;top:10%;bottom:10%;width:4px;border-radius:999px;background:linear-gradient(#fed7aa,#c2410c);box-shadow:0 0 10px rgba(251,146,60,.44)}.coilPack i:nth-child(1){left:8%}.coilPack i:nth-child(2){left:16%}.coilPack i:nth-child(3){left:24%}.coilPack i:nth-child(4){left:32%}.coilPack i:nth-child(5){left:40%}.coilPack i:nth-child(6){left:48%}.coilPack i:nth-child(7){left:56%}.coilPack i:nth-child(8){left:64%}.coilPack i:nth-child(9){left:72%}.coilPack i:nth-child(10){left:80%}.coilPack i:nth-child(11){left:88%}.coilPack b{position:absolute;left:8%;right:8%;height:6px;border-radius:999px;background:linear-gradient(90deg,#7c2d12,#fed7aa,#7c2d12)}.coilPack b:nth-of-type(1){top:22%}.coilPack b:nth-of-type(2){bottom:22%}.fanRotor{position:absolute;width:min(72px,62%);aspect-ratio:1;border:8px solid rgba(15,23,42,.78);border-radius:50%;background:radial-gradient(circle,#0f172a 0 16%,#bae6fd 17% 23%,#1e293b 24% 100%);box-shadow:inset 0 0 20px rgba(2,8,23,.9),0 0 18px rgba(34,211,238,.22);animation:fanIdle 6s linear infinite}.fanRotor i{position:absolute;left:50%;top:50%;width:41%;height:12%;border-radius:999px 80% 80% 999px;background:linear-gradient(90deg,#bae6fd,#64748b);transform-origin:left center}.fanRotor i:nth-child(1){transform:rotate(0deg)}.fanRotor i:nth-child(2){transform:rotate(90deg)}.fanRotor i:nth-child(3){transform:rotate(180deg)}.fanRotor i:nth-child(4){transform:rotate(270deg)}.ductVanes{position:absolute;inset:17px 14px;display:grid;gap:7px}.ductVanes i{display:block;border:1px solid rgba(15,23,42,.24);background:linear-gradient(90deg,rgba(186,230,253,.5),rgba(71,85,105,.72));transform:skewY(-8deg)}.transparentCover{position:absolute;left:14%;right:12%;top:-20px;height:28px;border:1px solid rgba(186,230,253,.22);background:linear-gradient(90deg,rgba(224,242,254,.24),rgba(34,211,238,.08));transform:skewX(-18deg);box-shadow:0 0 24px rgba(34,211,238,.15)}.detailedAhuVisual.isExploded .intakeModule{transform:translate(-12px,-12px)}.detailedAhuVisual.isExploded .filterModule{transform:translate(-6px,-32px)}.detailedAhuVisual.isExploded .coilModule{transform:translate(4px,-42px)}.detailedAhuVisual.isExploded .fanModule{transform:translate(14px,-28px)}.detailedAhuVisual.isExploded .supplyModule{transform:translate(26px,-12px)}.detailedAhuVisual.isExploded .transparentCover{transform:translateY(-50px) skewX(-18deg);opacity:.55}.detailedAhuVisual.isSelected .ahuModule,.detailedAhuVisual:hover .ahuModule{border-color:rgba(34,211,238,.58);box-shadow:inset 0 1px 0 rgba(255,255,255,.38),inset -20px -18px 34px rgba(15,23,42,.24),0 0 26px rgba(34,211,238,.13)}.airflowTrack{position:absolute;z-index:4;left:7%;right:7%;height:20px;pointer-events:none}.airflowTrackIn{top:31%}.airflowTrackOut{top:64%}.airflowTrack::before{content:"";position:absolute;left:0;right:0;top:9px;border-top:1px dashed rgba(103,232,249,.54);filter:drop-shadow(0 0 8px rgba(34,211,238,.75))}.airflowTrack i{position:absolute;top:4px;width:10px;height:10px;border-top:2px solid #67e8f9;border-right:2px solid #67e8f9;transform:rotate(45deg);animation:airflowMove 3.2s linear infinite}.airflowTrack i:nth-child(1){animation-delay:0s}.airflowTrack i:nth-child(2){animation-delay:1s}.airflowTrack i:nth-child(3){animation-delay:2s}.unitCaption{position:absolute;left:50%;top:12%;transform:translateX(-50%);min-width:min(460px,76%);border:1px solid rgba(125,211,252,.36);border-radius:8px;background:rgba(2,8,23,.82);box-shadow:0 0 26px rgba(34,211,238,.2);padding:10px 14px;text-align:center}.unitCaption strong,.unitCaption span{display:block}.unitCaption strong{color:#f8fafc;font-size:18px}.unitCaption span{margin-top:4px;color:#bbf7d0;font-size:12px;font-weight:800}.passportPanel{padding:14px;transition:border-color .2s ease,box-shadow .2s ease}.passportPanel.isSelected{border-color:rgba(34,211,238,.46);box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 18px 52px rgba(0,0,0,.34),0 0 26px rgba(34,211,238,.1)}.statusRow{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.statusRow span:first-child{border-color:rgba(34,197,94,.42);color:#bbf7d0}.passportGrid{display:grid;gap:7px;margin:14px 0}.passportGrid div{display:grid;grid-template-columns:128px 1fr;gap:10px;border-bottom:1px solid rgba(125,211,252,.12);padding-bottom:7px}.passportGrid dt{color:#93c5fd;font-size:12px}.passportGrid dd{margin:0;color:#f8fafc;font-size:13px;line-height:1.35}.chipBlock{display:grid;gap:8px;margin-top:12px}.chipBlock strong,.controlsLocked strong{color:#e0f2fe;font-size:13px}.chipBlock div,.controlsLocked div{display:flex;flex-wrap:wrap;gap:7px}.chipBlock button{border-radius:8px;cursor:pointer}.explodeButton{width:100%;margin-top:14px}.controlsLocked{display:grid;gap:9px;margin-top:14px;border:1px solid rgba(248,113,113,.22);border-radius:8px;background:rgba(127,29,29,.12);padding:10px}.controlsLocked button{border:1px solid rgba(148,163,184,.2);border-radius:8px;background:rgba(15,23,42,.5);color:#94a3b8;padding:8px 9px}@keyframes airflowMove{0%{left:0;opacity:0}12%{opacity:1}88%{opacity:1}100%{left:98%;opacity:0}}@keyframes fanIdle{to{transform:rotate(360deg)}}@media(max-width:980px){.equipment3DSection{grid-template-columns:1fr;padding:14px}.viewerHeader{display:grid}.viewerViewport{height:370px}.passportGrid div{grid-template-columns:1fr}.ahuRig{left:3%;right:3%;transform:perspective(860px) rotateX(57deg) rotateZ(-6deg) skewX(-4deg) scale(.92)}.unitCaption{top:9%}.moduleLabel{display:none}.detailedAhuVisual.isExploded .moduleLabel{display:block;min-width:88px}.viewerHints span{font-size:10px}}
      `}</style>
    </section>
  );
}
