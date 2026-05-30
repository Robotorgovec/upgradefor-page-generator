"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./WingproProposalPage.module.css";

type TwinLayerId = "equipment" | "specification" | "documents" | "delivery" | "installation" | "sales";
type SceneId = "source" | "verify" | "negotiate" | "contract" | "produce" | "ship" | "handover" | "reuse";
type ControlStepId = "supplier" | "offer" | "contract" | "delivery" | "workplan" | "field" | "closeout";
type VaultMode = "vault" | "timeline" | "owner" | "missing";
type RiskImpact = "quality" | "time" | "financial" | "dependency";
type CopyVariant = "short" | "executive" | "boundary" | "deliverables" | "payment" | "next";

const twinLayers = [
  {
    id: "equipment",
    title: "Equipment",
    data: ["модель BB150B-307H", "количество 2 units", "material confirmation", "pressure class", "connection logic", "dimensions/weight pending/confirmed"],
    value: "товарная позиция получает единый технический профиль вместо фрагментов переписки",
    risk: "снижение вероятности ошибки по модели, материалу, давлению или комплектности",
    deliverable: "equipment data card",
  },
  {
    id: "specification",
    title: "Specification",
    data: ["исходные параметры", "технические вопросы", "подтверждение материала", "подтверждение давления", "чертеж", "параметры для профильной проверки"],
    value: "профильные специалисты WinGPro получают структурированные вводные для проверки",
    risk: "технические решения не принимаются на базе устных сообщений",
    deliverable: "technical evidence checklist",
  },
  {
    id: "documents",
    title: "Documents",
    data: ["PI", "specification", "drawing", "packing list", "commercial invoice", "certificate of origin", "material certificates", "warranty certificate", "photo/video/nameplate"],
    value: "документы превращаются в Document Vault с owner, status и release gate",
    risk: "снижение риска позднего запроса критичных файлов перед оплатой или отгрузкой",
    deliverable: "Document Vault index",
  },
  {
    id: "delivery",
    title: "Delivery",
    data: ["factory contact", "EXW/FCA/DAP logic", "pickup data", "weight/dimensions", "broker input", "logistics handoff"],
    value: "маршрут поставки читается как data-flow, а не как набор разрозненных сообщений",
    risk: "логист и брокер получают пакет до операционных точек передачи",
    deliverable: "delivery data-flow pack",
  },
  {
    id: "installation",
    title: "Installation Inputs",
    data: ["connection points", "service access", "dimensions", "mounting questions", "owner for technical approval", "coordination pack"],
    value: "монтажная сторона получает вводные заранее и видит открытые вопросы",
    risk: "снижение вероятности поздних уточнений на площадке",
    deliverable: "mounting coordination pack",
  },
  {
    id: "sales",
    title: "Digital Sales Asset",
    data: ["supplier profile", "product card", "document links", "repeat purchase notes", "future sales brief", "Kazakhstan resale base"],
    value: "поставка не исчезает после сделки, а становится reusable digital product asset",
    risk: "следующая закупка или продажа не начинается с нуля",
    deliverable: "digital supplier + product line cards",
  },
] as const;

const scenes = [
  { id: "source", layer: "equipment", title: "Source", status: "collecting", control: "канал поставщика и контактная карта", receives: "supplier profile", risk: "неясная роль производителя/трейдера" },
  { id: "verify", layer: "specification", title: "Verify", status: "owner required", control: "material, pressure, model, drawing questions", receives: "technical evidence checklist", risk: "параметры теряются в переписке" },
  { id: "negotiate", layer: "documents", title: "Negotiate", status: "collecting", control: "PI, delta-list, payment terms", receives: "decision log", risk: "слабые условия PI" },
  { id: "contract", layer: "documents", title: "Contract", status: "external dependency", control: "draft RU/EN and responsibility boundary", receives: "contract input pack", risk: "устные договоренности без owner" },
  { id: "produce", layer: "specification", title: "Produce", status: "planned", control: "production confirmations and evidence request", receives: "confirmation tracker", risk: "производственный статус непрозрачен" },
  { id: "ship", layer: "delivery", title: "Ship", status: "at risk", control: "packing, dimensions, photo/video/nameplate", receives: "shipment readiness board", risk: "нет данных для логиста/брокера" },
  { id: "handover", layer: "installation", title: "Handover", status: "planned", control: "broker, logistics, mounting inputs", receives: "handover room packs", risk: "участники получают вводные поздно" },
  { id: "reuse", layer: "sales", title: "Reuse", status: "planned", control: "supplier card, product card, sales brief", receives: "Digital Product Asset", risk: "позиция исчезает после разовой закупки" },
] as const;

const projectControlScale = [
  {
    id: "supplier",
    title: "Supplier Search",
    result: "запросы поставщикам, candidate cards, shortlist и selected logic",
    decision: "WinGPro видит, почему канал попал в shortlist и какие вопросы открыты",
    artifact: "Supplier Request Lab",
  },
  {
    id: "offer",
    title: "Offer Selection",
    result: "сравнение technical fit, document readiness, payment risk и delivery readiness",
    decision: "условия выбора видны как board, а не как фрагменты переписки",
    artifact: "Offer Comparison Board",
  },
  {
    id: "contract",
    title: "Contract Decision",
    result: "payment scenario, delivery terms, evidence before payment/shipment, contract strength",
    decision: "WinGPro согласует не только цену, но и условия, снижающие операционные риски",
    artifact: "Contract Decision Simulator",
  },
  {
    id: "delivery",
    title: "Delivery Control",
    result: "payment readiness, production confirmation, factory status, packing data, logistics/broker handoff",
    decision: "поставка читается как статусный контур с blockers и owners",
    artifact: "Delivery Timeline",
  },
  {
    id: "workplan",
    title: "Work Plan / ППР Draft",
    result: "work zones, stages, checklist, blockers, photo required, status",
    decision: "монтажная сторона получает coordination draft, но финальный ППР утверждают профильные участники",
    artifact: "Work Plan Builder / ППР skeleton",
  },
  {
    id: "field",
    title: "Field Execution",
    result: "task board, evidence required, photo report, open items",
    decision: "исполнение отмечается монтажной стороной в своей зоне ответственности",
    artifact: "Field Execution Board",
  },
  {
    id: "closeout",
    title: "Handover & Reuse",
    result: "handover register, photo evidence register, open issues, digital product card",
    decision: "результат остается как Digital Product Asset для повторных закупок и продаж",
    artifact: "Handover & Closeout",
  },
] as const satisfies ReadonlyArray<{
  id: ControlStepId;
  title: string;
  result: string;
  decision: string;
  artifact: string;
}>;

const supplierCandidates = [
  ["Candidate A", "manufacturer channel", "strong model match", "documents requested", "selected candidate"],
  ["Candidate B", "trader channel", "price needs clarification", "bank details missing", "reserve"],
  ["Candidate C", "factory contact pending", "pressure evidence required", "response slow", "watch"],
] as const;

