"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const AUTH_SHELL_ROUTES = new Set([
  "/account/login",
  "/account/register",
  "/account/forgot",
  "/account/reset",
  "/account/verify",
]);

export default function AppShell({
  children,
  headerHtml,
  sidebarHtml,
}: {
  children: ReactNode;
  headerHtml: string;
  sidebarHtml: string;
}) {
  const pathname = usePathname();
  const isAuthShellRoute = AUTH_SHELL_ROUTES.has(pathname ?? "");

  if (isAuthShellRoute) {
    return (
      <>
        <a className="skip" href="#main">
          К содержанию
        </a>
        <main id="main" className="app-content auth-app-content">
          {children}
        </main>
      </>
    );
  }

  return (
    <>
      <a className="skip" href="#main">
        К содержанию
      </a>
      <header className="site-header" data-site-header="true" dangerouslySetInnerHTML={{ __html: headerHtml }} />
      <aside className="sidebar" dangerouslySetInnerHTML={{ __html: sidebarHtml }} />
      <main id="main" className="app-content">
        {children}
      </main>
      <nav className="mobile-bottom-nav" aria-label="Нижняя навигация" />
      <script src="/assets/load-layout.js?v=20260311-5" defer />
    </>
  );
}
