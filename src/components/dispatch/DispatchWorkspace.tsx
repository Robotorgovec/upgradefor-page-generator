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
  byId,
  getEquipmentAlarms,
  getFilteredEquipment,
  getObjectSummary,
  getRecommendedActions,
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
  EquipmentModel,
  EventModel,
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
const bottomTabs: BottomPanelTab[] = ["alarms", "events", "maintenance", "commands"];

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
};

const equipmentTypeLabels: Record<EquipmentModel["type"], string> = {
  chiller: "Chiller",
  fan_coil: "Fan coil",
  ahu: "AHU",
  pump: "Pump",
  sensor: "Sensor",
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
): EquipmentModel["telemetry"] {
  if (liveTelemetry?.equipmentId === equipment.id && liveTelemetry.telemetry) {
    return liveTelemetry.telemetry;
  }

  return equipment.telemetry;
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

  if (floor) nextState.selectedFloorId = floor.id;
  if (zone) {
    nextState.selectedZoneId = zone.id;
    nextState.selectedFloorId = zone.floorId;
  }
  if (system) nextState.selectedSystemId = system.id;
  if (isWorkspaceLayer(layer)) nextState.selectedLayer = layer;
  if (isStatusFilter(status)) nextState.statusFilter = status;
  if (query) nextState.searchQuery = query;

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
  const data = useMemo(() => getDispatchWorkspaceData(), []);
  const reducer = useMemo(() => createWorkspaceReducer(data), [data]);
  const [state, dispatch] = useReducer(reducer, data, createInitialWorkspaceState);
  const [isUrlHydrated, setIsUrlHydrated] = useState(false);
  const [selectedTelemetry, setSelectedTelemetry] = useState<SelectedTelemetryState>({ status: "idle" });

  useEffect(() => {
    document.body.classList.add("is-dispatch-workspace");
    document.body.classList.remove("menu-open");

    return () => {
      document.body.classList.remove("is-dispatch-workspace");
    };
  }, []);

  useEffect(() => {
    dispatch({ type: "hydrate", state: getHydratedStateFromUrl(data) });
    setIsUrlHydrated(true);
  }, [data]);

  useEffect(() => {
    if (!isUrlHydrated) return;
    syncStateToUrl(state);
  }, [isUrlHydrated, state]);

  const selectedFloor = byId(data.floors, state.selectedFloorId) ?? data.floors[0];
  const selectedZone = byId(data.zones, state.selectedZoneId);
  const selectedSystem = byId(data.systems, state.selectedSystemId);
  const selectedEquipment = byId(data.equipment, state.selectedEquipmentId);
  const filteredEquipment = getFilteredEquipment(data, state);
  const visibleEquipment = filteredEquipment.filter((equipment) => equipment.floorId === selectedFloor?.id);
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
    <section className="dispatchWorkspace" aria-label="Object Control Workspace">
      <WorkspaceHeader
        data={data}
        state={state}
        activeSystem={selectedSystem}
        selectedTelemetry={selectedTelemetry}
        onClear={() => dispatch({ type: "clearSelection" })}
      />

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
          selectedEquipmentVisible={selectedEquipmentVisible}
          visibleEquipment={visibleEquipment}
        />

        <InspectorPanel
          data={data}
          state={state}
          dispatch={dispatch}
          selectedEquipment={selectedEquipment}
          selectedZone={selectedZone}
          selectedSystem={selectedSystem}
          selectedTelemetry={selectedTelemetry}
        />
      </section>

      <BottomEventsPanel data={data} state={state} dispatch={dispatch} />
      <CommandConfirmationModal data={data} state={state} dispatch={dispatch} />

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
          grid-template-rows: auto minmax(0, 1fr) auto;
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

  return (
    <aside className="objectTree panelSurface" aria-label="Object navigation">
      <div className="panelTitle">
        <span>Object tree</span>
        <h2>{data.object.shortName}</h2>
      </div>

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
  selectedEquipmentVisible,
  visibleEquipment,
}: {
  data: WorkspaceMockData;
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
  selectedFloorId?: string;
  selectedEquipmentVisible: boolean;
  visibleEquipment: EquipmentModel[];
}) {
  const selectedFloor = byId(data.floors, selectedFloorId);
  const floorZones = data.zones.filter((zone) => zone.floorId === selectedFloorId);
  const sortedEquipment = [...visibleEquipment].sort((a, b) => statusRank(b.status) - statusRank(a.status));

  return (
    <section className="objectCanvas panelSurface" aria-label="Object plan canvas">
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

      <div className={`floorCanvas ${state.selectedLayer === "3d" ? "is3dLayer" : ""}`}>
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
          <div className="emptyCanvas">
            <strong>Нет оборудования в текущем фильтре</strong>
            <span>Смените этаж, систему, статус или поисковый запрос.</span>
          </div>
        ) : null}
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
        <strong>{visibleEquipment.length} visible assets</strong>
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
          background:
            linear-gradient(135deg, rgba(17, 24, 39, 0.1), rgba(15, 118, 110, 0.14)),
            #f3f4f6;
        }

        .floorCanvas.is3dLayer .zoneBlock {
          transform: skewY(-5deg);
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

        .emptyCanvas {
          position: absolute;
          inset: 0;
          display: grid;
          place-content: center;
          gap: 6px;
          color: #4b5563;
          text-align: center;
        }

        .canvasFooter {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .legend {
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

        .canvasFooter strong {
          color: #374151;
          font-size: 12px;
        }

        @media (max-width: 820px) {
          .canvasHeader,
          .canvasFooter {
            display: grid;
          }

          .layerSwitch {
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

function InspectorPanel({
  data,
  state,
  dispatch,
  selectedEquipment,
  selectedZone,
  selectedSystem,
  selectedTelemetry,
}: {
  data: WorkspaceMockData;
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
  selectedEquipment?: EquipmentModel;
  selectedZone?: ZoneModel;
  selectedSystem?: SystemModel;
  selectedTelemetry: SelectedTelemetryState;
}) {
  return (
    <aside className="inspectorPanel panelSurface" aria-label="Inspector panel">
      {selectedEquipment ? (
        <EquipmentInspector
          data={data}
          state={state}
          dispatch={dispatch}
          equipment={selectedEquipment}
          selectedTelemetry={selectedTelemetry}
        />
      ) : selectedZone ? (
        <ZoneInspector data={data} dispatch={dispatch} zone={selectedZone} />
      ) : selectedSystem ? (
        <SystemInspector data={data} dispatch={dispatch} system={selectedSystem} />
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
  dispatch,
  zone,
}: {
  data: WorkspaceMockData;
  dispatch: Dispatch<WorkspaceAction>;
  zone: ZoneModel;
}) {
  const equipment = getZoneEquipment(data, zone.id);
  const activeEvents = data.events.filter((event) => event.zoneId === zone.id);

  return (
    <div className="inspectorStack">
      <InspectorTitle eyebrow="Selected zone" title={zone.name} subtitle={statusLabels[zone.status]} status={zone.status} />
      <div className="summaryGrid">
        <Metric label="Temperature" value={zone.temperature} />
        <Metric label="Humidity" value={zone.humidity} />
        <Metric label="CO2" value={zone.co2} />
        <Metric label="Assets" value={String(equipment.length)} />
      </div>
      <section className="inspectorBlock">
        <h3>Equipment in zone</h3>
        <div className="compactList">
          {equipment.map((item) => (
            <button key={item.id} type="button" onClick={() => dispatch({ type: "selectEquipment", equipmentId: item.id })}>
              <i className={getStatusClass(item.status)} />
              <span>{item.displayName}</span>
            </button>
          ))}
        </div>
      </section>
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
        <TelemetryTab equipment={equipment} selectedTelemetry={selectedTelemetry} />
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
  const telemetry = getEffectiveTelemetry(equipment, selectedTelemetry);
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

function TelemetryTab({
  equipment,
  selectedTelemetry,
}: {
  equipment: EquipmentModel;
  selectedTelemetry: SelectedTelemetryState;
}) {
  const telemetry = getEffectiveTelemetry(equipment, selectedTelemetry);
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
}: {
  data: WorkspaceMockData;
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
}) {
  const activeAlarms = data.alarms.filter((alarm) => alarm.status === "active");
  const events = data.events.filter((event) => event.type === "event");
  const maintenance = data.events.filter((event) => event.type === "maintenance");
  const commands = data.events.filter((event) => event.type === "command");
  const commandJournal = state.journal.filter((entry) =>
    ["command_prepared", "command_confirmed", "command_cancelled"].includes(entry.type),
  );

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
        ) : null}

        {state.bottomTab === "events" ? (
          events.map((event) => <BottomEventButton key={event.id} event={event} dispatch={dispatch} />)
        ) : null}

        {state.bottomTab === "maintenance" ? (
          maintenance.map((event) => <BottomEventButton key={event.id} event={event} dispatch={dispatch} />)
        ) : null}

        {state.bottomTab === "commands" ? (
          <>
            {commandJournal.map((entry) => (
              <BottomJournalButton key={entry.id} entry={entry} dispatch={dispatch} />
            ))}
            {commands.map((event) => <BottomEventButton key={event.id} event={event} dispatch={dispatch} />)}
          </>
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
