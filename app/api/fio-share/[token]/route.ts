import { NextRequest, NextResponse } from "next/server";

import { getFioShare } from "../../../../lib/fio-share-store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const entry = getFioShare(token);

  if (!entry) {
    return NextResponse.json({ error: "Ссылка не найдена или истекла" }, { status: 410 });
  }

  return NextResponse.json({
    fioState: entry.fioState,
    createdAt: entry.createdAt,
    expiresAt: entry.expiresAt,
  });
}
