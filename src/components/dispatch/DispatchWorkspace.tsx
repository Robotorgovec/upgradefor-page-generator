"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useMemo,
  useReducer,
  useState,
  type Dispatch,
  type KeyboardEvent,
} from "react";

import { DISPATCH_DEMO_LABEL, type DispatchTelemetryPayload } from "../../lib/dispatch/dispatch-api-contract";
import {
  confirmDispatchCommand as confirmDispatchCommandViaApi,
  getDispatchTelemetry as getDispatchTelemetryViaApi,
} from "../../lib/dispatch/dispatch-api-client";
import { getDispatchWorkspaceData } from "../../lib/dispatch/dispatch-data-provider";
import {
  applyScenarioToWorkspaceData,
  dispatchScenarioOptions,
  getDispatchScenarioDefinition,
  getDispatchScenarioTarget,
} from "../../lib/dispatch/dispatch-scenario-service";
import {
  dispatchPresentationSteps,
  getDispatchPresentationStep,
  getDispatchPresentationStepIndex,
  getExecutiveValueCards,
  startDispatchPresentationMode,
} from "../../lib/dispatch/dispatch-presentation-service";
import {
  byId,
  getEquipmentAlarms,
  getFilteredEquipment,
  getObjectSummary,
  getRecommendedActions,
  getScopedEquipment,
  getZoneEquipment,
  statusRank,
} from "../../lib/dispatch/selectors";
import {
  createInitialWorkspaceState,
  createWorkspaceReducer,
  type WorkspaceAction,
} from "../../lib/dispatch/workspace-state";
import type {
  AlarmModel,
  BottomPanelTab,
  CommandModel,
  DispatchPresentationModeState,
  DispatchScenarioId,
  DispatchScenarioState,
  DispatchScenarioStep,
  EquipmentModel,
  EventModel,
  FloorModel,
  InspectorTab,
  PreparedCommandModel,
  RecommendedActionModel,
  StatusFilter,
  SystemModel,
  WorkflowJournalEntry,
  WorkspaceLayer,
  WorkspaceMockData,
  WorkspaceState,
  WorkspaceStatus,
  ZoneModel,
} from "../../lib/dispatch/types";

const layers: WorkspaceLayer[] = ["plan", "hvac", "cooling", "ventilation", "3d"];
const statusFilters: StatusFilter[] = ["all", "normal", "warning", "critical", "offline"];
const inspectorTabs: InspectorTab[] = [
  "overview",
  "telemetry",
  "controls",
  "3d",
  "alarms",
  "history",
  "passport",
];
const bottomTabs: BottomPanelTab[] = ["alarms", "events", "maintenance", "commands", "scenario"];

const layerLabels: Record<WorkspaceLayer, string> = {
  plan: "Plan",
  hvac: "HVAC",
  cooling: "Cooling",
  ventilation: "Ventilation",
  "3d": "3D",
};

const statusLabels: Record<WorkspaceStatus, string> = {
  normal: "Normal",
  warning: "Warning",
  critical: "Critical",
  offline: "Offline",
};

const statusFilterLabels: Record<StatusFilter, string> = {
  all: "All",
  normal: "Normal",
  warning: "Warning",
  critical: "Critical",
  offline: "Offline",
};

const inspectorTabLabels: Record<InspectorTab, string> = {
  overview: "Overview",
  telemetry: "Telemetry",
  controls: "Controls",
  "3d": "3D Model",
  alarms: "Alarms",
  history: "History",
  passport: "Passport",
};

const bottomTabLabels: Record<BottomPanelTab, string> = {
  alarms: "Active Alarms",
  events: "Events",
  maintenance: "Maintenance",
  commands: "Commands",
  scenario: "Scenario",
};

const equipmentTypeLabels: Record<EquipmentModel["type"], string> = {
  chiller: "Chiller",
  fan_coil: "Fan coil",
  ahu: "AHU",
  pump: "Pump",
  sensor: "Sensor",
  cooling_tower: "Cooling tower",
  conditioner: "Conditioner",
};

const fallback3dTypeCodes: Record<EquipmentModel["type"], string> = {
  chiller: "CH",
  fan_coil: "FC",
  ahu: "AHU",
  pump: "P",
  sensor: "S",
  cooling_tower: "CT",
  conditioner: "AC",
};

const riskLabels: Record<RecommendedActionModel["risk"], string> = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
};

type SelectedTelemetryState = {
  status: "idle" | "updating" | "ready" | "unavailable";
  equipmentId?: string;
  telemetry?: DispatchTelemetryPayload["telemetry"];
  updatedAt?: string;
  sequence?: number;
  error?: string;
};

const LazyEquipmentModelViewer = dynamic(() => import("./EquipmentModelViewer"), {
  ssr: false,
  loading: () => (
    <div className="lazyModelFallback" aria-live="polite">
      <strong>Loading 3D model tools</strong>
      <span>Workspace remains interactive while the viewer chunk loads.</span>
    </div>
  ),
});

function isWorkspaceLayer(value: string | null): value is WorkspaceLayer {
  return Boolean(value && layers.includes(value as WorkspaceLayer));
}

function isStatusFilter(value: string | null): value is StatusFilter {
  return Boolean(value && statusFilters.includes(value as StatusFilter));
}

function isInspectorTab(value: string | null): value is InspectorTab {
  return Boolean(value && inspectorTabs.includes(value as InspectorTab));
}

function getStatusClass(status?: WorkspaceStatus | StatusFilter) {
  if (!status || status === "all") return "statusAll";
  return `status${status[0].toUpperCase()}${status.slice(1)}`;
}

