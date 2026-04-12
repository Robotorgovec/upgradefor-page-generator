import type { Metadata } from "next";

import type { RouteFamily } from "./company-types";
import { resolveCompanyRoute } from "./company-repository";
import { toAbsoluteUrl } from "./site";

const directoryCopy: Record<RouteFamily, { title: string; description: string }> = {
  manufacturers: {
    title: "Производители WikiMarket",
    description: "Каталог производителей, OEM и supplier-профилей для WikiMarket."
  },
  sellers: {
    title: "Sellers WikiMarket",
    description: "Публичные seller и distributor-профили с фокусом на наличие, MOQ и логистику."
  }
};

export function getDirectoryMetadata(routeFamily: RouteFamily): Metadata {
  const copy = directoryCopy[routeFamily];

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: `/wikimarket/${routeFamily}`
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export function getCompanyMetadata(slug: string, routeFamily: RouteFamily): Metadata {
  const resolved = resolveCompanyRoute(slug, routeFamily);

  if (!resolved) {
    return {
      title: "Profile not found | WikiMarket",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { company } = resolved;

  return {
    title: company.seo.title,
    description: company.seo.description,
    alternates: {
      canonical: company.seo.canonicalPath,
    },
    openGraph: {
      title: company.seo.title,
      description: company.seo.description,
      url: toAbsoluteUrl(company.seo.canonicalPath),
      images: company.seo.ogImageUrl
        ? [
            {
              url: toAbsoluteUrl(company.seo.ogImageUrl),
            },
          ]
        : undefined,
    },
    robots: company.seo.noindex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  };
}
