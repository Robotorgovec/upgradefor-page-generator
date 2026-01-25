import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "../../../lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/account");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <LoginForm />
      </div>
    </div>
  );
}
