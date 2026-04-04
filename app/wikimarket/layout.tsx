import type { ReactNode } from "react";

import EnsureSidebar from "../../components/layout/EnsureSidebar";

export default function WikiMarketLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <EnsureSidebar />
      {children}
    </>
  );
}
