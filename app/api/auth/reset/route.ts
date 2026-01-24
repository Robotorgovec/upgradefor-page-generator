import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";
import { rateLimit } from "../../../../lib/rate-limit";
import { hashToken } from "../../../../lib/tokens";

const PASSWORD_MIN_LENGTH = 8;

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limitResult = rateLimit({ key: `reset:${ip}`, limit: 10, windowMs: 10 * 60 * 1000 });

  if (!limitResult.ok) {
    return NextResponse.json({ ok: false, code: "RATE_LIMIT" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!token) {
    return NextResponse.json({ ok: false, code: "TOKEN_INVALID" }, { status: 400 });
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return NextResponse.json({ ok: false, code: "INVALID_PASSWORD" }, { status: 400 });
  }

  const tokenHash = hashToken(token);
  const emailToken = await prisma.emailToken.findFirst({
    where: {
      tokenHash,
      type: "reset_password",
    },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      usedAt: true,
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

  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: emailToken.userId },
      data: { passwordHash },
    }),
    prisma.emailToken.update({
      where: { id: emailToken.id },
      data: { usedAt: now },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
