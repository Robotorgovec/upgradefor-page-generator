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
    var palette = {
      red: { hex: "#ef4444", rgb: "239 68 68" },
      orange: { hex: "#f97316", rgb: "249 115 22" },
      yellow: { hex: "#eab308", rgb: "234 179 8" },
      green: { hex: "#22c55e", rgb: "34 197 94" },
      cyan: { hex: "#12aff0", rgb: "18 175 240" },
      blue: { hex: "#2563eb", rgb: "37 99 235" },
      violet: { hex: "#8b5cf6", rgb: "139 92 246" }
    };
    var day = String(new Date().getDay());
    var autoTheme = cycle[day] || "cyan";
    var theme = (!stored || stored === "auto") ? autoTheme : stored;
    var accent = palette[theme] || palette.cyan;

    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.setProperty("--accent", accent.hex);
    document.documentElement.style.setProperty("--accent-rgb", accent.rgb);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" data-ui-buttons="A">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0,0"
        />
        <link rel="stylesheet" href="/assets/layout.css?v=20260219-2" />
        <link rel="stylesheet" href="/assets/ui-buttons.css?v=20260219-3" />
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
        <Script src="/assets/load-layout.js?v=20260219-3" strategy="afterInteractive" />
      </body>
    </html>
  );
}
