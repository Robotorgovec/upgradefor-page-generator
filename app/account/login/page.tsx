import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "../../../lib/auth";
import LoginForm from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect(searchParams?.next || "/account");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <LoginForm />
      </div>
    </div>
  );
}
