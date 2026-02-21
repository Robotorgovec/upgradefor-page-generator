import type { ReactNode } from "react";
import LayoutShell from "../components/layout/LayoutShell";
import RootChromeSwitch from "../components/layout/RootChromeSwitch";
import "../styles/variables.css";
import "../styles/layout.css";
import "./account/auth.css";
import "./account/account.css";

// Navigation is rendered only through this layout.
// Never reintroduce legacy load-layout scripts or HTML includes.
export default function RootLayout({ children }: { children: ReactNode }) {
  const chromeTree = <LayoutShell>{children}</LayoutShell>;

  return (
    <html lang="ru">
      <body>
        <RootChromeSwitch chrome={chromeTree}>{children}</RootChromeSwitch>
      </body>
    </html>
  );
}
