export type SourceDocument = {
  id: string;
  title: string;
  sourceName: string;
  href: string;
  downloadName: string;
  type: string;
  object: string;
  pagesLabel?: string;
  sizeLabel: string;
  checksumSha256: string;
  relevantTo: string[];
  notFor: string[];
  equipmentModel?: string;
  quantityLabel?: string;
  procurementStatus?: string;
  assignment?: string;
  confirmationOwner?: string;
  technicalFacts?: string[];
};

export type SourceDocumentInsight = {
  title: string;
  text: string;
};

export type SourceTraceabilityRow = {
  sourceFile: string;
  relevantData: string;
  upgradeAction: string;
  ownerForApproval: string;
};

export type PurchasedPumpAssignment = {
  model: string;
  quantity: string;
  role: string;
  hydraulicLogic: string;
  documentId: string;
  confirmation: string;
};

export type PurchasedPumpEvidenceRequest = {
  title: string;
  status: "ready" | "requested" | "missing";
  owner: string;
  action: string;
  why: string;
};

export const sourceDocuments: SourceDocument[] = [
  {
    id: "hs-working-project",
    title: "Рабочий проект ХС — холодоснабжение, блоки 1–4",
    sourceName: "ХС 23.02.26.pdf",
    href: "/assets/proposals/wingpro/source-documents/wingpro-fok-hs-working-project-cold-supply-blocks-1-4-2026.pdf",
    downloadName: "WinGPro_FOK_HS_Rabochiy_proekt_holodosnabzhenie_bloki_1-4_2026.pdf",
    type: "Рабочий проект / Холодоснабжение",
    object: "ФОК / Реабилитационно-диагностический центр с гостиницей, г. Астана",
    pagesLabel: "33 pages",
    sizeLabel: "18.2 MB",
    checksumSha256: "05d410b9021bc287c31d8b8784845c9c814c3b2f8bfbebc77579a32b6e62c1e1",
    relevantTo: [
      "source data room",
      "cold supply schemes",
      "individual refrigeration center",
      "coolant temperatures",
      "specifications and handoff checks",
    ],
    notFor: [
      "утверждение проектных решений UPGRADE",
      "полный аудит всего объекта ФОК",
      "технадзор или приемка монтажных работ",
    ],
  },
  {
    id: "hs-source-plans",
    title: "Исходные планы ХС — ФОК, кондиционирование и холодоснабжение",
    sourceName: "ХС-02.26 ФОК.pdf",
    href: "/assets/proposals/wingpro/source-documents/wingpro-fok-hs-source-plans-conditioning-2026.pdf",
    downloadName: "WinGPro_FOK_HS_Iskhodnye_plany_kondicionirovanie_holodosnabzhenie_2026.pdf",
    type: "Рабочий проект / Исходные планы ХС",
    object: "Физкультурно-оздоровительный комплекс, г. Астана",
    pagesLabel: "source plans",
    sizeLabel: "4.3 MB",
    checksumSha256: "6faab96f71129e31b1f1d7e418b1daa0a821426d3b976d1b2824afbe77c43489",
    relevantTo: [
      "project context",
      "conditioning/cold supply zones",
      "source plans",
      "mounting input context",
    ],
    notFor: [
      "расширение scope до всего объекта",
      "замена проектной документации",
      "самостоятельное утверждение технических решений",
    ],
  },
  {
    id: "pedrollo-f100-200c-pump",
    title: "Pedrollo F100/200C — закупленный насос, паспорт",
    sourceName: "pedrollo_f100200c.pdf",
    href: "/assets/proposals/wingpro/source-documents/wingpro-pedrollo-f100-200c-purchased-pump-datasheet-2026.pdf",
    downloadName: "WinGPro_FOK_Pedrollo_F100-200C_Purchased_Pump_Datasheet_RU_2026.pdf",
    type: "Паспорт оборудования / Центробежный насос",
    object: "Насосный контур ХС / индивидуальный холодильный центр",
    pagesLabel: "5 pages",
    sizeLabel: "1.9 MB",
    checksumSha256: "913155b797cb17cb907e80c1cf8fa892f80f1cd5c9b12fc1ce9b90c055b237f9",
    equipmentModel: "Pedrollo F100/200C",
    quantityLabel: "2 шт. в закупочном контуре",
    procurementStatus: "уже закуплено / сверить серийники и накладные",
    assignment: "логически относится к более крупному насосному плечу ХС: DN125 suction, DN100 discharge, 30 kW, nominal 240 m3/h; финальное место подтверждает ответственный технический специалист",
    confirmationOwner: "WinGPro technical owner / монтажная сторона",
    technicalFacts: [
      "30 kW, 380 V, 53 A",
      "nominal 240 m3/h",
      "head range 28-51 m",
      "DN125 suction / DN100 discharge",
      "water, max liquid +90°C",
    ],
    relevantTo: [
      "already purchased pump evidence",
      "individual refrigeration center",
      "large flow pump branch",
      "mounting inputs and flange checks",
      "handover serial/nameplate request",
    ],
    notFor: [
      "самостоятельная замена проектного подбора UPGRADE",
      "подтверждение гидравлики без профильного расчета",
      "приемка закупки без накладных, шильдиков и серийных номеров",
    ],
  },
  {
    id: "pedrollo-f80-160c-pump",
    title: "Pedrollo F80/160C — закупленный насос, паспорт",
    sourceName: "Pedrollo F80 160C.pdf",
    href: "/assets/proposals/wingpro/source-documents/wingpro-pedrollo-f80-160c-purchased-pump-datasheet-2026.pdf",
    downloadName: "WinGPro_FOK_Pedrollo_F80-160C_Purchased_Pump_Datasheet_RU_2026.pdf",
    type: "Паспорт оборудования / Центробежный насос",
    object: "Насосная / тепловой узел / вторичный насосный контур",
    pagesLabel: "5 pages",
    sizeLabel: "1.3 MB",
    checksumSha256: "398687a54e6eda80336a8c216bd95a0b7acfabf7ecfb283488a9798d8290a2e3",
    equipmentModel: "Pedrollo F80/160C",
    quantityLabel: "2 шт. в закупочном контуре",
    procurementStatus: "уже закуплено / сверить серийники и накладные",
    assignment: "логически относится к меньшему насосному плечу или резервно-вспомогательному контуру: DN100 suction, DN80 discharge, 15 kW, nominal 150 m3/h; финальное место подтверждает ответственный технический специалист",
    confirmationOwner: "WinGPro technical owner / монтажная сторона",
    technicalFacts: [
      "15 kW, 380 V, 29 A",
      "nominal 150 m3/h",
      "requested 184 m3/h, offered 198.13 m3/h at 20.87 m",
      "head range 15-30 m",
      "DN100 suction / DN80 discharge",
      "water, max liquid +90°C",
    ],
    relevantTo: [
      "already purchased pump evidence",
      "secondary pump branch",
      "pump room / heat node context",
      "mounting inputs and flange checks",
      "handover serial/nameplate request",
    ],
    notFor: [
      "самостоятельная замена проектного подбора UPGRADE",
      "подтверждение гидравлики без профильного расчета",
      "приемка закупки без накладных, шильдиков и серийных номеров",
    ],
  },
];

