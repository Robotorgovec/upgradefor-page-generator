import type { ReactNode } from "react";
import { Manrope } from "next/font/google";
import SportpitShell from "./SportpitShell";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800"],
  variable: "--sportpit-font",
});

export default function SportpitLayout({ children }: { children: ReactNode }) {
  return (
    <div className={manrope.variable}>
      <SportpitShell>{children}</SportpitShell>
    </div>
  );
}
