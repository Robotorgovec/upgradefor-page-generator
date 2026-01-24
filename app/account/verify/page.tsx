import { Suspense } from "react";

import { VerifyContent } from "./verify-content";

export const dynamic = "force-dynamic";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Загрузка...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
