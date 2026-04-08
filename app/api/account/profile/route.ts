import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

type ProfilePayload = {
  displayName?: string;
  role?: string;
  headline?: string;
  bio?: string;
  location?: string;
  links?: string[];
};

type ProfileFieldErrors = {
  displayName?: string;
  role?: string;
  links?: string;
};

const ACCOUNT_TYPES = ["customer", "provider"] as const;

function getAccountType(value: string | undefined) {
  const normalized = value?.trim().toLowerCase();

  return ACCOUNT_TYPES.includes(normalized as (typeof ACCOUNT_TYPES)[number])
    ? (normalized as (typeof ACCOUNT_TYPES)[number])
    : null;
}

function normalizeUrl(value: string) {
  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as ProfilePayload | null;
  const fieldErrors: ProfileFieldErrors = {};

  const displayName = body?.displayName?.trim() ?? "";
  if (displayName.length < 2) {
    fieldErrors.displayName = "Enter a name with at least 2 characters.";
  }

  const role = getAccountType(body?.role);
  if (!role) {
    fieldErrors.role = "Choose a valid account type.";
  }

  const rawLinks = (body?.links ?? []).map((link) => link.trim()).filter(Boolean);
  const links = rawLinks.map(normalizeUrl);

  if (links.length > 3) {
    fieldErrors.links = "You can add up to 3 links.";
  } else if (links.some((link) => !link)) {
    fieldErrors.links = "Links must start with http:// or https://.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      {
        message: "Fix the highlighted fields and try again.",
        fieldErrors,
      },
      { status: 400 }
    );
  }

  const accountType = role as (typeof ACCOUNT_TYPES)[number];
  const normalizedLinks = links.filter((link): link is string => Boolean(link));

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      role: accountType,
      profileCompleted: true,
      welcomeSeen: true,
      profile: {
        upsert: {
          create: {
            displayName,
            headline: body?.headline?.trim() || null,
            bio: body?.bio?.trim() || null,
            location: body?.location?.trim() || null,
            links: normalizedLinks,
          },
          update: {
            displayName,
            headline: body?.headline?.trim() || null,
            bio: body?.bio?.trim() || null,
            location: body?.location?.trim() || null,
            links: normalizedLinks,
          },
        },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    message: "Profile saved. Redirecting to your dashboard...",
    redirectTo: "/account/dashboard",
  });
}
