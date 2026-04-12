import "server-only";

import { wikimarketCompanies } from "../../content/wikimarket/companies";

import type { CategoryMeta, Company, CompanyRouteResolution, RouteFamily } from "./company-types";

const companiesBySlug = new Map(wikimarketCompanies.map((company) => [company.slug, company]));

const wikimarketCategories: Record<string, CategoryMeta> = {
  "hvac/copper-aluminum-heat-exchangers": {
    slug: "hvac/copper-aluminum-heat-exchangers",
    title: "Cu-Al теплообменники для HVAC",
    href: "/wikimarket/hvac/copper-aluminum-heat-exchangers",
    listTitle: "Производители Cu-Al теплообменников",
    manufacturersHref: "/wikimarket/hvac/copper-aluminum-heat-exchangers/manufacturers",
    sellersHref: "/wikimarket/sellers"
  }
};

export function getAllCompanies(): Company[] {
  return [...wikimarketCompanies].sort((left, right) => left.publicName.localeCompare(right.publicName));
}

export function getCompanyBySlug(slug: string): Company | null {
  return companiesBySlug.get(slug) ?? null;
}

export function getCompaniesForRouteFamily(routeFamily: RouteFamily): Company[] {
  return getAllCompanies().filter((company) => company.routeFamilies.includes(routeFamily));
}

export function getCompaniesForCategory(categorySlug: string): Company[] {
  return getAllCompanies().filter((company) => company.categories.includes(categorySlug));
}

export function getCompanyPath(company: Pick<Company, "slug">, routeFamily: RouteFamily): string {
  return `/wikimarket/${routeFamily}/${company.slug}`;
}

export function resolveCompanyRoute(slug: string, routeFamily: RouteFamily): CompanyRouteResolution | null {
  const company = getCompanyBySlug(slug);
  if (!company || !company.routeFamilies.includes(routeFamily)) {
    return null;
  }

  const routePath = getCompanyPath(company, routeFamily);

  return {
    company,
    routeFamily,
    routePath,
    canonicalPath: company.seo.canonicalPath,
    isCanonicalRoute: company.seo.canonicalPath === routePath
  };
}

export function getStaticSlugsForRouteFamily(routeFamily: RouteFamily): Array<{ slug: string }> {
  return getCompaniesForRouteFamily(routeFamily).map((company) => ({ slug: company.slug }));
}

export function getCategoryMeta(categorySlug: string): CategoryMeta | null {
  return wikimarketCategories[categorySlug] ?? null;
}

export function getCategoryLinks(company: Company): CategoryMeta[] {
  return company.categories.map((categorySlug) => getCategoryMeta(categorySlug)).filter((item): item is CategoryMeta => Boolean(item));
}

export function getRouteFamilyLabel(routeFamily: RouteFamily): string {
  return routeFamily === "manufacturers" ? "Manufacturers" : "Sellers";
}

export function getRoleLabel(role: Company["role"]): string {
  const labels: Record<Company["role"], string> = {
    manufacturer: "Производитель",
    seller: "Seller",
    supplier: "Поставщик",
    oem: "OEM",
    distributor: "Distributor",
    service: "Сервис"
  };

  return labels[role];
}

export function getCompanyLocation(company: Pick<Company, "hq">): string | null {
  if (!company.hq?.country) {
    return null;
  }

  return company.hq.city ? `${company.hq.city}, ${company.hq.country}` : company.hq.country;
}

export function getCompanyPrimaryCategory(company: Company): CategoryMeta | null {
  return getCategoryLinks(company)[0] ?? null;
}
