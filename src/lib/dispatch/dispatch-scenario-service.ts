import type {
  AlarmModel,
  DispatchScenarioId,
  DispatchScenarioKpi,
  DispatchScenarioState,
  DispatchScenarioStep,
  EquipmentModel,
  RecommendedActionModel,
  WorkspaceMockData,
  WorkspaceStatus,
} from "./types";

type ScenarioDefinition = {
  id: DispatchScenarioId;
  title: string;
  affectedEquipmentId?: string;
  alarmId?: string;
  alarm?: AlarmModel;
  severity?: Exclude<WorkspaceStatus, "normal">;
  equipmentStatus?: WorkspaceStatus;
  probableCause: string;
  recommendedAction: string;
  story: string;
  commandId?: string;
  commandLabel?: string;
  telemetryPatch?: EquipmentModel["telemetry"];
  steps: Omit<DispatchScenarioStep, "status">[];
  kpis: DispatchScenarioKpi[];
  mitigatedKpis?: DispatchScenarioKpi[];
};

const fixedTime = "T+00:00";

const baselineKpis: DispatchScenarioKpi[] = [
  {
    id: "response",
    label: "Response time",
    value: "Ready",
    helperText: "Demo baseline waits for an incident.",
    trend: "neutral",
  },
  {
    id: "risk",
    label: "Comfort risk",
    value: "Normal",
    helperText: "No demo incident is active.",
    trend: "neutral",
  },
  {
    id: "audit",
    label: "Audit trail",
    value: "Armed",
    helperText: "Workflow journal is ready for operator intent.",
    trend: "neutral",
  },
];

