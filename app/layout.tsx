import type { ReactNode } from "react";

import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import MobileBottomNav from "../components/layout/MobileBottomNav";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0,0"
        />
        <link rel="stylesheet" href="/assets/layout.css?v=20260310-1" />
        <script src="/assets/theme/theme-system.js?v=20260310-1" />
      </head>
      <body>
        <a className="skip" href="#main">
          Рљ СЃРѕРґРµСЂР¶Р°РЅРёСЋ
        </a>
        <Header />
        <Sidebar />
        <main id="main" className="app-content">
          {children}
        </main>
        <MobileBottomNav />
        <script src="/assets/load-layout.js?v=20260310-1" defer />
      </body>
    </html>
  );
}
