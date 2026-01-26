import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export default async function WelcomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/account/login?next=/account/welcome");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { profileCompleted: true, welcomeSeen: true },
  });

  if (!user) {
    redirect("/account/login?next=/account/welcome");
  }

  if (user.profileCompleted) {
    redirect("/account");
  }

  if (!user.welcomeSeen) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { welcomeSeen: true },
    });
  }

  return (
    <div className="account-page">
      <section className="account-card">
        <h1 style={{ marginTop: 0 }}>Добро пожаловать в UPGRADE</h1>
        <p>
          Заполните профиль, чтобы сервис мог показывать вас другим пользователям и
          подбирать релевантные возможности.
        </p>
        <div className="account-section-actions" style={{ marginTop: 20 }}>
          <Link className="btn" href="/account/profile/setup">
            Настроить профиль
          </Link>
          <Link className="btn btn--ghost" href="/account?skip=1">
            Пропустить
          </Link>
        </div>
      </section>
    </div>
  );
}
