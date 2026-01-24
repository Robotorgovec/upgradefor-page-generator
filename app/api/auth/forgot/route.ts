import { NextResponse } from "next/server";

import { logVerificationLink, sendEmail } from "../../../../lib/mail";
import { prisma } from "../../../../lib/prisma";
import { rateLimit } from "../../../../lib/rate-limit";
import { generateRawToken, hashToken } from "../../../../lib/tokens";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_TTL_MS = 60 * 60 * 1000;

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function getBaseUrl() {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limitResult = rateLimit({ key: `forgot:${ip}`, limit: 5, windowMs: 10 * 60 * 1000 });

  if (!limitResult.ok) {
    return NextResponse.json({ ok: true });
  }

  const body = await request.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ ok: true });
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } });

  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.emailToken.create({
    data: {
      userId: user.id,
      type: "reset_password",
      tokenHash,
      expiresAt,
    },
  });

  const resetLink = `${getBaseUrl()}/account/reset?token=${encodeURIComponent(rawToken)}`;
  logVerificationLink(resetLink);

  await sendEmail({
    to: user.email,
    subject: "Сброс пароля",
    text: "Перейдите по ссылке, чтобы задать новый пароль",
    html: `
      <p>Перейдите по ссылке, чтобы задать новый пароль:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
    `,
  });

  return NextResponse.json({ ok: true });
}
