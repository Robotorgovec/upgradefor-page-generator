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
    text: "Источник для понимания узла управления холодоснабжением и требований к арматуре, измерительным приборам и насосной группе в рамках data-room.",
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
    sourceFile: "Планы ХС",
    relevantData: "location / mounting context",
    upgradeAction: "mounting coordination questions",
    ownerForApproval: "mounting contractor / UPGRADE data coordinator",
  },
];
