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
  { id: "itp", label: "ИТП" },
  { id: "pumps", label: "Насосные группы" },
  { id: "alarms", label: "Аварии", badge: "3" },
  { id: "tickets", label: "Заявки" },
  { id: "equipment", label: "Паспорта оборудования" },
  { id: "ai", label: "AI-аналитика", badge: "NEW" },
];

export const objectSummary = {
  name: "Asia Park Astana",
  address: "пр. Кабанбай Батыра, Астана",
  mode: "Premium demo / offline SCADA twin",
  updatedAt: "17.05.2026 10:45 UTC+5",
  area: "154 000 м2",
  floors: "B2 + 13",
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
  { name: "Вентиляция", status: "online", load: 61, note: "4 камеры active" },
  { name: "ИТП", status: "online", load: 48, note: "ГВС / отопление stable" },
  { name: "Насосные группы", status: "warning", load: 66, note: "Pump CHW-P-07 at 40 Hz" },
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
  { id: "CH-01", model: "Carrier 30XW-P 900", status: "RUN", load: 78, supply: "6.1°C", return: "11.8°C", flow: "412 м3/ч" },
  { id: "CH-02", model: "Carrier 30XW-P 900", status: "RUN", load: 74, supply: "6.3°C", return: "11.6°C", flow: "398 м3/ч" },
  { id: "CH-03", model: "Trane Sintesis RTAF", status: "STANDBY", load: 0, supply: "-", return: "-", flow: "0 м3/ч" },
  { id: "CH-04", model: "Trane Sintesis RTAF", status: "RUN", load: 63, supply: "6.5°C", return: "12.1°C", flow: "365 м3/ч" },
  { id: "CH-05", model: "Daikin EWAD-TZ", status: "SERVICE", load: 0, supply: "lock", return: "lock", flow: "0 м3/ч" },
];

export const pumpGroups = [
  { name: "CHW Primary", medium: "вода", pumps: ["CHW-P-01", "CHW-P-02", "CHW-P-03"], hz: [48, 47, 0] },
  { name: "Glycol Loop", medium: "гликоль 35%", pumps: ["GLY-P-04", "GLY-P-05"], hz: [44, 43] },
  { name: "Fan coil loop", medium: "фанкойлы", pumps: ["FCU-P-06", "FCU-P-07", "FCU-P-08"], hz: [41, 40, 0] },
  { name: "AHU cooling", medium: "вентиляция", pumps: ["AHU-P-09", "AHU-P-10"], hz: [46, 45] },
];

export const ventilationUnits = [
  { id: "VC-13-01", mark: "+13.500", location: "верхняя тех. отметка / roof plantroom", airflow: "64 000 м3/ч", status: "RUN", co2: 612 },
  { id: "VC-13-02", mark: "+13.500", location: "верхняя тех. отметка / east shaft", airflow: "58 500 м3/ч", status: "RUN", co2: 590 },
  { id: "VC-13-03", mark: "+12.600", location: "верхняя тех. отметка / food court", airflow: "47 800 м3/ч", status: "EVENT", co2: 740 },
  { id: "VC-11-01", mark: "+11.400", location: "верхняя тех. отметка / cinema zone", airflow: "39 200 м3/ч", status: "RUN", co2: 665 },
];

export const alarms = [
  { id: "ALM-6553", severity: "critical", system: "Холодоснабжение", equipment: "DP-SENS-CHW-01", message: "DP = 6553.5 bar", recommendation: "Проверить scaling, Modbus register, sensor range, формулу перепада давления", time: "21:38:11" },
  { id: "ALM-1040", severity: "warning", system: "Насосные группы", equipment: "FCU-P-07", message: "Насос работает на 40 Hz при повышенном ΔT", recommendation: "Проверить уставку VFD и балансировку ветки фанкойлов", time: "21:31:08" },
  { id: "EVT-VC13", severity: "event", system: "Вентиляция", equipment: "VC-13-03", message: "Событие: переход заслонки в ручной режим", recommendation: "Сверить локальный щит автоматики и команду диспетчера", time: "21:26:44" },
];

