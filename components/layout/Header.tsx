"use client";

import Link from "next/link";

type HeaderProps = {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  variant?: "default" | "homepage";
};

export default function Header({
  isSidebarOpen = false,
  onToggleSidebar = () => {},
  variant = "default",
}: HeaderProps) {
  if (variant === "homepage") {
    return (
      <header className="site-header" data-site-header="true">
        <div className="wrap nav">
          <button
            className="burger"
            id="burgerBtn"
            aria-label={isSidebarOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={isSidebarOpen ? true : undefined}
            type="button"
            onClick={onToggleSidebar}
          >
            <span className="burger-icon">
              <span className="burger-line"></span>
              <span className="burger-line"></span>
              <span className="burger-line"></span>
            </span>
          </button>

          <Link className="brand" href="/" aria-label="UPGRADE INNOVATIONS">
            <div id="upgr-logo-slot">
              <span className="upgr-logo" aria-label="UPGRADE Innovations">
                <img
                  className="upgr-logo__base"
                  src="/assets/logo/logo-black-only.png"
                  alt="UPGRADE Innovations"
                  loading="lazy"
                  decoding="async"
                />
                <span className="upgr-logo__accent" aria-hidden="true"></span>
              </span>
            </div>
          </Link>

          <div className="grow"></div>

          <div className="header-icons" aria-label="Быстрые действия">
            <button className="icon-btn" aria-label="Поиск" data-path="/search" type="button">
              <span className="material-symbols-outlined">search</span>
            </button>
            <button
              className="icon-btn notifications-trigger"
              aria-label="Уведомления"
              data-path="/notifications"
              data-notifications-trigger="true"
              aria-haspopup="true"
              aria-expanded="false"
              type="button"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="notification-badge" data-notification-badge hidden aria-live="polite"></span>
            </button>
            <div className="theme-switch" data-theme-switch>
              <button
                className="theme-switch-trigger"
                type="button"
                aria-haspopup="true"
                aria-expanded="false"
                aria-label="Тема дня"
              >
                <span className="theme-dot" aria-hidden="true"></span>
              </button>

              <div className="theme-switch-menu" role="menu" aria-label="Тема дня">
                <div className="theme-switch-title">Тема дня</div>
                <div data-theme-switch-options></div>
              </div>
            </div>
          </div>

          <div className="auth-buttons">
            <Link className="btn btn--ghost" href="/account/login" rel="nofollow" data-auth-link="signin">
              Войти
            </Link>
            <Link className="btn" href="/account/register" rel="nofollow" data-auth-link="signup">
              Создать аккаунт
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header>
      <div className="header-inner">
        <button
          type="button"
          className="burger"
          aria-label="Открыть меню"
          aria-expanded={isSidebarOpen}
          onClick={onToggleSidebar}
        >
          <span className="burger-lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
        <Link className="header-brand" href="/">
          <span aria-hidden="true">⚡</span>
          Upgrade Innovations
        </Link>
        <div className="header-actions">
          <div className="auth-actions">
            <Link href="/account/login">Sign in</Link>
            <Link className="primary" href="/account/register">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
