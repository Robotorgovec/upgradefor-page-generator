import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "../../lib/auth";
import { LogoutButton } from "./logout-button";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/account/login?next=/account");
  }

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Личный кабинет</h1>
      <p style={{ marginBottom: 8 }}>
        <strong>Email:</strong> {session.user.email}
      </p>
      <p style={{ marginBottom: 8 }}>
        <strong>Role:</strong> {session.user.role}
      </p>
      <p style={{ marginBottom: 16 }}>
        <strong>Email verified:</strong> {session.user.emailVerified ?? "not verified"}
      </p>
      <LogoutButton />
    </div>
  );
}
