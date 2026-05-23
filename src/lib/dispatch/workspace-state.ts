import type {
  BottomPanelTab,
  DispatchPresentationStepId,
  DispatchScenarioId,
  InspectorTab,
  PreparedCommandModel,
  StatusFilter,
  WorkspaceLayer,
  WorkspaceMockData,
  WorkspaceState,
  WorkflowJournalEntry,
} from "./types";
import { byId, matchesStatus, matchesWorkspaceLayer } from "./selectors";
import {
  advanceScenarioAfterCommand,
  createInitialScenarioState,
  getDispatchScenarioTarget,
  resetDispatchScenario,
  selectDispatchScenarioStep,
  startDispatchScenario,
} from "./dispatch-scenario-service";
import {
  createInitialPresentationState,
  getNextPresentationStepId,
  getPreviousPresentationStepId,
  investorDemoScenarioId,
  selectDispatchPresentationStep,
  startDispatchPresentationMode,
  stopDispatchPresentationMode,
  toggleDispatchPresentationScript,
} from "./dispatch-presentation-service";

type WorkspaceAction =
  | { type: "selectFloor"; floorId: string }
  | { type: "selectZone"; zoneId: string }
  | { type: "selectSystem"; systemId?: string }
  | { type: "selectEquipment"; equipmentId: string; inspectorTab?: InspectorTab }
  | { type: "selectAlarm"; alarmId: string }
  | { type: "setLayer"; layer: WorkspaceLayer }
  | { type: "setStatusFilter"; statusFilter: StatusFilter }
  | { type: "setSearchQuery"; searchQuery: string }
  | { type: "clearFilters" }
  | { type: "setInspectorTab"; inspectorTab: InspectorTab }
  | { type: "setBottomTab"; bottomTab: BottomPanelTab }
  | { type: "clearSelection" }
  | { type: "commandPrepared"; message: string }
  | { type: "prepareCommand"; command: PreparedCommandModel }
  | { type: "confirmCommand"; journalEntry: WorkflowJournalEntry; message?: string }
  | { type: "cancelCommand"; journalEntry?: WorkflowJournalEntry }
  | { type: "selectRecommendedAction"; actionId: string }
  | { type: "startScenario"; scenarioId: DispatchScenarioId }
  | { type: "resetScenario" }
  | { type: "advanceScenarioAfterCommand"; command: PreparedCommandModel }
  | { type: "selectScenarioStep"; stepId: string }
  | { type: "startPresentationMode"; launchedFromUrl?: boolean }
  | { type: "stopPresentationMode" }
  | { type: "nextPresentationStep" }
  | { type: "previousPresentationStep" }
  | { type: "selectPresentationStep"; stepId: DispatchPresentationStepId }
  | { type: "togglePresentationScript" }
  | { type: "hydrate"; state: Partial<WorkspaceState> };

function isSystemCompatibleWithLayer(
  data: WorkspaceMockData,
  systemId: string | undefined,
  layer: WorkspaceLayer,
) {
  if (!systemId || layer === "plan" || layer === "hvac" || layer === "3d") return true;
  const system = byId(data.systems, systemId);
  return system?.layer === layer;
}

function getEquipmentLayerForNavigation(
  data: WorkspaceMockData,
  equipmentId: string | undefined,
  currentLayer: WorkspaceLayer,
) {
  const equipment = byId(data.equipment, equipmentId);
  if (!equipment || matchesWorkspaceLayer(data, equipment, currentLayer)) return currentLayer;
  return byId(data.systems, equipment.systemId)?.layer ?? currentLayer;
}

function equipmentMatchesWorkspaceContext(
  data: WorkspaceMockData,
  state: WorkspaceState,
  equipmentId: string | undefined,
) {
  const equipment = byId(data.equipment, equipmentId);
  if (!equipment) return false;
  if (state.selectedFloorId && equipment.floorId !== state.selectedFloorId) return false;
  if (state.selectedZoneId && equipment.zoneId !== state.selectedZoneId) return false;
  if (state.selectedSystemId && equipment.systemId !== state.selectedSystemId) return false;
  if (!matchesWorkspaceLayer(data, equipment, state.selectedLayer)) return false;
  if (!matchesStatus(equipment.status, state.statusFilter)) return false;

  const query = state.searchQuery.trim().toLowerCase();
  if (!query) return true;

  return [
    equipment.name,
    equipment.displayName,
    equipment.sourceAlias,
    equipment.id,
    equipment.type,
    byId(data.zones, equipment.zoneId)?.name,
    byId(data.systems, equipment.systemId)?.name,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(query));
}

