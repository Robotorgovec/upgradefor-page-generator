export type HexnovasVariantStatus =
  | "recommended_technical_option"
  | "economy_option_requires_buyer_approval"
  | "not_recommended_without_hydraulic_approval";

export type HexnovasVariantId =
  | "TH150B_381H_PN16_316L_low_dp"
  | "TH150B_381H_PN16_304_low_dp"
  | "BH150B_307H_PN16_316L_high_dp";

export type HexnovasVariant = {
  id: HexnovasVariantId;
  name: string;
  shortName: string;
  status: HexnovasVariantStatus;
  statusLabel: string;
  statusTone: "good" | "warning" | "danger";
  quantity: number;
  unitPriceUsd: number;
  totalPriceUsd: number;
  material: string;
  heatDutyKwPerUnit: number;
  pressureDropKpaHot: number;
  pressureDropKpaCold: number;
  connections: string;
  designPressureBar: number;
  productionTimeDaysAfterAdvance: number;
  plates?: number;
  areaM2?: number;
  decisionAlert: string;
  action: string;
  comment: string;
};

export type HexnovasTimelineItem = {
  id: string;
  label: string;
  title: string;
  result: string;
};

export type HexnovasRiskControl = {
  title: string;
  risk: string;
  control: string;
  owner: string;
};

export type HexnovasDocumentSignal = {
  title: string;
  source: string;
  status: "ready" | "update-required" | "approval-required" | "archive";
  note: string;
  href?: string;
  downloadName?: string;
  fileType: "PDF" | "RTF" | "XLSX" | "PNG";
  sizeLabel: string;
  checksumSha256: string;
  vaultUse: string;
  previewable: boolean;
};

export type HexnovasVaultTraceRow = {
  source: string;
  evidenceSignalTitles: string[];
  dataRoomRole: string;
  releaseGate: string;
  owner: string;
  action: string;
  approvalBoundary: string;
};

export const HEXNOVAS_RECOMMENDED_VARIANT_ID: HexnovasVariantId = "TH150B_381H_PN16_316L_low_dp";

export const hexnovasProject = {
  buyer: "LLP WinGPro",
  supplier: "Hexnovas Heat Exchanger Technology Co., Ltd",
  project: "FOK / реабилитационно-диагностический центр с гостиницей, Астана",
  referenceHeatDutyKw: 1194.38,
  mediums: "Water 12/7°C and 40% ethylene glycol 5/10°C",
  pressureClass: "DN150 PN16",
  materialReference: "AISI 316L, 0.50 mm, EPDM HT",
  pressureDropTarget: "до 30 kPa / 0.30 bar на сторону",
  logisticsReserveUsdForTwoUnits: 9000,
  currentDecision:
    "WinGPro выбирает между технически рекомендуемым TH150B / 316L и эконом-вариантом TH150B / 304; BH150B дешевле, но требует отдельного гидравлического подтверждения.",
} as const;

export const hexnovasVariants: HexnovasVariant[] = [
  {
    id: "TH150B_381H_PN16_316L_low_dp",
    name: "TH150B-381H PN16 / AISI 316L",
    shortName: "TH150B / 316L",
    status: "recommended_technical_option",
    statusLabel: "рекомендуемый технический вариант",
    statusTone: "good",
    quantity: 2,
    unitPriceUsd: 15560,
    totalPriceUsd: 31120,
    material: "AISI 316L, 0.50 mm",
    heatDutyKwPerUnit: 1195,
    pressureDropKpaHot: 24.0,
    pressureDropKpaCold: 29.9,
    connections: "DN150 PN16",
    designPressureBar: 16,
    productionTimeDaysAfterAdvance: 21,
    plates: 381,
    areaM2: 253,
    decisionAlert:
      "Если выбран TH150B-381H, текущий договор и PI по BH150B-307H нужно обновить под новую модель, цену и материал до запуска следующего release gate.",
    action: "Запросить обновленный PI, чертеж и договор под TH150B-381H / 316L.",
    comment:
      "Лучшее техническое совпадение: низкий перепад давления в целевом диапазоне и материал соответствует референсу ARES 316L.",
  },
  {
    id: "TH150B_381H_PN16_304_low_dp",
    name: "TH150B-381H PN16 / AISI 304",
    shortName: "TH150B / 304",
    status: "economy_option_requires_buyer_approval",
    statusLabel: "эконом-вариант с письменным согласием",
    statusTone: "warning",
    quantity: 2,
    unitPriceUsd: 14184,
    totalPriceUsd: 28368,
    material: "AISI 304, 0.50 mm",
    heatDutyKwPerUnit: 1195,
    pressureDropKpaHot: 24.0,
    pressureDropKpaCold: 29.9,
    connections: "DN150 PN16",
    designPressureBar: 16,
    productionTimeDaysAfterAdvance: 21,
    plates: 381,
    areaM2: 253,
    decisionAlert:
      "AISI 304 дешевле, но отличается от исходного референса 316L; нужна письменная позиция WinGPro / проектного специалиста по допустимости замены материала.",
    action: "Получить письменное согласование материала AISI 304 до изменения PI/договора.",
    comment:
      "Сохраняет низкий перепад давления TH150B, экономит 2 752 USD против TH150B / 316L, но меняет материал теплообменных пластин.",
  },
  {
    id: "BH150B_307H_PN16_316L_high_dp",
    name: "BH150B-307H PN16 / AISI 316L",
    shortName: "BH150B / 316L",
    status: "not_recommended_without_hydraulic_approval",
    statusLabel: "не рекомендован без гидравлического подтверждения",
    statusTone: "danger",
    quantity: 2,
    unitPriceUsd: 12880,
    totalPriceUsd: 25760,
    material: "AISI 316L, 0.50 mm",
    heatDutyKwPerUnit: 1195,
    pressureDropKpaHot: 63.3,
    pressureDropKpaCold: 99.4,
    connections: "DN150 PN16",
    designPressureBar: 16,
    productionTimeDaysAfterAdvance: 21,
    decisionAlert:
      "BH150B дешевле, но перепад давления выше целевого диапазона; применять только после гидравлического подтверждения насосов/проекта ответственными специалистами.",
    action: "Не выпускать как финальную рекомендацию без письменного hydraulic approval.",
    comment:
      "Низкая цена не компенсирует риск по перепаду давления: 63.3 / 99.4 kPa против ориентира до 30 kPa на сторону.",
  },
];

