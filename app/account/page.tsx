import { redirect } from "next/navigation";

import { getAccountHomePath, requireAccountUser } from "./account-data";

export default async function AccountPage() {
  const user = await requireAccountUser("/account");
  redirect(getAccountHomePath(user));
}
