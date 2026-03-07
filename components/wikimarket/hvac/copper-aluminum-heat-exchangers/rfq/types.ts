export type RfqScenario =
  | "quick"
  | "dimensions"
  | "power"
  | "replacement"
  | "oem"
  | "engineering";

export type TaskNeed = "new-selection" | "replacement" | "custom" | "oem-series";

export type Purpose = "cooling" | "heating" | "evaporation" | "condensation" | "universal";

export type MediumType = "freon" | "water" | "glycol" | "oil" | "steam" | "other";

export type OperationMode = "cold" | "heat" | "universal";

export type Urgency = "standard" | "priority" | "urgent" | "critical";

export type ReplacementNeed = "full-analog" | "engineering-recalc" | "adaptive";

export type HeaderPosition = "left" | "right" | "top" | "bottom" | "both-sides" | "custom";

export type ConnectionType = "threaded" | "flanged" | "brazed" | "other";

export type ConnectionOrientation = "front" | "side" | "top" | "bottom";

export type RoutingPreference = "auto" | "selected" | "hold";

export type ClientType = "engineer" | "procurement" | "oem" | "manufacturer" | "service" | "end-customer";

export type PreferredContact = "email" | "phone" | "whatsapp" | "telegram" | "any";

export type OnsiteNeed = "no" | "consultation" | "yes";

export type EstimateConfidence = "low" | "medium" | "high";

export type CompletionStatus = "ready-to-send" | "enough-for-preselection" | "enough-for-precise-calculation";

export type FileCategory =
  | "drawing"
  | "nameplate"
  | "old-coil-photo"
  | "pdf-spec"
  | "excel-spec"
  | "installation-photo"
  | "other";

export interface RfqFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  category: FileCategory;
  previewUrl?: string;
}

export interface RfqContactBlock {
  name: string;
  company: string;
  country: string;
  email: string;
  phone: string;
  whatsapp: string;
  telegram: string;
  preferredContact: PreferredContact | "";
  preferredTime: string;
  urgency: Urgency | "";
  onsiteNeed: OnsiteNeed | "";
  cityObject: string;
  comment: string;
}

export interface RfqFormState {
  scenario: RfqScenario;
  taskNeed: TaskNeed | "";
  purpose: Purpose | "";
  applicationArea: string;
  knownData: string[];
  engineerHelp: boolean;
  medium: MediumType | "";
  mode: OperationMode | "";
  powerKw: number | "";
  airflowM3h: number | "";
  airInC: number | "";
  airOutC: number | "";
  mediumInC: number | "";
  mediumOutC: number | "";
  workingPressureBar: number | "";
  pressureDropLimitKpa: number | "";
  lengthMm: number | "";
  heightMm: number | "";
  depthMm: number | "";
  rows: number | "";
  tubeDiameterMm: number | "";
  finPitchMm: number | "";
  finThicknessMm: number | "";
  casingThicknessMm: number | "";
  tubesPerRow: number | "";
  tubePattern: string;
  quantity: number | "";
  oldModel: string;
  preserveWhat: string[];
  replacementNeed: ReplacementNeed | "";
  oemEquipmentType: string;
  oemSampleOrSeries: string;
  oemPlannedVolume: number | "";
  oemPurchaseRegularity: string;
  oemProjectType: string;
  oemRequirements: string[];
  oemNeedSerialCalc: boolean;
  oemNeedSupplierAnalog: boolean;
  materialTube: string;
  materialFin: string;
  headerType: string;
  circuitsCount: number | "";
  circulationScheme: string;
  mountingExecution: string;
  corrosionRequirement: string;
  temperatureRangeRequirement: string;
  documentsRequirement: string;
  collectorDiameterMm: number | "";
  collectorsCount: number | "";
  collectorPosition: HeaderPosition | "";
  collectorCenterDistanceMm: number | "";
  edgeToConnectionAxisMm: number | "";
  collectorProjectionMm: number | "";
  connectionType: ConnectionType | "";
  connectionSize: string;
  connectionOrientation: ConnectionOrientation | "";
  keepConnectionLayoutExact: boolean;
  allowConnectionChanges: boolean;
  comments: string;
  files: RfqFileItem[];
  clientType: ClientType | "";
  routingPreference: RoutingPreference;
  selectedManufacturers: string[];
  contact: RfqContactBlock;
  consent: boolean;
}

export interface NormalizedRfqInput {
  scenario: RfqScenario;
  taskNeed: TaskNeed | "";
  purpose: Purpose | "";
  applicationArea: string;
  knownData: string[];
  engineerHelp: boolean;
  medium: MediumType | "";
  mode: OperationMode | "";
  powerKw: number;
  airflowM3h: number;
  airInC: number;
  airOutC: number;
  mediumInC: number;
  mediumOutC: number;
  workingPressureBar: number;
  pressureDropLimitKpa: number;
  lengthMm: number;
  heightMm: number;
  depthMm: number;
  rows: number;
  tubeDiameterMm: number;
  finPitchMm: number;
  finThicknessMm: number;
  casingThicknessMm: number;
  tubesPerRow: number;
  quantity: number;
  oldModel: string;
  replacementNeed: ReplacementNeed | "";
  oemPlannedVolume: number;
  collectorDiameterMm: number;
  collectorsCount: number;
  collectorCenterDistanceMm: number;
  edgeToConnectionAxisMm: number;
  collectorProjectionMm: number;
  keepConnectionLayoutExact: boolean;
  allowConnectionChanges: boolean;
  hasFiles: boolean;
  hasDrawingOrNameplate: boolean;
}

