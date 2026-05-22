import { NextRequest, NextResponse } from "next/server";

import {
  getDispatchSimulationDemoMode,
  getDispatchTelemetry,
} from "../../../../../src/lib/dispatch/dispatch-simulation-service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ equipmentId: string }> },
) {
  const { equipmentId } = await params;
  const response = getDispatchTelemetry(equipmentId);

  if (!response) {
    return NextResponse.json(
      {
        ok: false,
        demo: getDispatchSimulationDemoMode(),
        error: {
          code: "not_found",
          message: `Equipment not found: ${equipmentId}`,
        },
      },
      { status: 404 },
    );
  }

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
