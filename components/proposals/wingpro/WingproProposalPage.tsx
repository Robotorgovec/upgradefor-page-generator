"use client";

import type { FormEvent as ReactFormEvent, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";

import styles from "./WingproProposalPage.module.css";
import {
  HEXNOVAS_RECOMMENDED_VARIANT_ID,
  hexnovasArchiveGroups,
  hexnovasDocumentSignals,
  hexnovasPackageRules,
  hexnovasProject,
  hexnovasRiskControls,
  hexnovasTimeline,
  hexnovasVariants,
  hexnovasVaultTraceRows,
  type HexnovasVariantId,
} from "./wingproHexnovasProcurement";
import {
  purchasedPumpAssignments,
  purchasedPumpEvidenceRequests,
  sourceDocuments,
  sourceDocumentInsights,
  sourceTraceabilityRows,
  type SourceDocument,
} from "./wingproSourceDocuments";

type TwinLayerId = "equipment" | "specification" | "documents" | "delivery" | "installation" | "sales";
type SceneId = "source" | "verify" | "negotiate" | "contract" | "produce" | "ship" | "handover" | "reuse";
type ControlStepId = "supplier" | "offer" | "contract" | "delivery" | "workplan" | "field" | "closeout";
type SupplierCandidateId = "candidate-a" | "candidate-b" | "candidate-c";
type OfferDecisionMode = "evidence" | "terms" | "speed";
type ContractScenarioId = "balanced" | "evidence-first" | "speed-sensitive";
type DeliveryPhaseId = "release" | "production" | "factory" | "preshipment" | "logistics" | "broker" | "arrival" | "mounting";
type VaultMode = "vault" | "timeline" | "owner" | "missing";
type RiskImpact = "quality" | "time" | "decision" | "dependency";
type CopyVariant = "short" | "executive" | "command" | "boundary" | "deliverables" | "payment" | "next" | "addons";
type PresentationModeId = "executive" | "supplier" | "contract" | "delivery" | "workplan" | "handover" | "addons";

const HEXNOVAS_DECISION_EMAIL = "info@upgradefor.com";
const WINGPRO_ACCESS_PASSWORD = "1111";
const WINGPRO_ACCESS_STORAGE_KEY = "wingpro-2605281047-access";
const WINGPRO_TECHNICAL_PAGE_TITLE = "WinGPro technical cockpit and data-room | UPGRADE";

const twinLayers = [
  {
    id: "equipment",
    title: "Оборудование",
    data: ["рекомендуемый маршрут TH150B / 316L", "количество 2 шт.", "материал AISI 316L", "pressure drop 24.0 / 29.9 kPa", "BH150B PI/drawing update required", "габариты/вес pending/confirmed"],
    value: "товарная позиция получает единый технический профиль вместо фрагментов переписки",
    risk: "снижение вероятности ошибки по модели, материалу, давлению или комплектности",
    deliverable: "карточка оборудования",
    owner: "поставщик / тех. владелец WinGPro",
    gate: "Gate 1 — готовность evidence",
    readiness: "62%",
    evidence: "подтверждение модели, количества, материала и давления",
  },
  {
    id: "specification",
    title: "Спецификация",
    data: ["исходные параметры", "технические вопросы", "подтверждение материала", "подтверждение давления", "чертеж", "параметры для профильной проверки"],
    value: "профильные специалисты WinGPro получают структурированные вводные для проверки",
    risk: "технические решения не принимаются на базе устных сообщений",
    deliverable: "чек-лист technical evidence",
    owner: "ответственный технический специалист",
    gate: "Gate 2 — до подтверждения производства",
    readiness: "48%",
    evidence: "чертеж, открытые технические вопросы, владелец проверки",
  },
  {
    id: "documents",
    title: "Документы",
    data: ["PI", "specification", "drawing", "packing list", "commercial invoice", "certificate of origin", "material certificates", "warranty certificate", "photo/video/nameplate"],
    value: "документы превращаются в Document Vault с owner, status и release gate",
    risk: "снижение риска позднего запроса критичных файлов перед release decision или отгрузкой",
    deliverable: "индекс Document Vault",
    owner: "поставщик / координатор данных UPGRADE",
    gate: "Gate 1-3",
    readiness: "41%",
    evidence: "PI, спецификация, чертеж, сертификаты, shipment photos",
  },
  {
    id: "delivery",
    title: "Поставка",
    data: ["factory contact", "EXW/FCA/DAP logic", "pickup data", "weight/dimensions", "broker input", "logistics handoff"],
    value: "маршрут поставки читается как data-flow, а не как набор разрозненных сообщений",
    risk: "логист и брокер получают пакет до операционных точек передачи",
    deliverable: "delivery data-flow pack",
    owner: "логист / брокер / поставщик",
    gate: "Gate 4 — до customs/logistics handoff",
    readiness: "38%",
    evidence: "pickup data, packing, вес/габариты, broker input list",
  },
  {
    id: "installation",
    title: "Монтажные вводные",
    data: ["точки подключения", "service access", "габариты", "mounting questions", "owner for technical approval", "coordination pack"],
    value: "монтажная сторона получает вводные заранее и видит открытые вопросы",
    risk: "снижение вероятности поздних уточнений на площадке",
    deliverable: "mounting coordination pack",
    owner: "монтажная сторона / technical owner",
    gate: "Gate 5 — до mounting handoff",
    readiness: "35%",
    evidence: "точки подключения, сервисные зоны, монтажные вопросы",
  },
  {
    id: "sales",
    title: "Товарная карточка",
    data: ["supplier profile", "product card", "document links", "repeat purchase notes", "future sales brief", "Kazakhstan resale base"],
    value: "поставка не исчезает после сделки, а становится reusable digital product asset",
    risk: "следующая закупка или продажа не начинается с нуля",
    deliverable: "цифровые карточки поставщика и товара",
    owner: "WinGPro / UPGRADE",
    gate: "Gate 7 — reuse в sales pipeline",
    readiness: "44%",
    evidence: "карточка поставщика, product card, ссылки на документы",
  },
] as const;

const twinHotspots = [
  { label: "материал", layer: "equipment", note: "подтверждение материала" },
  { label: "давление", layer: "specification", note: "owner pressure class" },
  { label: "PI / чертеж", layer: "documents", note: "document evidence" },
  { label: "упаковка", layer: "delivery", note: "вес и габариты" },
  { label: "подключения", layer: "installation", note: "монтажные вводные" },
  { label: "карточка", layer: "sales", note: "future product asset" },
] as const satisfies ReadonlyArray<{
  label: string;
  layer: TwinLayerId;
  note: string;
}>;

const twinConnectionCues = [
  { label: "Патрубки", detail: "4 фланцевых вывода", tone: "ports", x: "83%", y: "48%" },
  { label: "EG 40% · 5/10°C", detail: "исходный режим", tone: "warm", x: "77%", y: "69%" },
  { label: "Вода · 7/12°C", detail: "исходный режим", tone: "cold", x: "22%", y: "69%" },
  { label: "Сервисная зона", detail: "подтверждает монтажная сторона", tone: "clearance", x: "22%", y: "34%" },
] as const;

const twinInterfaceRows = [
  {
    label: "EG 40% · 5/10°C",
    input: "исходный режим холодоносителя из ХС-схем",
    action: "передать поставщику для сверки подбора и pressure/material evidence",
    owner: "тех. владелец WinGPro / поставщик",
  },
  {
    label: "Вода · 7/12°C",
    input: "входной температурный контур для проверки применимости ПТО",
    action: "связать с specification request и открытыми technical questions",
    owner: "ответственный технический специалист",
  },
  {
    label: "4 фланцевых патрубка",
    input: "точки подключения: DN/PN, orientation, drawing, gasket/material",
    action: "запросить connection drawing и packing/dimensions до handoff",
    owner: "поставщик / монтажная сторона",
  },
  {
    label: "Сервисная зона",
    input: "габариты, доступ и зона обслуживания вокруг теплообменника",
    action: "передать как mounting coordination input, не как утвержденный ППР",
    owner: "монтажная сторона / тех. владелец",
  },
] as const;

const scenes = [
  { id: "source", layer: "equipment", title: "Источник", status: "сбор данных", control: "канал поставщика и контактная карта", receives: "профиль поставщика", risk: "неясная роль производителя/трейдера" },
  { id: "verify", layer: "specification", title: "Проверка", status: "нужен owner", control: "вопросы по материалу, давлению, модели и чертежу", receives: "чек-лист technical evidence", risk: "параметры теряются в переписке" },
  { id: "negotiate", layer: "documents", title: "Согласование", status: "сбор данных", control: "PI, delta-list и release readiness", receives: "журнал решений", risk: "слабые условия PI" },
  { id: "contract", layer: "documents", title: "Договорная логика", status: "внешняя зависимость", control: "draft RU/EN и граница ответственности", receives: "пакет вводных для договора", risk: "устные договоренности без owner" },
  { id: "produce", layer: "specification", title: "Производство", status: "план", control: "подтверждения производства и evidence request", receives: "трекер подтверждений", risk: "производственный статус непрозрачен" },
  { id: "ship", layer: "delivery", title: "Отгрузка", status: "есть риск", control: "packing, dimensions, photo/video/nameplate", receives: "board готовности к отгрузке", risk: "нет данных для логиста/брокера" },
  { id: "handover", layer: "installation", title: "Передача вводных", status: "план", control: "broker, logistics и mounting inputs", receives: "handover room packs", risk: "участники получают вводные поздно" },
  { id: "reuse", layer: "sales", title: "Повторное использование", status: "план", control: "карточка поставщика, product card и sales brief", receives: "Digital Product Asset", risk: "позиция исчезает после разовой закупки" },
] as const;

const projectControlScale = [
  {
    id: "supplier",
    title: "Supplier Search",
    result: "запросы поставщикам, candidate cards, shortlist и selected logic",
    decision: "WinGPro видит, почему канал попал в shortlist и какие вопросы открыты",
    artifact: "Supplier Request Lab",
    status: "collecting evidence",
    owner: "UPGRADE procurement/data",
    nextAction: "сверить manufacturer/trader status и запросить material/pressure evidence",
    handoff: "shortlist rationale + open questions",
    anchor: "supplier-request-lab",
    spineSignal: "source request active",
  },
  {
    id: "offer",
    title: "Offer Selection",
    result: "сравнение technical fit, document readiness, release risk и delivery readiness",
    decision: "условия выбора видны как board, а не как фрагменты переписки",
    artifact: "Offer Comparison Board",
    status: "decision support",
    owner: "WinGPro decision owner",
    nextAction: "сопоставить technical fit, release risk и document readiness перед выбором",
    handoff: "comparison board + recommendation note",
    anchor: "offer-comparison-board",
    spineSignal: "selection logic visible",
  },
  {
    id: "contract",
    title: "Contract Decision",
    result: "release scenario, delivery terms, evidence gates, responsibility boundary",
    decision: "WinGPro согласует evidence gates и условия, снижающие операционные риски",
    artifact: "Contract Decision Simulator",
    status: "owner required",
    owner: "WinGPro / counsel if engaged",
    nextAction: "выбрать release path и evidence gates до отгрузки/handover",
    handoff: "draft terms + boundary notes",
    anchor: "contract-decision-simulator",
    spineSignal: "terms require owner decision",
  },
  {
    id: "delivery",
    title: "Delivery Control",
    result: "release readiness, production confirmation, factory status, packing data, logistics/broker handoff",
    decision: "поставка читается как статусный контур с blockers и owners",
    artifact: "Delivery Timeline",
    status: "release tracking",
    owner: "supplier / logistics / broker",
    nextAction: "запросить packing data, pickup contacts и photo/video/nameplate до отгрузки",
    handoff: "shipment readiness board",
    anchor: "delivery-timeline",
    spineSignal: "shipment blockers visible",
  },
  {
    id: "workplan",
    title: "Work Plan / ППР Draft",
    result: "work zones, stages, checklist, blockers, photo required, status",
    decision: "монтажная сторона получает coordination draft, но финальный ППР утверждают профильные участники",
    artifact: "Work Plan Builder / ППР skeleton",
    status: "coordination draft",
    owner: "mounting / technical side",
    nextAction: "передать connection points, dimensions, access/service questions профильной стороне",
    handoff: "ППР skeleton, не официальный ППР",
    anchor: "work-plan-builder",
    spineSignal: "coordination draft only",
  },
  {
    id: "field",
    title: "Field Execution",
    result: "task board, evidence required, photo report, open items",
    decision: "исполнение отмечается монтажной стороной в своей зоне ответственности",
    artifact: "Field Execution Board",
    status: "external execution",
    owner: "mounting contractor lead",
    nextAction: "зафиксировать tasks, blockers и required photo evidence без принятия монтажных работ UPGRADE",
    handoff: "field task log + evidence checklist",
    anchor: "field-execution-board",
    spineSignal: "external execution tracked",
  },
  {
    id: "closeout",
    title: "Handover & Reuse",
    result: "handover register, photo evidence register, open issues, digital product card",
    decision: "результат остается как Digital Product Asset для повторных закупок и продаж",
    artifact: "Handover & Closeout",
    status: "closeout package",
    owner: "UPGRADE / WinGPro",
    nextAction: "собрать data-room index, risk register, handover packs и digital product card",
    handoff: "closeout pack + reusable sales asset",
    anchor: "handover",
    spineSignal: "closeout package",
  },
] as const satisfies ReadonlyArray<{
  id: ControlStepId;
  title: string;
  result: string;
  decision: string;
  artifact: string;
  status: string;
  owner: string;
  nextAction: string;
  handoff: string;
  anchor: string;
  spineSignal: string;
}>;

const controlSnapshot = [
  {
    label: "Supplier visibility",
    value: "3 channels",
    detail: "shortlist / reserve / watch separated by evidence quality",
    signal: "source request active",
  },
  {
    label: "Decision quality",
    value: "5 criteria",
    detail: "technical fit, documents, release risk, delivery readiness, recommendation",
    signal: "owner decision required",
  },
  {
    label: "Contract release",
    value: "3 scenarios",
    detail: "balanced, evidence-first and speed-sensitive compared without hiding blockers",
    signal: "evidence gates attached",
  },
  {
    label: "Implementation path",
    value: "7 boards",
    detail: "delivery, work plan draft, field tasks, evidence, closeout and reuse",
    signal: "handover-ready contour",
  },
] as const;

const supplierCandidates = [
  {
    id: "candidate-a",
    name: "Candidate A",
    channel: "manufacturer channel",
    score: 84,
    status: "shortlist",
    recommendation: "selected candidate after evidence gates",
    rationale: "лучший баланс model fit, прямого канала и готовности к структурированному evidence request",
    decisionSignal: "selected path if evidence gates close before release",
    blockers: ["pressure class evidence", "packing dimensions", "pre-shipment nameplate/photo/video"],
    nextEvidence: "material + pressure confirmation, then PI/release terms delta-list",
    handoffValue: "WinGPro получает shortlist rationale и список вопросов, которые надо закрыть до следующего release step",
    criteria: [
      ["technical fit", "TH150B-381H / 2 units baseline", "86"],
      ["document readiness", "PI + specification draft", "72"],
      ["release risk", "bank/material evidence requested", "68"],
      ["delivery readiness", "packing data pending", "58"],
    ],
    openRequests: ["material confirmation", "pressure class confirmation", "nameplate/photo/video before shipment", "packing list + dimensions"],
  },
  {
    id: "candidate-b",
    name: "Candidate B",
    channel: "trader channel",
    score: 67,
    status: "reserve",
    recommendation: "reserve until contract delta-list is closed",
    rationale: "может быть полезен как terms check, но роль трейдера, bank details и delivery evidence требуют отдельной проверки",
    decisionSignal: "reserve path for terms benchmark and fallback negotiation",
    blockers: ["manufacturer/trader role", "bank details", "drawing and factory contact"],
    nextEvidence: "manufacturer clarification, bank details confirmation, delivery terms EXW/FCA/DAP",
    handoffValue: "WinGPro видит, почему канал нельзя вести как основной без дополнительных доказательств",
    criteria: [
      ["technical fit", "model match requires factory confirmation", "71"],
      ["document readiness", "PI received, drawing missing", "54"],
      ["release risk", "bank details missing", "42"],
      ["delivery readiness", "pickup owner unclear", "46"],
    ],
    openRequests: ["manufacturer/trader clarification", "bank details confirmation", "factory contact", "delivery terms EXW/FCA/DAP"],
  },
  {
    id: "candidate-c",
    name: "Candidate C",
    channel: "factory contact pending",
    score: 52,
    status: "watch",
    recommendation: "watch only until response speed improves",
    rationale: "канал может дать альтернативу, но текущий response time создает риск для сроков согласования и handoff",
    decisionSignal: "watch path only if response SLA and technical sheet arrive",
    blockers: ["response SLA", "technical sheet", "export document checklist"],
    nextEvidence: "supplier profile, pressure evidence and export document checklist",
    handoffValue: "WinGPro получает ранний сигнал, что канал может замедлить согласования",
    criteria: [
      ["technical fit", "pressure evidence required", "60"],
      ["document readiness", "documents not structured", "38"],
      ["release risk", "terms unknown", "40"],
      ["delivery readiness", "packing/logistics data absent", "32"],
    ],
    openRequests: ["supplier profile", "response SLA", "technical sheet", "export document checklist"],
  },
] as const satisfies ReadonlyArray<{
  id: SupplierCandidateId;
  name: string;
  channel: string;
  score: number;
  status: string;
  recommendation: string;
  rationale: string;
  decisionSignal: string;
  blockers: ReadonlyArray<string>;
  nextEvidence: string;
  handoffValue: string;
  criteria: ReadonlyArray<readonly [string, string, string]>;
  openRequests: ReadonlyArray<string>;
}>;

const supplierRequestQueue = [
  ["Identity", "supplier profile, manufacturer/trader role, contact map", "before shortlist"],
  ["Technical", "material, pressure class, TH150B-381H route, BH150B drawing update request", "before release"],
  ["Release input", "PI, Incoterms, delivery terms, contract delta-list", "inside contract decision board"],
  ["Evidence", "photo/video/nameplate, packing list, weight/dimensions", "before shipment"],
] as const;

const supplierOperatingSignals = [
  ["Source clarity", "manufacturer/trader role is separated before shortlist", "prevents hidden channel assumptions"],
  ["Evidence gap", "material, pressure, bank and shipment media are tracked as open requests", "keeps release readiness visible"],
  ["Release readiness", "shortlist is conditional until Gate 1 and Gate 3 evidence is visible", "turns selection into stop/go logic"],
  ["WinGPro value", "supplier rationale and blockers are ready for internal discussion", "reduces repeat questions inside the team"],
] as const;

const offerComparison = [
  {
    metric: "Technical fit",
    candidateA: "86 / model match, pressure evidence requested",
    candidateB: "71 / factory confirmation required",
    candidateC: "60 / pressure evidence missing",
    decisionSignal: "Candidate A leads, but technical owner approval remains required",
    owner: "WinGPro / technical owner",
  },
  {
    metric: "Document readiness",
    candidateA: "72 / PI + specification draft",
    candidateB: "54 / drawing missing",
    candidateC: "38 / documents not structured",
    decisionSignal: "A has the best data-room entry point",
    owner: "UPGRADE tracks",
  },
  {
    metric: "Release risk",
    candidateA: "68 / bank and material evidence requested",
    candidateB: "42 / bank details missing",
    candidateC: "40 / terms unknown",
    decisionSignal: "no next-step recommendation before evidence gate",
    owner: "WinGPro decision",
  },
  {
    metric: "Delivery readiness",
    candidateA: "58 / packing pending",
    candidateB: "46 / pickup owner unclear",
    candidateC: "32 / logistics data absent",
    decisionSignal: "route handoff depends on packing data",
    owner: "supplier / logistics",
  },
  {
    metric: "Recommendation",
    candidateA: "conditional selected candidate",
    candidateB: "reserve",
    candidateC: "watch",
    decisionSignal: "select A only through evidence-led release gates",
    owner: "decision log",
  },
] as const;

const offerDecisionGates = [
  ["Technical gate", "model, material, pressure and drawing evidence", "responsible technical specialist"],
  ["Release gate", "PI, bank details, release scenario and unresolved blockers", "WinGPro decision owner"],
  ["Shipment gate", "packing, dimensions, photo/video/nameplate and invoice draft", "supplier / logistics"],
  ["Handoff gate", "comparison board, recommendation note and open questions", "UPGRADE transfers structure"],
] as const;

const offerDecisionModes = [
  {
    id: "evidence",
    title: "Evidence-led",
    score: "strongest",
    summary: "выбор строится вокруг подтверждений до следующего release step и до отгрузки",
    impact: "снижает вероятность ошибок по материалу, давлению, документам и логистическим вводным",
    ownerDecision: "WinGPro выбирает поставщика после закрытия evidence gates профильными участниками",
    risksControlled: ["material / pressure mismatch", "weak PI before release", "missing shipment evidence"],
    handoffOutput: "offer comparison board + evidence-led recommendation + open questions list",
  },
  {
    id: "terms",
    title: "Terms-led",
    score: "requires caution",
    summary: "условия сравниваются только вместе с PI strength, bank evidence и delivery terms",
    impact: "слабые условия без evidence переносят риск в release и логистическое решение",
    ownerDecision: "WinGPro может использовать условия как benchmark, но не как единственный критерий release",
    risksControlled: ["weak terms trap", "unclear trader margin", "bank/details gap"],
    handoffOutput: "contract delta-list + reserve supplier notes + release risk memo",
  },
  {
    id: "speed",
    title: "Speed-led",
    score: "conditional",
    summary: "скорость ответа полезна, если не пропускает quality gates и documents gate",
    impact: "помогает сократить потери времени на согласования, но не заменяет проверки",
    ownerDecision: "WinGPro решает, допустим ли speed-first путь без пропуска обязательных доказательств",
    risksControlled: ["late clarifications", "rushed technical confirmation", "shipment data delay"],
    handoffOutput: "fast-track checklist + owner-required blockers + release gate notes",
  },
] as const satisfies ReadonlyArray<{
  id: OfferDecisionMode;
  title: string;
  score: string;
  summary: string;
  impact: string;
  ownerDecision: string;
  risksControlled: ReadonlyArray<string>;
  handoffOutput: string;
}>;

const contractScenarios = [
  {
    id: "balanced",
    title: "Balanced evidence path",
    releaseReadiness: "release path: technical and contractual evidence gates are visible before the next project step",
    deliveryTerms: "FCA/DAP logic сравнивается с pickup responsibility и broker input",
    evidenceBeforeRelease: "PI, bank details, material confirmation, pressure class, open questions list",
    evidenceBeforeShipment: "packing list, weight/dimensions, nameplate/photo/video, commercial invoice draft",
    contractStrength: "high if evidence gates and responsibility boundary are attached",
    acceptanceImpact: "handover is based on deliverables: data-room, risk register, release board, handover packs",
    decisionSignal: "recommended evidence frame for current КП",
    ownerRequiredDecision: "approve release path and attach evidence gates to the coordination package",
    evidenceGateStrength: "balanced: next stage can start while before-shipment blockers remain visible",
    unresolvedBlockers: ["packing dimensions before shipment", "photo/video/nameplate before release", "broker/logistics input owner"],
    acceptanceHandoff: "release summary + evidence readiness board + deliverables handover list",
  },
  {
    id: "evidence-first",
    title: "Evidence-first",
    releaseReadiness: "release decision waits for stronger evidence",
    deliveryTerms: "delivery terms stay open until pickup/export documents are mapped",
    evidenceBeforeRelease: "supplier profile, bank details, material/pressure evidence, technical owner questions",
    evidenceBeforeShipment: "photo/video/nameplate and packing data become shipment blockers",
    contractStrength: "strongest for risk visibility, slower if supplier response is weak",
    acceptanceImpact: "best fit when WinGPro wants maximum document traceability before release gates",
    decisionSignal: "use when technical or release risk is higher than speed pressure",
    ownerRequiredDecision: "delay next-stage release until supplier identity, bank and technical evidence are stronger",
    evidenceGateStrength: "strongest: evidence blockers become explicit stop/go conditions",
    unresolvedBlockers: ["technical owner questions", "bank details confirmation", "material/pressure evidence"],
    acceptanceHandoff: "evidence-first release memo + stronger risk register + open questions escalation list",
  },
  {
    id: "speed-sensitive",
    title: "Speed-sensitive",
    releaseReadiness: "release decision can move faster, but evidence gaps stay visible as blockers",
    deliveryTerms: "delivery terms prioritize logistics handoff and pickup readiness",
    evidenceBeforeRelease: "minimum PI/bank/material/pressure evidence, with explicit unresolved list",
    evidenceBeforeShipment: "packing list and photo/nameplate remain mandatory handoff inputs",
    contractStrength: "conditional: speed improves coordination only if blockers are not hidden",
    acceptanceImpact: "useful when schedule pressure exists, but profile owners still approve final decisions",
    decisionSignal: "use only with visible risk register and WinGPro approval owner",
    ownerRequiredDecision: "approve faster next-stage movement while keeping unresolved evidence visible as blockers",
    evidenceGateStrength: "conditional: speed is acceptable only when hidden-risk shortcuts are not used",
    unresolvedBlockers: ["minimum PI/bank evidence", "explicit unresolved list", "shipment evidence before handoff"],
    acceptanceHandoff: "fast-track decision note + owner-required blockers + shipment handoff checklist",
  },
] as const satisfies ReadonlyArray<{
  id: ContractScenarioId;
  title: string;
  releaseReadiness: string;
  deliveryTerms: string;
  evidenceBeforeRelease: string;
  evidenceBeforeShipment: string;
  contractStrength: string;
  acceptanceImpact: string;
  decisionSignal: string;
  ownerRequiredDecision: string;
  evidenceGateStrength: string;
  unresolvedBlockers: ReadonlyArray<string>;
  acceptanceHandoff: string;
}>;

const contractGateMatrix = [
  ["Release scenario", "balanced / evidence-first / speed-sensitive", "WinGPro", "owner approval", "UPGRADE structures options"],
  ["Delivery terms", "EXW / FCA / DAP", "Supplier / logistics", "pickup and handoff clarity", "UPGRADE maps data impact"],
  ["Evidence before release", "PI, bank, material, pressure", "Supplier / WinGPro", "release readiness", "UPGRADE prepares request board"],
  ["Evidence before shipment", "packing, dimensions, photo/video/nameplate", "Supplier", "shipment readiness", "UPGRADE tracks blockers"],
  ["Contract boundary", "scope, exclusions, third-party roles", "WinGPro / counsel if engaged", "responsibility clarity", "UPGRADE prepares draft inputs"],
] as const;

const contractValueControls = [
  ["Source logic", "contract choices are tied to data-room, risk register, release gates and handover packs", "technical evidence, owner approvals and handoff artifacts"],
  ["Decision quality", "release choices are linked to evidence gates, open blockers and owner-required approvals", "PI/bank/material/pressure before release, packing/photo/video before shipment"],
  ["Time discipline", "structured questions reduce repeated clarification loops and make late blockers visible earlier", "owner-required statuses, next-best actions and release readiness signals"],
  ["Handover clarity", "result review is tied to transferred artifacts, not to physical results of third parties", "delivery board, digital supplier/product card and executive technical summary"],
] as const;

const acceptanceGuardrails = [
  ["Accepted by deliverables", "приемка результата осуществляется по deliverables", "data-room index, risk register, release board, handover packs and digital supplier/product cards"],
  ["Not accepted by third-party outcomes", "manufacturer, carrier, broker, customs, mounting side and certification actions stay external", "tracked as external dependencies, not UPGRADE closeout review criteria"],
  ["External costs excluded", "equipment, delivery, duties, VAT, broker, certification, mounting, PNR, inspection and bank commissions", "outside UPGRADE service fee; logistics is not included in the percentage base"],
  ["Decision owner remains WinGPro", "format, technical risk acceptance and next project movement are confirmed by WinGPro", "UPGRADE structures evidence, options and handoff materials"],
] as const;

const commercialBasisRows = [
  ["Equipment-only база", "Процент считается от стоимости заказа оборудования: выбранные теплообменники, насосные позиции и supplier equipment package.", "Логистика, брокер, пошлины, НДС, доставка, монтаж, ПНР и технадзор не входят в базу расчета."],
  ["Рыночный ориентир", "Для sourcing, supplier search и procurement coordination рыночная комиссия или скрытая маржа обычно выше 10%.", "В этом КП UPGRADE фиксирует открытые 10% как service fee за понятный набор deliverables."],
  ["Прозрачная ставка", "UPGRADE не прячет комиссию в логистике, пересчете доставки или внешних платежах.", "Заказчик видит прямую ставку за поиск, переговоры, технические вопросы, документы и decision package."],
  ["Почему это проверяемо", "Каждый процент связан с видимым результатом: supplier shortlist, decision board, evidence requests, PI/GA updates, risk register и handover pack.", "Заказчик видит, за что платит, без скрытой логистической наценки."],
] as const;

const commercialFeeRows = [
  ["5%", "Поиск поставщика", "поиск канала, primary shortlist, supplier identity, первичная проверка модели, материала, pressure class и readiness документов", "доказательства: shortlist, supplier profile, evidence request, archive index"],
  ["5%", "Переговоры и техническо-договорный контур", "обсуждение цены, технических вопросов, PI / GA drawing / материала, условий договора и release readiness до решения WinGPro", "доказательства: decision board, request log, PI/GA update queue, risk register"],
  ["10%", "Итого UPGRADE services", "открытая ставка за IT/data и закупочно-координационное сопровождение; без логистики, брокера, доставки, пошлин, НДС, монтажа и ПНР", "рыночный ориентир часто выше 10%; здесь зафиксированы открытые 10% за наши услуги"],
] as const;

const commercialProofRows = [
  ["Supplier evidence", "Hexnovas / альтернативы / документы поставщика", "работа не сводится к контакту: проверяются модель, материал, pressure drop, PI, GA drawing и evidence readiness"],
  ["Decision board", "TH150B / 316L, TH150B / 304, BH150B / 316L", "варианты разделены по техническому риску, цене поставщика, документам и необходимости owner approval"],
  ["Negotiation log", "цена, модель, материал, pressure drop, PI / договор", "5% negotiation layer покрывает вопросы цены, технических вводных и договорной подготовки до решения WinGPro"],
  ["Data-room", "Source Docs, паспорта насосов, проектные PDF, supplier pack", "заказчик получает структурированную доказательную базу, а не пересланные файлы"],
  ["Risk / handover", "Risk Radar, release gates, handover packs", "оплата привязана к переданным deliverables и открытым вопросам, а не к действиям перевозчика, брокера или монтажной стороны"],
] as const;

const commercialEvidenceRows = [
  ["5% supplier search", "supplier shortlist + profile", "найден канал, собрана идентификация, выделены варианты и вопросы по модели/материалу", "WinGPro видит, почему этот поставщик и какие альтернативы сравнивались"],
  ["5% negotiations", "price / PI / GA / contract queue", "зафиксированы переговорные вопросы по цене, технике, документам и условиям запуска", "WinGPro получает decision package вместо переписки без структуры"],
  ["10% service fee", "data-room + risk + handover evidence", "ставка раскрыта отдельно от оборудования и внешних расходов", "нет скрытой логистической маржи; логистика считается и исполняется внешними профильными сторонами"],
  ["market benchmark", "open 10% cap", "рыночный ориентир по sourcing/procurement services часто выше 10%", "UPGRADE фиксирует понятную ставку 10% за наши услуги, а не комиссию со всех затрат проекта"],
] as const;

const deliveryTimeline = [
  {
    id: "release",
    phase: "Release readiness",
    releaseGate: "Gate 1 — Evidence readiness",
    status: "owner required",
    targetOutcome: "WinGPro sees whether the next project step has minimum evidence before release.",
    evidence: "PI, bank details, material confirmation, pressure class, open questions list",
    owner: "WinGPro decision owner / supplier",
    upgradeAction: "UPGRADE prepares release readiness board and evidence request.",
    blocker: "material or pressure evidence is missing, or bank details are not confirmed",
    output: "release-readiness checklist",
    releaseDecision: "the next project step can be discussed only after minimum PI, bank and technical evidence is visible",
    evidencePacket: "PI snapshot, bank check note, material / pressure evidence, open item delta-list",
    escalationOwner: "WinGPro decision owner",
    handoff: "release approval note + unresolved evidence list",
    statusControl: "owner required until release evidence is complete enough for WinGPro review",
    boundary: "UPGRADE tracks evidence and open questions; WinGPro approves release decisions.",
  },
  {
    id: "production",
    phase: "Production confirmation",
    releaseGate: "Gate 2 — Before production confirmation",
    status: "planned",
    targetOutcome: "Production inputs become a visible confirmation package instead of scattered messages.",
    evidence: "confirmed specification, drawing request, technical questions, approval owner",
    owner: "supplier / responsible technical specialist",
    upgradeAction: "UPGRADE maintains confirmation tracker and decision log.",
    blocker: "technical owner or drawing request is unclear",
    output: "production confirmation board",
    releaseDecision: "production confirmation should not move as an informal message without a visible approval path",
    evidencePacket: "specification snapshot, drawing request, technical question owner, decision log",
    escalationOwner: "responsible technical specialist",
    handoff: "production input tracker + approval owner note",
    statusControl: "planned until technical questions and drawing request are assigned",
    boundary: "UPGRADE structures technical questions; profile specialists approve technical decisions.",
  },
  {
    id: "factory",
    phase: "Factory status",
    releaseGate: "Gate 2 / Gate 3 bridge",
    status: "collecting",
    targetOutcome: "Factory response time, open answers and escalation points stay visible.",
    evidence: "supplier status, factory contact, response log, unresolved data requests",
    owner: "supplier coordinator",
    upgradeAction: "UPGRADE records status, response delays and next evidence requests.",
    blocker: "supplier responses do not close the evidence list",
    output: "factory status log",
    releaseDecision: "supplier progress is tracked as response evidence, not assumed from optimistic wording",
    evidencePacket: "factory contact, response history, open answers, escalation trail",
    escalationOwner: "supplier coordinator",
    handoff: "factory status log + next evidence request",
    statusControl: "collecting while responses do not close the agreed evidence list",
    boundary: "UPGRADE does not control factory production; it controls the information status and escalation trail.",
  },
  {
    id: "preshipment",
    phase: "Pre-shipment evidence",
    releaseGate: "Gate 3 — Before shipment",
    status: "at risk",
    targetOutcome: "Shipment readiness is checked before cargo leaves the supplier side.",
    evidence: "photo/video/nameplate, packing list, weight/dimensions, commercial invoice draft",
    owner: "supplier",
    upgradeAction: "UPGRADE builds shipment readiness pack and highlights missing evidence.",
    blocker: "packing data, nameplate photo or invoice draft is absent",
    output: "shipment evidence pack",
    releaseDecision: "shipment readiness is visible only when cargo, documents and pre-shipment evidence are connected",
    evidencePacket: "photo/video/nameplate, packing list, dimensions, invoice draft, certificate status",
    escalationOwner: "supplier representative",
    handoff: "shipment evidence pack + blocked / ready status",
    statusControl: "at risk while packing or nameplate evidence is absent",
    boundary: "UPGRADE requests and tracks evidence; supplier confirms and provides shipment materials.",
  },
  {
    id: "logistics",
    phase: "Logistics handoff",
    releaseGate: "Gate 4 — Before customs/logistics handoff",
    status: "collecting",
    targetOutcome: "Logistics receives pickup and cargo data as a handoff pack.",
    evidence: "pickup contact, weight/dimensions, packing, route data, delivery terms",
    owner: "logistics provider / supplier",
    upgradeAction: "UPGRADE maps data-flow from supplier to logistics and flags gaps.",
    blocker: "pickup contact or cargo dimensions are incomplete",
    output: "logistics data-pack",
    releaseDecision: "handoff to logistics should happen with pickup, cargo and delivery terms in one data-pack",
    evidencePacket: "pickup map, contact chain, cargo dimensions, packing data, delivery terms",
    escalationOwner: "logistics provider / supplier",
    handoff: "logistics data-pack + pickup question list",
    statusControl: "collecting until cargo dimensions and pickup owner are clear",
    boundary: "UPGRADE prepares logistics inputs; actual transportation remains with logistics/carrier.",
  },
  {
    id: "broker",
    phase: "Broker handoff",
    releaseGate: "Gate 4 — Before customs/logistics handoff",
    status: "external dependency",
    targetOutcome: "Broker/customs questions are visible before the documents are urgently needed.",
    evidence: "commercial invoice draft, export docs checklist, HS/TN VED owner, certificate status",
    owner: "broker / supplier / WinGPro",
    upgradeAction: "UPGRADE prepares broker input list and customs document status board.",
    blocker: "invoice/export document status is unclear",
    output: "broker/customs input list",
    releaseDecision: "broker questions should be visible before they become an urgent customs blocker",
    evidencePacket: "invoice draft, export checklist, HS/TN VED owner, certificate status, broker questions",
    escalationOwner: "broker / WinGPro",
    handoff: "broker input list + customs document status board",
    statusControl: "external dependency while broker and supplier documents are not aligned",
    boundary: "UPGRADE structures customs inputs; broker/profile parties make customs decisions.",
  },
  {
    id: "arrival",
    phase: "Arrival",
    releaseGate: "Gate 5 — Before mounting handoff",
    status: "planned",
    targetOutcome: "Receiving status and issue evidence are connected to the handover room.",
    evidence: "arrival status, receiving photo, package condition, issue log",
    owner: "WinGPro / logistics",
    upgradeAction: "UPGRADE links receiving evidence to issue register and handover pack.",
    blocker: "arrival state or receiving evidence is not recorded",
    output: "receiving evidence note",
    releaseDecision: "arrival status becomes useful only when receiving evidence and issue notes are captured",
    evidencePacket: "arrival note, receiving photos, package condition, issue log, owner comments",
    escalationOwner: "WinGPro receiving owner",
    handoff: "receiving evidence note + open issue register",
    statusControl: "planned until cargo status and receiving evidence are recorded",
    boundary: "UPGRADE records the information contour; physical receiving is handled by responsible parties.",
  },
  {
    id: "mounting",
    phase: "Mounting handoff",
    releaseGate: "Gate 5 — Before mounting handoff",
    status: "planned",
    targetOutcome: "Mounting side receives inputs early enough to ask questions before implementation.",
    evidence: "coordination draft, connection points, dimensions, access/service space, mounting questions",
    owner: "mounting side / responsible technical specialist",
    upgradeAction: "UPGRADE prepares mounting coordination pack and open questions register.",
    blocker: "mounting owner or technical approval path is missing",
    output: "mounting handoff pack",
    releaseDecision: "mounting handoff is useful when installers receive structured inputs before implementation questions become late blockers",
    evidencePacket: "coordination draft, connection points, dimensions, access notes, mounting questions checklist",
    escalationOwner: "mounting side / technical approval owner",
    handoff: "mounting coordination pack + installer question register",
    statusControl: "planned until mounting owner and technical approval path are visible",
    boundary: "UPGRADE does not perform or accept mounting; profile parties execute and approve field work.",
  },
] as const satisfies ReadonlyArray<{
  id: DeliveryPhaseId;
  phase: string;
  releaseGate: string;
  status: string;
  targetOutcome: string;
  evidence: string;
  owner: string;
  upgradeAction: string;
  blocker: string;
  output: string;
  releaseDecision: string;
  evidencePacket: string;
  escalationOwner: string;
  handoff: string;
  statusControl: string;
  boundary: string;
}>;

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
  ["nameplate checked", "Needs evidence", "nameplate/photo/video before closeout review"],
  ["photo report", "Planned", "before shipment / receiving / handover"],
  ["access path", "Blocked", "site owner required"],
  ["connection points", "Ready", "technical owner confirmation"],
  ["mounting location", "Planned", "coordination draft"],
  ["installation started", "Planned", "mounting side task"],
  ["handover", "Planned", "handover register"],
] as const;

