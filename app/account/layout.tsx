// app/account/layout.tsx
import type { ReactNode } from "react";
import Script from "next/script";
import "./auth.css";
import "./account.css";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0,0"
      />
      <link rel="stylesheet" href="/assets/layout.css?v=20260129-01" />
      <meta name="upgr-build" content="layout-fix-2026-01-29-01" />

      <a className="skip" href="#main">
        К содержанию
      </a>

      <div className="layout">
        <header></header>

        <div className="layout-body">
          <aside className="sidebar"></aside>

          <main id="main" className="content app-content">
            {children}
          </main>
        </div>
      </div>

      <Script src="/assets/load-layout.js?v=20260129-01" strategy="afterInteractive" />

      <Script id="account-route" strategy="afterInteractive">
        {`document.body.dataset.route = window.location.pathname;`}
      </Script>
    </>
  );
}
