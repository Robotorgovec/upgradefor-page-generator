import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import CompanyProfilePage from "../../../../components/wikimarket/company/CompanyProfilePage";
import { getCompanyMetadata } from "../../../../lib/wikimarket/company-metadata";
import { getStaticSlugsForRouteFamily, resolveCompanyRoute } from "../../../../lib/wikimarket/company-repository";

export const runtime = "nodejs";

export const revalidate = 3600;

export const dynamicParams = false;

export function generateStaticParams() {
  return getStaticSlugsForRouteFamily("manufacturers");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return getCompanyMetadata(slug, "manufacturers");
}

export default async function ManufacturerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = resolveCompanyRoute(slug, "manufacturers");

  if (!resolved) {
    notFound();
  }

  if (!resolved.isCanonicalRoute) {
    redirect(resolved.canonicalPath);
  }

  return <CompanyProfilePage company={resolved.company} routeFamily="manufacturers" />;
}
