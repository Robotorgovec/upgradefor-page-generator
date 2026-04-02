"use client";

import Link from "next/link";
import styles from "./Shell.module.css";

type HeaderProps = {
  isHomepage?: boolean;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
};

export default function Header({
  isHomepage = false,
  isSidebarOpen = false,
  onToggleSidebar = () => {},
}: HeaderProps) {
  return (
    <header
      className={`site-header ${styles.siteHeader}`}
      data-site-header="true"
      data-shell-home={isHomepage ? "true" : "false"}
    >
      <div className={`wrap nav ${styles.nav}`}>
        <button
          className={`burger ${styles.burger}`}
          id="burgerBtn"
          type="button"
          aria-label="Открыть меню"
          aria-controls="primary-sidebar"
          aria-expanded={isSidebarOpen}
          onClick={onToggleSidebar}
        >
          <span className={`burger-icon ${styles.burgerIcon}`} aria-hidden="true">
            <span className="burger-line"></span>
            <span className="burger-line"></span>
            <span className="burger-line"></span>
          </span>
        </button>

        <Link className={`brand ${styles.brand}`} href="/" aria-label="UPGRADE Innovations">
          <span className={`upgr-logo ${styles.logo}`} aria-hidden="true">
            <img
              className={`upgr-logo__base ${styles.logoBase}`}
              src="/assets/logo/logo-black-only.png"
              alt="UPGRADE Innovations"
              loading="eager"
              decoding="async"
            />
            <span className={`upgr-logo__accent ${styles.logoAccent}`}></span>
          </span>
        </Link>

        <div className={styles.grow}></div>

        <div className={`header-icons ${styles.headerIcons}`} aria-label="Быстрые действия">
          <button
            className={`icon-btn ${styles.iconButton}`}
            aria-label="Поиск"
            data-path="/search"
            type="button"
          >
            <span className="material-symbols-outlined">search</span>
          </button>
          <button
            className={`icon-btn notifications-trigger ${styles.iconButton}`}
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
          <div className={`theme-switch ${styles.themeSwitch}`} data-theme-switch>
            <button
              className={`theme-switch-trigger ${styles.themeSwitchTrigger}`}
              type="button"
              aria-haspopup="true"
              aria-expanded="false"
              aria-label="Тема дня"
            >
              <span className="theme-dot" aria-hidden="true"></span>
            </button>

            <div className={`theme-switch-menu ${styles.themeSwitchMenu}`} role="menu" aria-label="Тема дня">
              <div className="theme-switch-title">Тема дня</div>
              <div data-theme-switch-options></div>
            </div>
          </div>
        </div>

        <div className={`auth-buttons ${styles.authButtons}`}>
          <Link
            className={`btn btn--ghost ${styles.authButton}`}
            href="/account/login"
            rel="nofollow"
            data-auth-link="signin"
          >
            Войти
          </Link>
          <Link
            className={`btn ${styles.authButton} ${styles.authButtonPrimary}`}
            href="/account/register"
            rel="nofollow"
            data-auth-link="signup"
          >
            Создать аккаунт
          </Link>
        </div>
      </div>
    </header>
  );
}
