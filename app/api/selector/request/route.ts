import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";
import type { SelectorRequestPayload } from "../../../../lib/obair-selector/types";

const statusMap = {
  "matched-standard": "matched_standard",
  "matched-with-warning": "matched_with_warning",
  "no-standard-match": "no_standard_match",
  "project-specific": "project_specific",
} as const;

function validateRequestPayload(payload: unknown): { ok: true; value: SelectorRequestPayload } | { ok: false; errors: string[] } {
  const body = payload as Partial<SelectorRequestPayload>;
  const errors: string[] = [];

  if (!body.inputPayload || typeof body.inputPayload !== "object") {
    errors.push("inputPayload is required");
  }

  if (!body.resultStatus || !(body.resultStatus in statusMap)) {
    errors.push("resultStatus is required and must be valid");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: body as SelectorRequestPayload };
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ code: "VALIDATION_ERROR", message: "Invalid JSON payload" }, { status: 400 });
  }

  const validated = validateRequestPayload(payload);

  if (!validated.ok) {
    return NextResponse.json({ code: "VALIDATION_ERROR", errors: validated.errors }, { status: 400 });
  }

  const body = validated.value;

  const created = await prisma.selectionRequest.create({
    data: {
      inputPayload: body.inputPayload,
      resultStatus: statusMap[body.resultStatus],
      selectedModelId: body.selectedModelId,
      selectedFamilyCode: body.selectedFamilyCode,
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      company: body.company,
      comment: body.comment,
      logs: body.shortlist
        ? {
            create: body.shortlist.map((item) => ({
              modelId: item.modelId,
              score: item.score,
              reasons: item.reasons,
              warnings: item.warnings,
            })),
          }
        : undefined,
    },
    include: {
      logs: true,
    },
  });

  return NextResponse.json({
    status: "ok",
    requestId: created.id,
    resultStatus: created.resultStatus,
    logsCount: created.logs.length,
  });
}
