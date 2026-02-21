import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import SportpitShell from "./SportpitShell";


const sportpitInter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-sportpit",
});

export const metadata: Metadata = {
  title: "ActiveCode.kz — центр управления телом и мозгом",
  description:
    "ActiveCode.kz: научно обоснованные протоколы для энергии, фокуса и восстановления. Прозрачный состав, лабораторный контроль и системный подход.",
};

export default function SportpitLayout({ children }: { children: ReactNode }) {
  return <div className={sportpitInter.variable}><SportpitShell>{children}</SportpitShell></div>;
}
