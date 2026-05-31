"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  alarmEvents,
  dispatchAiInsights,
  dispatchEquipmentNodes,
  dispatchSectionDetails,
  dispatchSections,
  objectSummary,
  realtimeMetrics,
  trendSeries,
  type DispatchAlarmEvent,
  type DispatchAiInsight,
  type DispatchEquipmentNode,
  type DispatchSection,
  type DispatchTrendKey,
} from "../../data/dispatchDemo";
import type {
  EquipmentTwinAssemblyState,
  EquipmentTwinId,
} from "../../lib/dispatch/equipmentTwinTypes";
import EquipmentTwinGrid from "./EquipmentTwinGrid";
import DispatchTrendsPanel from "./DispatchTrendsPanel";
import {
  equipmentTwinNodeMap,
  equipmentTwinSectionIdMap,
  equipmentTwinSectionMap,
  equipmentTwinSystemLabels,
  getEquipmentTwinById,
} from "./equipmentTwins.config";

const passportTabs = ["Паспорт", "Параметры", "SCADA-теги", "ТО", "Документы"];
const controlButtons = ["Пуск", "Стоп", "Auto/Manual", "Изменить уставку", "Сброс аварии"];
const twinPassportActions = ["Паспорт", "Параметры", "ТО", "Документы", "Открыть тренды", "Создать заявку"];
const readonlyControlTooltip = "Управление заблокировано (Demo mode)";
const readonlyUserRole = "Operator";
const aiInsightCategories: Array<{
  id: DispatchAiInsight["category"];
  title: string;
  helper: string;
}> = [
  {
    id: "data-quality",
    title: "Data quality",
    helper: "Tag validity, scaling and historian confidence",
  },
  {
    id: "predictive-maintenance",
    title: "Predictive maintenance",
    helper: "Failure risk from events and unstable telemetry",
  },
  {
    id: "energy-optimization",
    title: "Energy optimization",
    helper: "Demo estimates from normalized trend context",
  },
  {
    id: "operational-risk",
    title: "Operational risk",
    helper: "Guidance for operator review, tickets and audit trail",
  },
];
const initialTwinStates: Record<EquipmentTwinId, EquipmentTwinAssemblyState> = {
  "ahu-pv1": "assembled",
  chiller: "assembled",
  "cooling-tower-small": "assembled",
  "fancoil-fc92": "assembled",
  "multi-split-system": "assembled",
};

type ModalState = "readonly" | "ticket" | null;
type PassportSource = "node" | "twin";
type ReadonlyAuditEntry = {
  action: string;
  equipment: string;
  role: string;
  time: string;
};

type DemoTicketEntry = {
  equipment: string;
  id: string;
  section: string;
  severity: string;
  source: string;
  status: string;
  tag: string;
  time: string;
};

type ScadaTagRow = {
  tag: string;
  signalType: "AI" | "DI" | "DO" | "AO";
  register: string;
  scaling: string;
  unit: string;
  quality: "VALID" | "DATA_ERROR" | "TO VERIFY";
};

function severityLabel(severity: DispatchAlarmEvent["severity"]) {
  if (severity === "critical") return "Critical";
  if (severity === "warning") return "Warning";
  return "Info";
}

function statusTone(status: string) {
  if (status === "Авария") return "danger";
  if (status === "Предупреждение" || status === "TO VERIFY") return "warning";
  return "ok";
}

function normalizeEquipmentStatus(status: string): DispatchEquipmentNode["status"] {
  if (
    status === "В работе" ||
    status === "Предупреждение" ||
    status === "Авария" ||
    status === "TO VERIFY" ||
    status === "Demo"
  ) {
    return status;
  }

  return "TO VERIFY";
}

function findParamValue(
  params: Array<{ label: string; value: string }>,
  patterns: RegExp[],
  fallback = "TO VERIFY",
) {
  const param = params.find((item) => patterns.some((pattern) => pattern.test(item.label)));
  return param?.value ?? fallback;
}

function getScadaSignalType(tag: string): ScadaTagRow["signalType"] {
  if (/WRITE|CONTROL|LOCKED|COMMAND/i.test(tag)) return "DO";
  if (/STATUS|ONLINE|ALARM|MODE/i.test(tag)) return "DI";
  if (/SETPOINT|VALVE|DRIVE/i.test(tag)) return "AO";
  return "AI";
}

function getScadaUnit(tag: string) {
  if (/TEMP|GLYCOL|WATER/i.test(tag)) return "°C";
  if (/(^|[._-])DP([._-]|$)|PRESSURE/i.test(tag)) return "bar";
  if (/AIRFLOW|FLOW/i.test(tag)) return "м³/ч";
  if (/ENERGY|POWER/i.test(tag)) return "кВт·ч";
  if (/VALVE|LOAD/i.test(tag)) return "%";
  if (/STATUS|ONLINE|ALARM|MODE|LOCKED/i.test(tag)) return "state";
  return "TO VERIFY";
}

function getScadaScaling(tag: string, unit: string) {
  if (/(^|[._-])DP([._-]|$)|PRESSURE/i.test(tag)) return "0–16 bar";
  if (/TEMP|GLYCOL|WATER/i.test(tag)) return "0.1 °C";
  if (/AIRFLOW|FLOW/i.test(tag)) return "engineering units";
  if (/STATUS|ONLINE|ALARM|MODE|LOCKED/i.test(tag)) return "boolean";
  return unit === "TO VERIFY" ? "TO VERIFY" : "normalized";
}

function getScadaRegister(tag: string) {
  const parts = tag.split(".");
  const candidate = parts.slice(-2).join(".");
  if (/TO_VERIFY/i.test(tag)) return "TO VERIFY";
  if (/DISPATCH|AI\.ANOMALY/i.test(tag)) return "derived";
  if (/BMS\.ALARM/i.test(tag)) return "event route";
  return candidate || "TO VERIFY";
}

function buildScadaTagRows(equipment: DispatchEquipmentNode): ScadaTagRow[] {
  const hasDataError = equipment.onlineParams.some((param) => param.quality === "DATA_ERROR");
  const tags = equipment.scadaTags.length ? equipment.scadaTags : ["TO VERIFY"];

  return tags.map((tag) => {
    const unit = getScadaUnit(tag);
    const quality = /TO_VERIFY|TO VERIFY/i.test(tag)
      ? "TO VERIFY"
      : hasDataError && (/(^|[._-])DP([._-]|$)/i.test(tag) || /6553/i.test(tag))
        ? "DATA_ERROR"
        : "VALID";

    return {
      tag,
      signalType: getScadaSignalType(tag),
      register: getScadaRegister(tag),
      scaling: getScadaScaling(tag, unit),
      unit,
      quality,
    };
  });
}

function trendKeyForTwin(id: EquipmentTwinId): DispatchTrendKey {
  if (id === "ahu-pv1") return "flow";
  if (id === "chiller" || id === "cooling-tower-small") return "energy";
  return "temperature";
}

function twinSelectionForSection(sectionId: DispatchSection, currentTwinId: EquipmentTwinId) {
  const sectionTwinIds = equipmentTwinSectionMap[sectionId] ?? [];
  const activeTwinId = sectionTwinIds.includes(currentTwinId) ? currentTwinId : sectionTwinIds[0];

  if (!activeTwinId) {
    return { activeTwinId: currentTwinId, relatedTwinIds: [] };
  }

  if (sectionId === "cooling") {
    return { activeTwinId: "chiller" as const, relatedTwinIds: ["cooling-tower-small" as const] };
  }

  if (sectionId === "fanCoils") {
    return { activeTwinId: "fancoil-fc92" as const, relatedTwinIds: ["multi-split-system" as const] };
  }

  if (sectionId === "ventilation") {
    return { activeTwinId: "ahu-pv1" as const, relatedTwinIds: [] };
  }

  return {
    activeTwinId,
    relatedTwinIds: sectionTwinIds.filter((id) => id !== activeTwinId),
  };
}