export const hexnovasTimeline: HexnovasTimelineItem[] = [
  {
    id: "initial-offer",
    label: "01",
    title: "Первичное предложение",
    result: "BB/BH150B появился как стартовая линия поставщика; потребовалась сверка PN и модели.",
  },
  {
    id: "pn16-confirmed",
    label: "02",
    title: "PN16 подтвержден",
    result: "Поставка переводится в DN150 PN16 как требуемый класс давления.",
  },
  {
    id: "high-dp-found",
    label: "03",
    title: "Выявлен высокий перепад",
    result: "BH150B-307H показывает 63.3 / 99.4 kPa и не проходит как спокойный технический выбор.",
  },
  {
    id: "th150-solution",
    label: "04",
    title: "Получен TH150B low pressure drop",
    result: "TH150B-381H дает 24.0 / 29.9 kPa и становится рекомендуемым техническим маршрутом.",
  },
  {
    id: "material-choice",
    label: "05",
    title: "Открыт выбор 316L / 304",
    result: "316L совпадает с референсом; 304 требует отдельного согласования материала.",
  },
];

export const hexnovasRiskControls: HexnovasRiskControl[] = [
  {
    title: "Pressure drop",
    risk: "BH150B дешевле, но превышает целевой перепад давления.",
    control: "Финальный выбор через TH150B или письменное hydraulic approval для BH150B.",
    owner: "WinGPro technical owner / проектировщик",
  },
  {
    title: "Material 304 vs 316L",
    risk: "304 меняет исходный материал пластин относительно ARES 316L.",
    control: "Письменное согласование замены материала до PI/contract update.",
    owner: "WinGPro / проектный специалист",
  },
  {
    title: "PI consistency",
    risk: "Текущий PI/договор может оставаться на BH150B при выборе TH150B.",
    control: "Обновить модель, материал, цену, чертеж и комплект приложений перед release.",
    owner: "Supplier / WinGPro",
  },
  {
    title: "Supplier evidence",
    risk: "Сертификаты, drawing, packing и тестовые данные должны лечь в data-room до handover.",
    control: "Вести Document Vault: CE/PED, ISO, BR, PI, drawing, selection sheets, pre-shipment evidence.",
    owner: "UPGRADE data coordinator / supplier",
  },
];

