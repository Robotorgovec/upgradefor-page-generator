import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions, isGoogleAuthEnabled } from "../../../lib/auth";
import RegisterForm from "./register-form";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/account");
  }

  return <RegisterForm googleEnabled={isGoogleAuthEnabled()} />;
}
