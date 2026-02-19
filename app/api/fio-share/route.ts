import { NextRequest, NextResponse } from "next/server";

import { createFioShare } from "../../../lib/fio-share-store";

type FioShareBody = {
  fioState?: {
    surname?: string;
    name?: string;
    patronymic?: string;
    slug?: string;
    fioDisplay?: string;
  };
  createdAt?: string;
};

export async function POST(request: NextRequest) {
  let body: FioShareBody;

  try {
    body = (await request.json()) as FioShareBody;
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const fioState = body.fioState;
  if (!fioState) {
    return NextResponse.json({ error: "fioState обязателен" }, { status: 400 });
  }

  const surname = (fioState.surname ?? "").trim();
  const name = (fioState.name ?? "").trim();
  const patronymic = (fioState.patronymic ?? "").trim();
  const slug = (fioState.slug ?? "").trim();
  const fioDisplay = (fioState.fioDisplay ?? "").trim();

  if (!surname || !name || !slug || !fioDisplay) {
    return NextResponse.json({ error: "Недостаточно данных для персонализации" }, { status: 400 });
  }

  const { token, expiresAt } = createFioShare(
    { surname, name, patronymic, slug, fioDisplay },
    body.createdAt,
  );

  const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;

  return NextResponse.json({
    token,
    expiresAt,
    shareUrl: `${baseUrl}/fio/${token}`,
  });
}
