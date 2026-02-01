import type { ReactNode } from "react";
import Script from "next/script";

import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import MobileBottomNav from "../components/layout/MobileBottomNav";

const themeInitScript = `
(function () {
  try {
    var storageKey = "userTheme";
    var stored = localStorage.getItem(storageKey);
    var cycle = { "0":"red","1":"orange","2":"yellow","3":"green","4":"cyan","5":"blue","6":"violet" };
    var day = String(new Date().getDay());
    var autoTheme = cycle[day] || "cyan";
    var theme = (!stored || stored === "auto") ? autoTheme : stored;
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0,0"
        />
        <link rel="stylesheet" href="/assets/layout.css?v=20260205-1" />
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
      <body>
        <a className="skip" href="#main">
          К содержанию
        </a>
        <Header />
        <Sidebar />
        <main id="main" className="app-content">
          {children}
        </main>
        <MobileBottomNav />
        <Script src="/assets/load-layout.js?v=20260205-1" strategy="afterInteractive" />
      </body>
    </html>
  );
}
