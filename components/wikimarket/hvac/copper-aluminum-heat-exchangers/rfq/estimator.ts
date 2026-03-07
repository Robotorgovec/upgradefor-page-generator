import { DeadlineMode, DeadlinePreset, EstimateResult, NormalizedRfqInput, RfqFormState } from "./types";

export interface EstimateReferenceConfig {
  copperPriceRef: number;
  aluminumPriceRef: number;
  steelPriceRef: number;
  laborRateRef: number;
  brazingRateRef: number;
  qcPackingRateRef: number;
  fxRateRef: number;
  countryFactor: number;
  manufacturerFactor: number;
}

export const DEFAULT_REFERENCE_CONFIG: EstimateReferenceConfig = {
  copperPriceRef: 9.5,
  aluminumPriceRef: 2.8,
  steelPriceRef: 1.3,
  laborRateRef: 34,
  brazingRateRef: 22,
  qcPackingRateRef: 16,
  fxRateRef: 1,
  countryFactor: 1,
  manufacturerFactor: 1,
};

function numberOr(value: number | "", fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return fallback;
}

function cleanPositive(value: number | "", fallback = 0): number {
  const n = numberOr(value, fallback);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

function deriveDaysFromDate(dateString: string): number {
  if (!dateString) return 0;

  const target = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(target.getTime())) return 0;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.ceil((target.getTime() - startOfToday.getTime()) / 86_400_000);

  return Math.max(1, diffDays);
}

function resolveDeadlineDays(
  mode: DeadlineMode,
  preset: DeadlinePreset | "",
  deadlineDays: number | "",
  deadlineDate: string,
): number {
  if (mode === "days_from_now") return cleanPositive(deadlineDays);
  if (mode === "exact_date") return deriveDaysFromDate(deadlineDate);

  if (mode === "preset") {
    switch (preset) {
      case "7_days":
        return 7;
      case "14_days":
        return 14;
      case "30_days":
        return 30;
      case "45_plus":
        return 45;
      default:
        return 14;
    }
  }

  return 0;
}

function normalizeDeadlineFactor(mode: DeadlineMode, preset: DeadlinePreset | "", days: number): number {
  if (mode === "asap") return 1.18;

  if (mode === "exact_date" || mode === "days_from_now") {
    if (days <= 7) return 1.16;
    if (days <= 14) return 1.1;
    if (days <= 30) return 1.04;
    if (days <= 45) return 1.01;
    return 1;
  }

  switch (preset) {
    case "7_days":
      return 1.16;
    case "14_days":
      return 1.1;
    case "30_days":
      return 1.04;
    case "45_plus":
      return 1;
    default:
      return 1.05;
  }
}

function mediumFactor(medium: NormalizedRfqInput["medium"]): number {
  switch (medium) {
    case "freon":
      return 1.08;
    case "glycol":
      return 1.06;
    case "steam":
      return 1.14;
    case "oil":
      return 1.09;
    case "water":
      return 1;
    case "other":
      return 1.12;
    default:
      return 1.07;
  }
}

function quantityFactor(quantity: number): number {
  if (quantity >= 60) return 0.82;
  if (quantity >= 20) return 0.88;
  if (quantity >= 8) return 0.93;
  if (quantity >= 3) return 0.98;
  return 1;
}

function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value / 10) * 10);
}

