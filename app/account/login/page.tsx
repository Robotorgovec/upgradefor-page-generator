import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "../../../lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/account");
  }

  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Загрузка...</div>}>
      <LoginForm />
    </Suspense>
  );
}