function normalizeWorkspaceContext(data: WorkspaceMockData, state: WorkspaceState): WorkspaceState {
  let nextState = state;

  if (!isSystemCompatibleWithLayer(data, nextState.selectedSystemId, nextState.selectedLayer)) {
    nextState = {
      ...nextState,
      selectedSystemId: undefined,
    };
  }

  if (
    nextState.selectedEquipmentId &&
    !equipmentMatchesWorkspaceContext(data, nextState, nextState.selectedEquipmentId)
  ) {
    nextState = {
      ...nextState,
      selectedEquipmentId: undefined,
      selectedAlarmId: undefined,
      selectedWorkflowActionId: undefined,
      inspectorTab: "overview",
      pendingCommand: undefined,
    };
  }

  return nextState;
}

export function createInitialWorkspaceState(data: WorkspaceMockData): WorkspaceState {
  return {
    selectedObjectId: data.object.id,
    selectedFloorId: data.floors[0]?.id,
    selectedLayer: "plan",
    statusFilter: "all",
    searchQuery: "",
    inspectorTab: "overview",
    bottomTab: "alarms",
    journal: [],
    scenario: createInitialScenarioState(),
    presentation: createInitialPresentationState(),
  };
}

function applyPresentationNavigation(
  state: WorkspaceState,
  data: WorkspaceMockData,
  stepId: DispatchPresentationStepId,
): WorkspaceState {
  const shouldStartIncident = stepId !== "opening";
  const scenario =
    shouldStartIncident && (state.scenario.id !== investorDemoScenarioId || state.scenario.status === "idle")
      ? startDispatchScenario(investorDemoScenarioId)
      : state.scenario;
  const target = getDispatchScenarioTarget(scenario);
  const equipment = byId(data.equipment, target.equipmentId);
  const inspectorTab: InspectorTab = stepId === "audit" ? "history" : target.equipmentId ? "alarms" : state.inspectorTab;
  const bottomTab: BottomPanelTab = stepId === "audit" ? "commands" : stepId === "opening" ? state.bottomTab : "scenario";

  return {
    ...state,
    scenario,
    presentation: selectDispatchPresentationStep(state.presentation, stepId),
    selectedFloorId: equipment?.floorId ?? state.selectedFloorId,
    selectedZoneId: equipment?.zoneId ?? state.selectedZoneId,
    selectedSystemId: equipment?.systemId ?? state.selectedSystemId,
    selectedEquipmentId: equipment?.id ?? state.selectedEquipmentId,
    selectedLayer: getEquipmentLayerForNavigation(data, equipment?.id, state.selectedLayer),
    selectedAlarmId: shouldStartIncident ? target.alarmId : state.selectedAlarmId,
    selectedWorkflowActionId: undefined,
    inspectorTab,
    bottomTab,
    commandNotice:
      shouldStartIncident && state.commandNotice === undefined
        ? "Investor demo step selected. Scenario is simulated; no real equipment was controlled."
        : state.commandNotice,
  };
}

