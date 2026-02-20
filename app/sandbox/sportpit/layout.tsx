import type { ReactNode } from "react";
import SportpitShell from "./SportpitShell";

export default function SportpitLayout({ children }: { children: ReactNode }) {
  return <SportpitShell>{children}</SportpitShell>;
}
