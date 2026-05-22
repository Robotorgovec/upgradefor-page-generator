import type {
  EquipmentModel,
  PreparedCommandModel,
  WorkspaceMockData,
  WorkflowJournalEntry,
} from "./types";

export const DISPATCH_DEMO_LABEL = "Simulated telemetry · No real equipment control" as const;

export type DispatchDemoMode = {
  kind: "simulation";
  label: typeof DISPATCH_DEMO_LABEL;
  pollingIntervalMs: number;
  generatedAt: string;
};

export type DispatchApiError = {
  code: "not_found" | "invalid_request" | "simulation_unavailable";
  message: string;
};

export type DispatchApiErrorResponse = {
  ok: false;
  error: DispatchApiError;
  demo: DispatchDemoMode;
};

export type DispatchSnapshotResponse = {
  ok: true;
  demo: DispatchDemoMode;
  data: WorkspaceMockData;
  updatedAt: string;
};

export type DispatchTelemetryPayload = {
  equipmentId: string;
  equipmentStatus: EquipmentModel["status"];
  telemetry: EquipmentModel["telemetry"];
  updatedAt: string;
  sequence: number;
};

export type DispatchTelemetryResponse = {
  ok: true;
  demo: DispatchDemoMode;
  data: DispatchTelemetryPayload;
};

export type DispatchCommandRequest = {
  command: PreparedCommandModel;
  source: "dispatch-workspace";
};

export type DispatchCommandResult = {
  commandId: string;
  equipmentId: string;
  accepted: true;
  simulated: true;
  status: "simulated_accepted";
  message: string;
  updatedAt: string;
  journalEntry: WorkflowJournalEntry;
};

export type DispatchCommandResponse = {
  ok: true;
  demo: DispatchDemoMode;
  result: DispatchCommandResult;
};