function getNowLabel() {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

function formatApiTimestamp(value?: string) {
  if (!value) return "not updated";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function getEffectiveTelemetry(
  equipment: EquipmentModel,
  liveTelemetry?: SelectedTelemetryState,
  preferEquipmentTelemetry = false,
): EquipmentModel["telemetry"] {
  if (preferEquipmentTelemetry) {
    return equipment.telemetry;
  }

  if (liveTelemetry?.equipmentId === equipment.id && liveTelemetry.telemetry) {
    return liveTelemetry.telemetry;
  }

  return equipment.telemetry;
}

function isScenarioAffectingEquipment(scenario: DispatchScenarioState, equipmentId: string) {
  const target = getDispatchScenarioTarget(scenario);

  return scenario.id !== "normal-operations" && scenario.status !== "idle" && target.equipmentId === equipmentId;
}

function formatScenarioStatus(status: DispatchScenarioState["status"]) {
  return status.replace(/_/g, " ");
}

function buildPreparedCommand({
  equipment,
  command,
  action,
  alarm,
  value,
  reason,
}: {
  equipment: EquipmentModel;
  command: CommandModel;
  action?: RecommendedActionModel;
  alarm?: AlarmModel;
  value?: string;
  reason?: string;
}): PreparedCommandModel {
  const commandValue = value ?? command.value;
  return {
    id: `${equipment.id}-${command.id}-${Date.now()}`,
    equipmentId: equipment.id,
    actionId: action?.id,
    alarmId: alarm?.id ?? action?.alarmId,
    label: action?.commandLabel ?? command.label,
    value: commandValue,
    reason: reason ?? action?.description ?? `${command.label} ${commandValue} prepared locally for ${equipment.displayName}.`,
    risk: action?.risk ?? "low",
  };
}

function buildJournalEntry(
  command: PreparedCommandModel,
  type: WorkflowJournalEntry["type"],
  title: string,
  description: string,
): WorkflowJournalEntry {
  return {
    id: `journal-${type}-${command.id}-${Date.now()}`,
    timestamp: getNowLabel(),
    equipmentId: command.equipmentId,
    alarmId: command.alarmId,
    actionId: command.actionId,
    type,
    title,
    description,
  };
}

function getEquipmentTypeCount(data: WorkspaceMockData, type: EquipmentModel["type"]) {
  return data.equipment.filter((equipment) => equipment.type === type).length;
}

function getHydratedStateFromUrl(data: WorkspaceMockData) {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const nextState: Partial<WorkspaceState> = {};
  const equipment = byId(data.equipment, params.get("equipment") ?? undefined);
  const floor = byId(data.floors, params.get("floor") ?? undefined);
  const zone = byId(data.zones, params.get("zone") ?? undefined);
  const system = byId(data.systems, params.get("system") ?? undefined);
  const layer = params.get("layer");
  const status = params.get("status");
  const tab = params.get("tab");
  const query = params.get("q");
  const demo = params.get("demo");
  const presentation = params.get("presentation");

  if (floor) nextState.selectedFloorId = floor.id;
  if (zone) {
    nextState.selectedZoneId = zone.id;
    nextState.selectedFloorId = zone.floorId;
  }
  if (system) nextState.selectedSystemId = system.id;
  if (isWorkspaceLayer(layer)) nextState.selectedLayer = layer;
  if (isStatusFilter(status)) nextState.statusFilter = status;
  if (query) nextState.searchQuery = query;
  if (demo === "investor" || presentation === "investor" || presentation === "1") {
    nextState.presentation = startDispatchPresentationMode(true);
  }

  if (equipment) {
    nextState.selectedEquipmentId = equipment.id;
    nextState.selectedFloorId = equipment.floorId;
    nextState.selectedZoneId = equipment.zoneId;
    nextState.selectedSystemId = equipment.systemId;
    if (isInspectorTab(tab)) {
      nextState.inspectorTab = tab;
    }
  }

  return nextState;
}

function syncStateToUrl(state: WorkspaceState) {
  const params = new URLSearchParams();

  params.set("object", state.selectedObjectId);
  if (state.selectedFloorId) params.set("floor", state.selectedFloorId);
  if (state.selectedZoneId) params.set("zone", state.selectedZoneId);
  if (state.selectedSystemId) params.set("system", state.selectedSystemId);
  if (state.selectedEquipmentId) params.set("equipment", state.selectedEquipmentId);
  if (state.selectedLayer !== "plan") params.set("layer", state.selectedLayer);
  if (state.statusFilter !== "all") params.set("status", state.statusFilter);
  if (state.searchQuery.trim()) params.set("q", state.searchQuery.trim());
  if (state.presentation.enabled) params.set("demo", "investor");
  if (state.selectedEquipmentId && state.inspectorTab !== "overview") {
    params.set("tab", state.inspectorTab);
  }

  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
  const currentUrl = `${window.location.pathname}${window.location.search}`;

  if (nextUrl !== currentUrl) {
    window.history.replaceState(null, "", nextUrl);
  }
}

export default function DispatchWorkspace() {
  const baseData = useMemo(() => getDispatchWorkspaceData(), []);
  const reducer = useMemo(() => createWorkspaceReducer(baseData), [baseData]);
  const [state, dispatch] = useReducer(reducer, baseData, createInitialWorkspaceState);
  const [isUrlHydrated, setIsUrlHydrated] = useState(false);
  const [selectedTelemetry, setSelectedTelemetry] = useState<SelectedTelemetryState>({ status: "idle" });
  const data = useMemo(
    () => applyScenarioToWorkspaceData(baseData, state.scenario),
    [baseData, state.scenario],
  );

  useEffect(() => {
    document.body.classList.add("is-dispatch-workspace");
    document.body.classList.remove("menu-open");

    return () => {
      document.body.classList.remove("is-dispatch-workspace");
    };
  }, []);

  useEffect(() => {
    const hydratedState = getHydratedStateFromUrl(baseData);
    dispatch({ type: "hydrate", state: hydratedState });
    if (hydratedState.presentation?.enabled) {
      dispatch({ type: "startPresentationMode", launchedFromUrl: true });
    }
    setIsUrlHydrated(true);
  }, [baseData]);

  useEffect(() => {
    if (!isUrlHydrated) return;
    syncStateToUrl(state);
  }, [isUrlHydrated, state]);

  const selectedFloor = byId(data.floors, state.selectedFloorId) ?? data.floors[0];
  const selectedZone = byId(data.zones, state.selectedZoneId);
  const selectedSystem = byId(data.systems, state.selectedSystemId);
  const selectedEquipment = byId(data.equipment, state.selectedEquipmentId);
  const scopedEquipment = getScopedEquipment(data, state);
  const filteredEquipment = getFilteredEquipment(data, state);
  const visibleEquipment = filteredEquipment;
  const selectedEquipmentVisible = selectedEquipment
    ? visibleEquipment.some((equipment) => equipment.id === selectedEquipment.id)
    : true;

  useEffect(() => {
    const equipmentId = state.selectedEquipmentId;

    if (!equipmentId) {
      setSelectedTelemetry({ status: "idle" });
      return undefined;
    }

    let isActive = true;

    const loadTelemetry = async () => {
      setSelectedTelemetry((current) => ({
        ...current,
        equipmentId,
        status: "updating",
        error: undefined,
      }));

      try {
        const response = await getDispatchTelemetryViaApi(equipmentId);
        if (!isActive) return;

        setSelectedTelemetry({
          status: "ready",
          equipmentId: response.data.equipmentId,
          telemetry: response.data.telemetry,
          updatedAt: response.data.updatedAt,
          sequence: response.data.sequence,
        });
      } catch (error) {
        if (!isActive) return;

        setSelectedTelemetry((current) => ({
          status: "unavailable",
          equipmentId,
          telemetry: current.equipmentId === equipmentId ? current.telemetry : undefined,
          updatedAt: current.equipmentId === equipmentId ? current.updatedAt : undefined,
          sequence: current.equipmentId === equipmentId ? current.sequence : undefined,
          error: error instanceof Error ? error.message : "Dispatch telemetry API unavailable",
        }));
      }
    };

    void loadTelemetry();
    const intervalId = window.setInterval(() => {
      void loadTelemetry();
    }, 5000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [state.selectedEquipmentId]);

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    const firstMatch = filteredEquipment[0];
    if (firstMatch) {
      dispatch({ type: "selectEquipment", equipmentId: firstMatch.id });
    }
  };

  return (
    <section
      className={`dispatchWorkspace ${state.presentation.enabled ? "presentationActive" : ""}`}
      aria-label="Object Control Workspace"
    >
      <WorkspaceHeader
        data={data}
        state={state}
        activeSystem={selectedSystem}
        selectedTelemetry={selectedTelemetry}
        onClear={() => dispatch({ type: "clearSelection" })}
      />

      <div className="demoKpiStack">
        <ScenarioKpiStrip scenario={state.scenario} />
        <ExecutiveValueCards scenario={state.scenario} presentation={state.presentation} />
      </div>

      <section className="workspaceBody">
        <ObjectTreePanel
          data={data}
          state={state}
          dispatch={dispatch}
          selectedFloorId={selectedFloor?.id}
          filteredEquipment={filteredEquipment}
          onSearchKeyDown={handleSearchKeyDown}
        />

        <ObjectCanvas
          data={data}
          state={state}
          dispatch={dispatch}
          selectedFloorId={selectedFloor?.id}
          scopedEquipment={scopedEquipment}
          selectedEquipmentVisible={selectedEquipmentVisible}
          visibleEquipment={visibleEquipment}
        />

        <InspectorPanel
          data={data}
          state={state}
          dispatch={dispatch}
          selectedEquipment={selectedEquipment}
          selectedEquipmentVisible={selectedEquipmentVisible}
          selectedZone={selectedZone}
          selectedSystem={selectedSystem}
          scopedEquipment={scopedEquipment}
          visibleEquipment={visibleEquipment}
          selectedTelemetry={selectedTelemetry}
        />
      </section>

      <BottomEventsPanel
        data={data}
        state={state}
        dispatch={dispatch}
        visibleEquipment={visibleEquipment}
      />
      <CommandConfirmationModal data={data} state={state} dispatch={dispatch} />
      <PresentationModeOverlay state={state} dispatch={dispatch} />

      <style jsx global>{`
        body.is-dispatch-workspace .site-header,
        body.is-dispatch-workspace .sidebar,
        body.is-dispatch-workspace [data-sidebar],
        body.is-dispatch-workspace .mobile-bottom-nav,
        body.is-dispatch-workspace .skip {
          display: none !important;
        }

        body.is-dispatch-workspace .app-content {
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .panelSurface {
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        }

        .statusPill,
        .statusNormal,
        .statusWarning,
        .statusCritical,
        .statusOffline,
        .statusAll {
          border-radius: 8px;
        }

        i.statusNormal,
        i.statusWarning,
        i.statusCritical,
        i.statusOffline,
        i.statusAll,
        .legend i {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 999px;
        }

        .statusNormal {
          border-color: #10b981 !important;
        }

        .statusWarning {
          border-color: #f59e0b !important;
        }

        .statusCritical {
          border-color: #dc2626 !important;
        }

        .statusOffline {
          border-color: #6b7280 !important;
        }

        .statusAll {
          border-color: #9ca3af !important;
        }

        i.statusNormal,
        .legend .statusNormal {
          background: #10b981;
        }

        i.statusWarning,
        .legend .statusWarning {
          background: #f59e0b;
        }

        i.statusCritical,
        .legend .statusCritical {
          background: #dc2626;
        }

        i.statusOffline,
        .legend .statusOffline {
          background: #6b7280;
        }

        i.statusAll,
        .legend .statusAll {
          background: #9ca3af;
        }

        .statusPill.statusNormal,
        .metricTile.statusNormal,
        .inspectorTitle b.statusNormal {
          background: #ecfdf5 !important;
          color: #065f46 !important;
        }

        .statusPill.statusWarning,
        .metricTile.statusWarning,
        .inspectorTitle b.statusWarning {
          background: #fffbeb !important;
          color: #92400e !important;
        }

        .statusPill.statusCritical,
        .metricTile.statusCritical,
        .inspectorTitle b.statusCritical {
          background: #fef2f2 !important;
          color: #991b1b !important;
        }

        .statusPill.statusOffline,
        .metricTile.statusOffline,
        .inspectorTitle b.statusOffline {
          background: #f3f4f6 !important;
          color: #374151 !important;
        }

        .zoneBlock.statusNormal {
          background: rgba(236, 253, 245, 0.78) !important;
        }

        .zoneBlock.statusWarning {
          background: rgba(255, 251, 235, 0.84) !important;
        }

        .zoneBlock.statusCritical {
          background: rgba(254, 242, 242, 0.88) !important;
        }

        .equipmentMarker.statusNormal {
          border-color: #10b981 !important;
        }

        .equipmentMarker.statusWarning {
          border-color: #f59e0b !important;
        }

        .equipmentMarker.statusCritical {
          border-color: #dc2626 !important;
        }

        .equipmentMarker.statusOffline {
          border-color: #6b7280 !important;
        }

        .bottomItem.statusWarning,
        .alarmList article.statusWarning {
          border-color: #f59e0b !important;
          background: #fffbeb !important;
        }

        .bottomItem.statusCritical,
        .alarmList article.statusCritical {
          border-color: #dc2626 !important;
          background: #fef2f2 !important;
        }

        .lazyModelFallback {
          display: grid;
          min-height: 280px;
          place-content: center;
          gap: 8px;
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
          background: #f8fafc;
          color: #111827;
          padding: 24px;
          text-align: center;
        }

        .lazyModelFallback strong,
        .lazyModelFallback span {
          display: block;
        }

        .lazyModelFallback span {
          color: #4b5563;
          font-size: 13px;
        }
      `}</style>
      <style jsx>{`
        .dispatchWorkspace {
          height: 100vh;
          min-height: 100vh;
          display: grid;
          grid-template-rows: auto auto minmax(0, 1fr) auto;
          gap: 10px;
          background:
            linear-gradient(90deg, rgba(20, 184, 166, 0.08), rgba(245, 158, 11, 0.05)),
            #eef2f7;
          color: #111827;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          overflow: hidden;
          padding: 10px;
        }

        .workspaceBody {
          min-height: 0;
          display: grid;
          grid-template-columns: minmax(260px, 300px) minmax(420px, 1fr) minmax(320px, 380px);
          gap: 10px;
          overflow: hidden;
          padding: 0;
        }

        .demoKpiStack {
          display: grid;
          gap: 8px;
        }

        .presentationActive {
          background:
            linear-gradient(90deg, rgba(15, 118, 110, 0.1), rgba(245, 158, 11, 0.08)),
            #eef2f7;
        }

        @media (max-width: 1180px) {
          .dispatchWorkspace {
            min-height: auto;
          }

          .workspaceBody {
            grid-template-columns: 280px minmax(0, 1fr);
          }

          .workspaceBody :global(.inspectorPanel) {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 820px) {
          .dispatchWorkspace {
            height: auto;
            padding: 8px;
            overflow: visible;
          }

          .workspaceBody {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}

function WorkspaceHeader({
  data,
  state,
  activeSystem,
  selectedTelemetry,
  onClear,
}: {
  data: WorkspaceMockData;
  state: WorkspaceState;
  activeSystem?: SystemModel;
  selectedTelemetry: SelectedTelemetryState;
  onClear: () => void;
}) {
  const summary = getObjectSummary(data);
  const telemetryLabel =
    selectedTelemetry.status === "updating"
      ? "Telemetry updating"
      : selectedTelemetry.status === "ready"
        ? `Telemetry ${formatApiTimestamp(selectedTelemetry.updatedAt)}`
        : selectedTelemetry.status === "unavailable"
          ? "Telemetry fallback"
          : "Telemetry idle";

  return (
    <header className="workspaceHeader">
      <div className="objectIdentity">
        <span>UPGRADE Dispatch / HVAC</span>
        <h1>{data.object.name}</h1>
        <p>{data.object.kind} · {data.object.address}</p>
      </div>
      <div className="demoModePill" aria-label="Demo mode">
        <strong>Demo Mode</strong>
        <span>{DISPATCH_DEMO_LABEL}</span>
      </div>
      <div className="headerMetrics" aria-label="Object status">
        <span className={`statusPill ${getStatusClass(data.object.status)}`}>{statusLabels[data.object.status]}</span>
        <span>{summary.activeAlarms} active alarms</span>
        <span>{data.object.mode.toUpperCase()} mode</span>
        <span>{activeSystem?.shortName ?? "All systems"}</span>
        <span>{telemetryLabel}</span>
        <span>{data.object.updatedAt}</span>
      </div>
      <button className="clearButton" type="button" onClick={onClear}>
        Общий вид
      </button>
      <style jsx>{`
        .workspaceHeader {
          min-height: 76px;
          display: grid;
          grid-template-columns: minmax(220px, 1fr) minmax(240px, auto) auto auto;
          align-items: center;
          gap: 14px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
          padding: 12px 14px;
        }

        .objectIdentity span {
          display: block;
          color: #0f766e;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .objectIdentity h1 {
          margin: 3px 0 4px;
          color: #111827;
          font-size: 22px;
          line-height: 1.1;
        }

        .objectIdentity p {
          margin: 0;
          color: #4b5563;
          font-size: 13px;
        }

        .headerMetrics {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 7px;
          max-width: 680px;
        }

        .demoModePill {
          min-height: 46px;
          display: grid;
          align-content: center;
          gap: 2px;
          border: 1px solid #0f766e;
          border-radius: 8px;
          background: #ecfdf5;
          color: #064e3b;
          padding: 8px 10px;
        }

        .demoModePill strong,
        .demoModePill span {
          display: block;
        }

        .demoModePill strong {
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .demoModePill span {
          font-size: 12px;
          font-weight: 800;
          line-height: 1.25;
        }

        .headerMetrics span,
        .clearButton {
          min-height: 34px;
          display: inline-flex;
          align-items: center;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #f9fafb;
          color: #374151;
          font-size: 12px;
          font-weight: 800;
          padding: 7px 10px;
        }

        .clearButton {
          background: #111827;
          color: #ffffff;
          cursor: pointer;
        }

        @media (max-width: 920px) {
          .workspaceHeader {
            grid-template-columns: 1fr;
            align-items: stretch;
          }

          .headerMetrics {
            justify-content: flex-start;
          }
        }
      `}</style>
    </header>
  );
}

function ScenarioKpiStrip({ scenario }: { scenario: DispatchScenarioState }) {
  return (
    <section className="scenarioKpiStrip" aria-label="Demo KPI estimate">
      <div className="scenarioKpiTitle">
        <span>Demo KPI estimate</span>
        <strong>{scenario.title}</strong>
        <small>{formatScenarioStatus(scenario.status)} · simulated investor demo</small>
      </div>
      <div className="scenarioKpiGrid">
        {scenario.kpis.slice(0, 4).map((kpi) => (
          <article key={kpi.id} className={kpi.trend ? `trend${kpi.trend}` : undefined}>
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
            <small>{kpi.helperText}</small>
          </article>
        ))}
      </div>
      <style jsx>{`
        .scenarioKpiStrip {
          display: grid;
          grid-template-columns: minmax(190px, 0.8fr) minmax(0, 2.2fr);
          gap: 10px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
          padding: 10px;
        }

        .scenarioKpiTitle {
          display: grid;
          align-content: center;
          gap: 4px;
        }

        .scenarioKpiTitle span,
        .scenarioKpiTitle strong,
        .scenarioKpiTitle small {
          display: block;
        }

        .scenarioKpiTitle span {
          color: #0f766e;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .scenarioKpiTitle strong {
          color: #111827;
          font-size: 15px;
          line-height: 1.2;
        }

        .scenarioKpiTitle small {
          color: #6b7280;
          font-size: 12px;
          font-weight: 800;
        }

        .scenarioKpiGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .scenarioKpiGrid article {
          min-height: 76px;
          display: grid;
          align-content: center;
          gap: 3px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #f9fafb;
          padding: 9px;
        }

        .scenarioKpiGrid article.trendup {
          border-color: #f59e0b;
          background: #fffbeb;
        }

        .scenarioKpiGrid article.trenddown {
          border-color: #0f766e;
          background: #ecfdf5;
        }

        .scenarioKpiGrid span,
        .scenarioKpiGrid strong,
        .scenarioKpiGrid small {
          display: block;
        }

        .scenarioKpiGrid span {
          color: #6b7280;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .scenarioKpiGrid strong {
          color: #111827;
          font-size: 16px;
          line-height: 1.15;
        }

        .scenarioKpiGrid small {
          color: #4b5563;
          font-size: 11px;
          line-height: 1.3;
        }

        @media (max-width: 920px) {
          .scenarioKpiStrip {
            grid-template-columns: 1fr;
          }

          .scenarioKpiGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </section>
  );
}

function ExecutiveValueCards({
  scenario,
  presentation,
}: {
  scenario: DispatchScenarioState;
  presentation: DispatchPresentationModeState;
}) {
  if (!presentation.enabled) return null;

  const cards = getExecutiveValueCards(scenario);

  return (
    <section className="executiveValueStrip" aria-label="Executive value cards">
      <div className="executiveValueTitle">
        <span>Executive value cards</span>
        <strong>Investor demo estimate</strong>
        <small>Simulated scenario · No real equipment control</small>
      </div>
      <div className="executiveValueGrid">
        {cards.map((card) => (
          <article key={card.id} className={card.tone ? `tone${card.tone}` : undefined}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.helperText}</small>
          </article>
        ))}
      </div>
      <style jsx>{`
        .executiveValueStrip {
          display: grid;
          grid-template-columns: minmax(190px, 0.8fr) minmax(0, 2.2fr);
          gap: 10px;
          border: 1px solid #0f766e;
          border-radius: 8px;
          background: #f0fdfa;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
          padding: 10px;
        }

        .executiveValueTitle {
          display: grid;
          align-content: center;
          gap: 4px;
        }

        .executiveValueTitle span,
        .executiveValueTitle strong,
        .executiveValueTitle small {
          display: block;
        }

        .executiveValueTitle span {
          color: #0f766e;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .executiveValueTitle strong {
          color: #111827;
          font-size: 15px;
          line-height: 1.2;
        }

        .executiveValueTitle small {
          color: #0f766e;
          font-size: 12px;
          font-weight: 800;
        }

        .executiveValueGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .executiveValueGrid article {
          min-height: 70px;
          display: grid;
          align-content: center;
          gap: 3px;
          border: 1px solid #99f6e4;
          border-radius: 8px;
          background: #ffffff;
          padding: 9px;
        }

        .executiveValueGrid article.tonesuccess {
          border-color: #10b981;
          background: #ecfdf5;
        }

        .executiveValueGrid article.tonewarning {
          border-color: #f59e0b;
          background: #fffbeb;
        }

        .executiveValueGrid span,
        .executiveValueGrid strong,
        .executiveValueGrid small {
          display: block;
        }

        .executiveValueGrid span {
          color: #6b7280;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .executiveValueGrid strong {
          color: #111827;
          font-size: 16px;
          line-height: 1.15;
        }

        .executiveValueGrid small {
          color: #4b5563;
          font-size: 11px;
          line-height: 1.3;
        }

        @media (max-width: 920px) {
          .executiveValueStrip {
            grid-template-columns: 1fr;
          }

          .executiveValueGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </section>
  );
}

function ObjectTreePanel({
  data,
  state,
  dispatch,
  selectedFloorId,
  filteredEquipment,
  onSearchKeyDown,
}: {
  data: WorkspaceMockData;
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
  selectedFloorId?: string;
  filteredEquipment: EquipmentModel[];
  onSearchKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}) {
  const activeAlarmEquipmentIds = new Set(data.alarms.map((alarm) => alarm.equipmentId));
  const equipmentTypes = Object.keys(equipmentTypeLabels) as EquipmentModel["type"][];
  const [draftScenarioId, setDraftScenarioId] = useState<DispatchScenarioId>("cooling-loop-pressure-drop");

  return (
    <aside className="objectTree panelSurface" aria-label="Object navigation">
      <div className="panelTitle">
        <span>Object tree</span>
        <h2>{data.object.shortName}</h2>
      </div>

      <section className="scenarioControl" aria-label="Demo scenario">
        <div>
          <span>Demo Scenario</span>
          <strong>{state.scenario.title}</strong>
          <small>Demo Mode · Simulated scenario · No real equipment control</small>
        </div>
        <label>
          <span>Scenario selector</span>
          <select
            value={draftScenarioId}
            onChange={(event) => setDraftScenarioId(event.target.value as DispatchScenarioId)}
          >
            {dispatchScenarioOptions.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.title}
              </option>
            ))}
          </select>
        </label>
        <div className="scenarioActions">
          <button
            type="button"
            onClick={() => dispatch({ type: "startPresentationMode" })}
          >
            Launch investor demo
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "startScenario", scenarioId: draftScenarioId })}
          >
            Start scenario
          </button>
          <button type="button" onClick={() => dispatch({ type: "resetScenario" })}>
            Reset demo
          </button>
        </div>
        <p>Status: {formatScenarioStatus(state.scenario.status)}</p>
      </section>

      <label className="searchBox">
        <span>Search</span>
        <input
          value={state.searchQuery}
          onChange={(event) => dispatch({ type: "setSearchQuery", searchQuery: event.target.value })}
          onKeyDown={onSearchKeyDown}
          placeholder="equipment, tag, zone..."
        />
      </label>

      <div className="filterGroup" aria-label="Status filter">
        {statusFilters.map((status) => (
          <button
            key={status}
            type="button"
            className={state.statusFilter === status ? "isActive" : ""}
            onClick={() => dispatch({ type: "setStatusFilter", statusFilter: status })}
          >
            {statusFilterLabels[status]}
          </button>
        ))}
      </div>

      <section className="treeSection">
        <h3>Floors / zones</h3>
        <div className="treeList">
          {data.floors.map((floor) => {
            const zones = data.zones.filter((zone) => zone.floorId === floor.id);
            return (
              <div className="floorGroup" key={floor.id}>
                <button
                  type="button"
                  className={selectedFloorId === floor.id ? "treeButton isActive" : "treeButton"}
                  onClick={() => dispatch({ type: "selectFloor", floorId: floor.id })}
                >
                  <span>{floor.name}</span>
                  <small>{floor.level}</small>
                </button>
                {selectedFloorId === floor.id ? (
                  <div className="zoneList">
                    {zones.map((zone) => (
                      <button
                        type="button"
                        key={zone.id}
                        className={state.selectedZoneId === zone.id ? "zoneButton isActive" : "zoneButton"}
                        onClick={() => dispatch({ type: "selectZone", zoneId: zone.id })}
                      >
                        <i className={getStatusClass(zone.status)} />
                        {zone.name}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="treeSection">
        <h3>Systems</h3>
        <div className="systemList">
          <button
            type="button"
            className={!state.selectedSystemId ? "systemButton isActive" : "systemButton"}
            onClick={() => dispatch({ type: "selectSystem", systemId: undefined })}
          >
            All systems
          </button>
          {data.systems.map((system) => (
            <button
              type="button"
              key={system.id}
              className={state.selectedSystemId === system.id ? "systemButton isActive" : "systemButton"}
              onClick={() => dispatch({ type: "selectSystem", systemId: system.id })}
            >
              <i className={getStatusClass(system.status)} />
              <span>{system.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="treeSection">
        <h3>Equipment</h3>
        <div className="equipmentTypeGrid">
          {equipmentTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() =>
                dispatch({ type: "setSearchQuery", searchQuery: equipmentTypeLabels[type].toLowerCase() })
              }
            >
              <span>{equipmentTypeLabels[type]}</span>
              <strong>{getEquipmentTypeCount(data, type)}</strong>
            </button>
          ))}
        </div>
        <div className="equipmentList">
          {filteredEquipment.slice(0, 8).map((equipment) => (
            <button
              key={equipment.id}
              type="button"
              className={state.selectedEquipmentId === equipment.id ? "equipmentRow isActive" : "equipmentRow"}
              onClick={() => dispatch({ type: "selectEquipment", equipmentId: equipment.id })}
            >
              <i className={getStatusClass(equipment.status)} />
              <span>
                <strong>{equipment.displayName}</strong>
                <small>{equipment.sourceAlias}</small>
              </span>
              {activeAlarmEquipmentIds.has(equipment.id) ? <b>alarm</b> : null}
            </button>
          ))}
          {!filteredEquipment.length ? <p className="emptyText">Ничего не найдено</p> : null}
        </div>
      </section>

      <style jsx>{`
        .objectTree {
          min-height: 0;
          overflow: auto;
          padding: 14px;
        }

        .scenarioControl {
          display: grid;
          gap: 9px;
          border: 1px solid #0f766e;
          border-radius: 8px;
          background: #ecfdf5;
          color: #064e3b;
          padding: 10px;
        }

        .scenarioControl div,
        .scenarioControl label {
          display: grid;
          gap: 4px;
        }

        .scenarioControl span,
        .scenarioControl p {
          margin: 0;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .scenarioControl strong,
        .scenarioControl small {
          display: block;
        }

        .scenarioControl strong {
          font-size: 14px;
          line-height: 1.2;
        }

        .scenarioControl small {
          font-size: 12px;
          font-weight: 800;
          line-height: 1.25;
        }

        .scenarioControl select {
          min-height: 36px;
          border: 1px solid #99f6e4;
          border-radius: 8px;
          background: #ffffff;
          color: #064e3b;
          font: inherit;
          font-size: 12px;
          font-weight: 900;
          padding: 7px 8px;
        }

        .scenarioActions {
          display: grid;
          grid-template-columns: 1fr;
          gap: 6px;
        }

        .scenarioActions button {
          min-height: 36px;
          border: 1px solid #0f766e;
          border-radius: 8px;
          background: #0f766e;
          color: #ffffff;
          cursor: pointer;
          font-size: 12px;
          font-weight: 900;
          padding: 7px 8px;
        }

        .scenarioActions button:nth-child(3) {
          background: #ffffff;
          color: #0f766e;
        }

        .panelTitle span,
        .searchBox span,
        .treeSection h3 {
          display: block;
          color: #6b7280;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .panelTitle h2 {
          margin: 3px 0 14px;
          color: #111827;
          font-size: 18px;
        }

        .searchBox {
          display: grid;
          gap: 6px;
        }

        .searchBox input {
          min-height: 40px;
          width: 100%;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
          color: #111827;
          font: inherit;
          padding: 9px 10px;
        }

        .filterGroup {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 5px;
          margin: 10px 0 14px;
        }

        .filterGroup button,
        .treeButton,
        .zoneButton,
        .systemButton,
        .equipmentTypeGrid button,
        .equipmentRow {
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          color: #374151;
          cursor: pointer;
          font: inherit;
        }

        .filterGroup button {
          min-height: 32px;
          font-size: 11px;
          font-weight: 800;
          padding: 6px 4px;
        }

        .filterGroup button.isActive,
        .treeButton.isActive,
        .zoneButton.isActive,
        .systemButton.isActive,
        .equipmentRow.isActive {
          border-color: #0f766e;
          background: #ecfdf5;
          color: #064e3b;
        }

        .treeSection {
          display: grid;
          gap: 8px;
          border-top: 1px solid #e5e7eb;
          padding: 12px 0 0;
          margin-top: 12px;
        }

        .treeSection h3 {
          margin: 0;
        }

        .treeList,
        .systemList,
        .equipmentList {
          display: grid;
          gap: 7px;
        }

        .floorGroup {
          display: grid;
          gap: 5px;
        }

        .treeButton {
          min-height: 42px;
          display: flex;
          justify-content: space-between;
          gap: 8px;
          text-align: left;
          padding: 9px;
        }

        .treeButton span {
          font-size: 13px;
          font-weight: 800;
        }

        .treeButton small {
          color: #6b7280;
          font-size: 11px;
          font-weight: 800;
        }

        .zoneList {
          display: grid;
          gap: 5px;
          padding-left: 10px;
        }

        .zoneButton,
        .systemButton {
          min-height: 34px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 8px;
          text-align: left;
        }

        .zoneButton {
          font-size: 12px;
        }

        .systemButton {
          font-size: 13px;
          font-weight: 800;
        }

        .equipmentTypeGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px;
        }

        .equipmentTypeGrid button {
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 8px;
          text-align: left;
        }

        .equipmentTypeGrid span {
          font-size: 12px;
          font-weight: 800;
        }

        .equipmentTypeGrid strong {
          color: #0f766e;
        }

        .equipmentRow {
          min-height: 50px;
          display: grid;
          grid-template-columns: 10px minmax(0, 1fr) auto;
          align-items: center;
          gap: 8px;
          padding: 8px;
          text-align: left;
        }

        .equipmentRow span {
          min-width: 0;
        }

        .equipmentRow strong,
        .equipmentRow small {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .equipmentRow strong {
          color: #111827;
          font-size: 13px;
        }

        .equipmentRow small {
          color: #6b7280;
          font-size: 11px;
        }

        .equipmentRow b {
          border-radius: 8px;
          background: #fee2e2;
          color: #991b1b;
          font-size: 10px;
          padding: 4px 6px;
        }

        .emptyText {
          margin: 0;
          color: #6b7280;
          font-size: 13px;
        }
      `}</style>
    </aside>
  );
}

function ObjectCanvas({
  data,
  state,
  dispatch,
  selectedFloorId,
  scopedEquipment,
  selectedEquipmentVisible,
  visibleEquipment,
}: {
  data: WorkspaceMockData;
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
  selectedFloorId?: string;
  scopedEquipment: EquipmentModel[];
  selectedEquipmentVisible: boolean;
  visibleEquipment: EquipmentModel[];
}) {
  const selectedFloor = byId(data.floors, selectedFloorId);
  const floorZones = data.zones.filter((zone) => zone.floorId === selectedFloorId);
  const sortedEquipment = [...visibleEquipment].sort((a, b) => statusRank(b.status) - statusRank(a.status));
  const hasActiveFilters =
    state.statusFilter !== "all" ||
    Boolean(state.selectedSystemId) ||
    Boolean(state.searchQuery.trim()) ||
    !["plan", "hvac", "3d"].includes(state.selectedLayer);
  const visibleSummary =
    scopedEquipment.length === visibleEquipment.length
      ? `${visibleEquipment.length} visible assets`
      : `${scopedEquipment.length} assets in scope · ${visibleEquipment.length} visible after filters`;

  return (
    <section className="objectCanvas panelSurface" aria-label="Object plan canvas" data-testid="dispatch-canvas">
      <div className="canvasHeader">
        <div>
          <span>Center canvas</span>
          <h2>{selectedFloor?.name ?? data.object.name}</h2>
          <p>{selectedFloor?.summary ?? "Общий план объекта"}</p>
        </div>
        <div className="layerSwitch" aria-label="Layer switch">
          {layers.map((layer) => (
            <button
              key={layer}
              type="button"
              data-testid={layer === "3d" ? "dispatch-layer-3d" : layer === "hvac" ? "dispatch-layer-hvac" : undefined}
              className={state.selectedLayer === layer ? "isActive" : ""}
              onClick={() => dispatch({ type: "setLayer", layer })}
            >
              {layerLabels[layer]}
            </button>
          ))}
        </div>
      </div>

      {!selectedEquipmentVisible ? (
        <div className="selectionNotice">
          Выбранное оборудование скрыто текущим слоем или фильтром. Выбор сохранен в inspector.
        </div>
      ) : null}

      <div
        className={`floorCanvas ${state.selectedLayer === "3d" ? "is3dLayer" : ""}`}
        data-testid={state.selectedLayer === "3d" ? "dispatch-canvas-3d" : undefined}
      >
        {state.selectedLayer === "3d" ? (
          <WorkspaceFallback3dCanvas
            data={data}
            state={state}
            dispatch={dispatch}
            selectedFloor={selectedFloor}
            floorZones={floorZones}
            sortedEquipment={sortedEquipment}
            scopedEquipment={scopedEquipment}
            hasActiveFilters={hasActiveFilters}
          />
        ) : (
          <>
            <div className="planGrid" aria-hidden="true" />
            {floorZones.map((zone) => (
              <button
                type="button"
                key={zone.id}
                className={`zoneBlock ${state.selectedZoneId === zone.id && !state.selectedEquipmentId ? "isSelected" : ""} ${getStatusClass(zone.status)}`}
                style={{
                  left: `${zone.bounds.x}%`,
                  top: `${zone.bounds.y}%`,
                  width: `${zone.bounds.width}%`,
                  height: `${zone.bounds.height}%`,
                }}
                onClick={() => dispatch({ type: "selectZone", zoneId: zone.id })}
              >
                <span>{zone.name}</span>
                <small>{zone.temperature} · {zone.co2}</small>
              </button>
            ))}

            {sortedEquipment.map((equipment) => {
              const system = byId(data.systems, equipment.systemId);
              const isSelected = state.selectedEquipmentId === equipment.id;
              return (
                <button
                  key={equipment.id}
                  type="button"
                  data-testid={`dispatch-equipment-marker-${equipment.id}`}
                  className={`equipmentMarker ${getStatusClass(equipment.status)} ${isSelected ? "isSelected" : ""}`}
                  style={{ left: `${equipment.position.x}%`, top: `${equipment.position.y}%` }}
                  onClick={() => dispatch({ type: "selectEquipment", equipmentId: equipment.id })}
                  aria-label={`Open ${equipment.displayName}`}
                >
                  <span>{equipmentTypeLabels[equipment.type]}</span>
                  <strong>{equipment.displayName}</strong>
                  <small>{system?.shortName}</small>
                </button>
              );
            })}

            {!sortedEquipment.length ? (
              <CanvasEmptyState
                scopedEquipmentCount={scopedEquipment.length}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={() => dispatch({ type: "clearFilters" })}
              />
            ) : null}
          </>
        )}
      </div>

      <div className="canvasFooter">
        <div className="legend">
          {(["normal", "warning", "critical", "offline"] as WorkspaceStatus[]).map((status) => (
            <span key={status}>
              <i className={getStatusClass(status)} />
              {statusLabels[status]}
            </span>
          ))}
        </div>
        <div className="assetCounters" aria-label="Canvas asset counts">
          <strong data-testid="dispatch-zone-assets-count">{scopedEquipment.length} assets in scope</strong>
          <strong data-testid="dispatch-visible-assets-count">{visibleSummary}</strong>
        </div>
      </div>

      <style jsx>{`
        .objectCanvas {
          min-height: 0;
          display: grid;
          grid-template-rows: auto auto minmax(0, 1fr) auto;
          gap: 10px;
          padding: 14px;
        }

        .canvasHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
        }

        .canvasHeader span {
          display: block;
          color: #6b7280;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .canvasHeader h2 {
          margin: 3px 0 4px;
          font-size: 20px;
          line-height: 1.1;
        }

        .canvasHeader p {
          margin: 0;
          color: #4b5563;
          font-size: 13px;
        }

        .layerSwitch {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 6px;
        }

        .layerSwitch button {
          min-height: 34px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
          color: #374151;
          cursor: pointer;
          font-size: 12px;
          font-weight: 900;
          padding: 7px 10px;
        }

        .layerSwitch button.isActive {
          border-color: #0f766e;
          background: #0f766e;
          color: #ffffff;
        }

        .selectionNotice {
          border: 1px solid #f59e0b;
          border-radius: 8px;
          background: #fffbeb;
          color: #92400e;
          font-size: 12px;
          font-weight: 800;
          padding: 9px 10px;
        }

        .floorCanvas {
          position: relative;
          min-height: 520px;
          overflow: hidden;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background:
            linear-gradient(90deg, rgba(15, 118, 110, 0.08), rgba(217, 119, 6, 0.08)),
            #f8fafc;
        }

        .floorCanvas.is3dLayer {
          border-color: #334155;
          background:
            linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 64, 175, 0.74)),
            #111827;
        }

        .planGrid {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(rgba(148, 163, 184, 0.22) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.22) 1px, transparent 1px);
          background-size: 34px 34px;
          opacity: 0.55;
          pointer-events: none;
        }

        .zoneBlock {
          position: absolute;
          display: grid;
          align-content: start;
          gap: 4px;
          border: 1px solid rgba(107, 114, 128, 0.35);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.72);
          color: #111827;
          cursor: pointer;
          padding: 10px;
          text-align: left;
          transition: border-color 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease;
        }

        .zoneBlock:hover,
        .zoneBlock.isSelected {
          border-color: #0f766e;
          box-shadow: 0 10px 24px rgba(15, 118, 110, 0.18);
        }

        .zoneBlock span {
          font-size: 13px;
          font-weight: 900;
        }

        .zoneBlock small {
          color: #4b5563;
          font-size: 11px;
          font-weight: 700;
        }

        .equipmentMarker {
          position: absolute;
          z-index: 3;
          width: 138px;
          min-height: 58px;
          transform: translate(-50%, -50%);
          border: 2px solid #9ca3af;
          border-radius: 8px;
          background: #ffffff;
          color: #111827;
          cursor: pointer;
          padding: 7px 9px;
          text-align: left;
          box-shadow: 0 12px 26px rgba(17, 24, 39, 0.14);
          transition: transform 0.16s ease, box-shadow 0.16s ease;
        }

        .equipmentMarker:hover,
        .equipmentMarker.isSelected {
          transform: translate(-50%, -50%) scale(1.04);
          box-shadow: 0 18px 34px rgba(17, 24, 39, 0.2);
        }

        .equipmentMarker span,
        .equipmentMarker strong,
        .equipmentMarker small {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .equipmentMarker span {
          color: #6b7280;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .equipmentMarker strong {
          margin-top: 2px;
          font-size: 12px;
        }

        .equipmentMarker small {
          color: #4b5563;
          font-size: 11px;
        }

        .canvasFooter {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .legend,
        .assetCounters {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .legend span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #4b5563;
          font-size: 12px;
          font-weight: 800;
        }

        .assetCounters {
          justify-content: flex-end;
        }

        .assetCounters strong {
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
          color: #374151;
          font-size: 12px;
          padding: 5px 7px;
        }

        @media (max-width: 820px) {
          .canvasHeader,
          .canvasFooter {
            display: grid;
          }

          .layerSwitch,
          .assetCounters {
            justify-content: flex-start;
          }

          .floorCanvas {
            min-height: 430px;
          }
        }
      `}</style>
    </section>
  );
}

function CanvasEmptyState({
  scopedEquipmentCount,
  hasActiveFilters,
  onClearFilters,
}: {
  scopedEquipmentCount: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="emptyCanvas">
      <strong>No equipment matches current filters</strong>
      <span>
        {scopedEquipmentCount
          ? `Clear filters to see ${scopedEquipmentCount} asset${scopedEquipmentCount === 1 ? "" : "s"} in this scope.`
          : "Change floor or zone to see equipment on the canvas."}
      </span>
      {hasActiveFilters ? (
        <button type="button" data-testid="dispatch-clear-filters" onClick={onClearFilters}>
          Clear filters
        </button>
      ) : null}
      <style jsx>{`
        .emptyCanvas {
          position: absolute;
          inset: 0;
          display: grid;
          place-content: center;
          gap: 8px;
          color: #4b5563;
          padding: 24px;
          text-align: center;
        }

        .emptyCanvas strong {
          color: #111827;
          font-size: 16px;
        }

        .emptyCanvas span {
          max-width: 360px;
          font-size: 13px;
          line-height: 1.4;
        }

        .emptyCanvas button {
          justify-self: center;
          min-height: 36px;
          border: 1px solid #0f766e;
          border-radius: 8px;
          background: #0f766e;
          color: #ffffff;
          cursor: pointer;
          font-size: 12px;
          font-weight: 900;
          padding: 8px 12px;
        }
      `}</style>
    </div>
  );
}

function WorkspaceFallback3dCanvas({
  data,
  state,
  dispatch,
  selectedFloor,
  floorZones,
  sortedEquipment,
  scopedEquipment,
  hasActiveFilters,
}: {
  data: WorkspaceMockData;
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
  selectedFloor?: FloorModel;
  floorZones: ZoneModel[];
  sortedEquipment: EquipmentModel[];
  scopedEquipment: EquipmentModel[];
  hasActiveFilters: boolean;
}) {
  return (
    <div className="fallback3dScene" aria-label="3D fallback equipment layout">
      <div className="fallback3dNotice">
        <strong>3D fallback view</strong>
        <span>Simulated layout · No real equipment control</span>
        <small>{sortedEquipment.length} visible assets · {selectedFloor?.level ?? "object scope"}</small>
      </div>
      <div className="fallback3dLegend" aria-hidden="true">
        <span>Workspace layer</span>
        <strong>2.5D equipment map</strong>
      </div>
      <div className="fallback3dPlane" aria-hidden="true">
        <span>{selectedFloor?.level ?? "Object"}</span>
        <i className="axisX">X</i>
        <i className="axisY">Y</i>
      </div>
      {floorZones.map((zone) => (
        <button
          type="button"
          key={zone.id}
          className={`fallback3dZone ${state.selectedZoneId === zone.id && !state.selectedEquipmentId ? "isSelected" : ""}`}
          style={{
            left: `${zone.bounds.x + zone.bounds.width / 2}%`,
            top: `${zone.bounds.y + zone.bounds.height / 2}%`,
            width: `${Math.max(84, zone.bounds.width * 3.2)}px`,
          }}
          onClick={() => dispatch({ type: "selectZone", zoneId: zone.id })}
        >
          {zone.name}
        </button>
      ))}
      {sortedEquipment.map((equipment) => {
        const system = byId(data.systems, equipment.systemId);
        const isSelected = state.selectedEquipmentId === equipment.id;
        const z = equipment.model3d?.position?.z ?? equipment.position.z ?? 0;
        return (
          <button
            key={equipment.id}
            type="button"
            data-testid={`dispatch-equipment-marker-${equipment.id}`}
            className={`fallback3dMarker fallback3dType-${equipment.type} ${getStatusClass(equipment.status)} ${isSelected ? "isSelected" : ""}`}
            style={{
              left: `${equipment.model3d?.position?.x ?? equipment.position.x}%`,
              top: `${equipment.model3d?.position?.y ?? equipment.position.y}%`,
              transform: `translate(-50%, -50%) translateY(${-z * 8}px)`,
            }}
            onClick={() => dispatch({ type: "selectEquipment", equipmentId: equipment.id })}
            aria-label={`Open ${equipment.displayName} in 3D fallback`}
          >
            <b>{fallback3dTypeCodes[equipment.type]}</b>
            <span>{equipmentTypeLabels[equipment.type]}</span>
            <strong>{equipment.displayName}</strong>
            <small>{system?.shortName} · z{z}</small>
          </button>
        );
      })}
      {!sortedEquipment.length ? (
        <CanvasEmptyState
          scopedEquipmentCount={scopedEquipment.length}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={() => dispatch({ type: "clearFilters" })}
        />
      ) : null}
      <style jsx>{`
        .fallback3dScene {
          position: absolute;
          inset: 0;
          overflow: hidden;
          color: #e5e7eb;
          perspective: 900px;
          background:
            radial-gradient(circle at 22% 18%, rgba(94, 234, 212, 0.2), transparent 25%),
            radial-gradient(circle at 78% 22%, rgba(59, 130, 246, 0.22), transparent 30%),
            linear-gradient(135deg, rgba(2, 6, 23, 0.18), rgba(15, 23, 42, 0.5));
        }

        .fallback3dNotice {
          position: absolute;
          z-index: 8;
          left: 14px;
          top: 14px;
          display: grid;
          gap: 2px;
          border: 1px solid rgba(226, 232, 240, 0.32);
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.76);
          padding: 10px 12px;
          backdrop-filter: blur(8px);
        }

        .fallback3dNotice strong,
        .fallback3dNotice span,
        .fallback3dNotice small {
          display: block;
        }

        .fallback3dNotice strong {
          font-size: 13px;
        }

        .fallback3dNotice span {
          color: #cbd5e1;
          font-size: 11px;
          font-weight: 800;
        }

        .fallback3dNotice small {
          color: #93c5fd;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .fallback3dLegend {
          position: absolute;
          z-index: 8;
          right: 14px;
          top: 14px;
          display: grid;
          gap: 3px;
          border: 1px solid rgba(226, 232, 240, 0.24);
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.62);
          padding: 9px 11px;
          text-align: right;
          backdrop-filter: blur(8px);
        }

        .fallback3dLegend span {
          color: #94a3b8;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .fallback3dLegend strong {
          color: #f8fafc;
          font-size: 12px;
        }

        .fallback3dPlane {
          position: absolute;
          left: 7%;
          top: 13%;
          width: 86%;
          height: 72%;
          transform: rotateX(58deg) rotateZ(-4deg);
          transform-origin: center;
          border: 1px solid rgba(226, 232, 240, 0.42);
          border-radius: 8px;
          background:
            linear-gradient(135deg, rgba(20, 184, 166, 0.12), transparent 42%),
            linear-gradient(rgba(148, 163, 184, 0.23) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.23) 1px, transparent 1px),
            rgba(15, 23, 42, 0.38);
          background-size: 36px 36px;
          box-shadow: 0 38px 80px rgba(0, 0, 0, 0.34);
        }

        .fallback3dPlane::before,
        .fallback3dPlane::after {
          content: "";
          position: absolute;
          pointer-events: none;
        }

        .fallback3dPlane::before {
          inset: 22px;
          border: 1px dashed rgba(94, 234, 212, 0.34);
          border-radius: 8px;
        }

        .fallback3dPlane::after {
          left: 12%;
          right: 12%;
          top: 50%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.72), transparent);
        }

        .fallback3dPlane span {
          position: absolute;
          left: 18px;
          top: 14px;
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 900;
        }

        .fallback3dPlane i {
          position: absolute;
          width: 24px;
          height: 24px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.74);
          color: #bfdbfe;
          font-size: 10px;
          font-style: normal;
          font-weight: 900;
        }

        .fallback3dPlane .axisX {
          right: 24px;
          bottom: 20px;
        }

        .fallback3dPlane .axisY {
          left: 24px;
          bottom: 20px;
        }

        .fallback3dZone,
        .fallback3dMarker {
          position: absolute;
          z-index: 4;
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
        }

        .fallback3dZone {
          min-height: 32px;
          transform: translate(-50%, -50%) rotate(-4deg);
          border: 1px solid rgba(226, 232, 240, 0.26);
          background: rgba(15, 23, 42, 0.5);
          color: #e5e7eb;
          font-size: 11px;
          font-weight: 900;
          padding: 7px 9px;
          box-shadow: 0 12px 34px rgba(0, 0, 0, 0.22);
        }

        .fallback3dZone.isSelected {
          border-color: #5eead4;
          background: rgba(20, 184, 166, 0.22);
        }

        .fallback3dMarker {
          min-width: 152px;
          min-height: 70px;
          border: 2px solid #94a3b8;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(226, 232, 240, 0.92));
          color: #111827;
          padding: 10px 10px 10px 48px;
          box-shadow: 0 18px 36px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.8);
          transition: box-shadow 0.16s ease, filter 0.16s ease;
        }

        .fallback3dMarker::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: -18px;
          width: 44px;
          height: 12px;
          transform: translateX(-50%);
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.25);
          filter: blur(4px);
        }

        .fallback3dMarker b {
          position: absolute;
          left: 10px;
          top: 11px;
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: #0f172a;
          color: #ffffff;
          font-size: 10px;
          font-weight: 900;
        }

        .fallback3dMarker:hover,
        .fallback3dMarker.isSelected {
          box-shadow: 0 22px 44px rgba(20, 184, 166, 0.36);
          filter: saturate(1.08);
        }

        .fallback3dMarker span,
        .fallback3dMarker strong,
        .fallback3dMarker small {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .fallback3dMarker span {
          color: #64748b;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .fallback3dMarker strong {
          margin-top: 2px;
          font-size: 12px;
        }

        .fallback3dMarker small {
          color: #475569;
          font-size: 11px;
          font-weight: 800;
        }

        .fallback3dMarker.statusNormal {
          border-color: #10b981;
        }

        .fallback3dMarker.statusWarning {
          border-color: #f59e0b;
        }

        .fallback3dMarker.statusCritical {
          border-color: #dc2626;
        }

        .fallback3dMarker.statusOffline {
          border-color: #6b7280;
        }

        .fallback3dMarker.statusNormal b {
          background: #047857;
        }

        .fallback3dMarker.statusWarning b {
          background: #b45309;
        }

        .fallback3dMarker.statusCritical b {
          background: #b91c1c;
        }

        .fallback3dMarker.statusOffline b {
          background: #475569;
        }
      `}</style>
    </div>
  );
}

function InspectorPanel({
  data,
  state,
  dispatch,
  selectedEquipment,
  selectedEquipmentVisible,
  selectedZone,
  selectedSystem,
  scopedEquipment,
  visibleEquipment,
  selectedTelemetry,
}: {
  data: WorkspaceMockData;
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
  selectedEquipment?: EquipmentModel;
  selectedEquipmentVisible: boolean;
  selectedZone?: ZoneModel;
  selectedSystem?: SystemModel;
  scopedEquipment: EquipmentModel[];
  visibleEquipment: EquipmentModel[];
  selectedTelemetry: SelectedTelemetryState;
}) {
  return (
    <aside className="inspectorPanel panelSurface" aria-label="Inspector panel">
      {selectedEquipment && selectedEquipmentVisible ? (
        <EquipmentInspector
          data={data}
          state={state}
          dispatch={dispatch}
          equipment={selectedEquipment}
          selectedTelemetry={selectedTelemetry}
        />
      ) : selectedZone ? (
        <ZoneInspector
          data={data}
          state={state}
          dispatch={dispatch}
          zone={selectedZone}
          visibleEquipment={visibleEquipment}
        />
      ) : selectedSystem ? (
        <SystemInspector data={data} dispatch={dispatch} system={selectedSystem} />
      ) : state.selectedLayer !== "plan" ? (
        <LayerInspector
          data={data}
          state={state}
          dispatch={dispatch}
          scopedEquipment={scopedEquipment}
          visibleEquipment={visibleEquipment}
        />
      ) : (
        <ObjectSummaryInspector data={data} dispatch={dispatch} />
      )}
      <style jsx>{`
        .inspectorPanel {
          min-height: 0;
          overflow: auto;
          padding: 14px;
        }
      `}</style>
    </aside>
  );
}

function ObjectSummaryInspector({
  data,
  dispatch,
}: {
  data: WorkspaceMockData;
  dispatch: Dispatch<WorkspaceAction>;
}) {
  const summary = getObjectSummary(data);

  return (
    <div className="inspectorStack">
      <InspectorTitle eyebrow="Inspector" title="Object summary" subtitle={data.object.name} />
      <div className="summaryGrid">
        <Metric label="Equipment" value={String(summary.equipmentCount)} />
        <Metric label="Active alarms" value={String(summary.activeAlarms)} tone={summary.criticalAlarms ? "critical" : "warning"} />
        <Metric label="Warning zones" value={String(summary.warningZones)} />
        <Metric label="Offline" value={String(summary.offlineEquipment)} />
      </div>
      <section className="inspectorBlock">
        <h3>Quick recommendations</h3>
        <ul>
          <li>Начать с critical alarm по ШУ-2 и датчику DP CHW-01.</li>
          <li>Проверить фанкойлы торговой зоны A из-за роста обратки.</li>
          <li>Оставить команды read-only до API/role integration.</li>
        </ul>
      </section>
      <section className="inspectorBlock">
        <h3>Priority alarms</h3>
        <div className="compactList">
          {data.alarms
            .filter((alarm) => alarm.status === "active")
            .sort((a, b) => statusRank(b.severity) - statusRank(a.severity))
            .slice(0, 4)
            .map((alarm) => (
              <button key={alarm.id} type="button" onClick={() => dispatch({ type: "selectAlarm", alarmId: alarm.id })}>
                <i className={getStatusClass(alarm.severity)} />
                <span>{alarm.title}</span>
              </button>
            ))}
        </div>
      </section>
      <InspectorStyles />
    </div>
  );
}

function ZoneInspector({
  data,
  state,
  dispatch,
  zone,
  visibleEquipment,
}: {
  data: WorkspaceMockData;
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
  zone: ZoneModel;
  visibleEquipment: EquipmentModel[];
}) {
  const equipment = getZoneEquipment(data, zone.id);
  const visibleZoneEquipment = visibleEquipment.filter((item) => item.zoneId === zone.id);
  const activeEvents = data.events.filter((event) => event.zoneId === zone.id);
  const hasHiddenEquipment = equipment.length > visibleZoneEquipment.length;

  return (
    <div className="inspectorStack">
      <InspectorTitle eyebrow="Selected zone" title={zone.name} subtitle={statusLabels[zone.status]} status={zone.status} />
      <div className="summaryGrid">
        <Metric label="Temperature" value={zone.temperature} />
        <Metric label="Humidity" value={zone.humidity} />
        <Metric label="CO2" value={zone.co2} />
        <Metric label="Assets" value={String(equipment.length)} />
        <Metric label="Visible now" value={String(visibleZoneEquipment.length)} />
      </div>
      <section className="inspectorBlock">
        <h3>Equipment in current canvas layer</h3>
        {visibleZoneEquipment.length ? (
          <div className="compactList">
            {visibleZoneEquipment.map((item) => (
              <button key={item.id} type="button" onClick={() => dispatch({ type: "selectEquipment", equipmentId: item.id })}>
                <i className={getStatusClass(item.status)} />
                <span>{item.displayName}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="mutedText">
            No equipment in this zone matches the current {layerLabels[state.selectedLayer]} layer or filters.
          </p>
        )}
        {hasHiddenEquipment ? (
          <p className="mutedText">
            {equipment.length - visibleZoneEquipment.length} asset
            {equipment.length - visibleZoneEquipment.length === 1 ? "" : "s"} hidden by layer/status/search filters.
          </p>
        ) : null}
      </section>
      {visibleEquipment.length && !visibleZoneEquipment.length ? (
        <section className="inspectorBlock">
          <h3>Visible elsewhere in scope</h3>
          <div className="compactList">
            {visibleEquipment.slice(0, 5).map((item) => (
              <button key={item.id} type="button" onClick={() => dispatch({ type: "selectEquipment", equipmentId: item.id })}>
                <i className={getStatusClass(item.status)} />
                <span>{item.displayName}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}
      <section className="inspectorBlock">
        <h3>Active events</h3>
        {activeEvents.length ? (
          <div className="timelineList">
            {activeEvents.map((event) => (
              <article key={event.id}>
                <span>{event.timestamp}</span>
                <strong>{event.title}</strong>
                <small>{event.description}</small>
              </article>
            ))}
          </div>
        ) : (
          <p className="mutedText">Активных событий по зоне нет.</p>
        )}
      </section>
      <InspectorStyles />
    </div>
  );
}

function LayerInspector({
  data,
  state,
  dispatch,
  scopedEquipment,
  visibleEquipment,
}: {
  data: WorkspaceMockData;
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
  scopedEquipment: EquipmentModel[];
  visibleEquipment: EquipmentModel[];
}) {
  const activeLayerSystems =
    state.selectedLayer === "plan" || state.selectedLayer === "hvac" || state.selectedLayer === "3d"
      ? data.systems
      : data.systems.filter((system) => system.layer === state.selectedLayer);
  const activeAlarms = data.alarms.filter((alarm) =>
    visibleEquipment.some((equipment) => equipment.id === alarm.equipmentId),
  );
  const title =
    state.selectedLayer === "3d"
      ? "Workspace 3D layer"
      : `${layerLabels[state.selectedLayer]} layer`;

  return (
    <div className="inspectorStack">
      <InspectorTitle
        eyebrow="Canvas context"
        title={title}
        subtitle="Inspector follows the active center canvas layer"
      />
      <div className="summaryGrid">
        <Metric label="Visible assets" value={String(visibleEquipment.length)} />
        <Metric label="Assets in scope" value={String(scopedEquipment.length)} />
        <Metric label="Systems" value={String(activeLayerSystems.length)} />
        <Metric label="Active alarms" value={String(activeAlarms.length)} tone={activeAlarms.length ? "warning" : undefined} />
      </div>
      <section className="inspectorBlock">
        <h3>Equipment in current layer</h3>
        {visibleEquipment.length ? (
          <div className="compactList">
            {visibleEquipment.slice(0, 8).map((item) => (
              <button key={item.id} type="button" onClick={() => dispatch({ type: "selectEquipment", equipmentId: item.id })}>
                <i className={getStatusClass(item.status)} />
                <span>{item.displayName}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="mutedText">
            No equipment matches this layer in the current floor/zone scope. Use Clear filters or pick another floor/zone.
          </p>
        )}
      </section>
      {state.selectedLayer === "3d" ? (
        <section className="inspectorBlock">
          <h3>3D mode</h3>
          <p className="mutedText">
            Workspace 3D uses the fallback 2.5D equipment layout. Equipment-level GLB models still open from the
            selected asset&apos;s 3D Model tab. No real equipment control.
          </p>
        </section>
      ) : null}
      <InspectorStyles />
    </div>
  );
}

function SystemInspector({
  data,
  dispatch,
  system,
}: {
  data: WorkspaceMockData;
  dispatch: Dispatch<WorkspaceAction>;
  system: SystemModel;
}) {
  const equipment = data.equipment.filter((item) => item.systemId === system.id);
  const alarms = data.alarms.filter((alarm) => equipment.some((item) => item.id === alarm.equipmentId));

  return (
    <div className="inspectorStack">
      <InspectorTitle eyebrow="Selected system" title={system.name} subtitle={system.description} status={system.status} />
      <div className="summaryGrid">
        <Metric label="Assets" value={String(equipment.length)} />
        <Metric label="Active alarms" value={String(alarms.length)} tone={alarms.some((alarm) => alarm.severity === "critical") ? "critical" : "warning"} />
        <Metric label="Layer" value={layerLabels[system.layer]} />
        <Metric label="Status" value={statusLabels[system.status]} />
      </div>
      <section className="inspectorBlock">
        <h3>Equipment chain</h3>
        <div className="compactList">
          {equipment.map((item) => (
            <button key={item.id} type="button" onClick={() => dispatch({ type: "selectEquipment", equipmentId: item.id })}>
              <i className={getStatusClass(item.status)} />
              <span>{item.displayName}</span>
            </button>
          ))}
        </div>
      </section>
      <InspectorStyles />
    </div>
  );
}

function EquipmentInspector({
  data,
  state,
  dispatch,
  equipment,
  selectedTelemetry,
}: {
  data: WorkspaceMockData;
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
  equipment: EquipmentModel;
  selectedTelemetry: SelectedTelemetryState;
}) {
  const zone = byId(data.zones, equipment.zoneId);
  const floor = byId(data.floors, equipment.floorId);
  const system = byId(data.systems, equipment.systemId);
  const alarms = getEquipmentAlarms(data, equipment.id);
  const events = data.events.filter((event) => event.equipmentId === equipment.id);
  const selectedAlarm = byId(alarms, state.selectedAlarmId) ?? alarms[0];
  const recommendedActions = getRecommendedActions(data, equipment.id, selectedAlarm?.id);

  return (
    <div className="inspectorStack">
      <InspectorTitle
        eyebrow="Selected equipment"
        title={equipment.displayName}
        subtitle={`${equipmentTypeLabels[equipment.type]} · ${system?.name ?? "No system"}`}
        status={equipment.status}
      />

      {isScenarioAffectingEquipment(state.scenario, equipment.id) ? (
        <GuidedIncidentCard
          data={data}
          state={state}
          dispatch={dispatch}
          equipment={equipment}
          alarm={selectedAlarm}
        />
      ) : null}

      <div className="inspectorTabs" role="tablist" aria-label="Equipment inspector tabs">
        {inspectorTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={state.inspectorTab === tab}
            className={state.inspectorTab === tab ? "isActive" : ""}
            onClick={() => dispatch({ type: "setInspectorTab", inspectorTab: tab })}
          >
            {inspectorTabLabels[tab]}
          </button>
        ))}
      </div>

      {state.inspectorTab === "overview" ? (
        <OverviewTab
          data={data}
          state={state}
          dispatch={dispatch}
          equipment={equipment}
          zone={zone}
          floor={floor}
          system={system}
          selectedAlarm={selectedAlarm}
          recommendedActions={recommendedActions}
          selectedTelemetry={selectedTelemetry}
        />
      ) : null}
      {state.inspectorTab === "telemetry" ? (
        <TelemetryTab equipment={equipment} selectedTelemetry={selectedTelemetry} scenario={state.scenario} />
      ) : null}
      {state.inspectorTab === "controls" ? (
        <ControlsTab
          data={data}
          state={state}
          dispatch={dispatch}
          equipment={equipment}
          selectedAlarm={selectedAlarm}
          recommendedActions={recommendedActions}
        />
      ) : null}
      {state.inspectorTab === "3d" ? <LazyEquipmentModelViewer equipment={equipment} /> : null}
      {state.inspectorTab === "alarms" ? (
        <AlarmsTab
          data={data}
          state={state}
          dispatch={dispatch}
          equipment={equipment}
          alarms={alarms}
        />
      ) : null}
      {state.inspectorTab === "history" ? <HistoryTab events={events} journal={state.journal} equipmentId={equipment.id} /> : null}
      {state.inspectorTab === "passport" ? <PassportTab equipment={equipment} /> : null}

      <InspectorStyles />
      <style jsx>{`
        .inspectorTabs {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px;
        }

        .inspectorTabs button {
          min-height: 34px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          color: #374151;
          cursor: pointer;
          font-size: 12px;
          font-weight: 800;
          padding: 7px 8px;
        }

        .inspectorTabs button.isActive {
          border-color: #111827;
          background: #111827;
          color: #ffffff;
        }
      `}</style>
    </div>
  );
}

function OverviewTab({
  data,
  state,
  dispatch,
  equipment,
  zone,
  floor,
  system,
  selectedAlarm,
  recommendedActions,
  selectedTelemetry,
}: {
  data: WorkspaceMockData;
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
  equipment: EquipmentModel;
  zone?: ZoneModel;
  floor?: { name: string };
  system?: SystemModel;
  selectedAlarm?: AlarmModel;
  recommendedActions: RecommendedActionModel[];
  selectedTelemetry: SelectedTelemetryState;
}) {
  const telemetry = getEffectiveTelemetry(
    equipment,
    selectedTelemetry,
    isScenarioAffectingEquipment(state.scenario, equipment.id),
  );
  const telemetryPreview = Object.entries(telemetry).slice(0, 4);
  const telemetryStatus =
    selectedTelemetry.equipmentId === equipment.id ? selectedTelemetry.status : "idle";
  const liveUpdatedAt = selectedTelemetry.equipmentId === equipment.id ? selectedTelemetry.updatedAt : undefined;

  return (
    <>
      <div className="summaryGrid">
        <Metric label="Status" value={statusLabels[equipment.status]} tone={equipment.status} />
        <Metric label="Mode" value={equipment.mode.toUpperCase()} />
        <Metric label="Updated" value={liveUpdatedAt ? formatApiTimestamp(liveUpdatedAt) : equipment.updatedAt} />
        <Metric label="Live API" value={telemetryStatus === "unavailable" ? "Fallback" : telemetryStatus.toUpperCase()} />
        <Metric label="Commands" value={equipment.capabilities.canWrite ? "Enabled" : "Read-only"} />
      </div>
      <section className="inspectorBlock">
        <h3>Context</h3>
        <dl className="detailList">
          <div><dt>Zone</dt><dd>{zone?.name ?? "TO VERIFY"}</dd></div>
          <div><dt>Floor</dt><dd>{floor?.name ?? "TO VERIFY"}</dd></div>
          <div><dt>System</dt><dd>{system?.name ?? "TO VERIFY"}</dd></div>
          <div><dt>Source alias</dt><dd>{equipment.sourceAlias}</dd></div>
        </dl>
      </section>
      <section className="inspectorBlock">
        <h3>Key parameters</h3>
        {telemetryPreview.length ? (
          <div className="paramGrid">
            {telemetryPreview.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{String(value)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No key parameters"
            description="У оборудования нет заполненных telemetry-параметров; используйте Passport или History."
          />
        )}
      </section>
      <section className="inspectorBlock">
        <h3>Recommended actions</h3>
        <RecommendedActionsList
          data={data}
          state={state}
          dispatch={dispatch}
          equipment={equipment}
          alarm={selectedAlarm}
          actions={recommendedActions}
        />
      </section>
      <section className="inspectorBlock">
        <h3>Operator notes</h3>
        <ul>
          {equipment.recommendations.map((recommendation) => (
            <li key={recommendation}>{recommendation}</li>
          ))}
        </ul>
      </section>
    </>
  );
}

function GuidedIncidentCard({
  data,
  state,
  dispatch,
  equipment,
  alarm,
}: {
  data: WorkspaceMockData;
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
  equipment: EquipmentModel;
  alarm?: AlarmModel;
}) {
  const scenario = state.scenario;
  const definition = getDispatchScenarioDefinition(scenario.id);
  const target = getDispatchScenarioTarget(scenario);
  const activeStepIndex = Math.max(
    0,
    scenario.steps.findIndex((step) => step.id === scenario.activeStepId),
  );
  const scenarioAction = data.recommendedActions.find((action) => action.id === `scenario-action-${scenario.id}`)
    ?? getRecommendedActions(data, equipment.id, target.alarmId)[0];

  const prepareScenarioCommand = () => {
    const command = byId(data.commands, scenarioAction?.commandId ?? target.commandId) ?? data.commands[0];
    if (!command) return;

    if (scenarioAction) {
      dispatch({ type: "selectRecommendedAction", actionId: scenarioAction.id });
    }

    dispatch({
      type: "prepareCommand",
      command: buildPreparedCommand({
        equipment,
        command,
        action: scenarioAction,
        alarm,
        reason: `${definition.recommendedAction} Demo scenario only; no real equipment will be controlled.`,
      }),
    });
  };

  return (
    <section className="guidedIncidentCard" aria-label="Guided incident">
      <div className="guidedIncidentHeader">
        <span>Guided Incident</span>
        <strong>Step {activeStepIndex + 1} of {scenario.steps.length}</strong>
      </div>
      <h3>{scenario.title}</h3>
      <dl>
        <div>
          <dt>What happened</dt>
          <dd>{definition.story}</dd>
        </div>
        <div>
          <dt>Probable cause</dt>
          <dd>{definition.probableCause}</dd>
        </div>
        <div>
          <dt>Recommended next action</dt>
          <dd>{definition.recommendedAction}</dd>
        </div>
      </dl>
      <div className="guidedIncidentActions">
        <button
          type="button"
          onClick={() => dispatch({ type: "selectEquipment", equipmentId: equipment.id, inspectorTab: "alarms" })}
        >
          Open affected equipment
        </button>
        <button type="button" onClick={prepareScenarioCommand}>
          Prepare demo command
        </button>
      </div>
      <p>Demo scenario updated locally. No real equipment was controlled.</p>
    </section>
  );
}

function TelemetryTab({
  equipment,
  selectedTelemetry,
  scenario,
}: {
  equipment: EquipmentModel;
  selectedTelemetry: SelectedTelemetryState;
  scenario: DispatchScenarioState;
}) {
  const telemetry = getEffectiveTelemetry(
    equipment,
    selectedTelemetry,
    isScenarioAffectingEquipment(scenario, equipment.id),
  );
  const telemetryEntries = Object.entries(telemetry);
  const isCurrentEquipment = selectedTelemetry.equipmentId === equipment.id;
  const status = isCurrentEquipment ? selectedTelemetry.status : "idle";

  return (
    <section className="inspectorBlock">
      <div className="telemetryHeader">
        <h3>Live telemetry simulation</h3>
        <span className={`telemetryState ${status}`}>{status}</span>
      </div>
      <div className="telemetryMeta">
        <span>Selected equipment polling only</span>
        <strong>Updated {isCurrentEquipment ? formatApiTimestamp(selectedTelemetry.updatedAt) : equipment.updatedAt}</strong>
      </div>
      {status === "unavailable" ? (
        <div className="apiFallback" role="status">
          <strong>API unavailable fallback</strong>
          <span>{selectedTelemetry.error ?? "Using local snapshot telemetry until the simulation API responds."}</span>
        </div>
      ) : null}
      {telemetryEntries.length ? (
        <div className="telemetryList">
          {telemetryEntries.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{String(value)}</strong>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Telemetry unavailable"
          description="Для этого оборудования telemetry contract не вернул значения. Карточка остается доступной для паспорта и событий."
        />
      )}
    </section>
  );
}

function RecommendedActionsList({
  data,
  state,
  dispatch,
  equipment,
  alarm,
  actions,
}: {
  data: WorkspaceMockData;
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
  equipment: EquipmentModel;
  alarm?: AlarmModel;
  actions: RecommendedActionModel[];
}) {
  if (!actions.length) {
    return (
      <EmptyState
        title="No recommended actions"
        description="Для текущего контекста нет заранее подготовленного workflow. Можно перейти в Controls и подготовить ручное действие."
      />
    );
  }

  const prepareAction = (action: RecommendedActionModel) => {
    const command = byId(data.commands, action.commandId) ?? data.commands[0];
    if (!command) return;

    dispatch({ type: "selectRecommendedAction", actionId: action.id });
    dispatch({
      type: "prepareCommand",
      command: buildPreparedCommand({
        equipment,
        command,
        action,
        alarm,
      }),
    });
  };

  return (
    <div className="recommendedActionList">
      {actions.map((action) => (
        <article
          key={action.id}
          className={state.selectedWorkflowActionId === action.id ? "isSelected" : undefined}
        >
          <span>{riskLabels[action.risk]}</span>
          <strong>{action.title}</strong>
          <small>{action.description}</small>
          <button type="button" onClick={() => prepareAction(action)}>
            {action.commandLabel}
          </button>
        </article>
      ))}
    </div>
  );
}

function ControlsTab({
  data,
  state,
  dispatch,
  equipment,
  selectedAlarm,
  recommendedActions,
}: {
  data: WorkspaceMockData;
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
  equipment: EquipmentModel;
  selectedAlarm?: AlarmModel;
  recommendedActions: RecommendedActionModel[];
}) {
  const commands = data.commands.filter(
    (command) => command.equipmentType === "all" || command.equipmentType === equipment.type,
  );

  const prepareCommand = (command: CommandModel, value?: string) => {
    dispatch({
      type: "prepareCommand",
      command: buildPreparedCommand({
        equipment,
        command,
        alarm: selectedAlarm,
        value,
        reason: `${command.label} ${value ?? command.value} prepared locally from Controls. The R005 API client will send it only to the simulator.`,
      }),
    });
  };

  return (
    <section className="inspectorBlock">
      <h3>Controls</h3>
      <div className="controlFields">
        <label>
          <span>Mode</span>
          <select
            defaultValue={equipment.mode}
            onChange={(event) => {
              const command = byId(data.commands, "mode-auto") ?? commands[0];
              if (command) prepareCommand(command, event.target.value);
            }}
          >
            <option value="auto">Auto</option>
            <option value="manual">Manual</option>
            <option value="off">Off</option>
            <option value="service">Service</option>
          </select>
        </label>
        <label>
          <span>Target temperature</span>
          <input
            defaultValue="22 °C"
            onBlur={(event) => {
              const command = byId(data.commands, "target-temp") ?? commands[0];
              if (command) prepareCommand(command, event.target.value);
            }}
          />
        </label>
        <label>
          <span>Fan speed</span>
          <select
            defaultValue="auto"
            onChange={(event) => {
              const command = byId(data.commands, "fan-speed") ?? commands[0];
              if (command) prepareCommand(command, event.target.value);
            }}
          >
            <option value="auto">Auto</option>
            <option value="1">Speed 1</option>
            <option value="2">Speed 2</option>
            <option value="3">Speed 3</option>
          </select>
        </label>
      </div>
      <section className="workflowInline">
        <h4>Recommended workflow</h4>
        <RecommendedActionsList
          data={data}
          state={state}
          dispatch={dispatch}
          equipment={equipment}
          alarm={selectedAlarm}
          actions={recommendedActions}
        />
      </section>
      <div className="commandGrid">
        {commands.map((command) => (
          <button key={command.id} type="button" onClick={() => prepareCommand(command)}>
            <span>{command.label}</span>
            <strong>{command.value}</strong>
          </button>
        ))}
      </div>
      <div className="capabilityBox">
        <strong>{equipment.capabilities.canWrite ? "Write available" : "Simulator-only in R005 demo"}</strong>
        <span>
          can_read={String(equipment.capabilities.canRead)} · can_write={String(equipment.capabilities.canWrite)} ·
          trends={String(equipment.capabilities.hasTrends)}
        </span>
      </div>
      {state.commandNotice ? <p className="commandNotice">{state.commandNotice}</p> : null}
    </section>
  );
}

function AlarmsTab({
  data,
  state,
  dispatch,
  equipment,
  alarms,
}: {
  data: WorkspaceMockData;
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
  equipment: EquipmentModel;
  alarms: AlarmModel[];
}) {
  return (
    <section className="inspectorBlock">
      <h3>Alarm triage</h3>
      {alarms.length ? (
        <div className="alarmTriageList">
          {alarms.map((alarm) => (
            <article
              key={alarm.id}
              className={`${getStatusClass(alarm.severity)} ${
                state.selectedAlarmId === alarm.id ? "isSelected" : ""
              }`}
            >
              <div className="triageHeader">
                <span>{alarm.timestamp} · {alarm.status}</span>
                <b>{statusLabels[alarm.severity]}</b>
              </div>
              <strong>{alarm.title}</strong>
              <small>{alarm.message}</small>
              <ol>
                <li>Confirm source: {equipment.sourceAlias}</li>
                <li>Review telemetry and related zone/system context.</li>
                <li>Choose a recommended action or prepare a local command.</li>
              </ol>
              <RecommendedActionsList
                data={data}
                state={state}
                dispatch={dispatch}
                equipment={equipment}
                alarm={alarm}
                actions={getRecommendedActions(data, equipment.id, alarm.id)}
              />
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No active alarms"
          description="По выбранному оборудованию нет активных аварий; можно смотреть History или Passport."
        />
      )}
    </section>
  );
}

function HistoryTab({
  events,
  journal,
  equipmentId,
}: {
  events: WorkspaceMockData["events"];
  journal: WorkflowJournalEntry[];
  equipmentId: string;
}) {
  const workflowEvents = journal.filter((entry) => entry.equipmentId === equipmentId);

  return (
    <section className="inspectorBlock">
      <h3>History and journal</h3>
      {workflowEvents.length ? (
        <div className="timelineList">
          {workflowEvents.map((event) => (
            <article key={event.id}>
              <span>{event.timestamp} · {event.type}</span>
              <strong>{event.title}</strong>
              <small>{event.description}</small>
            </article>
          ))}
        </div>
      ) : null}
      {events.length ? (
        <div className="timelineList">
          {events.map((event) => (
            <article key={event.id}>
              <span>{event.timestamp} · {event.type}</span>
              <strong>{event.title}</strong>
              <small>{event.description}</small>
            </article>
          ))}
        </div>
      ) : !workflowEvents.length ? (
        <p className="mutedText">История по выбранному оборудованию пока пуста.</p>
      ) : null}
    </section>
  );
}

function PassportTab({ equipment }: { equipment: EquipmentModel }) {
  const passportEntries = Object.entries(equipment.passport);

  return (
    <section className="inspectorBlock">
      <h3>Passport</h3>
      {passportEntries.length ? (
        <dl className="detailList">
          {passportEntries.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{String(value)}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <EmptyState
          title="Passport not mapped"
          description="Паспортные поля пока не привязаны к registry. Это штатный empty state для dispatch demo."
        />
      )}
    </section>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="emptyState">
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

function BottomEventsPanel({
  data,
  state,
  dispatch,
  visibleEquipment,
}: {
  data: WorkspaceMockData;
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
  visibleEquipment: EquipmentModel[];
}) {
  const isScopedToCanvas =
    Boolean(state.selectedZoneId) ||
    Boolean(state.selectedSystemId) ||
    Boolean(state.selectedEquipmentId) ||
    state.selectedLayer === "cooling" ||
    state.selectedLayer === "ventilation" ||
    state.selectedLayer === "3d" ||
    state.statusFilter !== "all" ||
    Boolean(state.searchQuery.trim());
  const visibleEquipmentIds = new Set(visibleEquipment.map((equipment) => equipment.id));
  const matchesBottomScope = (equipmentId?: string) =>
    !isScopedToCanvas || (equipmentId ? visibleEquipmentIds.has(equipmentId) : false);
  const activeAlarms = data.alarms.filter((alarm) => alarm.status === "active" && matchesBottomScope(alarm.equipmentId));
  const events = data.events.filter((event) => event.type === "event" && matchesBottomScope(event.equipmentId));
  const maintenance = data.events.filter((event) => event.type === "maintenance" && matchesBottomScope(event.equipmentId));
  const commands = data.events.filter((event) => event.type === "command" && matchesBottomScope(event.equipmentId));
  const commandJournal = state.journal.filter(
    (entry) =>
      ["command_prepared", "command_confirmed", "command_cancelled"].includes(entry.type) &&
      matchesBottomScope(entry.equipmentId),
  );
  const contextLabel =
    state.selectedLayer === "3d"
      ? "current 3D layer/scope"
      : state.selectedLayer === "hvac" || state.selectedLayer === "plan"
        ? "current scope"
        : `${layerLabels[state.selectedLayer]} layer/scope`;

  return (
    <section className="bottomPanel" aria-label="Alarms and events">
      <div className="bottomTabs" role="tablist" aria-label="Bottom panel tabs">
        {bottomTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={state.bottomTab === tab}
            className={state.bottomTab === tab ? "isActive" : ""}
            onClick={() => dispatch({ type: "setBottomTab", bottomTab: tab })}
          >
            {bottomTabLabels[tab]}
          </button>
        ))}
      </div>

      <div className="bottomContent">
        {state.bottomTab === "alarms" ? (
          activeAlarms.length ? (
            activeAlarms.map((alarm) => (
              <button
                key={alarm.id}
                type="button"
                className={`bottomItem ${getStatusClass(alarm.severity)}`}
                onClick={() => dispatch({ type: "selectAlarm", alarmId: alarm.id })}
              >
                <span>{alarm.timestamp}</span>
                <strong>{alarm.title}</strong>
                <small>{alarm.message}</small>
              </button>
            ))
          ) : (
            <BottomEmptyState title="No alarms in current layer/scope" description={`No active alarms match the ${contextLabel}.`} />
          )
        ) : null}

        {state.bottomTab === "events" ? (
          events.length ? (
            events.map((event) => <BottomEventButton key={event.id} event={event} dispatch={dispatch} />)
          ) : (
            <BottomEmptyState title="No events in current layer/scope" description={`No events match the ${contextLabel}.`} />
          )
        ) : null}

        {state.bottomTab === "maintenance" ? (
          maintenance.length ? (
            maintenance.map((event) => <BottomEventButton key={event.id} event={event} dispatch={dispatch} />)
          ) : (
            <BottomEmptyState title="No maintenance in current layer/scope" description={`No maintenance events match the ${contextLabel}.`} />
          )
        ) : null}

        {state.bottomTab === "commands" ? (
          commandJournal.length || commands.length ? (
            <>
              {commandJournal.map((entry) => (
                <BottomJournalButton key={entry.id} entry={entry} dispatch={dispatch} />
              ))}
              {commands.map((event) => <BottomEventButton key={event.id} event={event} dispatch={dispatch} />)}
            </>
          ) : (
            <BottomEmptyState title="No commands in current layer/scope" description={`No command journal entries match the ${contextLabel}.`} />
          )
        ) : null}

        {state.bottomTab === "scenario" ? (
          <ScenarioTimeline scenario={state.scenario} dispatch={dispatch} />
        ) : null}
      </div>

      <style jsx global>{`
        .bottomPanel {
          min-height: 112px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 10px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
          padding: 10px;
        }

        .bottomTabs {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px;
          width: 240px;
        }

        .bottomTabs button {
          min-height: 38px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #f9fafb;
          color: #374151;
          cursor: pointer;
          font-size: 12px;
          font-weight: 800;
          padding: 7px 8px;
        }

        .bottomTabs button.isActive {
          border-color: #111827;
          background: #111827;
          color: #ffffff;
        }

        .bottomContent {
          min-width: 0;
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: minmax(260px, 340px);
          gap: 8px;
          overflow-x: auto;
        }

        .bottomItem {
          min-height: 86px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #f9fafb;
          color: #111827;
          cursor: pointer;
          padding: 9px;
          text-align: left;
        }

        .bottomItem span,
        .bottomItem strong,
        .bottomItem small {
          display: block;
        }

        .bottomItem span {
          color: #6b7280;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .bottomItem strong {
          margin-top: 4px;
          font-size: 13px;
        }

        .bottomItem small {
          margin-top: 4px;
          color: #4b5563;
          font-size: 12px;
          line-height: 1.35;
        }

        .bottomItem.workflowJournalItem {
          border-color: #0f766e;
          background: #ecfdf5;
        }

        .bottomEmptyState {
          min-height: 86px;
          display: grid;
          align-content: center;
          gap: 5px;
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
          background: #f8fafc;
          color: #475569;
          padding: 12px;
        }

        .bottomEmptyState strong,
        .bottomEmptyState small {
          display: block;
        }

        .bottomEmptyState strong {
          color: #111827;
          font-size: 13px;
        }

        .bottomEmptyState small {
          font-size: 12px;
          line-height: 1.35;
        }

        .bottomItem.scenarioStepItem {
          border-color: #cbd5e1;
          background: #f8fafc;
        }

        .bottomItem.scenarioStepItem.active {
          border-color: #0f766e;
          background: #ecfdf5;
        }

        .bottomItem.scenarioStepItem.completed {
          border-color: #94a3b8;
          background: #f1f5f9;
        }

        @media (max-width: 820px) {
          .bottomPanel {
            grid-template-columns: 1fr;
          }

          .bottomTabs {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}

function BottomEventButton({
  event,
  dispatch,
}: {
  event: EventModel;
  dispatch: Dispatch<WorkspaceAction>;
}) {
  const onClick = () => {
    if (event.equipmentId) {
      dispatch({ type: "selectEquipment", equipmentId: event.equipmentId, inspectorTab: "history" });
    }
  };

  return (
    <button type="button" className="bottomItem" onClick={onClick}>
      <span>{event.timestamp} · {event.type}</span>
      <strong>{event.title}</strong>
      <small>{event.description}</small>
    </button>
  );
}

function BottomJournalButton({
  entry,
  dispatch,
}: {
  entry: WorkflowJournalEntry;
  dispatch: Dispatch<WorkspaceAction>;
}) {
  const onClick = () => {
    dispatch({ type: "selectEquipment", equipmentId: entry.equipmentId, inspectorTab: "history" });
  };

  return (
    <button type="button" className="bottomItem workflowJournalItem" onClick={onClick}>
      <span>{entry.timestamp} · {entry.type}</span>
      <strong>{entry.title}</strong>
      <small>{entry.description}</small>
    </button>
  );
}

function BottomEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="bottomEmptyState">
      <strong>{title}</strong>
      <small>{description}</small>
    </div>
  );
}

