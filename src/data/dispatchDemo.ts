export type DispatchSection =
  | "overview"
  | "cooling"
  | "fanCoils"
  | "ventilation"
  | "itp"
  | "pumps"
  | "heatExchangers"
  | "alarms"
  | "trends"
  | "tickets"
  | "equipment"
  | "ai";

export const dispatchSections: { id: DispatchSection; label: string; badge?: string }[] = [
  { id: "overview", label: "Обзор объекта" },
  { id: "cooling", label: "Холодоснабжение / чиллеры", badge: "LIVE" },
  { id: "fanCoils", label: "Кондиционирование / фанкойлы" },
  { id: "ventilation", label: "Вентиляция" },
  { id: "itp", label: "Теплоснабжение / ИТП" },
  { id: "pumps", label: "Насосные группы" },
  { id: "heatExchangers", label: "Теплообменники" },
  { id: "alarms", label: "Аварии", badge: "4" },
  { id: "trends", label: "Тренды" },
  { id: "equipment", label: "Паспорта оборудования" },
  { id: "tickets", label: "Заявки" },
  { id: "ai", label: "AI-диагностика", badge: "NEW" },
];

export const objectSummary = {
  name: "Asia Park Astana",
  address: "Астана, Казахстан",
  mode: "UPGRADE Dispatch / WinGroup поверх существующей web-based BMS/SCADA",
  scadaHost: "10.50.4.41",
  operator: "Operator",
  updatedAt: "13.05.2026 21:40 UTC",
  area: "TO VERIFY",
  floors: "тех. отметки +11.400 / +12.600 / +13.500",
  systemsOnline: 42,
  systemsTotal: 46,
};

export const kpis = [
  { label: "Системы online", value: "42/46", trend: "+2 за час", tone: "green" },
  { label: "Холодопроизводительность", value: "3.42 МВт", trend: "72% load", tone: "cyan" },
  { label: "Энергопотребление", value: "1.18 МВт", trend: "-6% к базе", tone: "blue" },
  { label: "Активные аварии", value: "3", trend: "1 critical", tone: "red" },
];

export const liveSystems = [
  { name: "Холодоснабжение", status: "degraded", load: 72, note: "DP sensor anomaly" },
  { name: "Вентиляция", status: "online", load: 61, note: "VC-13 / VC-11 камеры active" },
  { name: "Теплообменники", status: "online", load: 48, note: "около 6 узлов / TO VERIFY" },
  { name: "Насосные группы", status: "warning", load: 66, note: "ШУ-1...ШУ-4 / около 10 насосов" },
];

export const trendData = [
  { t: "21:00", kw: 980, temp: 6.4 },
  { t: "21:05", kw: 1040, temp: 6.2 },
  { t: "21:10", kw: 1088, temp: 6.1 },
  { t: "21:15", kw: 1160, temp: 5.9 },
  { t: "21:20", kw: 1124, temp: 6.0 },
  { t: "21:25", kw: 1190, temp: 5.8 },
  { t: "21:30", kw: 1180, temp: 5.9 },
];

export const chillers = [
  { id: "CH-IN-05", model: "Внутренний чиллер 5 / Trane TO VERIFY", status: "RUN", load: 78, supply: "6.1°C", return: "11.8°C", flow: "412 м³/ч" },
  { id: "CH-RTAF", model: "Новый чиллер Trane RTAF125", status: "RUN", load: 74, supply: "6.3°C", return: "11.6°C", flow: "398 м³/ч" },
  { id: "CH-IN-01", model: "Внутренний чиллер 1 / Trane TO VERIFY", status: "STANDBY", load: 0, supply: "—", return: "—", flow: "0 м³/ч" },
  { id: "CH-RTAD2", model: "Чиллер RTAD2 / Trane RTAD115", status: "RUN", load: 63, supply: "6.5°C", return: "12.1°C", flow: "365 м³/ч" },
  { id: "CH-RTAD4", model: "Чиллер RTAD4 / Trane RTAD115", status: "SERVICE", load: 0, supply: "lock", return: "lock", flow: "0 м³/ч" },
];

export const pumpGroups = [
  { name: "ШУ-1", medium: "гликоль", pumps: ["насос 1", "насос 2"], hz: [44, 43] },
  { name: "ШУ-2", medium: "вода", pumps: ["насос 3", "насос 4", "насос 5"], hz: [48, 47, 0] },
  { name: "ШУ-3", medium: "фанкойлы", pumps: ["насос 6", "насос 7", "насос 8"], hz: [41, 40, 0] },
  { name: "ШУ-4", medium: "вентиляция", pumps: ["насос 9", "насос 10"], hz: [46, 45] },
];

export const ventilationUnits = [
  { id: "VC-13-01", mark: "+13.500", location: "венткамера / П2-2, П2-3 / П9 / П10 / В9 / В10", airflow: "TO VERIFY", status: "RUN", co2: 612 },
  { id: "VC-13-02", mark: "+13.500", location: "венткамера / П2-1 / П23 / В23 / П25 / В25 / ВДУ6 / ПДУ-1", airflow: "TO VERIFY", status: "RUN", co2: 590 },
  { id: "VC-13-03", mark: "+12.600", location: "венткамера / П1-3 / П8 / П28 / В1 / В3 / ВДУ21 / ВДУ3", airflow: "TO VERIFY", status: "EVENT", co2: 740 },
  { id: "VC-13-04", mark: "+13.500", location: "офисно-рекреационный блок / B41 / B71 / B19 / B45 / П19 / П29", airflow: "TO VERIFY", status: "RUN", co2: 650 },
  { id: "VC-11-01", mark: "+11.400", location: "кинотеатр / проекционная / охлаждение кинопроекторов", airflow: "TO VERIFY", status: "RUN", co2: 665 },
];