export interface EstimateFactorsSnapshot {
  mediumFactor: number;
  finDensityFactor: number;
  replacementExactFitFactor: number;
  oemSerialFactor: number;
  customConnectionFactor: number;
  coatingFactor: number;
  urgencyFactor: number;
  quantityFactor: number;
  countryFactor: number;
  manufacturerFactor: number;
  uncertaintyFactor: number;
}

export interface EstimateDerivedGeometry {
  tubeCount: number;
  tubeRuns: number;
  totalTubeLengthM: number;
  finnedDepthMm: number;
  finCount: number;
  headerSizeProxy: number;
  casingAreaM2: number;
}

export interface EstimateDerivedMasses {
  copperTubeKg: number;
  aluminumFinKg: number;
  headerKg: number;
  casingKg: number;
}

export interface EstimateResult {
  low: number;
  mid: number;
  high: number;
  confidence: EstimateConfidence;
  confidenceScore: number;
  completion: CompletionStatus;
  derivedGeometry: EstimateDerivedGeometry;
  derivedMasses: EstimateDerivedMasses;
  factors: EstimateFactorsSnapshot;
}

export interface RfqSourceMetadata {
  locale: string;
  country: string;
  device: "mobile" | "tablet" | "desktop" | "unknown";
  timestamp: string;
  pageVersion: string;
}

export interface RfqEstimateBlock {
  low: number;
  mid: number;
  high: number;
  confidence: EstimateConfidence;
  factors: EstimateFactorsSnapshot;
}

export interface RfqPayload {
  pageId: "wikimarket-copper-aluminum-heat-exchangers";
  canonicalUrl: "https://upgradefor.com/wikimarket/hvac/copper-aluminum-heat-exchangers";
  scenario: RfqScenario;
  taskNeed: TaskNeed | "";
  application: string;
  medium: MediumType | "";
  mode: OperationMode | "";
  geometry: {
    lengthMm: number;
    heightMm: number;
    depthMm: number;
    rows: number;
    tubeDiameterMm: number;
    finPitchMm: number;
    finThicknessMm: number;
    casingThicknessMm: number;
    tubesPerRow: number;
    quantity: number;
  };
  thermal: {
    powerKw: number;
    airflowM3h: number;
    airInC: number;
    airOutC: number;
    mediumInC: number;
    mediumOutC: number;
    workingPressureBar: number;
    pressureDropLimitKpa: number;
  };
  collectorsAndConnections: {
    collectorDiameterMm: number;
    collectorsCount: number;
    collectorPosition: HeaderPosition | "";
    collectorCenterDistanceMm: number;
    edgeToConnectionAxisMm: number;
    collectorProjectionMm: number;
    connectionType: ConnectionType | "";
    connectionSize: string;
    connectionOrientation: ConnectionOrientation | "";
    keepConnectionLayoutExact: boolean;
    allowConnectionChanges: boolean;
  };
  materialsAndOptions: {
    materialTube: string;
    materialFin: string;
    headerType: string;
    circuitsCount: number;
    circulationScheme: string;
    mountingExecution: string;
    corrosionRequirement: string;
    temperatureRangeRequirement: string;
    documentsRequirement: string;
    oemRequirements: string[];
  };
  replacementAndOem: {
    oldModel: string;
    preserveWhat: string[];
    replacementNeed: ReplacementNeed | "";
    oemEquipmentType: string;
    oemSampleOrSeries: string;
    oemPlannedVolume: number;
    oemPurchaseRegularity: string;
    oemProjectType: string;
    oemNeedSerialCalc: boolean;
    oemNeedSupplierAnalog: boolean;
  };
  comments: string;
  files: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    category: FileCategory;
    lastModified: number;
  }>;
  contact: RfqContactBlock;
  estimate: RfqEstimateBlock;
  confidence: {
    completion: CompletionStatus;
    score: number;
  };
  source: RfqSourceMetadata;
  routing: {
    preference: RoutingPreference;
    selectedManufacturers: string[];
    autoMatchEligible: boolean;
    anonymousMarketplacePublishable: boolean;
    routingStatus: "pending" | "ready-for-routing";
    quoteCount: number;
    actualQuotes: Array<Record<string, unknown>>;
    actualWinningQuote: Record<string, unknown> | null;
    orderWon: boolean | null;
  };
}

export interface RfqHistorySnapshot {
  scenario: RfqScenario;
  normalizedInputs: NormalizedRfqInput;
  files: RfqFileItem[];
  estimateLow: number;
  estimateMid: number;
  estimateHigh: number;
  estimateConfidence: EstimateConfidence;
  estimateFactorsSnapshot: EstimateFactorsSnapshot;
  timestamp: string;
  locale: string;
  country: string;
  submitAttempted: boolean;
  submitSucceeded: boolean;
  submitFailed: boolean;
  finalPayload: RfqPayload | null;
}
