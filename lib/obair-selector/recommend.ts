import type { CatalogModel, CatalogSeries, CatalogFamily, PrismaClient } from "@prisma/client";

import type { RecommendResponse, RecommendedModel, SelectorInputPayload, TaskType } from "./types";

type ModelWithSeriesFamily = CatalogModel & {
  series: CatalogSeries & {
    family: CatalogFamily;
  };
};

const clarificationChecklist = [
  "Температурные режимы лето/зима",
  "Класс фильтрации",
  "Ограничения по сервису",
  "Требования к автоматике",
];

function isTaskType(value: unknown): value is TaskType {
  return ["ventilation-only", "fresh-exhaust-heat-recovery", "cooling-heating-air", "modular-ahu-cleanroom"].includes(
    String(value),
  );
}

export function validateSelectorInput(payload: unknown): { ok: true; value: SelectorInputPayload } | { ok: false; errors: string[] } {
  const body = payload as Partial<SelectorInputPayload>;
  const errors: string[] = [];

  if (!isTaskType(body?.taskType)) {
    errors.push("taskType is required and must be valid");
  }

  if (!Number.isFinite(body?.airflowM3h) || Number(body?.airflowM3h) <= 0) {
    errors.push("airflowM3h must be > 0");
  }

  if (!Number.isFinite(body?.staticPressurePa) || Number(body?.staticPressurePa) < 0) {
    errors.push("staticPressurePa must be >= 0");
  }

  if (errors.length) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      taskType: body.taskType!,
      airflowM3h: Number(body.airflowM3h),
      staticPressurePa: Number(body.staticPressurePa),
      needHeatRecovery: Boolean(body.needHeatRecovery),
      needCoil: Boolean(body.needCoil),
      mountingType: body.mountingType,
      industry: body.industry ?? "other",
      filterClassRequired: body.filterClassRequired,
      powerSupply: body.powerSupply,
      dimensionsLimitMm: body.dimensionsLimitMm,
    },
  };
}

function pickFamily(input: SelectorInputPayload): "BF" | "GXH" | "FG" | "ZKW" {
  const isCleanIndustry = input.industry === "medicine" || input.industry === "biopharma" || input.industry === "electronics";

  if (input.taskType === "modular-ahu-cleanroom" || isCleanIndustry || input.airflowM3h >= 50000) {
    return "ZKW";
  }

  if (input.needHeatRecovery || input.taskType === "fresh-exhaust-heat-recovery") {
    return "GXH";
  }

  if (input.needCoil || input.taskType === "cooling-heating-air") {
    return "FG";
  }

  return "BF";
}

function hasMountingMatch(model: ModelWithSeriesFamily, mountingType?: string): boolean {
  if (!mountingType) return true;
  return model.mountingType.length === 0 || model.mountingType.includes(mountingType);
}

function computeScore(model: ModelWithSeriesFamily, input: SelectorInputPayload): { score: number; warnings: string[] } {
  const warnings: string[] = [];

  const airflowFit =
    input.airflowM3h >= model.airflowMinM3h && input.airflowM3h <= model.airflowMaxM3h
      ? 1
      : input.airflowM3h <= model.airflowMaxM3h * 1.1
        ? 0.7
        : 0;

  const maxPressure = model.staticPressureMaxPa ?? Number.MAX_SAFE_INTEGER;
  const pressureFit = input.staticPressurePa <= maxPressure ? 1 : input.staticPressurePa <= maxPressure * 1.15 ? 0.5 : 0;

  const applicationFit = model.applicationType.length === 0 || model.applicationType.includes("ventilation") ? 1 : 0.7;
  const mountingFit = hasMountingMatch(model, input.mountingType) ? 1 : 0;
  const recoveryFit = input.needHeatRecovery ? (model.heatRecoveryType.length === 0 || model.heatRecoveryType.includes("total") ? 1 : 0.3) : 1;
  const industryFit = ["medicine", "biopharma", "electronics"].includes(input.industry ?? "other")
    ? model.series.family.code === "ZKW"
      ? 1
      : 0.5
    : 1;

  if (airflowFit < 1) warnings.push("airflow выходит в допускный margin и требует проверки");
  if (pressureFit < 1) warnings.push("static pressure выше номинала и требует проверки");
  if (mountingFit === 0) warnings.push("тип монтажа не совпадает с моделью");

  const score = airflowFit * 0.4 + pressureFit * 0.2 + applicationFit * 0.15 + mountingFit * 0.1 + recoveryFit * 0.1 + industryFit * 0.05;

  return {
    score: Number(score.toFixed(4)),
    warnings,
  };
}

