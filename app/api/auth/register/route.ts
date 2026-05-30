import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";
import { rateLimit } from "../../../../lib/rate-limit";
import { sendEmail, logVerificationLink } from "../../../../lib/mail";
import { generateRawToken, hashToken } from "../../../../lib/tokens";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const VALID_ACCOUNT_TYPES = new Set(["BUYER", "VENDOR"]);

type FieldErrors = Partial<Record<"email" | "password" | "confirmPassword" | "acceptTerms" | "accountType", string>>;

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

function getSignupMode() {
  const explicitMode = process.env.AUTH_SIGNUP_MODE;
  if (explicitMode === "open" || explicitMode === "invite" || explicitMode === "request") {
    return explicitMode;
  }

  if (process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview") {
    return "open";
  }

  return "request";
}

function hashForLog(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function jsonWithRequestId(body: Record<string, unknown>, status: number, requestId: string, extraHeaders?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: {
      "X-Request-Id": requestId,
      ...extraHeaders,
    },
  });
}

function validateRegisterBody(body: unknown) {
  const payload = body as Record<string, unknown> | null;
  const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
  const password = typeof payload?.password === "string" ? payload.password : "";
  const confirmPassword = typeof payload?.confirmPassword === "string" ? payload.confirmPassword : "";
  const acceptTerms = payload?.acceptTerms === true;
  const accountType = typeof payload?.accountType === "string" ? payload.accountType : "BUYER";
  const fieldErrors: FieldErrors = {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Введите корректный email.";
  }

  if (password.length < 8) {
    fieldErrors.password = "Пароль должен быть не короче 8 символов.";
  } else if (!/[A-Za-zА-Яа-яЁё]/.test(password)) {
    fieldErrors.password = "Добавьте хотя бы одну букву.";
  } else if (!/\d/.test(password)) {
    fieldErrors.password = "Добавьте хотя бы одну цифру.";
  } else if (!/[^A-Za-zА-Яа-яЁё\d]/.test(password)) {
    fieldErrors.password = "Добавьте хотя бы один спецсимвол.";
  }

  if (!confirmPassword) {
    fieldErrors.confirmPassword = "Повторите пароль.";
  } else if (password !== confirmPassword) {
    fieldErrors.confirmPassword = "Пароли не совпадают.";
  }

  if (!acceptTerms) {
    fieldErrors.acceptTerms = "Нужно принять условия использования.";
  }

  if (!VALID_ACCOUNT_TYPES.has(accountType)) {
    fieldErrors.accountType = "Выберите тип аккаунта.";
  }

  return {
    data: { email, password, accountType: accountType as "BUYER" | "VENDOR" },
    fieldErrors,
  };
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const ip = getClientIp(request);

  try {
    const signupMode = getSignupMode();

    if (signupMode !== "open") {
      return jsonWithRequestId(
        {
          ok: false,
          code: "SIGNUP_DISABLED",
          message:
            signupMode === "invite"
              ? "Регистрация сейчас доступна только по приглашению."
              : "Публичная регистрация сейчас закрыта. Запросите доступ у команды UpgradeFor.",
          requestId,
        },
        403,
        requestId
      );
    }

    const body = await request.json().catch(() => null);
    const { data, fieldErrors } = validateRegisterBody(body);

    if (Object.keys(fieldErrors).length > 0) {
      return jsonWithRequestId(
        {
          ok: false,
          code: "VALIDATION_ERROR",
          message: "Проверьте поля формы.",
          fieldErrors,
          requestId,
        },
        422,
        requestId
      );
    }

    const emailHash = hashForLog(data.email);
    const ipLimit = rateLimit({ key: `register:ip:${ip}`, limit: 10, windowMs: 10 * 60 * 1000 });
    const emailLimit = rateLimit({
      key: `register:email-ip:${emailHash}:${ip}`,
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });

    if (!ipLimit.ok || !emailLimit.ok) {
      const retryAfterSec = Math.max(
        1,
        Math.ceil((Math.min(ipLimit.resetAt, emailLimit.resetAt) - Date.now()) / 1000)
      );

      return jsonWithRequestId(
        {
          ok: false,
          code: "RATE_LIMITED",
          message: "Слишком много попыток. Попробуйте позже.",
          requestId,
        },
        429,
        requestId,
        { "Retry-After": String(retryAfterSec) }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email: data.email }, select: { id: true } });
    if (existingUser) {
      return jsonWithRequestId(
        {
          ok: false,
          code: "EMAIL_EXISTS",
          message: "Email уже зарегистрирован.",
          fieldErrors: { email: "Email уже зарегистрирован. Войдите или восстановите пароль." },
          requestId,
        },
        409,
        requestId
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const rawToken = generateRawToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          role: "user",
          accountType: data.accountType,
          onboardingCompleted: false,
          emailVerified: null,
          profile: {
            create: {},
          },
        },
        select: { id: true, email: true, accountType: true, onboardingCompleted: true },
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
    }).catch((error) => {
      console.error(
        JSON.stringify({
          event: "auth.register.email_failed",
          requestId,
          status: 202,
          code: "EMAIL_DELIVERY_FAILED",
          route: "/api/auth/register",
          emailHash,
          errorName: error instanceof Error ? error.name : "UnknownError",
        })
      );
    });

    return jsonWithRequestId(
      {
        ok: true,
        user,
      },
      201,
      requestId
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonWithRequestId(
        {
          ok: false,
          code: "EMAIL_EXISTS",
          message: "Email уже зарегистрирован.",
          fieldErrors: { email: "Email уже зарегистрирован. Войдите или восстановите пароль." },
          requestId,
        },
        409,
        requestId
      );
    }

    console.error(
      JSON.stringify({
        event: "auth.register.failed",
        requestId,
        status: 500,
        code: "INTERNAL_ERROR",
        route: "/api/auth/register",
        errorName: error instanceof Error ? error.name : "UnknownError",
      })
    );

    return jsonWithRequestId(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        message: "Не удалось завершить регистрацию. Повторите позже.",
        requestId,
      },
      500,
      requestId
    );
  }
}
