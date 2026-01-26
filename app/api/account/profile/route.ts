import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

type ProfilePayload = {
  displayName?: string;
  headline?: string;
  bio?: string;
  location?: string;
  links?: string[];
  avatarUrl?: string;
};

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as ProfilePayload | null;

  const displayName = body?.displayName?.trim() ?? "";
  if (displayName.length < 2) {
    return NextResponse.json({ message: "Имя должно быть минимум из 2 символов." }, { status: 400 });
  }

  const links = (body?.links ?? []).map((link) => link.trim()).filter(Boolean);
  if (links.length > 3) {
    return NextResponse.json({ message: "Можно добавить не больше 3 ссылок." }, { status: 400 });
  }

  if (links.some((link) => !isValidUrl(link))) {
    return NextResponse.json({ message: "Проверьте формат ссылок (http/https)." }, { status: 400 });
  }

  const profileData = {
    displayName,
    headline: body?.headline?.trim() || null,
    bio: body?.bio?.trim() || null,
    location: body?.location?.trim() || null,
    links,
    avatarUrl: body?.avatarUrl,
  };

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      profileCompleted: true,
      profile: {
        upsert: {
          create: profileData,
          update: profileData,
        },
      },
    },
    select: {
      id: true,
      email: true,
      profileCompleted: true,
      profile: true,
    },
  });

  return NextResponse.json(user);
}
