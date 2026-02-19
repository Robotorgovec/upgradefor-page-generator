import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Юридическая информация | UpgradeFor",
  description: "Публичная оферта, политика конфиденциальности и политика возвратов.",
};

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">{children}</div>
    </div>
  );
}
