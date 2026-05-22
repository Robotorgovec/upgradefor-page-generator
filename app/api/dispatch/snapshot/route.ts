import { NextResponse } from "next/server";

import { getDispatchSnapshot } from "../../../../src/lib/dispatch/dispatch-simulation-service";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getDispatchSnapshot(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