function toRecommendedModel(model: ModelWithSeriesFamily, score: number, warnings: string[]): RecommendedModel {
  return {
    id: model.id,
    modelCodeRaw: model.modelCodeRaw,
    modelCodeNormalized: model.modelCodeNormalized,
    displayName: model.displayName,
    airflowRangeM3h: [model.airflowMinM3h, model.airflowMaxM3h],
    staticPressurePa: [model.staticPressureMinPa ?? null, model.staticPressureMaxPa ?? null],
    score,
    warnings,
  };
}

export async function recommendCatalog(prisma: PrismaClient, input: SelectorInputPayload): Promise<RecommendResponse> {
  const familyCode = pickFamily(input);

  const family = await prisma.catalogFamily.findUnique({ where: { code: familyCode } });

  if (!family) {
    return {
      status: "project-specific",
      recommendedFamily: { code: familyCode, name: "OBAIR Family" },
      primaryModel: null,
      alternatives: [],
      warnings: ["Каталог не инициализирован для выбранного семейства"],
      clarificationChecklist,
      manufacturerRequestRequired: true,
      requestPreset: {
        reason: "missing-data",
        capturedInputPayload: true,
      },
    };
  }

  if (familyCode === "ZKW") {
    return {
      status: "project-specific",
      recommendedFamily: { code: familyCode, name: family.name },
      primaryModel: null,
      alternatives: [],
      warnings: ["ZKW требует инженерной конфигурации производителя"],
      clarificationChecklist,
      manufacturerRequestRequired: true,
      requestPreset: {
        reason: "project-specific-zkw",
        capturedInputPayload: true,
      },
    };
  }

  const models = await prisma.catalogModel.findMany({
    where: {
      status: "active",
      isStandardSelectable: true,
      series: {
        family: {
          code: familyCode,
        },
      },
    },
    include: {
      series: {
        include: {
          family: true,
        },
      },
    },
  });

  const scored = models
    .map((model) => {
      const { score, warnings } = computeScore(model, input);
      return { model, score, warnings };
    })
    .filter(({ score, model }) => {
      if (score <= 0) return false;
      if (input.airflowM3h > model.airflowMaxM3h * 1.1) return false;
      if (model.staticPressureMaxPa && input.staticPressurePa > model.staticPressureMaxPa * 1.15) return false;
      if (!hasMountingMatch(model, input.mountingType)) return false;
      return true;
    })
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return {
      status: "no-standard-match",
      recommendedFamily: { code: familyCode, name: family.name },
      primaryModel: null,
      alternatives: [],
      warnings: ["Стандартного типоразмера по текущим параметрам не найдено"],
      clarificationChecklist,
      manufacturerRequestRequired: true,
      requestPreset: {
        reason: "no-match",
        capturedInputPayload: true,
      },
    };
  }

  const [primary, ...rest] = scored;
  const alternatives = rest.slice(0, 2).map(({ model, score, warnings }) => toRecommendedModel(model, score, warnings));
  const primaryModel = toRecommendedModel(primary.model, primary.score, primary.warnings);

  const status = primary.warnings.length > 0 ? "matched-with-warning" : "matched-standard";

  return {
    status,
    recommendedFamily: { code: familyCode, name: family.name },
    primaryModel,
    alternatives,
    warnings: primary.warnings,
    clarificationChecklist,
    manufacturerRequestRequired: false,
  };
}
