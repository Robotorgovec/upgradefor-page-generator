"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function RootChromeSwitch({
  children,
  chrome,
}: {
  children: ReactNode;
  chrome: ReactNode;
}) {
  const pathname = usePathname() || "";
  const isSportpit =
    pathname.startsWith("/sandbox/sportpit") ||
    pathname === "/catalog/usa" ||
    pathname.startsWith("/catalog/usa/");

  if (isSportpit) return <>{children}</>;
  return <>{chrome}</>;
}