const offerComparison = [
  ["Technical fit", "BB150B-307H / 2 units", "fit with confirmations", "owner required"],
  ["Document readiness", "PI + specification + drawing request", "under review", "UPGRADE tracks"],
  ["Payment risk", "evidence before payment", "at risk until bank/material/pressure evidence", "WinGPro decision"],
  ["Delivery readiness", "packing, weight/dimensions, pickup data", "collecting", "supplier/logistics owner"],
  ["Recommendation", "select only after evidence gates", "conditional", "decision log"],
] as const;

const deliveryTimeline = [
  ["Payment readiness", "PI, bank details, material/pressure evidence", "owner required"],
  ["Production confirmation", "confirmed specification, drawing request, open technical questions", "planned"],
  ["Factory status", "supplier status, evidence request, escalation log", "collecting"],
  ["Pre-shipment evidence", "photo/video/nameplate, packing list", "at risk"],
  ["Logistics handoff", "pickup contact, weight/dimensions, route data", "collecting"],
  ["Broker handoff", "invoice draft, export docs, broker input list", "external dependency"],
  ["Arrival", "receiving status, issue log, photo evidence", "planned"],
  ["Mounting handoff", "coordination draft, questions, responsible owner", "planned"],
] as const;

const workPlanItems = [
  ["Work zones", "receiving area, access path, mounting location, connection points", "WinGPro / mounting side"],
  ["Work stages", "receiving, visual check, positioning, connection preparation, handover", "mounting side"],
  ["Checklist", "nameplate checked, packing damage, dimensions, access/service space", "responsible technical specialist"],
  ["Blockers", "missing dimensions, missing drawing, unclear connection owner", "UPGRADE records status"],
  ["Photo required", "before shipment, receiving, installation preparation, work progress, handover", "field owner"],
] as const;

const participantRoles = [
  "UPGRADE Project Lead",
  "Procurement/Data Coordinator",
  "Supplier Coordinator",
  "Logistics/Broker Liaison",
  "Technical Data Coordinator",
  "WinGPro Decision Owner",
  "Supplier Representative",
  "Logistics Provider",
  "Customs Broker",
  "Mounting Contractor Lead",
  "Responsible Technical Specialist",
] as const;

const fieldTasks = [
  ["received", "Ready", "receiving photo + packing state"],
  ["nameplate checked", "Needs evidence", "nameplate/photo/video before acceptance"],
  ["photo report", "Planned", "before shipment / receiving / handover"],
  ["access path", "Blocked", "site owner required"],
  ["connection points", "Ready", "technical owner confirmation"],
  ["mounting location", "Planned", "coordination draft"],
  ["installation started", "Planned", "mounting side task"],
  ["handover", "Planned", "handover register"],
] as const;

const evidenceCards = [
  ["Before shipment", "photo/video/nameplate, packing state", "supplier"],
  ["Receiving", "arrival photo, package condition, issue note", "WinGPro / logistics"],
  ["Installation preparation", "access path, location, connection points", "mounting side"],
  ["Work progress", "field task notes, blockers, owner updates", "mounting side"],
  ["Handover", "completion notes, open issues, photo evidence register", "WinGPro / mounting side"],
] as const;

const implementationMetrics = [
  ["Supplier selection readiness", "62%", "shortlist active"],
  ["Contract readiness", "44%", "terms under review"],
  ["Delivery readiness", "38%", "packing data pending"],
  ["Work plan readiness", "51%", "ППР skeleton prepared"],
  ["Participants readiness", "70%", "roles mapped"],
  ["Field task readiness", "36%", "evidence owners needed"],
  ["Evidence readiness", "28%", "photo register planned"],
  ["Handover readiness", "40%", "closeout packs drafted"],
] as const;

const statusLine = [
  ["Supplier", "collecting"],
  ["Contract", "owner required"],
  ["Payment Readiness", "at risk"],
  ["Production Inputs", "planned"],
  ["Shipment Readiness", "at risk"],
  ["Customs Handoff", "external dependency"],
  ["Mounting Handoff", "planned"],
  ["Digital Asset", "collecting"],
];

const participants = [
  {
    name: "WinGPro",
    flow: "получает decision log, release gates, board pack и handover room",
    upgrade: "UPGRADE структурирует данные и показывает blockers",
    outside: "финальные коммерческие и технические решения утверждает WinGPro или профильные стороны",
  },
  {
    name: "UPGRADE",
    flow: "собирает data-room, risk radar, release gates, route map и handover packs",
    upgrade: "UPGRADE управляет информационным контуром и точками эскалации",
    outside: "UPGRADE не является поставщиком, производителем, проектировщиком, монтажной организацией, брокером или перевозчиком",
  },
  {
    name: "Supplier",
    flow: "передает PI, specification, drawing, evidence, packing и export inputs",
    upgrade: "UPGRADE формирует clear request pack и фиксирует статусы ответа",
    outside: "качество оборудования и производственные обязательства остаются у поставщика/производителя",
  },
  {
    name: "Logistics",
    flow: "получает pickup contact, dimensions, weight, packing and route inputs",
    upgrade: "UPGRADE готовит logistics handoff и data-flow map",
    outside: "фактическая перевозка остается у логиста/перевозчика",
  },
  {
    name: "Broker",
    flow: "получает customs inputs, HS/TN VED owner, export documents checklist",
    upgrade: "UPGRADE структурирует broker/customs input list",
    outside: "таможенные решения утверждает брокер/профильная сторона",
  },
  {
    name: "Mounting",
    flow: "получает connection points, service access, dimensions and mounting questions",
    upgrade: "UPGRADE готовит mounting coordination pack",
    outside: "монтаж, ПНР и технический надзор не входят в ответственность UPGRADE",
  },
  {
    name: "Future Sales",
    flow: "получает supplier profile, product card, documents and repeat purchase notes",
    upgrade: "UPGRADE превращает позицию в reusable sales asset",
    outside: "будущие продажи зависят от коммерческой стратегии WinGPro",
  },
];

const routePoints = [
  { title: "Factory China", data: "factory contact, model, evidence request", owner: "supplier", action: "создать source request", risk: "неясный источник данных", gate: "Gate 0" },
  { title: "Pickup", data: "pickup contact map, packing, dimensions", owner: "logistics", action: "подготовить pickup handoff", risk: "задержка маршрута", gate: "Gate 3" },
  { title: "Export docs", data: "commercial invoice, certificate, export checklist", owner: "supplier / broker", action: "собрать export document board", risk: "разрыв в документах", gate: "Gate 4" },
  { title: "Border / customs", data: "broker input list, HS/TN VED owner, document status", owner: "broker", action: "передать customs input list", risk: "оформление без полного пакета", gate: "Gate 4" },
  { title: "Kazakhstan", data: "arrival status, handoff owner, issue log", owner: "WinGPro / logistics", action: "обновить release status", risk: "неясный статус прибытия", gate: "Gate 5" },
  { title: "Project site", data: "connection points, service access, mounting questions", owner: "mounting side", action: "передать coordination pack", risk: "площадка получает вводные поздно", gate: "Gate 5" },
  { title: "Mounting handoff", data: "open questions, technical approval owner, handover register", owner: "WinGPro / mounting", action: "закрыть handover room", risk: "нет приемочного контура", gate: "Gate 6" },
];