export function normalizeRfqInputs(form: RfqFormState): NormalizedRfqInput {
  const knownDataSet = new Set(form.knownData);
  const hasDrawingOrNameplate = form.files.some(
    (file) => file.category === "drawing" || file.category === "nameplate",
  );
  const deadlineDays = resolveDeadlineDays(form.deadlineMode, form.deadlinePreset, form.deadlineDays, form.deadlineDate);

  return {
    scenario: form.scenario,
    taskNeed: form.taskNeed,
    purpose: form.purpose,
    applicationArea: form.applicationArea.trim(),
    knownData: [...form.knownData],
    engineerHelp: Boolean(form.engineerHelp || knownDataSet.has("Нужна помощь инженера")),
    medium: form.medium,
    mode: form.mode,
    deadlineMode: form.deadlineMode,
    deadlineDate: form.deadlineDate,
    deadlineDays,
    deadlinePreset: form.deadlinePreset,
    powerKw: cleanPositive(form.powerKw),
    airflowM3h: cleanPositive(form.airflowM3h),
    airInC: numberOr(form.airInC, 0),
    airOutC: numberOr(form.airOutC, 0),
    mediumInC: numberOr(form.mediumInC, 0),
    mediumOutC: numberOr(form.mediumOutC, 0),
    workingPressureBar: cleanPositive(form.workingPressureBar),
    pressureDropLimitKpa: cleanPositive(form.pressureDropLimitKpa),
    lengthMm: cleanPositive(form.lengthMm),
    heightMm: cleanPositive(form.heightMm),
    depthMm: cleanPositive(form.depthMm),
    rows: cleanPositive(form.rows),
    tubeDiameterMm: cleanPositive(form.tubeDiameterMm),
    finPitchMm: cleanPositive(form.finPitchMm),
    finThicknessMm: cleanPositive(form.finThicknessMm),
    casingThicknessMm: cleanPositive(form.casingThicknessMm),
    tubesPerRow: cleanPositive(form.tubesPerRow),
    quantity: cleanPositive(form.quantity, 1),
    oldModel: form.oldModel.trim(),
    replacementNeed: form.replacementNeed,
    oemPlannedVolume: cleanPositive(form.oemPlannedVolume),
    collectorDiameterMm: cleanPositive(form.collectorDiameterMm),
    collectorsCount: cleanPositive(form.collectorsCount),
    collectorCenterDistanceMm: cleanPositive(form.collectorCenterDistanceMm),
    edgeToConnectionAxisMm: cleanPositive(form.edgeToConnectionAxisMm),
    collectorProjectionMm: cleanPositive(form.collectorProjectionMm),
    keepConnectionLayoutExact: Boolean(form.keepConnectionLayoutExact),
    allowConnectionChanges: Boolean(form.allowConnectionChanges),
    hasFiles: form.files.length > 0,
    hasDrawingOrNameplate,
  };
}

