import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { prisma } from "./prisma";
import { rateLimit } from "./rate-limit";

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getClientIp(req: unknown) {
  const headers = (req as { headers?: Record<string, string | string[] | undefined> })?.headers;
  const forwardedFor = headers?.["x-forwarded-for"];
  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0]?.split(",")[0]?.trim() || "unknown";
  }
  if (typeof forwardedFor === "string") {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  const realIp = headers?.["x-real-ip"];
  return typeof realIp === "string" ? realIp : "unknown";
}

function hashForLog(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const email = normalizeEmail(credentials?.email);
        const password = credentials?.password ?? "";

        if (!email || !password) return null;

        const ip = getClientIp(req);
        const ipLimit = rateLimit({ key: `login:ip:${ip}`, limit: 20, windowMs: 10 * 60 * 1000 });
        const emailLimit = rateLimit({
          key: `login:email-ip:${hashForLog(email)}:${ip}`,
          limit: 8,
          windowMs: 10 * 60 * 1000,
        });

        if (!ipLimit.ok || !emailLimit.ok) {
          throw new Error("RATE_LIMITED");
        }

        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;

          const passwordMatches = await bcrypt.compare(password, user.passwordHash);
          if (!passwordMatches) return null;

          return {
            id: user.id,
            email: user.email,
            role: user.role,
            accountType: user.accountType,
            onboardingCompleted: user.onboardingCompleted,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          console.error(
            JSON.stringify({
              event: "auth.login.failed",
              status: 500,
              code: "INTERNAL_ERROR",
              route: "nextauth.credentials",
              emailHash: hashForLog(email),
              errorName: error instanceof Error ? error.name : "UnknownError",
            })
          );

          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accountType = user.accountType;
        token.onboardingCompleted = user.onboardingCompleted;
        token.emailVerified =
          user.emailVerified instanceof Date
            ? user.emailVerified.toISOString()
            : user.emailVerified ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "user";
        session.user.accountType = (token.accountType as "BUYER" | "VENDOR") ?? "BUYER";
        session.user.onboardingCompleted = Boolean(token.onboardingCompleted);
        session.user.emailVerified = token.emailVerified as string | null;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/account/login",
  },
};