export default function DispatchDashboard() {
  const [activeSectionId, setActiveSectionId] = useState<DispatchSection>("overview");
  const [selectedId, setSelectedId] = useState("automation-cabinets");
  const [selectedTwinId, setSelectedTwinId] = useState<EquipmentTwinId>("ahu-pv1");
  const [relatedTwinIds, setRelatedTwinIds] = useState<EquipmentTwinId[]>([]);
  const [passportSource, setPassportSource] = useState<PassportSource>("twin");
  const [twinStates, setTwinStates] =
    useState<Record<EquipmentTwinId, EquipmentTwinAssemblyState>>(initialTwinStates);
  const [selectedTrendKey, setSelectedTrendKey] = useState<DispatchTrendKey>("energy");
  const [passportTab, setPassportTab] = useState(passportTabs[0]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [modal, setModal] = useState<ModalState>(null);
  const [aiAnswer, setAiAnswer] = useState("");
  const [demoTime, setDemoTime] = useState("17.05.2026 10:45");
  const [selectedAlarmId, setSelectedAlarmId] = useState<string | null>(null);
  const [readonlyAuditLog, setReadonlyAuditLog] = useState<ReadonlyAuditEntry[]>([]);
  const [ticketJournal, setTicketJournal] = useState<DemoTicketEntry[]>([]);

  useEffect(() => {
    document.body.classList.add("is-dispatch-demo");
    document.body.classList.remove("menu-open");

    return () => {
      document.body.classList.remove("is-dispatch-demo");
    };
  }, []);

  const selectedEquipment =
    dispatchEquipmentNodes.find((node) => node.id === selectedId) ?? dispatchEquipmentNodes[0];

  const selectedSection =
    dispatchSectionDetails.find((section) => section.id === activeSectionId) ?? dispatchSectionDetails[0];
  const selectedTwin = getEquipmentTwinById(selectedTwinId);
  const selectedTwinTrendKey = trendKeyForTwin(selectedTwin.id);
  const selectedTwinPassportEquipment = useMemo<DispatchEquipmentNode>(
    () => ({
      id: selectedTwin.id,
      label: selectedTwin.title,
      shortLabel: selectedTwin.shortTitle,
      countLabel: equipmentTwinSystemLabels[selectedTwin.system],
      type: equipmentTwinSystemLabels[selectedTwin.system],
      trendKey: selectedTwinTrendKey,
      status: normalizeEquipmentStatus(selectedTwin.status),
      model: selectedTwin.model,
      serial: selectedTwin.serialNumber,
      inventoryNumber: selectedTwin.inventoryNumber,
      location: selectedTwin.location,
      manufacturer: selectedTwin.manufacturer,
      year: selectedTwin.year,
      onlineParams: selectedTwin.trends.map((trend) => ({ label: trend, value: "Demo / read-only" })),
      linkedSystems: selectedTwin.relatedSystems,
      scadaTags: [
        "DISPATCH.READ_ONLY.MODE",
        `DISPATCH.TWIN.${selectedTwin.id.toUpperCase().replaceAll("-", "_")}`,
        "BMS/SCADA.WRITE_BLOCKED",
      ],
      serviceNote: selectedTwin.serviceNote,
      serviceHistory: [
        { date: "2026-05-21", title: selectedTwin.lastEvent, result: selectedTwin.serviceNote },
        { date: "TO VERIFY", title: "Паспортизация оборудования", result: "Данные показаны в demo registry" },
      ],
      documents: twinPassportActions.map((title) => ({
        title,
        type: title === "Создать заявку" || title === "Открыть тренды" ? "ACTION" : "DEMO",
      })),
      aiRecommendations: [
        `${selectedTwin.shortTitle}: сохранить read-only режим до аудита тегов и ролей доступа.`,
        selectedTwin.serviceNote,
      ],
      relatedAlarmIds: [],
      relatedTrendKeys: [selectedTwinTrendKey],
      x: 0,
      y: 0,
    }),
    [selectedTwin, selectedTwinTrendKey],
  );
  const passportEquipment =
    passportSource === "twin" ? selectedTwinPassportEquipment : selectedEquipment;

  const relatedAlarms = useMemo(
    () => {
      const relatedIds = new Set([...selectedEquipment.relatedAlarmIds, ...selectedSection.relatedAlarmIds]);
      return alarmEvents.filter((alarm) => relatedIds.has(alarm.id));
    },
    [selectedEquipment, selectedSection],
  );

  const notificationItems = useMemo(() => {
    const relatedIds = new Set(relatedAlarms.map((alarm) => alarm.id));
    return [...relatedAlarms, ...alarmEvents.filter((alarm) => !relatedIds.has(alarm.id))].slice(0, 4);
  }, [relatedAlarms]);

  const relatedNodes = useMemo(
    () =>
      selectedSection.relatedNodeIds
        .map((nodeId) => dispatchEquipmentNodes.find((node) => node.id === nodeId))
        .filter((node): node is DispatchEquipmentNode => Boolean(node)),
    [selectedSection],
  );

  const selectedLastEvent = relatedAlarms[0]
    ? `${severityLabel(relatedAlarms[0].severity)} · ${relatedAlarms[0].time} · ${relatedAlarms[0].title}`
    : selectedSection.lastEvent;
  const passportRelatedAlarms = passportSource === "twin" ? [] : relatedAlarms;
  const passportLastEvent = passportSource === "twin" ? selectedTwin.lastEvent : selectedLastEvent;
  const passportTrendNodeId = passportSource === "twin" ? equipmentTwinNodeMap[selectedTwin.id] : passportEquipment.id;
  const passportPrimaryAlarm = alarmEvents.find((alarm) => passportEquipment.relatedAlarmIds.includes(alarm.id));
  const passportScadaRows = useMemo(() => buildScadaTagRows(passportEquipment), [passportEquipment]);
  const selectedAlarm = selectedAlarmId ? alarmEvents.find((alarm) => alarm.id === selectedAlarmId) : undefined;
  const selectedAlarmSourceTag = selectedAlarm?.sourceTagId;
  const selectedSectionLabel =
    dispatchSections.find((section) => section.id === selectedSection.id)?.label ?? selectedSection.id;
  const ticketSourceAlarm = relatedAlarms[0] ?? passportPrimaryAlarm;
  const ticketSourceTag =
    passportScadaRows.find((row) => row.quality === "DATA_ERROR")?.tag ??
    passportScadaRows[0]?.tag ??
    "TO VERIFY";
  const ticketSeverity = ticketSourceAlarm ? severityLabel(ticketSourceAlarm.severity) : "Info";
  const ticketRecommendation =
    passportEquipment.aiRecommendations[0] ??
    ticketSourceAlarm?.description ??
    selectedSection.lastEvent;
  const passportTopKpis = [
    {
      id: "temperature",
      label: "Температура",
      value: findParamValue(passportEquipment.onlineParams, [/темпера/i, /подач/i, /обрат/i, /гликоль/i, /вода/i]),
      helper: "BMS/SCADA tag",
    },
    {
      id: "pressure",
      label: "Давление",
      value: findParamValue(passportEquipment.onlineParams, [/давлен/i, /\bdp\b/i, /pressure/i]),
      helper: "range 0–16 bar",
      quality: passportEquipment.onlineParams.find((param) => [/давлен/i, /\bdp\b/i, /pressure/i].some((pattern) => pattern.test(param.label)))?.quality,
    },
    {
      id: "flow",
      label: "Расход",
      value: findParamValue(passportEquipment.onlineParams, [/расход/i, /flow/i, /airflow/i]),
      helper: "simulated gateway",
    },
    {
      id: "status",
      label: "Статус",
      value: passportEquipment.status,
      helper: passportSource === "twin" ? "read-only twin" : "registry state",
    },
    {
      id: "last-alarm",
      label: "Последняя авария",
      value: passportPrimaryAlarm ? `${severityLabel(passportPrimaryAlarm.severity)} · ${passportPrimaryAlarm.title}` : "Активных аварий нет",
      helper: passportPrimaryAlarm ? `SLA ${passportPrimaryAlarm.sla.label}` : "demo/read-only",
    },
  ];
  const hasDpAnomalyContext =
    selectedEquipment.visualTone === "anomaly" ||
    selectedSection.relatedAlarmIds.includes("alarm-pump-pressure");

  const selectEquipment = (node: DispatchEquipmentNode, sectionId?: DispatchSection) => {
    const nextSection = sectionId
      ? dispatchSectionDetails.find((section) => section.id === sectionId)
      : dispatchSectionDetails.find(
          (section) => section.nodeId === node.id || section.relatedNodeIds.includes(node.id),
        );

    setSelectedId(node.id);
    setPassportSource("node");
    setActiveSectionId(nextSection?.id ?? activeSectionId);
    if (nextSection && equipmentTwinSectionMap[nextSection.id]?.length) {
      const sectionTwinSelection = twinSelectionForSection(nextSection.id, selectedTwinId);
      setSelectedTwinId(sectionTwinSelection.activeTwinId);
      setRelatedTwinIds(sectionTwinSelection.relatedTwinIds);
    } else {
      setRelatedTwinIds([]);
    }
    setSelectedTrendKey(nextSection?.trendKey ?? node.trendKey);
    setPassportTab(passportTabs[0]);
    setSelectedAlarmId(null);
    setIsDrawerOpen(true);
  };

  const selectTwin = (twinId: EquipmentTwinId) => {
    const nodeId = equipmentTwinNodeMap[twinId];
    const node = dispatchEquipmentNodes.find((item) => item.id === nodeId);
    const sectionId = equipmentTwinSectionIdMap[twinId] as DispatchSection;

    setSelectedTwinId(twinId);
    setRelatedTwinIds([]);
    setPassportSource("twin");
    setActiveSectionId(sectionId);
    setSelectedId(node?.id ?? selectedId);
    setSelectedTrendKey(node?.trendKey ?? trendKeyForTwin(twinId));
    setPassportTab(passportTabs[0]);
    setSelectedAlarmId(null);
    setIsDrawerOpen(true);
  };

  const toggleTwinState = (twinId: EquipmentTwinId) => {
    setTwinStates((current) => ({
      ...current,
      [twinId]: current[twinId] === "exploded" ? "assembled" : "exploded",
    }));
  };

  const selectSection = (sectionId: DispatchSection) => {
    const section = dispatchSectionDetails.find((item) => item.id === sectionId) ?? dispatchSectionDetails[0];
    const node = dispatchEquipmentNodes.find((item) => item.id === section.nodeId) ?? selectedEquipment;
    const sectionTwinSelection = twinSelectionForSection(section.id, selectedTwinId);

    setActiveSectionId(section.id);
    setSelectedId(node.id);
    if (equipmentTwinSectionMap[section.id]?.length) {
      setSelectedTwinId(sectionTwinSelection.activeTwinId);
      setRelatedTwinIds(sectionTwinSelection.relatedTwinIds);
      setPassportSource("twin");
    } else {
      setRelatedTwinIds([]);
      setPassportSource("node");
    }
    setSelectedTrendKey(section.trendKey);
    setPassportTab(passportTabs[0]);
    setSelectedAlarmId(null);
    setIsDrawerOpen(true);
  };

  const openAlarm = (alarm: DispatchAlarmEvent) => {
    const node = dispatchEquipmentNodes.find((item) => item.id === alarm.equipmentId);
    const section = dispatchSectionDetails.find((item) => item.relatedAlarmIds.includes(alarm.id));
    if (node) {
      selectEquipment(node, section?.id);
    }
    setSelectedAlarmId(alarm.id);
    setSelectedTrendKey(alarm.trendKey);
    setPassportTab("SCADA-теги");
  };

  const openAiDiagnostics = () => {
    setActiveSectionId("ai");
    setSelectedTrendKey(
      passportSource === "twin"
        ? selectedTwinTrendKey
        : selectedEquipment.visualTone === "anomaly"
          ? "pressure"
          : selectedEquipment.trendKey,
    );
    setAiAnswer(
      `AI-диагностика demo: ${passportEquipment.shortLabel}. Рекомендации сформированы локально, без запроса к BMS/SCADA.`,
    );
    setIsDrawerOpen(true);
  };

  const openTrendsFor = (trendKey: DispatchTrendKey, nodeId?: string) => {
    if (nodeId) {
      setSelectedId(nodeId);
    }
    setActiveSectionId("trends");
    setSelectedTrendKey(trendKey);
    setIsDrawerOpen(true);
  };

  const openDemoTicket = (source: string) => {
    const entry: DemoTicketEntry = {
      equipment: passportEquipment.shortLabel,
      id: `demo-ticket-${Date.now()}`,
      section: selectedSectionLabel,
      severity: ticketSeverity,
      source,
      status: "Prepared locally · not sent · No real equipment control",
      tag: ticketSourceTag,
      time: demoTime,
    };

    setTicketJournal((current) => [entry, ...current].slice(0, 4));
    setModal("ticket");
  };

  const recordReadonlyAttempt = (action: string) => {
    const time = new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date());

    setReadonlyAuditLog((current) =>
      [
        {
          action,
          equipment: passportEquipment.shortLabel,
          role: readonlyUserRole,
          time,
        },
        ...current,
      ].slice(0, 4),
    );
    setModal("readonly");
  };

  const handleAiSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAiAnswer(
      "AI анализирует mock-данные. Для реального ответа требуется подключение к BMS/SCADA historian.",
    );
  };

  return (
    <div className="dispatchShell">
      <div className="dispatchGrid" aria-label="Demo dashboard диспетчеризации">
        <header className="dispatchHeader panel">
          <div>
            <p className="eyebrow">UPGRADE Dispatch / Asia Park Astana</p>
            <h1>
              Интеллектуальная диспетчеризация существующей BMS/SCADA: холодоснабжение, вентиляция,
              насосные группы, чиллеры Trane, аварии, тренды, паспорта оборудования и AI-диагностика.
            </h1>
          </div>
          <div className="headerStatus">
            <span>Связь: Онлайн</span>
            <strong>BMS/SCADA 10.50.4.41</strong>
            <span>Роль: {readonlyUserRole}</span>
            <span className="readOnlyBadge">Read-only / Demo mode</span>
            <b>DEMO MODE</b>
          </div>
        </header>

        <aside className="leftRail">
          <section className="sectionPanel panel">
            <div className="panelHeading">
              <p className="eyebrow">Engineering modules</p>
              <h2>Разделы диспетчеризации</h2>
            </div>
            <div className="sectionList" aria-label="Инженерные разделы">
              {dispatchSections.map((section) => {
                const detail =
                  dispatchSectionDetails.find((item) => item.id === section.id) ?? dispatchSectionDetails[0];
                const sectionAlarmCount = detail.relatedAlarmIds.length;

                return (
                  <button
                    key={section.id}
                    type="button"
                    className={`sectionItem ${activeSectionId === section.id ? "isActive" : ""}`}
                    onClick={() => selectSection(section.id)}
                  >
                    <span>
                      {section.label}
                      {section.badge ? <b>{section.badge}</b> : null}
                    </span>
                    <small>
                      {detail.equipmentCount} · {sectionAlarmCount ? `${sectionAlarmCount} event` : "no active alarm"}
                    </small>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="panel">
            <div className="panelHeading">
              <p className="eyebrow">Live telemetry</p>
              <h2>Мониторинг в реальном времени</h2>
            </div>
            <div className="kpiGrid">
              {realtimeMetrics.map((metric) => (
                <article
                  className={`kpiCard ${metric.quality === "DATA_ERROR" ? "isDataError" : ""}`}
                  data-testid={metric.quality === "DATA_ERROR" ? "dispatch-data-error-metric" : undefined}
                  key={metric.label}
                >
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <small>{metric.state} · {metric.trend}</small>
                  {metric.quality === "DATA_ERROR" ? <b>!</b> : null}
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panelHeading">
              <p className="eyebrow">Events · {selectedSection.id}</p>
              <h2>Аварии и события</h2>
            </div>
            <div className="eventContext">
              <span>Контекст раздела</span>
              <strong>{selectedSection.lastEvent}</strong>
            </div>
            <div className="eventList">
              {notificationItems.map((alarm) => (
                <button
                  className={`eventItem ${alarm.severity} ${
                    relatedAlarms.some((related) => related.id === alarm.id) ? "isRelated" : ""
                  } ${alarm.quality === "DATA_ERROR" ? "isDataError" : ""}`}
                  data-alarm-severity={alarm.severity}
                  data-alarm-sla-status={alarm.sla.status}
                  data-testid={alarm.quality === "DATA_ERROR" ? "dispatch-data-error-alarm" : undefined}
                  key={alarm.id}
                  type="button"
                  onClick={() => openAlarm(alarm)}
                >
                  <span className="eventMeta">
                    <b className={`severityBadge ${alarm.severity}`}>{severityLabel(alarm.severity)}</b>
                    <time>{alarm.time}</time>
                  </span>
                  <strong>{alarm.title}</strong>
                  <small>{alarm.description}</small>
                  <span
                    className={`slaTimer ${alarm.sla.status}`}
                    data-testid={`dispatch-alarm-sla-${alarm.id}`}
                  >
                    <span>SLA</span>
                    <b>{alarm.sla.label}</b>
                    <small>{alarm.sla.target}</small>
                  </span>
                  {alarm.quality === "DATA_ERROR" ? <em>DATA_ERROR · tag quarantined</em> : null}
                </button>
              ))}
            </div>
            <button
              className="secondaryButton full"
              data-action-state="opens-demo-ticket"
              type="button"
              onClick={() => openDemoTicket("active alarm panel")}
            >
              Создать заявку
            </button>
          </section>

          <DispatchTrendsPanel
            trendSeries={trendSeries}
            selectedTrendKey={selectedTrendKey}
            onTrendChange={setSelectedTrendKey}
          />

          <section className="panel">
            <div className="panelHeading">
              <p className="eyebrow">AI analytics</p>
              <h2>AI-аналитика и прогнозирование</h2>
            </div>
            <div className="aiCategoryStack" data-testid="dispatch-ai-categories">
              {aiInsightCategories.map((category) => {
                const categoryInsights = dispatchAiInsights.filter((insight) => insight.category === category.id);

                return (
                  <section
                    className="aiCategoryGroup"
                    data-testid={`dispatch-ai-category-${category.id}`}
                    key={category.id}
                  >
                    <div className="aiCategoryHeader">
                      <span>{category.title}</span>
                      <small>{category.helper}</small>
                    </div>
                    <div className="aiGrid">
                      {categoryInsights.map((insight) => (
                        <button
                          className="aiInsight"
                          data-testid={`dispatch-ai-insight-${insight.id}`}
                          key={insight.id}
                          type="button"
                          onClick={() => {
                            const node = dispatchEquipmentNodes.find((item) => item.id === insight.equipmentId);
                            if (node) {
                              selectEquipment(node, insight.id === "anomaly" ? "ai" : undefined);
                            } else {
                              selectSection("ai");
                            }
                          }}
                        >
                          <span>{insight.title}</span>
                          <strong>{insight.value}</strong>
                          <small>{insight.description}</small>
                        </button>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
            <form className="aiInput" onSubmit={handleAiSubmit}>
              <input aria-label="AI assistant" placeholder="Задайте вопрос по объекту..." />
              <button data-testid="dispatch-ai-submit" type="submit">AI</button>
            </form>
            {aiAnswer ? <p className="aiAnswer" data-testid="dispatch-ai-answer">{aiAnswer}</p> : null}
          </section>
        </aside>

        <main className="twinPanel panel">
          <div className="twinTopline">
            <div>
              <p className="eyebrow">Digital twin</p>
              <h2>{dispatchSections.find((section) => section.id === activeSectionId)?.label}</h2>
            </div>
            <div className="readOnlyPill">Read-only / control locked</div>
          </div>

          <EquipmentTwinGrid
            selectedTwinId={selectedTwinId}
            twinStates={twinStates}
            relatedTwinIds={relatedTwinIds}
            onSelectTwin={selectTwin}
            onToggleTwinState={toggleTwinState}
            onOpenPassport={() => {
              setPassportSource("twin");
              setIsDrawerOpen(true);
            }}
          />

          <div className="twinStage">
            <div className="stageLegend">
              <span><i className="legendAhu" />AHU VC-13/VC-11</span>
              <span><i className="legendAnomaly" />DP data-quality</span>
            </div>
            {hasDpAnomalyContext ? (
              <div className="anomalyCallout">
                <span>AI insight</span>
                DP DATA_ERROR · вне диапазона 0–16 bar · проверить scaling/register
              </div>
            ) : null}

            <svg className="flowLayer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path className="flowPath pathOne" d="M13 25 C28 18 35 38 50 28 S75 18 84 31" />
              <path className="flowPath pathTwo" d="M18 72 C34 60 44 84 61 72 S77 55 91 58" />
              <path className="flowPath pathThree" d="M8 50 C28 48 35 54 49 49 S70 37 90 42" />
              <circle className="dataDot dotOne" r="1.2">
                <animateMotion dur="4.8s" repeatCount="indefinite" path="M13 25 C28 18 35 38 50 28 S75 18 84 31" />
              </circle>
              <circle className="dataDot dotTwo" r="1.1">
                <animateMotion dur="5.8s" repeatCount="indefinite" path="M18 72 C34 60 44 84 61 72 S77 55 91 58" />
              </circle>
              <circle className="dataDot dotThree" r="1">
                <animateMotion dur="4.2s" repeatCount="indefinite" path="M8 50 C28 48 35 54 49 49 S70 37 90 42" />
              </circle>
            </svg>

            <div className="buildingIso" aria-hidden="true">
              <div className="roofDeck">
                <span />
                <span />
                <span />
              </div>
              <div className="tower towerA">
                {Array.from({ length: 24 }).map((_, index) => (
                  <i key={index} />
                ))}
              </div>
              <div className="tower towerB">
                {Array.from({ length: 18 }).map((_, index) => (
                  <i key={index} />
                ))}
              </div>
              <div className="techFloor">
                <b />
                <b />
                <b />
                <b />
              </div>
              <div className="plantRoom">
                <span>CH-1</span>
                <span>ШУ-2</span>
                <span>VC-13</span>
              </div>
            </div>

            {dispatchEquipmentNodes.map((node) => {
              const isSelected = node.id === selectedEquipment.id;
              const hasAlarm = node.relatedAlarmIds.some((id) => alarmEvents.find((alarm) => alarm.id === id)?.severity === "critical");
              const placementClass =
                node.x > 60 ? "labelLeft" : node.y > 78 ? "labelTop" : node.y < 22 ? "labelBottom" : "";
              const toneClass =
                node.visualTone === "ahu" ? "isAhu" : node.visualTone === "anomaly" ? "isAnomaly" : "";

              return (
                <button
                  key={node.id}
                  type="button"
                  className={`equipmentNode ${placementClass} ${toneClass} ${isSelected ? "isSelected" : ""} ${
                    hasAlarm ? "hasAlarm" : ""
                  }`}
                  data-testid={`dispatch-equipment-node-${node.id}`}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  onClick={() => selectEquipment(node)}
                  aria-pressed={isSelected}
                  aria-label={`Открыть ${node.label}`}
                >
                  <span className="nodeCore">
                    {node.visualTone === "ahu" ? <small>AHU</small> : null}
                    {node.visualTone === "anomaly" ? <small>DP</small> : null}
                  </span>
                  <span className="nodeLabel">
                    <strong>{node.shortLabel}</strong>
                    <small>{node.countLabel}</small>
                  </span>
                </button>
              );
            })}
          </div>

          <section className="sectionDetailPanel">
            <div className="sectionDetailHeader">
              <div>
                <p className="eyebrow">Selected module</p>
                <h3>{dispatchSections.find((section) => section.id === activeSectionId)?.label}</h3>
              </div>
              <span>{selectedSection.activeAlarms}</span>
            </div>
            <p>{selectedSection.description}</p>
            <div className="sectionMetrics">
              <div>
                <span>Оборудование</span>
                <strong>{selectedSection.equipmentCount}</strong>
              </div>
              {selectedSection.keyMetrics.map((metric) => (
                <div className={metric.value.includes("DATA_ERROR") ? "isDataError" : undefined} key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  {metric.value.includes("DATA_ERROR") ? <em>range 0–16 bar</em> : null}
                </div>
              ))}
            </div>
            <div className="relatedNodesRow">
              <span>Связанные узлы</span>
              <div>
                {relatedNodes.map((node) => (
                  <button key={node.id} type="button" onClick={() => selectEquipment(node)}>
                    {node.shortLabel}
                  </button>
                ))}
              </div>
            </div>
            <div className="sectionAlarmSummary">
              <span>Связанные события</span>
              {relatedAlarms.length ? (
                <div>
                  {relatedAlarms.map((alarm) => (
                    <button key={alarm.id} type="button" className={alarm.severity} onClick={() => openAlarm(alarm)}>
                      <span>{severityLabel(alarm.severity)} · SLA {alarm.sla.label}</span>
                      {alarm.title}
                    </button>
                  ))}
                </div>
              ) : (
                <small>Активных событий по разделу нет</small>
              )}
            </div>
            <div className="sectionActions">
              <button data-testid="dispatch-section-action-passport" type="button" onClick={() => setIsDrawerOpen(true)}>
                Open passport
              </button>
              <button
                data-testid="dispatch-section-action-ticket"
                type="button"
                onClick={() => openDemoTicket("section action")}
              >
                Create demo ticket
              </button>
              <button
                data-testid="dispatch-section-action-trends"
                type="button"
                onClick={() => openTrendsFor(selectedSection.trendKey, selectedSection.nodeId)}
              >
                Show trends
              </button>
              <button data-testid="dispatch-section-action-ai" type="button" onClick={openAiDiagnostics}>
                AI diagnostics
              </button>
            </div>
          </section>

          <div className="commandStrip">
            <div className="readonlyPolicyBanner" data-testid="dispatch-readonly-policy">
              <strong>Роль: {readonlyUserRole}</strong>
              <span>{readonlyControlTooltip}. Попытки фиксируются локально, без команд в BMS/SCADA.</span>
            </div>
            {controlButtons.map((button) => (
              <span
                aria-disabled="true"
                aria-label={`${button}: ${readonlyControlTooltip}`}
                className="readonlyControl"
                data-testid="dispatch-readonly-control"
                key={button}
                onClick={() => recordReadonlyAttempt(button)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    recordReadonlyAttempt(button);
                  }
                }}
                role="button"
                tabIndex={0}
                title={readonlyControlTooltip}
              >
                <button
                  aria-label={`${button}. ${readonlyControlTooltip}`}
                  disabled
                  title={readonlyControlTooltip}
                  type="button"
                >
                  {button}
                </button>
              </span>
            ))}
          </div>
          <div className="readonlyAuditLog" data-testid="dispatch-readonly-audit-log">
            <strong>Read-only audit</strong>
            {readonlyAuditLog.length ? (
              <ol>
                {readonlyAuditLog.map((entry) => (
                  <li key={`${entry.time}-${entry.action}`}>
                    {entry.time} · роль: {entry.role} · попытка: {entry.action} · {entry.equipment} · No real
                    equipment control
                  </li>
                ))}
              </ol>
            ) : (
              <span>Попытки управления будут фиксироваться локально в demo-журнале.</span>
            )}
          </div>

          <div className="demoTicketJournal" data-testid="dispatch-demo-ticket-journal">
            <div className="demoTicketJournalHeader">
              <strong>Demo ticket journal</strong>
              <span>Local only · no external send · No real equipment control</span>
            </div>
            {ticketJournal.length ? (
              <ol>
                {ticketJournal.map((entry) => (
                  <li key={entry.id}>
                    <span>
                      {entry.time} · {entry.status}
                    </span>
                    <strong>
                      {entry.equipment} · {entry.section}
                    </strong>
                    <small>
                      {entry.severity} · {entry.tag} · source: {entry.source}
                    </small>
                  </li>
                ))}
              </ol>
            ) : (
              <p>No demo tickets prepared in this session.</p>
            )}
          </div>

          <section className="recommendationPanel">
            <div>
              <p className="eyebrow">AI recommendations</p>
              <h3>{passportEquipment.shortLabel}</h3>
            </div>
            <ul>
              {passportEquipment.aiRecommendations.map((recommendation) => (
                <li key={recommendation}>{recommendation}</li>
              ))}
            </ul>
          </section>
        </main>

        <aside className={`passportDrawer panel ${isDrawerOpen ? "isOpen" : ""}`}>
          <button className="drawerClose" type="button" onClick={() => setIsDrawerOpen(false)} aria-label="Закрыть паспорт">
            ×
          </button>
          <div className="panelHeading">
            <p className="eyebrow">Equipment registry</p>
            <h2>Паспортизация оборудования</h2>
          </div>
          <div className="passportHero">
            <div>
              <span className={`statusDot ${statusTone(passportEquipment.status)}`} />
              <strong>{passportEquipment.label}</strong>
              <small>
                Статус: {passportEquipment.status} · {passportSource === "twin" ? "Read-only / demo mode" : "BMS registry"}
              </small>
            </div>
            <div className="qrBox">QR</div>
          </div>

          <div className="passportKpiStrip" data-testid="dispatch-passport-kpi-strip">
            {passportTopKpis.map((kpi) => (
              <article
                className={kpi.quality === "DATA_ERROR" ? "isDataError" : undefined}
                data-testid={`dispatch-passport-kpi-${kpi.id}`}
                key={kpi.id}
              >
                <span>{kpi.label}</span>
                <strong>{kpi.value}</strong>
                <small>{kpi.helper}</small>
              </article>
            ))}
          </div>

          <div className="datasheetSnapshot">
            <div>
              <span>Тип</span>
              <strong>{passportEquipment.type}</strong>
            </div>
            <div>
              <span>Локация</span>
              <strong>{passportEquipment.location}</strong>
            </div>
            <div>
              <span>Последнее событие</span>
              <strong>{passportLastEvent}</strong>
            </div>
            <div>
              <span>Сервисная заметка</span>
              <strong>{passportEquipment.serviceNote}</strong>
            </div>
          </div>

          {selectedAlarm ? (
            <div className="selectedAlarmContext" data-testid="dispatch-selected-alarm-context">
              <span className={`severityBadge ${selectedAlarm.severity}`}>{severityLabel(selectedAlarm.severity)}</span>
              <div>
                <strong>{selectedAlarm.title}</strong>
                <small>
                  Source tag: <code>{selectedAlarm.sourceTagId}</code> · Related trend: {selectedAlarm.trendKey} · SLA{" "}
                  {selectedAlarm.sla.label}
                </small>
              </div>
            </div>
          ) : null}

          <div className="passportTabs" role="tablist" aria-label="Разделы паспорта">
            {passportTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={passportTab === tab}
                className={passportTab === tab ? "isActive" : undefined}
                onClick={() => setPassportTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {passportTab === "Паспорт" ? (
            <>
              <dl className="passportList">
                <div><dt>Название</dt><dd>{passportEquipment.label}</dd></div>
                <div><dt>Статус</dt><dd>{passportEquipment.status}</dd></div>
                <div><dt>Режим</dt><dd>{passportSource === "twin" ? "Auto/Manual/read-only marker: Read-only / demo mode" : "Read-only / control locked"}</dd></div>
                <div><dt>Система</dt><dd>{passportEquipment.type}</dd></div>
                <div><dt>Модель</dt><dd>{passportEquipment.model}</dd></div>
                <div><dt>Серийный номер</dt><dd>{passportEquipment.serial}</dd></div>
                <div><dt>Инвентарный номер</dt><dd>{passportEquipment.inventoryNumber}</dd></div>
                <div><dt>Местоположение</dt><dd>{passportEquipment.location}</dd></div>
                <div><dt>Производитель</dt><dd>{passportEquipment.manufacturer}</dd></div>
                <div><dt>Год выпуска</dt><dd>{passportEquipment.year}</dd></div>
                <div><dt>Последнее событие</dt><dd>{passportLastEvent}</dd></div>
                <div><dt>Сервис</dt><dd>{passportEquipment.serviceNote}</dd></div>
              </dl>
              <div className="linkedSystemsBlock">
                <span>Связанные системы</span>
                <div>
                  {passportEquipment.linkedSystems.map((system) => (
                    <small key={system}>{system}</small>
                  ))}
                </div>
              </div>
              {passportSource === "twin" ? (
                <div className="linkedSystemsBlock">
                  <span>Тренды</span>
                  <div>
                    {selectedTwin.trends.map((trend) => (
                      <small key={trend}>{trend}</small>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          {passportTab === "Параметры" ? (
            <div className="paramGrid">
              {passportEquipment.onlineParams.map((param) => (
                <div className={param.quality === "DATA_ERROR" ? "isDataError" : undefined} key={param.label}>
                  <span>{param.label}</span>
                  <strong>{param.value}</strong>
                  {param.quality === "DATA_ERROR" ? <em>DATA_ERROR · tag quarantined</em> : null}
                </div>
              ))}
            </div>
          ) : null}

          {passportTab === "SCADA-теги" ? (
            <div className="scadaTagTable" data-testid="dispatch-passport-scada-tags">
              <div className="scadaTagSummary">
                <span>Read-only SCADA/BMS mapping</span>
                <strong>{passportScadaRows.length} tags · gateway 10.50.4.41 · no write commands</strong>
              </div>
              <div className="scadaTagHeader" aria-hidden="true">
                <span>Tag</span>
                <span>Type</span>
                <span>Register</span>
                <span>Scaling</span>
                <span>Unit</span>
                <span>Quality</span>
              </div>
              {passportScadaRows.map((row) => {
                const isSelectedAlarmSource = row.tag === selectedAlarmSourceTag;

                return (
                  <article
                    className={`${row.quality === "DATA_ERROR" ? "isDataError" : ""} ${
                      isSelectedAlarmSource ? "isAlarmSource" : ""
                    }`}
                    data-testid={
                      isSelectedAlarmSource ? "dispatch-selected-alarm-source-tag" : "dispatch-passport-scada-tag-row"
                    }
                    key={row.tag}
                  >
                    <code>{row.tag}</code>
                    <span>{row.signalType}</span>
                    <span>{row.register}</span>
                    <span>{row.scaling}</span>
                    <span>{row.unit}</span>
                    <strong>{isSelectedAlarmSource ? `${row.quality} · SOURCE` : row.quality}</strong>
                  </article>
                );
              })}
            </div>
          ) : null}

          {passportTab === "ТО" ? (
            <>
              <div className="serviceNote">
                <span>Service note</span>
                <strong>{passportEquipment.serviceNote}</strong>
              </div>
              <div className="serviceList">
                {passportEquipment.serviceHistory.map((item) => (
                  <article key={`${item.date}-${item.title}`}>
                    <span>{item.date}</span>
                    <strong>{item.title}</strong>
                    <small>{item.result}</small>
                  </article>
                ))}
              </div>
            </>
          ) : null}

          {passportTab === "Документы" ? (
            <>
              <div className="documentList">
                {passportEquipment.documents.map((document) => (
                  <button
                    key={document.title}
                    type="button"
                    onClick={() => {
                      if (document.title === "Создать заявку") {
                        openDemoTicket("passport document action");
                      } else if (document.title === "Открыть тренды") {
                        openTrendsFor(passportEquipment.trendKey, passportTrendNodeId);
                      } else {
                        setModal("readonly");
                      }
                    }}
                  >
                    <span>{document.type}</span>
                    {document.title}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          <div className="relatedBlock">
            <span>Связанные аварии/тренды</span>
            {passportRelatedAlarms.length ? (
              passportRelatedAlarms.map((alarm) => <button key={alarm.id} type="button" onClick={() => openAlarm(alarm)}>{alarm.title}</button>)
            ) : (
              <small>{passportSource === "twin" ? "Активных аварий нет; twin работает в demo/read-only режиме" : "Активных аварий нет"}</small>
            )}
          </div>

          <div className="aiRecommendationBlock">
            <span>AI recommendation</span>
            <strong>{passportEquipment.aiRecommendations[0]}</strong>
          </div>

          <div className="drawerActions">
            <button
              data-testid="dispatch-drawer-action-ticket"
              type="button"
              onClick={() => openDemoTicket("passport drawer")}
            >
              Создать заявку
            </button>
            <button
              data-testid="dispatch-drawer-action-trends"
              type="button"
              onClick={() => openTrendsFor(passportEquipment.trendKey, passportTrendNodeId)}
            >
              Открыть тренды
            </button>
            <button data-testid="dispatch-drawer-action-ai" type="button" onClick={openAiDiagnostics}>
              AI-диагностика
            </button>
            <button data-testid="dispatch-drawer-action-readonly" type="button" onClick={() => setModal("readonly")}>
              Read-only controls
            </button>
          </div>
        </aside>

        <aside className="notificationsPanel panel">
          <div className="panelHeading">
            <p className="eyebrow">Notifications</p>
            <h2>Уведомления</h2>
          </div>
          {notificationItems.map((alarm) => (
            <button key={alarm.id} type="button" onClick={() => openAlarm(alarm)}>
              <span>{severityLabel(alarm.severity)} · SLA {alarm.sla.label}</span>
              <strong>{alarm.title.replace(" на ШУ-2", "")}</strong>
            </button>
          ))}
          <button className="secondaryButton" type="button" onClick={() => setModal("readonly")}>
            Все уведомления
          </button>
        </aside>
      </div>

      <nav className="dispatchBottomNav" aria-label="Навигация диспетчерской">
        <div className="bottomNavSections" aria-label="Разделы диспетчерской">
          {dispatchSections.map((section) => {
            const detail =
              dispatchSectionDetails.find((item) => item.id === section.id) ?? dispatchSectionDetails[0];
            const sectionAlarmCount = detail.relatedAlarmIds.length;

            return (
              <button
                key={section.id}
                type="button"
                className={activeSectionId === section.id ? "isActive" : undefined}
                onClick={() => selectSection(section.id)}
              >
                <span>{section.label}</span>
                {sectionAlarmCount ? <small aria-label={`${sectionAlarmCount} active events`}>{sectionAlarmCount}</small> : null}
              </button>
            );
          })}
        </div>
        <div className="bottomMeta">
          <span>Связь с объектом: Онлайн / Simulated gateway</span>
          <span>Пользователь: Диспетчер</span>
          <input aria-label="Текущее demo-время" value={demoTime} onChange={(event) => setDemoTime(event.target.value)} />
          <b>DEMO MODE</b>
        </div>
      </nav>

      {modal ? (
        <div className="modalBackdrop" role="presentation" onMouseDown={() => setModal(null)}>
          <div
            className="demoModal"
            data-testid="dispatch-demo-modal"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button data-testid="dispatch-modal-close" type="button" onClick={() => setModal(null)} aria-label="Закрыть">×</button>
            {modal === "readonly" ? (
              <>
                <h2>Управление оборудованием отключено</h2>
                <p>
                  Управление оборудованием отключено в демонстрационном режиме. Для реального управления требуется
                  интеграция с BMS/SCADA, подтверждение прав доступа, аудит тегов и согласование с эксплуатационной
                  службой.
                </p>
                {readonlyAuditLog[0] ? (
                  <div className="modalAuditEntry">
                    <strong>Попытка управления зафиксирована локально</strong>
                    <span>
                      {readonlyAuditLog[0].time} · {readonlyAuditLog[0].action} ·{" "}
                      {readonlyAuditLog[0].equipment} · роль: {readonlyAuditLog[0].role} · No real equipment control
                    </span>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <div className="ticketModalHeader">
                  <span>DEMO</span>
                  <h2>Demo-заявка подготовлена локально</h2>
                </div>
                <p>
                  Это read-only payload для внешней CMMS/Service Desk интеграции. Заявка не отправлена во внешнюю
                  систему и не создает команду в BMS/SCADA.
                </p>
                <dl className="ticketPayload" data-testid="dispatch-demo-ticket-payload">
                  <div>
                    <dt>Объект</dt>
                    <dd>{objectSummary.name}</dd>
                  </div>
                  <div>
                    <dt>Раздел</dt>
                    <dd>{selectedSectionLabel}</dd>
                  </div>
                  <div>
                    <dt>Оборудование</dt>
                    <dd>{passportEquipment.shortLabel}</dd>
                  </div>
                  <div>
                    <dt>Источник / tag</dt>
                    <dd>{ticketSourceTag}</dd>
                  </div>
                  <div>
                    <dt>Severity</dt>
                    <dd>{ticketSeverity}</dd>
                  </div>
                  <div>
                    <dt>Timestamp</dt>
                    <dd>{demoTime}</dd>
                  </div>
                  <div>
                    <dt>Контекст события</dt>
                    <dd>{ticketSourceAlarm ? ticketSourceAlarm.title : selectedSection.lastEvent}</dd>
                  </div>
                  <div>
                    <dt>AI recommendation</dt>
                    <dd>{ticketRecommendation}</dd>
                  </div>
                  <div>
                    <dt>Статус отправки</dt>
                    <dd>Prepared locally · not sent · No real equipment control</dd>
                  </div>
                </dl>
                {ticketJournal[0] ? (
                  <div className="modalTicketJournalEntry">
                    <strong>Запись добавлена в demo-журнал</strong>
                    <span>
                      {ticketJournal[0].time} · {ticketJournal[0].equipment} · {ticketJournal[0].section} ·{" "}
                      {ticketJournal[0].status}
                    </span>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      ) : null}

      <style jsx>{`
        :global(body.is-dispatch-demo .site-header),
        :global(body.is-dispatch-demo .sidebar),
        :global(body.is-dispatch-demo .mobile-bottom-nav),
        :global(body.is-dispatch-demo .skip) {
          display: none !important;
        }

        :global(body.is-dispatch-demo .app-content) {
          width: 100% !important;
          margin-left: 0 !important;
          padding: 0 !important;
        }

        .dispatchShell {
          min-height: 100vh;
          margin: 0;
          padding: 14px 14px 148px;
          color: #dbeafe;
          background:
            radial-gradient(circle at 48% 18%, rgba(14, 165, 233, 0.18), transparent 34%),
            linear-gradient(rgba(34, 211, 238, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.04) 1px, transparent 1px),
            #020712;
          background-size: auto, 34px 34px, 34px 34px, auto;
        }

        .dispatchGrid {
          display: grid;
          grid-template-columns: minmax(270px, 320px) minmax(470px, 1fr) minmax(300px, 340px);
          grid-template-rows: auto 1fr auto;
          gap: 14px;
          min-height: calc(100vh - 116px);
        }

        .panel {
          border: 1px solid rgba(56, 189, 248, 0.26);
          border-radius: 8px;
          background: linear-gradient(145deg, rgba(8, 20, 38, 0.84), rgba(2, 8, 23, 0.74));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.07), 0 18px 52px rgba(0,0,0,0.34);
          backdrop-filter: blur(18px);
        }

        .dispatchHeader {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          padding: 16px 20px;
        }

        .dispatchHeader h1,
        .panelHeading h2,
        .twinTopline h2 {
          margin: 0;
          color: #f8fafc;
          font-size: 20px;
          line-height: 1.15;
        }

        .eyebrow {
          margin: 0 0 6px;
          color: #67e8f9;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .headerStatus {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 10px;
          color: #93c5fd;
          font-size: 11px;
        }

        .headerStatus b,
        .bottomMeta b,
        .readOnlyPill,
        .readOnlyBadge {
          border: 1px solid rgba(34, 211, 238, 0.42);
          border-radius: 999px;
          color: #22d3ee;
          padding: 7px 10px;
          box-shadow: 0 0 22px rgba(34, 211, 238, 0.18);
        }

        .leftRail {
          display: grid;
          gap: 14px;
          align-content: start;
        }

        .leftRail .panel,
        .passportDrawer,
        .notificationsPanel {
          padding: 16px;
        }

        .panelHeading {
          margin-bottom: 14px;
        }

        .sectionPanel {
          overflow: hidden;
        }

        .sectionList {
          display: grid;
          gap: 6px;
        }

        .sectionItem {
          width: 100%;
          border: 1px solid rgba(125, 211, 252, 0.16);
          border-radius: 8px;
          background: rgba(2, 8, 23, 0.56);
          color: #dbeafe;
          cursor: pointer;
          padding: 10px;
          text-align: left;
          transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
        }

        .sectionItem:hover,
        .sectionItem.isActive {
          border-color: rgba(34, 211, 238, 0.72);
          background: rgba(14, 165, 233, 0.16);
          transform: translateX(2px);
        }

        .sectionItem span {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          color: #f8fafc;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.25;
        }

        .sectionItem b {
          border: 1px solid rgba(103, 232, 249, 0.38);
          border-radius: 999px;
          color: #67e8f9;
          flex: 0 0 auto;
          font-size: 9px;
          padding: 2px 6px;
        }

        .sectionItem small {
          display: block;
          margin-top: 5px;
          color: #93c5fd;
          font-size: 11px;
          line-height: 1.25;
        }

        .kpiGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(118px, 1fr));
          gap: 8px;
        }

        .kpiCard,
        .aiInsight,
        .passportKpiStrip article,
        .paramGrid div,
        .serviceList article {
          border: 1px solid rgba(125, 211, 252, 0.18);
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.62);
          min-width: 0;
          padding: 12px;
        }

        .kpiCard span,
        .aiInsight span,
        .passportKpiStrip span,
        .paramGrid span,
        .serviceList span,
        .passportList dt,
        .relatedBlock span {
          display: block;
          color: #93c5fd;
          font-size: 11px;
        }

        .kpiCard strong,
        .aiInsight strong,
        .passportKpiStrip strong,
        .paramGrid strong {
          display: block;
          margin: 7px 0 4px;
          color: #f8fafc;
          font-size: 18px;
          line-height: 1.15;
          overflow-wrap: anywhere;
        }

        .kpiCard small,
        .passportKpiStrip small,
        .serviceList small,
        .passportHero small,
        .relatedBlock small {
          color: #86efac;
          font-size: 11px;
        }

        .kpiCard.isDataError,
        .passportKpiStrip article.isDataError,
        .paramGrid div.isDataError,
        .sectionMetrics div.isDataError {
          border-color: rgba(248, 113, 113, 0.48);
          background: linear-gradient(145deg, rgba(127, 29, 29, 0.28), rgba(15, 23, 42, 0.62));
          box-shadow: inset 3px 0 0 rgba(248, 113, 113, 0.88);
        }

        .kpiCard.isDataError strong,
        .passportKpiStrip article.isDataError strong,
        .paramGrid div.isDataError strong,
        .sectionMetrics div.isDataError strong {
          color: #fecaca;
          overflow-wrap: anywhere;
        }

        .kpiCard.isDataError strong {
          font-size: 13px;
          letter-spacing: 0;
        }

        .kpiCard.isDataError small,
        .paramGrid div.isDataError em,
        .sectionMetrics div.isDataError em {
          display: block;
          margin-top: 4px;
          color: #fca5a5;
          font-size: 11px;
          font-style: normal;
          font-weight: 800;
        }

        .kpiCard.isDataError b {
          display: inline-grid;
          width: 20px;
          height: 20px;
          place-items: center;
          border: 1px solid rgba(248, 113, 113, 0.58);
          border-radius: 999px;
          color: #fee2e2;
          background: rgba(127, 29, 29, 0.72);
        }

        button {
          font: inherit;
        }

        .eventList,
        .serviceList,
        .documentList,
        .relatedBlock {
          display: grid;
          gap: 8px;
        }

        .eventContext,
        .serviceNote,
        .aiRecommendationBlock {
          border: 1px solid rgba(125, 211, 252, 0.18);
          border-radius: 8px;
          background: rgba(8, 47, 73, 0.26);
          margin-bottom: 10px;
          padding: 10px;
        }

        .eventContext span,
        .serviceNote span,
        .aiRecommendationBlock span,
        .linkedSystemsBlock span,
        .tagList span {
          display: block;
          color: #67e8f9;
          font-size: 11px;
          font-weight: 800;
          margin-bottom: 5px;
          text-transform: uppercase;
        }

        .eventContext strong,
        .serviceNote strong,
        .aiRecommendationBlock strong {
          color: #e0f2fe;
          font-size: 12px;
          line-height: 1.45;
        }

        .eventItem,
        .aiInsight,
        .notificationsPanel button,
        .documentList button,
        .relatedBlock button {
          width: 100%;
          border: 1px solid rgba(125, 211, 252, 0.18);
          border-radius: 8px;
          background: rgba(2, 8, 23, 0.66);
          color: #dbeafe;
          cursor: pointer;
          padding: 10px;
          text-align: left;
          transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }

        .eventItem:hover,
        .aiInsight:hover,
        .notificationsPanel button:hover,
        .documentList button:hover,
        .relatedBlock button:hover,
        .equipmentNode:hover .nodeCore {
          border-color: rgba(34, 211, 238, 0.72);
          box-shadow: 0 0 24px rgba(34, 211, 238, 0.16);
          transform: translateY(-1px);
        }

        .eventItem > span,
        .notificationsPanel span {
          color: #67e8f9;
          font-size: 11px;
        }

        .eventMeta {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          align-items: center;
          justify-content: space-between;
        }

        .eventMeta time {
          color: #93c5fd;
          font-size: 11px;
          font-weight: 800;
        }

        .severityBadge {
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(125, 211, 252, 0.28);
          border-radius: 999px;
          color: #dbeafe;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0;
          padding: 3px 7px;
          text-transform: uppercase;
        }

        .severityBadge.critical {
          border-color: rgba(248, 113, 113, 0.66);
          color: #fecaca;
          background: rgba(127, 29, 29, 0.4);
        }

        .severityBadge.warning {
          border-color: rgba(251, 191, 36, 0.62);
          color: #fde68a;
          background: rgba(120, 53, 15, 0.34);
        }

        .severityBadge.info {
          border-color: rgba(125, 211, 252, 0.48);
          color: #bae6fd;
          background: rgba(8, 47, 73, 0.38);
        }

        .eventItem strong,
        .notificationsPanel strong {
          display: block;
          margin: 4px 0;
          color: #f8fafc;
          font-size: 13px;
        }

        .eventItem.critical {
          border-color: rgba(248, 113, 113, 0.45);
        }

        .eventItem.warning {
          border-color: rgba(251, 191, 36, 0.36);
        }

        .eventItem.info {
          border-color: rgba(125, 211, 252, 0.24);
        }

        .slaTimer {
          display: grid;
          grid-template-columns: auto auto 1fr;
          gap: 6px;
          align-items: center;
          border: 1px solid rgba(125, 211, 252, 0.16);
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.55);
          margin-top: 8px;
          padding: 7px 8px;
        }

        .slaTimer > span {
          color: #93c5fd;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .slaTimer > b {
          color: #f8fafc;
          font-size: 12px;
        }

        .slaTimer > small {
          color: #93c5fd;
          font-size: 11px;
          line-height: 1.25;
          text-align: right;
        }

        .slaTimer.due_soon {
          border-color: rgba(248, 113, 113, 0.46);
          background: rgba(127, 29, 29, 0.22);
        }

        .slaTimer.due_soon > b {
          color: #fecaca;
        }

        .slaTimer.on_track {
          border-color: rgba(251, 191, 36, 0.32);
        }

        .slaTimer.monitoring {
          border-style: dashed;
        }

        .eventItem.isDataError {
          border-color: rgba(248, 113, 113, 0.72);
          background: rgba(127, 29, 29, 0.2);
        }

        .eventItem.isDataError em {
          display: inline-flex;
          margin-top: 8px;
          border: 1px solid rgba(248, 113, 113, 0.38);
          border-radius: 999px;
          color: #fecaca;
          font-size: 11px;
          font-style: normal;
          font-weight: 800;
          padding: 4px 7px;
        }

        .eventItem.isRelated {
          background: rgba(14, 165, 233, 0.16);
          box-shadow: inset 3px 0 0 rgba(34, 211, 238, 0.9);
        }

        .eventItem.warning {
          border-color: rgba(251, 191, 36, 0.38);
        }

        .secondaryButton,
        .drawerActions button,
        .sectionActions button,
        .relatedNodesRow button,
        .sectionAlarmSummary button,
        .aiInput button,
        .dispatchBottomNav button {
          border: 1px solid rgba(56, 189, 248, 0.34);
          border-radius: 8px;
          background: rgba(14, 165, 233, 0.1);
          color: #e0f2fe;
          cursor: pointer;
          padding: 9px 11px;
        }

        .full {
          width: 100%;
          margin-top: 10px;
        }

        .aiGrid {
          display: grid;
          gap: 8px;
        }

        .aiCategoryStack {
          display: grid;
          gap: 10px;
        }

        .aiCategoryGroup {
          border: 1px solid rgba(125, 211, 252, 0.16);
          border-radius: 8px;
          background: rgba(2, 8, 23, 0.34);
          padding: 9px;
        }

        .aiCategoryHeader {
          display: grid;
          gap: 3px;
          margin-bottom: 7px;
        }

        .aiCategoryHeader span {
          color: #67e8f9;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .aiCategoryHeader small,
        .aiInsight small {
          color: #93c5fd;
          font-size: 11px;
          line-height: 1.35;
        }

        .aiInput {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .aiInput input,
        .bottomMeta input {
          min-width: 0;
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 8px;
          background: rgba(2, 8, 23, 0.72);
          color: #e0f2fe;
          padding: 10px;
        }

        .aiInput input {
          flex: 1;
        }

        .aiAnswer {
          margin: 10px 0 0;
          color: #bae6fd;
          font-size: 12px;
          line-height: 1.45;
        }

        .twinPanel {
          position: relative;
          display: flex;
          flex-direction: column;
          min-height: 690px;
          overflow: hidden;
          padding: 18px;
        }

        .twinTopline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          position: relative;
          z-index: 2;
        }

        .twinStage {
          position: relative;
          flex: 1;
          min-height: 480px;
          margin: 16px 0;
          border: 1px solid rgba(56, 189, 248, 0.18);
          border-radius: 8px;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 52%, rgba(34, 211, 238, 0.14), transparent 34%),
            linear-gradient(rgba(125, 211, 252, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(125, 211, 252, 0.05) 1px, transparent 1px),
            rgba(2, 8, 23, 0.42);
          background-size: auto, 28px 28px, 28px 28px, auto;
        }

        .stageLegend {
          position: absolute;
          z-index: 4;
          left: 14px;
          top: 14px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          max-width: 62%;
        }

        .stageLegend span,
        .anomalyCallout {
          border: 1px solid rgba(125, 211, 252, 0.22);
          border-radius: 8px;
          background: rgba(2, 8, 23, 0.72);
          color: #bfdbfe;
          font-size: 11px;
          line-height: 1.2;
          padding: 7px 9px;
        }

        .stageLegend i {
          display: inline-block;
          width: 8px;
          height: 8px;
          margin-right: 6px;
          border-radius: 999px;
        }

        .legendAhu {
          background: #22c55e;
          box-shadow: 0 0 12px rgba(34, 197, 94, 0.8);
        }

        .legendAnomaly {
          background: #f59e0b;
          box-shadow: 0 0 12px rgba(245, 158, 11, 0.8);
        }

        .anomalyCallout {
          position: absolute;
          z-index: 4;
          right: 14px;
          top: 14px;
          max-width: 250px;
          border-color: rgba(251, 191, 36, 0.46);
          color: #fde68a;
          box-shadow: 0 0 28px rgba(245, 158, 11, 0.14);
        }

        .anomalyCallout span {
          display: block;
          color: #fbbf24;
          font-size: 10px;
          font-weight: 800;
          margin-bottom: 4px;
          text-transform: uppercase;
        }

        .flowLayer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 0 10px rgba(34, 211, 238, 0.62));
        }

        .flowPath {
          fill: none;
          stroke: rgba(34, 211, 238, 0.58);
          stroke-width: 0.55;
          stroke-dasharray: 1.5 2.1;
          animation: dashFlow 4s linear infinite;
        }

        .pathTwo {
          stroke: rgba(56, 189, 248, 0.5);
          animation-duration: 5.4s;
        }

        .pathThree {
          stroke: rgba(103, 232, 249, 0.42);
          animation-duration: 3.8s;
        }

        .dataDot {
          fill: #e0f2fe;
          filter: drop-shadow(0 0 7px #22d3ee);
        }

        .buildingIso {
          position: absolute;
          left: 50%;
          top: 24%;
          width: min(76%, 700px);
          aspect-ratio: 1.32;
          transform: translate(-50%, -50%) perspective(900px) rotateX(52deg) rotateZ(-38deg) scale(0.96);
          transform-style: preserve-3d;
        }

        .buildingIso::before {
          content: "";
          position: absolute;
          inset: 8% 10% 12% 10%;
          border: 1px solid rgba(186, 230, 253, 0.48);
          background:
            linear-gradient(90deg, rgba(186, 230, 253, 0.18) 1px, transparent 1px),
            linear-gradient(rgba(186, 230, 253, 0.12) 1px, transparent 1px),
            linear-gradient(145deg, rgba(14, 165, 233, 0.28), rgba(6, 78, 118, 0.2));
          background-size: 34px 34px, 34px 34px, auto;
          clip-path: polygon(16% 0, 78% 0, 100% 32%, 82% 100%, 20% 100%, 0 62%);
          box-shadow: inset 0 0 44px rgba(125, 211, 252, 0.16), 0 0 70px rgba(34, 211, 238, 0.22);
        }

        .roofDeck,
        .techFloor,
        .plantRoom,
        .tower {
          position: absolute;
          border: 1px solid rgba(125, 211, 252, 0.42);
          background: linear-gradient(145deg, rgba(59, 130, 246, 0.34), rgba(8, 47, 73, 0.24));
          box-shadow: inset 0 0 34px rgba(186, 230, 253, 0.16), 0 0 52px rgba(14, 165, 233, 0.28);
        }

        .roofDeck {
          inset: 2% 12% 55% 14%;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          padding: 14px;
        }

        .roofDeck span,
        .techFloor b {
          border: 1px solid rgba(34, 211, 238, 0.35);
          background: rgba(34, 211, 238, 0.12);
        }

        .tower {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 4px;
          padding: 10px;
          transform: translateZ(62px);
        }

        .tower i {
          min-height: 12px;
          border: 1px solid rgba(191, 219, 254, 0.24);
          background: rgba(125, 211, 252, 0.12);
        }

        .towerA {
          inset: 18% 48% 18% 17%;
        }

        .towerB {
          inset: 28% 22% 18% 56%;
          transform: translateZ(44px);
        }

        .techFloor {
          inset: 58% 20% 22% 18%;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          padding: 12px;
        }

        .plantRoom {
          inset: 75% 30% 6% 25%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 6px;
          min-width: 0;
          overflow: hidden;
          transform: translateZ(22px);
        }

        .plantRoom span {
          border: 1px solid rgba(34, 211, 238, 0.42);
          color: #cffafe;
          font-size: 11px;
          line-height: 1.1;
          padding: 6px;
        }

        .equipmentNode {
          position: absolute;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 8px;
          max-width: min(218px, 44%);
          border: 0;
          background: transparent;
          color: #dbeafe;
          cursor: pointer;
          transform: translate(0, -50%);
        }

        .equipmentNode.labelLeft {
          flex-direction: row-reverse;
          transform: translate(-100%, -50%);
        }

        .equipmentNode.labelTop {
          flex-direction: column-reverse;
          gap: 6px;
          transform: translate(-50%, -100%);
        }

        .equipmentNode.labelBottom {
          flex-direction: column;
          gap: 6px;
          transform: translate(-50%, 0);
        }

        .nodeCore {
          display: grid;
          place-items: center;
          width: 18px;
          height: 18px;
          border: 1px solid rgba(103, 232, 249, 0.95);
          border-radius: 50%;
          background: radial-gradient(circle, #e0f2fe 0 16%, #22d3ee 17% 36%, rgba(14, 165, 233, 0.25) 37%);
          box-shadow: 0 0 24px rgba(34, 211, 238, 0.72);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .nodeCore small {
          color: #020617;
          font-size: 7px;
          font-weight: 900;
          line-height: 1;
        }

        .nodeLabel {
          box-sizing: border-box;
          min-width: 0;
          width: min(156px, 36vw);
          max-width: 168px;
          border: 1px solid rgba(125, 211, 252, 0.26);
          border-radius: 8px;
          background: rgba(2, 8, 23, 0.72);
          padding: 8px 10px;
          text-align: left;
          box-shadow: 0 10px 28px rgba(0,0,0,0.28);
          overflow-wrap: anywhere;
        }

        .nodeLabel strong,
        .nodeLabel small {
          display: block;
          min-width: 0;
        }

        .nodeLabel strong {
          font-size: 12px;
          line-height: 1.18;
        }

        .nodeLabel small {
          color: #93c5fd;
          font-size: 11px;
          line-height: 1.25;
        }

        .equipmentNode.isSelected .nodeCore,
        .equipmentNode.hasAlarm .nodeCore {
          transform: scale(1.28);
        }

        .equipmentNode.isSelected::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 10px;
          outline: 1px solid rgba(34, 211, 238, 0.58);
          outline-offset: 6px;
          box-shadow: 0 0 34px rgba(34, 211, 238, 0.22);
          pointer-events: none;
        }

        .equipmentNode.isSelected .nodeLabel {
          border-color: rgba(34, 211, 238, 0.85);
          box-shadow: 0 0 32px rgba(34, 211, 238, 0.22);
        }

        .equipmentNode.isAhu .nodeCore {
          width: 24px;
          height: 24px;
          background: radial-gradient(circle, #dcfce7 0 16%, #22c55e 17% 42%, rgba(34, 197, 94, 0.2) 43%);
          box-shadow: 0 0 28px rgba(34, 197, 94, 0.62);
        }

        .equipmentNode.isAhu .nodeLabel {
          border-color: rgba(34, 197, 94, 0.4);
        }

        .equipmentNode.isAnomaly .nodeCore {
          width: 24px;
          height: 24px;
          border-color: rgba(251, 191, 36, 0.94);
          background: radial-gradient(circle, #fef3c7 0 14%, #f59e0b 15% 44%, rgba(245, 158, 11, 0.2) 45%);
          box-shadow: 0 0 28px rgba(245, 158, 11, 0.58);
        }

        .equipmentNode.hasAlarm .nodeCore {
          border-color: rgba(248, 113, 113, 0.95);
          animation: alarmPulse 1.3s ease-in-out infinite;
        }

        .commandStrip {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          position: relative;
          z-index: 2;
        }

        .readonlyPolicyBanner {
          flex: 1 1 100%;
          display: grid;
          gap: 4px;
          border: 1px solid rgba(251, 191, 36, 0.28);
          border-radius: 8px;
          background: rgba(113, 63, 18, 0.16);
          color: #fde68a;
          padding: 9px 10px;
        }

        .readonlyPolicyBanner strong {
          color: #fef3c7;
          font-size: 12px;
        }

        .readonlyPolicyBanner span {
          color: #fcd34d;
          font-size: 12px;
          line-height: 1.35;
        }

        .readonlyControl {
          display: inline-flex;
          border-radius: 8px;
          cursor: not-allowed;
        }

        .readonlyControl button {
          border: 1px solid rgba(148, 163, 184, 0.28);
          border-radius: 8px;
          background: rgba(51, 65, 85, 0.42);
          color: #94a3b8;
          cursor: not-allowed;
          padding: 9px 11px;
          pointer-events: none;
        }

        .readonlyControl:focus-visible {
          outline: 2px solid rgba(125, 211, 252, 0.9);
          outline-offset: 2px;
        }

        .readonlyAuditLog {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          margin: 8px 0 14px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.52);
          color: #cbd5e1;
          font-size: 12px;
          padding: 8px 10px;
        }

        .readonlyAuditLog strong {
          color: #e0f2fe;
        }

        .readonlyAuditLog ol {
          display: grid;
          gap: 3px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .readonlyAuditLog li {
          line-height: 1.35;
        }

        .demoTicketJournal {
          display: grid;
          gap: 10px;
          margin: 8px 0 14px;
          border: 1px solid rgba(34, 197, 94, 0.22);
          border-radius: 8px;
          background: rgba(6, 78, 59, 0.22);
          color: #d1fae5;
          padding: 10px;
        }

        .demoTicketJournalHeader {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 10px;
          align-items: baseline;
          justify-content: space-between;
        }

        .demoTicketJournalHeader strong {
          color: #ecfdf5;
        }

        .demoTicketJournalHeader span,
        .demoTicketJournal p {
          margin: 0;
          color: #a7f3d0;
          font-size: 12px;
          line-height: 1.35;
        }

        .demoTicketJournal ol {
          display: grid;
          gap: 8px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .demoTicketJournal li {
          display: grid;
          gap: 3px;
          border: 1px solid rgba(16, 185, 129, 0.22);
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.34);
          padding: 8px 9px;
        }

        .demoTicketJournal li span,
        .demoTicketJournal li small {
          color: #bbf7d0;
          font-size: 12px;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        .demoTicketJournal li strong {
          color: #f0fdf4;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        .modalAuditEntry {
          display: grid;
          gap: 6px;
          margin-top: 14px;
          border: 1px solid rgba(251, 191, 36, 0.34);
          border-radius: 8px;
          background: rgba(113, 63, 18, 0.2);
          color: #fde68a;
          padding: 10px;
        }

        .modalAuditEntry span {
          color: #fef3c7;
          font-size: 13px;
        }

        .modalTicketJournalEntry {
          display: grid;
          gap: 6px;
          margin-top: 14px;
          border: 1px solid rgba(34, 197, 94, 0.34);
          border-radius: 8px;
          background: rgba(6, 78, 59, 0.24);
          color: #d1fae5;
          padding: 10px;
        }

        .modalTicketJournalEntry span {
          color: #bbf7d0;
          font-size: 13px;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        .sectionDetailPanel {
          box-sizing: border-box;
          position: relative;
          z-index: 2;
          border: 1px solid rgba(125, 211, 252, 0.2);
          border-radius: 8px;
          background: rgba(2, 8, 23, 0.54);
          min-width: 0;
          margin-bottom: 12px;
          overflow: hidden;
          padding: 14px;
        }

        .sectionDetailHeader {
          display: flex;
          align-items: flex-start;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 8px 12px;
          min-width: 0;
          margin-bottom: 8px;
        }

        .sectionDetailHeader h3 {
          flex: 1 1 180px;
          min-width: 0;
          margin: 0;
          color: #f8fafc;
          font-size: 18px;
          line-height: 1.2;
          overflow-wrap: anywhere;
        }

        .sectionDetailHeader > span {
          border: 1px solid rgba(251, 191, 36, 0.32);
          border-radius: 999px;
          color: #fde68a;
          flex: 0 1 auto;
          font-size: 11px;
          max-width: 100%;
          overflow-wrap: anywhere;
          padding: 7px 10px;
        }

        .sectionDetailPanel p {
          margin: 0 0 12px;
          color: #bfdbfe;
          font-size: 13px;
          line-height: 1.45;
        }

        .sectionMetrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 12px;
        }

        .sectionMetrics div {
          border: 1px solid rgba(125, 211, 252, 0.15);
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.58);
          padding: 10px;
        }

        .sectionMetrics span,
        .relatedNodesRow > span,
        .sectionAlarmSummary > span {
          display: block;
          color: #93c5fd;
          font-size: 11px;
          margin-bottom: 4px;
        }

        .sectionMetrics strong {
          color: #f8fafc;
          font-size: 13px;
          line-height: 1.25;
          overflow-wrap: anywhere;
        }

        .relatedNodesRow {
          display: grid;
          gap: 8px;
          margin-bottom: 12px;
        }

        .sectionAlarmSummary {
          border: 1px solid rgba(125, 211, 252, 0.16);
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.42);
          display: grid;
          gap: 8px;
          margin-bottom: 12px;
          padding: 10px;
        }

        .sectionAlarmSummary div {
          display: grid;
          gap: 6px;
        }

        .sectionAlarmSummary button {
          justify-content: flex-start;
          text-align: left;
        }

        .sectionAlarmSummary button.critical {
          border-color: rgba(248, 113, 113, 0.48);
          color: #fecaca;
        }

        .sectionAlarmSummary button.warning {
          border-color: rgba(251, 191, 36, 0.42);
          color: #fde68a;
        }

        .sectionAlarmSummary button.info {
          border-color: rgba(125, 211, 252, 0.36);
          color: #bae6fd;
        }

        .sectionAlarmSummary small {
          color: #64748b;
          font-size: 12px;
        }

        .relatedNodesRow div,
        .sectionActions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .recommendationPanel {
          margin-top: 14px;
          border: 1px solid rgba(34, 211, 238, 0.24);
          border-radius: 8px;
          background: rgba(8, 47, 73, 0.32);
          padding: 14px;
        }

        .recommendationPanel h3 {
          margin: 0;
          color: #f8fafc;
        }

        .recommendationPanel ul {
          margin: 10px 0 0;
          padding-left: 18px;
          color: #bae6fd;
          font-size: 13px;
          line-height: 1.5;
        }

        .passportDrawer {
          position: relative;
          overflow: hidden;
        }

        .drawerClose,
        .demoModal > button {
          position: absolute;
          right: 10px;
          top: 10px;
          border: 1px solid rgba(125, 211, 252, 0.24);
          border-radius: 8px;
          background: rgba(2, 8, 23, 0.72);
          color: #e0f2fe;
          cursor: pointer;
          width: 30px;
          height: 30px;
        }

        .passportHero {
          display: grid;
          grid-template-columns: 1fr 66px;
          gap: 12px;
          align-items: center;
          border: 1px solid rgba(125, 211, 252, 0.18);
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.62);
          padding: 12px;
        }

        .passportHero strong {
          display: block;
          color: #f8fafc;
          line-height: 1.25;
        }

        .passportKpiStrip {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 12px;
        }

        .passportKpiStrip article {
          min-width: 0;
          padding: 10px;
        }

        .passportKpiStrip article:last-child {
          grid-column: 1 / -1;
        }

        .passportKpiStrip strong {
          font-size: 13px;
          line-height: 1.25;
          overflow-wrap: anywhere;
        }

        .statusDot {
          display: inline-block;
          width: 9px;
          height: 9px;
          margin-right: 7px;
          border-radius: 999px;
          background: #22c55e;
          box-shadow: 0 0 14px #22c55e;
        }

        .statusDot.danger {
          background: #f87171;
          box-shadow: 0 0 14px #f87171;
        }

        .statusDot.warning {
          background: #f59e0b;
          box-shadow: 0 0 14px #f59e0b;
        }

        .statusDot.ok {
          background: #22c55e;
          box-shadow: 0 0 14px #22c55e;
        }

        .qrBox {
          display: grid;
          place-items: center;
          aspect-ratio: 1;
          border: 1px dashed rgba(125, 211, 252, 0.45);
          color: #67e8f9;
          font-weight: 800;
        }

        .datasheetSnapshot {
          display: grid;
          gap: 8px;
          margin-top: 12px;
        }

        .datasheetSnapshot div {
          border: 1px solid rgba(125, 211, 252, 0.16);
          border-radius: 8px;
          background: rgba(2, 8, 23, 0.48);
          padding: 9px 10px;
        }

        .datasheetSnapshot span {
          display: block;
          color: #93c5fd;
          font-size: 10px;
          font-weight: 800;
          margin-bottom: 3px;
          text-transform: uppercase;
        }

        .datasheetSnapshot strong {
          color: #e0f2fe;
          font-size: 12px;
          line-height: 1.35;
        }

        .selectedAlarmContext {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 10px;
          align-items: start;
          margin-top: 12px;
          border: 1px solid rgba(251, 191, 36, 0.32);
          border-radius: 8px;
          background: rgba(113, 63, 18, 0.18);
          padding: 10px;
        }

        .selectedAlarmContext strong {
          display: block;
          color: #fef3c7;
          font-size: 13px;
          line-height: 1.3;
          margin-bottom: 3px;
        }

        .selectedAlarmContext small {
          color: #fde68a;
          font-size: 12px;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        .selectedAlarmContext code {
          color: #fecaca;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          overflow-wrap: anywhere;
        }

        .passportTabs {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 6px;
          margin: 12px 0;
        }

        .passportTabs button {
          border: 1px solid rgba(125, 211, 252, 0.18);
          border-radius: 8px;
          background: rgba(2, 8, 23, 0.48);
          color: #93c5fd;
          cursor: pointer;
          min-height: 40px;
          overflow-wrap: anywhere;
          padding: 8px 7px;
          line-height: 1.15;
          white-space: normal;
        }

        .passportTabs button.isActive {
          border-color: rgba(34, 211, 238, 0.68);
          color: #e0f2fe;
          background: rgba(14, 165, 233, 0.18);
        }

        .passportList {
          display: grid;
          gap: 8px;
          margin: 0;
        }

        .passportList div {
          display: grid;
          grid-template-columns: 110px 1fr;
          gap: 10px;
          border-bottom: 1px solid rgba(125, 211, 252, 0.12);
          padding-bottom: 8px;
        }

        .passportList dd {
          margin: 0;
          color: #f8fafc;
          font-size: 13px;
        }

        .linkedSystemsBlock {
          border: 1px solid rgba(125, 211, 252, 0.16);
          border-radius: 8px;
          background: rgba(2, 8, 23, 0.4);
          margin-top: 10px;
          padding: 10px;
        }

        .linkedSystemsBlock div {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .linkedSystemsBlock small {
          border: 1px solid rgba(56, 189, 248, 0.24);
          border-radius: 999px;
          color: #bfdbfe;
          padding: 5px 8px;
        }

        .paramGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }

        .tagList {
          display: grid;
          gap: 6px;
          margin-bottom: 10px;
        }

        .tagList code {
          border: 1px solid rgba(125, 211, 252, 0.16);
          border-radius: 8px;
          background: rgba(2, 8, 23, 0.62);
          color: #bae6fd;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 11px;
          padding: 8px;
          white-space: normal;
        }

        .scadaTagTable {
          display: grid;
          gap: 7px;
        }

        .scadaTagSummary {
          border: 1px solid rgba(125, 211, 252, 0.18);
          border-radius: 8px;
          background: rgba(2, 8, 23, 0.52);
          padding: 10px;
        }

        .scadaTagSummary span,
        .scadaTagHeader span,
        .scadaTagTable article span {
          color: #93c5fd;
          font-size: 11px;
          font-weight: 800;
        }

        .scadaTagSummary strong {
          display: block;
          margin-top: 4px;
          color: #e0f2fe;
          font-size: 12px;
          line-height: 1.35;
        }

        .scadaTagHeader,
        .scadaTagTable article {
          display: grid;
          grid-template-columns: minmax(130px, 1.4fr) 42px minmax(72px, 0.8fr) minmax(82px, 0.9fr) 52px 78px;
          gap: 7px;
          align-items: center;
        }

        .scadaTagHeader {
          padding: 0 8px;
        }

        .scadaTagTable article {
          border: 1px solid rgba(125, 211, 252, 0.16);
          border-radius: 8px;
          background: rgba(2, 8, 23, 0.62);
          padding: 8px;
        }

        .scadaTagTable article.isDataError {
          border-color: rgba(248, 113, 113, 0.48);
          background: rgba(127, 29, 29, 0.18);
        }

        .scadaTagTable article.isAlarmSource {
          border-color: rgba(251, 191, 36, 0.82);
          box-shadow: 0 0 0 1px rgba(251, 191, 36, 0.22), 0 0 28px rgba(251, 191, 36, 0.12);
        }

        .scadaTagTable code {
          min-width: 0;
          color: #bae6fd;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 11px;
          overflow-wrap: anywhere;
        }

        .scadaTagTable strong {
          color: #bbf7d0;
          font-size: 11px;
        }

        .scadaTagTable article.isDataError strong {
          color: #fecaca;
        }

        .documentList button span {
          display: inline-grid;
          place-items: center;
          width: 38px;
          margin-right: 8px;
          color: #67e8f9;
        }

        .relatedBlock {
          margin-top: 14px;
        }

        .aiRecommendationBlock {
          margin-top: 12px;
          margin-bottom: 0;
        }

        .drawerActions {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-top: 14px;
        }

        .notificationsPanel {
          grid-column: 3;
          align-self: end;
        }

        .dispatchBottomNav {
          position: fixed;
          z-index: 18;
          left: 0;
          right: 0;
          bottom: 0;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(260px, auto);
          align-items: center;
          gap: 12px;
          border-top: 1px solid rgba(56, 189, 248, 0.28);
          background: rgba(2, 8, 23, 0.94);
          box-shadow: 0 -18px 44px rgba(0,0,0,0.36);
          overflow: visible;
          padding: 10px 14px;
          scrollbar-width: thin;
          backdrop-filter: blur(18px);
        }

        .bottomNavSections {
          display: flex;
          flex-wrap: wrap;
          align-items: stretch;
          gap: 7px;
          min-width: 0;
          max-height: 128px;
          overflow-x: hidden;
          overflow-y: auto;
          padding-right: 2px;
          scrollbar-width: thin;
        }

        .dispatchBottomNav button {
          flex: 1 1 150px;
          display: inline-flex;
          position: relative;
          align-items: center;
          justify-content: center;
          gap: 0;
          min-width: 148px;
          max-width: 210px;
          min-height: 42px;
          overflow-wrap: normal;
          word-break: normal;
          text-align: center;
          white-space: normal;
          line-height: 1.2;
          font-size: 12px;
          padding: 9px 30px 9px 9px;
        }

        .dispatchBottomNav button span {
          display: block;
          min-width: 0;
          max-width: 100%;
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: normal;
        }

        .dispatchBottomNav button small {
          display: inline-grid;
          position: absolute;
          top: 5px;
          right: 6px;
          place-items: center;
          min-width: 20px;
          height: 20px;
          border: 1px solid rgba(251, 191, 36, 0.38);
          border-radius: 999px;
          background: rgba(251, 191, 36, 0.14);
          color: #fde68a;
          font-size: 10px;
          font-weight: 900;
          line-height: 1;
          padding: 0 5px;
        }

        .dispatchBottomNav button.isActive {
          border-color: rgba(34, 211, 238, 0.72);
          background: rgba(14, 165, 233, 0.22);
          color: #ffffff;
        }

        .bottomMeta {
          flex: 0 0 auto;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          max-width: 420px;
          margin-left: 0;
          color: #93c5fd;
          font-size: 11px;
          white-space: nowrap;
        }

        .bottomMeta input {
          width: 146px;
          padding: 7px 9px;
          font-size: 12px;
        }

        .modalBackdrop {
          position: fixed;
          z-index: 40;
          inset: 0;
          display: grid;
          place-items: center;
          background: rgba(0, 0, 0, 0.64);
          padding: 20px;
        }

        .demoModal {
          position: relative;
          width: min(560px, 100%);
          border: 1px solid rgba(34, 211, 238, 0.42);
          border-radius: 8px;
          background: #020817;
          color: #dbeafe;
          box-shadow: 0 0 64px rgba(34, 211, 238, 0.2);
          padding: 28px;
        }

        .demoModal h2 {
          margin: 0 36px 12px 0;
          color: #f8fafc;
        }

        .demoModal p {
          margin: 0;
          color: #bfdbfe;
          line-height: 1.55;
        }

        .ticketModalHeader {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin: 0 36px 12px 0;
        }

        .ticketModalHeader span {
          flex: 0 0 auto;
          border: 1px solid rgba(251, 191, 36, 0.4);
          border-radius: 999px;
          background: rgba(113, 63, 18, 0.24);
          color: #fde68a;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.12em;
          padding: 5px 8px;
        }

        .ticketModalHeader h2 {
          margin: 0;
        }

        .ticketPayload {
          display: grid;
          gap: 8px;
          margin: 16px 0 0;
        }

        .ticketPayload div {
          display: grid;
          grid-template-columns: minmax(120px, 0.4fr) minmax(0, 1fr);
          gap: 10px;
          border: 1px solid rgba(125, 211, 252, 0.14);
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.52);
          padding: 9px 10px;
        }

        .ticketPayload dt {
          color: #93c5fd;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .ticketPayload dd {
          margin: 0;
          color: #e0f2fe;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        @keyframes dashFlow {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -18; }
        }

        @keyframes alarmPulse {
          0%, 100% { box-shadow: 0 0 18px rgba(248, 113, 113, 0.45); }
          50% { box-shadow: 0 0 36px rgba(248, 113, 113, 0.95); }
        }

        @media (max-width: 1120px) {
          .dispatchGrid {
            grid-template-columns: minmax(280px, 360px) minmax(520px, 1fr);
          }

          .passportDrawer,
          .notificationsPanel {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 980px) {
          .dispatchShell {
            margin: -16px;
            padding: 16px 16px 184px;
          }

          .dispatchGrid {
            display: block;
          }

          .leftRail,
          .twinPanel,
          .passportDrawer,
          .notificationsPanel {
            margin-top: 14px;
          }

          .twinPanel {
            min-height: 680px;
          }

          .dispatchBottomNav {
            grid-template-columns: 1fr;
            overflow: visible;
          }

          .bottomNavSections {
            max-height: 132px;
          }

          .bottomMeta {
            justify-content: center;
            overflow: hidden;
            white-space: normal;
          }
        }

        @media (max-width: 760px) {
          .dispatchShell {
            padding-bottom: 248px;
          }

          .dispatchHeader {
            align-items: flex-start;
            gap: 12px;
          }

          .dispatchHeader h1 {
            font-size: 18px;
          }

          .headerStatus {
            justify-content: flex-start;
            width: 100%;
          }

          .passportKpiStrip {
            grid-template-columns: 1fr;
          }

          .sectionMetrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .passportTabs {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .passportTabs button {
            overflow-wrap: anywhere;
          }

          .scadaTagHeader {
            display: none;
          }

          .scadaTagTable article {
            grid-template-columns: 1fr 1fr;
          }

          .scadaTagTable article code {
            grid-column: 1 / -1;
          }

          .dispatchBottomNav {
            display: grid;
            grid-template-columns: 1fr;
            align-items: stretch;
            gap: 6px;
            overflow: visible;
            padding: 8px;
          }

          .bottomNavSections {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 6px;
            max-height: 174px;
            overflow-x: hidden;
            overflow-y: auto;
            padding-right: 0;
          }

          .dispatchBottomNav button {
            min-width: 0;
            min-height: 40px;
            max-width: none;
            width: 100%;
            white-space: normal;
            overflow-wrap: anywhere;
            word-break: normal;
            padding: 8px 6px;
            font-size: 11px;
            line-height: 1.15;
          }

          .dispatchBottomNav button small {
            top: 4px;
            right: 4px;
          }

          .bottomMeta {
            grid-column: 1 / -1;
            justify-content: center;
            margin-left: 0;
            min-width: 0;
            overflow: hidden;
            white-space: normal;
          }

          .bottomMeta span,
          .bottomMeta input {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
