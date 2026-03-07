import {
  ClientType,
  ConnectionOrientation,
  ConnectionType,
  DeadlineMode,
  DeadlinePreset,
  FileCategory,
  HeaderPosition,
  MediumType,
  OnsiteNeed,
  OperationMode,
  PreferredContact,
  Purpose,
  ReplacementNeed,
  RfqFormState,
  RfqScenario,
  RoutingPreference,
  TaskNeed,
} from "./types";

export const RFQ_CANONICAL_URL = "https://upgradefor.com/wikimarket/hvac/copper-aluminum-heat-exchangers" as const;

export const RFQ_PAGE_ID = "wikimarket-copper-aluminum-heat-exchangers" as const;

export const RFQ_PAGE_VERSION = "rfq-configurator-v1";

export const STORAGE_KEYS = {
  draft: "upgr-cu-al-rfq-draft-v1",
  history: "upgr-cu-al-rfq-history-v1",
} as const;

export const QUICK_ENTRY_CHIPS: Array<{
  id: string;
  label: string;
  scenario: RfqScenario;
  engineerHelp?: boolean;
  highlightConnections?: boolean;
}> = [
  { id: "know-dimensions", label: "Знаю только габариты", scenario: "dimensions" },
  { id: "know-power", label: "Знаю мощность", scenario: "power" },
  { id: "have-files", label: "Есть чертеж / фото", scenario: "quick" },
  { id: "replacement", label: "Ищу замену старому", scenario: "replacement", highlightConnections: true },
  { id: "engineer-help", label: "Нужна помощь инженера", scenario: "quick", engineerHelp: true },
  { id: "oem", label: "OEM / серия", scenario: "oem" },
  {
    id: "analog-no-rework",
    label: "Нужен аналог без переделки установки",
    scenario: "replacement",
    highlightConnections: true,
  },
];

export const SCENARIO_OPTIONS: Array<{ value: RfqScenario; label: string; description: string }> = [
  {
    value: "quick",
    label: "Быстрый запрос",
    description: "Подходит, если у вас только часть параметров или нужна помощь инженера.",
  },
  {
    value: "dimensions",
    label: "По размерам",
    description: "Подбор по габаритам, рядности, трубкам и ламелям.",
  },
  {
    value: "power",
    label: "По мощности / режиму",
    description: "Подбор через тепловую нагрузку, расход воздуха и температурные режимы.",
  },
  {
    value: "replacement",
    label: "Замена существующего",
    description: "Фокус на точном соответствии старому изделию и подключениям.",
  },
  {
    value: "oem",
    label: "OEM / производитель",
    description: "Для серийных поставок, брендирования и специфичных требований.",
  },
  {
    value: "engineering",
    label: "Полное инженерное ТЗ",
    description: "Максимально подробный режим для точного инженерного расчета.",
  },
];

export const TASK_NEED_OPTIONS: Array<{ value: TaskNeed; label: string }> = [
  { value: "new-selection", label: "Новый подбор" },
  { value: "replacement", label: "Замена существующего" },
  { value: "custom", label: "Нестандартное изготовление" },
  { value: "oem-series", label: "OEM / серийное производство" },
];

export const PURPOSE_OPTIONS: Array<{ value: Purpose; label: string }> = [
  { value: "cooling", label: "Охлаждение" },
  { value: "heating", label: "Нагрев" },
  { value: "evaporation", label: "Испарение" },
  { value: "condensation", label: "Конденсация" },
  { value: "universal", label: "Универсальный режим" },
];

export const APPLICATION_CHIPS = [
  "Вентустановка",
  "Чиллер",
  "ККБ",
  "Фанкойл",
  "Испаритель",
  "Конденсатор",
  "Воздухонагреватель",
  "Воздухоохладитель",
  "OEM-оборудование",
  "Замена старого",
  "Промышленная установка",
  "Другое",
];

export const KNOWN_DATA_OPTIONS = [
  "Габариты",
  "Мощность",
  "Температуры / расход",
  "Данные по подключениям",
  "Есть чертеж / фото / шильдик",
  "Нужна помощь инженера",
] as const;

