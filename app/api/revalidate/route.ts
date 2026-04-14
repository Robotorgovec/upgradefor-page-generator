import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { getCategoryMeta, getCompanyBySlug, getCompanyPath } from "../../../lib/wikimarket/company-repository";

export const runtime = "nodejs";

type RevalidateBody = {
  secret?: string;
  slug?: string;
  paths?: string[];
};

function collectPaths(body: RevalidateBody): string[] {
  const paths = new Set<string>(["/wikimarket/manufacturers", "/wikimarket/sellers"]);

  if (Array.isArray(body.paths)) {
    body.paths
      .map((path) => (typeof path === "string" ? path.trim() : ""))
      .filter(Boolean)
      .forEach((path) => paths.add(path));
  }

  if (body.slug) {
    const company = getCompanyBySlug(body.slug.trim());

    if (company) {
      company.routeFamilies.forEach((routeFamily) => {
        paths.add(getCompanyPath(company, routeFamily));
      });
      paths.add(company.seo.canonicalPath);

      company.categories.forEach((categorySlug) => {
        const category = getCategoryMeta(categorySlug);
        if (!category) {
          return;
        }

        paths.add(category.href);

        if (category.manufacturersHref) {
          paths.add(category.manufacturersHref);
        }

        if (category.sellersHref) {
          paths.add(category.sellersHref);
        }
      });
    }
  }

  return [...paths];
}

async function handleRevalidate(request: NextRequest, body: RevalidateBody) {
  const secret =
    request.nextUrl.searchParams.get("secret") ||
    request.headers.get("x-revalidate-secret") ||
    body.secret;

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (body.slug && !getCompanyBySlug(body.slug.trim())) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const paths = collectPaths(body);

  try {
    paths.forEach((path) => revalidatePath(path));
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "revalidate_failed",
        paths,
        error: error instanceof Error ? error.message : "unknown_error",
      }),
    );

    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }

  return NextResponse.json({ revalidated: true, paths });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as RevalidateBody;
  return handleRevalidate(request, body);
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug") ?? undefined;
  const paths = request.nextUrl.searchParams.getAll("path");
  const secret = request.nextUrl.searchParams.get("secret") ?? undefined;

  return handleRevalidate(request, { slug, paths, secret });
}