const fieldStatuses = ["Planned", "Ready", "In progress", "Needs evidence", "Blocked", "Done"] as const;
type FieldStatus = (typeof fieldStatuses)[number];

const fieldStatusCues: Record<FieldStatus, string> = {
  Planned: "задачи coordination draft видны до выхода в field execution",
  Ready: "исходные данные есть и могут быть проверены ответственной стороной",
  "In progress": "field owner обновляет статус в своей зоне ответственности",
  "Needs evidence": "нужны фото, шильдик, receiving note или другое evidence",
  Blocked: "следующее действие блокирует owner decision или недостающие вводные",
  Done: "evidence можно переносить в handover и closeout register",
};

const fieldStatusNextActions: Record<FieldStatus, string> = {
  Planned: "подтвердить owner и required evidence перед переводом задачи",
  Ready: "запросить подтверждение field-side и привязать evidence path",
  "In progress": "держать статус видимым и связывать updates с evidence register",
  "Needs evidence": "запросить фото, видео, шильдик или receiving note",
  Blocked: "эскалировать owner decision; UPGRADE фиксирует blocker, а не исполнение",
  Done: "перенести evidence в handover pack и closeout index",
};

const evidenceCards = [
  ["Before shipment", "photo/video/nameplate, packing state", "supplier"],
  ["Receiving", "arrival photo, package condition, issue note", "WinGPro / logistics"],
  ["Installation preparation", "access path, location, connection points", "mounting side"],
  ["Work progress", "field task notes, blockers, owner updates", "mounting side"],
  ["Handover", "completion notes, open issues, photo evidence register", "WinGPro / mounting side"],
] as const;

const evidenceHandoffLinks = [
  {
    phase: "Before shipment",
    gate: "Gate 3 — Before shipment",
    fieldTasks: "nameplate checked, photo report",
    evidenceInput: "photo/video/nameplate, packing state, cargo dimensions",
    handoverPack: "Supplier Communication Pack / Logistics Pack",
    riskLink: "no nameplate/photo/video before shipment + missing packing data",
    owner: "supplier provides evidence; UPGRADE tracks status",
    closeoutOutput: "shipment evidence note and unresolved shipment blockers",
    boundary: "UPGRADE requests and records media evidence; supplier provides source materials.",
  },
  {
    phase: "Receiving",
    gate: "Gate 5 — Before mounting handoff",
    fieldTasks: "received, photo report",
    evidenceInput: "arrival photo, package condition, issue note",
    handoverPack: "Logistics Pack / WinGPro Executive Pack",
    riskLink: "unclear arrival state or missing receiving evidence",
    owner: "WinGPro / logistics records receiving state",
    closeoutOutput: "receiving evidence note and open issue register",
    boundary: "responsible parties receive cargo; UPGRADE structures evidence and status links.",
  },
  {
    phase: "Installation preparation",
    gate: "Gate 5 — Before mounting handoff",
    fieldTasks: "access path, connection points, mounting location",
    evidenceInput: "access path, location, dimensions, connection points",
    handoverPack: "Mounting Coordination Pack",
    riskLink: "late mounting inputs",
    owner: "mounting side / responsible technical specialist",
    closeoutOutput: "coordination draft evidence and installer question list",
    boundary: "UPGRADE prepares coordination inputs; profile parties approve field decisions.",
  },
  {
    phase: "Work progress",
    gate: "Gate 6 — Before closeout review",
    fieldTasks: "installation started, blockers, owner updates",
    evidenceInput: "field task notes, blocker owner, status update",
    handoverPack: "Mounting Coordination Pack / WinGPro Executive Pack",
    riskLink: "field blockers remain invisible until closeout",
    owner: "mounting side updates its execution status",
    closeoutOutput: "field execution log and blocker register",
    boundary: "UPGRADE does not supervise or accept mounting; it records the information contour.",
  },
  {
    phase: "Handover",
    gate: "Gate 6 — Before closeout review",
    fieldTasks: "handover, photo evidence register",
    evidenceInput: "completion notes, open issues, photo evidence register",
    handoverPack: "WinGPro Executive Pack / Future Sales Pack",
    riskLink: "closeout without reusable evidence trail",
    owner: "WinGPro reviews delivered packs",
    closeoutOutput: "handover register, photo evidence register and reusable product notes",
    boundary: "acceptance covers delivered UPGRADE artifacts, not third-party physical outcomes.",
  },
] as const;

type EvidencePhase = (typeof evidenceHandoffLinks)[number]["phase"];

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
  ["Release Readiness", "at risk"],
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
  {
    title: "Factory China",
    status: "collecting",
    data: "factory contact, model, evidence request",
    documents: "supplier profile, TH150B update request, BH150B archive evidence",
    owner: "supplier",
    action: "создать source request",
    risk: "неясный источник данных",
    gate: "Gate 0",
    readiness: "factory contact and supplier identity are visible before release movement",
    response: "UPGRADE turns supplier messages into a traceable source request and open evidence list.",
    boundary: "supplier confirms factory data; UPGRADE structures the request and traceability.",
  },
  {
    title: "Pickup",
    status: "planned",
    data: "pickup contact map, packing, dimensions",
    documents: "packing list, cargo dimensions, pickup contact chain",
    owner: "logistics",
    action: "подготовить pickup handoff",
    risk: "задержка маршрута",
    gate: "Gate 3",
    readiness: "pickup contact, cargo dimensions and delivery terms are ready for logistics review",
    response: "UPGRADE prepares a pickup handoff board and flags missing packing data before route planning.",
    boundary: "carrier/logistics executes transport; UPGRADE prepares the information package.",
  },
  {
    title: "Export docs",
    status: "owner required",
    data: "commercial invoice, certificate, export checklist",
    documents: "commercial invoice draft, certificate status, export document checklist",
    owner: "supplier / broker",
    action: "собрать export document board",
    risk: "разрыв в документах",
    gate: "Gate 4",
    readiness: "export document owner and missing-document list are visible before shipment handoff",
    response: "UPGRADE keeps export documents in one board and escalates missing certificates or invoice gaps.",
    boundary: "supplier and broker provide/approve export documents; UPGRADE tracks readiness and gaps.",
  },
  {
    title: "Border / customs",
    status: "external dependency",
    data: "broker input list, HS/TN VED owner, document status",
    documents: "broker input list, HS/TN VED check owner, customs document status",
    owner: "broker",
    action: "передать customs input list",
    risk: "оформление без полного пакета",
    gate: "Gate 4",
    readiness: "broker has the input list and can see what remains supplier-owned or WinGPro-owned",
    response: "UPGRADE packages customs inputs for broker review and records decisions that are outside UPGRADE.",
    boundary: "broker/profile parties make customs decisions; UPGRADE does not act as broker.",
  },
  {
    title: "Kazakhstan",
    status: "planned",
    data: "arrival status, handoff owner, issue log",
    documents: "arrival note, receiving photos, package condition, issue register",
    owner: "WinGPro / logistics",
    action: "обновить release status",
    risk: "неясный статус прибытия",
    gate: "Gate 5",
    readiness: "arrival status and receiving evidence connect delivery to handover room",
    response: "UPGRADE links receiving evidence to issue register so blockers are visible before closeout.",
    boundary: "responsible parties receive cargo; UPGRADE records information status and evidence links.",
  },
  {
    title: "Project site",
    status: "at risk",
    data: "connection points, service access, mounting questions",
    documents: "coordination draft, dimensions, access/service space, mounting questions",
    owner: "mounting side",
    action: "передать coordination pack",
    risk: "площадка получает вводные поздно",
    gate: "Gate 5",
    readiness: "mounting side receives structured inputs before implementation questions become late blockers",
    response: "UPGRADE prepares coordination pack and separates open questions for technical approval owners.",
    boundary: "mounting side and technical specialists approve/execute field decisions; UPGRADE does not perform mounting.",
  },
  {
    title: "Mounting handoff",
    status: "owner required",
    data: "open questions, technical approval owner, handover register",
    documents: "handover register, open issue register, digital product card links",
    owner: "WinGPro / mounting",
    action: "закрыть handover room",
    risk: "нет приемочного контура",
    gate: "Gate 6",
    readiness: "handover package shows what was delivered, what remains open and which owners approve next steps",
    response: "UPGRADE closes the information contour with handover register and reusable product data links.",
    boundary: "WinGPro reviews delivered information packs; third parties remain responsible for their physical work.",
  },
];

const vaultDocs = [
  ["Supplier Identity", "supplier profile", "identity", "Gate 0", "UPGRADE", "collecting", "commercial", "подтверждает канал", "сокращает повторные вопросы", "неясный торговый канал", "свести supplier profile"],
  ["Supplier Identity", "bank details confirmation", "finance", "Gate 1", "supplier", "missing", "commercial", "снижает риск слабого release decision", "уменьшает задержку решения по следующему этапу", "release без evidence", "запросить подтверждение"],
  ["Contract Terms", "Proforma Invoice", "contract", "Gate 1", "supplier", "review", "contract", "сверка PI и условий", "сокращает цикл согласования PI", "слабые условия PI", "подготовить delta-list"],
  ["Technical Evidence", "pressure class confirmation", "technical", "Gate 1", "supplier", "missing", "quality", "снижает риск неподходящего оборудования", "снижает риск поздней технической переделки", "ошибка pressure class", "запросить evidence"],
  ["Technical Evidence", "drawing", "technical", "Gate 2", "supplier", "requested", "quality", "дает профильным участникам проверяемую основу", "уменьшает поздние монтажные вопросы", "нет чертежа", "закрепить owner"],
  ["Delivery Pack", "packing list", "logistics", "Gate 3", "supplier", "requested", "time", "снижает риск ошибки в логистическом пакете", "ускоряет передачу логисту/брокеру", "нет packing data", "включить в shipment checklist"],
  ["Delivery Pack", "photo/video/nameplate", "evidence", "Gate 3", "supplier", "requested", "quality", "дает evidence before shipment", "уменьшает поздние проверки", "нет доказательств до отгрузки", "запросить media evidence"],
  ["Customs/Broker Inputs", "broker input list", "customs", "Gate 4", "broker", "collecting", "customs", "структурирует таможенные вводные", "ускоряет передачу брокеру", "customs documents gap", "передать input list"],
  ["Mounting Inputs", "mounting questions checklist", "mounting", "Gate 5", "UPGRADE", "ready", "mounting", "повышает готовность монтажной стороны", "снижает риск поздних уточнений", "late mounting inputs", "собрать coordination pack"],
  ["Purchased Pump Pack", "Pedrollo F100/F80 datasheets", "technical", "Gate 5", "UPGRADE", "ready", "mounting", "фиксирует паспорта закупленных насосов", "ускоряет сверку насосного interface", "насосы вне data-room", "связать паспорта с Source Data Room"],
  ["Purchased Pump Pack", "pump nameplates and serial numbers", "evidence", "Gate 5", "WinGPro / mounting", "requested", "quality", "подтверждает фактические 2+2 насоса", "снижает риск путаницы по модели и серийникам", "нет шильдиков насосов", "запросить фото шильдиков"],
  ["Purchased Pump Pack", "purchase invoice / waybill / receiving note", "procurement", "Gate 5", "WinGPro procurement", "missing", "dependency", "подтверждает статус уже закуплено", "отделяет паспорт от факта закупки", "нет закупочного evidence", "добавить purchase evidence"],
  ["Purchased Pump Pack", "pump installation assignment", "mounting", "Gate 5", "WinGPro technical owner", "requested", "time", "связывает F100/F80 с фактическим контуром", "снижает риск поздней переувязки насосов", "не подтверждено место установки", "подтвердить контур и owner"],
  ["Digital Sales Asset", "digital product card", "asset", "Gate 7", "UPGRADE", "collecting", "commercial", "создает reusable sales base", "ускоряет повторное предложение", "нет product card", "связать documents and notes"],
] as const;

function getVaultReleaseLane(gate: string) {
  if (gate.includes("Gate 0")) return "source readiness";
  if (gate.includes("Gate 1")) return "release readiness";
  if (gate.includes("Gate 2")) return "production confirmation readiness";
  if (gate.includes("Gate 3")) return "shipment readiness";
  if (gate.includes("Gate 4")) return "customs / logistics handoff readiness";
  if (gate.includes("Gate 5")) return "mounting handoff readiness";
  if (gate.includes("Gate 7")) return "digital product asset readiness";
  return "closeout readiness";
}

function getVaultRouteLink(category: string, gate: string) {
  if (category === "Supplier Identity") return "Factory China";
  if (category === "Delivery Pack" || gate.includes("Gate 3")) return "Pickup / Export docs";
  if (category === "Customs/Broker Inputs" || gate.includes("Gate 4")) return "Border / customs";
  if (category === "Mounting Inputs" || gate.includes("Gate 5")) return "Project site / Mounting handoff";
  if (category === "Digital Sales Asset") return "Handover Room / Future Sales";
  return "Release / Contract decision";
}

function getVaultOperationalCue(status: string, impact: string) {
  if (status === "ready") return "can be used in the next handoff pack";
  if (status === "missing") return `blocks ${impact} readiness until owner response is visible`;
  if (status === "requested") return `requires follow-up before ${impact} readiness can be treated as stable`;
  if (status === "review") return "needs decision owner review before release gate movement";
  return "collecting evidence and owner response inside the data-room";
}

const risks = [
  { id: "identity", title: "supplier identity unclear", severity: "medium", impact: "dependency", x: 18, y: 34, evidence: "supplier profile, role clarification", owner: "WinGPro / supplier", escalation: "source request", vaultEvidence: "supplier profile", releaseGate: "Gate 0 — Deal setup", routeHandoff: "Factory China", response: "подготовить supplier identity request и зафиксировать open owner до release movement", decision: "WinGPro confirms whether the trading channel is acceptable", boundary: "UPGRADE фиксирует статус ответа поставщика, но не отвечает за его действия" },
  { id: "material", title: "material mismatch", severity: "high", impact: "quality", x: 35, y: 18, evidence: "material confirmation, technical sheet", owner: "technical owner", escalation: "evidence before release", vaultEvidence: "material / specification confirmation", releaseGate: "Gate 1 — Evidence readiness", routeHandoff: "Release / Contract decision", response: "сформировать evidence request для supplier и вынести спорный материал в decision log", decision: "technical owner checks material evidence before release readiness", boundary: "UPGRADE не утверждает технические параметры" },
  { id: "pressure", title: "pressure class mismatch", severity: "high", impact: "quality", x: 50, y: 24, evidence: "pressure class confirmation", owner: "technical owner", escalation: "Gate 1 blocker", vaultEvidence: "pressure class confirmation", releaseGate: "Gate 1 — Evidence readiness", routeHandoff: "Release / Contract decision", response: "пометить Gate 1 blocker и запросить pressure evidence до release decision", decision: "responsible technical specialist confirms pressure class", boundary: "UPGRADE структурирует запрос" },
  { id: "pi", title: "PI weakness", severity: "medium", impact: "decision", x: 64, y: 36, evidence: "PI, contract delta-list", owner: "WinGPro", escalation: "release readiness", vaultEvidence: "Proforma Invoice", releaseGate: "Gate 1 — Evidence readiness", routeHandoff: "Release / Contract decision", response: "собрать PI delta-list: реквизиты, сроки, Incoterms и evidence gaps", decision: "WinGPro approves PI terms after reviewing delta-list", boundary: "UPGRADE фиксирует delta-list, но не утверждает условия" },
  { id: "release", title: "release before evidence", severity: "high", impact: "decision", x: 76, y: 22, evidence: "release-readiness checklist", owner: "WinGPro", escalation: "release gate board", vaultEvidence: "bank details confirmation + release-readiness checklist", releaseGate: "Gate 1 — Evidence readiness", routeHandoff: "Release / Contract decision", response: "показать stop/go list по evidence before release и unresolved blockers", decision: "WinGPro decides release scenario and risk acceptance", boundary: "UPGRADE не принимает release decision за WinGPro" },
  { id: "packing", title: "missing packing data", severity: "medium", impact: "time", x: 25, y: 68, evidence: "packing list, weight/dimensions", owner: "supplier / logistics", escalation: "shipment readiness", vaultEvidence: "packing list", releaseGate: "Gate 3 — Before shipment", routeHandoff: "Pickup / Export docs", response: "запросить packing list, dimensions and pickup data before logistics handoff", decision: "supplier provides cargo data; logistics reviews route readiness", boundary: "UPGRADE не является перевозчиком" },
  { id: "customs", title: "customs documents gap", severity: "medium", impact: "dependency", x: 48, y: 76, evidence: "broker input list, export docs", owner: "broker", escalation: "customs handoff", vaultEvidence: "broker input list + export document checklist", releaseGate: "Gate 4 — Before customs/logistics handoff", routeHandoff: "Border / customs", response: "собрать customs input board и отделить broker decisions от supplier documents", decision: "broker/profile parties review customs inputs", boundary: "UPGRADE не является брокером" },
  { id: "mounting", title: "late mounting inputs", severity: "high", impact: "time", x: 72, y: 66, evidence: "connection points, service access", owner: "mounting side", escalation: "mounting handoff", vaultEvidence: "mounting questions checklist", releaseGate: "Gate 5 — Before mounting handoff", routeHandoff: "Project site / Mounting handoff", response: "передать mounting questions checklist и coordination draft до field execution", decision: "mounting side and technical specialist approve field inputs", boundary: "UPGRADE не выполняет монтаж" },
  { id: "pump-evidence", title: "pump purchase / serial evidence incomplete", severity: "medium", impact: "dependency", x: 58, y: 70, evidence: "pump nameplates, serial numbers, invoice / waybill, installation assignment", owner: "WinGPro / mounting side", escalation: "pump evidence request", vaultEvidence: "pump nameplates and serial numbers", releaseGate: "Gate 5 — Before mounting handoff", routeHandoff: "Project site / Mounting handoff", response: "собрать pump evidence request: шильдики, серийники, закупочный документ и подтверждение контура F100/F80", decision: "WinGPro technical owner and mounting contractor confirm pump assignment and documents", boundary: "UPGRADE структурирует evidence request, но не подтверждает гидравлику и не принимает оборудование" },
  { id: "media", title: "no nameplate/photo/video before shipment", severity: "medium", impact: "quality", x: 42, y: 54, evidence: "photo/video/nameplate", owner: "supplier", escalation: "shipment evidence request", vaultEvidence: "photo/video/nameplate", releaseGate: "Gate 3 — Before shipment", routeHandoff: "Pickup / Export docs", response: "запросить media evidence before shipment и связать его с shipment evidence pack", decision: "supplier provides evidence; WinGPro reviews before release movement", boundary: "UPGRADE не инспекционный орган" },
  { id: "asset", title: "no reusable digital product card", severity: "controlled", impact: "decision", x: 84, y: 82, evidence: "supplier card, product card", owner: "UPGRADE / WinGPro", escalation: "reuse pipeline", vaultEvidence: "digital product card", releaseGate: "Gate 7 — Reuse in sales pipeline", routeHandoff: "Handover Room / Future Sales", response: "связать supplier profile, documents, notes and product card for repeat purchase / sales reuse", decision: "WinGPro chooses the future reuse strategy for this product asset", boundary: "будущая повторная продажа зависит от стратегии WinGPro" },
] as const;

const gates = [
  ["Gate 0 — Deal setup", "сделка описана как mission", "supplier identity, object, route, participants", "UPGRADE / WinGPro", "создать mission record", "нет supplier/object clarity", "mission card"],
  ["Gate 1 — Evidence readiness", "готовность следующего шага на базе evidence", "PI, bank details, material, pressure, open questions", "WinGPro", "подготовить release readiness board", "нет pressure/material confirmation", "release-readiness checklist"],
  ["Gate 2 — Before production confirmation", "производственные вводные проверяемы", "specification, drawing request, technical owner", "supplier / technical owner", "вести confirmation tracker", "нет drawing/request owner", "confirmation board"],
  ["Gate 3 — Before shipment", "отгрузка имеет evidence и logistics inputs", "packing, weight/dimensions, photo/video/nameplate", "supplier", "собрать shipment readiness", "нет packing data", "shipment pack"],
  ["Gate 4 — Before customs/logistics handoff", "брокер и логист получают data-flow", "broker input, export docs, pickup map", "broker / logistics", "передать route map", "customs gap", "logistics/customs pack"],
  ["Gate 5 — Before mounting handoff", "площадка получает вводные заранее", "connection points, dimensions, access, questions", "mounting side", "подготовить coordination pack", "нет mounting owner", "mounting handoff"],
  ["Gate 6 — Before closeout review", "результат сверяется по deliverables", "vault index, risk radar, release board, packs", "WinGPro", "собрать handover room", "не закрыты deliverables", "closeout register"],
  ["Gate 7 — Reuse in sales pipeline", "позиция готова к повторному использованию", "supplier card, product card, links, notes", "WinGPro / UPGRADE", "создать digital product asset", "нет reusable card", "sales asset"],
] as const;

function getGateKey(gateTitle: string) {
  return gateTitle.match(/Gate \d/)?.[0] ?? gateTitle;
}

function getGateVaultLinks(gateTitle: string) {
  const key = getGateKey(gateTitle);
  return vaultDocs.filter((doc) => doc[3].includes(key)).map((doc) => doc[1]);
}

function getGateRiskLinks(gateTitle: string) {
  const key = getGateKey(gateTitle);
  return risks.filter((item) => item.releaseGate.includes(key)).map((item) => item.title);
}

function getGateRouteLinks(gateTitle: string) {
  const key = getGateKey(gateTitle);
  return routePoints.filter((point) => point.gate.includes(key)).map((point) => point.title);
}

function getGateStopGo(gateTitle: string) {
  const key = getGateKey(gateTitle);
  if (key === "Gate 0") return "Go only when supplier identity, object and participant map are visible.";
  if (key === "Gate 1") return "Stop if release evidence, PI, bank, material or pressure confirmations remain unresolved.";
  if (key === "Gate 2") return "Go when specification, drawing request and technical decision owner are visible.";
  if (key === "Gate 3") return "Stop shipment readiness when packing data or photo/video/nameplate evidence is missing.";
  if (key === "Gate 4") return "Go only when broker/logistics input package and external document owners are visible.";
  if (key === "Gate 5") return "Stop mounting handoff if owner, access inputs or technical question path is unclear.";
  if (key === "Gate 7") return "Go when supplier/product card and reusable notes are linked for future sales or repeat procurement use.";
  return "Результат принимается по deliverables, open issue register и handover packs.";
}

