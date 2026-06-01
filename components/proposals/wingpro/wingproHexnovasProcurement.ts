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
  },
  {
    title: "TH150B-381H option / 304",
    source: "11_Email_Hexnovas_TH150B_304_price.png",
    status: "approval-required",
    note: "Эконом-вариант требует письменного согласия на AISI 304.",
  },
  {
    title: "BH150B-307H PN16 selection",
    source: "02_BH150B-307H_PN16_316L_selection_high_pressure_drop.rtf",
    status: "archive",
    note: "Оставить как risk evidence по high pressure drop, не как финальную рекомендацию.",
  },
  {
    title: "Supplier returned contract",
    source: "01_Supplier_Returned_Contract_BH150B_PN16_2units_EN.pdf",
    status: "update-required",
    note: "Если выбран TH150B, договор/PI должны быть обновлены.",
  },
  {
    title: "CE/PED + ISO + Business Registration",
    source: "HEXNOVAS certificates",
    status: "ready",
    note: "Supplier identity и compliance evidence для Document Vault.",
  },
];
