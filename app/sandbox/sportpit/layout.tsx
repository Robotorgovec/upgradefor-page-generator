import { Suspense } from "react";
import type { ReactNode } from "react";
import SportpitShell from "./SportpitShell";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function SportpitLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Загрузка…</div>}>
      <SportpitShell>{children}</SportpitShell>
    </Suspense>
  );
}
