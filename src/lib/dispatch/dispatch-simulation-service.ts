import { dispatchWorkspaceMock } from "./mock-object";
import type {
  DispatchCommandRequest,
  DispatchCommandResponse,
  DispatchDemoMode,
  DispatchSnapshotResponse,
  DispatchTelemetryResponse,
} from "./dispatch-api-contract";
import { DISPATCH_DEMO_LABEL } from "./dispatch-api-contract";
import type { EquipmentModel, WorkspaceMockData, WorkflowJournalEntry } from "./types";

export const DISPATCH_SIMULATION_POLLING_INTERVAL_MS = 5000;
export const DISPATCH_SIMULATION_LABEL = DISPATCH_DEMO_LABEL;

export function getDispatchSimulationDemoMode(): DispatchDemoMode {
  return {
    kind: "simulation",
    label: DISPATCH_SIMULATION_LABEL,
    pollingIntervalMs: DISPATCH_SIMULATION_POLLING_INTERVAL_MS,
    generatedAt: new Date().toISOString(),
  };
}

function getSimulationSequence() {
  return Math.floor(Date.now() / DISPATCH_SIMULATION_POLLING_INTERVAL_MS);
}

function formatClock() {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

function cloneWorkspaceData(): WorkspaceMockData {
  return {
    object: { ...dispatchWorkspaceMock.object, updatedAt: formatClock() },
    floors: dispatchWorkspaceMock.floors.map((floor) => ({ ...floor })),
    zones: dispatchWorkspaceMock.zones.map((zone) => ({ ...zone })),
    systems: dispatchWorkspaceMock.systems.map((system) => ({ ...system })),
    equipment: dispatchWorkspaceMock.equipment.map((equipment) => ({
      ...equipment,
      position: { ...equipment.position },
      model3d: equipment.model3d ? { ...equipment.model3d } : undefined,
      telemetry: { ...equipment.telemetry },
      capabilities: { ...equipment.capabilities },
      passport: { ...equipment.passport },
      recommendations: [...equipment.recommendations],
    })),
    alarms: dispatchWorkspaceMock.alarms.map((alarm) => ({ ...alarm })),
    events: dispatchWorkspaceMock.events.map((event) => ({ ...event })),
    commands: dispatchWorkspaceMock.commands.map((command) => ({ ...command })),
    recommendedActions: dispatchWorkspaceMock.recommendedActions.map((action) => ({ ...action })),
  };
}

function formatTemperature(base: number, sequence: number, phase = 0) {
  const offset = Math.sin(sequence / 2 + phase) * 0.4;
  return `${(base + offset).toFixed(1)} °C`;
}

function formatPercent(base: number, sequence: number, phase = 0) {
  const offset = Math.round(Math.sin(sequence / 2 + phase) * 3);
  return `${Math.max(0, Math.min(100, base + offset))}%`;
}

function simulateTelemetry(equipment: EquipmentModel, sequence: number): EquipmentModel["telemetry"] {
  const telemetry = { ...equipment.telemetry };

  if (equipment.id === "fc-021") {
    telemetry["Supply temperature"] = formatTemperature(8.1, sequence);
    telemetry["Return temperature"] = formatTemperature(13.6, sequence, 0.7);
    telemetry["Valve position"] = formatPercent(46, sequence, 1.2);
    telemetry["Room temperature"] = formatTemperature(23.1, sequence, 1.8);
  }

  if (equipment.id === "ch-001") {
    telemetry["Supply water temp"] = formatTemperature(6.3, sequence);
    telemetry["Return water temp"] = formatTemperature(11.7, sequence, 0.8);
    telemetry.Pressure = `${(2.2 + Math.sin(sequence / 2) * 0.05).toFixed(2)} bar`;
    telemetry.COP = (4.18 + Math.sin(sequence / 3) * 0.03).toFixed(2);
  }

  if (equipment.id === "pump-shu2") {
    telemetry.Flow = `${(45.6 + Math.sin(sequence / 2) * 1.4).toFixed(1)} м3/ч`;
    telemetry.Vibration = `${(3.2 + Math.sin(sequence / 3) * 0.2).toFixed(1)} мм/с`;
    telemetry["VFD frequency"] = `${Math.round(40 + Math.sin(sequence / 2) * 2)} Hz`;
  }

  if (equipment.id === "sens-dp-01") {
    telemetry.Quality = sequence % 2 === 0 ? "suspect" : "suspect / drifting";
    telemetry.Online = true;
  }

  return telemetry;
}

export function getDispatchSnapshot(): DispatchSnapshotResponse {
  const sequence = getSimulationSequence();
  const data = cloneWorkspaceData();

  data.equipment = data.equipment.map((equipment) => ({
    ...equipment,
    updatedAt: formatClock(),
    telemetry: simulateTelemetry(equipment, sequence),
  }));

  return {
    ok: true,
    demo: getDispatchSimulationDemoMode(),
    data,
    updatedAt: new Date().toISOString(),
  };
}

export function getDispatchWorkspaceSnapshotData(): WorkspaceMockData {
  return getDispatchSnapshot().data;
}

export function getDispatchTelemetry(equipmentId: string): DispatchTelemetryResponse | null {
  const equipment = dispatchWorkspaceMock.equipment.find((item) => item.id === equipmentId);
  if (!equipment) return null;

  const sequence = getSimulationSequence();

  return {
    ok: true,
    demo: getDispatchSimulationDemoMode(),
    data: {
      equipmentId: equipment.id,
      equipmentStatus: equipment.status,
      telemetry: simulateTelemetry(equipment, sequence),
      updatedAt: new Date().toISOString(),
      sequence,
    },
  };
}

export function confirmDispatchCommand(request: DispatchCommandRequest): DispatchCommandResponse {
  const equipment = dispatchWorkspaceMock.equipment.find((item) => item.id === request.command.equipmentId);
  const updatedAt = new Date().toISOString();
  const journalEntry: WorkflowJournalEntry = {
    id: `journal-command-confirmed-${request.command.id}-${Date.now()}`,
    timestamp: formatClock(),
    equipmentId: request.command.equipmentId,
    alarmId: request.command.alarmId,
    actionId: request.command.actionId,
    type: "command_confirmed",
    title: `${request.command.label} confirmed by simulator`,
    description: `Simulated command accepted for ${equipment?.displayName ?? request.command.equipmentId}. No backend, BMS, PLC, or field equipment was touched.`,
  };

  return {
    ok: true,
    demo: getDispatchSimulationDemoMode(),
    result: {
      commandId: request.command.id,
      equipmentId: request.command.equipmentId,
      accepted: true,
      simulated: true,
      status: "simulated_accepted",
      message: "Command accepted by dispatch simulation. No real equipment control was sent.",
      updatedAt,
      journalEntry,
    },
  };
}