export const purchasedPumpAssignments: PurchasedPumpAssignment[] = [
  {
    model: "Pedrollo F100/200C",
    quantity: "2 шт.",
    role: "основной крупный насосный контур ХС",
    hydraulicLogic: "30 kW, DN125/DN100, nominal 240 m3/h; логично держать рядом с индивидуальным холодильным центром и крупным расходом.",
    documentId: "pedrollo-f100-200c-pump",
    confirmation: "Сверить с исполнительной закупкой, шильдиками, накладными и рабочей гидравликой.",
  },
  {
    model: "Pedrollo F80/160C",
    quantity: "2 шт.",
    role: "меньшее насосное плечо или резервно-вспомогательный контур",
    hydraulicLogic: "15 kW, DN100/DN80, nominal 150 m3/h; логично держать как отдельный насосный пакет для меньшего расхода.",
    documentId: "pedrollo-f80-160c-pump",
    confirmation: "Сверить фактическое место установки с монтажной стороной и ответственным техспециалистом WinGPro.",
  },
];

export const purchasedPumpEvidenceRequests: PurchasedPumpEvidenceRequest[] = [
  {
    title: "Паспорта F100/200C и F80/160C",
    status: "ready",
    owner: "UPGRADE data-room",
    action: "закрепить PDF как ready evidence в Source Data Room",
    why: "паспорта уже доступны для проверки мощности, DN, расхода, напора и габаритов",
  },
  {
    title: "Шильдики и серийные номера 2+2",
    status: "requested",
    owner: "WinGPro / монтажная сторона",
    action: "запросить фото шильдиков каждого насоса и связать с моделью",
    why: "без серийников нельзя уверенно закрыть handover и сверить фактическую поставку",
  },
  {
    title: "Накладные / счет / складской факт",
    status: "missing",
    owner: "WinGPro procurement owner",
    action: "добавить purchase evidence: invoice, waybill или receiving note",
    why: "статус `уже закуплено` должен подтверждаться закупочным документом, а не только паспортом",
  },
  {
    title: "Привязка к контуру и месту установки",
    status: "requested",
    owner: "WinGPro technical owner / mounting contractor",
    action: "подтвердить, какой тип насоса идет в крупное и меньшее насосное плечо",
    why: "логическая раскладка F100/F80 должна быть проверена по фактической гидравлике и монтажному контексту",
  },
  {
    title: "Фланцы, доступ и сервисная зона",
    status: "requested",
    owner: "mounting contractor",
    action: "проверить DN125/DN100 и DN100/DN80, доступ к обслуживанию и место для обвязки",
    why: "это входные данные для coordination draft, а не утверждение монтажного решения UPGRADE",
  },
];