const vaultDocs = [
  ["Supplier Identity", "supplier profile", "identity", "Gate 0", "UPGRADE", "collecting", "commercial", "подтверждает канал", "сокращает повторные вопросы", "неясный торговый канал", "свести supplier profile"],
  ["Supplier Identity", "bank details confirmation", "finance", "Gate 1", "supplier", "missing", "commercial", "снижает риск оплаты по слабым реквизитам", "уменьшает задержку платежного решения", "оплата без evidence", "запросить подтверждение"],
  ["Commercial Terms", "Proforma Invoice", "commercial", "Gate 1", "supplier", "review", "commercial", "сверка цены и условий", "сокращает цикл согласования PI", "слабые условия PI", "подготовить delta-list"],
  ["Technical Evidence", "pressure class confirmation", "technical", "Gate 1", "supplier", "missing", "quality", "снижает риск неподходящего оборудования", "снижает риск поздней технической переделки", "ошибка pressure class", "запросить evidence"],
  ["Technical Evidence", "drawing", "technical", "Gate 2", "supplier", "requested", "quality", "дает профильным участникам проверяемую основу", "уменьшает поздние монтажные вопросы", "нет чертежа", "закрепить owner"],
  ["Delivery Pack", "packing list", "logistics", "Gate 3", "supplier", "requested", "time", "снижает риск ошибки в логистическом пакете", "ускоряет передачу логисту/брокеру", "нет packing data", "включить в shipment checklist"],
  ["Delivery Pack", "photo/video/nameplate", "evidence", "Gate 3", "supplier", "requested", "quality", "дает evidence before shipment", "уменьшает поздние проверки", "нет доказательств до отгрузки", "запросить media evidence"],
  ["Customs/Broker Inputs", "broker input list", "customs", "Gate 4", "broker", "collecting", "customs", "структурирует таможенные вводные", "ускоряет передачу брокеру", "customs documents gap", "передать input list"],
  ["Mounting Inputs", "mounting questions checklist", "mounting", "Gate 5", "UPGRADE", "ready", "mounting", "повышает готовность монтажной стороны", "снижает риск поздних уточнений", "late mounting inputs", "собрать coordination pack"],
  ["Digital Sales Asset", "digital product card", "asset", "Gate 7", "UPGRADE", "collecting", "commercial", "создает reusable sales base", "ускоряет повторное предложение", "нет product card", "связать documents and notes"],
] as const;

const risks = [
  { id: "identity", title: "supplier identity unclear", severity: "medium", impact: "dependency", x: 18, y: 34, evidence: "supplier profile, role clarification", owner: "WinGPro / supplier", escalation: "source request", boundary: "UPGRADE фиксирует статус ответа поставщика, но не отвечает за его действия" },
  { id: "material", title: "material mismatch", severity: "high", impact: "quality", x: 35, y: 18, evidence: "material confirmation, technical sheet", owner: "technical owner", escalation: "evidence before payment", boundary: "UPGRADE не утверждает технические параметры" },
  { id: "pressure", title: "pressure class mismatch", severity: "high", impact: "quality", x: 50, y: 24, evidence: "pressure class confirmation", owner: "technical owner", escalation: "Gate 1 blocker", boundary: "UPGRADE структурирует запрос" },
  { id: "pi", title: "PI weakness", severity: "medium", impact: "financial", x: 64, y: 36, evidence: "PI, commercial delta-list", owner: "WinGPro", escalation: "payment readiness", boundary: "UPGRADE не принимает платежное решение" },
  { id: "payment", title: "payment before evidence", severity: "high", impact: "financial", x: 76, y: 22, evidence: "before-payment checklist", owner: "WinGPro", escalation: "release gate board", boundary: "UPGRADE не принимает платежное решение за WinGPro" },
  { id: "packing", title: "missing packing data", severity: "medium", impact: "time", x: 25, y: 68, evidence: "packing list, weight/dimensions", owner: "supplier / logistics", escalation: "shipment readiness", boundary: "UPGRADE не является перевозчиком" },
  { id: "customs", title: "customs documents gap", severity: "medium", impact: "dependency", x: 48, y: 76, evidence: "broker input list, export docs", owner: "broker", escalation: "customs handoff", boundary: "UPGRADE не является брокером" },
  { id: "mounting", title: "late mounting inputs", severity: "high", impact: "time", x: 72, y: 66, evidence: "connection points, service access", owner: "mounting side", escalation: "mounting handoff", boundary: "UPGRADE не выполняет монтаж" },
  { id: "media", title: "no nameplate/photo/video before shipment", severity: "medium", impact: "quality", x: 42, y: 54, evidence: "photo/video/nameplate", owner: "supplier", escalation: "shipment evidence request", boundary: "UPGRADE не инспекционный орган" },
  { id: "asset", title: "no reusable digital product card", severity: "controlled", impact: "financial", x: 84, y: 82, evidence: "supplier card, product card", owner: "UPGRADE / WinGPro", escalation: "reuse pipeline", boundary: "будущие продажи зависят от коммерческой стратегии WinGPro" },
] as const;

const gates = [
  ["Gate 0 — Deal setup", "сделка описана как mission", "supplier identity, object, route, participants", "UPGRADE / WinGPro", "создать mission record", "нет supplier/object clarity", "mission card"],
  ["Gate 1 — Before payment", "платежная готовность на базе evidence", "PI, bank details, material, pressure, open questions", "WinGPro", "подготовить payment readiness board", "нет pressure/material confirmation", "before-payment checklist"],
  ["Gate 2 — Before production confirmation", "производственные вводные проверяемы", "specification, drawing request, technical owner", "supplier / technical owner", "вести confirmation tracker", "нет drawing/request owner", "confirmation board"],
  ["Gate 3 — Before shipment", "отгрузка имеет evidence и logistics inputs", "packing, weight/dimensions, photo/video/nameplate", "supplier", "собрать shipment readiness", "нет packing data", "shipment pack"],
  ["Gate 4 — Before customs/logistics handoff", "брокер и логист получают data-flow", "broker input, export docs, pickup map", "broker / logistics", "передать route map", "customs gap", "logistics/customs pack"],
  ["Gate 5 — Before mounting handoff", "площадка получает вводные заранее", "connection points, dimensions, access, questions", "mounting side", "подготовить coordination pack", "нет mounting owner", "mounting handoff"],
  ["Gate 6 — Before service acceptance", "результат принимается по deliverables", "vault index, risk radar, release board, packs", "WinGPro", "собрать handover room", "не закрыты deliverables", "acceptance register"],
  ["Gate 7 — Reuse in sales pipeline", "позиция готова к повторному использованию", "supplier card, product card, links, notes", "WinGPro / UPGRADE", "создать digital product asset", "нет reusable card", "sales asset"],
] as const;

