"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";

type LayoutShellProps = {
  children: ReactNode;
};

export default function LayoutShell({ children }: LayoutShellProps) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("is-home", isHomepage);

    if (isHomepage) {
      document.body.classList.toggle("menu-open", isSidebarOpen);
      return () => {
        document.body.classList.remove("menu-open");
        document.body.classList.remove("is-home");
      };
    }

    document.body.classList.remove("menu-open");

    return () => {
      document.body.classList.remove("menu-open");
      document.body.classList.remove("is-home");
    };
  }, [isHomepage, isSidebarOpen]);

  useEffect(() => {
    if (!isHomepage) {
      document.body.classList.remove("has-mobile-bottom-nav");
      return;
    }

    const syncMobileBottomNav = () => {
      document.body.classList.toggle("has-mobile-bottom-nav", window.innerWidth <= 768);
    };

    syncMobileBottomNav();
    window.addEventListener("resize", syncMobileBottomNav);

    return () => {
      window.removeEventListener("resize", syncMobileBottomNav);
      document.body.classList.remove("has-mobile-bottom-nav");
    };
  }, [isHomepage]);

  useEffect(() => {
    if (!isHomepage) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isHomepage]);

  if (isHomepage) {
    return (
      <>
        <a className="skip" href="#main">
          К содержанию
        </a>
        <Header variant="homepage" isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
        <Sidebar variant="homepage" />
        <main id="main" className="app-content">
          {children}
        </main>
        <nav className="mobile-bottom-nav" aria-label="Нижняя навигация">
          <a className="mobile-bottom-nav-item is-active" href="/" aria-current="page">
            <span className="material-symbols-outlined mobile-bottom-nav-icon" aria-hidden="true">
              home
            </span>
            <span className="mobile-bottom-nav-label">Главная</span>
          </a>
          <a className="mobile-bottom-nav-item" href="/account">
            <span className="material-symbols-outlined mobile-bottom-nav-icon" aria-hidden="true">
              account_circle
            </span>
            <span className="mobile-bottom-nav-label">Аккаунт</span>
          </a>
        </nav>
      </>
    );
  }

  return (
    <>
      <a className="skip" href="#main-content">
        К содержанию
      </a>
      <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
      <div className="app-shell" data-sidebar-open={isSidebarOpen}>
        <Sidebar onClose={closeSidebar} />
        <main id="main-content" className="app-content">
          {children}
        </main>
      </div>
      <button
        className="sidebar-overlay"
        type="button"
        aria-label="Закрыть меню"
        onClick={closeSidebar}
      />
    </>
  );
}
