import { RFQ_CANONICAL_URL, RFQ_PAGE_ID, RFQ_PAGE_VERSION } from "./config";
import { normalizeRfqInputs } from "./estimator";
import { EstimateResult, RfqFormState, RfqPayload, RfqSourceMetadata } from "./types";

export interface BuildPayloadOptions {
  locale?: string;
  country?: string;
}

function detectDeviceType(): RfqSourceMetadata["device"] {
  if (typeof window === "undefined") return "unknown";
  const width = window.innerWidth;
  if (width <= 768) return "mobile";
  if (width <= 1024) return "tablet";
  return "desktop";
}

function resolveLocale(): string {
  if (typeof navigator === "undefined") return "ru-RU";
  return navigator.language || "ru-RU";
}

function resolveCountry(locale: string): string {
  const parts = locale.split("-");
  if (parts.length > 1) return parts[1].toUpperCase();
  return "";
}

export function hasAtLeastOneContactChannel(form: RfqFormState): boolean {
  return Boolean(
    form.contact.email.trim() || form.contact.phone.trim() || form.contact.whatsapp.trim() || form.contact.telegram.trim(),
  );
}

export function hasAtLeastOneMeaningfulParam(form: RfqFormState): boolean {
  const numericFields = [
    form.powerKw,
    form.airflowM3h,
    form.lengthMm,
    form.heightMm,
    form.depthMm,
    form.rows,
    form.tubeDiameterMm,
    form.finPitchMm,
    form.workingPressureBar,
    form.collectorDiameterMm,
    form.collectorsCount,
  ];

  const hasNumeric = numericFields.some((value) => typeof value === "number" && value > 0);
  const hasText = Boolean(
    form.oldModel.trim() ||
      form.applicationArea.trim() ||
      form.comments.trim() ||
      form.oemEquipmentType.trim() ||
      form.documentsRequirement.trim(),
  );

  return hasNumeric || hasText;
}

export function validateSubmitMinimum(form: RfqFormState): string[] {
  const errors: string[] = [];

  if (!form.scenario) {
    errors.push("Выберите сценарий заявки");
  }

  if (!hasAtLeastOneMeaningfulParam(form) && form.files.length === 0) {
    errors.push("Загрузите файл или заполните хотя бы один параметр задачи");
  }

  if (!hasAtLeastOneContactChannel(form)) {
    errors.push("Добавьте email или телефон");
  }

  if (!form.contact.name.trim() && !form.contact.company.trim()) {
    errors.push("Укажите имя или компанию");
  }

  if (form.contact.email.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact.email.trim())) {
    errors.push("Укажите корректный email");
  }

  return errors;
}

export function buildRfqPayload(
  form: RfqFormState,
  estimate: EstimateResult,
  options: BuildPayloadOptions = {},
): RfqPayload {
  const normalized = normalizeRfqInputs(form);
  const locale = options.locale || resolveLocale();
  const country = options.country || form.contact.country || resolveCountry(locale);

  return {
    pageId: RFQ_PAGE_ID,
    canonicalUrl: RFQ_CANONICAL_URL,
    scenario: form.scenario,
    taskNeed: form.taskNeed,
    application: form.applicationArea,
    medium: form.medium,
    mode: form.mode,
    geometry: {
      lengthMm: normalized.lengthMm,
      heightMm: normalized.heightMm,
      depthMm: normalized.depthMm,
      rows: normalized.rows,
      tubeDiameterMm: normalized.tubeDiameterMm,
      finPitchMm: normalized.finPitchMm,
      finThicknessMm: normalized.finThicknessMm,
      casingThicknessMm: normalized.casingThicknessMm,
      tubesPerRow: normalized.tubesPerRow,
      quantity: normalized.quantity,
    },
    thermal: {
      powerKw: normalized.powerKw,
      airflowM3h: normalized.airflowM3h,
      airInC: normalized.airInC,
      airOutC: normalized.airOutC,
      mediumInC: normalized.mediumInC,
      mediumOutC: normalized.mediumOutC,
      workingPressureBar: normalized.workingPressureBar,
      pressureDropLimitKpa: normalized.pressureDropLimitKpa,
    },
    collectorsAndConnections: {
      collectorDiameterMm: normalized.collectorDiameterMm,
      collectorsCount: normalized.collectorsCount,
      collectorPosition: form.collectorPosition,
      collectorCenterDistanceMm: normalized.collectorCenterDistanceMm,
      edgeToConnectionAxisMm: normalized.edgeToConnectionAxisMm,
      collectorProjectionMm: normalized.collectorProjectionMm,
      connectionType: form.connectionType,
      connectionSize: form.connectionSize,
      connectionOrientation: form.connectionOrientation,
      keepConnectionLayoutExact: normalized.keepConnectionLayoutExact,
      allowConnectionChanges: normalized.allowConnectionChanges,
    },
    materialsAndOptions: {
      materialTube: form.materialTube,
      materialFin: form.materialFin,
      headerType: form.headerType,
      circuitsCount: typeof form.circuitsCount === "number" ? form.circuitsCount : 0,
      circulationScheme: form.circulationScheme,
      mountingExecution: form.mountingExecution,
      corrosionRequirement: form.corrosionRequirement,
      temperatureRangeRequirement: form.temperatureRangeRequirement,
      documentsRequirement: form.documentsRequirement,
      oemRequirements: form.oemRequirements,
    },
    replacementAndOem: {
      oldModel: form.oldModel,
      preserveWhat: form.preserveWhat,
      replacementNeed: form.replacementNeed,
      oemEquipmentType: form.oemEquipmentType,
      oemSampleOrSeries: form.oemSampleOrSeries,
      oemPlannedVolume: normalized.oemPlannedVolume,
      oemPurchaseRegularity: form.oemPurchaseRegularity,
      oemProjectType: form.oemProjectType,
      oemNeedSerialCalc: form.oemNeedSerialCalc,
      oemNeedSupplierAnalog: form.oemNeedSupplierAnalog,
    },
    comments: form.comments,
    files: form.files.map((file) => ({
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      category: file.category,
      lastModified: file.lastModified,
    })),
    contact: form.contact,
    estimate: {
      low: estimate.low,
      mid: estimate.mid,
      high: estimate.high,
      confidence: estimate.confidence,
      factors: estimate.factors,
    },
    confidence: {
      completion: estimate.completion,
      score: estimate.confidenceScore,
    },
    source: {
      locale,
      country,
      device: detectDeviceType(),
      timestamp: new Date().toISOString(),
      pageVersion: RFQ_PAGE_VERSION,
    },
    routing: {
      preference: form.routingPreference,
      selectedManufacturers: form.selectedManufacturers,
      autoMatchEligible: form.routingPreference !== "hold",
      anonymousMarketplacePublishable: Boolean(form.routingPreference === "auto" && form.files.length > 0),
      routingStatus: form.routingPreference === "hold" ? "pending" : "ready-for-routing",
      quoteCount: 0,
      actualQuotes: [],
      actualWinningQuote: null,
      orderWon: null,
    },
  };
}
