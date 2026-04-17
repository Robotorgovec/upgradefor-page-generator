import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../../../../lib/auth";
import { importObairCatalog } from "../../../../../lib/obair-catalog/import";
import { prisma } from "../../../../../lib/prisma";

interface ImportPayload {
  resetExisting?: boolean;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let payload: ImportPayload = {};

  try {
    payload = (await request.json()) as ImportPayload;
  } catch {
    payload = {};
  }

  const result = await importObairCatalog(prisma, {
    resetExisting: Boolean(payload.resetExisting),
  });

  return NextResponse.json({
    status: "ok",
    result,
  });
}
