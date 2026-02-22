import type { ReactNode } from "react";
import { Suspense } from "react";
import SportpitShell from "./SportpitShell";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function SportpitLayout({ children }: { children: ReactNode }) {
  return (
    <SportpitShell>
      <Suspense fallback={null}>{children}</Suspense>
    </SportpitShell>
  );
}
