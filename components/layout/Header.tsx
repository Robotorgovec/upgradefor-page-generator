"use client";

import Link from "next/link";

type HeaderProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export default function Header({ isSidebarOpen, onToggleSidebar }: HeaderProps) {
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