export const MEDIUM_OPTIONS: Array<{ value: MediumType; label: string }> = [
  { value: "freon", label: "Фреон" },
  { value: "water", label: "Вода" },
  { value: "glycol", label: "Гликоль" },
  { value: "oil", label: "Масло" },
  { value: "steam", label: "Пар" },
  { value: "other", label: "Другое" },
];

export const MODE_OPTIONS: Array<{ value: OperationMode; label: string }> = [
  { value: "cold", label: "Холод" },
  { value: "heat", label: "Обогрев" },
  { value: "universal", label: "Универсальный" },
];

export const DEADLINE_MODE_OPTIONS: Array<{ value: DeadlineMode; label: string }> = [
  { value: "preset", label: "Быстрый пресет" },
  { value: "exact_date", label: "Конкретная дата" },
  { value: "days_from_now", label: "Через N дней" },
  { value: "asap", label: "Ближайший возможный" },
];

export const DEADLINE_PRESET_OPTIONS: Array<{ value: DeadlinePreset; label: string; days: number | null }> = [
  { value: "7_days", label: "7 дней", days: 7 },
  { value: "14_days", label: "14 дней", days: 14 },
  { value: "30_days", label: "30 дней", days: 30 },
  { value: "45_plus", label: "45+ дней", days: 45 },
];

export const REPLACEMENT_NEED_OPTIONS: Array<{ value: ReplacementNeed; label: string }> = [
  { value: "full-analog", label: "Да, нужен полный аналог без переделок" },
  { value: "engineering-recalc", label: "Допустим инженерный перерасчет" },
  { value: "adaptive", label: "Допустима адаптация конструкции" },
];

export const PRESERVE_OPTIONS = [
  "Габариты",
  "Посадочные размеры",
  "Межосевые расстояния подключений",
  "Расположение коллекторов",
  "Тип подключения",
  "Мощность",
  "Рядность",
  "Шаг ламелей",
  "Материал",
];

export const OEM_REQUIREMENT_OPTIONS = [
  "Брендирование",
  "Нестандартная маркировка",
  "Нестандартные подключения",
  "Нестандартные материалы",
  "Покрытие",
  "Упаковка / спецификация",
];

export const HEADER_POSITION_OPTIONS: Array<{ value: HeaderPosition; label: string }> = [
  { value: "left", label: "Слева" },
  { value: "right", label: "Справа" },
  { value: "top", label: "Сверху" },
  { value: "bottom", label: "Снизу" },
  { value: "both-sides", label: "С двух сторон" },
  { value: "custom", label: "Нестандартно" },
];

export const CONNECTION_TYPE_OPTIONS: Array<{ value: ConnectionType; label: string }> = [
  { value: "threaded", label: "Резьбовое" },
  { value: "flanged", label: "Фланцевое" },
  { value: "brazed", label: "Под пайку" },
  { value: "other", label: "Другое" },
];

export const CONNECTION_ORIENTATION_OPTIONS: Array<{ value: ConnectionOrientation; label: string }> = [
  { value: "front", label: "Фронтальная" },
  { value: "side", label: "Боковая" },
  { value: "top", label: "Верхняя" },
  { value: "bottom", label: "Нижняя" },
];

export const CLIENT_TYPE_OPTIONS: Array<{ value: ClientType; label: string }> = [
  { value: "engineer", label: "Инженер" },
  { value: "procurement", label: "Закупщик" },
  { value: "oem", label: "OEM" },
  { value: "manufacturer", label: "Производитель" },
  { value: "service", label: "Сервис" },
  { value: "end-customer", label: "Конечный заказчик" },
];

export const PREFERRED_CONTACT_OPTIONS: Array<{ value: PreferredContact; label: string }> = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Телефон" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "telegram", label: "Telegram" },
  { value: "any", label: "Любой удобный" },
];

export const ONSITE_NEED_OPTIONS: Array<{ value: OnsiteNeed; label: string }> = [
  { value: "no", label: "Нет" },
  { value: "consultation", label: "Возможно, нужна консультация" },
  { value: "yes", label: "Да, нужен выезд" },
];

