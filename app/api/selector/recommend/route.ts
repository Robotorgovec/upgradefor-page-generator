import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";
import { recommendCatalog, validateSelectorInput } from "../../../../lib/obair-selector/recommend";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        code: "VALIDATION_ERROR",
        message: "Invalid JSON payload",
      },
      { status: 400 },
    );
  }

  const validated = validateSelectorInput(payload);

  if (!validated.ok) {
    return NextResponse.json(
      {
        code: "VALIDATION_ERROR",
        errors: validated.errors,
      },
      { status: 400 },
    );
  }

  const result = await recommendCatalog(prisma, validated.value);

  return NextResponse.json(result);
}
