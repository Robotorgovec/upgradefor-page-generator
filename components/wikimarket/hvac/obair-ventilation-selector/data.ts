import type { ComparisonRow, FamilyCardData, FaqItem, ObairFamilyId } from "./types";

export const familyOrder: ObairFamilyId[] = ["BF", "GXH", "FG", "ZKW"];

export const familyCards: FamilyCardData[] = [
  {
    id: "BF",
    title: "BF — Box Type Ventilation Unit",
    shortDescription:
      "Компактная box-установка для базовой вентиляции без сложной многоступенчатой air treatment логики.",
    suitableWhen: [
      "Нужна базовая приточная/вытяжная вентиляция",
      "Проект требует простой и быстрой интеграции",
      "Средние расходы воздуха без сложных секций",
    ],
    notSuitableWhen: [
      "Требуется модульная AHU-конфигурация с множеством функциональных секций",
      "Нужны строгие cleanroom-ограничения",
      "Требуется выраженная рекуперация энергии как ключевая функция",
    ],
    typicalRange: {
      airflow: "~2,000–50,000 m³/h (official BF page range)",
      staticPressure: "до ~1,000 Pa (official BF page range)",
      heatRecovery: "Опционально, не основной сценарий семейства",
    },
    typicalScenarios: ["Commercial ventilation", "Workshops with simple ventilation profile", "General public buildings"],
  },
  {
    id: "GXH",
    title: "GXH — Heat Recovery Fresh Air Ventilation Unit",
    shortDescription: "Приточно-вытяжная установка с упором на heat recovery / energy recovery.",
    suitableWhen: [
      "Нужна связка fresh air + exhaust",
      "Есть задача по снижению энергопотребления за счёт рекуперации",
      "Приоритет — вентиляция с возвратом тепла/энергии",
    ],
    notSuitableWhen: [
      "Нужны глубокие модульные конфигурации AHU уровня cleanroom",
      "Нужна в первую очередь coil-centric cabinet обработка воздуха",
    ],
    typicalRange: {
      airflow: "~3,000–50,000 m³/h (official GXH page range)",
      staticPressure: "до ~1,000 Pa (typical fan static pressure on official GXH page)",
      heatRecovery: "Ключевая функция семейства",
    },
    typicalScenarios: ["Hotels and malls", "Office fresh-air systems", "Projects with energy-efficiency targets"],
  },
  {
    id: "FG",
    title: "FG — Cabinet Fan Coil / Cabinet Air-side Unit",
    shortDescription: "Cabinet-формат для coil-based охлаждения/нагрева и компактной air-side обработки.",
    suitableWhen: [
      "Нужен cabinet unit с coil-based treatment",
      "Есть ограничение по месту и нужен компактный air-side формат",
      "Нужна управляемая подача/обработка воздуха без AHU-модульности",
    ],
    notSuitableWhen: [
      "Требуется полноразмерная модульная AHU",
      "Нужен акцент на рекуперацию как центральная функция",
    ],
    typicalRange: {
      airflow: "~2,000–36,000 m³/h (official FG page range)",
      staticPressure: "~200–2,000 Pa (official FG page range)",
      heatRecovery: "Обычно не основная функция, фокус на coil treatment",
    },
    typicalScenarios: ["Commercial spaces", "Light industrial process zones", "Retrofits with compact cabinet constraints"],
  },
  {
    id: "ZKW",
    title: "ZKW — Modular Air Handling Unit",
    shortDescription: "Модульная AHU-платформа для сложных air treatment систем, включая cleanroom-oriented решения.",
    suitableWhen: [
      "Нужна modular AHU с несколькими функциональными секциями",
      "Есть чистые помещения / сложные отраслевые требования",
      "Высокие расходы воздуха и индивидуальная конфигурация",
    ],
    notSuitableWhen: ["Нужен только простой box ventilation сценарий", "Нужно максимально компактное cabinet-решение без AHU-модульности"],
    typicalRange: {
      airflow: "до ~200,000 m³/h (official ZKW page claim)",
      staticPressure: "Зависит от конфигурации секций и проекта (official materials are configuration-based)",
      heatRecovery: "Поддерживается через модульную конфигурацию",
      note: "Для ZKW точные pressure/section limits уточняются после ТЗ и секционного состава.",
    },
    typicalScenarios: ["Medicine & healthcare", "Biopharma", "Electronics production", "Large industrial/process AHU"],
  },
];

