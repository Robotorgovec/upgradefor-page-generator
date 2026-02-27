import type { ReactNode } from "react";
import theme from "./_styles/theme.module.css";

export default function SportpitSegmentLayout({ children }: { children: ReactNode }) {
  return <div className={theme.root}>{children}</div>;
}