export const equipmentPassport = {
  id: "DP-SENS-CHW-01",
  model: "WIKA A2G-50 differential pressure transmitter",
  location: "Тех. помещение ФСУ, коллектор CHW, отметка B1",
  status: "CRITICAL / value out of physical range",
  tags: ["SCADA.CHW.DP_01.PV", "MODBUS.4x40117", "AI.ANOMALY.DP_SCALE", "BMS.ALARM.6553"],
  documents: ["Паспорт датчика DP-SENS-CHW-01.pdf", "P&ID Холодоснабжение лист 04.dwg", "Modbus map CHW rev.7.xlsx"],
  alarmHistory: ["13.05.2026 21:38 - DP 6553.5 bar", "12.05.2026 18:04 - DP 0.0 bar 12 sec", "03.05.2026 09:12 - signal frozen"],
  serviceHistory: ["20.04.2026 - визуальный осмотр, замечаний нет", "14.03.2026 - калибровка нуля", "28.01.2026 - замена импульсной трубки"],
};

export const aiInsights = [
  "Значение DP 6553.5 bar физически невозможно для CHW-контура. Вероятность ошибки scaling/register: 91%.",
  "Профиль нагрузки чиллеров нормальный, но насос FCU-P-07 удерживается на 40 Hz при росте ΔT.",
  "VC-13-03 на отметке +12.600 создала event без влияния на comfort KPI, требуется подтверждение ручного режима.",
];

export type DispatchTrendPeriod = "24h" | "7d" | "30d";
export type DispatchTrendKey = "temperature" | "pressure" | "flow" | "energy";
export type EquipmentStatus = "В работе" | "Предупреждение" | "Авария" | "TO VERIFY" | "Demo";