export const alarms = [
  { id: "ALM-6553", severity: "critical", system: "Холодоснабжение", equipment: "DP-SENS-CHW-01", message: "DP = DATA_ERROR", recommendation: "Проверить scaling, Modbus register, sensor range, формулу перепада давления", time: "21:38:11" },
  { id: "ALM-1040", severity: "warning", system: "Насосные группы", equipment: "ШУ-2", message: "Насосная группа удерживает 40 Hz при повышенном ΔT", recommendation: "Проверить уставку VFD и балансировку ветки фанкойлов", time: "21:31:08" },
  { id: "EVT-VC13", severity: "event", system: "Вентиляция", equipment: "VC-13-03", message: "Событие: переход заслонки в ручной режим", recommendation: "Сверить локальный щит автоматики и команду диспетчера", time: "21:26:44" },
];

export const equipmentPassport = {
  id: "DP-SENS-CHW-01",
  model: "Differential pressure transmitter / TO VERIFY",
  location: "Asia Park Astana / Холодоснабжение / контур насосной группы",
  status: "CRITICAL / value out of physical range",
  tags: ["BMS.10.50.4.41", "SCADA.CHW.DP_01.PV", "AI.ANOMALY.DP_SCALE", "BMS.ALARM.6553"],
  documents: ["SCADA/web-HMI 10.50.4.41", "Раздел Asia Park Astana / Холодоснабжение", "Modbus/BACnet map — TO VERIFY"],
  alarmHistory: ["13.05.2026 21:38 — DP DATA_ERROR, raw tag quarantined", "12.05.2026 18:04 — DP 0.0 bar 12 sec", "03.05.2026 09:12 — signal frozen"],
  serviceHistory: ["20.04.2026 — визуальный осмотр, замечаний нет", "14.03.2026 — калибровка нуля", "28.01.2026 — замена импульсной трубки"],
};

export const aiInsights = [
  "Значение DP помечено как DATA_ERROR: raw tag вышел за диапазон 0–16 bar. Вероятность ошибки scaling/register: 91%.",
  "Профиль нагрузки чиллеров Trane нормальный, но насосная группа удерживается на 40 Hz при росте ΔT.",
  "VC-13-03 на отметке +12.600 создала event без влияния на comfort KPI, требуется подтверждение ручного режима.",
];

export type DispatchTrendPeriod = "24h" | "7d" | "30d";

export type DispatchTrendKey = "temperature" | "pressure" | "flow" | "energy";

export type EquipmentStatus = "В работе" | "Предупреждение" | "Авария" | "TO VERIFY" | "Demo";

export type DataQualityStatus = "VALID" | "DATA_ERROR";
export type AlarmSeverity = "critical" | "warning" | "info";
export type AlarmSlaStatus = "due_soon" | "on_track" | "monitoring";

export type DispatchTrendPoint = {
  label: string;
  value: number | null;
  quality?: DataQualityStatus;
  qualityMessage?: string;
};

export type DispatchTrendSeriesItem = {
  key: DispatchTrendKey;
  label: string;
  unit: string;
  color: string;
  periods: Record<DispatchTrendPeriod, DispatchTrendPoint[]>;
};

export type DispatchMetric = {
  label: string;
  value: string;
  state: string;
  trend: string;
  quality?: DataQualityStatus;
};

export type DispatchAlarmEvent = {
  id: string;
  title: string;
  equipmentId: string;
  severity: AlarmSeverity;
  time: string;
  description: string;
  sla: {
    label: string;
    target: string;
    status: AlarmSlaStatus;
  };
  quality?: DataQualityStatus;
};

export type DispatchAiInsight = {
  id: string;
  category: "data-quality" | "predictive-maintenance" | "energy-optimization" | "operational-risk";
  title: string;
  value: string;
  description: string;
  equipmentId?: string;
};

export type ServiceHistoryItem = {
  date: string;
  title: string;
  result: string;
};

export type EquipmentDocument = {
  title: string;
  type: string;
};

export type DispatchSectionDetail = {
  id: DispatchSection;
  nodeId: string;
  description: string;
  equipmentCount: string;
  activeAlarms: string;
  keyMetrics: Array<{ label: string; value: string }>;
  relatedNodeIds: string[];
  trendKey: DispatchTrendKey;
  relatedAlarmIds: string[];
  lastEvent: string;
};

export type DispatchEquipmentNode = {
  id: string;
  label: string;
  shortLabel: string;
  countLabel: string;
  type: string;
  trendKey: DispatchTrendKey;
  status: EquipmentStatus;
  model: string;
  serial: string;
  inventoryNumber: string;
  location: string;
  manufacturer: string;
  year: string;
  onlineParams: Array<{ label: string; value: string; quality?: DataQualityStatus }>;
  linkedSystems: string[];
  scadaTags: string[];
  serviceNote: string;
  serviceHistory: ServiceHistoryItem[];
  documents: EquipmentDocument[];
  aiRecommendations: string[];
  relatedAlarmIds: string[];
  relatedTrendKeys: DispatchTrendKey[];
  visualTone?: "default" | "ahu" | "anomaly";
  x: number;
  y: number;
};

const makePoints = (labels: string[], values: number[]): DispatchTrendPoint[] =>
  labels.map((label, index) => ({ label, value: values[index] ?? 0 }));

const pressureRange = {
  min: 0,
  max: 16,
};