function ScenarioTimeline({
  scenario,
  dispatch,
}: {
  scenario: DispatchScenarioState;
  dispatch: Dispatch<WorkspaceAction>;
}) {
  return (
    <>
      {scenario.steps.map((step) => (
        <ScenarioStepButton key={step.id} step={step} dispatch={dispatch} />
      ))}
    </>
  );
}

function ScenarioStepButton({
  step,
  dispatch,
}: {
  step: DispatchScenarioStep;
  dispatch: Dispatch<WorkspaceAction>;
}) {
  const prefix = step.status === "completed" ? "✓" : step.status === "active" ? "●" : "○";

  return (
    <button
      type="button"
      className={`bottomItem scenarioStepItem ${step.status}`}
      onClick={() => dispatch({ type: "selectScenarioStep", stepId: step.id })}
    >
      <span>{step.timestamp ?? "T+00:00"} · {step.status}</span>
      <strong>{prefix} {step.title}</strong>
      <small>{step.description}</small>
    </button>
  );
}

function CommandConfirmationModal({
  data,
  state,
  dispatch,
}: {
  data: WorkspaceMockData;
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
}) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | undefined>();
  const command = state.pendingCommand;

  useEffect(() => {
    setIsConfirming(false);
    setConfirmError(undefined);
  }, [command?.id]);

  if (!command) return null;

  const equipment = byId(data.equipment, command.equipmentId);
  const alarm = byId(data.alarms, command.alarmId);
  const action = byId(data.recommendedActions, command.actionId);

  const confirmCommand = async () => {
    setIsConfirming(true);
    setConfirmError(undefined);

    try {
      const response = await confirmDispatchCommandViaApi(command);
      dispatch({
        type: "confirmCommand",
        journalEntry: response.result.journalEntry,
        message: `${response.result.message} Updated ${formatApiTimestamp(response.result.updatedAt)}.`,
      });
      dispatch({ type: "advanceScenarioAfterCommand", command });
    } catch (error) {
      setConfirmError(error instanceof Error ? error.message : "Dispatch command API unavailable");
      dispatch({
        type: "commandPrepared",
        message: "Command remains prepared. Dispatch command API unavailable; no simulated commit was recorded.",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const cancelCommand = () => {
    if (isConfirming) return;

    dispatch({
      type: "cancelCommand",
      journalEntry: buildJournalEntry(
        command,
        "command_cancelled",
        `${command.label} cancelled`,
        `Prepared command was cancelled before commit. No live system was affected.`,
      ),
    });
  };

  return (
    <div className="workflowModalBackdrop" role="presentation" onMouseDown={cancelCommand}>
      <section
        className="workflowModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="workflow-command-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="workflowModalHeader">
          <span>Command confirmation</span>
          <h2 id="workflow-command-title">{command.label}</h2>
          <p>Frontend-only workflow. Confirmation posts to the simulated Dispatch API only.</p>
        </div>

        <dl className="workflowModalDetails">
          <div><dt>Equipment</dt><dd>{equipment?.displayName ?? command.equipmentId}</dd></div>
          <div><dt>Prepared value</dt><dd>{command.value}</dd></div>
          <div><dt>Risk</dt><dd>{riskLabels[command.risk]}</dd></div>
          <div><dt>Alarm</dt><dd>{alarm?.title ?? "No linked alarm"}</dd></div>
          <div><dt>Action</dt><dd>{action?.title ?? "Manual controls action"}</dd></div>
          <div><dt>Reason</dt><dd>{command.reason}</dd></div>
        </dl>

        <div className="workflowGuardrail">
          <strong>Guardrail</strong>
          <span>R005 never sends real commands. This records operator intent through the demo API boundary.</span>
        </div>
        {confirmError ? (
          <div className="workflowError" role="alert">
            <strong>API unavailable fallback</strong>
            <span>{confirmError}</span>
          </div>
        ) : null}

        <div className="workflowModalActions">
          <button type="button" onClick={cancelCommand} disabled={isConfirming}>Cancel</button>
          <button type="button" onClick={confirmCommand} disabled={isConfirming}>
            {isConfirming ? "Confirming..." : "Confirm via simulation"}
          </button>
        </div>
      </section>
      <style jsx global>{`
        .workflowModalBackdrop {
          position: fixed;
          inset: 0;
          z-index: 80;
          display: grid;
          place-items: center;
          background: rgba(15, 23, 42, 0.48);
          padding: 18px;
        }

        .workflowModal {
          width: min(620px, 94vw);
          display: grid;
          gap: 14px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 28px 80px rgba(15, 23, 42, 0.28);
          color: #111827;
          padding: 18px;
        }

        .workflowModalHeader span {
          display: block;
          color: #0f766e;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .workflowModalHeader h2 {
          margin: 4px 0;
          font-size: 22px;
        }

        .workflowModalHeader p {
          margin: 0;
          color: #4b5563;
          font-size: 13px;
        }

        .workflowModalDetails {
          display: grid;
          gap: 7px;
          margin: 0;
        }

        .workflowModalDetails div {
          display: grid;
          grid-template-columns: 130px minmax(0, 1fr);
          gap: 10px;
          border-bottom: 1px solid #e5e7eb;
          padding: 7px 0;
        }

        .workflowModalDetails dt {
          color: #6b7280;
          font-size: 12px;
          font-weight: 900;
        }

        .workflowModalDetails dd {
          margin: 0;
          color: #111827;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.35;
        }

        .workflowGuardrail {
          display: grid;
          gap: 4px;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          background: #fffbeb;
          color: #92400e;
          padding: 10px;
        }

        .workflowGuardrail strong,
        .workflowGuardrail span {
          display: block;
        }

        .workflowGuardrail span {
          font-size: 13px;
          line-height: 1.35;
        }

        .workflowError {
          display: grid;
          gap: 4px;
          border: 1px solid #ef4444;
          border-radius: 8px;
          background: #fef2f2;
          color: #991b1b;
          padding: 10px;
        }

        .workflowError strong,
        .workflowError span {
          display: block;
        }

        .workflowError span {
          font-size: 13px;
          line-height: 1.35;
        }

        .workflowModalActions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .workflowModalActions button {
          min-height: 38px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
          color: #111827;
          cursor: pointer;
          font-weight: 900;
          padding: 8px 12px;
        }

        .workflowModalActions button:last-child {
          border-color: #111827;
          background: #111827;
          color: #ffffff;
        }

        .workflowModalActions button:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }
      `}</style>
    </div>
  );
}

function PresentationModeOverlay({
  state,
  dispatch,
}: {
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
}) {
  if (!state.presentation.enabled) return null;

  const step = getDispatchPresentationStep(state.presentation.activeStepId);
  const stepIndex = getDispatchPresentationStepIndex(step.id);

  if (!state.presentation.scriptVisible) {
    return (
      <button
        className="presentationMiniToggle"
        type="button"
        onClick={() => dispatch({ type: "togglePresentationScript" })}
      >
        Show investor script
        <style jsx>{`
          .presentationMiniToggle {
            position: fixed;
            left: 18px;
            bottom: 136px;
            z-index: 70;
            min-height: 40px;
            border: 1px solid #0f766e;
            border-radius: 8px;
            background: #0f766e;
            color: #ffffff;
            cursor: pointer;
            font-size: 13px;
            font-weight: 900;
            padding: 9px 12px;
            box-shadow: 0 18px 44px rgba(15, 23, 42, 0.2);
          }
        `}</style>
      </button>
    );
  }

  return (
    <aside className="presentationOverlay" aria-label="Investor demo script overlay">
      <div className="presentationHeader">
        <span>Investor Demo Mode</span>
        <strong>{step.title}</strong>
        <small>
          Step {stepIndex + 1} of {dispatchPresentationSteps.length} · Simulated presentation · No real equipment
          control
        </small>
      </div>

      <p className="presentationScript">{step.script}</p>

      <ul className="presentationPoints">
        {step.talkingPoints.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>

      <div className="presentationNote">
        <strong>{step.eyebrow}</strong>
        <span>{step.presenterNote}</span>
      </div>

      <div className="presentationStepRail" aria-label="Presentation steps">
        {dispatchPresentationSteps.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === step.id}
            className={item.id === step.id ? "isActive" : undefined}
            onClick={() => dispatch({ type: "selectPresentationStep", stepId: item.id })}
          >
            {item.title}
          </button>
        ))}
      </div>

      <div className="presentationControls" aria-label="Presenter controls">
        <button type="button" onClick={() => dispatch({ type: "previousPresentationStep" })}>
          Previous step
        </button>
        {step.id === "opening" ? (
          <button type="button" onClick={() => dispatch({ type: "selectPresentationStep", stepId: "incident" })}>
            Start cooling incident
          </button>
        ) : (
          <button type="button" onClick={() => dispatch({ type: "nextPresentationStep" })}>
            Next step
          </button>
        )}
        <button type="button" onClick={() => dispatch({ type: "resetScenario" })}>
          Reset demo
        </button>
        <button type="button" onClick={() => dispatch({ type: "togglePresentationScript" })}>
          Hide script
        </button>
        <button type="button" onClick={() => dispatch({ type: "stopPresentationMode" })}>
          Exit presentation
        </button>
      </div>

      <style jsx>{`
        .presentationOverlay {
          position: fixed;
          left: 18px;
          bottom: 136px;
          z-index: 70;
          width: min(430px, calc(100vw - 24px));
          display: grid;
          gap: 10px;
          border: 1px solid #0f766e;
          border-radius: 8px;
          background: #ffffff;
          color: #111827;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28);
          padding: 14px;
        }

        .presentationHeader {
          display: grid;
          gap: 3px;
          border-bottom: 1px solid #d1fae5;
          padding-bottom: 9px;
        }

        .presentationHeader span,
        .presentationHeader strong,
        .presentationHeader small {
          display: block;
        }

        .presentationHeader span {
          color: #0f766e;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .presentationHeader strong {
          font-size: 18px;
          line-height: 1.15;
        }

        .presentationHeader small {
          color: #4b5563;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.35;
        }

        .presentationScript {
          margin: 0;
          color: #111827;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.4;
        }

        .presentationPoints {
          display: grid;
          gap: 5px;
          margin: 0;
          padding-left: 18px;
          color: #374151;
          font-size: 12px;
          line-height: 1.35;
        }

        .presentationNote {
          display: grid;
          gap: 4px;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          background: #fffbeb;
          color: #92400e;
          padding: 8px;
        }

        .presentationNote strong,
        .presentationNote span {
          display: block;
        }

        .presentationNote strong {
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .presentationNote span {
          font-size: 12px;
          line-height: 1.35;
        }

        .presentationStepRail {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px;
        }

        .presentationStepRail button,
        .presentationControls button {
          min-height: 34px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #f9fafb;
          color: #374151;
          cursor: pointer;
          font-size: 12px;
          font-weight: 900;
          padding: 7px 8px;
        }

        .presentationStepRail button.isActive,
        .presentationControls button:nth-child(2) {
          border-color: #0f766e;
          background: #0f766e;
          color: #ffffff;
        }

        .presentationControls {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px;
        }

        .presentationControls button:nth-child(5) {
          grid-column: 1 / -1;
          border-color: #111827;
          background: #111827;
          color: #ffffff;
        }

        @media (max-width: 820px) {
          .presentationOverlay {
            position: sticky;
            right: auto;
            bottom: auto;
            width: auto;
            margin-top: 8px;
          }
        }
      `}</style>
    </aside>
  );
}

function InspectorTitle({
  eyebrow,
  title,
  subtitle,
  status,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  status?: WorkspaceStatus;
}) {
  return (
    <div className="inspectorTitle">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{subtitle}</p>
      {status ? <b className={getStatusClass(status)}>{statusLabels[status]}</b> : null}
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: WorkspaceStatus }) {
  return (
    <div className={`metricTile ${tone ? getStatusClass(tone) : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InspectorStyles() {
  return (
    <style jsx global>{`
      .inspectorStack {
        display: grid;
        gap: 12px;
      }

      .inspectorTitle {
        position: relative;
        display: grid;
        gap: 4px;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 12px;
      }

      .inspectorTitle span {
        color: #6b7280;
        font-size: 11px;
        font-weight: 900;
        text-transform: uppercase;
      }

      .inspectorTitle h2 {
        margin: 0;
        color: #111827;
        font-size: 20px;
        line-height: 1.15;
      }

      .inspectorTitle p {
        margin: 0;
        color: #4b5563;
        font-size: 13px;
        line-height: 1.35;
      }

      .inspectorTitle b {
        width: fit-content;
        border-radius: 8px;
        font-size: 11px;
        padding: 5px 7px;
      }

      .summaryGrid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }

      .metricTile {
        min-height: 68px;
        display: grid;
        align-content: center;
        gap: 4px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        background: #f9fafb;
        padding: 10px;
      }

      .metricTile span {
        color: #6b7280;
        font-size: 11px;
        font-weight: 900;
        text-transform: uppercase;
      }

      .metricTile strong {
        color: #111827;
        font-size: 16px;
        line-height: 1.15;
      }

      .inspectorBlock {
        display: grid;
        gap: 9px;
        padding: 0;
      }

      .inspectorBlock h3 {
        margin: 0;
        color: #111827;
        font-size: 14px;
      }

      .inspectorBlock ul {
        margin: 0;
        padding-left: 18px;
        color: #374151;
        font-size: 13px;
        line-height: 1.45;
      }

      .compactList,
      .timelineList,
      .alarmList,
      .alarmTriageList,
      .recommendedActionList,
      .telemetryList,
      .paramGrid,
      .commandGrid,
      .controlFields,
      .detailList {
        display: grid;
        gap: 7px;
      }

      .compactList button {
        min-height: 38px;
        display: grid;
        grid-template-columns: 10px minmax(0, 1fr);
        align-items: center;
        gap: 8px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        background: #ffffff;
        color: #111827;
        cursor: pointer;
        font: inherit;
        font-size: 13px;
        font-weight: 800;
        padding: 8px;
        text-align: left;
      }

      .telemetryList div,
      .paramGrid div,
      .detailList div {
        display: grid;
        grid-template-columns: minmax(110px, 0.8fr) minmax(0, 1.2fr);
        gap: 8px;
        border-bottom: 1px solid #e5e7eb;
        padding: 7px 0;
      }

      .telemetryList span,
      .paramGrid span,
      .detailList dt {
        color: #6b7280;
        font-size: 12px;
        font-weight: 800;
      }

      .telemetryList strong,
      .paramGrid strong,
      .detailList dd {
        margin: 0;
        color: #111827;
        font-size: 13px;
        font-weight: 900;
        line-height: 1.3;
      }

      .timelineList article,
      .alarmList article,
      .alarmTriageList article,
      .recommendedActionList article {
        border: 1px solid #d1d5db;
        border-radius: 8px;
        background: #f9fafb;
        padding: 9px;
      }

      .alarmTriageList article.isSelected,
      .recommendedActionList article.isSelected {
        border-color: #111827;
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12);
      }

      .timelineList span,
      .alarmList span,
      .alarmTriageList span,
      .recommendedActionList span {
        display: block;
        color: #6b7280;
        font-size: 11px;
        font-weight: 900;
        text-transform: uppercase;
      }

      .timelineList strong,
      .timelineList small,
      .alarmList strong,
      .alarmList small,
      .alarmTriageList strong,
      .alarmTriageList small,
      .recommendedActionList strong,
      .recommendedActionList small {
        display: block;
      }

      .timelineList strong,
      .alarmList strong,
      .alarmTriageList strong,
      .recommendedActionList strong {
        margin-top: 4px;
        color: #111827;
        font-size: 13px;
      }

      .timelineList small,
      .alarmList small,
      .alarmTriageList small,
      .recommendedActionList small {
        margin-top: 4px;
        color: #4b5563;
        font-size: 12px;
        line-height: 1.35;
      }

      .triageHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .triageHeader b {
        border: 1px solid #d1d5db;
        border-radius: 8px;
        color: #374151;
        font-size: 11px;
        padding: 4px 7px;
      }

      .alarmTriageList ol {
        margin: 8px 0 0;
        padding-left: 18px;
        color: #374151;
        font-size: 12px;
        line-height: 1.4;
      }

      .recommendedActionList {
        display: grid;
        gap: 7px;
      }

      .recommendedActionList article {
        display: grid;
        gap: 7px;
      }

      .recommendedActionList button {
        min-height: 34px;
        width: fit-content;
        border: 1px solid #0f766e;
        border-radius: 8px;
        background: #ecfdf5;
        color: #064e3b;
        cursor: pointer;
        font-size: 12px;
        font-weight: 900;
        padding: 7px 10px;
      }

      .workflowInline {
        display: grid;
        gap: 8px;
      }

      .workflowInline h4 {
        margin: 0;
        color: #111827;
        font-size: 13px;
      }

      .guidedIncidentCard {
        display: grid;
        gap: 9px;
        border: 1px solid #0f766e;
        border-radius: 8px;
        background: #ecfdf5;
        color: #064e3b;
        padding: 10px;
      }

      .guidedIncidentHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .guidedIncidentHeader span,
      .guidedIncidentHeader strong {
        display: block;
        font-size: 11px;
        font-weight: 900;
        text-transform: uppercase;
      }

      .guidedIncidentCard h3 {
        margin: 0;
        color: #064e3b;
        font-size: 15px;
      }

      .guidedIncidentCard dl {
        display: grid;
        gap: 7px;
        margin: 0;
      }

      .guidedIncidentCard dl div {
        display: grid;
        gap: 3px;
        border-top: 1px solid #99f6e4;
        padding-top: 7px;
      }

      .guidedIncidentCard dt,
      .guidedIncidentCard dd {
        margin: 0;
      }

      .guidedIncidentCard dt {
        font-size: 11px;
        font-weight: 900;
        text-transform: uppercase;
      }

      .guidedIncidentCard dd,
      .guidedIncidentCard p {
        font-size: 12px;
        font-weight: 800;
        line-height: 1.35;
      }

      .guidedIncidentCard p {
        margin: 0;
      }

      .guidedIncidentActions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 7px;
      }

      .guidedIncidentActions button {
        min-height: 36px;
        border: 1px solid #0f766e;
        border-radius: 8px;
        background: #ffffff;
        color: #064e3b;
        cursor: pointer;
        font-size: 12px;
        font-weight: 900;
        padding: 7px 8px;
      }

      .guidedIncidentActions button:last-child {
        background: #0f766e;
        color: #ffffff;
      }

      .telemetryHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .telemetryHeader h3 {
        margin: 0;
      }

      .telemetryState {
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        background: #f8fafc;
        color: #475569;
        font-size: 11px;
        font-weight: 900;
        padding: 5px 7px;
        text-transform: uppercase;
      }

      .telemetryState.updating {
        border-color: #2563eb;
        background: #eff6ff;
        color: #1d4ed8;
      }

      .telemetryState.ready {
        border-color: #0f766e;
        background: #ecfdf5;
        color: #065f46;
      }

      .telemetryState.unavailable {
        border-color: #f59e0b;
        background: #fffbeb;
        color: #92400e;
      }

      .telemetryMeta,
      .apiFallback {
        display: grid;
        gap: 3px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        background: #f9fafb;
        padding: 8px;
      }

      .telemetryMeta span,
      .telemetryMeta strong,
      .apiFallback strong,
      .apiFallback span {
        display: block;
      }

      .telemetryMeta span {
        color: #6b7280;
        font-size: 11px;
        font-weight: 900;
        text-transform: uppercase;
      }

      .telemetryMeta strong {
        color: #111827;
        font-size: 13px;
      }

      .apiFallback {
        border-color: #f59e0b;
        background: #fffbeb;
        color: #92400e;
      }

      .apiFallback span {
        font-size: 12px;
        line-height: 1.35;
      }

      .controlFields label {
        display: grid;
        gap: 5px;
      }

      .controlFields span {
        color: #6b7280;
        font-size: 11px;
        font-weight: 900;
        text-transform: uppercase;
      }

      .controlFields input,
      .controlFields select {
        min-height: 38px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        background: #ffffff;
        color: #111827;
        font: inherit;
        padding: 8px 10px;
      }

      .commandGrid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .commandGrid button {
        min-height: 54px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        background: #ffffff;
        color: #111827;
        cursor: pointer;
        padding: 8px;
        text-align: left;
      }

      .commandGrid span,
      .commandGrid strong {
        display: block;
      }

      .commandGrid span {
        color: #6b7280;
        font-size: 11px;
        font-weight: 900;
        text-transform: uppercase;
      }

      .commandGrid strong {
        margin-top: 3px;
        font-size: 13px;
      }

      .capabilityBox,
      .commandNotice {
        border-radius: 8px;
        padding: 10px;
      }

      .capabilityBox {
        display: grid;
        gap: 4px;
        border: 1px solid #d1d5db;
        background: #f9fafb;
      }

      .capabilityBox strong,
      .capabilityBox span {
        display: block;
      }

      .capabilityBox span {
        color: #4b5563;
        font-size: 12px;
        line-height: 1.35;
      }

      .commandNotice {
        margin: 0;
        border: 1px solid #0f766e;
        background: #ecfdf5;
        color: #064e3b;
        font-size: 13px;
        font-weight: 800;
        line-height: 1.35;
      }

      .mutedText {
        margin: 0;
        color: #6b7280;
        font-size: 13px;
      }

      .emptyState {
        display: grid;
        gap: 5px;
        border: 1px dashed #cbd5e1;
        border-radius: 8px;
        background: #f8fafc;
        padding: 14px;
      }

      .emptyState strong {
        color: #111827;
        font-size: 14px;
      }

      .emptyState span {
        color: #4b5563;
        font-size: 13px;
        line-height: 1.4;
      }
    `}</style>
  );
}
