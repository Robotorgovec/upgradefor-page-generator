export type DispatchSection =
  | "overview"
  | "cooling"
  | "ventilation"
  | "itp"
  | "pumps"
  | "alarms"
  | "tickets"
  | "equipment"
  | "ai";

export const dispatchSections: { id: DispatchSection; label: string; badge?: string }[] = [
  { id: "overview", label: "Обзор объекта" },
  { id: "cooling", label: "Холодоснабжение", badge: "LIVE" },
  { id: "ventilation", label: "Вентиляция" },
  { id: "itp", label: "Теплообменники" },
  { id: "pumps", label: "Насосные группы" },
  { id: "alarms", label: "Аварии", badge: "3" },
  { id: "tickets", label: "Заявки" },
  { id: "equipment", label: "Паспорта оборудования" },
  { id: "ai", label: "AI-аналитика", badge: "NEW" },
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
  { id: "ALM-6553", severity: "critical", system: "Холодоснабжение", equipment: "DP-SENS-CHW-01", message: "DP = 6553.5 bar", recommendation: "Проверить scaling, Modbus register, sensor range, формулу перепада давления", time: "21:38:11" },
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
  alarmHistory: ["13.05.2026 21:38 — DP 6553.5 bar", "12.05.2026 18:04 — DP 0.0 bar 12 sec", "03.05.2026 09:12 — signal frozen"],
  serviceHistory: ["20.04.2026 — визуальный осмотр, замечаний нет", "14.03.2026 — калибровка нуля", "28.01.2026 — замена импульсной трубки"],
};

export const aiInsights = [
  "Значение DP 6553.5 bar физически невозможно для CHW-контура. Вероятность ошибки scaling/register: 91%.",
  "Профиль нагрузки чиллеров Trane нормальный, но насосная группа удерживается на 40 Hz при росте ΔT.",
  "VC-13-03 на отметке +12.600 создала event без влияния на comfort KPI, требуется подтверждение ручного режима.",
];

export type DispatchTrendPeriod = "24h" | "7d" | "30d";

export type DispatchTrendKey = "temperature" | "pressure" | "flow" | "energy";

export type EquipmentStatus = "В работе" | "Предупреждение" | "Авария" | "TO VERIFY" | "Demo";

export type DispatchTrendPoint = {
  label: string;
  value: number;
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
};

export type DispatchAlarmEvent = {
  id: string;
  title: string;
  equipmentId: string;
  severity: "critical" | "warning" | "service";
  time: string;
  description: string;
};

export type DispatchAiInsight = {
  id: string;
  title: string;
  value: string;
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

export type DispatchEquipmentNode = {
  id: string;
  label: string;
  shortLabel: string;
  countLabel: string;
  trendKey: DispatchTrendKey;
  status: EquipmentStatus;
  model: string;
  serial: string;
  inventoryNumber: string;
  location: string;
  manufacturer: string;
  year: string;
  onlineParams: Array<{ label: string; value: string }>;
  serviceHistory: ServiceHistoryItem[];
  documents: EquipmentDocument[];
  aiRecommendations: string[];
  relatedAlarmIds: string[];
  relatedTrendKeys: DispatchTrendKey[];
  x: number;
  y: number;
};

const makePoints = (labels: string[], values: number[]): DispatchTrendPoint[] =>
  labels.map((label, index) => ({ label, value: values[index] ?? 0 }));

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
      "24h": makePoints(dayLabels, [2.0, 2.1, 2.2, 2.1, 6553.3, 6553.5, 2.1]),
      "7d": makePoints(weekLabels, [2.0, 2.1, 2.2, 2.3, 6553.3, 2.2, 2.1]),
      "30d": makePoints(monthLabels, [1.9, 2.1, 2.2, 2.4, 6553.5, 2.2, 2.1]),
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
  { title: "паспорт.pdf", type: "PDF" },
  { title: "схема.pdf", type: "PDF" },
  { title: "сервисный бюллетень.pdf", type: "PDF" },
];

