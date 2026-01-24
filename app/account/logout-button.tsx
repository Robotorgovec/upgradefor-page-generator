"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      style={{ padding: "8px 16px", background: "black", color: "white" }}
    >
      Выйти
    </button>
  );
}
