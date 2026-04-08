import "server-only";

import type { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

const accountUserSelect = {
  id: true,
  email: true,
  role: true,
  emailVerified: true,
  profileCompleted: true,
  welcomeSeen: true,
  createdAt: true,
  profile: {
    select: {
      displayName: true,
      avatarUrl: true,
      headline: true,
      bio: true,
      location: true,
      links: true,
    },
  },
} satisfies Prisma.UserSelect;

export type AccountUser = Prisma.UserGetPayload<{
  select: typeof accountUserSelect;
}>;

const ACCOUNT_TYPES = ["customer", "provider"] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

function getLoginRedirect(nextPath: string) {
  return `/account/login?reason=unauthorized&next=${encodeURIComponent(nextPath)}`;
}

export async function requireAccountUser(nextPath: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(getLoginRedirect(nextPath));
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: accountUserSelect,
  });

  if (!user) {
    redirect(getLoginRedirect(nextPath));
  }

  return user;
}

export function getDisplayName(user: AccountUser) {
  return user.profile?.displayName?.trim() || null;
}

export function getHeadline(user: AccountUser) {
  return user.profile?.headline?.trim() || null;
}

export function getBio(user: AccountUser) {
  return user.profile?.bio?.trim() || null;
}

export function getLocation(user: AccountUser) {
  return user.profile?.location?.trim() || null;
}

export function getLinks(user: AccountUser) {
  return user.profile?.links ?? [];
}

export function getAccountType(role: string | null | undefined): AccountType | null {
  if (!role) {
    return null;
  }

  const normalizedRole = role.trim().toLowerCase();
  return ACCOUNT_TYPES.includes(normalizedRole as AccountType)
    ? (normalizedRole as AccountType)
    : null;
}

export function getInitials(user: AccountUser) {
  const source = getDisplayName(user) || user.email;
  const parts = source.split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return "U";
  }

  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[1]?.[0] ?? "" : "";
  return `${first}${second}`.toUpperCase();
}

export function getRoleLabel(role: string) {
  const accountType = getAccountType(role);

  if (!accountType) {
    return "Not selected";
  }

  return accountType === "customer" ? "Customer" : "Provider";
}

export function hasRequiredProfileFields(user: AccountUser) {
  return Boolean(getDisplayName(user)) && Boolean(getAccountType(user.role));
}

export function isOnboardingComplete(user: AccountUser) {
  return user.profileCompleted && user.welcomeSeen && hasRequiredProfileFields(user);
}

export function getProfileCompletionLabel(user: AccountUser) {
  return isOnboardingComplete(user) ? "Complete" : "Incomplete";
}

export function getAccountHomePath(user: AccountUser) {
  return isOnboardingComplete(user) ? "/account/dashboard" : "/account/profile/setup";
}

export function getStatusLabel(user: AccountUser) {
  const states: string[] = [];

  if (!isOnboardingComplete(user)) {
    states.push("Setup required");
  }

  if (!user.emailVerified) {
    states.push("Email verification pending");
  }

  return states.length ? states.join(" / ") : "Active";
}

export function formatMemberSince(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}
