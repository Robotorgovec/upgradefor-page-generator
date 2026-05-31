import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { LogoutButton } from "./logout-button";

const accountTypeLabels = {
  BUYER: "Покупатель",
  VENDOR: "Поставщик",
} as const;

function getInitials(name: string | null, fallback: string) {
  const source = name?.trim() || fallback.trim();
  const parts = source.split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[1]?.[0] ?? "" : "";
  return `${first}${second}`.toUpperCase();
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/account/login?callbackUrl=/account");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      accountType: true,
      emailVerified: true,
      onboardingCompleted: true,
      profileCompleted: true,
      profile: {
        select: {
          displayName: true,
          avatarUrl: true,
          headline: true,
          location: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/account/login?callbackUrl=/account");
  }

  const displayName = user.profile?.displayName?.trim() || null;
  const accountTypeLabel = accountTypeLabels[user.accountType] ?? "Покупатель";

  return (
    <div className="account-page">
      {!user.emailVerified ? (
        <div className="account-banner">
          Email пока не подтверждён. Проверьте почту: ссылка подтверждения нужна для восстановления доступа.
        </div>
      ) : null}

      <section className="account-card">
        <div className="account-hero">
          <div className="account-avatar" aria-label="Аватар профиля">
            {user.profile?.avatarUrl ? (
              <img src={user.profile.avatarUrl} alt={displayName || user.email} />
            ) : (
              <span>{getInitials(displayName, user.email)}</span>
            )}
          </div>
          <div className="account-hero-info">
            <p className="account-kicker">Добро пожаловать</p>
            <h1>{displayName || user.email}</h1>
            <p>{user.profile?.headline?.trim() || `${accountTypeLabel} UpgradeFor`}</p>
            {user.profile?.location ? <p>{user.profile.location}</p> : null}
          </div>
        </div>

        <dl className="account-status-grid">
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Тип аккаунта</dt>
            <dd>{accountTypeLabel}</dd>
          </div>
          <div>
            <dt>Онбординг</dt>
            <dd>{user.onboardingCompleted ? "Завершён" : "Нужно заполнить профиль"}</dd>
          </div>
          <div>
            <dt>Безопасность</dt>
            <dd>{user.emailVerified ? "Email подтверждён" : "Email ожидает подтверждения"}</dd>
          </div>
        </dl>

        <div className="account-section-actions">
          <Link className="btn" href="/account/profile/setup">
            Заполнить профиль
          </Link>
          <LogoutButton />
        </div>
      </section>

      <div className="account-grid account-feature-grid">
        <section className="account-card">
          <h2 className="account-section-title">Покупатель</h2>
          <p className="account-placeholder">Заявки, избранные поставщики и история появятся после запуска рабочего контура.</p>
        </section>
        <section className="account-card">
          <h2 className="account-section-title">Поставщик</h2>
          <p className="account-placeholder">Компания, услуги, каталог и фото будут подключены в следующем этапе онбординга.</p>
        </section>
        <section className="account-card">
          <h2 className="account-section-title">Социальный профиль</h2>
          <p className="account-placeholder">Публикации и persistent photo upload скоро появятся. Сейчас можно подготовить профиль.</p>
        </section>
        <section className="account-card">
          <h2 className="account-section-title">Безопасность аккаунта</h2>
          <p className="account-placeholder">Используйте восстановление пароля и подтвердите email, чтобы не потерять доступ.</p>
        </section>
      </div>
    </div>
  );
}
