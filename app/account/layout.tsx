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
      <div className="layout">
        <header></header>
        <div className="layout-body">
          <aside className="sidebar"></aside>
          <main className="content">{children}</main>
        </div>
      </div>
      <Script src="/assets/load-layout.js" strategy="afterInteractive" />
    </>
  );
}
