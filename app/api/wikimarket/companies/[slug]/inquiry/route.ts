import { NextRequest, NextResponse } from "next/server";

import { getCompanyBySlug } from "../../../../../../lib/wikimarket/company-repository";
import { checkInquiryRateLimit, getClientIdentifier } from "../../../../../../lib/wikimarket/inquiry-rate-limit";

export const runtime = "nodejs";

type InquiryPayload = {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  message?: string;
  website?: string;
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  if (!company.contacts.formEnabled) {
    return NextResponse.json({ error: "Inquiry form is disabled for this company" }, { status: 403 });
  }

  const clientIdentifier = getClientIdentifier(request.headers.get("x-forwarded-for"));
  const rateLimit = checkInquiryRateLimit(clientIdentifier);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Слишком много запросов. Попробуйте позже.",
      },
      {
        status: 429,
        headers: rateLimit.retryAfterSeconds ? { "Retry-After": String(rateLimit.retryAfterSeconds) } : undefined,
      },
    );
  }

  const payload = (await request.json().catch(() => null)) as InquiryPayload | null;

  const name = payload?.name?.trim() ?? "";
  const email = payload?.email?.trim() ?? "";
  const customerCompany = payload?.company?.trim() ?? "";
  const phone = payload?.phone?.trim() ?? "";
  const message = payload?.message?.trim() ?? "";
  const website = payload?.website?.trim() ?? "";

  if (website) {
    return NextResponse.json({ error: "Spam protection triggered" }, { status: 400 });
  }

  if (name.length < 2) {
    return NextResponse.json({ error: "Укажите имя" }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Укажите корректный email" }, { status: 400 });
  }

  if (message.length < 20) {
    return NextResponse.json({ error: "Опишите запрос чуть подробнее" }, { status: 400 });
  }

  console.info(
    JSON.stringify({
      event: "company_inquiry_received",
      slug,
      name,
      email,
      customerCompany,
      phone,
      message,
      sourcePath: request.nextUrl.pathname,
      receivedAt: new Date().toISOString(),
    }),
  );

  return NextResponse.json(
    {
      ok: true,
      message: `Запрос по ${company.publicName} принят. Команда обработает его через защищенный inquiry flow.`,
    },
    { status: 202 },
  );
}