export function getPressureQuality(value: number): DataQualityStatus {
  return value < pressureRange.min || value > pressureRange.max ? "DATA_ERROR" : "VALID";
}

export function normalizePressurePoint(label: string, value: number): DispatchTrendPoint {
  const quality = getPressureQuality(value);

  if (quality === "DATA_ERROR") {
    return {
      label,
      value: null,
      quality,
      qualityMessage: "DATA_ERROR · вне диапазона 0–16 bar · raw tag quarantined",
    };
  }

  return {
    label,
    value,
    quality,
  };
}

const makePressurePoints = (labels: string[], values: number[]): DispatchTrendPoint[] =>
  labels.map((label, index) => normalizePressurePoint(label, values[index] ?? 0));

const dayLabels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"];
const weekLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const monthLabels = ["1", "5", "10", "15", "20", "25", "30"];

export const trendSeries: DispatchTrendSeriesItem[] = [
  {
    key: "temperature",
    label: "Температура",
    unit: "°C",
    color: "#fb923c",
    periods: {
      "24h": makePoints(dayLabels, [21.1, 21.4, 22.2, 23.1, 22.4, 21.9, 21.4]),
      "7d": makePoints(weekLabels, [21.2, 21.8, 22.4, 22.1, 23.0, 22.3, 21.6]),
      "30d": makePoints(monthLabels, [20.8, 21.3, 21.9, 23.4, 22.8, 22.1, 21.4]),
    },
  },
  {
    key: "pressure",
    label: "Давление",
    unit: "бар",
    color: "#38bdf8",
    periods: {
      "24h": makePressurePoints(dayLabels, [2.0, 2.1, 2.2, 2.1, 6553.3, 6553.5, 2.1]),
      "7d": makePressurePoints(weekLabels, [2.0, 2.1, 2.2, 2.3, 6553.3, 2.2, 2.1]),
      "30d": makePressurePoints(monthLabels, [1.9, 2.1, 2.2, 2.4, 6553.5, 2.2, 2.1]),
    },
  },
  {
    key: "flow",
    label: "Расход",
    unit: "м3/ч",
    color: "#22c55e",
    periods: {
      "24h": makePoints(dayLabels, [43.8, 44.9, 46.2, 45.6, 47.1, 46.3, 45.6]),
      "7d": makePoints(weekLabels, [42.4, 44.1, 45.8, 46.4, 47.2, 46.0, 45.6]),
      "30d": makePoints(monthLabels, [41.2, 43.6, 44.8, 46.9, 48.1, 46.4, 45.6]),
    },
  },
  {
    key: "energy",
    label: "Энергия",
    unit: "кВт·ч",
    color: "#67e8f9",
    periods: {
      "24h": makePoints(dayLabels, [410, 428, 455, 472, 461, 439, 421]),
      "7d": makePoints(weekLabels, [398, 424, 447, 463, 481, 452, 430]),
      "30d": makePoints(monthLabels, [386, 408, 431, 469, 492, 456, 419]),
    },
  },
];

const commonServiceHistory: ServiceHistoryItem[] = [
  { date: "2026-05-12", title: "Плановый обход", result: "Замечаний нет, режим read-only" },
  { date: "2026-04-22", title: "Проверка датчиков", result: "2 точки требуют верификации" },
  { date: "2026-03-29", title: "Сервисный осмотр", result: "Рекомендована чистка фильтров" },
];

const commonDocuments: EquipmentDocument[] = [
  { title: "Паспорт оборудования — TO VERIFY", type: "PDF" },
  { title: "Исполнительная схема — TO VERIFY", type: "PDF" },
  { title: "Сервисный регламент — TO VERIFY", type: "PDF" },
];

