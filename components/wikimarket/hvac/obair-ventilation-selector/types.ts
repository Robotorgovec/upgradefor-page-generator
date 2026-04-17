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
