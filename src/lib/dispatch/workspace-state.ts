import type {
  BottomPanelTab,
  InspectorTab,
  PreparedCommandModel,
  StatusFilter,
  WorkspaceLayer,
  WorkspaceMockData,
  WorkspaceState,
  WorkflowJournalEntry,
} from "./types";
import { byId } from "./selectors";

type WorkspaceAction =
  | { type: "selectFloor"; floorId: string }
  | { type: "selectZone"; zoneId: string }
  | { type: "selectSystem"; systemId?: string }
  | { type: "selectEquipment"; equipmentId: string; inspectorTab?: InspectorTab }
  | { type: "selectAlarm"; alarmId: string }
  | { type: "setLayer"; layer: WorkspaceLayer }
  | { type: "setStatusFilter"; statusFilter: StatusFilter }
  | { type: "setSearchQuery"; searchQuery: string }
  | { type: "setInspectorTab"; inspectorTab: InspectorTab }
  | { type: "setBottomTab"; bottomTab: BottomPanelTab }
  | { type: "clearSelection" }
  | { type: "commandPrepared"; message: string }
  | { type: "prepareCommand"; command: PreparedCommandModel }
  | { type: "confirmCommand"; journalEntry: WorkflowJournalEntry; message?: string }
  | { type: "cancelCommand"; journalEntry?: WorkflowJournalEntry }
  | { type: "selectRecommendedAction"; actionId: string }
  | { type: "hydrate"; state: Partial<WorkspaceState> };

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
  };
}

export function createWorkspaceReducer(data: WorkspaceMockData) {
  return function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
    if (action.type === "selectFloor") {
      return {
        ...state,
        selectedFloorId: action.floorId,
        selectedZoneId: undefined,
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
        inspectorTab: action.inspectorTab ?? "overview",
        selectedAlarmId: undefined,
        selectedWorkflowActionId: undefined,
        commandNotice: undefined,
      };
    }

    if (action.type === "selectAlarm") {
      const alarm = byId(data.alarms, action.alarmId);
      if (!alarm) return state;
      const equipment = byId(data.equipment, alarm.equipmentId);
      if (!equipment) return state;

      return {
        ...state,
        selectedFloorId: equipment.floorId,
        selectedZoneId: equipment.zoneId,
        selectedSystemId: equipment.systemId,
        selectedEquipmentId: equipment.id,
        inspectorTab: "alarms",
        bottomTab: "alarms",
        selectedAlarmId: alarm.id,
        selectedWorkflowActionId: undefined,
        commandNotice: undefined,
      };
    }

    if (action.type === "setLayer") {
      return { ...state, selectedLayer: action.layer };
    }

    if (action.type === "setStatusFilter") {
      return { ...state, statusFilter: action.statusFilter };
    }

    if (action.type === "setSearchQuery") {
      return { ...state, searchQuery: action.searchQuery };
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
      return {
        ...state,
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

    if (action.type === "hydrate") {
      return { ...state, ...action.state, journal: action.state.journal ?? state.journal };
    }

    return state;
  };
}

export type { WorkspaceAction };