export const sourceDocumentInsights: SourceDocumentInsight[] = [
  {
    title: "Контур холодоснабжения",
    text: "Используется для понимания связей между оборудованием, холодильным центром, потребителями холода и handoff-точками.",
  },
  {
    title: "Температурные режимы",
    text: "В исходных схемах указаны режимы холодоносителя: этиленгликоль 40% 5/10°C и вода холодоносителя 7/12°C. Эти данные нужны как входные параметры для сверки поставки/подбора и вопросов поставщику.",
  },
  {
    title: "Индивидуальный холодильный центр",
    text: "Источник для понимания узла управления холодоснабжением и требований к арматуре, измерительным приборам и насосной группе в рамках data-room. Закупленные Pedrollo F100/200C и F80/160C заведены как отдельный pump evidence layer.",
  },
  {
    title: "Спецификации и handoff",
    text: "Используются для формирования перечня вопросов, открытых данных, документов и монтажных вводных по зоне теплообменников.",
  },
  {
    title: "Монтажные вводные",
    text: "Не как официальный ППР, а как coordination draft: какие данные нужны монтажной стороне, логисту, брокеру и ответственному техническому специалисту.",
  },
];

export const sourceTraceabilityRows: SourceTraceabilityRow[] = [
  {
    sourceFile: "Рабочий проект ХС",
    relevantData: "холодоснабжение / блоки 1–4",
    upgradeAction: "сверка исходных параметров",
    ownerForApproval: "WinGPro technical owner",
  },
  {
    sourceFile: "Схемы холодоснабжения",
    relevantData: "temperature / carrier / flow",
    upgradeAction: "вопросы поставщику",
    ownerForApproval: "supplier / project designer",
  },
  {
    sourceFile: "Индивидуальный холодильный центр",
    relevantData: "equipment interface",
    upgradeAction: "handoff для технического специалиста",
    ownerForApproval: "WinGPro technical owner",
  },
  {
    sourceFile: "Спецификация",
    relevantData: "valves / filters / manometers / pumps",
    upgradeAction: "checklist по документам и комплектации",
    ownerForApproval: "supplier / mounting contractor",
  },
  {
    sourceFile: "Pedrollo pump datasheets",
    relevantData: "F100/200C x2 + F80/160C x2",
    upgradeAction: "связать закупленные насосы с data-room, запросить шильдики/накладные/место установки",
    ownerForApproval: "WinGPro technical owner / mounting contractor",
  },
  {
    sourceFile: "Планы ХС",
    relevantData: "location / mounting context",
    upgradeAction: "mounting coordination questions",
    ownerForApproval: "mounting contractor / UPGRADE data coordinator",
  },
];
