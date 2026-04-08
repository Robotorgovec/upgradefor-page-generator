import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions, isGoogleAuthEnabled } from "../../../lib/auth";
import LoginForm from "./login-form";

function getSafeNextPath(value: string | null | undefined, fallback = "/account") {
  if (!value) {
    return fallback;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const nextParam = Array.isArray(params?.next) ? params?.next[0] : params?.next;
  const nextPath = getSafeNextPath(nextParam, "/account");
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect(nextPath);
  }

  return <LoginForm googleEnabled={isGoogleAuthEnabled()} />;
}
