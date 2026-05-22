import { NextResponse } from "next/server";

import type { DispatchCommandRequest } from "../../../../src/lib/dispatch/dispatch-api-contract";
import {
  confirmDispatchCommand,
  getDispatchSimulationDemoMode,
} from "../../../../src/lib/dispatch/dispatch-simulation-service";

export const dynamic = "force-dynamic";

function isDispatchCommandRequest(payload: unknown): payload is DispatchCommandRequest {
  const body = payload as Partial<DispatchCommandRequest>;
  const command = body.command;

  return (
    body.source === "dispatch-workspace" &&
    typeof command?.id === "string" &&
    typeof command.equipmentId === "string" &&
    typeof command.label === "string" &&
    typeof command.value === "string" &&
    typeof command.reason === "string"
  );
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  if (!isDispatchCommandRequest(payload)) {
    return NextResponse.json(
      {
        ok: false,
        demo: getDispatchSimulationDemoMode(),
        error: {
          code: "invalid_request",
          message: "Dispatch command payload is invalid.",
        },
      },
      { status: 400 },
    );
  }

  return NextResponse.json(confirmDispatchCommand(payload), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
