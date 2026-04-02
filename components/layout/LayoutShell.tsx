"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import styles from "./Shell.module.css";

type LayoutShellProps = {
  children: ReactNode;
};

const DESKTOP_BREAKPOINT = 1200;
const MOBILE_BOTTOM_NAV_BREAKPOINT = 768;

export default function LayoutShell({ children }: LayoutShellProps) {
  const pathname = usePathname() || "/";
  const isHomepage = pathname === "/";
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isDesktopShell = viewportWidth !== null && viewportWidth >= DESKTOP_BREAKPOINT;
  const hasMobileBottomNav =
    viewportWidth !== null && viewportWidth <= MOBILE_BOTTOM_NAV_BREAKPOINT;

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  useEffect(() => {
    const syncViewport = () => {
      setViewportWidth(window.innerWidth);
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);

    return () => {
      window.removeEventListener("resize", syncViewport);
    };
  }, []);

  useEffect(() => {
    if (viewportWidth === null) return;

    setIsSidebarOpen(isDesktopShell ? !isHomepage : false);
  }, [isDesktopShell, isHomepage, pathname, viewportWidth]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!isHomepage) {
      document.body.classList.remove("menu-open");
      document.body.classList.remove("has-mobile-bottom-nav");
      return;
    }

    document.body.classList.toggle("menu-open", isSidebarOpen);
    document.body.classList.toggle("has-mobile-bottom-nav", hasMobileBottomNav);

    return () => {
      document.body.classList.remove("menu-open");
      document.body.classList.remove("has-mobile-bottom-nav");
    };
  }, [hasMobileBottomNav, isHomepage, isSidebarOpen]);

  const bottomNavItems = useMemo(
    () =>
      isHomepage
        ? [
            { href: "/", icon: "home", label: "Р“Р»Р°РІРЅР°СЏ" },
            { href: "/account", icon: "account_circle", label: "РђРєРєР°СѓРЅС‚" },
          ]
        : [
            { href: "/", icon: "home", label: "Р“Р»Р°РІРЅР°СЏ" },
            { href: "/feed", icon: "dynamic_feed", label: "Р›РµРЅС‚Р°" },
            { href: "/messages", icon: "mark_unread_chat_alt", label: "РЎРѕРѕР±С‰РµРЅРёСЏ" },
            { href: "/account", icon: "account_circle", label: "РђРєРєР°СѓРЅС‚" },
          ],
    [isHomepage]
  );

  return (
    <>
      <a className={`skip ${styles.skipLink}`} href="#main">
        Рљ СЃРѕРґРµСЂР¶Р°РЅРёСЋ
      </a>
      <div
        className={styles.shell}
        data-shell-home={isHomepage ? "true" : "false"}
        data-sidebar-open={isSidebarOpen ? "true" : "false"}
      >
        <Header
          isHomepage={isHomepage}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
        />
        <div className={styles.frame}>
          <Sidebar currentPath={pathname} isHomepage={isHomepage} />
          <main id="main" className={`app-content ${styles.appContent}`}>
            {children}
          </main>
        </div>
        <button
          className={styles.sidebarOverlay}
          type="button"
          aria-label="Р—Р°РєСЂС‹С‚СЊ РјРµРЅСЋ"
          onClick={closeSidebar}
        />
        <nav className={`mobile-bottom-nav ${styles.mobileBottomNav}`} aria-label="РќРёР¶РЅСЏСЏ РЅР°РІРёРіР°С†РёСЏ">
          {bottomNavItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <a
                key={item.href}
                className={
                  isActive
                    ? `mobile-bottom-nav-item is-active ${styles.mobileBottomNavItem} ${styles.mobileBottomNavItemActive}`
                    : `mobile-bottom-nav-item ${styles.mobileBottomNavItem}`
                }
                href={item.href}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="material-symbols-outlined mobile-bottom-nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className={`mobile-bottom-nav-label ${styles.mobileBottomNavLabel}`}>
                  {item.label}
                </span>
              </a>
            );
          })}
        </nav>
      </div>
    </>
  );
}