export type DispatchTrendPoint = { label: string; value: number };
export type DispatchTrendSeriesItem = {
  key: DispatchTrendKey;
  label: string;
  unit: string;
  color: string;
  periods: Record<DispatchTrendPeriod, DispatchTrendPoint[]>;
};
export type DispatchMetric = { label: string; value: string; state: string; trend: string };
export type DispatchAlarmEvent = {
  id: string;
  title: string;
  equipmentId: string;
  severity: "critical" | "warning" | "service";
  time: string;
  description: string;
};
export type DispatchAiInsight = { id: string; title: string; value: string; equipmentId?: string };
export type ServiceHistoryItem = { date: string; title: string; result: string };
export type EquipmentDocument = { title: string; type: string };
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
  { key: "temperature", label: "Температура", unit: "°C", color: "#fb923c", periods: { "24h": makePoints(dayLabels, [21.1,21.4,22.2,23.1,22.4,21.9,21.4]), "7d": makePoints(weekLabels, [21.2,21.8,22.4,22.1,23,22.3,21.6]), "30d": makePoints(monthLabels, [20.8,21.3,21.9,23.4,22.8,22.1,21.4]) } },
  { key: "pressure", label: "Давление", unit: "бар", color: "#38bdf8", periods: { "24h": makePoints(dayLabels, [2,2.1,2.2,2.1,6553.3,6553.5,2.1]), "7d": makePoints(weekLabels, [2,2.1,2.2,2.3,6553.3,2.2,2.1]), "30d": makePoints(monthLabels, [1.9,2.1,2.2,2.4,6553.5,2.2,2.1]) } },
  { key: "flow", label: "Расход", unit: "м3/ч", color: "#22c55e", periods: { "24h": makePoints(dayLabels, [43.8,44.9,46.2,45.6,47.1,46.3,45.6]), "7d": makePoints(weekLabels, [42.4,44.1,45.8,46.4,47.2,46,45.6]), "30d": makePoints(monthLabels, [41.2,43.6,44.8,46.9,48.1,46.4,45.6]) } },
  { key: "energy", label: "Энергия", unit: "кВт·ч", color: "#67e8f9", periods: { "24h": makePoints(dayLabels, [410,428,455,472,461,439,421]), "7d": makePoints(weekLabels, [398,424,447,463,481,452,430]), "30d": makePoints(monthLabels, [386,408,431,469,492,456,419]) } },
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
  { id: "ventilation-vc13", label: "Вентиляция - 12 установок", shortLabel: "Вентиляция", countLabel: "12 установок", trendKey: "flow", status: "В работе", model: "VC-13-* / VC-11-01", serial: "VC13-DEMO-012", inventoryNumber: "INV-VNT-0012", location: "Техэтаж, блок A / кровля", manufacturer: "TO VERIFY", year: "2021", onlineParams: [{ label: "Расход", value: "45.6 м3/ч" }, { label: "Температура притока", value: "21.4 °C" }, { label: "Фильтр", value: "72%" }], serviceHistory: commonServiceHistory, documents: commonDocuments, aiRecommendations: ["Проверить перепад давления на фильтрах VC-13 перед следующим регламентом.", "Сохранить текущий режим, отклонений по расходу не выявлено."], relatedAlarmIds: ["alarm-return-temp"], relatedTrendKeys: ["temperature", "flow"], x: 16, y: 24 },
  { id: "chiller-ch1", label: "Чиллеры - 5 позиций", shortLabel: "Чиллеры", countLabel: "5 позиций", trendKey: "energy", status: "В работе", model: "Trane / RTAF / RTAD или TO VERIFY", serial: "CH-1-TO-VERIFY", inventoryNumber: "INV-CH-0001", location: "Холодильный центр, машинный зал", manufacturer: "Trane / TO VERIFY", year: "2020", onlineParams: [{ label: "COP/EER demo", value: "4.18" }, { label: "Температура подачи", value: "7.2 °C" }, { label: "Температура обратки", value: "12.8 °C" }, { label: "Наработка", value: "18 420 ч" }], serviceHistory: [{ date: "2026-05-17", title: "Плановое обслуживание чиллера CH-1", result: "Ожидает заявки" }, ...commonServiceHistory], documents: commonDocuments, aiRecommendations: ["Запланировать ТО CH-1 в ближайшее окно низкой нагрузки.", "Сравнить энергопотребление с позициями CH-2/CH-3, есть потенциал балансировки.", "Для подбора аналога нужна верификация модели и серийного номера."], relatedAlarmIds: ["alarm-chiller-service"], relatedTrendKeys: ["temperature", "energy"], x: 82, y: 30 },
  { id: "pump-nps2", label: "Насосы - 10 насосов", shortLabel: "Насосы", countLabel: "4 группы / около 10 насосов", trendKey: "pressure", status: "Авария", model: "NPS group demo", serial: "NPS-2-DEMO-6553", inventoryNumber: "INV-PMP-0010", location: "Насосная, -1 этаж", manufacturer: "Grundfos / Wilo или TO VERIFY", year: "2019", onlineParams: [{ label: "Давление", value: "6553.3 / 6553.5 бар anomaly" }, { label: "Расход", value: "45.6 м3/ч" }, { label: "Вибрация", value: "3.2 мм/с" }], serviceHistory: commonServiceHistory, documents: commonDocuments, aiRecommendations: ["DP anomaly 6553.3 / 6553.5 bar похожа на ошибку шкалы или historian tag mapping.", "Проверить датчик давления NPS-2, единицы измерения и привязку Modbus/BACnet тега.", "До подтверждения данных не выполнять удаленный сброс аварии."], relatedAlarmIds: ["alarm-pump-pressure"], relatedTrendKeys: ["pressure", "flow"], x: 18, y: 72 },
  { id: "itp-demo", label: "ИТП - demo / TO VERIFY", shortLabel: "ИТП", countLabel: "demo / TO VERIFY", trendKey: "temperature", status: "TO VERIFY", model: "ИТП demo skid", serial: "TO VERIFY", inventoryNumber: "INV-ITP-DEMO", location: "Тепловой пункт", manufacturer: "TO VERIFY", year: "TO VERIFY", onlineParams: [{ label: "Подача", value: "68.2 °C" }, { label: "Обратка", value: "54.7 °C" }, { label: "Клапан", value: "41%" }], serviceHistory: commonServiceHistory, documents: commonDocuments, aiRecommendations: ["Нужна инвентаризация ИТП и сверка схемы с фактической обвязкой.", "Проверить превышение температуры обратки на соседнем контуре."], relatedAlarmIds: ["alarm-return-temp"], relatedTrendKeys: ["temperature"], x: 72, y: 76 },
  { id: "automation-cabinets", label: "Шкафы автоматики - 28 шкафов", shortLabel: "Шкафы автоматики", countLabel: "28 шкафов", trendKey: "energy", status: "В работе", model: "BMS panel demo", serial: "BMS-28-DEMO", inventoryNumber: "INV-BMS-0028", location: "Этажи B1-L4", manufacturer: "Siemens / Schneider / TO VERIFY", year: "2022", onlineParams: [{ label: "Связь", value: "Online / simulated gateway" }, { label: "Контроллеры", value: "28/28" }, { label: "Ошибки сети", value: "0 активных" }], serviceHistory: commonServiceHistory, documents: commonDocuments, aiRecommendations: ["Сохранить read-only режим до аудита тегов и ролей доступа.", "Подготовить карту шкафов для паспортизации исполнительных механизмов."], relatedAlarmIds: [], relatedTrendKeys: ["energy"], x: 50, y: 14 },
  { id: "sensors", label: "Датчики - 152 устройства", shortLabel: "Датчики", countLabel: "152 устройства", trendKey: "pressure", status: "Предупреждение", model: "BMS sensors pack", serial: "SNS-152-DEMO", inventoryNumber: "INV-SNS-0152", location: "Все зоны объекта", manufacturer: "TO VERIFY", year: "2020-2024", onlineParams: [{ label: "Online", value: "148/152" }, { label: "TO VERIFY", value: "4 устройства" }, { label: "Anomaly", value: "2 pressure tags" }], serviceHistory: commonServiceHistory, documents: commonDocuments, aiRecommendations: ["Сверить датчики давления с аномалиями DP 6553.3 / 6553.5 bar.", "Отметить 4 устройства как TO VERIFY в реестре паспортизации."], relatedAlarmIds: ["alarm-pump-pressure"], relatedTrendKeys: ["pressure", "temperature"], x: 90, y: 58 },
  { id: "valves-drives", label: "Клапаны и приводы - 98 устройств", shortLabel: "Клапаны и приводы", countLabel: "98 устройств", trendKey: "flow", status: "В работе", model: "Valve actuator demo", serial: "DRV-098-DEMO", inventoryNumber: "INV-DRV-0098", location: "ИТП, вентиляция, холодоснабжение", manufacturer: "Belimo / Siemens / TO VERIFY", year: "2021", onlineParams: [{ label: "Открытие ср.", value: "46%" }, { label: "Ручной режим", value: "0" }, { label: "Команды", value: "Read-only" }], serviceHistory: commonServiceHistory, documents: commonDocuments, aiRecommendations: ["Проверить исполнительные механизмы на контурах с отклонением расхода.", "Команды управления оставить заблокированными в demo mode."], relatedAlarmIds: [], relatedTrendKeys: ["flow"], x: 8, y: 50 },
  { id: "cooling-circuits", label: "Холодоснабжение - 2 контура", shortLabel: "Холодоснабжение", countLabel: "2 контура", trendKey: "temperature", status: "Предупреждение", model: "CHW loop demo", serial: "CHW-02-DEMO", inventoryNumber: "INV-CHW-0002", location: "Холодильный центр / торговые галереи", manufacturer: "TO VERIFY", year: "2020", onlineParams: [{ label: "Контур 1", value: "7.2 / 12.8 °C" }, { label: "Контур 2", value: "8.1 / 13.6 °C" }, { label: "Delta T", value: "5.6 K" }], serviceHistory: commonServiceHistory, documents: commonDocuments, aiRecommendations: ["Проанализировать температуру обратки и распределение нагрузки между двумя контурами.", "Рекомендовано открыть тренды энергии и температуры за 7 дней."], relatedAlarmIds: ["alarm-return-temp", "alarm-chiller-service"], relatedTrendKeys: ["temperature", "energy"], x: 44, y: 86 },
];