const scenarioDefinitions: Record<DispatchScenarioId, ScenarioDefinition> = {
  "normal-operations": {
    id: "normal-operations",
    title: "Normal operations",
    probableCause: "No simulated incident is active.",
    recommendedAction: "Start an investor demo scenario to show guided triage.",
    story: "Object is in baseline demo mode. No real equipment control is available.",
    steps: [
      {
        id: "normal-baseline",
        title: "Normal operation baseline",
        description: "Demo workspace is ready. Simulated telemetry and command guardrails are visible.",
        timestamp: fixedTime,
      },
    ],
    kpis: baselineKpis,
  },
  "cooling-loop-pressure-drop": {
    id: "cooling-loop-pressure-drop",
    title: "Cooling loop pressure drop",
    affectedEquipmentId: "pump-shu2",
    alarmId: "scenario-cooling-pressure-drop",
    severity: "critical",
    equipmentStatus: "critical",
    probableCause: "Pump pressure instability or reduced chilled water flow.",
    recommendedAction: "Inspect pump status and prepare a simulated diagnostic command.",
    story: "Cooling loop pressure drop detected. The workspace links alarm, equipment, telemetry and recommended action in one flow.",
    commandId: "mode-service",
    commandLabel: "Prepare demo diagnostic command",
    telemetryPatch: {
      Pressure: "0.8 bar",
      Flow: "22.4 м3/ч",
      Vibration: "4.1 мм/с",
      "VFD frequency": "31 Hz",
    },
    alarm: {
      id: "scenario-cooling-pressure-drop",
      equipmentId: "pump-shu2",
      severity: "critical",
      status: "active",
      timestamp: "T+00:18",
      title: "Cooling loop pressure drop detected",
      message:
        "Probable cause: pump pressure instability or reduced chilled water flow. Recommended action: inspect pump status and prepare a simulated diagnostic command.",
    },
    steps: [
      {
        id: "cooling-baseline",
        title: "Normal operation baseline",
        description: "Cooling loop baseline is visible before the simulated incident.",
        timestamp: "T+00:00",
      },
      {
        id: "cooling-detected",
        title: "Cooling pressure drop detected",
        description: "Scenario alarm is active and the affected pump is highlighted.",
        timestamp: "T+00:18",
        relatedEquipmentId: "pump-shu2",
        relatedAlarmId: "scenario-cooling-pressure-drop",
      },
      {
        id: "cooling-review",
        title: "Operator reviews recommended action",
        description: "Guided incident card explains probable cause and next safe demo action.",
        timestamp: "T+00:35",
        relatedEquipmentId: "pump-shu2",
        relatedAlarmId: "scenario-cooling-pressure-drop",
      },
      {
        id: "cooling-command",
        title: "Demo command confirmed",
        description: "Command intent is confirmed through the simulation boundary only.",
        timestamp: "T+01:05",
        relatedEquipmentId: "pump-shu2",
        relatedAlarmId: "scenario-cooling-pressure-drop",
      },
      {
        id: "cooling-mitigated",
        title: "Demo mitigation recorded",
        description: "Scenario advanced locally. No real equipment was controlled.",
        timestamp: "T+01:20",
        relatedEquipmentId: "pump-shu2",
        relatedAlarmId: "scenario-cooling-pressure-drop",
      },
    ],
    kpis: [
      { id: "zones", label: "Affected zones", value: "4", helperText: "Demo estimate from chilled-water dependency.", trend: "neutral" },
      { id: "risk", label: "Comfort risk", value: "High", helperText: "Escalates while pressure remains unstable.", trend: "up" },
      { id: "downtime", label: "Downtime avoided", value: "18 min", helperText: "Demo estimate from guided diagnosis.", trend: "down" },
      { id: "response", label: "Operator response", value: "Guided", helperText: "Recommended action is ready in inspector.", trend: "neutral" },
    ],
    mitigatedKpis: [
      { id: "zones", label: "Affected zones", value: "4", helperText: "Scenario impact remained traceable.", trend: "neutral" },
      { id: "risk", label: "Comfort risk", value: "Watched", helperText: "Demo mitigation recorded; production execution would require backend control.", trend: "down" },
      { id: "downtime", label: "Downtime avoided", value: "18 min", helperText: "Investor demo estimate.", trend: "down" },
      { id: "audit", label: "Audit trail", value: "Complete", helperText: "Command intent is visible in journal.", trend: "neutral" },
    ],
  },
  "fan-coil-comfort-drift": {
    id: "fan-coil-comfort-drift",
    title: "Fan coil comfort drift",
    affectedEquipmentId: "fc-021",
    alarmId: "scenario-fan-coil-comfort-drift",
    severity: "warning",
    equipmentStatus: "warning",
    probableCause: "Valve position mismatch or fan speed degradation.",
    recommendedAction: "Prepare fan speed adjustment or mode check in demo mode.",
    story: "Room temperature is drifting above setpoint while the fan coil remains online.",
    commandId: "fan-speed",
    commandLabel: "Prepare demo fan speed check",
    telemetryPatch: {
      "Supply temperature": "9.2 °C",
      "Return temperature": "15.1 °C",
      "Fan speed": "1 / Auto",
      "Valve position": "68%",
      Mode: "Auto",
      Setpoint: "22.0 °C",
      "Room temperature": "24.1 °C",
    },
    alarm: {
      id: "scenario-fan-coil-comfort-drift",
      equipmentId: "fc-021",
      severity: "warning",
      status: "active",
      timestamp: "T+00:16",
      title: "Room temperature drifting above setpoint",
      message:
        "Probable cause: valve position mismatch or fan speed degradation. Recommended action: prepare fan speed adjustment or mode check.",
    },
    steps: [
      { id: "fc-baseline", title: "Comfort baseline", description: "Zone A starts within comfort band.", timestamp: "T+00:00" },
      {
        id: "fc-detected",
        title: "Comfort drift detected",
        description: "Fan coil telemetry shows room temperature above setpoint.",
        timestamp: "T+00:16",
        relatedEquipmentId: "fc-021",
        relatedAlarmId: "scenario-fan-coil-comfort-drift",
      },
      {
        id: "fc-review",
        title: "Operator checks fan coil action",
        description: "Inspector recommends a safe demo fan-speed or mode check.",
        timestamp: "T+00:32",
        relatedEquipmentId: "fc-021",
        relatedAlarmId: "scenario-fan-coil-comfort-drift",
      },
      {
        id: "fc-command",
        title: "Demo command confirmed",
        description: "Command intent is logged through simulation only.",
        timestamp: "T+00:58",
        relatedEquipmentId: "fc-021",
        relatedAlarmId: "scenario-fan-coil-comfort-drift",
      },
    ],
    kpis: [
      { id: "room", label: "Affected room", value: "Zone A", helperText: "Demo comfort zone.", trend: "neutral" },
      { id: "comfort", label: "Comfort deviation", value: "+2.1°C", helperText: "Above setpoint in simulation.", trend: "up" },
      { id: "energy", label: "Energy impact", value: "Medium", helperText: "Valve and fan behavior need review.", trend: "neutral" },
      { id: "action", label: "Recommended action", value: "Ready", helperText: "Prepared in inspector.", trend: "neutral" },
    ],
  },
  "sensor-offline": {
    id: "sensor-offline",
    title: "Sensor offline",
    affectedEquipmentId: "sens-dp-01",
    alarmId: "scenario-sensor-offline",
    severity: "offline",
    equipmentStatus: "offline",
    probableCause: "Network interruption or sensor power issue.",
    recommendedAction: "Acknowledge the demo alarm and create an inspection note.",
    story: "Sensor signal is lost, reducing automation confidence for the chilled-water loop.",
    commandId: "enable-disable",
    commandLabel: "Prepare demo inspection note",
    telemetryPatch: {
      Value: "No signal",
      Range: "0-10 bar / TO VERIFY",
      Quality: "offline",
      Online: false,
    },
    alarm: {
      id: "scenario-sensor-offline",
      equipmentId: "sens-dp-01",
      severity: "offline",
      status: "active",
      timestamp: "T+00:12",
      title: "Sensor signal lost",
      message:
        "Probable cause: network interruption or sensor power issue. Recommended action: acknowledge demo alarm and create an inspection note.",
    },
    steps: [
      { id: "sensor-baseline", title: "Sensor baseline", description: "Signal quality is available before the demo incident.", timestamp: "T+00:00" },
      {
        id: "sensor-detected",
        title: "Signal loss detected",
        description: "Sensor is offline and automation confidence is reduced.",
        timestamp: "T+00:12",
        relatedEquipmentId: "sens-dp-01",
        relatedAlarmId: "scenario-sensor-offline",
      },
      {
        id: "sensor-review",
        title: "Operator prepares inspection note",
        description: "The safe path is an inspection note, not live equipment control.",
        timestamp: "T+00:34",
        relatedEquipmentId: "sens-dp-01",
        relatedAlarmId: "scenario-sensor-offline",
      },
    ],
    kpis: [
      { id: "quality", label: "Data quality", value: "Reduced", helperText: "Automation has less reliable input.", trend: "down" },
      { id: "confidence", label: "Automation confidence", value: "Limited", helperText: "Manual review is required.", trend: "down" },
      { id: "inspection", label: "Manual inspection", value: "Yes", helperText: "Demo note is prepared locally.", trend: "neutral" },
    ],
  },
};

