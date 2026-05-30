import type { ReactNode } from "react";
import fs from "fs";
import path from "path";

import AppShell from "../components/layout/AppShell";

export default function RootLayout({ children }: { children: ReactNode }) {
  const headerHtml = fs.readFileSync(path.join(process.cwd(), "public", "includes", "header.html"), "utf8");
  const sidebarHtml = fs.readFileSync(path.join(process.cwd(), "public", "includes", "menu.html"), "utf8");

  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0,0"
        />
        <link rel="stylesheet" href="/assets/layout.css?v=20260311-5" />
        <script src="/assets/theme/theme-system.js?v=20260311-5" />
      </head>
      <body>
        <AppShell headerHtml={headerHtml} sidebarHtml={sidebarHtml}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
