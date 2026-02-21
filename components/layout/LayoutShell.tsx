"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

type LayoutShellProps = {
  children: ReactNode;
};

const DESKTOP_BREAKPOINT = 768;

export default function LayoutShell({ children }: LayoutShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= DESKTOP_BREAKPOINT;
  });

  useEffect(() => {
    const onResize = () => {
      const shouldBeOpen = window.innerWidth >= DESKTOP_BREAKPOINT;
      setIsSidebarOpen(shouldBeOpen);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <>
      <a className="skip" href="#main-content">
        К содержанию
      </a>

      <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />

      <div className="app-shell" data-sidebar-open={isSidebarOpen}>
        <Sidebar onClose={closeSidebar} />
        <main id="main-content" className="app-content">
          {children}
        </main>
      </div>

      <button
        className="sidebar-overlay"
        type="button"
        aria-label="Закрыть меню"
        onClick={closeSidebar}
      />
    </>
  );
}