export const dispatchEquipmentNodes: DispatchEquipmentNode[] = [
  {
    id: "ventilation-vc13",
    label: "Вентиляция — VC-13 / VC-11",
    shortLabel: "AHU VC-13/VC-11",
    countLabel: "+11.400 / +12.600 / +13.500",
    type: "Приточно-вытяжные установки и вентиляционные камеры",
    trendKey: "flow",
    status: "В работе",
    model: "VC-13-01...04 / VC-11-01",
    serial: "VENT-ASIA-PARK-TO-VERIFY",
    inventoryNumber: "INV-VNT-TO-VERIFY",
    location: "Верхние технические отметки и кинотеатр",
    manufacturer: "REMAK подтверждён минимум по одной установке / остальные TO VERIFY",
    year: "TO VERIFY",
    onlineParams: [
      { label: "VC-13-01", value: "П2-2 / П2-3 / П9 / П10 / В9 / В10" },
      { label: "VC-13-03", value: "П1-3 / П8 / П28 / В1 / В3 / ВДУ21 / ВДУ3" },
      { label: "VC-11-01", value: "кинотеатр / охлаждение кинопроекторов" },
      { label: "CO2 demo", value: "590-740 ppm" },
    ],
    linkedSystems: ["Вентиляция", "Холодоснабжение", "Фанкойлы", "BMS/SCADA"],
    scadaTags: ["SCADA.VC13.STATUS", "SCADA.VC13.AIRFLOW.TO_VERIFY", "SCADA.VC11.STATUS"],
    serviceNote: "Проверить ручной режим VC-13-03, локальный щит автоматики и перепад на фильтрах при следующем обходе.",
    serviceHistory: commonServiceHistory,
    documents: commonDocuments,
    aiRecommendations: [
      "Проверить перепад давления на фильтрах VC-13 перед следующим регламентом.",
      "Сохранить текущий режим, отклонений по расходу не выявлено.",
      "Команды вентиляции оставить read-only до аудита тегов, ролей доступа и журнала действий.",
    ],
    relatedAlarmIds: ["alarm-ventilation-manual"],
    relatedTrendKeys: ["temperature", "flow"],
    visualTone: "ahu",
    x: 22,
    y: 25,
  },
  {
    id: "chiller-ch1",
    label: "Чиллеры Trane — 5 позиций",
    shortLabel: "Чиллеры Trane",
    countLabel: "5 позиций",
    type: "Чиллерная группа холодоснабжения",
    trendKey: "energy",
    status: "В работе",
    model: "Trane RTAF125 / RTAD115 / Adaptive Control / Helirotor",
    serial: "TRANE-ASIA-PARK-TO-VERIFY",
    inventoryNumber: "INV-CH-0001",
    location: "Asia Park Astana / раздел Холодоснабжение",
    manufacturer: "Trane",
    year: "TO VERIFY",
    onlineParams: [
      { label: "COP/EER demo", value: "4.18" },
      { label: "Температура подачи", value: "7.2 °C" },
      { label: "Температура обратки", value: "12.8 °C" },
      { label: "Наработка", value: "18 420 ч" },
    ],
    linkedSystems: ["Холодоснабжение", "Насосные группы", "BMS/SCADA", "Тренды энергии"],
    scadaTags: ["SCADA.CHW.CHILLER.STATUS", "SCADA.CHW.SUPPLY_TEMP", "SCADA.CHW.RETURN_TEMP"],
    serviceNote: "CH-1 ожидает demo-заявку на плановое сервисное окно.",
    serviceHistory: [
      { date: "2026-05-17", title: "Плановое обслуживание чиллерной позиции", result: "Ожидает заявки" },
      ...commonServiceHistory,
    ],
    documents: commonDocuments,
    aiRecommendations: [
      "Запланировать ТО CH-1 в ближайшее окно низкой нагрузки.",
      "Сравнить энергопотребление RTAF / RTAD и внутренних чиллеров, есть потенциал балансировки.",
      "Для подбора аналога нужна верификация модели и серийного номера.",
    ],
    relatedAlarmIds: ["alarm-chiller-service"],
    relatedTrendKeys: ["temperature", "energy"],
    x: 76,
    y: 31,
  },
  {
    id: "pump-shu2",
    label: "Насосные группы — ШУ-1...ШУ-4",
    shortLabel: "ШУ-1...ШУ-4",
    countLabel: "около 10 насосов",
    type: "Насосные группы холодоснабжения",
    trendKey: "pressure",
    status: "Авария",
    model: "Насосные группы холодоснабжения / TO VERIFY",
    serial: "SHU-2-DEMO-6553",
    inventoryNumber: "INV-PMP-0010",
    location: "Asia Park Astana / Холодоснабжение / ШУ-1...ШУ-4",
    manufacturer: "TO VERIFY",
    year: "TO VERIFY",
    onlineParams: [
      { label: "Давление", value: "DATA_ERROR · вне диапазона 0–16 bar", quality: "DATA_ERROR" },
      { label: "Расход", value: "45.6 м3/ч" },
      { label: "Вибрация", value: "3.2 мм/с" },
    ],
    linkedSystems: ["Холодоснабжение", "Гликоль", "Вода", "Фанкойлы", "Вентиляция"],
    scadaTags: ["SCADA.CHW.DP_01.PV", "SCADA.CHW.PUMP.SHU2.STATUS", "BMS.ALARM.6553"],
    serviceNote: "Удалённый сброс заблокирован; сначала нужна проверка scaling/register и единиц измерения.",
    serviceHistory: commonServiceHistory,
    documents: commonDocuments,
    aiRecommendations: [
      "DP DATA_ERROR похож на ошибку шкалы или historian tag mapping.",
      "Проверить датчик давления на ШУ-2, единицы измерения и привязку Modbus/BACnet тега.",
      "До подтверждения данных не выполнять удаленный сброс аварии.",
    ],
    relatedAlarmIds: ["alarm-pump-pressure"],
    relatedTrendKeys: ["pressure", "flow"],
    visualTone: "anomaly",
    x: 26,
    y: 72,
  },
  {
    id: "itp-demo",
    label: "Теплообменные узлы — около 6",
    shortLabel: "Теплообменники",
    countLabel: "около 6 узлов",
    type: "Теплообменные узлы инженерных контуров",
    trendKey: "temperature",
    status: "TO VERIFY",
    model: "Теплообменные узлы холодоснабжения / TO VERIFY",
    serial: "TO VERIFY",
    inventoryNumber: "INV-ITP-DEMO",
    location: "Asia Park Astana / контуры гликоль, вода, фанкойлы, вентиляция",
    manufacturer: "TO VERIFY",
    year: "TO VERIFY",
    onlineParams: [
      { label: "Подача", value: "68.2 °C" },
      { label: "Обратка", value: "54.7 °C" },
      { label: "Клапан", value: "41%" },
    ],
    linkedSystems: ["Теплоснабжение / ИТП", "Холодоснабжение", "Фанкойлы", "Вентиляция"],
    scadaTags: ["SCADA.HX.SUPPLY_TEMP.TO_VERIFY", "SCADA.HX.RETURN_TEMP.TO_VERIFY"],
    serviceNote: "Нужна сверка фактической обвязки теплообменников с исполнительной схемой.",
    serviceHistory: commonServiceHistory,
    documents: commonDocuments,
    aiRecommendations: [
      "Нужна инвентаризация теплообменных узлов и сверка схемы с фактической обвязкой.",
      "Проверить превышение температуры обратки на соседнем контуре.",
    ],
    relatedAlarmIds: ["alarm-return-temp"],
    relatedTrendKeys: ["temperature"],
    x: 70,
    y: 75,
  },
  {
    id: "automation-cabinets",
    label: "Существующая web-based BMS/SCADA",
    shortLabel: "BMS/SCADA",
    countLabel: "10.50.4.41 / Operator",
    type: "Операционное ядро диспетчеризации",
    trendKey: "energy",
    status: "В работе",
    model: "web-HMI / SCADA operational core",
    serial: "10.50.4.41",
    inventoryNumber: "INV-BMS-0028",
    location: "Asia Park Astana / Холодоснабжение",
    manufacturer: "TO VERIFY",
    year: "TO VERIFY",
    onlineParams: [
      { label: "Связь", value: "Online / simulated gateway" },
      { label: "Контроллеры", value: "28/28" },
      { label: "Ошибки сети", value: "0 активных" },
    ],
    linkedSystems: ["Холодоснабжение", "Вентиляция", "Насосные группы", "Паспорта оборудования"],
    scadaTags: ["BMS.10.50.4.41", "SCADA.WEB_HMI.OPERATOR", "DISPATCH.READ_ONLY.MODE"],
    serviceNote: "Сохранить read-only режим до аудита тегов, ролей доступа и журнала действий.",
    serviceHistory: commonServiceHistory,
    documents: commonDocuments,
    aiRecommendations: [
      "Сохранить read-only режим до аудита тегов и ролей доступа.",
      "Подготовить карту шкафов для паспортизации исполнительных механизмов.",
    ],
    relatedAlarmIds: [],
    relatedTrendKeys: ["energy"],
    x: 50,
    y: 17,
  },
  {
    id: "sensors",
    label: "Датчики — 152 устройства",
    shortLabel: "Датчики",
    countLabel: "152 устройства",
    type: "Полевые датчики и качество данных",
    trendKey: "pressure",
    status: "Предупреждение",
    model: "BMS sensors pack",
    serial: "SNS-152-DEMO",
    inventoryNumber: "INV-SNS-0152",
    location: "Все зоны объекта",
    manufacturer: "TO VERIFY",
    year: "2020-2024",
    onlineParams: [
      { label: "Online", value: "148/152" },
      { label: "TO VERIFY", value: "4 устройства" },
      { label: "Anomaly", value: "2 pressure tags" },
    ],
    linkedSystems: ["BMS/SCADA", "Аварии", "AI-диагностика", "Тренды"],
    scadaTags: ["SCADA.SENSOR.ONLINE_COUNT", "SCADA.CHW.DP_01.PV", "AI.ANOMALY.DP_SCALE"],
    serviceNote: "Сверить pressure tags с historian и отметить неподтверждённые точки как TO VERIFY.",
    serviceHistory: commonServiceHistory,
    documents: commonDocuments,
    aiRecommendations: [
      "Сверить датчики давления с DATA_ERROR и проверить raw tag quarantine.",
      "Отметить 4 устройства как TO VERIFY в реестре паспортизации.",
    ],
    relatedAlarmIds: ["alarm-pump-pressure"],
    relatedTrendKeys: ["pressure", "temperature"],
    visualTone: "anomaly",
    x: 84,
    y: 58,
  },
  {
    id: "valves-drives",
    label: "Клапаны и приводы — 98 устройств",
    shortLabel: "Клапаны и приводы",
    countLabel: "98 устройств",
    type: "Исполнительные механизмы",
    trendKey: "flow",
    status: "В работе",
    model: "Valve actuator demo",
    serial: "DRV-098-DEMO",
    inventoryNumber: "INV-DRV-0098",
    location: "теплообменные узлы, вентиляция, холодоснабжение",
    manufacturer: "TO VERIFY",
    year: "TO VERIFY",
    onlineParams: [
      { label: "Открытие ср.", value: "46%" },
      { label: "Ручной режим", value: "0" },
      { label: "Команды", value: "Read-only" },
    ],
    linkedSystems: ["Теплообменники", "Фанкойлы", "Вентиляция", "BMS/SCADA"],
    scadaTags: ["SCADA.VALVE.AVG_POSITION", "SCADA.DRIVE.MANUAL_MODE", "DISPATCH.CONTROL_LOCKED"],
    serviceNote: "Команды управления доступны только как read-only demo controls.",
    serviceHistory: commonServiceHistory,
    documents: commonDocuments,
    aiRecommendations: [
      "Проверить исполнительные механизмы на контурах с отклонением расхода.",
      "Команды управления оставить заблокированными в demo mode.",
    ],
    relatedAlarmIds: [],
    relatedTrendKeys: ["flow"],
    x: 14,
    y: 50,
  },
  {
    id: "cooling-circuits",
    label: "Холодоснабжение — 4 контура",
    shortLabel: "Холодоснабжение",
    countLabel: "гликоль / вода / фанкойлы / вентиляция",
    type: "Контуры холодоснабжения",
    trendKey: "temperature",
    status: "Предупреждение",
    model: "Гликоль / вода / фанкойлы / вентиляция",
    serial: "CHW-ASIA-PARK-DEMO",
    inventoryNumber: "INV-CHW-0002",
    location: "Холодильный центр / торговые галереи",
    manufacturer: "TO VERIFY",
    year: "2020",
    onlineParams: [
      { label: "Гликоль", value: "7.2 / 12.8 °C demo" },
      { label: "Вода", value: "8.1 / 13.6 °C demo" },
      { label: "Delta T", value: "5.6 K" },
    ],
    linkedSystems: ["Чиллеры Trane", "ШУ-1...ШУ-4", "Фанкойлы", "Вентиляция"],
    scadaTags: ["SCADA.CHW.GLYCOL.SUPPLY", "SCADA.CHW.WATER.RETURN", "SCADA.CHW.DELTA_T"],
    serviceNote: "Контур требует анализа роста обратки и распределения нагрузки между потребителями.",
    serviceHistory: commonServiceHistory,
    documents: commonDocuments,
    aiRecommendations: [
      "Проанализировать температуру обратки и распределение нагрузки между двумя контурами.",
      "Рекомендовано открыть тренды энергии и температуры за 7 дней.",
    ],
    relatedAlarmIds: ["alarm-return-temp", "alarm-chiller-service"],
    relatedTrendKeys: ["temperature", "energy"],
    x: 44,
    y: 86,
  },
  {
    id: "fan-coils",
    label: "Кондиционирование / фанкойлы",
    shortLabel: "Фанкойлы",
    countLabel: "контур торговых зон",
    type: "Фанкойлы и контур кондиционирования",
    trendKey: "temperature",
    status: "В работе",
    model: "Fan coil loop / TO VERIFY",
    serial: "FC-ASIA-PARK-TO-VERIFY",
    inventoryNumber: "INV-FC-DEMO",
    location: "Asia Park Astana / торговые галереи и арендуемые зоны",
    manufacturer: "TO VERIFY",
    year: "TO VERIFY",
    onlineParams: [
      { label: "Подача контура", value: "8.1 °C demo" },
      { label: "Обратка контура", value: "13.6 °C demo" },
      { label: "Среднее открытие клапанов", value: "46%" },
      { label: "Comfort zones", value: "TO VERIFY" },
    ],
    linkedSystems: ["Холодоснабжение", "Насосные группы", "Клапаны и приводы", "BMS/SCADA"],
    scadaTags: ["SCADA.FC.SUPPLY_TEMP.TO_VERIFY", "SCADA.FC.RETURN_TEMP.TO_VERIFY", "SCADA.FC.VALVE_AVG"],
    serviceNote: "Нужна паспортизация фанкойлов по арендуемым зонам и сверка клапанов с BMS/SCADA.",
    serviceHistory: commonServiceHistory,
    documents: commonDocuments,
    aiRecommendations: [
      "Сопоставить рост обратки с открытием клапанов фанкойлов.",
      "Проверить балансировку веток перед изменением уставок.",
    ],
    relatedAlarmIds: ["alarm-return-temp"],
    relatedTrendKeys: ["temperature", "flow"],
    x: 56,
    y: 64,
  },
  {
    id: "heating-itp",
    label: "Теплоснабжение / ИТП",
    shortLabel: "ИТП",
    countLabel: "тепловой ввод / TO VERIFY",
    type: "ИТП и тепловой контур",
    trendKey: "temperature",
    status: "TO VERIFY",
    model: "ИТП Asia Park Astana / TO VERIFY",
    serial: "ITP-ASIA-PARK-TO-VERIFY",
    inventoryNumber: "INV-ITP-TO-VERIFY",
    location: "Asia Park Astana / техническая зона ИТП",
    manufacturer: "TO VERIFY",
    year: "TO VERIFY",
    onlineParams: [
      { label: "Подача ИТП", value: "68.2 °C demo" },
      { label: "Обратка ИТП", value: "54.7 °C demo" },
      { label: "Клапан регулирования", value: "41%" },
      { label: "Узел учёта", value: "TO VERIFY" },
    ],
    linkedSystems: ["Теплообменники", "BMS/SCADA", "Клапаны и приводы"],
    scadaTags: ["SCADA.ITP.SUPPLY_TEMP.TO_VERIFY", "SCADA.ITP.RETURN_TEMP.TO_VERIFY"],
    serviceNote: "Данные ИТП показаны как demo/TO VERIFY до сверки узла учета и схемы.",
    serviceHistory: commonServiceHistory,
    documents: commonDocuments,
    aiRecommendations: [
      "Сверить показания ИТП с BMS/SCADA historian перед расчётом KPI.",
      "Не менять уставки из demo-режима; управление заблокировано.",
    ],
    relatedAlarmIds: [],
    relatedTrendKeys: ["temperature", "energy"],
    x: 64,
    y: 47,
  },
];

