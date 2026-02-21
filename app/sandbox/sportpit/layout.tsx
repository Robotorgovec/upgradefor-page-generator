import type { Metadata } from "next";
import type { ReactNode } from "react";
import SportpitShell from "./SportpitShell";

export const metadata: Metadata = {
  title: "ActiveCode.kz — центр управления телом и мозгом",
  description:
    "ActiveCode.kz: научно обоснованные протоколы для энергии, фокуса и восстановления. Прозрачный состав, лабораторный контроль и системный подход.",
};

export default function SportpitLayout({ children }: { children: ReactNode }) {
  return <SportpitShell>{children}</SportpitShell>;
}