export const realtimeMetrics: DispatchMetric[] = [
  { label: "Температура", value: "21.4 °C", state: "Норма", trend: "+0.2 °C" },
  { label: "Давление", value: "2.1 бар", state: "Норма", trend: "stable" },
  { label: "Расход", value: "45.6 м3/ч", state: "Норма", trend: "+1.1%" },
];

export const alarmEvents: DispatchAlarmEvent[] = [
  { id: "alarm-pump-pressure", title: "Высокое давление на насосе NPS-2", equipmentId: "pump-nps2", severity: "critical", time: "10:42", description: "DP anomaly 6553.3 / 6553.5 bar, требуется верификация тега." },
  { id: "alarm-return-temp", title: "Превышение температуры обратки", equipmentId: "cooling-circuits", severity: "warning", time: "10:18", description: "Контур холодоснабжения показывает рост обратки." },
  { id: "alarm-chiller-service", title: "Плановое обслуживание чиллера CH-1", equipmentId: "chiller-ch1", severity: "service", time: "09:30", description: "Нужно сформировать demo-заявку на сервисное окно." },
];

export const dispatchAiInsights: DispatchAiInsight[] = [
  { id: "anomaly", title: "Обнаружение аномалий", value: "выявлено 2 отклонения", equipmentId: "pump-nps2" },
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