export const dispatchEquipmentNodes: DispatchEquipmentNode[] = [
  {
    id: "ventilation-vc13",
    label: "Вентиляция — VC-13 / VC-11",
    shortLabel: "Венткамеры",
    countLabel: "+11.400 / +12.600 / +13.500",
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
    ],
    serviceHistory: commonServiceHistory,
    documents: commonDocuments,
    aiRecommendations: [
      "Проверить перепад давления на фильтрах VC-13 перед следующим регламентом.",
      "Сохранить текущий режим, отклонений по расходу не выявлено.",
    ],
    relatedAlarmIds: ["alarm-return-temp"],
    relatedTrendKeys: ["temperature", "flow"],
    x: 34,
    y: 23,
  },
  {
    id: "chiller-ch1",
    label: "Чиллеры Trane — 5 позиций",
    shortLabel: "Чиллеры Trane",
    countLabel: "5 позиций",
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
    x: 66,
    y: 31,
  },
  {
    id: "pump-shu2",
    label: "Насосные группы — ШУ-1...ШУ-4",
    shortLabel: "ШУ-1...ШУ-4",
    countLabel: "около 10 насосов",
    trendKey: "pressure",
    status: "Авария",
    model: "Насосные группы холодоснабжения / TO VERIFY",
    serial: "SHU-2-DEMO-6553",
    inventoryNumber: "INV-PMP-0010",
    location: "Asia Park Astana / Холодоснабжение / ШУ-1...ШУ-4",
    manufacturer: "TO VERIFY",
    year: "TO VERIFY",
    onlineParams: [
      { label: "Давление", value: "6553.3 / 6553.5 бар anomaly" },
      { label: "Расход", value: "45.6 м3/ч" },
      { label: "Вибрация", value: "3.2 мм/с" },
    ],
    serviceHistory: commonServiceHistory,
    documents: commonDocuments,
    aiRecommendations: [
      "DP anomaly 6553.3 / 6553.5 bar похожа на ошибку шкалы или historian tag mapping.",
      "Проверить датчик давления на ШУ-2, единицы измерения и привязку Modbus/BACnet тега.",
      "До подтверждения данных не выполнять удаленный сброс аварии.",
    ],
    relatedAlarmIds: ["alarm-pump-pressure"],
    relatedTrendKeys: ["pressure", "flow"],
    x: 31,
    y: 81,
  },
  {
    id: "itp-demo",
    label: "Теплообменные узлы — около 6",
    shortLabel: "Теплообменники",
    countLabel: "около 6 узлов",
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
    serviceHistory: commonServiceHistory,
    documents: commonDocuments,
    aiRecommendations: [
      "Нужна инвентаризация теплообменных узлов и сверка схемы с фактической обвязкой.",
      "Проверить превышение температуры обратки на соседнем контуре.",
    ],
    relatedAlarmIds: ["alarm-return-temp"],
    relatedTrendKeys: ["temperature"],
    x: 52,
    y: 81,
  },
  {
    id: "automation-cabinets",
    label: "Существующая web-based BMS/SCADA",
    shortLabel: "BMS/SCADA",
    countLabel: "10.50.4.41 / Operator",
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
    serviceHistory: commonServiceHistory,
    documents: commonDocuments,
    aiRecommendations: [
      "Сохранить read-only режим до аудита тегов и ролей доступа.",
      "Подготовить карту шкафов для паспортизации исполнительных механизмов.",
    ],
    relatedAlarmIds: [],
    relatedTrendKeys: ["energy"],
    x: 84,
    y: 43,
  },
  {
    id: "sensors",
    label: "Датчики — 152 устройства",
    shortLabel: "Датчики",
    countLabel: "152 устройства",
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
    serviceHistory: commonServiceHistory,
    documents: commonDocuments,
    aiRecommendations: [
      "Сверить датчики давления с аномалиями DP 6553.3 / 6553.5 bar.",
      "Отметить 4 устройства как TO VERIFY в реестре паспортизации.",
    ],
    relatedAlarmIds: ["alarm-pump-pressure"],
    relatedTrendKeys: ["pressure", "temperature"],
    x: 88,
    y: 57,
  },
  {
    id: "valves-drives",
    label: "Клапаны и приводы — 98 устройств",
    shortLabel: "Клапаны и приводы",
    countLabel: "98 устройств",
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
    serviceHistory: commonServiceHistory,
    documents: commonDocuments,
    aiRecommendations: [
      "Проверить исполнительные механизмы на контурах с отклонением расхода.",
      "Команды управления оставить заблокированными в demo mode.",
    ],
    relatedAlarmIds: [],
    relatedTrendKeys: ["flow"],
    x: 13,
    y: 63,
  },
  {
    id: "cooling-circuits",
    label: "Холодоснабжение — 4 контура",
    shortLabel: "Холодоснабжение",
    countLabel: "гликоль / вода / фанкойлы / вентиляция",
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
    serviceHistory: commonServiceHistory,
    documents: commonDocuments,
    aiRecommendations: [
      "Проанализировать температуру обратки и распределение нагрузки между двумя контурами.",
      "Рекомендовано открыть тренды энергии и температуры за 7 дней.",
    ],
    relatedAlarmIds: ["alarm-return-temp", "alarm-chiller-service"],
    relatedTrendKeys: ["temperature", "energy"],
    x: 71,
    y: 81,
  },
];

export const realtimeMetrics: DispatchMetric[] = [
  { label: "Температура", value: "21.4 °C", state: "Норма", trend: "+0.2 °C" },
  { label: "Давление", value: "2.1 бар", state: "Норма", trend: "stable" },
  { label: "Расход", value: "45.6 м3/ч", state: "Норма", trend: "+1.1%" },
];

export const alarmEvents: DispatchAlarmEvent[] = [
  {
    id: "alarm-pump-pressure",
    title: "DP 6553.x bar на ШУ-2",
    equipmentId: "pump-shu2",
    severity: "critical",
    time: "10:42",
    description: "DP anomaly 6553.3 / 6553.5 bar, требуется верификация тега.",
  },
  {
    id: "alarm-return-temp",
    title: "Превышение температуры обратки",
    equipmentId: "cooling-circuits",
    severity: "warning",
    time: "10:18",
    description: "Контур холодоснабжения показывает рост обратки.",
  },
  {
    id: "alarm-chiller-service",
    title: "Плановое обслуживание чиллера CH-1",
    equipmentId: "chiller-ch1",
    severity: "service",
    time: "09:30",
    description: "Нужно сформировать demo-заявку на сервисное окно.",
  },
];

export const dispatchAiInsights: DispatchAiInsight[] = [
  { id: "anomaly", title: "Data quality insight", value: "DP 6553.x bar", equipmentId: "pump-shu2" },
  { id: "failure", title: "Прогнозирование отказов", value: "риск по 3 единицам оборудования" },
  { id: "energy", title: "Оптимизация энергопотребления", value: "экономия до 15%", equipmentId: "chiller-ch1" },
  { id: "recommend", title: "Рекомендации AI", value: "доступно 4 рекомендации" },
];

export const replacementWorkflow = [
  "Анализ параметров",
  "Поиск аналогов",
  "Сравнение",
  "Рекомендация",
  "Отправить заявку",
];
