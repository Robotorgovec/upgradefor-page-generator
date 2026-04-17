export type TaskType =
  | "ventilation-only"
  | "fresh-exhaust-heat-recovery"
  | "cooling-heating-air"
  | "modular-ahu-cleanroom";

export type IndustryType = "medicine" | "biopharma" | "electronics" | "mall-hotel" | "workshop-factory" | "other";

export interface DimensionsLimit {
  width?: number;
  depth?: number;
  height?: number;
}

export interface SelectorInputPayload {
  taskType: TaskType;
  airflowM3h: number;
  staticPressurePa: number;
  needHeatRecovery?: boolean;
  needCoil?: boolean;
  mountingType?: string;
  industry?: IndustryType;
  filterClassRequired?: string;
  powerSupply?: string;
  dimensionsLimitMm?: DimensionsLimit;
}

export interface RecommendedModel {
  id: string;
  modelCodeRaw: string;
  modelCodeNormalized: string;
  displayName: string;
  airflowRangeM3h: [number, number];
  staticPressurePa: [number | null, number | null];
  score: number;
  warnings: string[];
}

export interface RecommendResponse {
  status: "matched-standard" | "matched-with-warning" | "no-standard-match" | "project-specific";
  recommendedFamily: {
    code: "BF" | "GXH" | "FG" | "ZKW";
    name: string;
  };
  primaryModel: RecommendedModel | null;
  alternatives: RecommendedModel[];
  warnings: string[];
  clarificationChecklist: string[];
  manufacturerRequestRequired: boolean;
  requestPreset?: {
    reason:
      | "no-match"
      | "out-of-range"
      | "missing-data"
      | "project-specific-zkw"
      | "medical-or-cleanroom"
      | "ambiguous-query"
      | "non-standard-option";
    capturedInputPayload: boolean;
  };
}

export interface SelectorRequestPayload {
  inputPayload: SelectorInputPayload;
  resultStatus: "matched-standard" | "matched-with-warning" | "no-standard-match" | "project-specific";
  selectedModelId?: string;
  selectedFamilyCode?: "BF" | "GXH" | "FG" | "ZKW";
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  company?: string;
  comment?: string;
  shortlist?: Array<{ modelId?: string; score?: number; reasons?: string[]; warnings?: string[] }>;
}