export const dispatchScenarioOptions = Object.values(scenarioDefinitions).map((scenario) => ({
  id: scenario.id,
  title: scenario.title,
}));

function createSteps(
  definition: ScenarioDefinition,
  activeIndex: number,
  completedThrough = activeIndex - 1,
): DispatchScenarioStep[] {
  return definition.steps.map((step, index) => ({
    ...step,
    status: index <= completedThrough ? "completed" : index === activeIndex ? "active" : "pending",
  }));
}

export function getDispatchScenarioDefinition(scenarioId: DispatchScenarioId) {
  return scenarioDefinitions[scenarioId];
}

export function getDispatchScenarioTarget(scenario: DispatchScenarioState) {
  const definition = scenarioDefinitions[scenario.id];

  return {
    equipmentId: definition.affectedEquipmentId,
    alarmId: definition.alarmId,
    commandId: definition.commandId,
    commandLabel: definition.commandLabel,
    probableCause: definition.probableCause,
    recommendedAction: definition.recommendedAction,
    story: definition.story,
  };
}

export function createInitialScenarioState(): DispatchScenarioState {
  const definition = scenarioDefinitions["normal-operations"];
  const steps = createSteps(definition, 0, -1);

  return {
    id: definition.id,
    title: definition.title,
    status: "idle",
    updatedAt: fixedTime,
    activeStepId: steps[0]?.id,
    steps,
    kpis: definition.kpis,
  };
}

export function startDispatchScenario(scenarioId: DispatchScenarioId): DispatchScenarioState {
  if (scenarioId === "normal-operations") {
    return createInitialScenarioState();
  }

  const definition = scenarioDefinitions[scenarioId];
  const steps = createSteps(definition, 1, 0);

  return {
    id: definition.id,
    title: definition.title,
    status: "incident_active",
    startedAt: fixedTime,
    updatedAt: "T+00:18",
    activeStepId: steps[1]?.id ?? steps[0]?.id,
    steps,
    kpis: definition.kpis,
  };
}

