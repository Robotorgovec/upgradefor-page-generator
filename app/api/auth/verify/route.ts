import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";
import { rateLimit } from "../../../../lib/rate-limit";
import { hashToken } from "../../../../lib/tokens";

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const limitResult = rateLimit({ key: `verify:${ip}`, limit: 10, windowMs: 60 * 1000 });

  if (!limitResult.ok) {
    return NextResponse.json({ ok: false, code: "RATE_LIMIT" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ ok: false, code: "TOKEN_MISSING" }, { status: 400 });
  }

  const tokenHash = hashToken(token);
  const emailToken = await prisma.emailToken.findFirst({
    where: { tokenHash, type: "verify_email" },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      usedAt: true,
      user: {
        select: {
          emailVerified: true,
        },
      },
    },
  });

  if (!emailToken) {
    return NextResponse.json({ ok: false, code: "TOKEN_INVALID" }, { status: 400 });
  }

  if (emailToken.usedAt) {
    return NextResponse.json({ ok: false, code: "TOKEN_USED" }, { status: 400 });
  }

  if (emailToken.expiresAt.getTime() <= Date.now()) {
    return NextResponse.json({ ok: false, code: "TOKEN_EXPIRED" }, { status: 400 });
  }

  const verifiedAt = emailToken.user.emailVerified ?? new Date();

  await prisma.$transaction([
    prisma.emailToken.update({
      where: { id: emailToken.id },
      data: { usedAt: verifiedAt },
    }),
    prisma.user.update({
      where: { id: emailToken.userId },
      data: { emailVerified: verifiedAt },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
