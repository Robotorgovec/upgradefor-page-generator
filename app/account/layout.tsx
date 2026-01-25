import type { ReactNode } from "react";
import Script from "next/script";
import "./auth.css";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
      />
      <link rel="stylesheet" href="/assets/layout.css" />

      <a className="skip" href="#main">К содержанию</a>

      <div className="layout">
        <header></header>

        <div className="layout-body">
          <aside className="sidebar"></aside>

          <main id="main" className="content app-content">
            {children}
          </main>
        </div>
      </div>

      <Script src="/assets/load-layout.js" strategy="afterInteractive" />
      <Script id="account-route" strategy="afterInteractive">
        {`document.body.dataset.route = window.location.pathname;`}
      </Script>
    </>
  );
}
