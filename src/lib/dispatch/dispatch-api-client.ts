import type {
  DispatchApiErrorResponse,
  DispatchCommandRequest,
  DispatchCommandResponse,
  DispatchSnapshotResponse,
  DispatchTelemetryResponse,
} from "./dispatch-api-contract";
import type { PreparedCommandModel } from "./types";

type DispatchApiResponse<T extends { ok: true }> = T | DispatchApiErrorResponse;

export class DispatchApiClientError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "DispatchApiClientError";
  }
}

async function readJson<T extends { ok: true }>(response: Response): Promise<T> {
  const payload = (await response.json()) as DispatchApiResponse<T>;
  if (!response.ok || payload.ok !== true) {
    const errorMessage = payload.ok === false ? payload.error.message : `Dispatch API failed with ${response.status}`;
    throw new DispatchApiClientError(errorMessage, response.status);
  }

  return payload;
}

export async function getDispatchSnapshot(baseUrl = ""): Promise<DispatchSnapshotResponse> {
  const response = await fetch(`${baseUrl}/api/dispatch/snapshot`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  return readJson<DispatchSnapshotResponse>(response);
}

export async function getDispatchTelemetry(
  equipmentId: string,
  baseUrl = "",
): Promise<DispatchTelemetryResponse> {
  const response = await fetch(`${baseUrl}/api/dispatch/telemetry/${encodeURIComponent(equipmentId)}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  return readJson<DispatchTelemetryResponse>(response);
}

export async function confirmDispatchCommand(
  command: PreparedCommandModel,
  baseUrl = "",
): Promise<DispatchCommandResponse> {
  const request: DispatchCommandRequest = {
    command,
    source: "dispatch-workspace",
  };
  const response = await fetch(`${baseUrl}/api/dispatch/commands`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return readJson<DispatchCommandResponse>(response);
}
