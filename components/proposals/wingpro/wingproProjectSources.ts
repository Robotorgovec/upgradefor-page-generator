export type ProjectSourceDocType =
  | "project-basis"
  | "spec"
  | "datasheet"
  | "ga-drawing"
  | "connection-drawing"
  | "node-scheme"
  | "bom"
  | "certificate"
  | "material-certificate"
  | "proforma"
  | "packing-list"
  | "test-report"
  | "photo"
  | "nameplate-photo"
  | "cad"
  | "contact-card"
  | "warranty"
  | "manual";

export type ProjectSourceGroup = "project-basis" | "supplier-package" | "handover-mounting";

export type ProjectSourceStatus = "ready" | "missing" | "draft";

export type ProjectSourceAsset = {
  id: string;
  group: ProjectSourceGroup;
  projectId: string;
  customer: string;
  equipmentKey: "PlateHE";
  title: string;
  displayLabel: string;
  docType: ProjectSourceDocType;
  supplier?: string;
  documentDate: string;
  language: "RU" | "EN" | "CN";
  version?: string;
  revision?: string;
  bytes?: number;
  checksumSha256?: string;
  mimeType: string;
  assetUrl: string;
  downloadFileName: string;
  originalFileName?: string;
  previewable: boolean;
  required: boolean;
  status: ProjectSourceStatus;
  decisionUse: string;
  tags: string[];
};

export const wingproProjectSources: ProjectSourceAsset[] = [
  {
    id: "project-basis-001",
    group: "project-basis",
    projectId: "2605281047",
    customer: "WingPro",
    equipmentKey: "PlateHE",
    title: "Исходный проект ХС по узлу ПТО",
    displayLabel: "Проектная основа",
    docType: "project-basis",
    documentDate: "2026-02-23",
    language: "RU",
    bytes: 19077473,
    checksumSha256: "05d410b9021bc287c31d8b8784845c9c814c3b2f8bfbebc77579a32b6e62c1e1",
    mimeType: "application/pdf",
    assetUrl: "/proposals/wingpro/sources/2605281047_WingPro_PlateHE_ProjectBasis_RU_20260223.pdf",
    downloadFileName: "2605281047_WingPro_PlateHE_ProjectBasis_RU_20260223.pdf",
    originalFileName: "ХС 23.02.26.pdf",
    previewable: true,
    required: true,
    status: "ready",
    decisionUse: "Широкий альбом ХС, который содержит контекст по узлу пластинчатых теплообменников, подключению и монтажной привязке.",
    tags: ["plate-he", "project-basis", "ru", "node-context"],
  },
  {
    id: "project-plans-001",
    group: "project-basis",
    projectId: "2605281047",
    customer: "WingPro",
    equipmentKey: "PlateHE",
    title: "Плановый комплект по узлу ПТО",
    displayLabel: "Планы и контекст",
    docType: "project-basis",
    documentDate: "2026-02-10",
    language: "RU",
    bytes: 4467523,
    checksumSha256: "6faab96f71129e31b1f1d7e418b1daa0a821426d3b976d1b2824afbe77c43489",
    mimeType: "application/pdf",
    assetUrl: "/proposals/wingpro/sources/2605281047_WingPro_PlateHE_ProjectPlans_RU_20260210.pdf",
    downloadFileName: "2605281047_WingPro_PlateHE_ProjectPlans_RU_20260210.pdf",
    originalFileName: "ХС-02.26 ФОК.pdf",
    previewable: true,
    required: true,
    status: "ready",
    decisionUse: "Плановая проектная основа для проверки размещения, трасс, узла подключения и монтажного контекста ПТО.",
    tags: ["plate-he", "plans", "ru", "mounting-context"],
  },
  {
    id: "supplier-datasheet-001",
    group: "supplier-package",
    projectId: "2605281047",
    customer: "WingPro",
    equipmentKey: "PlateHE",
    title: "Datasheet выбранной модели ПТО",
    displayLabel: "Паспорт / datasheet",
    docType: "datasheet",
    supplier: "Candidate A",
    documentDate: "2026-05-28",
    language: "EN",
    version: "v01",
    mimeType: "application/pdf",
    assetUrl: "/proposals/wingpro/sources/2605281047_WingPro_PlateHE_Datasheet_EN_20260528_v01.pdf",
    downloadFileName: "2605281047_WingPro_PlateHE_Datasheet_EN_20260528_v01.pdf",
    originalFileName: "supplier datasheet pending",
    previewable: true,
    required: true,
    status: "missing",
    decisionUse: "Обязательный supplier-side документ: техпараметры, габариты и pressure/material evidence перед оплатой и поставкой.",
    tags: ["plate-he", "supplier", "datasheet", "missing"],
  },
];
