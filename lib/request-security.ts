import { NextResponse } from "next/server";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_BYTES = 72;

function getOrigin(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getAllowedOrigins(request: Request) {
  const origins = new Set<string>();

  const nextAuthOrigin = getOrigin(process.env.NEXTAUTH_URL);
  if (nextAuthOrigin) {
    origins.add(nextAuthOrigin);
  }

  if (process.env.VERCEL_URL) {
    const vercelOrigin = getOrigin(`https://${process.env.VERCEL_URL}`);
    if (vercelOrigin) {
      origins.add(vercelOrigin);
    }
  }

  const requestOrigin = getOrigin(request.url);
  if (requestOrigin) {
    origins.add(requestOrigin);
  }

  return origins;
}

export function validateSameOrigin(request: Request) {
  const source = request.headers.get("origin") ?? request.headers.get("referer");
  const sourceOrigin = getOrigin(source);

  if (!sourceOrigin) {
    return NextResponse.json(
      { ok: false, code: "INVALID_ORIGIN", message: "Cross-site request blocked." },
      { status: 403 }
    );
  }

  const allowedOrigins = getAllowedOrigins(request);
  if (!allowedOrigins.has(sourceOrigin)) {
    return NextResponse.json(
      { ok: false, code: "INVALID_ORIGIN", message: "Cross-site request blocked." },
      { status: 403 }
    );
  }

  return null;
}

export function getPasswordValidationMessage(password: string) {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`;
  }

  if (Buffer.byteLength(password, "utf8") > PASSWORD_MAX_BYTES) {
    return `Password must be ${PASSWORD_MAX_BYTES} bytes or fewer.`;
  }

  return null;
}
