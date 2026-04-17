export type ObairFamilyId = "BF" | "GXH" | "FG" | "ZKW";

export type TaskType =
  | "ventilation-only"
  | "fresh-exhaust-heat-recovery"
  | "cooling-heating-air"
  | "modular-ahu-cleanroom";

export type MountingType = "indoor-standard" | "limited-plant-room" | "ceiling-or-tight-space" | "rooftop-or-technical-floor";

export type IndustryType = "medicine" | "biopharma" | "electronics" | "mall-hotel" | "workshop-factory" | "other";

export type ComplexityLevel = "simple-box" | "cabinety-unit" | "modular-ahu";

export interface SelectorInputs {
  taskType: TaskType;
  airflowM3h: number;
  staticPressurePa: number;
  needHeatRecovery: boolean;
  needCoil: boolean;
  mountingType: MountingType;
  industry: IndustryType;
  complexity: ComplexityLevel;
}

export interface FamilyCardData {
  id: ObairFamilyId;
  title: string;
  shortDescription: string;
  suitableWhen: string[];
  notSuitableWhen: string[];
  typicalRange: {
    airflow: string;
    staticPressure: string;
    heatRecovery: string;
    note?: string;
  };
  typicalScenarios: string[];
}

export interface SelectorRecommendation {
  familyId: ObairFamilyId;
  reason: string[];
  scenarios: string[];
  clarifyForEngineering: string[];
}

export interface ComparisonRow {
  metric: string;
  BF: string;
  GXH: string;
  FG: string;
  ZKW: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ApiRecommendedModel {
  id: string;
  modelCodeRaw: string;
  modelCodeNormalized: string;
  displayName: string;
  airflowRangeM3h: [number, number];
  staticPressurePa: [number | null, number | null];
  score: number;
  warnings: string[];
}

export interface ApiRecommendResponse {
  status: "matched-standard" | "matched-with-warning" | "no-standard-match" | "project-specific";
  recommendedFamily: {
    code: ObairFamilyId;
    name: string;
  };
  primaryModel: ApiRecommendedModel | null;
  alternatives: ApiRecommendedModel[];
  warnings: string[];
  clarificationChecklist: string[];
  manufacturerRequestRequired: boolean;
  requestPreset?: {
    reason: string;
    capturedInputPayload: boolean;
  };
}
