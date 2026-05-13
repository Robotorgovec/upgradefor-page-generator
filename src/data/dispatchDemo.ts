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
  updatedAt: "13.05.2026 21:40 UTC",
  area: "154 000 м²",
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
  { id: "CH-01", model: "Carrier 30XW-P 900", status: "RUN", load: 78, supply: "6.1°C", return: "11.8°C", flow: "412 м³/ч" },
  { id: "CH-02", model: "Carrier 30XW-P 900", status: "RUN", load: 74, supply: "6.3°C", return: "11.6°C", flow: "398 м³/ч" },
  { id: "CH-03", model: "Trane Sintesis RTAF", status: "STANDBY", load: 0, supply: "—", return: "—", flow: "0 м³/ч" },
  { id: "CH-04", model: "Trane Sintesis RTAF", status: "RUN", load: 63, supply: "6.5°C", return: "12.1°C", flow: "365 м³/ч" },
  { id: "CH-05", model: "Daikin EWAD-TZ", status: "SERVICE", load: 0, supply: "lock", return: "lock", flow: "0 м³/ч" },
];

export const pumpGroups = [
  { name: "CHW Primary", medium: "вода", pumps: ["CHW-P-01", "CHW-P-02", "CHW-P-03"], hz: [48, 47, 0] },
  { name: "Glycol Loop", medium: "гликоль 35%", pumps: ["GLY-P-04", "GLY-P-05"], hz: [44, 43] },
  { name: "Fan coil loop", medium: "фанкойлы", pumps: ["FCU-P-06", "FCU-P-07", "FCU-P-08"], hz: [41, 40, 0] },
  { name: "AHU cooling", medium: "вентиляция", pumps: ["AHU-P-09", "AHU-P-10"], hz: [46, 45] },
];

export const ventilationUnits = [
  { id: "VC-13-01", mark: "+13.500", location: "верхняя тех. отметка / roof plantroom", airflow: "64 000 м³/ч", status: "RUN", co2: 612 },
  { id: "VC-13-02", mark: "+13.500", location: "верхняя тех. отметка / east shaft", airflow: "58 500 м³/ч", status: "RUN", co2: 590 },
  { id: "VC-13-03", mark: "+12.600", location: "верхняя тех. отметка / food court", airflow: "47 800 м³/ч", status: "EVENT", co2: 740 },
  { id: "VC-11-01", mark: "+11.400", location: "верхняя тех. отметка / cinema zone", airflow: "39 200 м³/ч", status: "RUN", co2: 665 },
];

export const alarms = [
  { id: "ALM-6553", severity: "critical", system: "Холодоснабжение", equipment: "DP-SENS-CHW-01", message: "DP = 6553.5 bar", recommendation: "Проверить scaling, Modbus register, sensor range, формулу перепада давления", time: "21:38:11" },
  { id: "ALM-1040", severity: "warning", system: "Насосные группы", equipment: "FCU-P-07", message: "Насос работает на 40 Hz при повышенном ΔT", recommendation: "Проверить уставку VFD и балансировку ветки фанкойлов", time: "21:31:08" },
  { id: "EVT-VC13", severity: "event", system: "Вентиляция", equipment: "VC-13-03", message: "Событие: переход заслонки в ручной режим", recommendation: "Сверить локальный щит автоматики и команду диспетчера", time: "21:26:44" },
];

export const equipmentPassport = {
  id: "DP-SENS-CHW-01",
  model: "WIKA A2G-50 differential pressure transmitter",
  location: "Тех. помещение ХЦ, коллектор CHW, отметка B1",
  status: "CRITICAL / value out of physical range",
  tags: ["SCADA.CHW.DP_01.PV", "MODBUS.4x40117", "AI.ANOMALY.DP_SCALE", "BMS.ALARM.6553"],
  documents: ["Паспорт датчика DP-SENS-CHW-01.pdf", "P&ID Холодоснабжение лист 04.dwg", "Modbus map CHW rev.7.xlsx"],
  alarmHistory: ["13.05.2026 21:38 — DP 6553.5 bar", "12.05.2026 18:04 — DP 0.0 bar 12 sec", "03.05.2026 09:12 — signal frozen"],
  serviceHistory: ["20.04.2026 — визуальный осмотр, замечаний нет", "14.03.2026 — калибровка нуля", "28.01.2026 — замена импульсной трубки"],
};

export const aiInsights = [
  "Значение DP 6553.5 bar физически невозможно для CHW-контура. Вероятность ошибки scaling/register: 91%.",
  "Профиль нагрузки чиллеров нормальный, но насос FCU-P-07 удерживается на 40 Hz при росте ΔT.",
  "VC-13-03 на отметке +12.600 создала event без влияния на comfort KPI, требуется подтверждение ручного режима.",
];