const handoverPacks = [
  ["WinGPro Executive Pack", "mission card, decision log, release gates, acceptance register", "board pack", "WinGPro", "Gate 6", "руководство видит статус и результат"],
  ["Supplier Communication Pack", "structured questions, evidence request, open items", "request pack", "supplier", "Gate 1-3", "поставщик получает понятные запросы"],
  ["Logistics Pack", "pickup map, weight/dimensions, packing status", "data-flow pack", "logistics", "Gate 3-4", "логист видит операционные вводные"],
  ["Broker/Customs Pack", "broker input, export docs, HS/TN VED owner", "customs input list", "broker", "Gate 4", "брокер получает проверочный список"],
  ["Mounting Coordination Pack", "connection points, service access, dimensions, questions", "coordination pack", "mounting side", "Gate 5", "площадка получает вводные заранее"],
  ["Future Sales Pack", "supplier profile, product card, links, repeat purchase notes", "sales asset", "WinGPro", "Gate 7", "позиция готова к повторному использованию"],
] as const;

const copyTexts: Record<CopyVariant, string> = {
  short:
    "UPGRADE предлагает WinGPro не разовую помощь с поставщиком, а цифровой контур поставки оборудования: data-room, risk radar, release gates, контроль документов и статусов, handover-пакеты для логиста/брокера/монтажной стороны и цифровую товарную линию для повторного использования.",
  executive:
    "Стоимость 3 000 000 ₸ без НДС относится к единому комплексу IT/data и закупочно-координационного сопровождения. Результат — не контакт поставщика, а управляемая система качества, сроков, документов, рисков и передачи данных участникам проекта.",
  boundary:
    "UPGRADE структурирует данные, документы, вопросы, статусы и handover-пакеты. UPGRADE не является поставщиком, производителем, проектировщиком, монтажной организацией, брокером, перевозчиком, технадзором или сертификационным органом.",
  deliverables:
    "Deliverables: mission card, Digital Twin preview, Document Vault, Risk Radar, Release gates board, Route Map, Control Room status, Handover Room packs, digital supplier card, digital product card, copy-ready executive summary.",
  payment:
    "Коммерческое решение: 3 000 000 ₸ без НДС за единый комплекс сопровождения. Оплата 50/50 или 100% по согласованию. Acceptance is based on deliverables: data-room index, risk register, release gate board, handover packs, digital supplier/product card.",
  next:
    "После согласования КП стороны оформляют договор оказания услуг, где фиксируются единый комплекс работ, стоимость, порядок оплаты, deliverables, границы ответственности и порядок передачи результатов.",
};

function StatusPill({ value }: { value: string }) {
  return <span className={styles.statusPill} data-status={value}>{value}</span>;
}

