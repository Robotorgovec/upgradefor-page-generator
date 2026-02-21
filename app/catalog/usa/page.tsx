import { Suspense } from "react";
import UsaLandingClient from "../../sandbox/sportpit/components/UsaLandingClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function UsaCatalogPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Загрузка…</div>}>
      <UsaLandingClient />
    </Suspense>
  );
}
