import type { Metadata } from "next";
import type { ReactNode } from "react";
import styles from "./sandbox.module.css";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function SandboxLayout({ children }: { children: ReactNode }) {
  return <div data-sandbox-root className={styles.sandboxRoot}>{children}</div>;
}
