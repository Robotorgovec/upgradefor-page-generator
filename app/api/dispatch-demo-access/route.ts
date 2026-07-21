import { NextResponse } from "next/server";

import {
  createDispatchDemoAccessCookie,
  createDispatchDemoClearCookie,
  isDispatchDemoPassword,
} from "../../../src/lib/dispatchDemoAccess";

export async function POST(request: Request) {
  let password = "";

  try {
    const payload = (await request.json()) as { password?: unknown };
    password = typeof payload.password === "string" ? payload.password : "";
  } catch {
    password = "";
  }

  if (!isDispatchDemoPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(createDispatchDemoAccessCookie());

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(createDispatchDemoClearCookie());

  return response;
}
