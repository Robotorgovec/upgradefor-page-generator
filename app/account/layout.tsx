import type { ReactNode } from "react";
import Script from "next/script";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0,0"
      />
      <link rel="stylesheet" href="/assets/layout.css" />
      <a className="skip" href="#main">
        К содержанию
      </a>
      <header></header>
      <aside className="sidebar"></aside>
      <main id="main" className="app-content">
        {children}
      </main>
      <Script src="/assets/load-layout.js" strategy="afterInteractive" />
    </>
  );
}
