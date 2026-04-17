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