export function advanceScenarioAfterCommand(
  scenario: DispatchScenarioState,
  _commandType: string,
): DispatchScenarioState {
  if (scenario.id === "normal-operations" || scenario.status === "idle") {
    return scenario;
  }

  const definition = scenarioDefinitions[scenario.id];
  const finalIndex = Math.max(0, definition.steps.length - 1);
  const steps = createSteps(definition, finalIndex, finalIndex - 1).map((step, index) => ({
    ...step,
    status: index <= finalIndex ? "completed" : step.status,
  }));

  return {
    ...scenario,
    status: "mitigated",
    updatedAt: "T+01:20",
    activeStepId: steps[finalIndex]?.id,
    steps,
    kpis: definition.mitigatedKpis ?? definition.kpis,
  };
}

export function resetDispatchScenario(): DispatchScenarioState {
  return {
    ...createInitialScenarioState(),
    status: "idle",
    updatedAt: "T+00:00",
  };
}

export function selectDispatchScenarioStep(
  scenario: DispatchScenarioState,
  stepId: string,
): DispatchScenarioState {
  if (!scenario.steps.some((step) => step.id === stepId)) return scenario;

  return {
    ...scenario,
    activeStepId: stepId,
    steps: scenario.steps.map((step) => ({
      ...step,
      status: step.id === stepId ? "active" : step.status,
    })),
  };
}

function cloneWorkspaceData(data: WorkspaceMockData): WorkspaceMockData {
  return {
    object: { ...data.object },
    floors: data.floors.map((floor) => ({ ...floor })),
    zones: data.zones.map((zone) => ({ ...zone, bounds: { ...zone.bounds } })),
    systems: data.systems.map((system) => ({ ...system })),
    equipment: data.equipment.map((equipment) => ({
      ...equipment,
      position: { ...equipment.position },
      model3d: equipment.model3d ? { ...equipment.model3d } : undefined,
      telemetry: { ...equipment.telemetry },
      capabilities: { ...equipment.capabilities },
      passport: { ...equipment.passport },
      recommendations: [...equipment.recommendations],
    })),
    alarms: data.alarms.map((alarm) => ({ ...alarm })),
    events: data.events.map((event) => ({ ...event })),
    commands: data.commands.map((command) => ({ ...command })),
    recommendedActions: data.recommendedActions.map((action) => ({ ...action })),
  };
}

export function applyScenarioToWorkspaceData(
  data: WorkspaceMockData,
  scenario: DispatchScenarioState,
): WorkspaceMockData {
  const nextData = cloneWorkspaceData(data);
  const definition = scenarioDefinitions[scenario.id];

  if (scenario.id === "normal-operations" || scenario.status === "idle" || scenario.status === "reset") {
    return nextData;
  }

  nextData.object.status = definition.severity ?? "warning";
  nextData.object.updatedAt = `${scenario.updatedAt ?? fixedTime} · scenario demo`;

  if (definition.affectedEquipmentId) {
    nextData.equipment = nextData.equipment.map((equipment) =>
      equipment.id === definition.affectedEquipmentId
        ? {
            ...equipment,
            status: scenario.status === "mitigated" ? "warning" : definition.equipmentStatus ?? equipment.status,
            updatedAt: `${scenario.updatedAt ?? fixedTime} · simulated`,
            telemetry: {
              ...equipment.telemetry,
              ...(definition.telemetryPatch ?? {}),
            },
          }
        : equipment,
    );
  }

  if (definition.alarm) {
    const alarm: AlarmModel = {
      ...definition.alarm,
      status: "active",
      message:
        scenario.status === "mitigated"
          ? `${definition.alarm.message} Demo mitigation recorded locally. No real equipment was controlled.`
          : definition.alarm.message,
    };
    nextData.alarms = [alarm, ...nextData.alarms.filter((item) => item.id !== alarm.id)];
  }

  if (definition.affectedEquipmentId && definition.commandId && definition.commandLabel) {
    const action: RecommendedActionModel = {
      id: `scenario-action-${definition.id}`,
      equipmentId: definition.affectedEquipmentId,
      alarmId: definition.alarmId,
      title: `Guided action: ${definition.title}`,
      description: `${definition.recommendedAction} No real equipment will be controlled in demo mode.`,
      commandId: definition.commandId,
      commandLabel: definition.commandLabel,
      risk: definition.severity === "critical" ? "medium" : "low",
      expectedOutcome: "Scenario advances locally and records an audit trail for the investor demo.",
    };
    nextData.recommendedActions = [
      action,
      ...nextData.recommendedActions.filter((item) => item.id !== action.id),
    ];
  }

  return nextData;
}
