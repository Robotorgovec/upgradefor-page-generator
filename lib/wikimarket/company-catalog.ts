import "server-only";

import type { AvailabilityMode, CompanyRole, RatingState } from "./company-types";
import { getCompaniesForCategory, getCompanyPath } from "./company-repository";
import type { ManufacturerCompanyCardView } from "../../components/wikimarket/hvac/copper-aluminum-heat-exchangers/manufacturers";

export const CU_AL_CATEGORY_SLUG = "hvac/copper-aluminum-heat-exchangers";

type Placement = {
  companyId: string;
  relationType: CompanyRole;
  isFeatured: boolean;
  featuredRank?: number;
  categoryPriorityScore?: number;
  responseSpeedLabel?: string;
  leadTimeLabel?: string;
  stockMode?: AvailabilityMode;
  supportsOEM?: boolean;
  supportsRetrofit?: boolean;
  supportsReplacementBySample?: boolean;
  hasCertificates?: boolean;
  hasTechnicalDocs?: boolean;
  profileCompletenessScore?: number;
};

const cuAlPlacements: Placement[] = [
  {
    companyId: "alucoil-systems",
    relationType: "manufacturer",
    isFeatured: true,
    featuredRank: 1,
    categoryPriorityScore: 97,
    responseSpeedLabel: "Ответ в течение 2 часов",
    leadTimeLabel: "3-5 недель",
    stockMode: "mixed",
    supportsOEM: true,
    supportsRetrofit: true,
    supportsReplacementBySample: true,
    hasCertificates: true,
    hasTechnicalDocs: true,
    profileCompletenessScore: 94,
  },
  {
    companyId: "nordcoil-oem",
    relationType: "oem",
    isFeatured: true,
    featuredRank: 2,
    categoryPriorityScore: 92,
    responseSpeedLabel: "Ответ в рабочий день",
    leadTimeLabel: "4-6 недель",
    stockMode: "made_to_order",
    supportsOEM: true,
    supportsReplacementBySample: true,
    hasCertificates: true,
    hasTechnicalDocs: true,
    profileCompletenessScore: 88,
  },
  {
    companyId: "retrofit-hvac-lab",
    relationType: "service",
    isFeatured: false,
    categoryPriorityScore: 86,
    responseSpeedLabel: "Ответ до 4 часов",
    leadTimeLabel: "2-4 недели",
    stockMode: "mixed",
    supportsRetrofit: true,
    supportsReplacementBySample: true,
    hasTechnicalDocs: true,
    profileCompletenessScore: 81,
  },
  {
    companyId: "gulf-climate-supply",
    relationType: "supplier",
    isFeatured: false,
    categoryPriorityScore: 77,
    responseSpeedLabel: "Ответ в течение дня",
    leadTimeLabel: "Со склада / 1-2 недели",
    stockMode: "stock",
    supportsRetrofit: true,
    hasCertificates: true,
    profileCompletenessScore: 73,
  },
];

function compareNullableNumberAsc(valueA?: number, valueB?: number): number {
  const left = typeof valueA === "number" ? valueA : Number.POSITIVE_INFINITY;
  const right = typeof valueB === "number" ? valueB : Number.POSITIVE_INFINITY;
  return left - right;
}

function compareNullableNumberDesc(valueA?: number, valueB?: number): number {
  const left = typeof valueA === "number" ? valueA : Number.NEGATIVE_INFINITY;
  const right = typeof valueB === "number" ? valueB : Number.NEGATIVE_INFINITY;
  return right - left;
}

function getCardRatingState(ratingState: RatingState): RatingState {
  return ratingState;
}

export function getCuAlManufacturerCards(): ManufacturerCompanyCardView[] {
  const companies = getCompaniesForCategory(CU_AL_CATEGORY_SLUG);
  const companyById = new Map(companies.map((company) => [company.id, company]));
  const merged: Array<ManufacturerCompanyCardView & { _placement: Placement }> = [];

  for (const placement of cuAlPlacements) {
    const company = companyById.get(placement.companyId);
    if (!company) {
      continue;
    }

    merged.push({
        id: company.id,
        slug: company.slug,
        name: company.publicName,
        cardTitle: company.publicName,
        shortDescription: company.shortDescription,
        companyRole: placement.relationType,
        primaryImageUrl: company.coverImage?.url ?? company.logo.url,
        primaryImageAlt: company.coverImage?.alt ?? company.logo.alt,
        logoUrl: company.logo.url,
        country: company.hq?.country ?? "Unknown",
        city: company.hq?.city,
        isVerified: company.verification.isVerified,
        profileUrl: getCompanyPath(company, "manufacturers"),
        categoryRelevanceLabel: `Специализация: ${company.capabilities.slice(0, 2).join(" / ")}`,
        capabilities: company.capabilities,
        standardProductsCount: company.standardProducts?.length,
        ratingState: getCardRatingState(company.rating.state),
        ratingAvg: company.rating.avg ?? null,
        ratingCount: company.rating.count ?? null,
        primaryCtaLabel: "Смотреть профиль",
        primaryCtaUrl: getCompanyPath(company, "manufacturers"),
        responseSpeedLabel: company.responseSpeedLabel ?? placement.responseSpeedLabel,
        stockMode: placement.stockMode,
        supportsOEM: placement.supportsOEM,
        supportsRetrofit: placement.supportsRetrofit,
        supportsReplacementBySample: placement.supportsReplacementBySample,
        hasCertificates: placement.hasCertificates,
        hasTechnicalDocs: placement.hasTechnicalDocs,
        applications: [],
        materials: [],
        coatings: [],
        exportRegions: company.serviceRegions,
        leadTimeLabel: company.leadTimeLabel ?? placement.leadTimeLabel,
        profileCompletenessScore: placement.profileCompletenessScore,
        _placement: placement,
      });
  }

  merged.sort((left, right) => {
    const featuredDiff = Number(right._placement.isFeatured) - Number(left._placement.isFeatured);
    if (featuredDiff !== 0) {
      return featuredDiff;
    }

    const featuredRankDiff = compareNullableNumberAsc(left._placement.featuredRank, right._placement.featuredRank);
    if (featuredRankDiff !== 0) {
      return featuredRankDiff;
    }

    const verifiedDiff = Number(right.isVerified) - Number(left.isVerified);
    if (verifiedDiff !== 0) {
      return verifiedDiff;
    }

    const priorityDiff = compareNullableNumberDesc(left._placement.categoryPriorityScore, right._placement.categoryPriorityScore);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    const productDiff = compareNullableNumberDesc(left.standardProductsCount, right.standardProductsCount);
    if (productDiff !== 0) {
      return productDiff;
    }

    return left.name.localeCompare(right.name);
  });

  return merged.map(({ _placement: _unused, ...card }) => card);
}
