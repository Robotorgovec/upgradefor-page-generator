import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "../../../lib/auth";
import LoginForm from "./login-form";

function getSafeRedirect(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/account";
  }

  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { callbackUrl?: string; next?: string };
}) {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect(getSafeRedirect(searchParams?.callbackUrl || searchParams?.next));
  }

  return <LoginForm />;
}
