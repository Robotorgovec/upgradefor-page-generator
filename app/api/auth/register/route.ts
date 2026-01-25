import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";
import { rateLimit } from "../../../../lib/rate-limit";
import { sendEmail, logVerificationLink } from "../../../../lib/mail";
import { generateRawToken, hashToken } from "../../../../lib/tokens";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

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
  const limitResult = rateLimit({ key: `register:${ip}`, limit: 5, windowMs: 10 * 60 * 1000 });

  if (!limitResult.ok) {
    return NextResponse.json(
      { ok: false, code: "RATE_LIMIT", message: "Слишком много попыток. Попробуйте позже." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password ?? "";

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { ok: false, code: "INVALID_EMAIL", message: "Введите корректный email." },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
    return NextResponse.json(
      {
        ok: false,
        code: "INVALID_PASSWORD",
        message: `Пароль должен быть не короче ${PASSWORD_MIN_LENGTH} символов.`,
      },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existingUser) {
    return NextResponse.json(
      { ok: false, code: "USER_EXISTS", message: "Пользователь с таким email уже существует." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        email,
        passwordHash,
        role: "user",
        emailVerified: null,
        profile: {
          create: {},
        },
      },
      select: { id: true, email: true },
    });

    await tx.emailToken.create({
      data: {
        userId: createdUser.id,
        type: "verify_email",
        tokenHash,
        expiresAt,
      },
    });

    return createdUser;
  });

  const verifyLink = `${getBaseUrl()}/account/verify?token=${encodeURIComponent(rawToken)}`;
  logVerificationLink(verifyLink);

  await sendEmail({
    to: user.email,
    subject: "Подтверждение email",
    text: "Перейдите по ссылке для подтверждения",
    html: `
      <p>Перейдите по ссылке для подтверждения email:</p>
      <p><a href="${verifyLink}">${verifyLink}</a></p>
    `,
  });

  return NextResponse.json({ ok: true, message: "Регистрация успешна. Проверьте почту." }, { status: 201 });
}
