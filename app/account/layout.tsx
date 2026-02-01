// app/account/layout.tsx
import type { ReactNode } from "react";
import Script from "next/script";
import "./auth.css";
import "./account.css";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Script id="account-route" strategy="afterInteractive">
        {`document.body.dataset.route = window.location.pathname;`}
      </Script>
    </>
  );
}