export const dispatchSectionDetails: DispatchSectionDetail[] = [
  {
    id: "overview",
    nodeId: "automation-cabinets",
    description: "Операционный обзор Asia Park Astana поверх существующей web-based BMS/SCADA.",
    equipmentCount: "42/46 систем online",
    activeAlarms: "4 события в контуре эксплуатации",
    keyMetrics: [
      { label: "Связь", value: "Online" },
      { label: "SCADA host", value: "10.50.4.41" },
      { label: "Режим", value: "Read-only demo" },
    ],
    relatedNodeIds: ["automation-cabinets", "cooling-circuits", "ventilation-vc13"],
    trendKey: "energy",
    relatedAlarmIds: [],
    lastEvent: "BMS/SCADA gateway online; команды управления заблокированы.",
  },
  {
    id: "cooling",
    nodeId: "chiller-ch1",
    description: "Чиллеры Trane RTAF / RTAD и внутренние позиции холодоснабжения.",
    equipmentCount: "5 чиллерных позиций",
    activeAlarms: "1 сервисное событие",
    keyMetrics: [
      { label: "Load", value: "63-78%" },
      { label: "Supply", value: "6.1-6.5 °C" },
      { label: "Flow", value: "365-412 м3/ч" },
    ],
    relatedNodeIds: ["chiller-ch1", "cooling-circuits", "pump-shu2"],
    trendKey: "energy",
    relatedAlarmIds: ["alarm-chiller-service", "alarm-return-temp"],
    lastEvent: "CH-1 ожидает demo-заявку на сервисное окно.",
  },
  {
    id: "fanCoils",
    nodeId: "fan-coils",
    description: "Контур кондиционирования фанкойлов с привязкой к воде, клапанам и потребителям.",
    equipmentCount: "точный реестр TO VERIFY",
    activeAlarms: "1 связанное предупреждение",
    keyMetrics: [
      { label: "Supply", value: "8.1 °C" },
      { label: "Return", value: "13.6 °C" },
      { label: "Valve avg", value: "46%" },
    ],
    relatedNodeIds: ["fan-coils", "cooling-circuits", "valves-drives"],
    trendKey: "temperature",
    relatedAlarmIds: ["alarm-return-temp"],
    lastEvent: "Фанкойлы связаны с ростом обратки; требуется сверка зон и клапанов.",
  },
  {
    id: "ventilation",
    nodeId: "ventilation-vc13",
    description: "Венткамеры VC-13 / VC-11 выделены как отдельный AHU-узел: технические отметки, кинотеатр и локальные щиты.",
    equipmentCount: "5 вентиляционных групп",
    activeAlarms: "1 warning по VC-13-03",
    keyMetrics: [
      { label: "CO2", value: "590-740 ppm" },
      { label: "Airflow", value: "TO VERIFY" },
      { label: "Status", value: "RUN / EVENT" },
    ],
    relatedNodeIds: ["ventilation-vc13", "cooling-circuits", "valves-drives"],
    trendKey: "flow",
    relatedAlarmIds: ["alarm-ventilation-manual"],
    lastEvent: "VC-13-03: проверить ручной режим заслонки и локальный щит автоматики.",
  },
  {
    id: "itp",
    nodeId: "heating-itp",
    description: "Теплоснабжение и ИТП как отдельный инженерный модуль с TO VERIFY паспортом.",
    equipmentCount: "1 тепловой ввод / TO VERIFY",
    activeAlarms: "активных аварий нет",
    keyMetrics: [
      { label: "Supply", value: "68.2 °C" },
      { label: "Return", value: "54.7 °C" },
      { label: "Valve", value: "41%" },
    ],
    relatedNodeIds: ["heating-itp", "itp-demo", "valves-drives"],
    trendKey: "temperature",
    relatedAlarmIds: [],
    lastEvent: "ИТП доступен как demo module; требуется сверка узла учета и схемы.",
  },
  {
    id: "pumps",
    nodeId: "pump-shu2",
    description: "ШУ-1...ШУ-4: гликоль, вода, фанкойлы и вентиляция.",
    equipmentCount: "около 10 насосов",
    activeAlarms: "1 critical DATA_ERROR",
    keyMetrics: [
      { label: "DP", value: "DATA_ERROR" },
      { label: "Flow", value: "45.6 м3/ч" },
      { label: "Vibration", value: "3.2 мм/с" },
    ],
    relatedNodeIds: ["pump-shu2", "cooling-circuits", "fan-coils"],
    trendKey: "pressure",
    relatedAlarmIds: ["alarm-pump-pressure"],
    lastEvent: "DP DATA_ERROR: проверить scaling/register и диапазон 0–16 bar.",
  },
  {
    id: "heatExchangers",
    nodeId: "itp-demo",
    description: "Теплообменники по контурам гликоль, вода, фанкойлы и вентиляция.",
    equipmentCount: "около 6 узлов",
    activeAlarms: "1 связанное предупреждение",
    keyMetrics: [
      { label: "Supply", value: "68.2 °C" },
      { label: "Return", value: "54.7 °C" },
      { label: "Valve", value: "41%" },
    ],
    relatedNodeIds: ["itp-demo", "heating-itp", "valves-drives"],
    trendKey: "temperature",
    relatedAlarmIds: ["alarm-return-temp"],
    lastEvent: "Нужна инвентаризация узлов и сверка фактической обвязки.",
  },
  {
    id: "alarms",
    nodeId: "pump-shu2",
    description: "Контекст аварий с приоритетом data-quality события DP DATA_ERROR.",
    equipmentCount: "4 активных события",
    activeAlarms: "1 Critical / 2 Warning / 1 Info",
    keyMetrics: [
      { label: "Critical", value: "1" },
      { label: "Warning", value: "2" },
      { label: "Info", value: "1" },
    ],
    relatedNodeIds: ["pump-shu2", "cooling-circuits", "ventilation-vc13", "chiller-ch1"],
    trendKey: "pressure",
    relatedAlarmIds: ["alarm-pump-pressure", "alarm-return-temp", "alarm-ventilation-manual", "alarm-chiller-service"],
    lastEvent: "Открыт аварийный контекст; все действия остаются read-only.",
  },
  {
    id: "trends",
    nodeId: "sensors",
    description: "Тренды historian demo: температура, давление, расход и энергия.",
    equipmentCount: "4 трендовых метрики",
    activeAlarms: "аномалия давления видна на графике",
    keyMetrics: [
      { label: "Pressure", value: "DATA_ERROR" },
      { label: "Flow", value: "45.6 м3/ч" },
      { label: "Energy", value: "421 кВт·ч" },
    ],
    relatedNodeIds: ["sensors", "pump-shu2", "automation-cabinets"],
    trendKey: "pressure",
    relatedAlarmIds: ["alarm-pump-pressure"],
    lastEvent: "Pressure trend содержит физически невозможный пик и помечен как data-quality issue.",
  },
  {
    id: "equipment",
    nodeId: "sensors",
    description: "Реестр паспортов оборудования с TO VERIFY документами и SCADA/BMS тегами.",
    equipmentCount: "152 датчика + инженерные узлы",
    activeAlarms: "1 связанное data-quality событие",
    keyMetrics: [
      { label: "Online", value: "148/152" },
      { label: "TO VERIFY", value: "4" },
      { label: "Docs", value: "TO VERIFY" },
    ],
    relatedNodeIds: ["sensors", "automation-cabinets", "valves-drives"],
    trendKey: "pressure",
    relatedAlarmIds: ["alarm-pump-pressure"],
    lastEvent: "Открыт паспортный контекст; документы и часть тегов требуют проверки.",
  },
  {
    id: "tickets",
    nodeId: "chiller-ch1",
    description: "Demo-заявки для сервисных окон и эксплуатационных действий без внешней отправки.",
    equipmentCount: "1 demo-заявка готова",
    activeAlarms: "1 сервисное событие",
    keyMetrics: [
      { label: "Queue", value: "Demo only" },
      { label: "Target", value: "CH-1" },
      { label: "External send", value: "Blocked" },
    ],
    relatedNodeIds: ["chiller-ch1", "pump-shu2", "automation-cabinets"],
    trendKey: "energy",
    relatedAlarmIds: ["alarm-chiller-service"],
    lastEvent: "Заявки формируются локально и не отправляются во внешнюю систему.",
  },
  {
    id: "ai",
    nodeId: "pump-shu2",
    description: "AI-диагностика demo объясняет DP anomaly и рекомендует проверку тегов.",
    equipmentCount: "4 AI insights",
    activeAlarms: "1 critical data-quality insight",
    keyMetrics: [
      { label: "Confidence", value: "91%" },
      { label: "Cause", value: "scaling/register" },
      { label: "Action", value: "verify first" },
    ],
    relatedNodeIds: ["pump-shu2", "sensors", "automation-cabinets"],
    trendKey: "pressure",
    relatedAlarmIds: ["alarm-pump-pressure"],
    lastEvent: "AI помечает DP DATA_ERROR как вероятную ошибку данных, а не гидравлическую аварию.",
  },
];

