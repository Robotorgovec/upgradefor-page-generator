import type { ReactNode } from "react";
import LayoutShell from "../components/layout/LayoutShell";
import "../styles/variables.css";
import "../styles/layout.css";
import "./account/auth.css";
import "./account/account.css";

// Navigation is rendered only through this layout.
// Never reintroduce legacy load-layout scripts or HTML includes.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0,0"
        />
      </head>
      <body>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
