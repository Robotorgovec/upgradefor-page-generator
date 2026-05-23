export type WorkspaceStatus = "normal" | "warning" | "critical" | "offline";

export type WorkspaceMode = "auto" | "manual" | "service";

export type WorkspaceLayer = "plan" | "hvac" | "cooling" | "ventilation" | "3d";

export type StatusFilter = "all" | WorkspaceStatus;

export type InspectorTab =
  | "overview"
  | "telemetry"
  | "controls"
  | "3d"
  | "alarms"
  | "history"
  | "passport";

export type BottomPanelTab = "alarms" | "events" | "maintenance" | "commands" | "scenario";

export type EquipmentType = "chiller" | "fan_coil" | "ahu" | "pump" | "sensor";

export type ObjectModel = {
  id: string;
  name: string;
  shortName: string;
  address: string;
  kind: string;
  status: WorkspaceStatus;
  mode: WorkspaceMode;
  updatedAt: string;
};

export type FloorModel = {
  id: string;
  objectId: string;
  name: string;
  level: string;
  summary: string;
};

export type ZoneModel = {
  id: string;
  floorId: string;
  name: string;
  kind: "retail" | "plant" | "cinema" | "service" | "office";
  status: WorkspaceStatus;
  temperature: string;
  humidity: string;
  co2: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type SystemModel = {
  id: string;
  name: string;
  shortName: string;
  layer: Exclude<WorkspaceLayer, "plan" | "3d">;
  status: WorkspaceStatus;
  description: string;
};

export type EquipmentModel = {
  id: string;
  name: string;
  displayName: string;
  sourceAlias: string;
  type: EquipmentType;
  systemId: string;
  floorId: string;
  zoneId: string;
  status: WorkspaceStatus;
  mode: WorkspaceMode | "off";
  updatedAt: string;
  position: {
    x: number;
    y: number;
    z?: number;
  };
  model3d?: {
    kind: "chiller" | "fan_coil" | "ahu";
    twinId: "chiller" | "fancoil-fc92" | "ahu-pv1";
  };
  telemetry: Record<string, number | string | boolean>;
  capabilities: {
    canRead: boolean;
    canWrite: boolean;
    hasAlarms: boolean;
    hasTrends: boolean;
    supportsAck: boolean;
    supportsSchedule: boolean;
  };
  passport: Record<string, string | number>;
  recommendations: string[];
};

export type AlarmModel = {
  id: string;
  equipmentId: string;
  severity: Exclude<WorkspaceStatus, "normal">;
  status: "active" | "resolved";
  timestamp: string;
  title: string;
  message: string;
};

export type EventModel = {
  id: string;
  equipmentId?: string;
  zoneId?: string;
  type: "event" | "maintenance" | "command";
  timestamp: string;
  title: string;
  description: string;
};

export type CommandModel = {
  id: string;
  equipmentType: EquipmentType | "all";
  label: string;
  value: string;
  requiresConfirmation: boolean;
};

export type RecommendedActionModel = {
  id: string;
  equipmentId: string;
  alarmId?: string;
  title: string;
  description: string;
  commandId: string;
  commandLabel: string;
  risk: "low" | "medium" | "high";
  expectedOutcome: string;
};

export type PreparedCommandModel = {
  id: string;
  equipmentId: string;
  actionId?: string;
  alarmId?: string;
  label: string;
  value: string;
  reason: string;
  risk: RecommendedActionModel["risk"];
};

export type WorkflowJournalEntry = {
  id: string;
  timestamp: string;
  equipmentId: string;
  alarmId?: string;
  actionId?: string;
  type: "triage" | "command_prepared" | "command_confirmed" | "command_cancelled";
  title: string;
  description: string;
};

export type DispatchScenarioStatus =
  | "idle"
  | "running"
  | "incident_active"
  | "action_required"
  | "command_confirmed"
  | "mitigated"
  | "reset";

export type DispatchScenarioId =
  | "normal-operations"
  | "cooling-loop-pressure-drop"
  | "fan-coil-comfort-drift"
  | "sensor-offline";

export type DispatchScenarioStep = {
  id: string;
  title: string;
  description: string;
  status: "pending" | "active" | "completed";
  timestamp?: string;
  relatedEquipmentId?: string;
  relatedAlarmId?: string;
};

export type DispatchScenarioKpi = {
  id: string;
  label: string;
  value: string;
  helperText: string;
  trend?: "up" | "down" | "neutral";
};

export type DispatchScenarioState = {
  id: DispatchScenarioId;
  title: string;
  status: DispatchScenarioStatus;
  startedAt?: string;
  updatedAt?: string;
  activeStepId?: string;
  steps: DispatchScenarioStep[];
  kpis: DispatchScenarioKpi[];
};

export type DispatchPresentationStepId =
  | "opening"
  | "incident"
  | "diagnosis"
  | "action"
  | "impact"
  | "audit";

export type DispatchPresentationStep = {
  id: DispatchPresentationStepId;
  eyebrow: string;
  title: string;
  script: string;
  talkingPoints: string[];
  presenterNote: string;
  focus: "workspace" | "alarm" | "inspector" | "command" | "impact" | "journal";
};

export type DispatchExecutiveValueCard = {
  id: string;
  label: string;
  value: string;
  helperText: string;
  tone?: "neutral" | "success" | "warning";
};

export type DispatchPresentationModeState = {
  enabled: boolean;
  activeStepId: DispatchPresentationStepId;
  scriptVisible: boolean;
  launchedFromUrl?: boolean;
};

export type WorkspaceMockData = {
  object: ObjectModel;
  floors: FloorModel[];
  zones: ZoneModel[];
  systems: SystemModel[];
  equipment: EquipmentModel[];
  alarms: AlarmModel[];
  events: EventModel[];
  commands: CommandModel[];
  recommendedActions: RecommendedActionModel[];
};

export type WorkspaceState = {
  selectedObjectId: string;
  selectedFloorId?: string;
  selectedZoneId?: string;
  selectedSystemId?: string;
  selectedEquipmentId?: string;
  selectedLayer: WorkspaceLayer;
  statusFilter: StatusFilter;
  searchQuery: string;
  inspectorTab: InspectorTab;
  bottomTab: BottomPanelTab;
  selectedAlarmId?: string;
  selectedWorkflowActionId?: string;
  pendingCommand?: PreparedCommandModel;
  journal: WorkflowJournalEntry[];
  scenario: DispatchScenarioState;
  presentation: DispatchPresentationModeState;
  commandNotice?: string;
};