export function createWorkspaceReducer(data: WorkspaceMockData) {
  return function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
    if (action.type === "selectFloor") {
      return {
        ...state,
        selectedFloorId: action.floorId,
        selectedZoneId: undefined,
        selectedSystemId: undefined,
        selectedEquipmentId: undefined,
        selectedAlarmId: undefined,
        selectedWorkflowActionId: undefined,
        inspectorTab: "overview",
        commandNotice: undefined,
      };
    }

    if (action.type === "selectZone") {
      const zone = byId(data.zones, action.zoneId);
      return {
        ...state,
        selectedFloorId: zone?.floorId ?? state.selectedFloorId,
        selectedZoneId: action.zoneId,
        selectedSystemId: undefined,
        selectedEquipmentId: undefined,
        selectedAlarmId: undefined,
        selectedWorkflowActionId: undefined,
        inspectorTab: "overview",
        commandNotice: undefined,
      };
    }

    if (action.type === "selectSystem") {
      const system = byId(data.systems, action.systemId);
      return {
        ...state,
        selectedSystemId: action.systemId,
        selectedLayer: system?.layer ?? state.selectedLayer,
        selectedEquipmentId: undefined,
        selectedZoneId: undefined,
        selectedAlarmId: undefined,
        selectedWorkflowActionId: undefined,
        inspectorTab: "overview",
        commandNotice: undefined,
      };
    }

    if (action.type === "selectEquipment") {
      const equipment = byId(data.equipment, action.equipmentId);
      if (!equipment) return state;

      return {
        ...state,
        selectedFloorId: equipment.floorId,
        selectedZoneId: equipment.zoneId,
        selectedSystemId: equipment.systemId,
        selectedEquipmentId: equipment.id,
        selectedLayer: getEquipmentLayerForNavigation(data, equipment.id, state.selectedLayer),
        inspectorTab: action.inspectorTab ?? "overview",
        selectedAlarmId: undefined,
        selectedWorkflowActionId: undefined,
        commandNotice: undefined,
      };
    }

    if (action.type === "selectAlarm") {
      const alarm = byId(data.alarms, action.alarmId);
      const scenarioStep = state.scenario.steps.find((step) => step.relatedAlarmId === action.alarmId);
      if (!alarm && !scenarioStep?.relatedEquipmentId) return state;
      const equipment = byId(data.equipment, alarm?.equipmentId ?? scenarioStep?.relatedEquipmentId);
      if (!equipment) return state;

      return {
        ...state,
        selectedFloorId: equipment.floorId,
        selectedZoneId: equipment.zoneId,
        selectedSystemId: equipment.systemId,
        selectedEquipmentId: equipment.id,
        selectedLayer: getEquipmentLayerForNavigation(data, equipment.id, state.selectedLayer),
        inspectorTab: "alarms",
        bottomTab: "alarms",
        selectedAlarmId: alarm?.id ?? action.alarmId,
        selectedWorkflowActionId: undefined,
        commandNotice: undefined,
      };
    }

    if (action.type === "setLayer") {
      return normalizeWorkspaceContext(data, { ...state, selectedLayer: action.layer });
    }

    if (action.type === "setStatusFilter") {
      return normalizeWorkspaceContext(data, { ...state, statusFilter: action.statusFilter });
    }

    if (action.type === "setSearchQuery") {
      return { ...state, searchQuery: action.searchQuery };
    }

    if (action.type === "clearFilters") {
      return {
        ...state,
        selectedSystemId: undefined,
        selectedLayer: "hvac",
        statusFilter: "all",
        searchQuery: "",
        commandNotice: undefined,
      };
    }

    if (action.type === "setInspectorTab") {
      return { ...state, inspectorTab: action.inspectorTab, commandNotice: undefined };
    }

    if (action.type === "setBottomTab") {
      return { ...state, bottomTab: action.bottomTab };
    }

    if (action.type === "clearSelection") {
      return {
        ...state,
        selectedFloorId: data.floors[0]?.id,
        selectedZoneId: undefined,
        selectedSystemId: undefined,
        selectedEquipmentId: undefined,
        selectedLayer: "plan",
        statusFilter: "all",
        searchQuery: "",
        inspectorTab: "overview",
        bottomTab: "alarms",
        selectedAlarmId: undefined,
        selectedWorkflowActionId: undefined,
        pendingCommand: undefined,
        commandNotice: undefined,
      };
    }

    if (action.type === "commandPrepared") {
      return { ...state, commandNotice: action.message };
    }

    if (action.type === "prepareCommand") {
      const reviewStep = state.scenario.steps.find((step) =>
        step.title.toLowerCase().includes("operator"),
      );
      const scenario =
        state.scenario.status === "incident_active" && reviewStep
          ? {
              ...state.scenario,
              status: "action_required" as const,
              activeStepId: reviewStep.id,
              steps: state.scenario.steps.map((step) => ({
                ...step,
                status:
                  step.id === reviewStep.id
                    ? "active" as const
                    : step.status === "active"
                      ? "completed" as const
                      : step.status,
              })),
            }
          : state.scenario;

      return {
        ...state,
        scenario,
        presentation: state.presentation.enabled
          ? selectDispatchPresentationStep(state.presentation, "action")
          : state.presentation,
        pendingCommand: action.command,
        selectedWorkflowActionId: action.command.actionId,
        selectedAlarmId: action.command.alarmId ?? state.selectedAlarmId,
        bottomTab: "commands",
        commandNotice: `${action.command.label}: command prepared locally. Confirmation required.`,
        journal: [
          {
            id: `journal-prepared-${action.command.id}-${state.journal.length}`,
            timestamp: "now",
            equipmentId: action.command.equipmentId,
            alarmId: action.command.alarmId,
            actionId: action.command.actionId,
            type: "command_prepared",
            title: `${action.command.label} prepared`,
            description: action.command.reason,
          },
          ...state.journal,
        ],
      };
    }

    if (action.type === "confirmCommand") {
      return {
        ...state,
        pendingCommand: undefined,
        bottomTab: "commands",
        commandNotice: action.message ?? "Command confirmed by dispatch simulation. No real equipment control was sent.",
        journal: [action.journalEntry, ...state.journal],
      };
    }

    if (action.type === "cancelCommand") {
      return {
        ...state,
        pendingCommand: undefined,
        bottomTab: action.journalEntry ? "commands" : state.bottomTab,
        commandNotice: action.journalEntry ? "Prepared command cancelled locally." : undefined,
        journal: action.journalEntry ? [action.journalEntry, ...state.journal] : state.journal,
      };
    }

    if (action.type === "selectRecommendedAction") {
      return { ...state, selectedWorkflowActionId: action.actionId };
    }

    if (action.type === "startScenario") {
      const scenario = startDispatchScenario(action.scenarioId);
      const target = getDispatchScenarioTarget(scenario);
      const equipment = byId(data.equipment, target.equipmentId);

      return {
        ...state,
        scenario,
        presentation: state.presentation.enabled
          ? selectDispatchPresentationStep(state.presentation, "incident")
          : state.presentation,
        selectedFloorId: equipment?.floorId ?? state.selectedFloorId,
        selectedZoneId: equipment?.zoneId,
        selectedSystemId: equipment?.systemId,
        selectedEquipmentId: equipment?.id,
        selectedLayer: getEquipmentLayerForNavigation(data, equipment?.id, state.selectedLayer),
        selectedAlarmId: target.alarmId,
        inspectorTab: target.equipmentId ? "alarms" : "overview",
        bottomTab: "scenario",
        selectedWorkflowActionId: undefined,
        pendingCommand: undefined,
        commandNotice: "Demo scenario started. No real equipment was controlled.",
      };
    }

    if (action.type === "resetScenario") {
      return {
        ...state,
        scenario: resetDispatchScenario(),
        presentation: state.presentation.enabled
          ? selectDispatchPresentationStep(state.presentation, "opening")
          : state.presentation,
        selectedFloorId: data.floors[0]?.id,
        selectedZoneId: undefined,
        selectedSystemId: undefined,
        selectedEquipmentId: undefined,
        selectedAlarmId: undefined,
        selectedWorkflowActionId: undefined,
        pendingCommand: undefined,
        inspectorTab: "overview",
        bottomTab: "scenario",
        commandNotice: "Demo state reset. No real equipment was controlled.",
      };
    }

    if (action.type === "advanceScenarioAfterCommand") {
      if (state.scenario.id === "normal-operations" || state.scenario.status === "idle") {
        return state;
      }

      return {
        ...state,
        scenario: advanceScenarioAfterCommand(state.scenario, action.command.label),
        presentation: state.presentation.enabled
          ? selectDispatchPresentationStep(state.presentation, "impact")
          : state.presentation,
        bottomTab: "scenario",
        commandNotice: "Scenario advanced locally. No real equipment was controlled.",
      };
    }

    if (action.type === "selectScenarioStep") {
      const step = state.scenario.steps.find((item) => item.id === action.stepId);
      const equipment = byId(data.equipment, step?.relatedEquipmentId);

      return {
        ...state,
        scenario: selectDispatchScenarioStep(state.scenario, action.stepId),
        selectedFloorId: equipment?.floorId ?? state.selectedFloorId,
        selectedZoneId: equipment?.zoneId ?? state.selectedZoneId,
        selectedSystemId: equipment?.systemId ?? state.selectedSystemId,
        selectedEquipmentId: equipment?.id ?? state.selectedEquipmentId,
        selectedLayer: getEquipmentLayerForNavigation(data, equipment?.id, state.selectedLayer),
        selectedAlarmId: step?.relatedAlarmId ?? state.selectedAlarmId,
        inspectorTab: step?.relatedAlarmId ? "alarms" : state.inspectorTab,
        bottomTab: "scenario",
      };
    }

    if (action.type === "startPresentationMode") {
      return {
        ...state,
        presentation: startDispatchPresentationMode(Boolean(action.launchedFromUrl)),
        commandNotice: "Investor demo mode ready. Simulated scenario only; no real equipment control.",
      };
    }

    if (action.type === "stopPresentationMode") {
      return {
        ...state,
        presentation: stopDispatchPresentationMode(),
        commandNotice: "Investor demo mode closed. Workspace remains in demo simulation.",
      };
    }

    if (action.type === "nextPresentationStep") {
      return applyPresentationNavigation(
        state,
        data,
        getNextPresentationStepId(state.presentation.activeStepId),
      );
    }

    if (action.type === "previousPresentationStep") {
      return applyPresentationNavigation(
        state,
        data,
        getPreviousPresentationStepId(state.presentation.activeStepId),
      );
    }

    if (action.type === "selectPresentationStep") {
      return applyPresentationNavigation(state, data, action.stepId);
    }

    if (action.type === "togglePresentationScript") {
      return {
        ...state,
        presentation: toggleDispatchPresentationScript(state.presentation),
      };
    }

    if (action.type === "hydrate") {
      return normalizeWorkspaceContext(data, {
        ...state,
        ...action.state,
        journal: action.state.journal ?? state.journal,
        scenario: action.state.scenario ?? state.scenario,
        presentation: action.state.presentation ?? state.presentation,
      });
    }

    return state;
  };
}

export type { WorkspaceAction };
