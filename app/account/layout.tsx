import type { ReactNode } from "react";
import Script from "next/script";
import "./auth.css";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0,0"
      />
      <link rel="stylesheet" href="/assets/layout.css" />

      {/* skip-link для доступности */}
      <a className="skip" href="#main">
        К содержанию
      </a>

      {/* DOM-структура, которую обычно ожидают site styles + load-layout.js */}
      <div className="layout">
        <header></header>

        <div className="layout-body">
          <aside className="sidebar"></aside>

          {/* id нужен для skip-link; классы — чтобы не ломать стили */}
          <main id="main" className="content app-content">
            {children}
          </main>
        </div>
      </div>

      {/* Инжект хедера/меню и поведение бургер/аккордеон */}
      <Script src="/assets/load-layout.js" strategy="afterInteractive" />

      {/* Если load-layout.js/стили завязаны на route (active menu/open) */}
      <Script id="account-route" strategy="afterInteractive">
        {`document.body.dataset.route = window.location.pathname;`}
      </Script>
    </>
  );
}