export const hexnovasDocumentSignals: HexnovasDocumentSignal[] = [
  {
    title: "TH150B-381H selection / 316L",
    source: "01_TH150B-381H_low_pressure_drop_316L_selection_2026-05-29.rtf",
    status: "ready",
    note: "Ключевая technical selection: 381 plates, 24.0 / 29.9 kPa, 316L.",
    href: "/assets/proposals/wingpro/hexnovas-evidence/hexnovas-th150b-381h-pn16-316l-selection-20260529.rtf",
    downloadName: "WinGPro_Hexnovas_TH150B-381H_PN16_316L_selection_20260529.rtf",
    fileType: "RTF",
    sizeLabel: "92 KB",
    checksumSha256: "14d0535711d183ecfc19c36541d6eac0c8de67063aba02cdbdc01539926a8445",
    vaultUse: "recommended selection evidence",
    previewable: false,
  },
  {
    title: "TH150B-381H option / 304",
    source: "10_HEXNOVAS_PI_initial_304_option.xlsx",
    status: "approval-required",
    note: "Эконом-вариант требует письменного согласия на AISI 304 перед обновлением PI/договора.",
    href: "/assets/proposals/wingpro/hexnovas-evidence/hexnovas-pi-initial-304-option.xlsx",
    downloadName: "WinGPro_Hexnovas_TH150B-381H_304_PI_initial_option_20260524.xlsx",
    fileType: "XLSX",
    sizeLabel: "21 KB",
    checksumSha256: "1fa8f67c5104ee31feeab298054683c89e7f775c44e38fc71040d821aff80d97",
    vaultUse: "304 commercial option evidence",
    previewable: false,
  },
  {
    title: "BH150B-307H PN16 selection",
    source: "02_BH150B-307H_PN16_316L_selection_high_pressure_drop.rtf",
    status: "archive",
    note: "Оставить как risk evidence по high pressure drop, не как финальную рекомендацию.",
    href: "/assets/proposals/wingpro/hexnovas-evidence/hexnovas-bh150b-307h-pn16-316l-selection-high-dp.rtf",
    downloadName: "WinGPro_Hexnovas_BH150B-307H_PN16_316L_selection_high_dp.rtf",
    fileType: "RTF",
    sizeLabel: "89 KB",
    checksumSha256: "b0f24237a685157ccb4d3b83249a545db93c195ce8f421403e68b48a3e6ea2e5",
    vaultUse: "hydraulic risk evidence",
    previewable: false,
  },
  {
    title: "BH150B-307H PN16 drawing",
    source: "03_BH150B-307H_PN16_drawing.pdf",
    status: "update-required",
    note: "Чертеж относится к BH150B; при выборе TH150B нужен обновленный GA/drawing от поставщика.",
    href: "/assets/proposals/wingpro/hexnovas-evidence/hexnovas-bh150b-307h-pn16-drawing.pdf",
    downloadName: "WinGPro_Hexnovas_BH150B-307H_PN16_drawing.pdf",
    fileType: "PDF",
    sizeLabel: "161 KB",
    checksumSha256: "fc5d7be14d95d01cf9da372d1fce44d58ad59d860940ea279f01ae162517db70",
    vaultUse: "drawing update trigger",
    previewable: true,
  },
  {
    title: "Latest supplier PI",
    source: "09_HEXNOVAS_PI_latest_20260524.xlsx",
    status: "update-required",
    note: "Если WinGPro выбирает TH150B, PI должен быть свернут под новую модель, цену и материал.",
    href: "/assets/proposals/wingpro/hexnovas-evidence/hexnovas-pi-latest-20260524.xlsx",
    downloadName: "WinGPro_Hexnovas_PI_latest_20260524.xlsx",
    fileType: "XLSX",
    sizeLabel: "21 KB",
    checksumSha256: "ee907eef59038544706945632a035ee5f079f53c427b2930258a1cbbf4f5b1d1",
    vaultUse: "PI consistency check",
    previewable: false,
  },
  {
    title: "CE/PED certificate",
    source: "06_HEXNOVAS_CE_PED_certificate.pdf",
    status: "ready",
    note: "Compliance evidence для Document Vault; не заменяет сертификационную проверку ответственными участниками.",
    href: "/assets/proposals/wingpro/hexnovas-evidence/hexnovas-ce-ped-certificate.pdf",
    downloadName: "WinGPro_Hexnovas_CE_PED_certificate.pdf",
    fileType: "PDF",
    sizeLabel: "1.1 MB",
    checksumSha256: "d3b7d360e597445f9c53efdf1b202e8381ac36a3fd14b5976287db12232b3053",
    vaultUse: "supplier compliance evidence",
    previewable: true,
  },
  {
    title: "ISO 9001 certificate",
    source: "07_HEXNOVAS_ISO_9001_certificate.pdf",
    status: "ready",
    note: "Quality system evidence для supplier identity pack.",
    href: "/assets/proposals/wingpro/hexnovas-evidence/hexnovas-iso-9001-certificate.pdf",
    downloadName: "WinGPro_Hexnovas_ISO_9001_certificate.pdf",
    fileType: "PDF",
    sizeLabel: "2.8 MB",
    checksumSha256: "dbc76f4c149d48598241c7ebd0706ab23dfff3ab584031d1199c35693baa9468",
    vaultUse: "supplier identity evidence",
    previewable: true,
  },
  {
    title: "Business Registration HK",
    source: "08_HEXNOVAS_Business_Registration_HK.pdf",
    status: "ready",
    note: "Supplier legal identity evidence для data-room и counterparty check.",
    href: "/assets/proposals/wingpro/hexnovas-evidence/hexnovas-business-registration-hk.pdf",
    downloadName: "WinGPro_Hexnovas_Business_Registration_HK.pdf",
    fileType: "PDF",
    sizeLabel: "1.8 MB",
    checksumSha256: "84d13d1bd1c516b9cda722c5943114722cdf0e1fb804ec1884a8ccddf165c4f2",
    vaultUse: "counterparty identity evidence",
    previewable: true,
  },
  {
    title: "Executive procurement report",
    source: "Procurement_Report_Hexnovas_WinGPro_EXECUTIVE_RU.pdf",
    status: "ready",
    note: "Короткий отчет по выбору варианта; используется как executive summary, не как проектное утверждение.",
    href: "/assets/proposals/wingpro/hexnovas-evidence/hexnovas-wingpro-procurement-executive-report-ru.pdf",
    downloadName: "WinGPro_Hexnovas_Procurement_Report_EXECUTIVE_RU.pdf",
    fileType: "PDF",
    sizeLabel: "82 KB",
    checksumSha256: "a86f72fc43bf9f652fa231b18062cb54674db8685df24ead803cf46fcb871307",
    vaultUse: "executive decision summary",
    previewable: true,
  },
];