export const comparisonRows: ComparisonRow[] = [
  {
    metric: "Основное назначение",
    BF: "Базовая вентиляция",
    GXH: "Fresh air + exhaust + heat recovery",
    FG: "Cabinet coil treatment",
    ZKW: "Modular AHU / complex treatment",
  },
  {
    metric: "Airflow range",
    BF: "~2k–50k m³/h",
    GXH: "~3k–50k m³/h",
    FG: "~2k–36k m³/h",
    ZKW: "Up to ~200k m³/h",
  },
  {
    metric: "Static pressure",
    BF: "Up to ~1,000 Pa",
    GXH: "Up to ~1,000 Pa (typical)",
    FG: "~200–2,000 Pa",
    ZKW: "Project-specific",
  },
  {
    metric: "Heat recovery relevance",
    BF: "Optional",
    GXH: "Core strength",
    FG: "Secondary",
    ZKW: "Available via module set",
  },
  {
    metric: "Modularity / section depth",
    BF: "Low",
    GXH: "Medium",
    FG: "Medium",
    ZKW: "High",
  },
  {
    metric: "Cleanroom relevance",
    BF: "Low",
    GXH: "Medium",
    FG: "Medium",
    ZKW: "High",
  },
];

export const industryScenarios = [
  {
    title: "Medicine & Health",
    text: "Обычно рассматривают ZKW при сложной фильтрации и контроле зон; GXH — когда критична энергоэффективная приточно-вытяжная схема.",
  },
  {
    title: "Pharmacy / Biology",
    text: "Для чистых помещений и process air handling чаще нужен ZKW с секционной конфигурацией и инженерным подтверждением каждого этапа обработки.",
  },
  {
    title: "Electronics",
    text: "Высокие требования к стабильности параметров часто смещают выбор к ZKW; для более компактных зон возможен FG в cabinet-формате.",
  },
  {
    title: "Mall / Hotel",
    text: "GXH часто подходит при задаче экономии энергии на fresh-air системах; BF — для более простых вентиляционных задач.",
  },
  {
    title: "Workshop / Factory",
    text: "BF и FG подходят для типовых участков, а при сложной air treatment архитектуре и больших расходах лучше ZKW.",
  },
];

export const faqItems: FaqItem[] = [
  {
    question: "Чем BF отличается от GXH?",
    answer:
      "BF ориентирован на простой box ventilation сценарий, а GXH — на приточно-вытяжную схему с рекуперацией/энергосбережением как основной ценностью.",
  },
  {
    question: "Когда нужен ZKW вместо FG?",
    answer:
      "Если проект требует модульную AHU-архитектуру, много функциональных секций, cleanroom-релевантность или сильно кастомный air treatment, чаще выбирают ZKW.",
  },
  {
    question: "Можно ли сделать точный подбор без полного ТЗ?",
    answer:
      "Предварительную рекомендацию по семейству — да. Точный инженерный подбор выполняется после уточнения режимов, ограничений, секционного состава и требований к автоматике/фильтрации.",
  },
  {
    question: "Какие данные нужны для коммерческого предложения?",
    answer:
      "Минимум: расход воздуха, внешнее статическое давление, температурные режимы, требования к heat recovery/coil, ограничения по месту, отраслевые требования и желаемые сроки поставки.",
  },
];

export const engineeringClarificationChecklist = [
  "Точные design-параметры воздуха (лето/зима, наружный и внутренний режим)",
  "Допустимые падения давления по каждой секции",
  "Класс фильтрации и требования к гигиене/чистым помещениям",
  "Ограничения по габаритам, транспортным секциям и доступу для сервиса",
  "Требования к автоматике, BMS и резервированию",
];