export function calculateEstimate(
  form: RfqFormState,
  config: EstimateReferenceConfig = DEFAULT_REFERENCE_CONFIG,
): EstimateResult {
  const normalized = normalizeRfqInputs(form);

  const lengthMm = normalized.lengthMm || 900;
  const heightMm = normalized.heightMm || 500;
  const depthMm = normalized.depthMm || 160;
  const rows = normalized.rows || 2;
  const tubeDiameterMm = normalized.tubeDiameterMm || 9.52;
  const finPitchMm = normalized.finPitchMm || 2.1;
  const finThicknessMm = normalized.finThicknessMm || 0.12;
  const casingThicknessMm = normalized.casingThicknessMm || 1;
  const quantity = normalized.quantity || 1;

  const faceAreaM2 = (lengthMm * heightMm) / 1_000_000;
  const finCount = Math.max(20, Math.round(depthMm / Math.max(finPitchMm, 1.4)));
  const tubesPerRow = normalized.tubesPerRow || Math.max(10, Math.round(lengthMm / 35));
  const tubeCount = Math.max(20, tubesPerRow * rows);
  const tubeRuns = Math.max(2, rows * 2);
  const totalTubeLengthM = (tubeCount * Math.max(heightMm, 240)) / 1000;
  const finnedDepthMm = depthMm;
  const headerSizeProxy = Math.max(20, normalized.collectorDiameterMm || Math.round(tubeDiameterMm * 2.5));
  const casingAreaM2 = ((2 * (lengthMm + heightMm) * depthMm) / 1_000_000) * 1.1;

  const copperTubeCrossSectionM2 = Math.PI * Math.pow((tubeDiameterMm / 1000) / 2, 2);
  const copperTubeMassKg = totalTubeLengthM * copperTubeCrossSectionM2 * 8_930;

  const finAreaM2 = faceAreaM2 * finCount * 1.6;
  const aluminumFinMassKg = finAreaM2 * (finThicknessMm / 1000) * 2_700;

  const headerMassKg = Math.max(1.2, (headerSizeProxy / 1000) * (normalized.collectorsCount || 2) * 3.2);
  const casingMassKg = Math.max(1.8, casingAreaM2 * (casingThicknessMm / 1000) * 7_850);

  const copperMaterial = copperTubeMassKg * config.copperPriceRef;
  const aluminumMaterial = aluminumFinMassKg * config.aluminumPriceRef;
  const steelMaterial = casingMassKg * config.steelPriceRef;
  const headerMaterial = headerMassKg * (config.copperPriceRef * 0.74);

  const materialSubtotal = copperMaterial + aluminumMaterial + steelMaterial + headerMaterial;

  const assemblyComplexity =
    1 +
    (rows > 2 ? 0.08 : 0) +
    (normalized.collectorDiameterMm > 0 ? 0.03 : 0) +
    (normalized.keepConnectionLayoutExact ? 0.08 : 0);

  const laborHoursProxy = 6 + rows * 1.6 + faceAreaM2 * 7 + (normalized.keepConnectionLayoutExact ? 1.2 : 0);
  const brazingHoursProxy = 2.2 + tubeRuns * 0.7;
  const qcPackingHoursProxy = 1.6 + quantity * 0.12;

  const laborSubtotal = laborHoursProxy * config.laborRateRef * assemblyComplexity;
  const brazingSubtotal = brazingHoursProxy * config.brazingRateRef;
  const qcPackingSubtotal = qcPackingHoursProxy * config.qcPackingRateRef;

  const conversionSubtotal = laborSubtotal + brazingSubtotal + qcPackingSubtotal;

  const mediumFactorValue = mediumFactor(normalized.medium);
  const finDensityFactor = finPitchMm <= 1.8 ? 1.09 : finPitchMm <= 2.3 ? 1.03 : 1;
  const replacementExactFitFactor =
    normalized.scenario === "replacement" &&
    (normalized.replacementNeed === "full-analog" || normalized.keepConnectionLayoutExact)
      ? 1.11
      : 1;
  const oemSerialFactor = normalized.scenario === "oem" && (normalized.oemPlannedVolume || quantity) >= 50 ? 0.9 : 1;
  const customConnectionFactor =
    normalized.keepConnectionLayoutExact || (normalized.collectorCenterDistanceMm > 0 && !normalized.allowConnectionChanges)
      ? 1.08
      : 1;
  const coatingFactor = form.corrosionRequirement.trim().length > 0 || form.oemRequirements.includes("Покрытие") ? 1.05 : 1;
  const deadlineFactor = normalizeDeadlineFactor(normalized.deadlineMode, normalized.deadlinePreset, normalized.deadlineDays);
  const quantityFactorValue = quantityFactor(quantity);

  const knownSignals = [
    normalized.lengthMm > 0,
    normalized.heightMm > 0,
    normalized.depthMm > 0,
    normalized.powerKw > 0,
    normalized.airflowM3h > 0,
    normalized.mediumInC !== 0 || normalized.mediumOutC !== 0,
    normalized.collectorDiameterMm > 0,
    normalized.hasFiles,
    normalized.hasDrawingOrNameplate,
  ].filter(Boolean).length;

  const confidenceScore = Math.min(1, Math.max(0.18, knownSignals / 9));

  let uncertaintyFactor = 1.3 - confidenceScore * 0.34;
  if (normalized.engineerHelp) uncertaintyFactor += 0.03;
  uncertaintyFactor = Math.min(1.35, Math.max(1.05, uncertaintyFactor));

  const baseCost = (materialSubtotal + conversionSubtotal) * config.fxRateRef;

  const combinedFactor =
    mediumFactorValue *
    finDensityFactor *
    replacementExactFitFactor *
    oemSerialFactor *
    customConnectionFactor *
    coatingFactor *
    deadlineFactor *
    quantityFactorValue *
    config.countryFactor *
    config.manufacturerFactor;

  const midRaw = baseCost * combinedFactor;
  const lowRaw = midRaw / uncertaintyFactor;
  const highRaw = midRaw * uncertaintyFactor;

  const confidence = confidenceScore >= 0.72 ? "high" : confidenceScore >= 0.45 ? "medium" : "low";

  const completion =
    confidenceScore >= 0.78
      ? "enough-for-precise-calculation"
      : confidenceScore >= 0.45
        ? "enough-for-preselection"
        : "ready-to-send";

  return {
    low: roundMoney(lowRaw),
    mid: roundMoney(midRaw),
    high: roundMoney(highRaw),
    confidence,
    confidenceScore,
    completion,
    derivedGeometry: {
      tubeCount,
      tubeRuns,
      totalTubeLengthM,
      finnedDepthMm,
      finCount,
      headerSizeProxy,
      casingAreaM2,
    },
    derivedMasses: {
      copperTubeKg: Number(copperTubeMassKg.toFixed(2)),
      aluminumFinKg: Number(aluminumFinMassKg.toFixed(2)),
      headerKg: Number(headerMassKg.toFixed(2)),
      casingKg: Number(casingMassKg.toFixed(2)),
    },
    factors: {
      mediumFactor: mediumFactorValue,
      finDensityFactor,
      replacementExactFitFactor,
      oemSerialFactor,
      customConnectionFactor,
      coatingFactor,
      deadlineFactor,
      quantityFactor: quantityFactorValue,
      countryFactor: config.countryFactor,
      manufacturerFactor: config.manufacturerFactor,
      uncertaintyFactor,
    },
  };
}