export const ROUTING_PREFERENCE_OPTIONS: Array<{ value: RoutingPreference; label: string; description: string }> = [
  {
    value: "auto",
    label: "Подобрать подходящих производителей автоматически",
    description: "Будет использован автоматический сценарий маршрутизации после отправки.",
  },
  {
    value: "selected",
    label: "Отправить выбранным производителям",
    description: "Вы фиксируете список поставщиков, которым нужно направить RFQ.",
  },
  {
    value: "hold",
    label: "Пока оставить заявку без выбора",
    description: "Заявка сохранится и останется в статусе ожидания маршрутизации.",
  },
];

export const MANUFACTURER_SELECTION = [
  "HeatPower Systems",
  "CuAl Dynamics",
  "ThermoCore OEM",
  "Nordic Coil Works",
];

export const FILE_CATEGORY_OPTIONS: Array<{ value: FileCategory; label: string }> = [
  { value: "drawing", label: "Чертеж" },
  { value: "nameplate", label: "Фото шильдика" },
  { value: "old-coil-photo", label: "Фото старого теплообменника" },
  { value: "pdf-spec", label: "PDF-спецификация" },
  { value: "excel-spec", label: "Excel-спецификация" },
  { value: "installation-photo", label: "Фото места установки" },
  { value: "other", label: "Прочее" },
];

export const STEP_TITLES = [
  "Сценарий задачи",
  "Какие данные у вас есть",
  "Основные параметры",
  "Конструкция, коллекторы, подключения",
  "Файлы и комментарии",
  "Контакты и отправка",
  "Проверка и подтверждение",
] as const;

export const DEFAULT_ESTIMATE_TEXT = {
  disclaimer: "Оценка предварительная. Точную цену и срок подтверждает производитель.",
  precisionHint: "Чем больше параметров вы заполните, тем точнее ориентировочная оценка.",
};

const emptyContact = {
  name: "",
  company: "",
  country: "",
  email: "",
  phone: "",
  whatsapp: "",
  telegram: "",
  preferredContact: "" as const,
  preferredTime: "",
  onsiteNeed: "" as const,
  cityObject: "",
  comment: "",
};

export const INITIAL_RFQ_STATE: RfqFormState = {
  scenario: "quick",
  taskNeed: "",
  purpose: "",
  applicationArea: "",
  knownData: [],
  engineerHelp: false,
  medium: "",
  mode: "",
  deadlineMode: "preset",
  deadlineDate: "",
  deadlineDays: "",
  deadlinePreset: "14_days",
  powerKw: "",
  airflowM3h: "",
  airInC: "",
  airOutC: "",
  mediumInC: "",
  mediumOutC: "",
  workingPressureBar: "",
  pressureDropLimitKpa: "",
  lengthMm: "",
  heightMm: "",
  depthMm: "",
  rows: "",
  tubeDiameterMm: "",
  finPitchMm: "",
  finThicknessMm: "",
  casingThicknessMm: "",
  tubesPerRow: "",
  tubePattern: "",
  quantity: "",
  oldModel: "",
  preserveWhat: [],
  replacementNeed: "",
  oemEquipmentType: "",
  oemSampleOrSeries: "",
  oemPlannedVolume: "",
  oemPurchaseRegularity: "",
  oemProjectType: "",
  oemRequirements: [],
  oemNeedSerialCalc: false,
  oemNeedSupplierAnalog: false,
  materialTube: "",
  materialFin: "",
  headerType: "",
  circuitsCount: "",
  circulationScheme: "",
  mountingExecution: "",
  corrosionRequirement: "",
  temperatureRangeRequirement: "",
  documentsRequirement: "",
  collectorDiameterMm: "",
  collectorsCount: "",
  collectorPosition: "",
  collectorCenterDistanceMm: "",
  edgeToConnectionAxisMm: "",
  collectorProjectionMm: "",
  connectionType: "",
  connectionSize: "",
  connectionOrientation: "",
  keepConnectionLayoutExact: false,
  allowConnectionChanges: false,
  comments: "",
  files: [],
  clientType: "",
  routingPreference: "auto",
  selectedManufacturers: [],
  contact: emptyContact,
  consent: false,
};

export function createInitialState(country = ""): RfqFormState {
  return {
    ...INITIAL_RFQ_STATE,
    contact: {
      ...INITIAL_RFQ_STATE.contact,
      country,
    },
  };
}

export function detectCountryFromLocale(locale: string): string {
  const parts = locale.split("-");
  if (parts.length > 1) return parts[1].toUpperCase();
  return "";
}