export const realtimeMetrics: DispatchMetric[] = [
  { label: "Температура", value: "21.4 °C", state: "Норма", trend: "+0.2 °C" },
  { label: "Давление", value: "DATA_ERROR", state: "Ошибка данных", trend: "range 0–16 bar", quality: "DATA_ERROR" },
  { label: "Расход", value: "45.6 м3/ч", state: "Норма", trend: "+1.1%" },
];

export const alarmEvents: DispatchAlarmEvent[] = [
  {
    id: "alarm-pump-pressure",
    title: "DP DATA_ERROR на ШУ-2",
    equipmentId: "pump-shu2",
    severity: "critical",
    time: "10:42",
    description: "Raw DP tag вышел за диапазон 0–16 bar, требуется верификация scaling/register.",
    sla: {
      label: "18 мин",
      target: "Critical SLA 30 мин",
      status: "due_soon",
    },
    quality: "DATA_ERROR",
  },
  {
    id: "alarm-return-temp",
    title: "Превышение температуры обратки",
    equipmentId: "cooling-circuits",
    severity: "warning",
    time: "10:18",
    description: "Контур холодоснабжения показывает рост обратки.",
    sla: {
      label: "42 мин",
      target: "Warning SLA 2 часа",
      status: "on_track",
    },
  },
  {
    id: "alarm-ventilation-manual",
    title: "VC-13-03: заслонка в ручном режиме",
    equipmentId: "ventilation-vc13",
    severity: "warning",
    time: "10:05",
    description: "Событие вентиляции: требуется сверка локального щита, команды оператора и BMS/SCADA тега.",
    sla: {
      label: "55 мин",
      target: "Warning SLA 2 часа",
      status: "on_track",
    },
  },
  {
    id: "alarm-chiller-service",
    title: "Плановое обслуживание чиллера CH-1",
    equipmentId: "chiller-ch1",
    severity: "info",
    time: "09:30",
    description: "Нужно сформировать demo-заявку на сервисное окно.",
    sla: {
      label: "Мониторинг",
      target: "Info · без аварийного SLA",
      status: "monitoring",
    },
  },
];

export const dispatchAiInsights: DispatchAiInsight[] = [
  {
    id: "anomaly",
    category: "data-quality",
    title: "Data quality insight",
    value: "DP DATA_ERROR",
    description: "Raw DP tag is quarantined until scaling/register mapping is verified.",
    equipmentId: "pump-shu2",
  },
  {
    id: "failure",
    category: "predictive-maintenance",
    title: "Прогнозирование отказов",
    value: "риск по 3 единицам оборудования",
    description: "Frequency, event count, and DP instability are demo-only maintenance indicators.",
  },
  {
    id: "energy",
    category: "energy-optimization",
    title: "Оптимизация энергопотребления",
    value: "экономия до 15%",
    description: "Savings are a demo estimate from normalized trend context, not a guarantee.",
    equipmentId: "chiller-ch1",
  },
  {
    id: "recommend",
    category: "operational-risk",
    title: "Рекомендации AI",
    value: "доступно 4 рекомендации",
    description: "Recommendations guide operator review and do not execute equipment commands.",
  },
];
