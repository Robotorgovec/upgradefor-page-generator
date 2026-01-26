import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import ProfileSetupForm from "./profile-setup-form";

export default async function ProfileSetupPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/account/login?next=/account/profile/setup");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
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
    },
  });

  return (
    <div className="account-page">
      <section className="account-card">
        <h1 style={{ marginTop: 0 }}>Настройка профиля</h1>
        <ProfileSetupForm
          initialProfile={{
            displayName: user?.profile?.displayName ?? "",
            avatarUrl: user?.profile?.avatarUrl ?? "",
            headline: user?.profile?.headline ?? "",
            bio: user?.profile?.bio ?? "",
            location: user?.profile?.location ?? "",
            links: user?.profile?.links ?? [],
          }}
        />
      </section>
    </div>
  );
}