const handoverPacks = [
  {
    name: "WinGPro Executive Pack",
    inside: "mission card, decision log, release gates, closeout register",
    format: "board pack",
    recipient: "WinGPro",
    gate: "Gate 6",
    value: "руководство видит статус и результат",
    acceptance: "executive summary and closeout index are ready to review",
    paymentLink: "supports final closeout review package",
    evidence: "decision log, release board, open issues register",
    reusable: "management view for repeated procurement decisions",
  },
  {
    name: "Supplier Communication Pack",
    inside: "structured questions, evidence request, open items",
    format: "request pack",
    recipient: "supplier",
    gate: "Gate 1-3",
    value: "поставщик получает понятные запросы",
    acceptance: "supplier questions and unresolved items are documented",
    paymentLink: "supports release-readiness and pre-shipment evidence",
    evidence: "request log, response status, missing evidence list",
    reusable: "supplier communication pattern for future orders",
  },
  {
    name: "Logistics Pack",
    inside: "pickup map, weight/dimensions, packing status",
    format: "data-flow pack",
    recipient: "logistics",
    gate: "Gate 3-4",
    value: "логист видит операционные вводные",
    acceptance: "handoff data is structured for logistics review",
    paymentLink: "shows delivery data readiness without making UPGRADE the carrier",
    evidence: "packing data, pickup contacts, weight/dimensions",
    reusable: "route input template for repeated shipments",
  },
  {
    name: "Broker/Customs Pack",
    inside: "broker input, export docs, HS/TN VED owner",
    format: "customs input list",
    recipient: "broker",
    gate: "Gate 4",
    value: "брокер получает проверочный список",
    acceptance: "broker/customs questions are visible with owners",
    paymentLink: "documents handoff status, not customs outcome",
    evidence: "invoice draft, certificate/export checklist, broker input list",
    reusable: "customs readiness pattern for similar product lines",
  },
  {
    name: "Mounting Coordination Pack",
    inside: "connection points, service access, dimensions, pump assignment, questions",
    format: "coordination pack",
    recipient: "mounting side",
    gate: "Gate 5",
    value: "площадка получает вводные заранее",
    acceptance: "mounting questions, pump assignment and technical owner path are listed",
    paymentLink: "confirms coordination inputs were transferred, not field execution",
    evidence: "connection points, service access, dimensions, pump nameplates, installation assignment, open questions",
    reusable: "mounting input checklist for future implementation",
  },
  {
    name: "Future Sales Pack",
    inside: "supplier profile, product card, links, repeat purchase notes",
    format: "sales asset",
    recipient: "WinGPro",
    gate: "Gate 7",
    value: "позиция готова к повторному использованию",
    acceptance: "supplier and product cards are ready as digital product asset",
    paymentLink: "part of the delivered reusable product data base",
    evidence: "supplier card, product card, document links, future sales brief",
    reusable: "digital product asset for repeat purchase and resale offers",
  },
] as const;

type HandoverPack = (typeof handoverPacks)[number];

