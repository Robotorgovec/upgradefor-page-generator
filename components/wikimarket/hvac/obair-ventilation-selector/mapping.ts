import { engineeringClarificationChecklist, familyCards } from "./data";
import type { ObairFamilyId, SelectorInputs, SelectorRecommendation } from "./types";

function getAirflowTier(airflowM3h: number): "low" | "mid" | "high" {
  if (airflowM3h >= 50000) return "high";
  if (airflowM3h >= 12000) return "mid";
  return "low";
}

export function getRecommendation(inputs: SelectorInputs): SelectorRecommendation {
  const reasons: string[] = [];
  let family: ObairFamilyId = "BF";

  const airflowTier = getAirflowTier(inputs.airflowM3h);
  const isCleanIndustry = inputs.industry === "medicine" || inputs.industry === "biopharma" || inputs.industry === "electronics";

  if (
    inputs.taskType === "modular-ahu-cleanroom" ||
    inputs.complexity === "modular-ahu" ||
    isCleanIndustry ||
    airflowTier === "high"
  ) {
    family = "ZKW";
    reasons.push("Проект попадает в зону modular AHU / cleanroom / high-airflow сценариев, где ZKW обычно наиболее релевантен.");
  } else if (inputs.needHeatRecovery || inputs.taskType === "fresh-exhaust-heat-recovery") {
    family = "GXH";
    reasons.push("Есть явная потребность в приточно-вытяжной схеме с heat recovery / energy recovery, что соответствует назначению GXH.");
  } else if (
    inputs.needCoil ||
    inputs.taskType === "cooling-heating-air" ||
    inputs.complexity === "cabinety-unit" ||
    inputs.mountingType === "ceiling-or-tight-space" ||
    inputs.mountingType === "limited-plant-room"
  ) {
    family = "FG";
    reasons.push("Приоритет на cabinet coil-based обработке воздуха и компактной компоновке — это типичный профиль FG.");
  } else {
    family = "BF";
    reasons.push("Для простой вентиляции без сложной секционной архитектуры обычно достаточно BF box-type решения.");
  }

  if (inputs.staticPressurePa > 1200 && family === "BF") {
    reasons.push("Запрошенное статическое давление выше типичного comfort-диапазона BF; может потребоваться FG или ZKW после инженерной проверки.");
  }

  const familyCard = familyCards.find((item) => item.id === family)!;

  return {
    familyId: family,
    reason: reasons,
    scenarios: familyCard.typicalScenarios,
    clarifyForEngineering: engineeringClarificationChecklist,
  };
}