export default function WingproProposalPage({ proposalPath }: { proposalPath: string }) {
  const [activeLayer, setActiveLayer] = useState<TwinLayerId>("equipment");
  const [activeScene, setActiveScene] = useState<SceneId>("source");
  const [activeControlStep, setActiveControlStep] = useState<ControlStepId>("supplier");
  const [activeParticipant, setActiveParticipant] = useState("UPGRADE");
  const [activeRoute, setActiveRoute] = useState(routePoints[0].title);
  const [vaultCategory, setVaultCategory] = useState("all");
  const [vaultStatus, setVaultStatus] = useState("all");
  const [vaultOwner, setVaultOwner] = useState("all");
  const [vaultGate, setVaultGate] = useState("all");
  const [vaultImpact, setVaultImpact] = useState("all");
  const [vaultMode, setVaultMode] = useState<VaultMode>("vault");
  const [riskImpact, setRiskImpact] = useState<RiskImpact | "all">("all");
  const [activeRisk, setActiveRisk] = useState<(typeof risks)[number]["id"]>(risks[0].id);
  const [activeGate, setActiveGate] = useState(0);
  const [activePack, setActivePack] = useState<(typeof handoverPacks)[number][0]>(handoverPacks[0][0]);
  const [paymentMode, setPaymentMode] = useState<"split" | "full">("split");
  const [isRotating, setIsRotating] = useState(true);
  const [presentationMode, setPresentationMode] = useState(false);
  const [copyStatus, setCopyStatus] = useState("Ready");
  const [copyVariant, setCopyVariant] = useState<CopyVariant>("short");
  const copyRef = useRef<HTMLTextAreaElement>(null);

  const layer = twinLayers.find((item) => item.id === activeLayer) ?? twinLayers[0];
  const categories = Array.from(new Set(vaultDocs.map((doc) => doc[0])));
  const owners = Array.from(new Set(vaultDocs.map((doc) => doc[4])));
  const gatesList = Array.from(new Set(vaultDocs.map((doc) => doc[3])));
  const visibleDocs = vaultDocs.filter((doc) => isDocVisible(doc));

  useEffect(() => {
    const next = `#layer-${activeLayer}`;
    if (window.location.hash !== next) window.history.replaceState(null, "", next);
  }, [activeLayer]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPresentationMode(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function isDocVisible(doc: (typeof vaultDocs)[number]) {
    return (
      (vaultCategory === "all" || doc[0] === vaultCategory) &&
      (vaultStatus === "all" || doc[5] === vaultStatus) &&
      (vaultOwner === "all" || doc[4] === vaultOwner) &&
      (vaultGate === "all" || doc[3] === vaultGate) &&
      (vaultImpact === "all" || doc[6] === vaultImpact) &&
      (vaultMode !== "missing" || doc[5] === "missing" || doc[5] === "requested")
    );
  }

  function selectScene(id: SceneId) {
    const next = scenes.find((item) => item.id === id);
    setActiveScene(id);
    if (next) setActiveLayer(next.layer as TwinLayerId);
  }

  async function copyBoardText(variant: CopyVariant) {
    setCopyVariant(variant);
    const text = copyTexts[variant];
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        setCopyStatus("Copied");
        return;
      } catch {
        // Fallback below keeps file/preview contexts usable.
      }
    }
    if (copyRef.current) {
      copyRef.current.hidden = false;
      copyRef.current.value = text;
      copyRef.current.focus();
      copyRef.current.select();
      const ok = document.execCommand("copy");
      copyRef.current.hidden = ok;
      setCopyStatus(ok ? "Copied with fallback" : "Text is open for manual copy");
    }
  }

  const twinStage = (
    <div className={styles.twinStage} data-layer={activeLayer}>
      <div className={styles.twinObject} aria-hidden="true">
        <span className={styles.plateStack} />
        <span className={styles.coreBlock} />
        <span className={styles.connectionA} />
        <span className={styles.connectionB} />
      </div>
      <svg className={styles.twinBlueprint} viewBox="0 0 720 420" role="img" aria-label="Conceptual digital twin preview">
        <path d="M90 210 C180 80 330 70 430 170 S570 330 650 210" />
        <path d="M80 290 C210 360 410 360 620 260" />
        <circle cx="138" cy="164" r="6" />
        <circle cx="274" cy="105" r="6" />
        <circle cx="462" cy="174" r="6" />
        <circle cx="586" cy="276" r="6" />
      </svg>
      <div className={styles.orbitGrid}>
        {twinLayers.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={styles.orbitNode}
            data-active={activeLayer === item.id}
            style={{ ["--i" as string]: index }}
            onClick={() => setActiveLayer(item.id)}
          >
            {item.title}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.page} data-proposal-root data-theme-scope="light" data-proposal-id="wingpro-2605281047">
      <nav className={styles.breadcrumbs} aria-label="Навигация">
        <a href="/">UPGRADE</a>
        <span>HVAC</span>
        <span>CP 2605281047</span>
      </nav>

      <nav className={styles.miniNav} aria-label="Разделы КП">
        {[
          ["#mission", "Mission"],
          ["#digital-twin", "Digital Twin"],
          ["#project-control", "Control Scale"],
          ["#control-room", "Control Room"],
          ["#vault", "Vault"],
          ["#risk-radar", "Risk Radar"],
          ["#handover", "Handover"],
        ].map(([href, label]) => (
          <a key={href} href={href}>{label}</a>
        ))}
      </nav>

      <section className={styles.hero} id="mission" aria-labelledby="proposal-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>WinGPro × UPGRADE</p>
          <h1 id="proposal-title">Цифровой контур поставки пластинчатых теплообменников</h1>
          <p className={styles.lead}>От выбора поставщика до handover-пакета: данные, документы, риски, сроки, логистика, монтажные вводные и цифровая товарная линия в одном управляемом процессе.</p>
          <p className={styles.sublead}>Это не комиссия за контакт поставщика. Это рабочая система управления качеством закупки, сроками подготовки, статусами участников и повторным использованием товарных данных.</p>
          <div className={styles.heroActions}>
            <a className={styles.primaryAction} href="#filmstrip">Запустить обзор сделки</a>
            <a className={styles.secondaryAction} href="#digital-twin">Открыть Digital Twin</a>
            <button className={styles.secondaryAction} type="button" onClick={() => copyBoardText("executive")}>Скопировать executive summary</button>
          </div>
          <div className={styles.indicators} aria-label="Mission indicators">
            {["Quality Gate: 6 checkpoints", "Document Vault: 30+ data points", "Risk Radar: 10 risk groups", "Handover: broker / logistics / mounting / sales", "Digital Product Asset: supplier + product line"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
        <aside className={styles.missionCard}>
          <span className={styles.privateStatus}>commercial proposal / private</span>
          <strong>3 000 000 ₸ без НДС</strong>
          <p>единый комплекс сопровождения</p>
          <dl>
            <div><dt>объект</dt><dd>2 × BB150B-307H</dd></div>
            <div><dt>маршрут</dt><dd>China → Kazakhstan</dd></div>
            <div><dt>scope</dt><dd>IT/data + procurement coordination</dd></div>
            <div><dt>outcome</dt><dd>data-room + risk register + delivery control + digital product asset</dd></div>
          </dl>
        </aside>
      </section>

      <section className={styles.digitalTwin} id="digital-twin" aria-labelledby="twin-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Digital Twin сделки</p>
          <h2 id="twin-title">Товарная позиция как управляемый цифровой объект</h2>
          <p>UPGRADE превращает товарную позицию из набора сообщений и файлов в управляемый цифровой объект. Такой объект можно проверять, передавать логисту/брокеру/монтажной стороне и повторно использовать в продажах.</p>
        </div>
        <div className={styles.twinShell} data-rotating={isRotating && !presentationMode}>
          {twinStage}
          <aside className={styles.twinPanel}>
            <div className={styles.segmented} role="tablist" aria-label="Digital Twin layers">
              {twinLayers.map((item) => (
                <button key={item.id} type="button" role="tab" aria-selected={activeLayer === item.id} aria-controls={`layer-${item.id}`} onClick={() => setActiveLayer(item.id)}>
                  {item.title}
                </button>
              ))}
            </div>
            {twinLayers.map((item) => (
              <section key={item.id} id={`layer-${item.id}`} role="tabpanel" hidden={activeLayer !== item.id}>
                <h3>{item.title}</h3>
                <p>{item.value}</p>
                <dl>
                  <div><dt>данные</dt><dd>{item.data.join("; ")}</dd></div>
                  <div><dt>risk закрывается</dt><dd>{item.risk}</dd></div>
                  <div><dt>deliverable</dt><dd>{item.deliverable}</dd></div>
                </dl>
              </section>
            ))}
            <div className={styles.twinControls}>
              <button type="button" onClick={() => setPresentationMode(true)}>Open presentation mode</button>
              <button type="button" onClick={() => setIsRotating((value) => !value)}>{isRotating ? "Pause" : "Rotate"}</button>
              <button type="button" onClick={() => setActiveLayer("equipment")}>Reset</button>
            </div>
            <p className={styles.legalNote}>Визуализация является conceptual digital twin preview и не заменяет инженерную модель, проектную документацию или утвержденные чертежи.</p>
          </aside>
        </div>
        <noscript>
          <ul className={styles.noScriptList}>
            {twinLayers.map((item) => <li key={item.id}>{item.title}: {item.data.join("; ")}</li>)}
          </ul>
        </noscript>
      </section>

      {presentationMode ? (
        <div className={styles.presentationOverlay} role="dialog" aria-modal="true" aria-label="Digital Twin presentation mode">
          <button
            className={styles.closePresentation}
            type="button"
            onClick={() => setPresentationMode(false)}
            onMouseDown={() => setPresentationMode(false)}
            onPointerDown={() => setPresentationMode(false)}
          >
            Close
          </button>
          <div className={styles.presentationStage}>{twinStage}</div>
          <article className={styles.presentationPanel}>
            <h2>{layer.title}</h2>
            <p>{layer.value}</p>
            <p>{layer.risk}</p>
          </article>
        </div>
      ) : null}

      <section className={styles.filmstrip} id="filmstrip" aria-labelledby="film-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Procurement filmstrip</p>
          <h2 id="film-title">Сделка как операционный сценарий</h2>
        </div>
        <div className={styles.sceneRail}>
          {scenes.map((item) => (
            <button key={item.id} type="button" data-active={activeScene === item.id} onClick={() => selectScene(item.id)}>
              <svg viewBox="0 0 120 70" aria-hidden="true"><rect x="10" y="12" width="100" height="46" rx="8" /><path d="M26 44h68M28 28h38M74 28h18" /></svg>
              <span>{item.title}</span>
              <StatusPill value={item.status} />
            </button>
          ))}
        </div>
        <div className={styles.sceneDetails}>
          {scenes.map((item) => (
            <article key={`detail-${item.id}`} className={styles.sceneDetail} hidden={activeScene !== item.id}>
              <h3>{item.title}</h3>
              <dl>
                <div><dt>what UPGRADE controls</dt><dd>{item.control}</dd></div>
                <div><dt>what WinGPro receives</dt><dd>{item.receives}</dd></div>
                <div><dt>risk if skipped</dt><dd>{item.risk}</dd></div>
                <div><dt>related Digital Twin layer</dt><dd>{item.layer}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.valueOs} aria-labelledby="value-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Value operating system</p>
          <h2 id="value-title">Что покупает WinGPro за 3 000 000 ₸</h2>
        </div>
        <div className={styles.compareBoard}>
          <article>
            <h3>Без цифрового контура</h3>
            <ul>
              {["решения в переписке", "технические вопросы теряются", "документы приходят поздно", "логист/брокер получают неполный пакет", "монтажная сторона получает вводные слишком поздно", "товарная позиция исчезает после разовой закупки"].map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
          <article>
            <h3>С контуром UPGRADE</h3>
            <ul>
              {["поставщик превращается в supplier profile", "оборудование превращается в digital product object", "вопросы превращаются в risk register", "документы превращаются в vault", "сроки превращаются в release gates", "участники получают handover-пакеты", "позиция превращается в reusable sales asset"].map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        </div>
        <div className={styles.protectionGrid}>
          {["качество подбора", "время согласований", "документальная готовность", "статусный контроль", "управляемость поставки", "монтажная подготовленность", "повторное коммерческое использование"].map((item) => <span key={item}>{item}</span>)}
        </div>
      </section>

      <section className={styles.projectControl} id="project-control" aria-labelledby="control-scale-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Project Control Scale</p>
          <h2 id="control-scale-title">От поиска поставщика до Handover & Closeout</h2>
          <p>Этот слой показывает результат для WinGPro до деталей процесса: как выбирается поставщик, сравниваются условия, готовится договорная логика, ведется Delivery Timeline, формируется Work Plan Builder / ППР skeleton, собирается evidence и закрывается handover.</p>
        </div>

        <div className={styles.controlScale} role="tablist" aria-label="Project control scale">
          {projectControlScale.map((step, index) => (
            <button
              key={step.id}
              type="button"
              role="tab"
              aria-selected={activeControlStep === step.id}
              aria-controls={`control-step-${step.id}`}
              onClick={() => setActiveControlStep(step.id)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {step.title}
            </button>
          ))}
        </div>

        <div className={styles.controlStepPanels}>
          {projectControlScale.map((step) => (
            <article key={step.id} id={`control-step-${step.id}`} role="tabpanel" className={styles.controlStepPanel} hidden={activeControlStep !== step.id}>
              <h3>{step.artifact}</h3>
              <dl>
                <div><dt>что собирается</dt><dd>{step.result}</dd></div>
                <div><dt>как помогает решению</dt><dd>{step.decision}</dd></div>
              </dl>
            </article>
          ))}
        </div>

        <div className={styles.controlBoardGrid}>
          <article className={styles.supplierLab}>
            <div className={styles.boardHeader}>
              <p className={styles.eyebrow}>Supplier Request Lab</p>
              <h3>Запросы, scoring и shortlist</h3>
            </div>
            <div className={styles.candidateGrid}>
              {supplierCandidates.map(([name, channel, fit, documents, decision]) => (
                <section key={name}>
                  <strong>{name}</strong>
                  <dl>
                    <div><dt>channel</dt><dd>{channel}</dd></div>
                    <div><dt>fit</dt><dd>{fit}</dd></div>
                    <div><dt>documents</dt><dd>{documents}</dd></div>
                    <div><dt>decision</dt><dd>{decision}</dd></div>
                  </dl>
                </section>
              ))}
            </div>
          </article>

          <article className={styles.offerBoard}>
            <div className={styles.boardHeader}>
              <p className={styles.eyebrow}>Offer Comparison Board</p>
              <h3>Выбор условий не прячется в переписке</h3>
            </div>
            <div className={styles.comparisonRows}>
              {offerComparison.map(([metric, input, status, owner]) => (
                <div key={metric}>
                  <strong>{metric}</strong>
                  <span>{input}</span>
                  <StatusPill value={status} />
                  <em>{owner}</em>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.contractSimulator}>
            <div className={styles.boardHeader}>
              <p className={styles.eyebrow}>Contract Decision Simulator</p>
              <h3>Договорная логика как decision board</h3>
            </div>
            <div className={styles.simulatorGrid}>
              {[
                ["payment scenario", "50/50 или 100% по согласованию"],
                ["delivery terms", "EXW / FCA / DAP как точки проверки"],
                ["evidence before payment", "bank details, material, pressure, PI delta-list"],
                ["evidence before shipment", "packing list, photo/video/nameplate"],
                ["contract strength", "draft RU/EN + boundary + open questions"],
              ].map(([label, value]) => (
                <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
              ))}
            </div>
          </article>

          <article className={styles.deliveryTimeline}>
            <div className={styles.boardHeader}>
              <p className={styles.eyebrow}>Delivery Timeline</p>
              <h3>Поставка как статусный pipeline</h3>
            </div>
            <div className={styles.timelineRows}>
              {deliveryTimeline.map(([phase, evidence, status]) => (
                <section key={phase}>
                  <StatusPill value={status} />
                  <strong>{phase}</strong>
                  <p>{evidence}</p>
                </section>
              ))}
            </div>
          </article>

          <article className={styles.workPlanBuilder}>
            <div className={styles.boardHeader}>
              <p className={styles.eyebrow}>Work Plan Builder</p>
              <h3>ППР skeleton для coordination draft</h3>
              <p>не заменяет официальный ППР. UPGRADE готовит coordination draft и передает материалы профильным участникам; заказчик и профильные подрядчики утверждают финальные решения.</p>
            </div>
            <div className={styles.workPlanGrid}>
              {workPlanItems.map(([title, content, owner]) => (
                <section key={title}>
                  <strong>{title}</strong>
                  <p>{content}</p>
                  <em>{owner}</em>
                </section>
              ))}
            </div>
          </article>

          <article className={styles.participantRoles}>
            <div className={styles.boardHeader}>
              <p className={styles.eyebrow}>Project Participants</p>
              <h3>Кто участвует без выдуманных имён</h3>
            </div>
            <div className={styles.roleGrid}>
              {participantRoles.map((role) => <span key={role}>{role}</span>)}
            </div>
          </article>

          <article className={styles.fieldBoard}>
            <div className={styles.boardHeader}>
              <p className={styles.eyebrow}>Field Execution Board</p>
              <h3>Задачи монтажной стороны в своей зоне ответственности</h3>
            </div>
            <div className={styles.fieldColumns}>
              {["Planned", "Ready", "In progress", "Needs evidence", "Blocked", "Done"].map((status) => (
                <section key={status}>
                  <h4>{status}</h4>
                  {fieldTasks.filter((task) => task[1] === status).map(([task, , evidence]) => (
                    <div key={task}>
                      <strong>{task}</strong>
                      <span>{evidence}</span>
                    </div>
                  ))}
                </section>
              ))}
            </div>
          </article>

          <article className={styles.evidenceWall}>
            <div className={styles.boardHeader}>
              <p className={styles.eyebrow}>Photo Evidence Wall</p>
              <h3>Evidence register без server upload</h3>
            </div>
            <div className={styles.evidenceGrid}>
              {evidenceCards.map(([phase, evidence, owner]) => (
                <section key={phase}>
                  <span aria-hidden="true" />
                  <strong>{phase}</strong>
                  <p>{evidence}</p>
                  <em>{owner}</em>
                </section>
              ))}
            </div>
          </article>

          <article className={styles.statusDashboard}>
            <div className={styles.boardHeader}>
              <p className={styles.eyebrow}>Implementation Status Dashboard</p>
              <h3>Готовность проекта по ключевым контурам</h3>
            </div>
            <div className={styles.metricGrid}>
              {implementationMetrics.map(([metric, value, note]) => (
                <section key={metric}>
                  <strong>{value}</strong>
                  <span>{metric}</span>
                  <p>{note}</p>
                </section>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className={styles.controlRoom} id="control-room" aria-labelledby="control-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Control Room поставки</p>
          <h2 id="control-title">Живой центр управления данными, статусами и handoff</h2>
          <p>UPGRADE управляет информационным контуром и точками эскалации. Фактические действия третьих лиц остаются в зоне ответственности соответствующих участников.</p>
        </div>
        <div className={styles.statusLine}>
          {statusLine.map(([name, status]) => <article key={name}><span>{name}</span><StatusPill value={status} /></article>)}
        </div>
        <div className={styles.controlGrid}>
          <div className={styles.participantMap}>
            {participants.map((item) => (
              <button key={item.name} type="button" data-active={activeParticipant === item.name} onClick={() => setActiveParticipant(item.name)}>
                {item.name}
              </button>
            ))}
          </div>
          <div className={styles.controlDetails}>
            {participants.map((item) => (
              <article key={`participant-${item.name}`} className={styles.controlDetail} hidden={activeParticipant !== item.name}>
                <h3>{item.name}</h3>
                <p>{item.flow}</p>
                <dl>
                  <div><dt>UPGRADE структурирует</dt><dd>{item.upgrade}</dd></div>
                  <div><dt>не UPGRADE утверждает</dt><dd>{item.outside}</dd></div>
                </dl>
              </article>
            ))}
          </div>
          <aside className={styles.nextActions}>
            <h3>Next best actions</h3>
            <ul>
              {["запросить packing data", "подтвердить pressure class", "запросить nameplate photo", "сверить broker input", "передать mounting questions"].map((item) => <li key={item}>{item}</li>)}
            </ul>
            <h3>External dependencies</h3>
            <ul>
              {["supplier response time", "factory production", "logistics availability", "broker/customs", "mounting contractor", "technical approval by WinGPro"].map((item) => <li key={item}>{item}</li>)}
            </ul>
          </aside>
        </div>
      </section>

      <section className={styles.routeMap} aria-labelledby="route-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Route Map</p>
          <h2 id="route-title">Маршрут поставки как управляемый data-flow</h2>
          <p>UPGRADE контролирует не транспорт как перевозчик, а информационную готовность маршрута.</p>
        </div>
        <div className={styles.routeFlow}>
          {routePoints.map((point) => (
            <button key={point.title} type="button" data-active={activeRoute === point.title} onClick={() => setActiveRoute(point.title)}>
              <span>{point.title}</span>
            </button>
          ))}
        </div>
        <div className={styles.routeCards}>
          {routePoints.map((point) => (
            <article key={`route-${point.title}`} className={styles.routeCard} hidden={activeRoute !== point.title}>
              <h3>{point.title}</h3>
              <dl>
                <div><dt>required data</dt><dd>{point.data}</dd></div>
                <div><dt>owner</dt><dd>{point.owner}</dd></div>
                <div><dt>UPGRADE action</dt><dd>{point.action}</dd></div>
                <div><dt>risk if missing</dt><dd>{point.risk}</dd></div>
                <div><dt>release gate</dt><dd>{point.gate}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.vault} id="vault" aria-labelledby="vault-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Document Vault</p>
          <h2 id="vault-title">Data-room как хранилище статусов, владельцев и evidence</h2>
        </div>
        <div className={styles.vaultControls}>
          <select aria-label="category" value={vaultCategory} onChange={(event) => setVaultCategory(event.target.value)}><option value="all">all categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
          <select aria-label="status" value={vaultStatus} onChange={(event) => setVaultStatus(event.target.value)}><option value="all">all statuses</option>{["missing", "requested", "collecting", "review", "ready"].map((item) => <option key={item}>{item}</option>)}</select>
          <select aria-label="owner" value={vaultOwner} onChange={(event) => setVaultOwner(event.target.value)}><option value="all">all owners</option>{owners.map((item) => <option key={item}>{item}</option>)}</select>
          <select aria-label="release gate" value={vaultGate} onChange={(event) => setVaultGate(event.target.value)}><option value="all">all gates</option>{gatesList.map((item) => <option key={item}>{item}</option>)}</select>
          <select aria-label="impact" value={vaultImpact} onChange={(event) => setVaultImpact(event.target.value)}><option value="all">all impacts</option>{["quality", "time", "commercial", "customs", "mounting"].map((item) => <option key={item}>{item}</option>)}</select>
        </div>
        <div className={styles.modeSwitch} role="group" aria-label="vault mode">
          {(["vault", "timeline", "owner", "missing"] as VaultMode[]).map((mode) => <button key={mode} type="button" aria-pressed={vaultMode === mode} onClick={() => setVaultMode(mode)}>{mode}</button>)}
        </div>
        <div className={styles.vaultGrid} data-mode={vaultMode}>
          {vaultDocs.map((doc) => {
            const [category, title, type, gate, owner, status, impact, quality, time, risk, action] = doc;
            return (
            <article key={`${category}-${title}`} hidden={!isDocVisible(doc)}>
              <div className={styles.docTop}><span>{category}</span><StatusPill value={status} /></div>
              <h3>{title}</h3>
              <dl>
                <div><dt>type</dt><dd>{type}</dd></div>
                <div><dt>release gate</dt><dd>{gate}</dd></div>
                <div><dt>owner</dt><dd>{owner}</dd></div>
                <div><dt>quality impact</dt><dd>{quality}</dd></div>
                <div><dt>time impact</dt><dd>{time}</dd></div>
                <div><dt>risk if absent</dt><dd>{risk}</dd></div>
                <div><dt>UPGRADE action</dt><dd>{action}</dd></div>
                <div><dt>impact</dt><dd>{impact}</dd></div>
              </dl>
            </article>
          );
          })}
          <p className={styles.emptyState} hidden={visibleDocs.length > 0}>No vault cards match the selected filters.</p>
        </div>
      </section>

      <section className={styles.riskRadar} id="risk-radar" aria-labelledby="risk-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Risk Radar</p>
          <h2 id="risk-title">Риски как координационный response pack</h2>
        </div>
        <div className={styles.riskFilters} role="group" aria-label="risk impact filter">
          {(["all", "quality", "time", "financial", "dependency"] as Array<RiskImpact | "all">).map((item) => <button key={item} type="button" aria-pressed={riskImpact === item} onClick={() => setRiskImpact(item)}>{item}</button>)}
        </div>
        <div className={styles.radarGrid}>
          <div className={styles.radarPlane} aria-label="Risk impact matrix">
            <span>Quality impact</span><span>Time impact</span><span>Financial exposure</span><span>Dependency risk</span>
            {risks.map((item) => (
              <button key={item.id} type="button" hidden={riskImpact !== "all" && item.impact !== riskImpact} style={{ left: `${item.x}%`, top: `${item.y}%` }} data-severity={item.severity} aria-pressed={activeRisk === item.id} onClick={() => setActiveRisk(item.id)}>
                {item.title}
              </button>
            ))}
          </div>
          <div className={styles.riskDetails}>
            {risks.map((item) => (
              <article key={`risk-${item.id}`} className={styles.riskDetail} hidden={activeRisk !== item.id}>
                <StatusPill value={item.severity} />
                <h3>{item.title}</h3>
                <dl>
                  <div><dt>impact group</dt><dd>{item.impact}</dd></div>
                  <div><dt>evidence request</dt><dd>{item.evidence}</dd></div>
                  <div><dt>owner</dt><dd>{item.owner}</dd></div>
                  <div><dt>escalation</dt><dd>{item.escalation}</dd></div>
                  <div><dt>UPGRADE boundary</dt><dd>{item.boundary}</dd></div>
                </dl>
                <div className={styles.responsePack}>
                  <h4>Risk response pack</h4>
                  <ul>
                    <li>questions to supplier</li>
                    <li>documents to request</li>
                    <li>decision needed from WinGPro</li>
                    <li>handoff needed to broker/logistics/mounting</li>
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.releaseGates} aria-labelledby="gates-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Release gates</p>
          <h2 id="gates-title">Поставка как pipeline готовности данных</h2>
          <p>UPGRADE контролирует готовность данных и статусный контур, а не принимает на себя действия третьих лиц.</p>
        </div>
        <div className={styles.gatePipeline}>
          {gates.map((gate, index) => <button key={gate[0]} type="button" data-active={activeGate === index} onClick={() => setActiveGate(index)}>{gate[0]}</button>)}
        </div>
        <div className={styles.gateDetails}>
          {gates.map((gate, index) => (
            <article key={`gate-${gate[0]}`} className={styles.gateDetail} hidden={activeGate !== index}>
              <h3>{gate[0]}</h3>
              <dl>
                <div><dt>objective</dt><dd>{gate[1]}</dd></div>
                <div><dt>required evidence</dt><dd>{gate[2]}</dd></div>
                <div><dt>owner</dt><dd>{gate[3]}</dd></div>
                <div><dt>UPGRADE action</dt><dd>{gate[4]}</dd></div>
                <div><dt>blocked if</dt><dd>{gate[5]}</dd></div>
                <div><dt>output artifact</dt><dd>{gate[6]}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.statusOfCustomer} aria-labelledby="customer-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>WinGPro как заказчик высокого уровня</p>
          <h2 id="customer-title">Процесс выглядит как зрелый procurement management</h2>
        </div>
        <div className={styles.beforeAfter}>
          <article><h3>Before</h3><ul>{["scattered messages", "late questions", "unclear responsibility", "missing evidence", "reactive decisions"].map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article><h3>After</h3><ul>{["structured request", "documented decisions", "status ownership", "evidence before payment/shipment", "proactive handoff"].map((item) => <li key={item}>{item}</li>)}</ul></article>
        </div>
      </section>

      <section className={styles.handoverRoom} id="handover" aria-labelledby="handover-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Handover Room</p>
          <h2 id="handover-title">Что получает каждая сторона</h2>
        </div>
        <div className={styles.packTabs}>
          {handoverPacks.map((item) => <button key={item[0]} type="button" aria-pressed={activePack === item[0]} onClick={() => setActivePack(item[0])}>{item[0]}</button>)}
        </div>
        <div className={styles.packDetails}>
          {handoverPacks.map((item) => (
            <article key={`pack-${item[0]}`} className={styles.packDetail} hidden={activePack !== item[0]}>
              <h3>{item[0]}</h3>
              <dl>
                <div><dt>what is inside</dt><dd>{item[1]}</dd></div>
                <div><dt>format</dt><dd>{item[2]}</dd></div>
                <div><dt>owner</dt><dd>{item[3]}</dd></div>
                <div><dt>when delivered</dt><dd>{item[4]}</dd></div>
                <div><dt>practical value</dt><dd>{item[5]}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.acceptance} aria-labelledby="acceptance-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Решение к согласованию</p>
          <h2 id="acceptance-title">Acceptance is based on deliverables</h2>
        </div>
        <div className={styles.acceptanceGrid}>
          <article className={styles.decisionCard}>
            <strong>3 000 000 ₸ без НДС</strong>
            <span>единый комплекс</span>
            <div className={styles.paymentSwitch} role="group" aria-label="payment mode">
              <button type="button" aria-pressed={paymentMode === "split"} onClick={() => setPaymentMode("split")}>50/50</button>
              <button type="button" aria-pressed={paymentMode === "full"} onClick={() => setPaymentMode("full")}>100%</button>
            </div>
            <p>{paymentMode === "split" ? "1 500 000 ₸ старт / 1 500 000 ₸ перед передачей результата." : "3 000 000 ₸ единым платежом при согласовании."}</p>
          </article>
          <article>
            <h3>что считается результатом</h3>
            <ul>{["data-room index", "risk register", "release gate board", "handover packs", "digital supplier/product card", "copy-ready executive summary"].map((item) => <li key={item}>{item}</li>)}</ul>
            <p>Оборудование, доставка, пошлины, брокер, сертификация, монтаж, ПНР, инспекция и банковские комиссии не входят.</p>
          </article>
        </div>
      </section>

      <section className={styles.copyPackage} aria-labelledby="copy-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Board Pack</p>
          <h2 id="copy-title">Сообщения для отправки</h2>
        </div>
        <div className={styles.copyButtons}>
          {[
            ["short", "Copy 30-second summary"],
            ["executive", "Copy executive message"],
            ["boundary", "Copy scope boundary"],
            ["deliverables", "Copy deliverables list"],
            ["payment", "Copy payment terms"],
            ["next", "Copy next step"],
          ].map(([variant, label]) => <button key={variant} type="button" data-active={copyVariant === variant} onClick={() => copyBoardText(variant as CopyVariant)}>{label}</button>)}
        </div>
        <textarea ref={copyRef} className={styles.copySource} value={copyTexts[copyVariant]} readOnly hidden />
        <p aria-live="polite" data-copy-status>{copyStatus}</p>
        <p className={styles.legalNote}>UPGRADE — IT/data и закупочно-координационный партнер. UPGRADE не является поставщиком оборудования; не является производителем; не является проектировщиком; не является монтажной организацией; не является ПНР-подрядчиком, техническим надзором, брокером, перевозчиком, сертификационным органом или юридическим консультантом.</p>
        <p className={styles.pathNote}>Canonical: {proposalPath}</p>
      </section>
    </div>
  );
}