function uniqueList(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function getHandoverGateKeys(pack: HandoverPack) {
  const range = pack.gate.match(/Gate (\d)-(\d)/);
  if (range) {
    const start = Number(range[1]);
    const end = Number(range[2]);
    return Array.from({ length: end - start + 1 }, (_, index) => `Gate ${start + index}`);
  }

  const keys = pack.gate.match(/Gate \d/g);
  return keys ?? [pack.gate];
}

function getHandoverGateLinks(pack: HandoverPack) {
  const keys = getHandoverGateKeys(pack);
  return gates.filter((gate) => keys.some((key) => gate[0].includes(key)));
}

function getHandoverVaultLinks(pack: HandoverPack) {
  const keys = getHandoverGateKeys(pack);
  const evidence = pack.evidence.toLowerCase();
  const inside = pack.inside.toLowerCase();

  return vaultDocs.filter((doc) => (
    keys.some((key) => doc[3].includes(key))
    || evidence.includes(doc[1].toLowerCase())
    || inside.includes(doc[1].toLowerCase())
    || inside.includes(doc[0].toLowerCase())
  ));
}

function getHandoverRiskLinks(pack: HandoverPack) {
  const keys = getHandoverGateKeys(pack);
  const evidence = pack.evidence.toLowerCase();
  const name = pack.name.toLowerCase();

  return risks.filter((item) => (
    keys.some((key) => item.releaseGate.includes(key))
    || evidence.includes(item.vaultEvidence.toLowerCase())
    || item.routeHandoff.toLowerCase().includes(name.split(" ")[0])
  ));
}

function getHandoverRouteLinks(pack: HandoverPack) {
  const keys = getHandoverGateKeys(pack);
  const evidence = pack.evidence.toLowerCase();
  const recipient = pack.recipient.toLowerCase();

  return routePoints.filter((point) => (
    keys.some((key) => point.gate.includes(key))
    || evidence.includes(point.title.toLowerCase())
    || point.owner.toLowerCase().includes(recipient)
  ));
}

function getHandoverOwnerCue(pack: HandoverPack) {
  if (pack.name.includes("Broker")) return "broker/customs parties review and decide customs actions; UPGRADE structures the input list.";
  if (pack.name.includes("Logistics")) return "logistics/carrier side reviews route execution; UPGRADE prepares cargo data and pickup status.";
  if (pack.name.includes("Mounting")) return "mounting side and technical specialists approve field decisions; UPGRADE prepares the coordination draft.";
  if (pack.name.includes("Supplier")) return "supplier responds to evidence requests; UPGRADE keeps open items visible.";
  if (pack.name.includes("Future")) return "WinGPro decides future reuse; UPGRADE structures supplier and product data.";
  return "WinGPro reviews delivered information packs; UPGRADE transfers the structured closeout package.";
}

const copyTexts: Record<CopyVariant, string> = {
  short:
    "UPGRADE структурирует исходные данные, source documents, supplier evidence, delivery gates, mounting inputs, risk register и handover packs по зоне поставки и монтажной подготовки пластинчатых теплообменников.",
  executive:
    "WinGPro получает технический cockpit: Source Data Room, Digital Twin, supplier evidence, release gates, Document Vault, Risk Radar, Route Map, Work Plan / ППР skeleton, field evidence preview, Handover Room и reusable Digital Product Asset.",
  command:
    "Структура КП построена как procurement command center: Document Vault показывает owner queue и next evidence request, Risk Radar переводит риски в response sequence, Release Gates фиксируют readiness перед release/shipment/handover, а Handover Room собирает closeout packs и reusable Digital Product Asset. UPGRADE управляет информационным контуром, evidence и handoff-пакетами; профильные участники утверждают и исполняют решения в своих зонах ответственности.",
  boundary:
    "UPGRADE структурирует данные, документы, вопросы, статусы и handover-пакеты. UPGRADE не является поставщиком, производителем, проектировщиком, монтажной организацией, брокером, перевозчиком, технадзором или сертификационным органом.",
  deliverables:
    "Deliverables: mission card, Digital Twin preview, Document Vault, Risk Radar, Release gates board, Route Map, Control Room status, Handover Room packs, digital supplier card, digital product card, copy-ready executive summary.",
  payment:
    "Коммерческое решение: UPGRADE service fee = 10% от стоимости заказа оборудования, без логистики, брокера, пошлин, НДС, доставки, монтажа, ПНР и иных внешних расходов. 5% — поиск поставщика, short-list, supplier profile и первичная evidence-проверка; 5% — переговоры по цене, обсуждение технических вопросов, PI/GA/documents и договорных вводных. Рыночный ориентир для sourcing/procurement coordination обычно выше 10%, но в этом КП UPGRADE фиксирует открытые 10% только за наши услуги и не прячет комиссию в логистике. Для текущего КП это оформлено как 3 000 000 ₸ без НДС за единый комплекс сопровождения. Приемка результата привязана к deliverables: data-room index, risk register, release gate board, handover packs, digital supplier/product card.",
  next:
    "После согласования КП стороны оформляют договор оказания услуг, где фиксируются единый комплекс работ, стоимость, порядок оплаты, deliverables, границы ответственности и порядок передачи результатов.",
  addons:
    "Дополнительные опции могут быть согласованы отдельно: расширенный 3D / digital twin товара, инспекция или видео-проверка через профильного подрядчика, расширенный mounting coordination pack, post-delivery evidence report, цифровая карточка товара для повторных продаж и отдельный logistics / broker document checklist. Эти опции не включаются автоматически в базовые 3 000 000 ₸ без отдельного письменного согласования.",
};

const copyVariantTitles: Record<CopyVariant, string> = {
  short: "Короткое техническое сообщение",
  executive: "Расширенный технический summary",
  command: "Технический summary",
  boundary: "Граница ответственности",
  deliverables: "Свод deliverables",
  payment: "Коммерческое сообщение",
  next: "Условия оплаты",
  addons: "Технические расширения",
};

const presentationModes: Array<{
  id: PresentationModeId;
  label: string;
  summary: string;
  nextAction: string;
  focus: string;
  endpoint: {
    selected: string;
    confirm: string;
    receives: string;
  };
  detailActions: ReadonlyArray<readonly [string, string]>;
  copyVariant: CopyVariant;
  sections: string[];
}> = [
  {
    id: "executive",
    label: "Executive Summary",
    summary: "WinGPro получает выбранный закупочный маршрут, Digital Twin, status board, release gates, handover packs и Digital Product Asset как единый контур решения.",
    nextAction: "Сначала подтвердить рабочий формат: единый IT/data и закупочно-координационный контур.",
    focus: "что получает заказчик",
    endpoint: {
      selected: "единый procurement-to-implementation контур",
      confirm: "scope, evidence gates, handover packs and responsibility boundary",
      receives: "mission summary, control room, release board, handover packs and Digital Product Asset",
    },
    detailActions: [["Открыть Digital Twin", "#digital-twin"], ["Offer Board", "#offer-comparison-board"]],
    copyVariant: "short",
    sections: ["hero", "digitalTwin", "valueOs", "statusOfCustomer", "sourceDocuments", "handoverRoom"],
  },
  {
    id: "supplier",
    label: "Supplier Decision",
    summary: "Supplier Request Lab и Offer Comparison Board показывают shortlist, выбранного кандидата, причины отклонения альтернатив и evidence readiness.",
    nextAction: "Проверить выбранный supplier profile, открытые вопросы и recommendation для WinGPro decision owner.",
    focus: "выбор поставщика",
    endpoint: {
      selected: "shortlist logic and selected supplier candidate",
      confirm: "manufacturer/trader role, material/pressure evidence and open requests",
      receives: "supplier profile, comparison board, recommendation note and evidence request list",
    },
    detailActions: [["Supplier Request Lab", "#supplier-request-lab"], ["Offer Comparison Board", "#offer-comparison-board"]],
    copyVariant: "command",
    sections: ["projectControl", "filmstrip", "controlRoom", "sourceDocuments", "vault", "riskRadar"],
  },
  {
    id: "contract",
    label: "Contract Terms",
    summary: "Contract Decision Simulator связывает release path, условия поставки, evidence gates и силу договорного пакета.",
    nextAction: "Согласовать release path, contract draft RU/EN и список документов, которые должны быть получены до следующего этапа.",
    focus: "условия договора",
    endpoint: {
      selected: "contract scenario, evidence gates and release-readiness frame",
      confirm: "evidence readiness, owner approvals and boundary wording",
      receives: "draft terms summary, release readiness board and handover guardrails",
    },
    detailActions: [["Contract Simulator", "#contract-decision-simulator"], ["Release Gates", "#release-gates"]],
    copyVariant: "boundary",
    sections: ["projectControl", "valueOs", "sourceDocuments", "vault", "releaseGates", "handoverRoom"],
  },
  {
    id: "delivery",
    label: "Delivery Control",
    summary: "Delivery Timeline, Route Map и Release Gates показывают контроль информационной готовности маршрута China → Kazakhstan.",
    nextAction: "Сверить before shipment пакет: packing data, weight/dimensions, pickup contact, invoice draft и broker input list.",
    focus: "контроль поставки",
    endpoint: {
      selected: "delivery data-flow and release-readiness path",
      confirm: "packing data, dimensions, pickup contact, invoice draft and broker inputs",
      receives: "delivery timeline, route map, logistics data-pack and customs handoff inputs",
    },
    detailActions: [["Delivery Timeline", "#delivery-timeline"], ["Route Map", "#route-title"]],
    copyVariant: "command",
    sections: ["digitalTwin", "controlRoom", "routeMap", "vault", "releaseGates"],
  },
  {
    id: "workplan",
    label: "Work Plan",
    summary: "Work Plan Builder / ППР skeleton, Field Execution Board и участники проекта показывают coordination draft для проверки монтажной стороной.",
    nextAction: "Передать mounting questions, connection points и service access вводные ответственному техническому специалисту.",
    focus: "подготовка реализации",
    endpoint: {
      selected: "coordination draft / ППР skeleton input path",
      confirm: "connection points, access/service space and technical approval owner",
      receives: "mounting coordination pack, field execution preview and open questions checklist",
    },
    detailActions: [["Work Plan Builder", "#work-plan-builder"], ["Field Execution Board", "#field-execution-board"]],
    copyVariant: "boundary",
    sections: ["projectControl", "controlRoom", "sourceDocuments", "statusOfCustomer", "handoverRoom", "releaseGates"],
  },
  {
    id: "handover",
    label: "Evidence & Handover",
    summary: "Photo Evidence Wall, Handover Room и technical summary pack собирают evidence register, closeout packs и reusable Digital Product Asset.",
    nextAction: "Скопировать summary и зафиксировать deliverables, open issues register и границы ответственности.",
    focus: "закрытие и повторное использование",
    endpoint: {
      selected: "evidence register, handover packs and reusable product asset",
      confirm: "deliverables review, open issues register and structured closeout package",
      receives: "photo evidence register, closeout index, digital supplier card and product line card",
    },
    detailActions: [["Photo Evidence Wall", "#photo-evidence-wall"], ["Handover Room", "#handover"]],
    copyVariant: "deliverables",
    sections: ["sourceDocuments", "riskRadar", "releaseGates", "handoverRoom", "vault", "copyPackage"],
  },
  {
    id: "addons",
    label: "Технические расширения",
    summary: "Optional extensions показывают, какие дополнительные пакеты можно согласовать отдельно, если WinGPro хочет усилить визуализацию, evidence, logistics/broker handoff или повторные продажи.",
    nextAction: "Выбрать, какие technical extension-пакеты нужны для visual/data/evidence/logistics/mounting/reuse слоев.",
    focus: "дополнительные опции",
    endpoint: {
      selected: "optional extension menu, not included automatically",
      confirm: "which add-ons are useful and should be agreed separately",
      receives: "clear menu of add-on opportunities without expanding base responsibility",
    },
    detailActions: [["Digital Twin", "#digital-twin"], ["Handover Room", "#handover"]],
    copyVariant: "addons",
    sections: ["digitalTwin", "vault", "handoverRoom", "sourceDocuments", "riskRadar"],
  },
];

const sectionSpotlightLabels: Record<string, { label: string; href: string; signal: string }> = {
  hero: { label: "Mission Cover", href: "#mission", signal: "технический cockpit" },
  digitalTwin: { label: "Digital Twin", href: "#digital-twin", signal: "объект сделки" },
  filmstrip: { label: "Filmstrip", href: "#filmstrip", signal: "сценарий сделки" },
  valueOs: { label: "Value OS", href: "#value-title", signal: "почему нужен data-room" },
  projectControl: { label: "Control Scale", href: "#project-control", signal: "модули управления" },
  controlRoom: { label: "Control Room", href: "#control-room", signal: "участники и owners" },
  routeMap: { label: "Route Map", href: "#route-title", signal: "China → Kazakhstan" },
  vault: { label: "Document Vault", href: "#vault", signal: "документы и evidence" },
  sourceDocuments: { label: "Source Docs", href: "#source-documents", signal: "исходные PDF / data-room" },
  hexnovasDecision: { label: "Hexnovas Board", href: "#hexnovas-decision-board", signal: "варианты поставщика" },
  riskRadar: { label: "Risk Radar", href: "#risk-radar", signal: "response pack" },
  releaseGates: { label: "Release Gates", href: "#release-gates", signal: "готовность данных" },
  statusOfCustomer: { label: "WinGPro Status", href: "#customer-title", signal: "зрелый заказчик" },
  handoverRoom: { label: "Handover Room", href: "#handover", signal: "пакеты передачи" },
  acceptance: { label: "Commercial Terms", href: "#commercial-terms", signal: "финансовая часть отдельно" },
  copyPackage: { label: "Board Pack", href: "#copy-title", signal: "технический summary" },
};

function StatusPill({ value }: { value: string }) {
  return <span className={styles.statusPill} data-status={value}>{value}</span>;
}

function formatSourceChecksum(value?: string) {
  if (!value) return "—";
  return `sha256: ${value.slice(0, 10)}…${value.slice(-6)}`;
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPumpEvidenceStatus(value: "ready" | "requested" | "missing") {
  if (value === "ready") return "готово";
  if (value === "requested") return "запросить";
  return "нужен документ";
}

function pressureDropTone(value: number) {
  return value <= 30 ? "ok" : "risk";
}

function anchorSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getHexnovasSignalId(title: string) {
  return `hexnovas-signal-${anchorSlug(title)}`;
}

function PlateHeatExchangerModel({
  activeLayer,
  rotating,
  onReady,
}: {
  activeLayer: TwinLayerId;
  rotating: boolean;
  onReady?: () => void;
}) {
  const groupRef = useRef<Group>(null);
  const readyRef = useRef(false);
  const plateCount = 54;
  const plateSpan = 2.46;
  const activeTint = activeLayer === "documents" || activeLayer === "sales" ? "#4f7ea8" : activeLayer === "delivery" ? "#f59f55" : "#f05f6d";
  const portPoints = [
    { key: "warm-supply", y: 0.74, z: 0.61, color: "#f47686", ring: "#9f1239" },
    { key: "warm-return", y: -0.74, z: 0.61, color: "#f47686", ring: "#9f1239" },
    { key: "cold-supply", y: 0.74, z: -0.61, color: "#7dc7f2", ring: "#0369a1" },
    { key: "cold-return", y: -0.74, z: -0.61, color: "#7dc7f2", ring: "#0369a1" },
  ] as const;
  const frameBeamPoints = [
    { key: "top-front", y: 1.36, z: 0.86 },
    { key: "top-back", y: 1.36, z: -0.86 },
    { key: "bottom-front", y: -1.36, z: 0.86 },
    { key: "bottom-back", y: -1.36, z: -0.86 },
  ] as const;
  const flowArrows = [
    { key: "eg-in-1", x: -0.72, y: 0.13, z: 0.42, color: "#f47686", direction: 1 },
    { key: "eg-in-2", x: 0.34, y: 0.13, z: 0.42, color: "#f47686", direction: 1 },
    { key: "water-in-1", x: 0.72, y: -0.13, z: -0.42, color: "#7dc7f2", direction: -1 },
    { key: "water-in-2", x: -0.34, y: -0.13, z: -0.42, color: "#7dc7f2", direction: -1 },
  ] as const;

  useFrame((state) => {
    if (!readyRef.current) {
      readyRef.current = true;
      onReady?.();
    }
    if (!groupRef.current) return;
    const orbit = rotating ? Math.sin(state.clock.elapsedTime * 0.52) * 0.22 : 0;
    groupRef.current.rotation.y = -0.46 + orbit;
    groupRef.current.rotation.x = -0.18;
    groupRef.current.rotation.z = 0.03;
    groupRef.current.position.y = 0.12 + (rotating ? Math.sin(state.clock.elapsedTime * 0.72) * 0.018 : 0);
  });

  return (
    <group ref={groupRef} position={[-0.18, 0.14, 0]} rotation={[-0.18, -0.46, 0.03]} scale={0.72}>
      {Array.from({ length: plateCount }, (_, index) => {
        const x = -plateSpan / 2 + index * (plateSpan / (plateCount - 1));
        const isWarm = index % 2 === 0;
        const ridgeColor = isWarm ? "#f7b9c2" : "#b8dcf3";
        const gasketColor = index % 4 === 0 ? "#0f172a" : "#526173";
        return (
          <group key={`plate-${index}`} position={[x, 0, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.024, 2.16, 1.32]} />
              <meshStandardMaterial
                color={isWarm ? "#fff3f4" : "#edf7ff"}
                metalness={0.18}
                roughness={0.28}
                emissive={isWarm ? "#ffd1d8" : "#cfefff"}
                emissiveIntensity={0.08}
              />
            </mesh>
            <mesh position={[0.017, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.01, 2.24, 1.38]} />
              <meshStandardMaterial color={gasketColor} metalness={0.16} roughness={0.44} />
            </mesh>
            <mesh position={[0.029, 0, 0]} rotation={[0.34, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.007, 0.018, 1.22]} />
              <meshStandardMaterial color={ridgeColor} metalness={0.22} roughness={0.24} />
            </mesh>
            <mesh position={[0.03, 0, 0]} rotation={[-0.34, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.007, 0.018, 1.22]} />
              <meshStandardMaterial color={ridgeColor} metalness={0.22} roughness={0.24} />
            </mesh>
          </group>
        );
      })}

      {[-1.42, 1.42].map((x) => (
        <mesh key={`frame-${x}`} position={[x, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.18, 2.46, 1.56]} />
          <meshStandardMaterial color={x > 0 ? "#fff7f7" : "#f8fbff"} metalness={0.22} roughness={0.32} />
        </mesh>
      ))}

      {frameBeamPoints.map((beam) => (
        <mesh key={`frame-beam-${beam.key}`} position={[0, beam.y, beam.z]} castShadow receiveShadow>
          <boxGeometry args={[3.08, 0.07, 0.09]} />
          <meshStandardMaterial color="#263447" metalness={0.5} roughness={0.22} />
        </mesh>
      ))}

      {[-0.42, 0.42].map((z) => (
        <mesh key={`service-guide-${z}`} position={[0, 0, z]} castShadow receiveShadow>
          <boxGeometry args={[2.86, 0.035, 0.045]} />
          <meshStandardMaterial color={z > 0 ? "#f47686" : "#7dc7f2"} emissive={z > 0 ? "#f05f6d" : "#329ed8"} emissiveIntensity={0.12} metalness={0.32} roughness={0.24} />
        </mesh>
      ))}

      {flowArrows.map((arrow) => (
        <group key={arrow.key} position={[arrow.x, arrow.y, arrow.z]} rotation={[0, 0, arrow.direction > 0 ? -Math.PI / 2 : Math.PI / 2]}>
          <mesh castShadow receiveShadow>
            <coneGeometry args={[0.06, 0.18, 28]} />
            <meshStandardMaterial color={arrow.color} emissive={arrow.color} emissiveIntensity={0.18} metalness={0.28} roughness={0.26} />
          </mesh>
          <mesh position={[0, -0.11, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.023, 0.023, 0.16, 18]} />
            <meshStandardMaterial color={arrow.color} emissive={arrow.color} emissiveIntensity={0.16} metalness={0.34} roughness={0.24} />
          </mesh>
        </group>
      ))}

      {[-0.82, 0, 0.82].map((x, index) => (
        <mesh key={`inspection-band-${index}`} position={[x, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.018, 2.34, 1.48]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.36} roughness={0.28} transparent opacity={0.48} />
        </mesh>
      ))}

      {[-0.55, 0.55].map((z) => (
        <mesh key={`flow-cold-${z}`} position={[0, -0.18, z]} castShadow>
          <boxGeometry args={[2.58, 0.05, 0.052]} />
          <meshStandardMaterial color={z > 0 ? "#7dc7f2" : "#f47686"} emissive={z > 0 ? "#329ed8" : "#f05f6d"} emissiveIntensity={0.18} />
        </mesh>
      ))}

      {[-0.78, 0.78].map((z) => (
        <mesh key={`rod-top-${z}`} position={[0, 1.16, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.028, 0.028, 3.18, 18]} />
          <meshStandardMaterial color="#718096" metalness={0.62} roughness={0.22} />
        </mesh>
      ))}
      {[-0.78, 0.78].map((z) => (
        <mesh key={`rod-bottom-${z}`} position={[0, -1.16, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.028, 0.028, 3.18, 18]} />
          <meshStandardMaterial color="#718096" metalness={0.62} roughness={0.22} />
        </mesh>
      ))}

      {[-1.68, 1.68].flatMap((x) => [-0.78, 0.78].flatMap((z) => [-1.16, 1.16].map((y) => (
        <mesh key={`compression-nut-${x}-${y}-${z}`} position={[x, y, z]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.08, 6]} />
          <meshStandardMaterial color="#1e293b" metalness={0.66} roughness={0.2} />
        </mesh>
      ))))}

      {portPoints.map((port, index) => (
        <group key={`port-${port.key}`} position={[1.58, port.y, port.z]}>
          <mesh position={[-0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
            <cylinderGeometry args={[0.34, 0.34, 0.045, 64]} />
            <meshStandardMaterial color={port.ring} metalness={0.42} roughness={0.24} />
          </mesh>
          <mesh position={[-0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.2, 56]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.48} roughness={0.22} />
          </mesh>
          <mesh position={[0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
            <cylinderGeometry args={[0.275, 0.275, 0.03, 56]} />
            <meshStandardMaterial color="#0f172a" metalness={0.42} roughness={0.3} />
          </mesh>
          <mesh position={[0.23, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
            <cylinderGeometry args={[0.17, 0.18, 0.58, 56]} />
            <meshStandardMaterial color="#d8e0e8" metalness={0.58} roughness={0.19} />
          </mesh>
          <mesh position={[0.47, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
            <cylinderGeometry args={[0.34, 0.34, 0.12, 64]} />
            <meshStandardMaterial color={port.color} emissive={port.color} emissiveIntensity={0.08} metalness={0.24} roughness={0.32} />
          </mesh>
          <mesh position={[0.55, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
            <torusGeometry args={[0.245, 0.028, 14, 56]} />
            <meshStandardMaterial color={port.ring} metalness={0.5} roughness={0.28} />
          </mesh>
          <mesh position={[0.68, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
            <cylinderGeometry args={[0.14, 0.15, 0.22, 48]} />
            <meshStandardMaterial color="#0f172a" metalness={0.48} roughness={0.27} />
          </mesh>
          <mesh position={[0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
            <cylinderGeometry args={[0.09, 0.09, 0.025, 36]} />
            <meshStandardMaterial color="#020617" metalness={0.22} roughness={0.5} />
          </mesh>
          <mesh position={[0.93, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
            <cylinderGeometry args={[0.095, 0.095, 0.18, 36]} />
            <meshStandardMaterial color="#101827" metalness={0.5} roughness={0.24} />
          </mesh>
          {Array.from({ length: 10 }, (_, boltIndex) => {
            const angle = (boltIndex / 10) * Math.PI * 2;
            return (
              <mesh
                key={`bolt-${index}-${boltIndex}`}
                position={[0.55, Math.cos(angle) * 0.29, Math.sin(angle) * 0.29]}
                rotation={[0, 0, Math.PI / 2]}
                castShadow
              >
                <cylinderGeometry args={[0.018, 0.018, 0.045, 10]} />
                <meshStandardMaterial color="#243244" metalness={0.72} roughness={0.18} />
              </mesh>
            );
          })}
        </group>
      ))}

      {[[-1.02, -1.48, 0.6], [1.02, -1.48, 0.6], [-1.02, -1.48, -0.6], [1.02, -1.48, -0.6]].map(([x, y, z], index) => (
        <group key={`foot-${index}`} position={[x, y, z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.22, 0.3, 0.16]} />
            <meshStandardMaterial color="#334155" metalness={0.34} roughness={0.28} />
          </mesh>
          <mesh position={[0, -0.17, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.46, 0.065, 0.32]} />
            <meshStandardMaterial color="#475569" metalness={0.42} roughness={0.24} />
          </mesh>
        </group>
      ))}

      {[-0.72, 0.72].map((z) => (
        <mesh key={`skid-${z}`} position={[0, -1.61, z]} castShadow receiveShadow>
          <boxGeometry args={[2.78, 0.07, 0.08]} />
          <meshStandardMaterial color="#263447" metalness={0.42} roughness={0.24} />
        </mesh>
      ))}

      <mesh position={[-1.62, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.13, 2.68, 1.72]} />
        <meshStandardMaterial color="#334155" metalness={0.38} roughness={0.3} />
      </mesh>
      <mesh position={[1.62, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.14, 2.68, 1.72]} />
        <meshStandardMaterial color={activeTint} metalness={0.28} roughness={0.34} />
      </mesh>
      <mesh position={[1.7, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.055, 2.5, 1.56]} />
        <meshStandardMaterial color="#ffffff" metalness={0.12} roughness={0.48} transparent opacity={0.42} />
      </mesh>
      <mesh position={[1.735, 0.08, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.012, 0.46, 0.28]} />
        <meshStandardMaterial color="#f7d76c" metalness={0.18} roughness={0.42} />
      </mesh>
      <mesh position={[1.77, -0.44, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.014, 0.32, 0.2]} />
        <meshStandardMaterial color="#dbeafe" metalness={0.18} roughness={0.38} />
      </mesh>
    </group>
  );
}

export default function WingproProposalPage({ proposalPath }: { proposalPath: string }) {
  const [activeLayer, setActiveLayer] = useState<TwinLayerId>("equipment");
  const [activeScene, setActiveScene] = useState<SceneId>("source");
  const [activeControlStep, setActiveControlStep] = useState<ControlStepId>("supplier");
  const [activeSupplier, setActiveSupplier] = useState<SupplierCandidateId>("candidate-a");
  const [offerDecisionMode, setOfferDecisionMode] = useState<OfferDecisionMode>("evidence");
  const [activeContractScenario, setActiveContractScenario] = useState<ContractScenarioId>("balanced");
  const [activeDeliveryPhase, setActiveDeliveryPhase] = useState<DeliveryPhaseId>("release");
  const [activeEvidencePhase, setActiveEvidencePhase] = useState<EvidencePhase>("Before shipment");
  const [activeFieldStatus, setActiveFieldStatus] = useState<FieldStatus>("Planned");
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
  const [activePack, setActivePack] = useState<(typeof handoverPacks)[number]["name"]>(handoverPacks[0].name);
  const [paymentMode, setPaymentMode] = useState<"split" | "full">("split");
  const [isRotating, setIsRotating] = useState(true);
  const [presentationMode, setPresentationMode] = useState(false);
  const [twinModelReady, setTwinModelReady] = useState(false);
  const [twinLabelDensity, setTwinLabelDensity] = useState<"focus" | "full">("focus");
  const [activePresentationMode, setActivePresentationMode] = useState<PresentationModeId>("executive");
  const [copyStatus, setCopyStatus] = useState("Готово");
  const [copyVariant, setCopyVariant] = useState<CopyVariant>("short");
  const [modeEndpointOpen, setModeEndpointOpen] = useState(false);
  const [executiveDetailsOpen, setExecutiveDetailsOpen] = useState(false);
  const [copyActionsOpen, setCopyActionsOpen] = useState(false);
  const [commercialOpen, setCommercialOpen] = useState(false);
  const [commercialStatus, setCommercialStatus] = useState("Коммерческий контур раскрыт отдельно от технического экрана");
  const [sourceDownloadStatus, setSourceDownloadStatus] = useState("");
  const [activeHexnovasVariantId, setActiveHexnovasVariantId] = useState<HexnovasVariantId>(HEXNOVAS_RECOMMENDED_VARIANT_ID);
  const [hexnovasDecisionStatus, setHexnovasDecisionStatus] = useState("Ожидает выбора и отправки решения");
  const [hexnovasDecisionOwner, setHexnovasDecisionOwner] = useState("");
  const [hexnovasDecisionComment, setHexnovasDecisionComment] = useState("");
  const [hexnovasEvidenceOpen, setHexnovasEvidenceOpen] = useState(false);
  const [activeHexnovasSignalTitle, setActiveHexnovasSignalTitle] = useState<string | null>(null);
  const [accessStatus, setAccessStatus] = useState<"checking" | "locked" | "unlocked">("checking");
  const [accessPassword, setAccessPassword] = useState("");
  const [accessMessage, setAccessMessage] = useState("Введите пароль доступа к странице");
  const copyRef = useRef<HTMLTextAreaElement>(null);
  const presentationTabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const layer = twinLayers.find((item) => item.id === activeLayer) ?? twinLayers[0];
  const scene = scenes.find((item) => item.id === activeScene) ?? scenes[0];
  const activeSceneIndex = scenes.findIndex((item) => item.id === scene.id) + 1;
  const sceneLayerTitle = twinLayers.find((item) => item.id === scene.layer)?.title ?? scene.layer;
  const activeControl = projectControlScale.find((item) => item.id === activeControlStep) ?? projectControlScale[0];
  const supplier = supplierCandidates.find((item) => item.id === activeSupplier) ?? supplierCandidates[0];
  const decisionMode = offerDecisionModes.find((item) => item.id === offerDecisionMode) ?? offerDecisionModes[0];
  const contractScenario = contractScenarios.find((item) => item.id === activeContractScenario) ?? contractScenarios[0];
  const deliveryPhase = deliveryTimeline.find((item) => item.id === activeDeliveryPhase) ?? deliveryTimeline[0];
  const activeFieldTasks = fieldTasks.filter((task) => task[1] === activeFieldStatus);
  const evidenceCard = evidenceCards.find(([phase]) => phase === activeEvidencePhase) ?? evidenceCards[0];
  const evidenceHandoff = evidenceHandoffLinks.find((item) => item.phase === activeEvidencePhase) ?? evidenceHandoffLinks[0];
  const participant = participants.find((item) => item.name === activeParticipant) ?? participants[0];
  const routePoint = routePoints.find((item) => item.title === activeRoute) ?? routePoints[0];
  const risk = risks.find((item) => item.id === activeRisk) ?? risks[0];
  const riskVaultDocs = vaultDocs.filter((doc) => (
    risk.vaultEvidence.toLowerCase().includes(doc[1].toLowerCase())
    || doc[1].toLowerCase().includes(risk.vaultEvidence.toLowerCase())
    || risk.evidence.toLowerCase().includes(doc[1].toLowerCase())
    || doc[8].toLowerCase().includes(risk.impact)
    || doc[9].toLowerCase().includes(risk.title)
  )).slice(0, 4);
  const riskResponseSequence = [
    ["1. Evidence request", risk.evidence],
    ["2. Owner decision", risk.decision],
    ["3. Release gate action", risk.releaseGate],
    ["4. Route / handoff signal", risk.routeHandoff],
  ] as const;
  const gate = gates[activeGate] ?? gates[0];
  const gateVaultLinks = getGateVaultLinks(gate[0]);
  const gateRiskLinks = getGateRiskLinks(gate[0]);
  const gateRouteLinks = getGateRouteLinks(gate[0]);
  const gateCommandSequence = [
    ["1. Owner decision", gate[3]],
    ["2. Evidence board", gateVaultLinks.length > 0 ? gateVaultLinks.join(", ") : gate[2]],
    ["3. Risk check", gateRiskLinks.length > 0 ? gateRiskLinks.join(", ") : "closeout / open issues"],
    ["4. Route handoff", gateRouteLinks.length > 0 ? gateRouteLinks.join(", ") : "Handover Room"],
    ["5. Output artifact", gate[6]],
  ] as const;
  const handoverPack = handoverPacks.find((item) => item.name === activePack) ?? handoverPacks[0];
  const handoverGateLinks = getHandoverGateLinks(handoverPack);
  const handoverVaultLinks = getHandoverVaultLinks(handoverPack);
  const handoverRiskLinks = getHandoverRiskLinks(handoverPack);
  const handoverRouteLinks = getHandoverRouteLinks(handoverPack);
  const handoverCommandSequence = [
    ["1. Gate closeout", handoverGateLinks.map((item) => item[0]).join(", ") || handoverPack.gate],
    ["2. Vault evidence", uniqueList(handoverVaultLinks.map((item) => item[1])).join(", ") || handoverPack.evidence],
    ["3. Risk response", uniqueList(handoverRiskLinks.map((item) => item.title)).join(", ") || "open issues register"],
    ["4. Route / data-flow", uniqueList(handoverRouteLinks.map((item) => item.title)).join(", ") || "Handover Room"],
    ["5. Handover evidence", handoverPack.paymentLink],
    ["6. Reusable asset", handoverPack.reusable],
  ] as const;
  const handoverOutcomeCards = [
    {
      label: "что передается",
      value: handoverPack.name,
      detail: handoverPack.inside,
    },
    {
      label: "кто проверяет",
      value: handoverPack.recipient,
      detail: getHandoverOwnerCue(handoverPack),
    },
    {
      label: "что остается видимым",
      value: uniqueList(handoverRiskLinks.map((item) => item.title)).join(", ") || "open issues register",
      detail: "открытые вопросы остаются в closeout register до решения профильных участников",
    },
    {
      label: "что можно переиспользовать",
      value: handoverPack.format,
      detail: handoverPack.reusable,
    },
  ] as const;
  const categories = Array.from(new Set(vaultDocs.map((doc) => doc[0])));
  const owners = Array.from(new Set(vaultDocs.map((doc) => doc[4])));
  const gatesList = Array.from(new Set(vaultDocs.map((doc) => doc[3])));
  const visibleDocs = vaultDocs.filter((doc) => isDocVisible(doc));
  const visibleOpenDocs = visibleDocs.filter((doc) => doc[5] === "missing" || doc[5] === "requested");
  const visibleOpenFocusDocs = visibleOpenDocs.slice(0, 3);
  const visibleReadyDocs = visibleDocs.filter((doc) => doc[5] === "ready").length;
  const vaultActiveQuery = [
    ["category", vaultCategory],
    ["status", vaultStatus],
    ["owner", vaultOwner],
    ["gate", vaultGate],
    ["impact", vaultImpact],
    ["mode", vaultMode],
  ].filter(([, value]) => value !== "all" && value !== "vault");
  const vaultOwnerQueue = uniqueList(visibleOpenDocs.map((doc) => doc[4]));
  const vaultReleaseQueue = uniqueList(visibleOpenDocs.map((doc) => getVaultReleaseLane(doc[3])));
  const vaultResponsePackage = [
    ["owners", vaultOwnerQueue.length ? vaultOwnerQueue.join(" / ") : "no open owner queue"],
    ["release focus", vaultReleaseQueue.length ? vaultReleaseQueue.join(" / ") : "filtered scope ready"],
    ["next evidence request", visibleOpenDocs[0]?.[10] ?? "no missing/requested evidence in current filter"],
  ] as const;
  const vaultReadinessStats = [
    ["visible documents", String(visibleDocs.length), "current filtered operating scope"],
    ["open evidence", String(visibleOpenDocs.length), "missing or requested items that need owner response"],
    ["ready for handoff", String(visibleReadyDocs), "items already usable in packs"],
    ["route links", String(new Set(visibleDocs.map((doc) => getVaultRouteLink(doc[0], doc[3]))).size), "delivery points connected to vault"],
  ] as const;
  const sourceDocumentStats = [
    [`${sourceDocuments.length} PDF-файла`, "исходники + паспорта", "просмотр и скачивание"],
    ["ХС / холодоснабжение", "source scope", "без расширения до всего ФОК"],
    ["Pedrollo 2+2", "закупленные насосы", "сверить серийники и место установки"],
    ["Исходная база", "не утверждение UPGRADE", "передается профильным участникам"],
  ] as const;
  const purchasedPumpDocs = sourceDocuments.filter((doc) => doc.procurementStatus);
  const pumpEvidenceStatusSummary = [
    [
      String(purchasedPumpEvidenceRequests.filter((item) => item.status === "ready").length),
      "ready evidence",
      "паспорта уже в data-room",
    ],
    [
      String(purchasedPumpEvidenceRequests.filter((item) => item.status === "requested").length),
      "owner requests",
      "серийники, контур и сервисная зона",
    ],
    [
      String(purchasedPumpEvidenceRequests.filter((item) => item.status === "missing").length),
      "document gap",
      "накладная / счет / складской факт",
    ],
  ] as const;
  const hexnovasArchiveFileCount = hexnovasArchiveGroups.reduce((sum, item) => sum + item.files, 0);
  const hexnovasPublicEvidenceCount = sourceDocuments.length + hexnovasDocumentSignals.filter((item) => Boolean(item.href)).length;
  const hexnovasPrivateArchiveCount = hexnovasArchiveGroups.reduce((sum, item) => sum + Math.max(item.files - item.publicEvidence, 0), 0);
  const hexnovasPackageOverviewStats = [
    ["archive files", String(hexnovasArchiveFileCount), "full package from Hexnovas / WinGPro"],
    ["public evidence", String(hexnovasPublicEvidenceCount), "safe technical assets linked in page"],
    ["private archive", String(hexnovasPrivateArchiveCount), "contracts, requisites and correspondence stay gated"],
    ["decision rules", String(hexnovasPackageRules.length), "recommended / economy / risk / contract consistency"],
  ] as const;
  const recommendedHexnovasVariant = hexnovasVariants.find((item) => item.id === HEXNOVAS_RECOMMENDED_VARIANT_ID) ?? hexnovasVariants[0];
  const activeHexnovasVariant = hexnovasVariants.find((item) => item.id === activeHexnovasVariantId) ?? recommendedHexnovasVariant;
  const activeHexnovasDelta = activeHexnovasVariant.totalPriceUsd - recommendedHexnovasVariant.totalPriceUsd;
  const activeHexnovasEquipmentRouteTotal = activeHexnovasVariant.totalPriceUsd + hexnovasProject.logisticsReserveUsdForTwoUnits;
  const activeHexnovasMaterialSignal = activeHexnovasVariant.material.includes("304")
    ? "замена материала требует письменного согласования"
    : "материал совпадает с референсом 316L";
  const hexnovasDecisionPublicUrl = `https://upgradefor.com${proposalPath}?variant=${encodeURIComponent(activeHexnovasVariant.id)}#hexnovas-decision-board`;
  const hexnovasDecisionSummaryText = `Hexnovas Decision Board: рекомендуемый технический вариант — ${recommendedHexnovasVariant.name}, supplier equipment package ${formatUsd(recommendedHexnovasVariant.totalPriceUsd)} за ${recommendedHexnovasVariant.quantity} шт.; перепад ${recommendedHexnovasVariant.pressureDropKpaHot.toFixed(1)} / ${recommendedHexnovasVariant.pressureDropKpaCold.toFixed(1)} kPa. Выбранный сценарий сейчас — ${activeHexnovasVariant.name}, supplier equipment package ${formatUsd(activeHexnovasVariant.totalPriceUsd)}; ${activeHexnovasMaterialSignal}. Эти суммы относятся к предложению Hexnovas на оборудование и логистическому reserve; это supplier-only ориентир, не итоговая стоимость проекта. Если WinGPro выбирает TH150B-381H, PI/договор по BH150B-307H нужно обновить до release. UPGRADE структурирует source data, supplier evidence, risks and handover; технические решения подтверждают профильные участники.`;
  const hexnovasDecisionEmailSubject = `WinGPro decision — ${activeHexnovasVariant.shortName}`;
  const hexnovasDecisionEmailText = [
    "Решение по выбору теплообменника WinGPro / Hexnovas",
    "",
    `Выбранный вариант: ${activeHexnovasVariant.name}`,
    `Статус: ${activeHexnovasVariant.statusLabel}`,
    `Материал: ${activeHexnovasVariant.material}`,
    `Количество: ${activeHexnovasVariant.quantity} шт.`,
    `Supplier equipment package: ${formatUsd(activeHexnovasVariant.totalPriceUsd)}`,
    `Pressure drop: hot ${activeHexnovasVariant.pressureDropKpaHot.toFixed(1)} kPa / cold ${activeHexnovasVariant.pressureDropKpaCold.toFixed(1)} kPa`,
    `Следующее действие: ${activeHexnovasVariant.action}`,
    "",
    "Decision note:",
    activeHexnovasVariant.decisionAlert,
    "",
    "Owner confirmation:",
    `Имя / должность: ${hexnovasDecisionOwner.trim() || "______________________________"}`,
    `Комментарий: ${hexnovasDecisionComment.trim() || "______________________________"}`,
    "",
    "Boundary:",
    "UPGRADE структурирует source data, supplier evidence, decision board, risk register and handover pack. Технические, договорные и проектные решения подтверждают WinGPro и профильные участники.",
    "",
    `send_to: ${HEXNOVAS_DECISION_EMAIL}`,
    `source_path: ${proposalPath}`,
    `decision_board: ${proposalPath}#hexnovas-decision-board`,
    `public_decision_link: ${hexnovasDecisionPublicUrl}`,
  ].join("\n");
  const hexnovasDecisionMailto = `mailto:${HEXNOVAS_DECISION_EMAIL}?subject=${encodeURIComponent(hexnovasDecisionEmailSubject)}&body=${encodeURIComponent(hexnovasDecisionEmailText)}`;
  const hexnovasEvidenceBridgeStats = [
    ["ready evidence", String(hexnovasDocumentSignals.filter((item) => item.status === "ready").length), "можно положить в vault"],
    ["update required", String(hexnovasDocumentSignals.filter((item) => item.status === "update-required").length), "PI / drawing должны совпасть с выбранной моделью"],
    ["owner approval", String(hexnovasDocumentSignals.filter((item) => item.status === "approval-required").length), "нужно письменное решение WinGPro"],
    ["archive risk", String(hexnovasDocumentSignals.filter((item) => item.status === "archive").length), "хранить как риск-доказательство"],
  ] as const;
  const hexnovasNextEvidenceAction = activeHexnovasVariant.status === "economy_option_requires_buyer_approval"
    ? {
        title: "Сначала письменное согласование AISI 304",
        detail: "Материал отличается от референса 316L; без owner approval этот сценарий не должен уходить в release.",
        owner: "WinGPro technical owner",
      }
    : activeHexnovasVariant.status === "not_recommended_without_hydraulic_approval"
      ? {
          title: "Сначала гидравлическое подтверждение BH150B",
          detail: "Перепад давления выше целевого коридора; хранить как risk evidence до проверки профильным специалистом.",
          owner: "project designer / WinGPro technical owner",
        }
      : {
          title: "Запросить обновленные PI и GA drawing под TH150B / 316L",
          detail: "Рекомендованная линия может идти дальше только после сверки supplier evidence, модели, материала и чертежа.",
          owner: "supplier + WinGPro technical owner",
        };
  const hexnovasDecisionReceiptSteps = [
    ["1", "Выбор", `${activeHexnovasVariant.shortName} зафиксирован как активный сценарий`],
    ["2", "Email", `готовое письмо открывается на ${HEXNOVAS_DECISION_EMAIL}`],
    ["3", "После отправки", hexnovasNextEvidenceAction.title],
  ] as const;
  const hexnovasDecisionHandoffCards = [
    ["Куда уйдет", HEXNOVAS_DECISION_EMAIL, "decision inbox"],
    ["Выбранный вариант", activeHexnovasVariant.shortName, activeHexnovasVariant.statusLabel],
    ["Следующий запрос", hexnovasNextEvidenceAction.title, hexnovasNextEvidenceAction.owner],
    ["Публичная ссылка", "upgradefor.com → выбранный вариант", "копируется для ручной отправки"],
  ] as const;
  const hexnovasVaultRouteCards = [
    ["recommended route", "TH150B / 316L", "Gate 1", "обновить PI + GA drawing под выбранную модель", "supplier + WinGPro technical owner"],
    ["material decision", "TH150B / 304", "Owner decision", "оставить как эконом-вариант только после письменного согласия", "WinGPro technical owner"],
    ["risk evidence", "BH150B / 316L", "Risk Radar", "не использовать как рекомендацию без hydraulic approval", "project designer / WinGPro technical owner"],
    ["supplier identity", "CE/PED + ISO + registration", "Vault check", "сложить в evidence pack и передать на профильную проверку", "WinGPro / supplier"],
  ] as const;
  const hexnovasVaultTraceStats = [
    ["source signals", String(hexnovasVaultTraceRows.length), "linked to release gates"],
    ["primary owners", String(new Set(hexnovasVaultTraceRows.map((row) => row.owner)).size), "owner queue is explicit"],
    ["approval boundaries", String(hexnovasVaultTraceRows.filter((row) => row.approvalBoundary.includes("UPGRADE") || row.approvalBoundary.includes("WinGPro")).length), "role boundary shown per row"],
  ] as const;
  const activePresentation = presentationModes.find((item) => item.id === activePresentationMode) ?? presentationModes[0];
  const decisionPath = [
    {
      mode: "supplier",
      label: "01 supplier",
      title: supplier.name,
      detail: `${supplier.channel} / score ${supplier.score}`,
      output: supplier.decisionSignal,
    },
    {
      mode: "contract",
      label: "02 contract",
      title: contractScenario.title,
      detail: contractScenario.evidenceGateStrength,
      output: contractScenario.ownerRequiredDecision,
    },
    {
      mode: "delivery",
      label: "03 delivery",
      title: deliveryPhase.phase,
      detail: deliveryPhase.statusControl,
      output: deliveryPhase.handoff,
    },
    {
      mode: "workplan",
      label: "04 work plan",
      title: activeControl.title,
      detail: activeControl.artifact,
      output: activeControl.nextAction,
    },
    {
      mode: "handover",
      label: "05 handover",
      title: handoverPack.name,
      detail: handoverPack.gate,
      output: handoverPack.acceptance,
    },
  ] as const satisfies ReadonlyArray<{
    mode: PresentationModeId;
    label: string;
    title: string;
    detail: string;
    output: string;
  }>;
  const decisionBlockerQueue = uniqueList([
    ...supplier.blockers.slice(0, 2),
    ...contractScenario.unresolvedBlockers.slice(0, 2),
    deliveryPhase.blocker,
    evidenceHandoff.riskLink,
    handoverRiskLinks[0]?.title ?? "",
  ]).slice(0, 5);
  const executiveOutcomeCards = [
    {
      label: "Selected route",
      value: `${supplier.name} / ${supplier.status}`,
      detail: supplier.decisionSignal,
      href: "#offer-comparison-board",
    },
    {
      label: "Contract frame",
      value: contractScenario.title,
      detail: contractScenario.evidenceGateStrength,
      href: "#contract-decision-simulator",
    },
    {
      label: "Release focus",
      value: deliveryPhase.releaseGate,
      detail: deliveryPhase.statusControl,
      href: "#delivery-timeline",
    },
    {
      label: "Handover package",
      value: handoverPack.name,
      detail: handoverPack.acceptance,
      href: "#handover",
    },
  ] as const;
  const cockpitSummaryCards = [
    {
      mode: "supplier",
      label: "Selected supplier",
      value: supplier.name,
      status: supplier.status,
      detail: supplier.blockers[0] ?? supplier.decisionSignal,
    },
    {
      mode: "contract",
      label: "Contract scenario",
      value: contractScenario.title,
      status: "deliverable handoff",
      detail: contractScenario.evidenceGateStrength,
    },
    {
      mode: "delivery",
      label: "Delivery readiness",
      value: deliveryPhase.releaseGate,
      status: deliveryPhase.statusControl,
      detail: deliveryPhase.blocker,
    },
    {
      mode: "workplan",
      label: "Work plan readiness",
      value: "ППР skeleton",
      status: activeControl.title,
      detail: activeControl.nextAction,
    },
    {
      mode: "handover",
      label: "Evidence readiness",
      value: evidenceHandoff.phase,
      status: evidenceHandoff.gate,
      detail: evidenceHandoff.riskLink,
    },
    {
      mode: "handover",
      label: "Handover readiness",
      value: handoverPack.name,
      status: "Digital Product Asset",
      detail: handoverPack.acceptance,
    },
  ] as const;
  const cockpitKpis = [
    {
      label: "выбранный маршрут",
      value: activeHexnovasVariant.shortName,
      detail: activeHexnovasVariant.statusLabel,
    },
    {
      label: "следующий blocker",
      value: decisionBlockerQueue[0],
      detail: `${decisionBlockerQueue.length} items in queue`,
    },
    {
      label: "release gate",
      value: deliveryPhase.releaseGate,
      detail: deliveryPhase.statusControl,
    },
    {
      label: "evidence handoff",
      value: evidenceHandoff.gate,
      detail: handoverPack.name,
    },
  ] as const;
  const cockpitAddonOpportunities = [
    "3D product visualization package",
    "supplier/product card expansion",
    "broker/logistics data-pack coordination",
    "mounting coordination pack expansion",
    "photo/evidence reporting setup",
    "future sales catalog preparation",
  ] as const;
  const decisionOutcomeText = `Выбранный маршрут: ${supplier.name} (${supplier.channel}, score ${supplier.score}) ведется как ${supplier.status} через ${decisionMode.title} decision logic. Contract frame: ${contractScenario.title}; evidence gate: ${contractScenario.evidenceGateStrength}. Delivery focus: ${deliveryPhase.phase} / ${deliveryPhase.releaseGate}; статус: ${deliveryPhase.statusControl}. Work plan: ${activeControl.title} как coordination draft, не официальный ППР. Evidence / handover: ${evidenceHandoff.phase} передается в ${handoverPack.name}. Открытые blocker items: ${decisionBlockerQueue.join("; ")}. UPGRADE структурирует данные, статусы, evidence и handover-пакеты; профильные участники утверждают и исполняют решения в своих зонах ответственности.`;
  const cockpitSummaryText = `WinGPro Cockpit Summary: selected supplier — ${supplier.name} (${supplier.status}, ${supplier.channel}); PlateHE route — ${activeHexnovasVariant.shortName} (${activeHexnovasVariant.statusLabel}); decision email — ${HEXNOVAS_DECISION_EMAIL}; contract scenario — ${contractScenario.title}; delivery gate — ${deliveryPhase.releaseGate}; work plan readiness — ППР skeleton / coordination draft; evidence readiness — ${evidenceHandoff.gate}; handover readiness — ${handoverPack.name}; blockers — ${decisionBlockerQueue.length} (${decisionBlockerQueue.join("; ")}); next action — ${activePresentation.nextAction}.`;

  useEffect(() => {
    const applyTechnicalTitle = () => {
      document.title = WINGPRO_TECHNICAL_PAGE_TITLE;
    };
    applyTechnicalTitle();
    const titleRefresh = window.setTimeout(applyTechnicalTitle, 250);
    return () => window.clearTimeout(titleRefresh);
  }, [accessStatus]);

  useEffect(() => {
    document.title = WINGPRO_TECHNICAL_PAGE_TITLE;
  }, [commercialOpen, activeLayer, activePresentationMode]);

  useEffect(() => {
    const next = `#layer-${activeLayer}`;
    const currentHash = window.location.hash;
    if (currentHash && !currentHash.startsWith("#layer-")) return;
    if (currentHash !== next) window.history.replaceState(null, "", next);
  }, [activeLayer]);

  useEffect(() => {
    if (accessStatus !== "unlocked") return;
    const currentHash = window.location.hash;
    if (!currentHash || currentHash.startsWith("#layer-")) return;
    window.requestAnimationFrame(() => {
      document.getElementById(decodeURIComponent(currentHash.slice(1)))?.scrollIntoView({ block: "start" });
    });
  }, [accessStatus]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPresentationMode(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsRotating(false);
    }
  }, []);

  useEffect(() => {
    const storedAccess = window.localStorage.getItem(WINGPRO_ACCESS_STORAGE_KEY);
    setAccessStatus(storedAccess === "granted" ? "unlocked" : "locked");
  }, []);

  useEffect(() => {
    const variantParam = new URLSearchParams(window.location.search).get("variant");
    const linkedVariant = hexnovasVariants.find((item) => item.id === variantParam);
    if (!linkedVariant) return;
    setActiveHexnovasVariantId(linkedVariant.id);
    setHexnovasDecisionStatus(`Открыт вариант из ссылки: ${linkedVariant.shortName}`);
  }, []);

  function selectHexnovasVariant(item: (typeof hexnovasVariants)[number]) {
    setActiveHexnovasVariantId(item.id);
    setHexnovasDecisionStatus(`Выбран ${item.shortName}; письмо будет подготовлено на ${HEXNOVAS_DECISION_EMAIL}`);

    const params = new URLSearchParams(window.location.search);
    params.set("variant", item.id);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}#hexnovas-decision-board`);
  }

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

  function resetVaultFilters() {
    setVaultCategory("all");
    setVaultStatus("all");
    setVaultOwner("all");
    setVaultGate("all");
    setVaultImpact("all");
    setVaultMode("vault");
  }

  function showVaultOpenItems() {
    setVaultCategory("all");
    setVaultStatus("all");
    setVaultOwner("all");
    setVaultGate("all");
    setVaultImpact("all");
    setVaultMode("missing");
  }

  function selectRiskImpact(nextImpact: RiskImpact | "all") {
    setRiskImpact(nextImpact);
    if (nextImpact === "all") return;
    const nextRisk = risks.find((item) => item.impact === nextImpact);
    if (nextRisk) setActiveRisk(nextRisk.id);
  }

  function selectScene(id: SceneId) {
    const next = scenes.find((item) => item.id === id);
    setActiveScene(id);
    if (next) setActiveLayer(next.layer as TwinLayerId);
  }

  function focusPresentationTab(index: number) {
    const boundedIndex = (index + presentationModes.length) % presentationModes.length;
    const nextMode = presentationModes[boundedIndex];
    setActivePresentationMode(nextMode.id);
    window.requestAnimationFrame(() => presentationTabRefs.current[boundedIndex]?.focus());
  }

  function onPresentationTabKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      focusPresentationTab(index + 1);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      focusPresentationTab(index - 1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      focusPresentationTab(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      focusPresentationTab(presentationModes.length - 1);
    }
  }

  function isPresentationSection(section: string) {
    return activePresentation.sections.includes(section);
  }

  function sectionClass(baseClass: string, section: string) {
    return `${baseClass} ${isPresentationSection(section) ? styles.presentationSectionActive : ""}`;
  }

  async function copyPlainText(text: string, status = "Скопировано") {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        setCopyStatus(status);
        return;
      } catch {
        // Fallback below keeps file/preview contexts usable.
      }
    }
    const fallbackTextarea = copyRef.current ?? document.createElement("textarea");
    const isTemporaryFallback = !copyRef.current;
    if (isTemporaryFallback) {
      fallbackTextarea.setAttribute("aria-hidden", "true");
      fallbackTextarea.style.position = "fixed";
      fallbackTextarea.style.inset = "0 auto auto 0";
      fallbackTextarea.style.width = "1px";
      fallbackTextarea.style.height = "1px";
      fallbackTextarea.style.opacity = "0";
      document.body.appendChild(fallbackTextarea);
    } else {
      fallbackTextarea.hidden = false;
    }
    fallbackTextarea.value = text;
    fallbackTextarea.focus();
    fallbackTextarea.select();
    const ok = document.execCommand("copy");
    if (isTemporaryFallback) {
      fallbackTextarea.remove();
    } else {
      fallbackTextarea.hidden = true;
      fallbackTextarea.value = copyTexts[copyVariant];
    }
    setCopyStatus(ok ? `${status} через fallback` : "Не удалось скопировать автоматически");
  }

  async function copyBoardText(variant: CopyVariant) {
    setCopyVariant(variant);
    await copyPlainText(copyTexts[variant], "Скопировано");
  }

  async function copyDecisionOutcome() {
    setCopyVariant("command");
    await copyPlainText(decisionOutcomeText, "Selected outcome скопирован");
  }

  async function copyCockpitSummary() {
    setCopyVariant("command");
    await copyPlainText(cockpitSummaryText, "Технический summary скопирован");
  }

  async function copyHexnovasDecisionSummary() {
    setCopyVariant("command");
    await copyPlainText(hexnovasDecisionSummaryText, "Hexnovas decision summary скопирован");
  }

  async function copyHexnovasDecisionEmail() {
    setCopyVariant("command");
    setHexnovasDecisionStatus("Текст решения скопирован; можно отправить на info@upgradefor.com");
    await copyPlainText(hexnovasDecisionEmailText, "Текст решения скопирован");
  }

  async function copyHexnovasDecisionPublicLink() {
    setCopyVariant("command");
    setHexnovasDecisionStatus("Ссылка на Decision Board скопирована");
    await copyPlainText(hexnovasDecisionPublicUrl, "Ссылка на Decision Board скопирована");
  }

  function markHexnovasDecisionEmailOpen() {
    setHexnovasDecisionStatus(`Открываем письмо на ${HEXNOVAS_DECISION_EMAIL} по выбранному варианту ${activeHexnovasVariant.shortName}`);
    setCopyStatus(`Письмо на ${HEXNOVAS_DECISION_EMAIL} готовится`);
  }

  function unlockWingproProposal(event: ReactFormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (accessPassword.trim() === WINGPRO_ACCESS_PASSWORD) {
      window.localStorage.setItem(WINGPRO_ACCESS_STORAGE_KEY, "granted");
      setAccessStatus("unlocked");
      setAccessMessage("Доступ открыт");
      setAccessPassword("");
      return;
    }

    setAccessStatus("locked");
    setAccessMessage("Неверный пароль. Проверьте код доступа и попробуйте еще раз.");
    setAccessPassword("");
  }

  function openHexnovasEvidenceSignal(event: ReactMouseEvent<HTMLAnchorElement>, title: string) {
    event.preventDefault();
    const targetId = getHexnovasSignalId(title);
    setHexnovasEvidenceOpen(true);
    setActiveHexnovasSignalTitle(title);

    window.setTimeout(() => {
      const target = document.getElementById(targetId);
      if (!target) return;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      target.focus({ preventScroll: true });
      window.history.replaceState(null, "", `#${targetId}`);
    }, 80);
  }

  async function copyCommercialMessage(variant: CopyVariant) {
    setCopyActionsOpen(true);
    setCommercialStatus("Коммерческое сообщение скопировано");
    await copyBoardText(variant);
  }

  function triggerSourceDocumentDownload(doc: SourceDocument, index: number) {
    window.setTimeout(() => {
      const link = document.createElement("a");
      link.href = doc.href;
      link.download = doc.downloadName;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }, index * 280);
  }

  function downloadSourceDocuments() {
    sourceDocuments.forEach((doc, index) => triggerSourceDocumentDownload(doc, index));
    setSourceDownloadStatus("Пакет исходных данных подготовлен к скачиванию");
  }

  if (accessStatus !== "unlocked") {
    return (
      <main className={styles.passwordGatePage} data-theme-scope="light" data-proposal-id="wingpro-2605281047" data-wingpro-password-gate>
        <section className={styles.passwordGateCard} aria-labelledby="wingpro-password-title">
          <div className={styles.passwordGateBrand}>
            <span>WinGPro × UPGRADE</span>
            <h1 id="wingpro-password-title">Доступ к технической панели</h1>
            <p>Страница открывается без логина: нужен только пароль доступа, переданный для просмотра КП.</p>
          </div>
          <form className={styles.passwordGateForm} onSubmit={unlockWingproProposal}>
            <label htmlFor="wingpro-access-password">Пароль</label>
            <input
              id="wingpro-access-password"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              value={accessPassword}
              onChange={(event) => setAccessPassword(event.currentTarget.value)}
              disabled={accessStatus === "checking"}
              aria-describedby="wingpro-access-status"
            />
            <button type="submit" disabled={accessStatus === "checking"}>Открыть страницу</button>
            <p id="wingpro-access-status" role="status" aria-live="polite">
              {accessStatus === "checking" ? "Проверяем сохраненный доступ" : accessMessage}
            </p>
          </form>
          <div className={styles.passwordGateMeta} aria-label="Access scope">
            <span>protected preview</span>
            <span>/cp/2605281047-wingpro</span>
            <span>без аккаунта и логина</span>
          </div>
        </section>
      </main>
    );
  }

  const twinStage = (
    <div
      className={styles.twinStage}
      data-layer={activeLayer}
      data-label-density={twinLabelDensity}
      data-model-ready={twinModelReady ? "true" : "false"}
    >
      <div className={styles.twinStageHeader}>
        <span>3D-модель ПТО</span>
        <strong>{layer.title}</strong>
        <small>{layer.gate}</small>
      </div>
      <div className={styles.twinCanvasWrap} aria-hidden="true">
        <Canvas
          className={styles.twinCanvas}
          camera={{ position: [0, 0.08, 7.1], fov: 38 }}
          dpr={[1, 1.7]}
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
          onCreated={() => setTwinModelReady(true)}
          shadows
        >
          <ambientLight intensity={1.45} />
          <directionalLight position={[4, 5, 5]} intensity={2.4} castShadow />
          <directionalLight position={[-4, 2, -3]} intensity={0.76} />
          <pointLight position={[0, 1.8, 2.6]} intensity={0.9} color="#ffdbe0" />
          <PlateHeatExchangerModel
            activeLayer={activeLayer}
            rotating={isRotating && !presentationMode}
            onReady={() => setTwinModelReady(true)}
          />
        </Canvas>
        <div className={styles.twinServiceEnvelope} aria-hidden="true">
          <span>service access envelope</span>
        </div>
        <div className={styles.twinConnectionCues} role="list" aria-label="Plate heat exchanger connection cues">
          {twinConnectionCues.map((item, index) => (
            <span
              key={item.label}
              className={styles.twinConnectionCue}
              data-tone={item.tone}
              role="listitem"
              style={{ ["--x" as string]: item.x, ["--y" as string]: item.y }}
            >
              <em>{index + 1}</em>
              <strong>{item.label}</strong>
              <small>{item.detail}</small>
            </span>
          ))}
        </div>
      </div>
      <div className={styles.orbitGrid} aria-hidden="true">
        {twinLayers.map((item, index) => (
          <span
            key={item.id}
            className={styles.orbitNode}
            data-active={activeLayer === item.id}
            style={{ ["--i" as string]: index }}
          >
            {item.title}
          </span>
        ))}
      </div>
      <div className={styles.twinHotspots} aria-label="Digital Twin evidence hotspots">
        {twinHotspots.map((item) => (
          <button
            key={item.label}
            type="button"
            data-layer={item.layer}
            data-active={activeLayer === item.layer}
            onClick={() => setActiveLayer(item.layer)}
          >
            <strong>{item.label}</strong>
            <span>{item.note}</span>
          </button>
        ))}
      </div>
      <div className={styles.twinStageFooter} aria-label="Выбранные evidence Digital Twin">
        <span className={styles.twinFooterLabel}><strong>Выбранный слой</strong><small>что сейчас видно</small></span>
        <span className={styles.twinReadinessMetric}><strong>{layer.readiness}</strong><small>готовность</small></span>
        <span><strong>{layer.owner}</strong><small>кто подтверждает</small></span>
        <span><strong>{layer.deliverable}</strong><small>что получает WinGPro</small></span>
      </div>
    </div>
  );

  return (
    <div className={styles.page} data-proposal-root data-wingpro-proposal-root data-theme-scope="light" data-proposal-id="wingpro-2605281047">
      <nav className={styles.breadcrumbs} aria-label="Навигация">
        <a href="/">UPGRADE</a>
        <span>HVAC</span>
        <span>CP 2605281047</span>
      </nav>

      <nav className={styles.miniNav} aria-label="Разделы КП">
        {[
          ["#mission", "Mission"],
          ["#digital-twin", "Digital Twin"],
          ["#hexnovas-decision-board", "Decision Board"],
          ["#project-control", "Control Scale"],
          ["#control-room", "Control Room"],
          ["#source-documents", "Source Docs"],
          ["#vault", "Vault"],
          ["#risk-radar", "Risk Radar"],
          ["#handover", "Handover"],
        ].map(([href, label]) => (
          <a key={href} href={href}>{label}</a>
        ))}
      </nav>

      <section className={sectionClass(styles.hero, "hero")} id="mission" data-section="hero" aria-labelledby="proposal-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>WinGPro × UPGRADE</p>
          <h1 id="proposal-title">Цифровой контур поставки пластинчатых теплообменников</h1>
          <p className={styles.lead}>От выбора поставщика до handover-пакета: данные, документы, риски, сроки, логистика, монтажные вводные и цифровая товарная линия в одном управляемом процессе.</p>
          <p className={styles.sublead}>Это рабочая система quality gates: выбранный вариант, статусы участников, evidence, сроки подготовки и повторное использование товарных данных остаются в одном техническом контуре.</p>
          <div className={styles.heroActions}>
            <a className={styles.primaryAction} href="#digital-twin">Открыть 3D Digital Twin</a>
            <a className={styles.secondaryAction} href="#hexnovas-decision-board">Выбрать вариант</a>
            <a className={styles.secondaryAction} href="#source-documents">Исходные документы</a>
          </div>
          <div className={styles.indicators} aria-label="Mission indicators">
            {["Quality Gate: 6 checkpoints", "Document Vault: 30+ data points", "Risk Radar: 10 risk groups", "Handover: broker / logistics / mounting / sales", "Digital Product Asset: supplier + product line"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className={styles.heroMissionBridge} aria-label="Mission operating model">
            {[
              ["01", "Digital Twin", "equipment object + evidence layers"],
              ["02", "Control Room", "owners, blockers, next actions"],
              ["03", "Decision Board", "TH150B / 316L route + owner choice"],
              ["04", "Handover Room", "packs for logistics, broker, mounting, sales"],
            ].map(([index, title, detail]) => (
              <a key={title} href={title === "Digital Twin" ? "#digital-twin" : title === "Control Room" ? "#control-room" : title === "Decision Board" ? "#hexnovas-decision-board" : "#handover"}>
                <span>{index}</span>
                <strong>{title}</strong>
                <small>{detail}</small>
              </a>
            ))}
          </div>
        </div>
        <aside className={styles.missionCard}>
          <span className={styles.privateStatus}>technical operating view</span>
          <strong>Technical cockpit + data-room</strong>
          <p>Основной экран показывает техническое состояние закупки: выбранный маршрут, предложения поставщиков, экономию, evidence, сроки, риски и handover.</p>
          <dl>
            <div><dt>выбранный маршрут</dt><dd>{activeHexnovasVariant.shortName} / 2 шт.</dd></div>
            <div><dt>маршрут</dt><dd>China → Kazakhstan</dd></div>
            <div><dt>next gate</dt><dd>обновить PI + GA drawing под {recommendedHexnovasVariant.shortName}</dd></div>
            <div><dt>экономия</dt><dd>дельта предложений + снижение риска повторных запросов</dd></div>
            <div><dt>outcome</dt><dd>data-room + risk register + delivery control + digital product asset</dd></div>
          </dl>
          <div className={styles.missionCardFooter}>
            <span>decision now</span>
            <p>{recommendedHexnovasVariant.shortName}: выберите вариант и откройте готовое письмо на {HEXNOVAS_DECISION_EMAIL}. Исходный BH150B-контур остается evidence до обновления PI/GA.</p>
            <div className={styles.missionCardFooterActions}>
              <a href="#hexnovas-decision-board">Открыть Decision Board</a>
              <a href={hexnovasDecisionMailto} onClick={markHexnovasDecisionEmailOpen}>Открыть письмо</a>
              <button type="button" onClick={copyHexnovasDecisionEmail}>Скопировать письмо</button>
              <button type="button" onClick={copyHexnovasDecisionPublicLink}>Скопировать ссылку</button>
            </div>
            <a className={styles.missionCardPublicLink} href={hexnovasDecisionPublicUrl}>
              Публичная ссылка на Decision Board: {activeHexnovasVariant.shortName}
            </a>
            <small role="status" aria-live="polite">{copyStatus}</small>
          </div>
        </aside>
      </section>

      <section className={sectionClass(styles.digitalTwin, "digitalTwin")} id="digital-twin" data-section="digital-twin" aria-labelledby="twin-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Digital Twin сделки</p>
          <h2 id="twin-title">Digital Twin: товарная позиция как управляемый цифровой объект</h2>
          <p>UPGRADE превращает товарную позицию из набора сообщений и файлов в управляемый цифровой объект. Такой объект можно проверять, передавать логисту/брокеру/монтажной стороне и повторно использовать в продажах.</p>
        </div>
        <div className={styles.twinShell} data-rotating={isRotating && !presentationMode}>
          {twinStage}
          <aside className={styles.twinPanel}>
            <div className={styles.segmented} role="tablist" aria-label="Слои Digital Twin">
              {twinLayers.map((item) => (
                <button key={item.id} type="button" role="tab" aria-selected={activeLayer === item.id} aria-controls={`layer-${item.id}`} onClick={() => setActiveLayer(item.id)}>
                  {item.title}
                </button>
              ))}
            </div>
            {twinLayers.map((item) => (
              <section key={item.id} id={`layer-${item.id}`} role="tabpanel" hidden={activeLayer !== item.id}>
                <div className={styles.layerHeader}>
                  <div>
                    <p className={styles.eyebrow}>Выбранный слой Digital Twin</p>
                    <h3>{item.title}</h3>
                  </div>
                  <StatusPill value={item.readiness} />
                </div>
                <p>{item.value}</p>
                <div className={styles.twinLayerPlainSummary}>
                  <span>что это за блок</span>
                  <strong>Карта выбранного слоя Digital Twin: что уже собрано, что запросить и кому передать результат.</strong>
                  <small>{item.title}: {item.value}</small>
                </div>
                <div className={styles.twinLayerGuide} aria-label={`${item.title} evidence board explanation`}>
                  <article>
                    <span>состояние слоя</span>
                    <strong>{item.readiness}</strong>
                    <small>{item.gate}</small>
                  </article>
                  <article>
                    <span>следующий evidence request</span>
                    <strong>{item.evidence}</strong>
                  </article>
                  <article>
                    <span>передача результата</span>
                    <strong>{item.deliverable}</strong>
                    <small>{item.owner}</small>
                  </article>
                </div>
                <div className={styles.twinLayerDecisionStrip} aria-label={`${item.title} operating meaning`}>
                  <span>
                    <strong>Что видно</strong>
                    <small>{item.data.slice(0, 2).join(" / ")}</small>
                  </span>
                  <span>
                    <strong>Что закрывает</strong>
                    <small>{item.risk}</small>
                  </span>
                  <span>
                    <strong>Следующий артефакт</strong>
                    <small>{item.deliverable}</small>
                  </span>
                </div>
                <details className={styles.twinLayerDetailsDisclosure}>
                  <summary>
                    <span>полный чек-лист слоя</span>
                    <strong>{item.title}: данные, запрос и подтверждающий owner</strong>
                    <small>Открыть risk, deliverable, owner и исходные данные</small>
                  </summary>
                  <div className={styles.twinLayerBrief} aria-label={`${item.title} evidence explanation`}>
                    <article>
                      <span>что отображается</span>
                      <strong>{item.value}</strong>
                    </article>
                    <article>
                      <span>что запросить</span>
                      <strong>{item.evidence}</strong>
                    </article>
                    <article>
                      <span>следующий артефакт</span>
                      <strong>{item.deliverable}</strong>
                    </article>
                  </div>
                  <div className={styles.twinReadout} aria-label={`${item.title} readiness readout`}>
                    <span><strong>{item.readiness}</strong><small>готовность</small></span>
                    <span><strong>{item.gate}</strong><small>release gate</small></span>
                    <span><strong>{item.owner}</strong><small>ответственный</small></span>
                  </div>
                  <dl>
                    <div><dt>данные</dt><dd>{item.data.join("; ")}</dd></div>
                    <div><dt>что запросить</dt><dd>{item.evidence}</dd></div>
                    <div><dt>какой риск закрывается</dt><dd>{item.risk}</dd></div>
                    <div><dt>результат передачи</dt><dd>{item.deliverable}</dd></div>
                  </dl>
                </details>
              </section>
            ))}
            <div className={styles.twinInterfaceMap} aria-label="Hydraulic interface handoff map">
              <div>
                <p className={styles.eyebrow}>Интерфейс подключения</p>
                <h3>Патрубки и режимы: что подтверждать</h3>
              </div>
              <div className={styles.twinInterfaceChips} aria-label="Key hydraulic inputs">
                {twinInterfaceRows.map((item) => (
                  <span key={item.label}>{item.label}</span>
                ))}
              </div>
              <details className={styles.twinInterfaceDisclosure}>
                <summary>
                  <span>Открыть карту передачи</span>
                  <strong>вводные, действие и owner по патрубкам</strong>
                  <small>Не заменяет проектные решения; передается профильным участникам для проверки.</small>
                </summary>
                <p className={styles.twinInterfaceDisclosureNote}>Это техническая карта входных данных для поставщика, профильного специалиста и монтажной стороны. Она не заменяет проектные решения и утвержденные чертежи.</p>
                <dl>
                  {twinInterfaceRows.map((item) => (
                    <div key={item.label}>
                      <dt>{item.label}</dt>
                      <dd>
                        <strong>{item.input}</strong>
                        <span>{item.action}</span>
                        <small>{item.owner}</small>
                      </dd>
                    </div>
                  ))}
                </dl>
              </details>
            </div>
            <div className={styles.twinControls}>
              <button type="button" onClick={() => setPresentationMode(true)}>Режим показа</button>
              <button
                type="button"
                aria-pressed={twinLabelDensity === "full"}
                onClick={() => setTwinLabelDensity((value) => (value === "full" ? "focus" : "full"))}
              >
                {twinLabelDensity === "full" ? "Фокус 3D" : "Показать подписи"}
              </button>
              <button type="button" onClick={() => setIsRotating((value) => !value)}>{isRotating ? "Пауза" : "Вращать"}</button>
              <button type="button" onClick={() => setActiveLayer("equipment")}>Сброс</button>
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
        <div className={styles.presentationOverlay} role="dialog" aria-modal="true" aria-label="Режим показа Digital Twin">
          <div className={styles.presentationHud}>
            <div>
              <p className={styles.eyebrow}>Режим показа Digital Twin</p>
              <h2>Conceptual twin для решения WinGPro</h2>
            </div>
            <dl aria-label="Current Digital Twin presentation state">
              <div><dt>маршрут</dt><dd>{activeHexnovasVariant.shortName} / 2 шт.</dd></div>
              <div><dt>слой</dt><dd>{layer.title}</dd></div>
              <div><dt>готовность</dt><dd>{layer.readiness}</dd></div>
              <div><dt>gate</dt><dd>{layer.gate}</dd></div>
            </dl>
            <button
              className={styles.closePresentation}
              type="button"
              onClick={() => setPresentationMode(false)}
              onMouseDown={() => setPresentationMode(false)}
              onPointerDown={() => setPresentationMode(false)}
            >
              Закрыть
            </button>
          </div>
          <div className={styles.presentationStage}>{twinStage}</div>
          <article className={styles.presentationPanel}>
            <div className={styles.presentationLayerRail} role="tablist" aria-label="Digital Twin presentation layers">
              {twinLayers.map((item) => (
                <button
                  key={`presentation-${item.id}`}
                  type="button"
                  role="tab"
                  aria-selected={activeLayer === item.id}
                  aria-controls={`presentation-layer-${item.id}`}
                  onClick={() => setActiveLayer(item.id)}
                >
                  {item.title}
                </button>
              ))}
            </div>
            <section id={`presentation-layer-${layer.id}`} role="tabpanel" className={styles.presentationLayerPanel}>
              <span>{layer.gate}</span>
              <h2>{layer.title}</h2>
              <p>{layer.value}</p>
              <dl>
                <div><dt>WinGPro получает</dt><dd>{layer.deliverable}</dd></div>
                <div><dt>Evidence request</dt><dd>{layer.evidence}</dd></div>
                <div><dt>Какой риск закрывается</dt><dd>{layer.risk}</dd></div>
                <div><dt>Ответственный</dt><dd>{layer.owner}</dd></div>
              </dl>
            </section>
            <div className={styles.presentationDecisionStrip} aria-label="Digital Twin decision strip">
              <span><strong>{layer.readiness}</strong><small>готовность</small></span>
              <span><strong>{layer.owner}</strong><small>кто подтверждает</small></span>
              <span><strong>{layer.deliverable}</strong><small>что передается</small></span>
            </div>
            <p className={styles.legalNote}>Conceptual digital twin preview: визуализация не заменяет инженерную модель, проектную документацию или утвержденные чертежи.</p>
          </article>
        </div>
      ) : null}

      <section className={sectionClass(styles.hexnovasDecisionBoard, "sourceDocuments")} id="hexnovas-decision-board" data-section="hexnovas-decision-board" aria-labelledby="hexnovas-decision-title">
        <div className={styles.hexnovasHeader}>
          <div>
            <p className={styles.eyebrow}>Hexnovas Decision Board</p>
            <h2 id="hexnovas-decision-title">Выбор варианта теплообменника</h2>
            <p>Техническая панель по архиву Hexnovas: модель, материал, перепад давления, документы и действия до обновления PI/договора.</p>
            <p className={styles.hexnovasScopeNote}>Все суммы в этом board относятся только к supplier equipment package и логистическому reserve для сравнения сценариев. Это supplier-only ориентир, не итоговая стоимость проекта.</p>
          </div>
          <aside className={styles.hexnovasDecisionStatus} aria-label="Current supplier decision status">
            <span>decision pending</span>
            <strong>{activeHexnovasVariant.shortName}</strong>
            <small>{activeHexnovasVariant.statusLabel}</small>
          </aside>
        </div>

        <div className={styles.hexnovasDecisionActionPanel} aria-labelledby="hexnovas-decision-action-title">
          <div className={styles.hexnovasDecisionActionIntro}>
            <span>decision action</span>
            <h3 id="hexnovas-decision-action-title">Выбрать вариант сейчас и отправить решение</h3>
            <p>Активный выбор формирует готовое письмо на {HEXNOVAS_DECISION_EMAIL}. Перед отправкой WinGPro может добавить имя, должность и комментарий decision owner.</p>
          </div>
          <div className={styles.hexnovasDecisionQuickPick} role="group" aria-label="Быстрый выбор варианта теплообменника">
            {hexnovasVariants.map((item) => {
              const isActive = activeHexnovasVariant.id === item.id;
              return (
                <button
                  key={`quick-${item.id}`}
                  type="button"
                  data-active={isActive}
                  data-tone={item.statusTone}
                  aria-pressed={isActive}
                  onClick={() => selectHexnovasVariant(item)}
                >
                  <span>{item.statusLabel}</span>
                  <strong>{item.shortName}</strong>
                  <small>{item.material} / {item.pressureDropKpaHot.toFixed(1)}-{item.pressureDropKpaCold.toFixed(1)} kPa</small>
                  {isActive ? <em>выбран сейчас</em> : null}
                </button>
              );
            })}
          </div>
          <details className={styles.hexnovasDecisionOwnerDisclosure}>
            <summary>
              <span>owner / comment</span>
              <strong>Дополнить письмо decision owner и комментарием</strong>
              <small>{hexnovasDecisionOwner.trim() ? hexnovasDecisionOwner : "опционально перед отправкой"}</small>
            </summary>
            <div className={styles.hexnovasDecisionOwnerFields} aria-label="Данные decision owner для письма">
              <label>
                <span>Кто подтверждает</span>
                <input
                  type="text"
                  value={hexnovasDecisionOwner}
                  onChange={(event) => setHexnovasDecisionOwner(event.currentTarget.value)}
                  placeholder="Имя / должность"
                  aria-label="Имя и должность decision owner"
                />
              </label>
              <label>
                <span>Комментарий к выбору</span>
                <textarea
                  value={hexnovasDecisionComment}
                  onChange={(event) => setHexnovasDecisionComment(event.currentTarget.value)}
                  placeholder="Например: выбираем TH150B / 316L, запросить обновленный PI и GA drawing"
                  aria-label="Комментарий к решению по выбору теплообменника"
                  rows={2}
                />
              </label>
            </div>
          </details>
          <div className={styles.hexnovasDecisionMailActions}>
            <a href={hexnovasDecisionMailto} onClick={markHexnovasDecisionEmailOpen}>
              Открыть письмо на info@upgradefor.com
            </a>
            <button type="button" onClick={copyHexnovasDecisionEmail}>
              Скопировать письмо
            </button>
            <button type="button" onClick={copyHexnovasDecisionPublicLink}>
              Скопировать ссылку
            </button>
            <small role="status" aria-live="polite">{hexnovasDecisionStatus}</small>
          </div>
          <details className={styles.hexnovasDecisionRouteDisclosure}>
            <summary>
              <span>after decision</span>
              <strong>Email → PI / drawing / evidence route</strong>
              <small>{hexnovasDecisionReceiptSteps.length} шага / {hexnovasDecisionHandoffCards.length} handoff signals</small>
            </summary>
            <div className={styles.hexnovasDecisionRouteBody}>
              <div className={styles.hexnovasDecisionFlow} aria-label="Что происходит после выбора варианта">
                {hexnovasDecisionReceiptSteps.map(([step, title, value]) => (
                  <article key={`quick-flow-${title}`}>
                    <span>{step}</span>
                    <strong>{title}</strong>
                    <small>{value}</small>
                  </article>
                ))}
              </div>
              <div className={styles.hexnovasDecisionHandoffStrip} aria-label="Куда ведет выбранное решение">
                {hexnovasDecisionHandoffCards.map(([label, value, detail]) => (
                  <article key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                    <small>{detail}</small>
                  </article>
                ))}
              </div>
            </div>
          </details>
          <details className={styles.hexnovasDecisionEmailPacket}>
            <summary>
              <span>email packet</span>
              <strong>Что уйдет на info@upgradefor.com</strong>
              <small>{hexnovasDecisionEmailSubject}</small>
            </summary>
            <dl>
              <div><dt>Выбор</dt><dd>{activeHexnovasVariant.name}</dd></div>
              <div><dt>Статус</dt><dd>{activeHexnovasVariant.statusLabel}</dd></div>
              <div><dt>Owner</dt><dd>{hexnovasDecisionOwner.trim() || "будет указан перед отправкой"}</dd></div>
              <div><dt>Следующее действие</dt><dd>{activeHexnovasVariant.action}</dd></div>
            </dl>
            <p>Если почтовый клиент не открылся автоматически, используйте “Скопировать письмо” и отправьте текст вручную на {HEXNOVAS_DECISION_EMAIL}.</p>
          </details>
        </div>

        <details className={styles.hexnovasDecisionReceiptDisclosure}>
          <summary>
            <span>decision receipt</span>
            <strong>Что произойдет после выбора</strong>
            <small>Email / copy fallback → PI / drawing / evidence route</small>
          </summary>
          <aside className={styles.hexnovasDecisionReceipt} aria-label="Decision receipt after variant selection">
            <div>
              <span>decision receipt</span>
              <strong>Что произойдет после выбора</strong>
              <p>Кнопка открывает готовое письмо. Отправитель проверяет текст и отправляет его со своей почты; после этого UPGRADE связывает решение с PI, GA drawing, evidence request и risk register.</p>
            </div>
            <ol>
              {hexnovasDecisionReceiptSteps.map(([step, title, value]) => (
                <li key={title}>
                  <span>{step}</span>
                  <strong>{title}</strong>
                  <small>{value}</small>
                </li>
              ))}
            </ol>
          </aside>
        </details>

        <details className={styles.hexnovasSourceDigest}>
          <summary>
            <span>source digest</span>
            <strong>Исходные параметры и архив Hexnovas</strong>
            <small>{hexnovasArchiveFileCount} files / {hexnovasPackageRules.length} decision rules</small>
          </summary>
          <div className={styles.hexnovasSummaryRail} aria-label="Hexnovas project source summary">
            {[
              ["buyer", hexnovasProject.buyer, hexnovasProject.project],
              ["supplier", "Hexnovas", hexnovasProject.supplier],
              ["reference", `${hexnovasProject.referenceHeatDutyKw} kW`, hexnovasProject.mediums],
              ["target", hexnovasProject.pressureDropTarget, hexnovasProject.pressureClass],
            ].map(([label, value, note]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{note}</small>
              </article>
            ))}
          </div>

          <div className={styles.hexnovasPackageIndex} aria-label="Hexnovas procurement package index">
            <div className={styles.hexnovasPackageIndexIntro}>
              <span>Procurement package index</span>
              <strong>Архив Hexnovas превращен в управляемый decision package</strong>
              <p>
                На странице показываются технические evidence-активы, которые помогают выбрать модель, материал и release route.
                Договоры, реквизиты, условия сервисного контура и переписка остаются в private contour до отдельного решения WinGPro.
              </p>
            </div>
            <div className={styles.hexnovasPackageIndexStats}>
              {hexnovasPackageOverviewStats.map(([label, value, note]) => (
                <article key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <small>{note}</small>
                </article>
              ))}
            </div>
            <details className={styles.hexnovasPackageRulesDisclosure}>
              <summary>
                <span>decision rules</span>
                <strong>TH150B / 316L как baseline; 304 и BH150B идут только через owner approval</strong>
                <small>{hexnovasPackageRules.length} rules from archive</small>
              </summary>
              <div className={styles.hexnovasPackageRules} aria-label="Buyer decision rules from archive">
                {hexnovasPackageRules.map((item) => (
                  <article key={item.title}>
                    <span>{item.title}</span>
                    <strong>{item.signal}</strong>
                    <p>{item.action}</p>
                    <small>{item.owner}</small>
                  </article>
                ))}
              </div>
            </details>
            <details className={styles.hexnovasArchiveBreakdown}>
              <summary>
                <span>archive breakdown</span>
                <strong>Показать карту групп архива</strong>
                <small>{hexnovasArchiveGroups.length} groups / {hexnovasArchiveFileCount} files</small>
              </summary>
              <div>
                {hexnovasArchiveGroups.map((item) => (
                  <article key={item.title}>
                    <span>{item.title}</span>
                    <strong>{item.role}</strong>
                    <p>{item.action}</p>
                    <small>{item.files} files / {item.publicEvidence} public evidence item(s) / {item.boundary}</small>
                  </article>
                ))}
              </div>
            </details>
          </div>
        </details>

        <details className={styles.hexnovasVariantDisclosure}>
          <summary>
            <span>variant cards</span>
            <strong>Открыть технические карточки всех вариантов</strong>
            <small>{hexnovasVariants.length} варианта</small>
          </summary>
          <div className={styles.hexnovasVariantGrid} aria-label="Heat exchanger supplier variants">
            {hexnovasVariants.map((item) => {
              const isActive = activeHexnovasVariant.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={isActive}
                  className={styles.hexnovasVariantCard}
                  data-active={isActive}
                  data-tone={item.statusTone}
                  onClick={() => selectHexnovasVariant(item)}
                  aria-label={`${item.shortName}: supplier equipment package ${formatUsd(item.totalPriceUsd)}, ${item.material}, ${item.productionTimeDaysAfterAdvance} days, pressure ${item.pressureDropKpaHot.toFixed(1)} / ${item.pressureDropKpaCold.toFixed(1)} kPa`}
                >
                  <span>{item.statusLabel}</span>
                  <strong>{item.shortName}</strong>
                  <small>{item.material} / {item.productionTimeDaysAfterAdvance} days / supplier package {formatUsd(item.totalPriceUsd)}</small>
                  <div className={styles.hexnovasPressureRow}>
                    <span className={styles.hexnovasPressureBadge} data-tone={pressureDropTone(item.pressureDropKpaHot)}>hot {item.pressureDropKpaHot.toFixed(1)} kPa</span>
                    <span className={styles.hexnovasPressureBadge} data-tone={pressureDropTone(item.pressureDropKpaCold)}>cold {item.pressureDropKpaCold.toFixed(1)} kPa</span>
                  </div>
                </button>
              );
            })}
          </div>
        </details>

        <details className={styles.hexnovasSelectedDisclosure}>
          <summary>
            <span>детали выбранного варианта</span>
            <strong>{activeHexnovasVariant.shortName}: {activeHexnovasVariant.statusLabel}</strong>
            <small>{hexnovasNextEvidenceAction.title}</small>
          </summary>
          <div className={styles.hexnovasSelectedPanel}>
            <article className={styles.hexnovasSelectedMain} data-tone={activeHexnovasVariant.statusTone}>
              <div>
                <span>selected scenario</span>
                <h3>{activeHexnovasVariant.name}</h3>
                <p>{activeHexnovasVariant.comment}</p>
              </div>
              <details className={styles.hexnovasSelectedDecisionDetails}>
                <summary>
                  <span>release condition</span>
                  <strong>{activeHexnovasVariant.statusLabel}</strong>
                  <small>Открыть owner decision note</small>
                </summary>
                <p>{activeHexnovasVariant.decisionAlert}</p>
              </details>
              <button type="button" onClick={copyHexnovasDecisionSummary}>Скопировать decision summary</button>
            </article>

            <aside className={styles.hexnovasCostBox} aria-label="Supplier equipment package delta">
              <div className={styles.hexnovasCostSummary}>
                <span>supplier equipment package</span>
                <strong>{formatUsd(activeHexnovasVariant.totalPriceUsd)}</strong>
                <small>{activeHexnovasVariant.quantity} шт. / supplier-only ориентир</small>
              </div>
              <details className={styles.hexnovasCostDetails}>
                <summary>
                  <span>route math</span>
                  <strong>{activeHexnovasDelta === 0 ? "baseline" : `${formatUsd(activeHexnovasDelta)} delta`}</strong>
                  <small>Открыть reserve / material</small>
                </summary>
                <p>только оборудование Hexnovas; логистический reserve показан как расчетный ориентир для сравнения маршрутов.</p>
                <dl>
                  <div><dt>Supplier route total</dt><dd>{formatUsd(activeHexnovasEquipmentRouteTotal)}</dd></div>
                  <div><dt>Delta vs recommended</dt><dd>{activeHexnovasDelta === 0 ? "baseline" : formatUsd(activeHexnovasDelta)}</dd></div>
                  <div><dt>Material signal</dt><dd>{activeHexnovasMaterialSignal}</dd></div>
                </dl>
                <small>Supplier-only reference: решение по закупочному маршруту остается за WinGPro.</small>
              </details>
            </aside>
          </div>
        </details>

        <details className={styles.hexnovasComparisonDisclosure}>
          <summary>
            <span>comparison matrix</span>
            <strong>Открыть полную матрицу вариантов</strong>
            <small>{hexnovasVariants.length} scenarios</small>
          </summary>
          <div className={styles.hexnovasComparison} role="table" aria-label="Hexnovas variant comparison">
            <div role="row" className={styles.hexnovasComparisonHead}>
              <span role="columnheader">Вариант</span>
              <span role="columnheader">Supplier price / 2 шт.</span>
              <span role="columnheader">Материал</span>
              <span role="columnheader">Перепад</span>
              <span role="columnheader">Решение</span>
            </div>
            {hexnovasVariants.map((item) => (
              <button
                key={`row-${item.id}`}
                type="button"
                role="row"
                className={styles.hexnovasComparisonRow}
                data-active={activeHexnovasVariant.id === item.id}
                onClick={() => selectHexnovasVariant(item)}
              >
                <span role="cell" data-label="Вариант">{item.shortName}</span>
                <span role="cell" data-label="Supplier price / 2 шт.">{formatUsd(item.totalPriceUsd)}</span>
                <span role="cell" data-label="Материал">{item.material}</span>
                <span role="cell" data-label="Перепад">{item.pressureDropKpaHot.toFixed(1)} / {item.pressureDropKpaCold.toFixed(1)} kPa</span>
                <span role="cell" data-label="Решение">{item.action}</span>
              </button>
            ))}
          </div>
        </details>

        <div className={styles.hexnovasDecisionGrid}>
          <details className={styles.hexnovasTimeline}>
            <summary>
              <span>procurement timeline</span>
              <strong>Как появился рекомендуемый вариант</strong>
            </summary>
            <div>
              {hexnovasTimeline.map((item) => (
                <article key={item.id}>
                  <span>{item.label}</span>
                  <strong>{item.title}</strong>
                  <p>{item.result}</p>
                </article>
              ))}
            </div>
          </details>

          <details className={styles.hexnovasRiskControls}>
            <summary>
              <span>risk controls</span>
              <strong>Что подтвердить до release</strong>
            </summary>
            <div>
              {hexnovasRiskControls.map((item) => (
                <article key={item.title}>
                  <span>{item.title}</span>
                  <strong>{item.control}</strong>
                  <p>{item.risk}</p>
                  <small>{item.owner}</small>
                </article>
              ))}
            </div>
          </details>
        </div>

        <details className={styles.hexnovasEvidenceBridgeDisclosure}>
          <summary>
            <span>evidence handoff</span>
            <strong>{hexnovasEvidenceBridgeStats[0][1]} ready / {hexnovasEvidenceBridgeStats[1][1]} updates; next: {hexnovasNextEvidenceAction.title}</strong>
            <small>Открыть Document Vault readiness</small>
          </summary>
          <div className={styles.hexnovasEvidenceBridge} aria-label="Hexnovas evidence handoff summary">
            <div className={styles.hexnovasEvidenceBridgeMain}>
              <span>evidence handoff</span>
              <strong>Что из архива уже можно вести в Document Vault</strong>
              <p>Слой показывает не файлы ради файлов, а их роль в release-gates: что готово, что нужно обновить, где нужен owner approval и что остается risk evidence.</p>
            </div>
            <div className={styles.hexnovasEvidenceBridgeStats}>
              {hexnovasEvidenceBridgeStats.map(([label, value, note]) => (
                <article key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <small>{note}</small>
                </article>
              ))}
            </div>
            <div className={styles.hexnovasEvidenceBridgeAction}>
              <span>next document action</span>
              <strong>{hexnovasNextEvidenceAction.title}</strong>
              <p>{hexnovasNextEvidenceAction.detail}</p>
              <small>Owner for confirmation: {hexnovasNextEvidenceAction.owner}. UPGRADE структурирует data-room и evidence request, финальные технические решения подтверждают профильные участники.</small>
            </div>
          </div>
        </details>

        <details
          className={styles.hexnovasDocumentSignals}
          open={hexnovasEvidenceOpen}
          onToggle={(event) => setHexnovasEvidenceOpen(event.currentTarget.open)}
        >
          <summary>
            <span>supplier evidence pack</span>
            <strong>Документы из архива для Document Vault</strong>
            <small>{activeHexnovasSignalTitle ? `active: ${activeHexnovasSignalTitle}` : `${hexnovasDocumentSignals.length} signals`}</small>
          </summary>
          <div>
            {hexnovasDocumentSignals.map((item) => (
              <article
                key={item.title}
                id={getHexnovasSignalId(item.title)}
                data-status={item.status}
                data-linked-active={activeHexnovasSignalTitle === item.title}
                tabIndex={-1}
              >
                <div className={styles.hexnovasDocumentSignalHead}>
                  <span>{item.status}</span>
                  <em>{item.fileType} / {item.sizeLabel}</em>
                </div>
                <strong>{item.title}</strong>
                <p>{item.note}</p>
                <dl className={styles.hexnovasDocumentSignalMeta}>
                  <div><dt>Source</dt><dd>{item.source}</dd></div>
                  <div><dt>Vault use</dt><dd>{item.vaultUse}</dd></div>
                  <div><dt>Checksum</dt><dd>sha256: {item.checksumSha256.slice(0, 10)}...</dd></div>
                </dl>
                {item.href && item.downloadName ? (
                  <div className={styles.hexnovasDocumentSignalActions}>
                    {item.previewable ? (
                      <a href={item.href} target="_blank" rel="noreferrer" aria-label={`Просмотреть ${item.title}`}>
                        Просмотреть
                      </a>
                    ) : (
                      <span>Предпросмотр не поддерживается</span>
                    )}
                    <a href={item.href} download={item.downloadName} aria-label={`Скачать ${item.title}`}>
                      Скачать
                    </a>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
          <p className={styles.hexnovasDocumentSignalNote}>
            Эти файлы используются как evidence для supplier selection, PI consistency, compliance и handover. UPGRADE структурирует data-room и запросы; технические, договорные и сертификационные решения подтверждают профильные участники.
          </p>
        </details>
      </section>


      <section className={styles.commandLayer} data-section="executive-command" aria-labelledby="command-layer-title" data-active-mode={activePresentationMode}>
        <div className={styles.commandLayerHeader}>
          <div>
            <p className={styles.eyebrow}>Executive Command Layer</p>
            <h2 id="command-layer-title">Режим презентации сделки</h2>
          </div>
          <p>Переключите фокус: страница подсветит нужные блоки, покажет краткий вывод и следующий шаг для согласования.</p>
        </div>
        <div className={styles.presentationModeTabs} role="tablist" aria-label="Presentation modes">
          {presentationModes.map((item, index) => (
            <button
              key={item.id}
              ref={(node) => {
                presentationTabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              aria-selected={activePresentationMode === item.id}
              aria-controls="presentation-mode-panel"
              data-active={activePresentationMode === item.id}
              tabIndex={activePresentationMode === item.id ? 0 : -1}
              onClick={() => setActivePresentationMode(item.id)}
              onKeyDown={(event) => onPresentationTabKeyDown(event, index)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <article className={styles.presentationModePanel} id="presentation-mode-panel" role="tabpanel" aria-live="polite">
          <span>{activePresentation.focus}</span>
          <h3>{activePresentation.label}</h3>
          <p>{activePresentation.summary}</p>
          <div>
            <strong>Next action</strong>
            <p>{activePresentation.nextAction}</p>
          </div>
        </article>
        <section className={styles.cockpitSummaryBoard} data-section="cockpit-summary" aria-labelledby="cockpit-summary-title">
          <div className={styles.cockpitSummaryHeader}>
            <div>
              <span className={styles.eyebrow}>Project Cockpit Summary</span>
              <h3 id="cockpit-summary-title">Что получает WinGPro сейчас</h3>
            </div>
            <p>Один верхний слой показывает маршрут решения, ближайший blocker, release gate и evidence handoff. Детальные карточки ниже открывают рабочие слои страницы.</p>
            <button
              className={styles.cockpitSummaryCopyButton}
              type="button"
              onClick={copyCockpitSummary}
              aria-label="Скопировать технический summary cockpit"
            >
              Тех. summary
            </button>
          </div>
          <div className={styles.cockpitKpiRail} aria-label="Cockpit operating KPIs">
            {cockpitKpis.map((item, index) => (
              <article key={item.label}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <small>{item.label}</small>
                  <strong>{item.value}</strong>
                  <em>{item.detail}</em>
                </div>
              </article>
            ))}
          </div>
          <details className={styles.cockpitLayersDisclosure}>
            <summary>
              <span>рабочие слои cockpit</span>
              <strong>Открыть supplier / contract / delivery / Work Plan / evidence / handover</strong>
              <small>{cockpitSummaryCards.length} слоев, active: {activePresentation.label}</small>
            </summary>
            <div className={styles.cockpitSummaryModeHeader}>
              <span>что открыть дальше</span>
              <p>Карточки ниже переключают фокус верхнего Executive Command и ведут к рабочим секциям страницы.</p>
            </div>
            <div className={styles.cockpitSummaryGrid} aria-label="Selected project state">
              {cockpitSummaryCards.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  data-active={activePresentationMode === item.mode}
                  aria-pressed={activePresentationMode === item.mode}
                  onClick={() => setActivePresentationMode(item.mode)}
                >
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <small>{item.status}</small>
                  <em>{item.detail}</em>
                </button>
              ))}
            </div>
          </details>
          <div className={styles.cockpitDecisionActionBar} aria-label="Быстрое подтверждение выбранного варианта теплообменника">
            <div>
              <span>decision now</span>
              <strong>{activeHexnovasVariant.shortName} → {HEXNOVAS_DECISION_EMAIL}</strong>
              <small>{activeHexnovasVariant.statusLabel}; письмо содержит selected model, material, pressure evidence и next action для WinGPro approval owner.</small>
            </div>
            <div className={styles.cockpitDecisionActionButtons}>
              <a
                href={hexnovasDecisionMailto}
                onClick={markHexnovasDecisionEmailOpen}
                aria-label={`Отправить решение ${activeHexnovasVariant.shortName} на ${HEXNOVAS_DECISION_EMAIL}`}
              >
                Отправить решение
              </a>
              <button type="button" onClick={copyHexnovasDecisionEmail}>
                Скопировать письмо
              </button>
            </div>
            <p role="status" aria-live="polite">{hexnovasDecisionStatus}</p>
          </div>
          <div className={styles.cockpitDecisionDock}>
            <article>
              <span>next best action</span>
              <strong>{activePresentation.nextAction}</strong>
            </article>
            <article>
              <span>nearest blocker</span>
              <strong>{decisionBlockerQueue[0]}</strong>
            </article>
            <article>
              <span>copy/status</span>
              <strong aria-live="polite">{copyStatus}</strong>
            </article>
            <details className={styles.cockpitAddonDisclosure}>
              <summary>
                <span>optional extensions</span>
                <strong>Дополнительные опции можно согласовать отдельно</strong>
              </summary>
              <div>
                {cockpitAddonOpportunities.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </details>
          </div>
        </section>
        <details className={styles.modeEndpointDisclosure} open={modeEndpointOpen} onToggle={(event) => setModeEndpointOpen(event.currentTarget.open)}>
          <summary>
            <span>mode handoff</span>
            <strong>{activePresentation.endpoint.selected}</strong>
            <small>{activePresentation.nextAction}</small>
          </summary>
          {modeEndpointOpen ? (
            <div className={styles.modeEndpoint} aria-label="Current mode decision endpoint">
              <article>
                <span>что выбрано</span>
                <strong>{activePresentation.endpoint.selected}</strong>
              </article>
              <article>
                <span>что подтвердить</span>
                <strong>{activePresentation.endpoint.confirm}</strong>
              </article>
              <article>
                <span>что получит WinGPro</span>
                <strong>{activePresentation.endpoint.receives}</strong>
              </article>
              <button type="button" onClick={() => copyBoardText(activePresentation.copyVariant)}>
                Скопировать summary режима
              </button>
            </div>
          ) : null}
        </details>
        <details className={styles.executiveCommandDetailsDisclosure} open={executiveDetailsOpen} onToggle={(event) => setExecutiveDetailsOpen(event.currentTarget.open)}>
          <summary>
            <span>Executive detail</span>
            <strong>Открыть selected outcome, spotlight map и decision path</strong>
            <small>Верхний слой оставляет summary и next action видимыми; подробные ссылки раскрываются по запросу.</small>
          </summary>
          {executiveDetailsOpen ? (
            <>
              <section className={styles.executiveOutcomeBoard} aria-labelledby="executive-outcome-title">
                <div className={styles.executiveOutcomeHeader}>
                  <div>
                    <span className={styles.eyebrow}>Selected Outcome</span>
                    <h3 id="executive-outcome-title">Что уже собрано в один decision path</h3>
                  </div>
                  <button type="button" onClick={copyDecisionOutcome}>Скопировать selected outcome</button>
                </div>
                <div className={styles.executiveOutcomeGrid}>
                  {executiveOutcomeCards.map((item) => (
                    <a key={item.label} href={item.href}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                      <small>{item.detail}</small>
                    </a>
                  ))}
                </div>
                <div className={styles.executiveOutcomeFooter}>
                  <article>
                    <span>blocker queue</span>
                    <p>{decisionBlockerQueue.join(" / ")}</p>
                  </article>
                  <article>
                    <span>next action</span>
                    <p>{activePresentation.nextAction}</p>
                  </article>
                  <article>
                    <span>Service boundary</span>
                    <p>UPGRADE ведет информационный контур и coordination draft; ППР skeleton — не официальный ППР, а технические, логистические, таможенные и монтажные решения утверждают профильные участники.</p>
                  </article>
                </div>
              </section>
              <div className={styles.presentationSpotlightMap} aria-label="Active presentation spotlight map">
                <span>In focus now</span>
                {activePresentation.sections.map((section) => {
                  const item = sectionSpotlightLabels[section];
                  if (!item) return null;
                  return (
                    <a key={section} href={item.href}>
                      <strong>{item.label}</strong>
                      <small>{item.signal}</small>
                    </a>
                  );
                })}
              </div>
              <details className={styles.commandDisclosure}>
                <summary>
                  <span className={styles.eyebrow}>Decision Path</span>
                  <strong>supplier → contract → delivery → work plan → handover</strong>
                  <small>Открыть связанный сценарий</small>
                </summary>
                <div className={styles.decisionPathRail} aria-label="Connected decision path">
                  {decisionPath.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      data-active={activePresentationMode === item.mode}
                      onClick={() => setActivePresentationMode(item.mode)}
                    >
                      <span>{item.label}</span>
                      <strong>{item.title}</strong>
                      <small>{item.detail}</small>
                      <em>{item.output}</em>
                    </button>
                  ))}
                </div>
              </details>
              <div className={styles.modeDetailActions} aria-label="Current mode detail actions">
                <span>открыть детали режима</span>
                {activePresentation.detailActions.map(([label, href]) => (
                  <a key={href} href={href}>{label}</a>
                ))}
              </div>
            </>
          ) : null}
        </details>
      </section>

      <section className={sectionClass(styles.sourceDocsSection, "sourceDocuments")} id="source-documents" data-section="source-documents" aria-labelledby="source-documents-title">
        <div className={styles.sourceDocsHeader}>
          <div>
            <p className={styles.eyebrow}>Source Data Room</p>
            <h2 id="source-documents-title">Исходные данные проекта</h2>
            <p>Полные проектные PDF и паспорта закупленного оборудования доступны для просмотра и скачивания. В рамках предложения UPGRADE использует эти материалы как исходный data-room для поставки, сверки, монтажной подготовки и handover по пластинчатым теплообменникам и связанному насосному interface ХС.</p>
          </div>
          <aside className={styles.sourceDocsLegalLine}>
            Файлы являются исходной проектной документацией объекта. UPGRADE не является проектировщиком, автором проекта, технадзором или организацией, утверждающей проектные решения.
          </aside>
        </div>

        <div className={styles.sourceDocsSummaryCard}>
          <div>
            <span className={styles.eyebrow}>пакет исходников</span>
            <h3>Source Data Room для теплообменников и насосов ХС</h3>
            <p>Материал используется как исходная информационная база, не заменяет проектную документацию и передается профильным участникам для проверки и утверждения.</p>
          </div>
          <div className={styles.sourceDocsStatusGrid} aria-label="Source document status">
            {sourceDocumentStats.map(([label, value, note]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{note}</small>
              </article>
            ))}
          </div>
          <div className={styles.sourceDocsSummaryActions}>
            <span>действие</span>
            <strong>Скачать пакет исходных данных</strong>
            <p>PDF скачиваются последовательно, без ZIP и без дублей в репозитории.</p>
            <button type="button" onClick={downloadSourceDocuments}>Скачать пакет исходных данных</button>
            {sourceDownloadStatus ? (
              <p className={styles.sourceDownloadStatus} role="status" aria-live="polite">{sourceDownloadStatus}</p>
            ) : null}
          </div>
        </div>

        <div className={styles.pumpEvidencePanel} aria-label="Закупленные насосы Pedrollo">
          <div className={styles.pumpEvidenceIntro}>
            <span className={styles.eyebrow}>Purchased pump evidence</span>
            <h3>Закупленные насосы Pedrollo в data-room</h3>
            <p>По паспортам заведены два насосных типа: F100/200C и F80/160C. Для операционного контроля принято 2 шт. каждого типа; финальная привязка к контурам, серийные номера и накладные должны быть подтверждены WinGPro technical owner и монтажной стороной.</p>
            <div className={styles.pumpEvidenceStatusRail} aria-label="Pump evidence readiness status">
              {pumpEvidenceStatusSummary.map(([value, label, note]) => (
                <span key={label}>
                  <strong>{value}</strong>
                  <small>{label}</small>
                  <em>{note}</em>
                </span>
              ))}
            </div>
          </div>
          <div className={styles.pumpAssignmentGrid}>
            {purchasedPumpAssignments.map((item) => (
              <article key={item.model}>
                <span>{item.quantity}</span>
                <strong>{item.model}</strong>
                <p>{item.role}</p>
                <small>{item.hydraulicLogic}</small>
                <em>{item.confirmation}</em>
              </article>
            ))}
          </div>
          <div className={styles.pumpEvidenceDocLinks}>
            {purchasedPumpDocs.map((doc) => (
              <a key={doc.id} href={doc.href} target="_blank" rel="noreferrer">
                <span>PDF ready</span>
                <strong>{doc.equipmentModel}</strong>
                <small>Открыть паспорт</small>
              </a>
            ))}
          </div>
          <details className={styles.pumpEvidenceRequestsDisclosure}>
            <summary>
              <span>pump evidence requests</span>
              <strong>Что еще запросить по закупленным насосам</strong>
              <small>
                {purchasedPumpEvidenceRequests.filter((item) => item.status !== "ready").length} open / {purchasedPumpEvidenceRequests.length} total
              </small>
            </summary>
            <div className={styles.pumpEvidenceRequestGrid} aria-label="Что запросить по закупленным насосам">
              {purchasedPumpEvidenceRequests.map((item) => (
                <article key={item.title} data-status={item.status}>
                  <span>{formatPumpEvidenceStatus(item.status)}</span>
                  <strong>{item.title}</strong>
                  <p>{item.action}</p>
                  <small>{item.owner}</small>
                  <em>{item.why}</em>
                </article>
              ))}
            </div>
          </details>
        </div>

        <div className={styles.sourceDocsGrid}>
          {sourceDocuments.map((doc) => (
            <article key={doc.id} className={styles.sourceDocCard}>
              <div className={styles.sourceDocTopline}>
                <span>PDF</span>
                <span>{doc.pagesLabel}</span>
                <span>{doc.procurementStatus ? "purchased" : "source"}</span>
                <span>{doc.equipmentModel ?? "ХС"}</span>
              </div>
              <div className={styles.sourceDocTitleRow}>
                <div>
                  <h3>{doc.title}</h3>
                  <p>{doc.type}</p>
                </div>
                <span>{doc.sizeLabel}</span>
              </div>
              <details className={styles.sourceDocDetails}>
                <summary>
                  <span>Файл / применение / границы</span>
                  <small>{doc.relevantTo.length} точек</small>
                </summary>
                <div className={styles.sourceDocDetailGrid}>
                  <section>
                    <h4>Метаданные</h4>
                    <dl className={styles.sourceDocMeta}>
                      <div><dt>File</dt><dd>{doc.href.split("/").slice(-1)[0]}</dd></div>
                      <div><dt>Source name</dt><dd>{doc.sourceName}</dd></div>
                      <div><dt>Object</dt><dd>{doc.object}</dd></div>
                      {doc.quantityLabel ? <div><dt>Quantity</dt><dd>{doc.quantityLabel}</dd></div> : null}
                      {doc.procurementStatus ? <div><dt>Status</dt><dd>{doc.procurementStatus}</dd></div> : null}
                      {doc.assignment ? <div><dt>Logic</dt><dd>{doc.assignment}</dd></div> : null}
                      {doc.confirmationOwner ? <div><dt>Confirm</dt><dd>{doc.confirmationOwner}</dd></div> : null}
                      <div><dt>Checksum</dt><dd>{formatSourceChecksum(doc.checksumSha256)}</dd></div>
                    </dl>
                  </section>
                  {doc.technicalFacts ? (
                    <section>
                      <h4>Технические факты</h4>
                      <ul className={styles.sourceDocUtilityList}>
                        {doc.technicalFacts.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </section>
                  ) : null}
                  <section>
                    <h4>Для чего используется</h4>
                    <ul className={styles.sourceDocUtilityList}>
                      {doc.relevantTo.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </section>
                  <section>
                    <h4>Границы использования</h4>
                    <ul className={styles.sourceDocBoundaryList}>
                      {doc.notFor.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </section>
                </div>
              </details>
              <div className={styles.sourceDocActions}>
                <a href={doc.href} target="_blank" rel="noreferrer" aria-label={`Просмотреть PDF ${doc.title}`}>
                  Просмотреть PDF
                </a>
                <a href={doc.href} download={doc.downloadName} aria-label={`Скачать PDF ${doc.title}`}>
                  Скачать PDF
                </a>
                <a
                  href="#vault"
                  onClick={(event) => {
                    event.preventDefault();
                    setSourceDownloadStatus(`${doc.title} добавлен в data-room`);
                    document.getElementById("vault")?.scrollIntoView({ block: "start" });
                  }}
                >
                  Добавить в data-room
                </a>
              </div>
              <noscript>
                <p className={styles.sourceDocsNoJs}><a href={doc.href}>Открыть PDF</a> / <a href={doc.href} download={doc.downloadName}>Скачать PDF</a></p>
              </noscript>
            </article>
          ))}
        </div>

        <details className={styles.sourceDocsIntelligence}>
          <summary>
            <span>смысловая выжимка</span>
            <strong>Какие данные из этих PDF полезны именно для теплообменников <small>5 карточек</small></strong>
          </summary>
          <div className={styles.sourceInsightGrid}>
            {sourceDocumentInsights.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </details>

        <details className={styles.sourceTraceability} aria-label="Source to data-room action map">
          <summary className={styles.sourceTraceabilityHeader}>
            <span>карта источников</span>
            <strong>Source → Data-room → Action <small>5 строк</small></strong>
          </summary>
          <div className={styles.sourceTraceabilityGrid} role="table" aria-label="Source traceability matrix">
            <div role="row" className={styles.sourceTraceabilityHead}>
              <span role="columnheader">Source file</span>
              <span role="columnheader">Relevant data</span>
              <span role="columnheader">UPGRADE action</span>
              <span role="columnheader">Owner for approval</span>
            </div>
            {sourceTraceabilityRows.map((row) => (
              <div key={`${row.sourceFile}-${row.relevantData}`} role="row" className={styles.sourceTraceabilityRow}>
                <span role="cell" data-label="Source file">{row.sourceFile}</span>
                <span role="cell" data-label="Relevant data">{row.relevantData}</span>
                <span role="cell" data-label="UPGRADE action">{row.upgradeAction}</span>
                <span role="cell" data-label="Owner for approval">{row.ownerForApproval}</span>
              </div>
            ))}
          </div>
        </details>

        <details className={styles.sourceDocsRelatedDisclosure}>
          <summary>
            <span>связи</span>
            <strong>Связать с разделами страницы</strong>
            <small>4 ссылки</small>
          </summary>
          <div className={styles.sourceDocsRelated} aria-label="Связать исходные документы с разделами страницы">
            <a href="#digital-twin">Связать с Digital Twin</a>
            <a href="#vault">Связать с Document Vault</a>
            <a href="#work-plan-builder">Связать с Work Plan / ППР skeleton</a>
            <a href="#handover">Связать с Handover Pack</a>
          </div>
        </details>

        <details className={styles.sourceDisclaimer}>
          <summary>
            <strong>Юридическая граница</strong>
            <span>UPGRADE использует приложенные проектные документы как исходную информационную базу по зоне пластинчатых теплообменников; не проектировщик, не технадзор и не утверждающая организация.</span>
          </summary>
          <p>UPGRADE использует приложенные проектные документы как исходную информационную базу для структурирования данных, подготовки вопросов, data-room, evidence request, handover pack и монтажного coordination draft по зоне пластинчатых теплообменников. UPGRADE не является автором проекта, проектировщиком, техническим надзором, экспертизой, производителем оборудования или организацией, утверждающей проектные решения. Все проектные, технические, монтажные и эксплуатационные решения проверяются и утверждаются ответственными специалистами WinGPro, проектной организацией, монтажной организацией или иными профильными участниками.</p>
        </details>
      </section>

      <section className={sectionClass(styles.filmstrip, "filmstrip")} id="filmstrip" data-section="filmstrip" aria-labelledby="film-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Операционный сценарий</p>
          <h2 id="film-title">Сделка как операционный сценарий</h2>
        </div>
        <aside className={styles.sceneDecisionSurface} aria-live="polite" aria-label="Selected procurement scene">
          <div>
            <p className={styles.eyebrow}>Активный кадр {activeSceneIndex} / {scenes.length}</p>
            <h3>{scene.title}</h3>
            <StatusPill value={scene.status} />
          </div>
          <dl>
            <div><dt>что контролирует UPGRADE</dt><dd>{scene.control}</dd></div>
            <div><dt>что получает WinGPro</dt><dd>{scene.receives}</dd></div>
            <div><dt>риск если пропустить</dt><dd>{scene.risk}</dd></div>
            <div><dt>связанный слой Digital Twin</dt><dd>{sceneLayerTitle}</dd></div>
          </dl>
        </aside>
        <details className={styles.filmstripDetailsDisclosure}>
          <summary>
            <span>детали сценария</span>
            <strong>Открыть 8 кадров сделки Источник → Повторное использование</strong>
            <small>Активный кадр остается сверху; полный operational filmstrip раскрывается по запросу без внутреннего скролла.</small>
          </summary>
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
                  <div><dt>что контролирует UPGRADE</dt><dd>{item.control}</dd></div>
                  <div><dt>что получает WinGPro</dt><dd>{item.receives}</dd></div>
                  <div><dt>риск если пропустить</dt><dd>{item.risk}</dd></div>
                  <div><dt>связанный слой Digital Twin</dt><dd>{twinLayers.find((layerItem) => layerItem.id === item.layer)?.title ?? item.layer}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </details>
      </section>

      <section className={sectionClass(styles.valueOs, "valueOs")} data-section="value-os" aria-labelledby="value-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Value operating system</p>
          <h2 id="value-title">Что получает WinGPro в техническом контуре</h2>
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
          {["качество подбора", "время согласований", "документальная готовность", "статусный контроль", "управляемость поставки", "монтажная подготовленность", "повторное использование товарных данных"].map((item) => <span key={item}>{item}</span>)}
        </div>
      </section>

      <section className={sectionClass(styles.projectControl, "projectControl")} id="project-control" data-section="project-control" aria-labelledby="control-scale-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Project Control Scale</p>
          <h2 id="control-scale-title">От поиска поставщика до Handover & Closeout</h2>
          <p>Этот слой показывает результат для WinGPro до деталей процесса: как выбирается поставщик, сравниваются условия, готовится договорная логика, ведется Delivery Timeline, формируется Work Plan Builder / ППР skeleton, собирается evidence и закрывается handover.</p>
        </div>
        <aside className={styles.controlCommandPanel} aria-live="polite" aria-label="Active project control command panel">
          <div>
            <p className={styles.eyebrow}>Active control state</p>
            <h3>{activeControl.artifact}</h3>
            <a className={styles.controlModuleLink} href={`#${activeControl.anchor}`}>Open active module</a>
          </div>
          <dl>
            <div><dt>status</dt><dd>{activeControl.status}</dd></div>
            <div><dt>owner</dt><dd>{activeControl.owner}</dd></div>
            <div><dt>next action</dt><dd>{activeControl.nextAction}</dd></div>
            <div><dt>handoff</dt><dd>{activeControl.handoff}</dd></div>
          </dl>
        </aside>

        <details className={styles.projectControlDetailsDisclosure}>
          <summary>
            <span>Control path detail</span>
            <strong>Открыть project modules, readiness snapshot и handoff spine</strong>
            <small>Сводка активного этапа остается сверху; полный маршрут раскрывается по запросу без внутреннего скролла.</small>
          </summary>
          <div className={styles.moduleIndex} aria-label="Project control modules">
            {[
              "Supplier Request Lab",
              "Offer Comparison Board",
              "Contract Decision Simulator",
              "Delivery Timeline",
              "Work Plan Builder",
              "Field Execution Board",
              "Photo Evidence Wall",
              "Implementation Status Dashboard",
              "Handover & Closeout"
            ].map((item) => <span key={item}>{item}</span>)}
          </div>
          <div className={styles.controlSnapshot} aria-label="Procurement cockpit snapshot">
            {controlSnapshot.map((item) => (
              <article key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.detail}</p>
                <em>{item.signal}</em>
              </article>
            ))}
          </div>

          <div className={styles.controlStepPanels}>
            {projectControlScale.map((step) => (
              <article key={step.id} id={`control-step-${step.id}`} role="tabpanel" className={styles.controlStepPanel} hidden={activeControlStep !== step.id}>
                <h3>{step.artifact}</h3>
                <dl>
                  <div><dt>что собирается</dt><dd>{step.result}</dd></div>
                  <div><dt>как помогает решению</dt><dd>{step.decision}</dd></div>
                  <div><dt>status</dt><dd>{step.status}</dd></div>
                  <div><dt>owner</dt><dd>{step.owner}</dd></div>
                  <div><dt>next action</dt><dd>{step.nextAction}</dd></div>
                  <div><dt>handoff output</dt><dd>{step.handoff}</dd></div>
                </dl>
              </article>
            ))}
          </div>

          <nav className={styles.moduleHandoffSpine} aria-label="Project control module navigation">
            {projectControlScale.map((step, index) => (
              <a
                key={step.id}
                href={`#${step.anchor}`}
                aria-current={activeControlStep === step.id ? "step" : undefined}
                onClick={() => setActiveControlStep(step.id)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step.artifact}</strong>
                <small>{step.spineSignal}</small>
              </a>
            ))}
          </nav>
        </details>

        <details className={styles.controlBoardsDisclosure}>
          <summary>
            <span>Операционные доски проекта</span>
            <strong>Открыть Supplier / Contract / Delivery / Work Plan / Evidence boards</strong>
            <small>Детали остаются в HTML и раскрываются по запросу, без внутреннего скролла внутри страницы.</small>
          </summary>
          <div className={styles.controlBoardGrid}>
          <article className={styles.supplierLab} id="supplier-request-lab" data-section="supplier-lab">
            <div className={styles.boardHeader}>
              <p className={styles.eyebrow}>Supplier Request Lab</p>
              <h3>Запросы, scoring, shortlist и selected rationale</h3>
              <p>UPGRADE не выбирает “на ощущениях”: каждый канал проходит через request queue, evidence gates и scoring. Финальное решение по маршруту остается за WinGPro.</p>
            </div>
            <aside className={styles.supplierDecisionPacket} aria-live="polite" aria-label="Selected supplier decision packet">
              <p className={styles.eyebrow}>Selected supplier decision packet</p>
              <h4>{supplier.name}</h4>
              <dl>
                <div><dt>decision signal</dt><dd>{supplier.decisionSignal}</dd></div>
                <div><dt>next evidence request</dt><dd>{supplier.nextEvidence}</dd></div>
                <div><dt>WinGPro handoff value</dt><dd>{supplier.handoffValue}</dd></div>
              </dl>
              <div>
                <strong>blockers before release</strong>
                <ul>
                  {supplier.blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}
                </ul>
              </div>
            </aside>
            <details className={styles.supplierDetailsDisclosure}>
              <summary>
                <span>Supplier evidence detail</span>
                <strong>Открыть request queue, scoring и candidate shortlist</strong>
                <small>Детали выбора поставщика раскрываются по запросу; решение WinGPro остается owner-controlled.</small>
              </summary>
              <div className={styles.requestQueue} aria-label="Supplier request queue">
                {supplierRequestQueue.map(([stage, request, gate]) => (
                  <section key={stage}>
                    <strong>{stage}</strong>
                    <p>{request}</p>
                    <em>{gate}</em>
                  </section>
                ))}
              </div>
              <div className={styles.supplierSignalGrid} aria-label="Supplier operating signals">
                {supplierOperatingSignals.map(([signal, detail, value]) => (
                  <section key={signal}>
                    <span>{signal}</span>
                    <strong>{detail}</strong>
                    <p>{value}</p>
                  </section>
                ))}
              </div>
              <div className={styles.supplierWorkbench}>
              <div className={styles.candidateStack} role="tablist" aria-label="Supplier candidates">
                {supplierCandidates.map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    role="tab"
                    aria-selected={activeSupplier === candidate.id}
                    aria-controls={`candidate-panel-${candidate.id}`}
                    onClick={() => setActiveSupplier(candidate.id)}
                  >
                    <span>{candidate.name}</span>
                    <strong>{candidate.score}</strong>
                    <StatusPill value={candidate.status} />
                  </button>
                ))}
              </div>
              <div className={styles.candidatePanels}>
                {supplierCandidates.map((candidate) => (
                  <section
                    key={candidate.id}
                    id={`candidate-panel-${candidate.id}`}
                    role="tabpanel"
                    className={styles.candidatePanel}
                    hidden={activeSupplier !== candidate.id}
                  >
                    <div className={styles.candidateHero}>
                      <div>
                        <p className={styles.eyebrow}>{candidate.channel}</p>
                        <h4>{candidate.name}</h4>
                      </div>
                      <strong>{candidate.score}/100</strong>
                    </div>
                    <p>{candidate.rationale}</p>
                    <div className={styles.scoreGrid}>
                      {candidate.criteria.map(([label, value, score]) => (
                        <article key={label}>
                          <span>{score}</span>
                          <strong>{label}</strong>
                          <p>{value}</p>
                        </article>
                      ))}
                    </div>
                    <div className={styles.openRequests}>
                      <h4>Evidence requests</h4>
                      <ul>
                        {candidate.openRequests.map((request) => <li key={request}>{request}</li>)}
                      </ul>
                    </div>
                    <p className={styles.recommendationNote}>{candidate.recommendation}</p>
                  </section>
                ))}
              </div>
            </div>
            </details>
          </article>

          <article className={styles.offerBoard} id="offer-comparison-board" data-section="offer-board">
            <div className={styles.boardHeader}>
              <p className={styles.eyebrow}>Offer Comparison Board</p>
              <h3>Выбор условий не прячется в переписке</h3>
              <p>Board показывает, какой сценарий выбора сейчас безопаснее: evidence-led, terms-led или speed-led. Это не утверждение технических параметров, а decision support для WinGPro.</p>
            </div>
            <aside className={styles.offerDecisionSurface} aria-live="polite" aria-label="Selected offer decision surface">
              <div>
                <p className={styles.eyebrow}>Selected offer decision surface</p>
                <h4>{decisionMode.title}</h4>
                <StatusPill value={decisionMode.score} />
              </div>
              <dl>
                <div><dt>owner decision</dt><dd>{decisionMode.ownerDecision}</dd></div>
                <div><dt>handoff output</dt><dd>{decisionMode.handoffOutput}</dd></div>
              </dl>
              <div>
                <strong>risks controlled</strong>
                <ul>
                  {decisionMode.risksControlled.map((risk) => <li key={risk}>{risk}</li>)}
                </ul>
              </div>
            </aside>
            <div className={styles.selectionSummary}>
              <h4>Selected supplier rationale</h4>
              <p>Текущий selected path: {supplier.name} через {decisionMode.title}. UPGRADE фиксирует evidence request, owner и release gate; WinGPro утверждает финальный маршрут выбора после проверки профильными участниками.</p>
            </div>
            <details className={styles.offerDetailsDisclosure}>
              <summary>
                <span>Offer comparison detail</span>
                <strong>Открыть decision modes, gates и comparison matrix</strong>
                <small>Детали сравнения раскрываются по запросу; UPGRADE структурирует evidence и decision support, а WinGPro утверждает маршрут выбора.</small>
              </summary>
              <div className={styles.decisionModeSwitch} role="tablist" aria-label="Offer decision modes">
                {offerDecisionModes.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    role="tab"
                    aria-selected={offerDecisionMode === mode.id}
                    aria-controls={`decision-mode-${mode.id}`}
                    onClick={() => setOfferDecisionMode(mode.id)}
                  >
                    {mode.title}
                  </button>
                ))}
              </div>
              <div className={styles.decisionModePanels}>
                {offerDecisionModes.map((mode) => (
                  <section key={mode.id} id={`decision-mode-${mode.id}`} role="tabpanel" hidden={offerDecisionMode !== mode.id}>
                    <StatusPill value={mode.score} />
                    <h4>{mode.title}</h4>
                    <p>{mode.summary}</p>
                    <strong>{mode.impact}</strong>
                  </section>
                ))}
              </div>
              <div className={styles.offerGateStrip} aria-label="Offer decision gates">
                {offerDecisionGates.map(([gate, evidence, owner]) => (
                  <section key={gate}>
                    <span>{gate}</span>
                    <strong>{evidence}</strong>
                    <p>{owner}</p>
                  </section>
                ))}
              </div>
              <div className={styles.offerMatrix} role="table" aria-label="Offer comparison matrix">
                <div role="row" className={styles.offerMatrixHeader}>
                  <span role="columnheader">Metric</span>
                  <span role="columnheader">Candidate A</span>
                  <span role="columnheader">Candidate B</span>
                  <span role="columnheader">Candidate C</span>
                  <span role="columnheader">Decision signal</span>
                  <span role="columnheader">Owner</span>
                </div>
                {offerComparison.map((row) => (
                  <div key={row.metric} role="row" className={styles.offerMatrixRow}>
                    <strong role="cell"><span className={styles.matrixCellLabel}>Metric</span>{row.metric}</strong>
                    <span role="cell"><span className={styles.matrixCellLabel}>Candidate A</span>{row.candidateA}</span>
                    <span role="cell"><span className={styles.matrixCellLabel}>Candidate B</span>{row.candidateB}</span>
                    <span role="cell"><span className={styles.matrixCellLabel}>Candidate C</span>{row.candidateC}</span>
                    <em role="cell"><span className={styles.matrixCellLabel}>Decision signal</span>{row.decisionSignal}</em>
                    <small role="cell"><span className={styles.matrixCellLabel}>Owner</span>{row.owner}</small>
                  </div>
                ))}
              </div>
            </details>
          </article>

          <article className={styles.contractSimulator} id="contract-decision-simulator" data-section="contract-simulator">
            <div className={styles.boardHeader}>
              <p className={styles.eyebrow}>Contract Decision Simulator</p>
              <h3>Evidence gates и delivery terms как decision board</h3>
              <p>Симулятор показывает, что меняется при разных сценариях согласования. Это не юридическая консультация и не утверждение условий за WinGPro; UPGRADE готовит структуру решения, evidence board и open questions.</p>
            </div>
            <aside className={styles.contractReleaseSurface} aria-live="polite" aria-label="Selected contract release decision">
              <div>
                <p className={styles.eyebrow}>Contract release decision</p>
                <h4>{contractScenario.title}</h4>
                <StatusPill value={contractScenario.decisionSignal} />
              </div>
              <dl>
                <div><dt>owner-required decision</dt><dd>{contractScenario.ownerRequiredDecision}</dd></div>
                <div><dt>evidence gate strength</dt><dd>{contractScenario.evidenceGateStrength}</dd></div>
                <div><dt>acceptance handoff</dt><dd>{contractScenario.acceptanceHandoff}</dd></div>
              </dl>
              <div>
                <strong>unresolved blockers</strong>
                <ul>
                  {contractScenario.unresolvedBlockers.map((blocker) => <li key={blocker}>{blocker}</li>)}
                </ul>
              </div>
            </aside>
            <div className={styles.contractDecisionSummary}>
              <h4>Current decision frame</h4>
              <p>{contractScenario.title}: {contractScenario.decisionSignal}. UPGRADE фиксирует status, evidence request и boundary; WinGPro и профильные участники принимают финальные технические, юридические, договорные и операционные решения.</p>
            </div>
            <details className={styles.contractDetailsDisclosure}>
              <summary>
                <span>Contract decision detail</span>
                <strong>Открыть release scenarios, evidence gates и contract matrix</strong>
                <small>Детали условий раскрываются по запросу; UPGRADE структурирует decision board, а WinGPro и профильные участники утверждают решения.</small>
              </summary>
              <div className={styles.contractScenarioTabs} role="tablist" aria-label="Contract decision scenarios">
                {contractScenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    type="button"
                    role="tab"
                    aria-selected={activeContractScenario === scenario.id}
                    aria-controls={`contract-scenario-${scenario.id}`}
                    onClick={() => setActiveContractScenario(scenario.id)}
                  >
                    {scenario.title}
                  </button>
                ))}
              </div>
              <div className={styles.contractScenarioPanels}>
                {contractScenarios.map((scenario) => (
                  <section key={scenario.id} id={`contract-scenario-${scenario.id}`} role="tabpanel" hidden={activeContractScenario !== scenario.id}>
                    <div className={styles.scenarioHero}>
                      <h4>{scenario.title}</h4>
                      <StatusPill value={scenario.decisionSignal} />
                    </div>
                    <dl className={styles.simulatorGrid}>
                      <div><dt>Release readiness</dt><dd>{scenario.releaseReadiness}</dd></div>
                      <div><dt>Delivery terms</dt><dd>{scenario.deliveryTerms}</dd></div>
                      <div><dt>Evidence before release</dt><dd>{scenario.evidenceBeforeRelease}</dd></div>
                      <div><dt>Evidence before shipment</dt><dd>{scenario.evidenceBeforeShipment}</dd></div>
                      <div><dt>Contract strength</dt><dd>{scenario.contractStrength}</dd></div>
                      <div><dt>Acceptance impact</dt><dd>{scenario.acceptanceImpact}</dd></div>
                    </dl>
                  </section>
                ))}
              </div>
              <div className={styles.contractValueGrid} aria-label="Contract value controls">
                {contractValueControls.map(([title, detail, artifact]) => (
                  <section key={title}>
                    <span>{title}</span>
                    <strong>{detail}</strong>
                    <p>{artifact}</p>
                  </section>
                ))}
              </div>
              <div className={styles.contractGateMatrix} role="table" aria-label="Contract gate matrix">
                <div role="row" className={styles.contractGateHeader}>
                  <span role="columnheader">Decision area</span>
                  <span role="columnheader">Options / evidence</span>
                  <span role="columnheader">Owner</span>
                  <span role="columnheader">Readiness signal</span>
                  <span role="columnheader">UPGRADE role</span>
                </div>
                {contractGateMatrix.map(([area, options, owner, signal, role]) => (
                  <div key={area} role="row" className={styles.contractGateRow}>
                    <strong role="cell"><span className={styles.matrixCellLabel}>Decision area</span>{area}</strong>
                    <span role="cell"><span className={styles.matrixCellLabel}>Options / evidence</span>{options}</span>
                    <span role="cell"><span className={styles.matrixCellLabel}>Owner</span>{owner}</span>
                    <em role="cell"><span className={styles.matrixCellLabel}>Readiness signal</span>{signal}</em>
                    <small role="cell"><span className={styles.matrixCellLabel}>UPGRADE role</span>{role}</small>
                  </div>
                ))}
              </div>
            </details>
          </article>

          <article className={styles.deliveryTimeline} id="delivery-timeline" data-section="delivery-timeline">
            <div className={styles.boardHeader}>
              <p className={styles.eyebrow}>Delivery Timeline</p>
              <h3>Поставка как release-control pipeline</h3>
              <p>UPGRADE ведет календарь информационной готовности: evidence, owner, blocker, handoff и release gate. Физические производственные, транспортные, таможенные и монтажные сроки остаются у профильных участников.</p>
            </div>
            <aside className={styles.deliveryReleaseSurface} aria-live="polite" aria-label="Selected delivery release board">
              <div>
                <p className={styles.eyebrow}>Selected release board</p>
                <h4>{deliveryPhase.phase}</h4>
                <p>{deliveryPhase.releaseDecision}</p>
              </div>
              <dl>
                <div><dt>evidence packet</dt><dd>{deliveryPhase.evidencePacket}</dd></div>
                <div><dt>handoff output</dt><dd>{deliveryPhase.handoff}</dd></div>
                <div><dt>escalation owner</dt><dd>{deliveryPhase.escalationOwner}</dd></div>
                <div><dt>status control</dt><dd>{deliveryPhase.statusControl}</dd></div>
              </dl>
            </aside>
            <div className={styles.deliveryReleaseMap} aria-label="Delivery release map">
              <span>release readiness</span>
              <span>production confirmation</span>
              <span>pre-shipment evidence</span>
              <span>logistics / broker handoff</span>
              <span>arrival evidence</span>
              <span>mounting handoff</span>
            </div>
            <p className={styles.deliverySummary}>Current release focus: {deliveryPhase.phase} → {deliveryPhase.output}. UPGRADE фиксирует status и evidence request; профильные участники подтверждают фактические действия и решения.</p>
            <details className={styles.deliveryDetailsDisclosure}>
              <summary>
                <span>Delivery phase detail</span>
                <strong>Открыть release phases, evidence checklist и blockers</strong>
                <small>Подробности раскрываются по запросу; UPGRADE ведет status/evidence board, а физические сроки и действия остаются у профильных участников.</small>
              </summary>
              <div className={styles.timelineRows} role="tablist" aria-label="Delivery release phases">
                {deliveryTimeline.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={activeDeliveryPhase === item.id}
                    aria-controls={`delivery-phase-${item.id}`}
                    data-active={activeDeliveryPhase === item.id}
                    onClick={() => setActiveDeliveryPhase(item.id)}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <StatusPill value={item.status} />
                    <strong>{item.phase}</strong>
                    <em>{item.releaseGate}</em>
                  </button>
                ))}
              </div>
              <div className={styles.deliveryPhasePanels}>
                {deliveryTimeline.map((item) => (
                  <section key={`delivery-${item.id}`} id={`delivery-phase-${item.id}`} role="tabpanel" tabIndex={0} hidden={activeDeliveryPhase !== item.id}>
                    <div className={styles.deliveryPhaseHero}>
                      <div>
                        <p className={styles.eyebrow}>Active release phase</p>
                        <h4>{item.phase}</h4>
                        <p>{item.targetOutcome}</p>
                      </div>
                      <StatusPill value={item.status} />
                    </div>
                    <dl className={styles.deliveryPhaseGrid}>
                      <div><dt>Required evidence</dt><dd>{item.evidence}</dd></div>
                      <div><dt>Owner</dt><dd>{item.owner}</dd></div>
                      <div><dt>UPGRADE action</dt><dd>{item.upgradeAction}</dd></div>
                      <div><dt>Blocked if</dt><dd>{item.blocker}</dd></div>
                      <div><dt>Output artifact</dt><dd>{item.output}</dd></div>
                      <div><dt>Boundary</dt><dd>{item.boundary}</dd></div>
                    </dl>
                    <div className={styles.deliveryReleaseChecklist} aria-label={`${item.phase} release board`}>
                      <div><span>release decision</span><strong>{item.releaseDecision}</strong></div>
                      <div><span>evidence packet</span><strong>{item.evidencePacket}</strong></div>
                      <div><span>escalation owner</span><strong>{item.escalationOwner}</strong></div>
                      <div><span>handoff output</span><strong>{item.handoff}</strong></div>
                      <div><span>status control</span><strong>{item.statusControl}</strong></div>
                    </div>
                  </section>
                ))}
              </div>
            </details>
          </article>

          <article className={styles.workPlanBuilder} id="work-plan-builder" data-section="work-plan-builder">
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

          <article className={styles.fieldBoard} id="field-execution-board" data-section="field-execution-board">
            <div className={styles.boardHeader}>
              <p className={styles.eyebrow}>Field Execution Board</p>
              <h3>Задачи монтажной стороны в своей зоне ответственности</h3>
              <p>Короткий status-layer показывает, где есть blocker, где нужен evidence и какие задачи можно передавать в handover. Это coordination view: UPGRADE фиксирует статусы и evidence path, а профильная монтажная сторона исполняет и подтверждает работы.</p>
            </div>
            <div className={styles.fieldCommandSurface}>
              <div className={styles.fieldStatusRail} role="tablist" aria-label="Field execution task statuses">
                {fieldStatuses.map((status) => {
                  const tasks = fieldTasks.filter((task) => task[1] === status);
                  return (
                    <button
                      key={status}
                      type="button"
                      role="tab"
                      aria-selected={activeFieldStatus === status}
                      aria-controls={`field-status-${status.toLowerCase().replaceAll(" ", "-")}`}
                      data-active={activeFieldStatus === status}
                      onClick={() => setActiveFieldStatus(status)}
                    >
                      <span>{status}</span>
                      <strong>{tasks.length}</strong>
                      <small>{fieldStatusCues[status]}</small>
                    </button>
                  );
                })}
              </div>
              <aside className={styles.fieldStatusPanel} aria-live="polite" aria-label="Selected field status summary">
                <p className={styles.eyebrow}>Selected field status</p>
                <h4>{activeFieldStatus}</h4>
                <p>{fieldStatusCues[activeFieldStatus]}</p>
                <dl>
                  <div><dt>tasks</dt><dd>{activeFieldTasks.length}</dd></div>
                  <div><dt>next action</dt><dd>{fieldStatusNextActions[activeFieldStatus]}</dd></div>
                  <div><dt>boundary</dt><dd>не официальный ППР и не контроль монтажа</dd></div>
                </dl>
              </aside>
            </div>
            <div className={styles.fieldPanels}>
              {fieldStatuses.map((status) => {
                const tasks = fieldTasks.filter((task) => task[1] === status);
                return (
                  <section
                    key={status}
                    id={`field-status-${status.toLowerCase().replaceAll(" ", "-")}`}
                    role="tabpanel"
                    tabIndex={0}
                    hidden={activeFieldStatus !== status}
                  >
                    <h4>{status}</h4>
                    {tasks.length > 0 ? tasks.map(([task, , evidence]) => (
                      <div key={task}>
                        <strong>{task}</strong>
                        <span>{evidence}</span>
                      </div>
                    )) : (
                      <p>В этом статусе нет активных задач. Если field owner обновит состояние, UPGRADE зафиксирует evidence path и связь с handover.</p>
                    )}
                  </section>
                );
              })}
            </div>
          </article>

          <article className={styles.evidenceWall} id="photo-evidence-wall" data-section="photo-evidence-wall">
            <div className={styles.boardHeader}>
              <p className={styles.eyebrow}>Photo Evidence Wall</p>
              <h3>Evidence register без server upload</h3>
              <p>Evidence Wall показывает не галерею ради галереи, а фазу evidence, owner, риск и связь с handover. Файлы не загружаются на сервер; это локальный preview контур для статусов, фотоотчетов и closeout.</p>
            </div>
            <div className={styles.evidenceWallSurface}>
              <div className={styles.evidencePhaseRail} role="tablist" aria-label="Photo evidence phases">
                {evidenceCards.map(([phase, evidence, owner]) => (
                  <button
                    key={phase}
                    type="button"
                    role="tab"
                    aria-selected={activeEvidencePhase === phase}
                    aria-controls={`evidence-wall-${phase.toLowerCase().replaceAll(" ", "-")}`}
                    data-active={activeEvidencePhase === phase}
                    onClick={() => setActiveEvidencePhase(phase)}
                  >
                    <span aria-hidden="true" />
                    <strong>{phase}</strong>
                    <small>{owner}</small>
                    <em>{evidence}</em>
                  </button>
                ))}
              </div>
              <aside className={styles.evidencePhasePanel} aria-live="polite" aria-label="Selected evidence phase summary">
                <p className={styles.eyebrow}>Selected evidence phase</p>
                <h4>{evidenceCard[0]}</h4>
                <p>{evidenceCard[1]}</p>
                <dl>
                  <div><dt>owner</dt><dd>{evidenceCard[2]}</dd></div>
                  <div><dt>release gate</dt><dd>{evidenceHandoff.gate}</dd></div>
                  <div><dt>handover pack</dt><dd>{evidenceHandoff.handoverPack}</dd></div>
                  <div><dt>risk link</dt><dd>{evidenceHandoff.riskLink}</dd></div>
                </dl>
              </aside>
            </div>
            <div className={styles.evidenceWallPanels}>
              {evidenceCards.map(([phase, evidence, owner]) => (
                <section
                  key={`evidence-wall-${phase}`}
                  id={`evidence-wall-${phase.toLowerCase().replaceAll(" ", "-")}`}
                  role="tabpanel"
                  tabIndex={0}
                  hidden={activeEvidencePhase !== phase}
                >
                  <h4>{phase}</h4>
                  <dl>
                    <div><dt>evidence</dt><dd>{evidence}</dd></div>
                    <div><dt>owner</dt><dd>{owner}</dd></div>
                    <div><dt>handover link</dt><dd>{evidenceHandoff.handoverPack}</dd></div>
                  </dl>
                </section>
              ))}
            </div>
          </article>

          <article className={styles.evidenceHandoff}>
            <div className={styles.boardHeader}>
              <p className={styles.eyebrow}>Evidence handoff layer</p>
              <h3>Как field evidence попадает в closeout packs</h3>
              <p>Фотоотчеты, receiving notes и field task updates становятся не медиа-архивом, а evidence register: они связываются с release gate, risk radar, handover pack и владельцем следующего решения.</p>
            </div>
            <div className={styles.evidenceHandoffShell}>
              <div className={styles.evidenceHandoffTabs} role="tablist" aria-label="Evidence handoff phases">
                {evidenceHandoffLinks.map((item) => (
                  <button
                    key={item.phase}
                    type="button"
                    role="tab"
                    aria-selected={activeEvidencePhase === item.phase}
                    aria-controls={`evidence-handoff-${item.phase.toLowerCase().replaceAll(" ", "-")}`}
                    data-active={activeEvidencePhase === item.phase}
                    onClick={() => setActiveEvidencePhase(item.phase)}
                  >
                    <span>{item.gate.split(" — ")[0]}</span>
                    {item.phase}
                  </button>
                ))}
              </div>
              <aside className={styles.evidenceHandoffSummary} aria-live="polite" aria-label="Selected evidence handoff summary">
                <p className={styles.eyebrow}>Selected evidence path</p>
                <h4>{evidenceHandoff.phase}</h4>
                <dl>
                  <div><dt>release gate</dt><dd>{evidenceHandoff.gate}</dd></div>
                  <div><dt>field tasks</dt><dd>{evidenceHandoff.fieldTasks}</dd></div>
                  <div><dt>handover pack</dt><dd>{evidenceHandoff.handoverPack}</dd></div>
                  <div><dt>closeout output</dt><dd>{evidenceHandoff.closeoutOutput}</dd></div>
                </dl>
              </aside>
            </div>
            <div className={styles.evidenceHandoffPanels}>
              {evidenceHandoffLinks.map((item) => (
                <section
                  key={`evidence-handoff-${item.phase}`}
                  id={`evidence-handoff-${item.phase.toLowerCase().replaceAll(" ", "-")}`}
                  role="tabpanel"
                  tabIndex={0}
                  hidden={activeEvidencePhase !== item.phase}
                >
                  <h4>{item.phase}</h4>
                  <dl>
                    <div><dt>evidence input</dt><dd>{item.evidenceInput}</dd></div>
                    <div><dt>risk link</dt><dd>{item.riskLink}</dd></div>
                    <div><dt>owner</dt><dd>{item.owner}</dd></div>
                    <div><dt>closeout output</dt><dd>{item.closeoutOutput}</dd></div>
                    <div><dt>UPGRADE boundary</dt><dd>{item.boundary}</dd></div>
                  </dl>
                </section>
              ))}
            </div>
          </article>

          <article className={styles.statusDashboard} data-section="implementation-status-dashboard">
            <div className={styles.boardHeader}>
              <p className={styles.eyebrow}>Implementation Status Dashboard</p>
              <h3>Готовность проекта по ключевым контурам</h3>
            </div>
            <details className={styles.statusDashboardDetails}>
              <summary>
                <span>Readiness metrics</span>
                <strong>Открыть {implementationMetrics.length} статуса готовности</strong>
              </summary>
              <div className={styles.metricGrid}>
                {implementationMetrics.map(([metric, value, note]) => (
                  <section key={metric}>
                    <strong>{value}</strong>
                    <span>{metric}</span>
                    <p>{note}</p>
                  </section>
                ))}
              </div>
            </details>
          </article>
          </div>
        </details>
      </section>

      <section className={sectionClass(styles.controlRoom, "controlRoom")} id="control-room" data-section="control-room" aria-labelledby="control-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Control Room поставки</p>
          <h2 id="control-title">Живой центр управления данными, статусами и handoff</h2>
          <p>UPGRADE управляет информационным контуром и точками эскалации. Фактические действия третьих лиц остаются в зоне ответственности соответствующих участников.</p>
        </div>
        <div className={styles.statusLine}>
          {statusLine.map(([name, status]) => <article key={name}><span>{name}</span><StatusPill value={status} /></article>)}
        </div>
        <div className={styles.controlGrid}>
          <article className={styles.controlActiveSurface} aria-live="polite" aria-label="Selected project participant">
            <p className={styles.eyebrow}>Active participant</p>
            <h3>{participant.name}</h3>
            <p>{participant.flow}</p>
            <dl>
              <div><dt>UPGRADE структурирует</dt><dd>{participant.upgrade}</dd></div>
              <div><dt>не UPGRADE утверждает</dt><dd>{participant.outside}</dd></div>
            </dl>
          </article>
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
        <details className={styles.controlParticipantsDisclosure}>
          <summary>
            <span>Participant map</span>
            <strong>Открыть карту участников и зон ответственности</strong>
            <small>Активный участник остается сверху; полная карта ролей раскрывается по запросу.</small>
          </summary>
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
        </details>
      </section>

      <section className={sectionClass(styles.routeMap, "routeMap")} data-section="route-map" aria-labelledby="route-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Route Map</p>
          <h2 id="route-title">Маршрут поставки как управляемый data-flow</h2>
          <p>UPGRADE контролирует не транспорт как перевозчик, а информационную готовность маршрута.</p>
        </div>
        <aside className={styles.routeDataSurface} aria-live="polite" aria-label="Selected route data-flow point">
          <div>
            <p className={styles.eyebrow}>Active route point</p>
            <h3>{routePoint.title}</h3>
            <p>{routePoint.readiness}</p>
          </div>
          <dl>
            <div><dt>status</dt><dd><StatusPill value={routePoint.status} /></dd></div>
            <div><dt>release gate</dt><dd>{routePoint.gate}</dd></div>
            <div><dt>documents</dt><dd>{routePoint.documents}</dd></div>
            <div><dt>data gap response</dt><dd>{routePoint.response}</dd></div>
            <div><dt>boundary</dt><dd>{routePoint.boundary}</dd></div>
          </dl>
        </aside>
        <details className={styles.routeDetailsDisclosure}>
          <summary>
            <span>Route data-flow detail</span>
            <strong>Открыть China → Kazakhstan route points и handoff cards</strong>
            <small>Active route point остается сверху; полный data-flow раскрывается по запросу без внутреннего скролла.</small>
          </summary>
          <div className={styles.routeSelectorRow}>
            <label htmlFor="route-point-selector">Route point</label>
            <select
              id="route-point-selector"
              className={styles.routePointSelect}
              value={activeRoute}
              onChange={(event) => setActiveRoute(event.currentTarget.value)}
              aria-label="Выбрать route data-flow point"
            >
              {routePoints.map((point) => (
                <option key={point.title} value={point.title}>
                  {point.title} — {point.gate}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.routeFlow} aria-label="China to Kazakhstan delivery data-flow readiness">
            {routePoints.map((point) => (
              <span
                key={point.title}
                aria-current={activeRoute === point.title ? "step" : undefined}
                data-active={activeRoute === point.title}
                data-status={point.status}
              >
                <StatusPill value={point.status} />
                <span>{point.title}</span>
                <small>{point.gate}</small>
              </span>
            ))}
          </div>
          <div className={styles.routeCards}>
            {routePoints.map((point) => (
              <article
                key={`route-${point.title}`}
                id={`route-point-${point.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className={styles.routeCard}
                role="tabpanel"
                tabIndex={0}
                hidden={activeRoute !== point.title}
              >
                <h3>{point.title}</h3>
                <dl>
                  <div><dt>status</dt><dd><StatusPill value={point.status} /></dd></div>
                  <div><dt>required data</dt><dd>{point.data}</dd></div>
                  <div><dt>documents</dt><dd>{point.documents}</dd></div>
                  <div><dt>owner</dt><dd>{point.owner}</dd></div>
                  <div><dt>UPGRADE action</dt><dd>{point.action}</dd></div>
                  <div><dt>risk if missing</dt><dd>{point.risk}</dd></div>
                  <div><dt>release gate</dt><dd>{point.gate}</dd></div>
                  <div><dt>readiness signal</dt><dd>{point.readiness}</dd></div>
                  <div><dt>boundary</dt><dd>{point.boundary}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </details>
      </section>

      <section className={sectionClass(styles.vault, "vault")} id="vault" data-section="document-vault" aria-labelledby="vault-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Document Vault</p>
          <h2 id="vault-title">Data-room как хранилище статусов, владельцев и evidence</h2>
        </div>
        <div className={styles.vaultReadinessBoard} aria-live="polite" aria-label="Document Vault readiness board">
          <div>
            <p className={styles.eyebrow}>Vault readiness</p>
            <h3>Документы связаны с release gates и route handoff</h3>
            <p>Каждая карточка показывает не только файл, но и где он влияет на качество, время, маршрут, customs/logistics handoff, монтажные вводные или digital product asset.</p>
          </div>
          <div className={styles.vaultStats}>
            {vaultReadinessStats.map(([label, value, note]) => (
              <span key={label}>
                <strong>{value}</strong>
                <small>{label}</small>
                <em>{note}</em>
              </span>
            ))}
          </div>
          <details className={styles.vaultOpenFocusDisclosure}>
            <summary>
              <span>Missing / requested focus</span>
              <strong>{visibleOpenDocs.length} open evidence item(s)</strong>
              <small>{visibleOpenFocusDocs.map((doc) => doc[1]).join(" / ") || "Filtered scope has no missing/requested documents."}</small>
            </summary>
            <div className={styles.vaultOpenList}>
              <strong>Owner queue detail</strong>
              {visibleOpenDocs.length > 0 ? (
                <ul>
                  {visibleOpenFocusDocs.map((doc) => (
                    <li key={`open-${doc[1]}`}>
                      <span>{doc[1]}</span>
                      <em>{getVaultReleaseLane(doc[3])}</em>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Filtered scope has no missing/requested documents.</p>
              )}
              {visibleOpenDocs.length > visibleOpenFocusDocs.length ? (
                <p>{visibleOpenDocs.length - visibleOpenFocusDocs.length} more open item(s) inside card-level detail.</p>
              ) : null}
            </div>
          </details>
        </div>
        <div className={styles.vaultCommandStrip} aria-live="polite" aria-label="Document Vault active command">
          <div>
            <span>active query</span>
            <p>{vaultActiveQuery.length ? vaultActiveQuery.map(([label, value]) => `${label}: ${value}`).join(" / ") : "all documents / vault mode"}</p>
          </div>
          {vaultResponsePackage.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <p>{value}</p>
            </div>
          ))}
          <div className={styles.vaultQuickActions}>
            <button type="button" onClick={showVaultOpenItems}>Show missing/requested</button>
            <button type="button" onClick={resetVaultFilters}>Reset filters</button>
          </div>
        </div>
        <details className={styles.hexnovasVaultRouteLayer}>
          <summary className={styles.hexnovasVaultRouteSummary}>
            <span>Hexnovas route layer</span>
            <strong>Source → Data-room → Gate → Owner → Action</strong>
            <small>{hexnovasVaultTraceRows.length} source signals / route-level detail по архиву Hexnovas</small>
          </summary>
          <div className={styles.hexnovasVaultRouteBody} aria-label="Hexnovas source to vault route summary">
            <div className={styles.hexnovasVaultRouteIntro}>
              <span>route logic</span>
              <strong>Архив превращается в queue для Document Vault</strong>
              <p>Короткий слой показывает, что идет в release, что требует решения владельца и где остается boundary UPGRADE.</p>
            </div>
            <div className={styles.hexnovasVaultRouteStats}>
              {hexnovasVaultTraceStats.map(([label, value, note]) => (
                <article key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <small>{note}</small>
                </article>
              ))}
            </div>
            <details className={styles.hexnovasVaultRouteCardsDisclosure}>
              <summary>
                <span>route cards</span>
                <strong>{hexnovasVaultRouteCards.length} owner / gate / action cards</strong>
                <small>Открыть route-level detail по архиву Hexnovas</small>
              </summary>
              <div className={styles.hexnovasVaultRouteCards}>
                {hexnovasVaultRouteCards.map(([label, title, gateName, action, owner]) => (
                  <article key={title}>
                    <span>{label}</span>
                    <strong>{title}</strong>
                    <dl>
                      <div><dt>Gate</dt><dd>{gateName}</dd></div>
                      <div><dt>Action</dt><dd>{action}</dd></div>
                      <div><dt>Owner</dt><dd>{owner}</dd></div>
                    </dl>
                  </article>
                ))}
              </div>
            </details>
          </div>
        </details>
        <details className={styles.hexnovasVaultTrace}>
          <summary>
            <span>Hexnovas evidence bridge</span>
            <strong>{hexnovasVaultTraceRows.length} source signals linked to release gates</strong>
            <small>Открыть Source → Data-room → Gate → Owner → Action по архиву Hexnovas / WinGPro</small>
          </summary>
          <div className={styles.hexnovasVaultTraceIntro}>
            <p>
              Этот слой связывает архив Hexnovas с Document Vault: selection sheets, PI, drawing,
              сертификаты и executive report превращаются в проверяемую цепочку evidence, risk
              register и handover. UPGRADE структурирует data-room и owner queue; финальные
              технические, проектные и договорные решения подтверждают WinGPro и профильные участники.
            </p>
          </div>
          <div className={styles.hexnovasVaultTraceGrid} role="table" aria-label="Hexnovas evidence to Document Vault traceability">
            <div className={styles.hexnovasVaultTraceHead} role="row">
              <span role="columnheader">Source</span>
              <span role="columnheader">Data-room role</span>
              <span role="columnheader">Gate</span>
              <span role="columnheader">Owner</span>
              <span role="columnheader">UPGRADE action</span>
              <span role="columnheader">Approval boundary</span>
            </div>
            {hexnovasVaultTraceRows.map((row) => (
              <div className={styles.hexnovasVaultTraceRow} role="row" key={`${row.source}-${row.releaseGate}`}>
                <div role="cell" className={styles.hexnovasVaultTraceSource}>
                  <span className={styles.matrixCellLabel}>Source</span>
                  <strong>{row.source}</strong>
                  <span className={styles.hexnovasVaultTraceLinks}>
                    {row.evidenceSignalTitles.map((title) => (
                      <a
                        key={title}
                        href={`#${getHexnovasSignalId(title)}`}
                        onClick={(event) => openHexnovasEvidenceSignal(event, title)}
                        aria-label={`Открыть evidence card ${title} в supplier evidence pack`}
                      >
                        {title}
                      </a>
                    ))}
                  </span>
                </div>
                <span role="cell"><span className={styles.matrixCellLabel}>Data-room role</span>{row.dataRoomRole}</span>
                <em role="cell"><span className={styles.matrixCellLabel}>Gate</span>{row.releaseGate}</em>
                <small role="cell"><span className={styles.matrixCellLabel}>Owner</span>{row.owner}</small>
                <p role="cell"><span className={styles.matrixCellLabel}>UPGRADE action</span>{row.action}</p>
                <p role="cell"><span className={styles.matrixCellLabel}>Approval boundary</span>{row.approvalBoundary}</p>
              </div>
            ))}
          </div>
        </details>
        <details className={styles.vaultFilterDisclosure}>
          <summary>
            <span>Filter controls</span>
            <strong>Открыть filters и режимы Vault</strong>
            <small>{vaultActiveQuery.length ? vaultActiveQuery.map(([label, value]) => `${label}: ${value}`).join(" / ") : "Сейчас показан общий data-room; quick actions остаются сверху."}</small>
          </summary>
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
        </details>
        <details className={styles.vaultCardsDisclosure}>
          <summary>
            <span>Document card detail</span>
            <strong>{visibleDocs.length} visible cards / {visibleOpenDocs.length} open evidence items</strong>
            <small>Открыть полный card-level data-room без внутреннего scroll</small>
          </summary>
          <div className={styles.vaultGrid} data-mode={vaultMode}>
            {vaultDocs.map((doc) => {
              const [category, title, type, gate, owner, status, impact, quality, time, risk, action] = doc;
              const releaseLane = getVaultReleaseLane(gate);
              const routeLink = getVaultRouteLink(category, gate);
              const operationalCue = getVaultOperationalCue(status, impact);
              return (
              <article key={`${category}-${title}`} hidden={!isDocVisible(doc)}>
                <div className={styles.docTop}><span>{category}</span><StatusPill value={status} /></div>
                <h3>{title}</h3>
                <dl>
                  <div><dt>type</dt><dd>{type}</dd></div>
                  <div><dt>release gate</dt><dd>{gate}</dd></div>
                  <div><dt>release lane</dt><dd>{releaseLane}</dd></div>
                  <div><dt>route link</dt><dd>{routeLink}</dd></div>
                  <div><dt>owner</dt><dd>{owner}</dd></div>
                  <div><dt>quality impact</dt><dd>{quality}</dd></div>
                  <div><dt>time impact</dt><dd>{time}</dd></div>
                  <div><dt>risk if absent</dt><dd>{risk}</dd></div>
                  <div><dt>UPGRADE action</dt><dd>{action}</dd></div>
                  <div><dt>operational cue</dt><dd>{operationalCue}</dd></div>
                  <div><dt>impact</dt><dd>{impact}</dd></div>
                </dl>
              </article>
            );
            })}
            <p className={styles.emptyState} hidden={visibleDocs.length > 0}>No vault cards match the selected filters.</p>
          </div>
        </details>
      </section>

      <section className={sectionClass(styles.riskRadar, "riskRadar")} id="risk-radar" data-section="risk-radar" aria-labelledby="risk-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Risk Radar</p>
          <h2 id="risk-title">Риски как координационный response pack</h2>
        </div>
        <div className={styles.riskFilters}>
          <label htmlFor="risk-impact-filter">Impact filter</label>
          <select
            id="risk-impact-filter"
            className={styles.riskImpactSelect}
            value={riskImpact}
            onChange={(event) => selectRiskImpact(event.currentTarget.value as RiskImpact | "all")}
            aria-label="Выбрать risk impact filter"
          >
            {(["all", "quality", "time", "decision", "dependency"] as Array<RiskImpact | "all">).map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className={styles.riskSummaryRail} aria-label="Risk radar summary">
          <span><strong>{risks.filter((item) => item.severity === "high").length}</strong><small>high risks</small></span>
          <span><strong>{riskImpact}</strong><small>active impact filter</small></span>
          <span><strong>{risk.releaseGate.split(" — ")[0]}</strong><small>selected gate</small></span>
          <span><strong>{risk.owner}</strong><small>escalation owner</small></span>
        </div>
        <aside className={styles.riskResponseSurface} aria-live="polite" aria-label="Selected risk response pack">
          <div>
            <p className={styles.eyebrow}>Selected risk response</p>
            <h3>{risk.title}</h3>
            <p>{risk.response}</p>
          </div>
          <dl>
            <div><dt>Vault evidence</dt><dd>{risk.vaultEvidence}</dd></div>
            <div><dt>Release gate</dt><dd>{risk.releaseGate}</dd></div>
            <div><dt>Route handoff</dt><dd>{risk.routeHandoff}</dd></div>
            <div><dt>Decision owner</dt><dd>{risk.decision}</dd></div>
          </dl>
          <details className={styles.riskResponseDisclosure}>
            <summary>
              <span>Response sequence</span>
              <strong>Открыть actions и linked vault cards</strong>
              <small>{riskResponseSequence.length} actions / {riskVaultDocs.length || "no"} linked vault cards</small>
            </summary>
            <div className={styles.riskResponseDetailGrid}>
              <div className={styles.riskCommandStrip} aria-label="Risk response sequence">
                {riskResponseSequence.map(([label, value]) => (
                  <section key={label}>
                    <span>{label}</span>
                    <p>{value}</p>
                  </section>
                ))}
              </div>
              <div className={styles.riskVaultLinks} aria-label="Risk linked vault cards">
                <strong>Linked vault cards</strong>
                {riskVaultDocs.length > 0 ? (
                  <ul>
                    {riskVaultDocs.map((doc) => (
                      <li key={`risk-link-${doc[1]}`}>
                        <span>{doc[1]}</span>
                        <em>{doc[3]} / {doc[5]}</em>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No direct vault card match; keep as response note.</p>
                )}
              </div>
            </div>
          </details>
        </aside>
        <details className={styles.riskDetailsDisclosure}>
          <summary>
            <span>Risk radar detail</span>
            <strong>Открыть impact matrix и response pack</strong>
            <small>Матрица раскрывается по запросу; по умолчанию видны выбранный риск, owner, gate и evidence request.</small>
          </summary>
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
                    <div><dt>Vault evidence</dt><dd>{item.vaultEvidence}</dd></div>
                    <div><dt>Release gate</dt><dd>{item.releaseGate}</dd></div>
                    <div><dt>Route handoff</dt><dd>{item.routeHandoff}</dd></div>
                    <div><dt>Decision owner</dt><dd>{item.decision}</dd></div>
                    <div><dt>UPGRADE boundary</dt><dd>{item.boundary}</dd></div>
                  </dl>
                  <div className={styles.responsePack}>
                    <h4>Risk response pack</h4>
                    <ul>
                      <li>{item.response}</li>
                      <li>Vault evidence: {item.vaultEvidence}</li>
                      <li>Release gate: {item.releaseGate}</li>
                      <li>Route handoff: {item.routeHandoff}</li>
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </details>
      </section>

      <section className={sectionClass(styles.releaseGates, "releaseGates")} id="release-gates" data-section="release-gates" aria-labelledby="gates-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Release gates</p>
          <h2 id="gates-title">Поставка как pipeline готовности данных</h2>
          <p>UPGRADE контролирует готовность данных и статусный контур, а не принимает на себя действия третьих лиц.</p>
        </div>
        <aside className={styles.gateControlSurface} aria-live="polite" aria-label="Selected release gate control packet">
          <div>
            <p className={styles.eyebrow}>Selected gate packet</p>
            <h3>{gate[0]}</h3>
            <p>{getGateStopGo(gate[0])}</p>
          </div>
          <dl>
            <div><dt>Vault evidence</dt><dd>{gateVaultLinks.length > 0 ? gateVaultLinks.join(", ") : gate[2]}</dd></div>
            <div><dt>Risk radar links</dt><dd>{gateRiskLinks.length > 0 ? gateRiskLinks.join(", ") : "closeout / open issues"}</dd></div>
            <div><dt>Route handoff</dt><dd>{gateRouteLinks.length > 0 ? gateRouteLinks.join(", ") : "Handover Room"}</dd></div>
            <div><dt>Output</dt><dd>{gate[6]}</dd></div>
          </dl>
          <details className={styles.gateCommandDisclosure}>
            <summary>
              <span>Action sequence</span>
              <strong>Открыть {gateCommandSequence.length} linked actions</strong>
            </summary>
            <div className={styles.gateCommandStrip} aria-label="Selected release gate command sequence">
              {gateCommandSequence.map(([label, value]) => (
                <section key={label}>
                  <span>{label}</span>
                  <p>{value}</p>
                </section>
              ))}
            </div>
          </details>
        </aside>
        <details className={styles.releaseGateDetailsDisclosure}>
          <summary>
            <span>Release gate detail</span>
            <strong>Открыть pipeline gates, stop/go checklist и linked evidence</strong>
            <small>Selected gate packet остается сверху; полный pipeline раскрывается по запросу без внутреннего скролла.</small>
          </summary>
          <div className={styles.gatePipeline} role="tablist" aria-label="Release gate pipeline">
            {gates.map((gate, index) => (
              <button
                key={gate[0]}
                type="button"
                role="tab"
                aria-selected={activeGate === index}
                aria-controls={`release-gate-${index}`}
                data-active={activeGate === index}
                onClick={() => setActiveGate(index)}
              >
                <span>{String(index).padStart(2, "0")}</span>
                {gate[0]}
              </button>
            ))}
          </div>
          <div className={styles.gateDetails}>
            {gates.map((gate, index) => (
              <article key={`gate-${gate[0]}`} id={`release-gate-${index}`} role="tabpanel" tabIndex={0} className={styles.gateDetail} hidden={activeGate !== index}>
                <h3>{gate[0]}</h3>
                <dl>
                  <div><dt>objective</dt><dd>{gate[1]}</dd></div>
                  <div><dt>required evidence</dt><dd>{gate[2]}</dd></div>
                  <div><dt>owner</dt><dd>{gate[3]}</dd></div>
                  <div><dt>UPGRADE action</dt><dd>{gate[4]}</dd></div>
                  <div><dt>blocked if</dt><dd>{gate[5]}</dd></div>
                  <div><dt>output artifact</dt><dd>{gate[6]}</dd></div>
                  <div><dt>stop/go signal</dt><dd>{getGateStopGo(gate[0])}</dd></div>
                  <div><dt>Vault evidence</dt><dd>{getGateVaultLinks(gate[0]).join(", ") || gate[2]}</dd></div>
                  <div><dt>Risk radar links</dt><dd>{getGateRiskLinks(gate[0]).join(", ") || "closeout / open issues"}</dd></div>
                  <div><dt>Route handoff</dt><dd>{getGateRouteLinks(gate[0]).join(", ") || "Handover Room"}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </details>
      </section>

      <section className={sectionClass(styles.statusOfCustomer, "statusOfCustomer")} data-section="customer-status" aria-labelledby="customer-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>WinGPro как заказчик высокого уровня</p>
          <h2 id="customer-title">Процесс выглядит как зрелый procurement management</h2>
        </div>
        <div className={styles.beforeAfter}>
          <article><h3>Before</h3><ul>{["scattered messages", "late questions", "unclear responsibility", "missing evidence", "reactive decisions"].map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article><h3>After</h3><ul>{["structured request", "documented decisions", "status ownership", "evidence before release/shipment", "proactive handoff"].map((item) => <li key={item}>{item}</li>)}</ul></article>
        </div>
      </section>

      <section className={sectionClass(styles.handoverRoom, "handoverRoom")} id="handover" data-section="handover-room" aria-labelledby="handover-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Handover Room</p>
          <h2 id="handover-title">Что получает каждая сторона</h2>
          <p>Closeout строится как deliverables package: каждый handover pack связан с release gate, evidence, владельцем и практической ценностью. Сверка результата идет по переданным deliverables, а не по действиям производителя, перевозчика, брокера, монтажной организации или иных третьих лиц.</p>
        </div>
        <div className={styles.handoverExecutiveGrid}>
          <div className={styles.handoverCompactStack}>
            <div className={styles.handoverMetrics} aria-label="Closeout readiness summary">
              <span><strong>6</strong><small>handover packs</small></span>
              <span><strong>Gate 6</strong><small>deliverables review</small></span>
              <span><strong>Gate 7</strong><small>reuse asset</small></span>
              <span><strong>data-room</strong><small>technical closeout</small></span>
            </div>
            <div className={styles.handoverOutcomeStrip} aria-label="Что получает WinGPro на выходе handover">
              {handoverOutcomeCards.map((item) => (
                <article key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
          <aside className={styles.handoverControlSurface} aria-live="polite" aria-label="Selected handover pack control packet">
            <div className={styles.handoverControlLead}>
              <p className={styles.eyebrow}>Selected handover packet</p>
              <h3>{handoverPack.name}</h3>
              <p>{handoverPack.acceptance}. {getHandoverOwnerCue(handoverPack)}</p>
            </div>
            <dl>
              <div><dt>release gates</dt><dd>{handoverGateLinks.map((item) => item[0]).join(", ") || handoverPack.gate}</dd></div>
              <div><dt>vault evidence</dt><dd>{uniqueList(handoverVaultLinks.map((item) => item[1])).join(", ") || handoverPack.evidence}</dd></div>
              <div><dt>risk responses</dt><dd>{uniqueList(handoverRiskLinks.map((item) => item.title)).join(", ") || "open issues register"}</dd></div>
              <div><dt>route / data-flow</dt><dd>{uniqueList(handoverRouteLinks.map((item) => item.title)).join(", ") || "Handover Room"}</dd></div>
              <div><dt>output artifact</dt><dd>{uniqueList(handoverGateLinks.map((item) => item[6])).join(", ") || handoverPack.format}</dd></div>
              <div><dt>handover logic</dt><dd>Сверка результата привязана к переданным evidence-pack, а не к физическим работам или результатам третьих лиц.</dd></div>
            </dl>
          </aside>
        </div>
        <details className={styles.handoverCommandDisclosure}>
          <summary>
            <span>Command sequence</span>
            <strong>Открыть 6 шагов closeout-пакета</strong>
            <small>Gate, Vault, Risk, Route, review signal и reusable asset раскрываются по запросу.</small>
          </summary>
          <div className={styles.handoverCommandStrip} aria-label="Selected handover command sequence">
            {handoverCommandSequence.map(([label, value]) => (
              <section key={label}>
                <span>{label}</span>
                <p>{value}</p>
              </section>
            ))}
          </div>
        </details>
        <details className={styles.handoverDetailsDisclosure}>
          <summary>
            <span>Closeout details</span>
            <strong>Открыть handover packs и deliverables matrix</strong>
            <small>Подробности раскрываются по запросу; сверка остается привязанной к deliverables и evidence, а не к действиям третьих лиц.</small>
          </summary>
          <div className={styles.packTabs} role="tablist" aria-label="Handover packs">
            {handoverPacks.map((item) => (
              <button
                key={item.name}
                type="button"
                role="tab"
                aria-selected={activePack === item.name}
                aria-controls={`handover-pack-${item.name.replaceAll(" ", "-").replaceAll("/", "-").toLowerCase()}`}
                data-active={activePack === item.name}
                onClick={() => setActivePack(item.name)}
              >
                {item.name}
              </button>
            ))}
          </div>
          <div className={styles.packDetails}>
            {handoverPacks.map((item) => (
              <article
                key={`pack-${item.name}`}
                id={`handover-pack-${item.name.replaceAll(" ", "-").replaceAll("/", "-").toLowerCase()}`}
                role="tabpanel"
                tabIndex={0}
                className={styles.packDetail}
                hidden={activePack !== item.name}
              >
                <div className={styles.packHero}>
                  <div>
                    <p className={styles.eyebrow}>Selected closeout pack</p>
                    <h3>{item.name}</h3>
                    <p>{item.value}</p>
                  </div>
                  <StatusPill value={item.gate} />
                </div>
                <dl>
                  <div><dt>what is inside</dt><dd>{item.inside}</dd></div>
                  <div><dt>format</dt><dd>{item.format}</dd></div>
                  <div><dt>recipient</dt><dd>{item.recipient}</dd></div>
                  <div><dt>linked release gates</dt><dd>{getHandoverGateLinks(item).map((gate) => gate[0]).join(", ") || item.gate}</dd></div>
                  <div><dt>vault evidence</dt><dd>{uniqueList(getHandoverVaultLinks(item).map((doc) => doc[1])).join(", ") || item.evidence}</dd></div>
                  <div><dt>risk response link</dt><dd>{uniqueList(getHandoverRiskLinks(item).map((risk) => risk.title)).join(", ") || "open issues register"}</dd></div>
                  <div><dt>route/data-flow point</dt><dd>{uniqueList(getHandoverRouteLinks(item).map((point) => point.title)).join(", ") || "Handover Room"}</dd></div>
                  <div><dt>review signal</dt><dd>{item.acceptance}</dd></div>
                  <div><dt>handover link</dt><dd>{item.paymentLink}</dd></div>
                  <div><dt>evidence register</dt><dd>{item.evidence}</dd></div>
                  <div><dt>reusable value</dt><dd>{item.reusable}</dd></div>
                  <div><dt>UPGRADE boundary</dt><dd>{getHandoverOwnerCue(item)}</dd></div>
                </dl>
              </article>
            ))}
          </div>
          <div className={styles.closeoutMatrix} role="table" aria-label="Closeout deliverables matrix">
            <div role="row" className={styles.closeoutHeader}>
              <span role="columnheader">Pack</span>
              <span role="columnheader">Recipient</span>
              <span role="columnheader">Gate</span>
              <span role="columnheader">Review signal</span>
            </div>
            {handoverPacks.map((item) => (
              <div key={`closeout-${item.name}`} role="row" className={styles.closeoutRow}>
                <strong role="cell" data-label="Pack">{item.name}</strong>
                <span role="cell" data-label="Recipient">{item.recipient}</span>
                <span role="cell" data-label="Gate">{item.gate}</span>
                <em role="cell" data-label="Review signal">{item.acceptance}</em>
              </div>
            ))}
          </div>
        </details>
        <p className={styles.handoverSummary}>Active closeout focus: {handoverPack.name} → {handoverPack.acceptance}. UPGRADE передает структурированный пакет; профильные участники проверяют и утверждают решения в своей зоне ответственности.</p>
      </section>

      <section className={sectionClass(styles.commercialTerms, "acceptance")} id="commercial-terms" data-section="commercial-terms" aria-labelledby="commercial-terms-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Commercial separation</p>
          <h2 id="commercial-terms-title">Коммерческие условия</h2>
          <p>Финансовая часть вынесена отдельно, чтобы основной экран оставался технической панелью управления проектом.</p>
        </div>
        <div className={styles.commercialDisclosure} data-open={commercialOpen}>
          <button
            type="button"
            className={styles.commercialToggle}
            aria-expanded={commercialOpen}
            aria-controls="commercial-terms-panel"
            onClick={() => {
              const next = !commercialOpen;
              setCommercialOpen(next);
              setCommercialStatus(next ? "Коммерческие условия раскрыты" : "Коммерческий контур закрыт; основной экран остается техническим");
            }}
          >
            <span>Коммерческие условия</span>
            <strong>Показать оплату и стоимость</strong>
            <small>Финансовая часть раскрывается здесь; основной экран остается техническим.</small>
          </button>
          {commercialOpen ? (
          <div id="commercial-terms-panel" className={styles.commercialPanel}>
            <div className={styles.commercialIntro}>
              <p>Коммерческие условия не меняют технические границы роли UPGRADE: UPGRADE оказывает IT/data и закупочно-координационное сопровождение, не является поставщиком, проектировщиком, монтажной организацией, брокером, перевозчиком или технадзором.</p>
              <p className={styles.commercialStatus} aria-live="polite">{commercialStatus}</p>
            </div>
            <div className={styles.commercialBasisBoard} aria-label="Service fee basis">
              <div>
                <p className={styles.eyebrow}>service fee basis</p>
                <h3>5% supplier search + 5% переговоры = 10% UPGRADE services</h3>
                <p>База расчета отделена от логистики и внешних расходов: UPGRADE не исполняет перевозку, брокерские процедуры, таможенные платежи, монтажные работы или ПНР.</p>
              </div>
              <div className={styles.commercialBasisGrid}>
                {commercialBasisRows.map(([title, detail, boundary]) => (
                  <section key={title}>
                    <strong>{title}</strong>
                    <p>{detail}</p>
                    <small>{boundary}</small>
                  </section>
                ))}
              </div>
            </div>
            <div className={styles.commercialEvidenceDesk} aria-label="Доказательная база коммерческих условий">
              <article className={styles.commercialRateCard}>
                <p className={styles.eyebrow}>transparent rate card</p>
                <h3>10% только за услуги UPGRADE</h3>
                <p>Ставка считается от equipment order, а не от всего бюджета проекта. Логистика, брокер, доставка, пошлины, НДС, монтаж и ПНР не входят в базу, потому что UPGRADE ими не занимается и не должен зарабатывать на чужой зоне ответственности.</p>
                <dl>
                  <div><dt>5%</dt><dd>поиск поставщика, shortlist, supplier profile, evidence request</dd></div>
                  <div><dt>5%</dt><dd>переговоры по цене, технические вопросы, PI / GA / договорные вводные</dd></div>
                  <div><dt>market</dt><dd>рыночный ориентир по sourcing/procurement coordination обычно выше 10%; здесь ставка раскрыта, ограничена 10% и относится только к услугам UPGRADE</dd></div>
                </dl>
              </article>
              <div className={styles.commercialEvidenceGrid}>
                {commercialEvidenceRows.map(([stage, artifact, work, customerValue]) => (
                  <section key={stage}>
                    <span>{stage}</span>
                    <strong>{artifact}</strong>
                    <p>{work}</p>
                    <small>{customerValue}</small>
                  </section>
                ))}
              </div>
            </div>
          <div className={styles.acceptanceGrid}>
            <article className={styles.decisionCard}>
              <strong>3 000 000 ₸ без НДС</strong>
              <span>единый комплекс</span>
              <div className={styles.paymentSwitch} role="group" aria-label="payment mode">
                <button type="button" aria-pressed={paymentMode === "split"} onClick={() => setPaymentMode("split")}>50/50</button>
                <button type="button" aria-pressed={paymentMode === "full"} onClick={() => setPaymentMode("full")}>100%</button>
              </div>
              <p>{paymentMode === "split" ? "1 500 000 ₸ при запуске / 1 500 000 ₸ после передачи структурированного пакета." : "3 000 000 ₸ единым платежом при согласовании."}</p>
              <dl className={styles.paymentValueList}>
                <div><dt>формат</dt><dd>единый комплекс IT/data и закупочно-координационного сопровождения</dd></div>
                <div><dt>база расчета</dt><dd>10% от стоимости заказа оборудования без логистики, брокера, пошлин, НДС, доставки, монтажа и ПНР</dd></div>
                <div><dt>acceptance basis</dt><dd>data-room index, risk register, release gate board, handover packs, digital supplier/product card</dd></div>
              </dl>
            </article>
            <article className={styles.commercialFeeBasis}>
              <h3>из чего складываются 10%</h3>
              <p>UPGRADE показывает ставку открыто: это не логистическая комиссия, не стоимость оборудования и не скрытая маржа в перевозке. Логистика, брокер, доставка и таможенные платежи не включаются в базу, потому что их исполняют и оценивают профильные стороны. Заказчик получает понятную калькуляцию: 5% за поиск поставщика и 5% за переговорный / техническо-договорный контур.</p>
              <div className={styles.commercialFeeGrid} aria-label="Commercial fee calculation">
                {commercialFeeRows.map(([percent, title, detail, basis]) => (
                  <section key={title}>
                    <span>{percent}</span>
                    <strong>{title}</strong>
                    <p>{detail}</p>
                    <small>{basis}</small>
                  </section>
                ))}
              </div>
              <div className={styles.commercialFeeProof} aria-label="Commercial evidence base">
                <strong>Доказательная база для заказчика</strong>
                <div>
                  {commercialProofRows.map(([label, source, proof]) => (
                    <section key={label}>
                      <span>{label}</span>
                      <p>{source}</p>
                      <small>{proof}</small>
                    </section>
                  ))}
                </div>
              </div>
            </article>
            <article>
              <h3>что считается результатом</h3>
              <ul>{["data-room index", "risk register", "release gate board", "handover packs", "digital supplier/product card", "copy-ready commercial summary"].map((item) => <li key={item}>{item}</li>)}</ul>
              <div className={styles.acceptanceGuardrails} aria-label="Acceptance guardrails">
                {acceptanceGuardrails.map(([title, detail, proof]) => (
                  <section key={title}>
                    <strong>{title}</strong>
                    <p>{detail}</p>
                    <small>{proof}</small>
                  </section>
                ))}
              </div>
              <div className={styles.acceptanceLink}>
                <strong>Что не входит</strong>
                <span>оборудование, доставка, брокер, пошлины, НДС, сертификация, проектирование, монтажные работы, ПНР, технадзор</span>
                <small>{handoverPack.paymentLink}</small>
              </div>
            </article>
          </div>

          <div className={styles.copyCommandStrip} aria-label="Commercial copy summary">
            {[
              ["кратко", "Короткое коммерческое сообщение", "Единый комплекс UPGRADE отделен от стоимости оборудования, логистики, брокера, монтажа и иных внешних затрат."],
              ["развернуто", "Расширенное коммерческое сообщение", "Коммерческое сообщение раскрывает 5% supplier search + 5% переговоры/техвопросы/договор, порядок оплаты, acceptance basis и boundary без смешения с техническим cockpit."],
              ["граница", "Граница ответственности", "UPGRADE структурирует данные и статусы; профильные участники утверждают технические, таможенные, логистические и монтажные решения."],
              ["условия", "Условия оплаты", "50/50 или 100% по согласованию, с приемкой результата по переданным deliverables."],
            ].map(([label, title, text]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{title}</strong>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <details className={styles.copyActionDisclosure} open={copyActionsOpen} onToggle={(event) => setCopyActionsOpen(event.currentTarget.open)}>
            <summary>
              <span>Сообщения для отправки</span>
              <strong>{copyVariantTitles[copyVariant]}</strong>
              <small>{copyStatus}</small>
            </summary>
            {copyActionsOpen ? (
              <div className={styles.copyButtons}>
                {[
                  ["payment", "Скопировать коммерческое сообщение"],
                  ["executive", "Скопировать расширенное сообщение"],
                  ["boundary", "Скопировать границу ответственности"],
                  ["next", "Скопировать условия оплаты"],
                ].map(([variant, label]) => <button key={variant} type="button" data-active={copyVariant === variant} onClick={() => copyCommercialMessage(variant as CopyVariant)}>{label}</button>)}
              </div>
            ) : null}
          </details>
          <article className={styles.copyPreview} aria-label="Selected commercial copy preview">
            <div>
              <p className={styles.eyebrow}>Выбранное сообщение</p>
              <h3>{copyVariantTitles[copyVariant]}</h3>
            </div>
            <p>{copyTexts[copyVariant]}</p>
          </article>
          <textarea ref={copyRef} className={styles.copySource} value={copyTexts[copyVariant]} readOnly hidden />
          <p aria-live="polite" data-copy-status>{copyStatus}</p>
          <p className={styles.legalNote}>UPGRADE — IT/data и закупочно-координационный партнер. UPGRADE не является поставщиком оборудования; не является производителем; не является проектировщиком; не является монтажной организацией; не является ПНР-подрядчиком; не является техническим надзором; не является брокером; не является перевозчиком; не является сертификационным органом и не является юридическим консультантом.</p>
          <p className={styles.pathNote}>Canonical: {proposalPath}</p>
          </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
