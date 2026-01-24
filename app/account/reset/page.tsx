import { Suspense } from "react";

import { ResetContent } from "./reset-content";

export const dynamic = "force-dynamic";

export default function ResetPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Загрузка...</div>}>
      <ResetContent />
    </Suspense>
  );
}