export const hexnovasVaultTraceRows: HexnovasVaultTraceRow[] = [
  {
    source: "TH150B-381H / 316L selection",
    evidenceSignalTitles: ["TH150B-381H selection / 316L"],
    dataRoomRole: "recommended selection evidence",
    releaseGate: "Gate 1 — Evidence readiness",
    owner: "WinGPro technical owner / supplier",
    action: "Принять как базовую техническую линию и запросить обновленные PI, GA drawing и договор под TH150B-381H / 316L.",
    approvalBoundary: "WinGPro и профильный технический специалист подтверждают финальный выбор.",
  },
  {
    source: "TH150B-381H / 304 option",
    evidenceSignalTitles: ["TH150B-381H option / 304"],
    dataRoomRole: "material substitution evidence",
    releaseGate: "Gate 1 — Owner decision",
    owner: "WinGPro technical owner",
    action: "Оставить как эконом-вариант; не выпускать дальше без письменного согласования замены материала 316L → 304.",
    approvalBoundary: "UPGRADE фиксирует decision gap, но не утверждает замену материала.",
  },
  {
    source: "BH150B-307H / 316L selection",
    evidenceSignalTitles: ["BH150B-307H PN16 selection"],
    dataRoomRole: "hydraulic risk evidence",
    releaseGate: "Risk Radar / Gate 1",
    owner: "project designer / WinGPro technical owner",
    action: "Хранить как risk evidence по high pressure drop; не использовать как рекомендацию без hydraulic approval.",
    approvalBoundary: "Гидравлическое подтверждение остается у ответственных проектных/технических участников.",
  },
  {
    source: "BH150B-307H drawing",
    evidenceSignalTitles: ["BH150B-307H PN16 drawing"],
    dataRoomRole: "drawing update trigger",
    releaseGate: "Gate 2 — Contract / document package",
    owner: "supplier",
    action: "Показать, что существующий чертеж относится к BH150B; при выборе TH150B запросить новый GA drawing.",
    approvalBoundary: "Поставщик готовит чертеж, WinGPro и профильные участники проверяют применимость.",
  },
  {
    source: "CE/PED + ISO + Business Registration",
    evidenceSignalTitles: ["CE/PED certificate", "ISO 9001 certificate", "Business Registration HK"],
    dataRoomRole: "supplier compliance / identity evidence",
    releaseGate: "Document Vault / Counterparty check",
    owner: "WinGPro / supplier",
    action: "Сложить в supplier evidence pack и отметить, что документы требуют проверки профильными участниками до release.",
    approvalBoundary: "UPGRADE не является сертификационным органом и не проводит юридическую экспертизу.",
  },
  {
    source: "Latest PI",
    evidenceSignalTitles: ["Latest supplier PI"],
    dataRoomRole: "PI consistency check",
    releaseGate: "Contract pack",
    owner: "supplier / WinGPro",
    action: "Если выбран TH150B, обновить модель, материал, цену, комплект приложений и привязать PI к выбранному варианту.",
    approvalBoundary: "Коммерческое и договорное решение принимает WinGPro.",
  },
  {
    source: "Executive procurement report",
    evidenceSignalTitles: ["Executive procurement report"],
    dataRoomRole: "decision summary",
    releaseGate: "Handover / executive review",
    owner: "UPGRADE data coordinator / WinGPro",
    action: "Использовать как короткую карту решения: recommended / economy / hydraulic-risk route.",
    approvalBoundary: "Отчет структурирует данные и вопросы, но не заменяет проектное или техническое утверждение.",
  },
];
