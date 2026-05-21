import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const DISPATCH_DEMO_ACCESS_COOKIE = "upgrade_dispatch_demo_access";
export const DISPATCH_DEMO_COOKIE_MAX_AGE = 60 * 60 * 24;

const FALLBACK_DISPATCH_DEMO_PASSWORD = "100001";
const TOKEN_PREFIX = "upgrade-dispatch-demo";

function getDispatchDemoPassword() {
  return process.env.DISPATCH_DEMO_PASSWORD || FALLBACK_DISPATCH_DEMO_PASSWORD;
}

function hashAccessValue(password: string) {
  return createHash("sha256").update(`${TOKEN_PREFIX}:${password}`).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function isDispatchDemoPassword(password: string) {
  return safeEqual(password.trim(), getDispatchDemoPassword());
}

export function isDispatchDemoAccessCookie(value?: string) {
  if (!value) return false;

  return safeEqual(value, hashAccessValue(getDispatchDemoPassword()));
}

export async function hasDispatchDemoAccess() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(DISPATCH_DEMO_ACCESS_COOKIE);

  return isDispatchDemoAccessCookie(cookie?.value);
}

export function createDispatchDemoAccessCookie() {
  return {
    name: DISPATCH_DEMO_ACCESS_COOKIE,
    value: hashAccessValue(getDispatchDemoPassword()),
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DISPATCH_DEMO_COOKIE_MAX_AGE,
  };
}

export function createDispatchDemoClearCookie() {
  return {
    name: DISPATCH_DEMO_ACCESS_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}
