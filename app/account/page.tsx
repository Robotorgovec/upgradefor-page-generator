import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { LogoutButton } from "./logout-button";

function getInitials(name: string | null, fallback: string) {
  const source = name?.trim() || fallback.trim();
  const parts = source.split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[1]?.[0] ?? "" : "";
  return `${first}${second}`.toUpperCase();
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: { skip?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/account/login?next=/account");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      profileCompleted: true,
      welcomeSeen: true,
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

  if (!user) {
    redirect("/account/login?next=/account");
  }

  const shouldSkipRedirect = searchParams?.skip === "1";

  if (!user.profileCompleted && !shouldSkipRedirect) {
    if (!user.welcomeSeen) {
      redirect("/account/welcome");
    }
    redirect("/account/profile/setup");
  }

  const displayName = user.profile?.displayName?.trim();
  const headline = user.profile?.headline?.trim();
  const bio = user.profile?.bio?.trim();
  const location = user.profile?.location?.trim();
  const links = user.profile?.links ?? [];

  return (
    <div className="account-page">
      {!user.profileCompleted ? (
        <div className="account-banner">
          Профиль не заполнен. Добавьте данные, чтобы ваш аккаунт выглядел убедительнее.
        </div>
      ) : null}

      <section className="account-card">
        <div className="account-hero">
          <div className="account-avatar" aria-label="Аватар профиля">
            {user.profile?.avatarUrl ? (
              <img src={user.profile.avatarUrl} alt={displayName || user.email} />
            ) : (
              <span>{getInitials(displayName ?? null, user.email)}</span>
            )}
          </div>
          <div className="account-hero-info">
            <h1>{displayName || "Ваш профиль"}</h1>
            <p>{headline || "Добавьте короткую подпись о себе."}</p>
            {location ? <p>{location}</p> : null}
          </div>
        </div>
        <div style={{ marginTop: 20 }} className="account-section-actions">
          <Link className="btn" href="/account/profile/setup">
            Редактировать профиль
          </Link>
          <LogoutButton />
        </div>
      </section>

      <section className="account-card">
        <h2 className="account-section-title">О себе</h2>
        <p className={bio ? undefined : "account-placeholder"}>
          {bio || "Расскажите о себе, чтобы другие люди лучше вас знали."}
        </p>
        <div style={{ marginTop: 16 }}>
          <h3 className="account-section-title" style={{ fontSize: 16 }}>
            Ссылки
          </h3>
          {links.length ? (
            <ul>
              {links.map((link) => (
                <li key={link}>
                  <a href={link} target="_blank" rel="noreferrer">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="account-placeholder">Добавьте 1–3 ссылки на ваши проекты.</p>
          )}
        </div>
      </section>

      <div className="account-grid">
        <section className="account-card">
          <h2 className="account-section-title">Активность</h2>
          <p className="account-placeholder">Скоро появится.</p>
        </section>
        <section className="account-card">
          <h2 className="account-section-title">Сообщения</h2>
          <p className="account-placeholder">Скоро появится.</p>
        </section>
      </div>
    </div>
  );
}
