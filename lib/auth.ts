import { randomBytes } from "crypto";

import type { NextAuthOptions, Profile } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import { prisma } from "./prisma";

type AuthUserRecord = {
  id: string;
  email: string;
  role: string;
  emailVerified: Date | null;
};

type GoogleProfile = Profile & {
  sub?: string;
  email?: string | null;
  email_verified?: boolean;
  name?: string | null;
  picture?: string | null;
};

const GOOGLE_UNVERIFIED_REDIRECT = "/account/login?error=google_email_not_verified";
const GOOGLE_ERROR_REDIRECT = "/account/login?error=google_account_error";

const authUserSelect = {
  id: true,
  email: true,
  role: true,
  emailVerified: true,
} as const;

function normalizeEmail(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase();
  return normalized || null;
}

function getGoogleProviderConfig() {
  const clientId = process.env.AUTH_GOOGLE_ID?.trim();
  const clientSecret = process.env.AUTH_GOOGLE_SECRET?.trim();

  if (!clientId || !clientSecret) {
    return null;
  }

  return { clientId, clientSecret };
}

export function isGoogleAuthEnabled() {
  return Boolean(getGoogleProviderConfig());
}

async function createOAuthPasswordHash() {
  return bcrypt.hash(randomBytes(32).toString("hex"), 12);
}

async function syncGoogleAccount(
  account: { provider: string; providerAccountId?: string },
  profile: GoogleProfile
): Promise<AuthUserRecord | null> {
  const providerAccountId = account.providerAccountId?.trim();
  const email = normalizeEmail(profile.email);

  if (!providerAccountId || !email || profile.email_verified !== true) {
    return null;
  }

  const existingAccount = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: account.provider,
        providerAccountId,
      },
    },
    select: {
      user: {
        select: authUserSelect,
      },
    },
  });

  if (existingAccount?.user) {
    return existingAccount.user;
  }

  const verifiedAt = new Date();

  return prisma.$transaction(async (tx) => {
    const existingUser = await tx.user.findUnique({
      where: { email },
      select: authUserSelect,
    });

    if (existingUser) {
      const linkedUser = existingUser.emailVerified
        ? existingUser
        : await tx.user.update({
            where: { id: existingUser.id },
            data: { emailVerified: verifiedAt },
            select: authUserSelect,
          });

      await tx.oAuthAccount.create({
        data: {
          userId: linkedUser.id,
          provider: account.provider,
          providerAccountId,
          email,
        },
      });

      return linkedUser;
    }

    return tx.user.create({
      data: {
        email,
        passwordHash: await createOAuthPasswordHash(),
        role: "user",
        emailVerified: verifiedAt,
        profile: {
          create: {
            displayName: profile.name?.trim() || null,
            avatarUrl: profile.picture?.trim() || null,
          },
        },
        oauthAccounts: {
          create: {
            provider: account.provider,
            providerAccountId,
            email,
          },
        },
      },
      select: authUserSelect,
    });
  });
}

const googleProviderConfig = getGoogleProviderConfig();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = normalizeEmail(credentials?.email);
        const password = credentials?.password ?? "";

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) {
          return null;
        }

        if (!user.emailVerified) {
          throw new Error("AccessDenied");
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
        };
      },
    }),
    ...(googleProviderConfig
      ? [
          GoogleProvider({
            clientId: googleProviderConfig.clientId,
            clientSecret: googleProviderConfig.clientSecret,
            profile(profile) {
              const googleProfile = profile as GoogleProfile;

              return {
                id: googleProfile.sub ?? normalizeEmail(googleProfile.email) ?? "google-user",
                email: normalizeEmail(googleProfile.email) ?? "",
                role: "user",
                emailVerified: googleProfile.email_verified ? new Date() : null,
                name: googleProfile.name ?? null,
                image: googleProfile.picture ?? null,
              };
            },
          }),
        ]
      : []),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") {
        return true;
      }

      const googleProfile = (profile ?? {}) as GoogleProfile;
      const syncedUser = await syncGoogleAccount(
        {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        },
        googleProfile
      ).catch(() => null);

      if (!syncedUser) {
        return googleProfile.email_verified === false ? GOOGLE_UNVERIFIED_REDIRECT : GOOGLE_ERROR_REDIRECT;
      }

      user.id = syncedUser.id;
      user.email = syncedUser.email;
      user.role = syncedUser.role;
      user.emailVerified = syncedUser.emailVerified;

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.id = user.id;
        token.role = user.role;
        token.emailVerified =
          user.emailVerified instanceof Date
            ? user.emailVerified.toISOString()
            : user.emailVerified ?? null;
      }

      if (!token.uid && token.id) {
        token.uid = token.id as string;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid ?? token.id) as string;
        session.user.role = (token.role as string) ?? "user";
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
