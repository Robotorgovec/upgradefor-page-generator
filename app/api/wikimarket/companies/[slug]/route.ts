import { NextRequest, NextResponse } from "next/server";

import { getCompanyBySlug, getCompanyPath } from "../../../../../lib/wikimarket/company-repository";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  return NextResponse.json({
    company,
    routes: {
      canonical: company.seo.canonicalPath,
      manufacturers: company.routeFamilies.includes("manufacturers") ? getCompanyPath(company, "manufacturers") : null,
      sellers: company.routeFamilies.includes("sellers") ? getCompanyPath(company, "sellers") : null,
    },
  });
}
