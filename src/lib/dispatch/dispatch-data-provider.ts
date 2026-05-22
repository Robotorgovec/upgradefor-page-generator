import { getDispatchWorkspaceSnapshotData } from "./dispatch-simulation-service";
import type { WorkspaceMockData } from "./types";

export function getDispatchWorkspaceData(): WorkspaceMockData {
  return getDispatchWorkspaceSnapshotData();
}
