"use client";

import { useEffect } from "react";

export default function EnsureSidebar() {
  useEffect(() => {
    const sidebar = document.querySelector<HTMLElement>(".sidebar");
    if (!sidebar) return;

    const computed = window.getComputedStyle(sidebar);
    if (computed.display === "none") {
      sidebar.style.display = "flex";
    }

    sidebar.removeAttribute("hidden");
    sidebar.removeAttribute("aria-hidden");
  }, []);

  return null;
}
