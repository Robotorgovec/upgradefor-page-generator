export type CompanyRole = "manufacturer" | "seller" | "supplier" | "oem" | "distributor" | "service";

export type RatingState = "rated" | "new" | "no_reviews";

export type StockMode = "stock" | "made_to_order" | "mixed";

export interface ManufacturerCompanyCardView {
  id: string;
  slug: string;
  name: string;
  cardTitle: string;
  shortDescription: string;
  companyRole: CompanyRole;
  primaryImageUrl: string;
  primaryImageAlt: string;
  logoUrl?: string;
  country: string;
  city?: string;
  isVerified: boolean;
  profileUrl: string;
  categoryRelevanceLabel: string;
  capabilities: string[];
  standardProductsCount?: number;
  ratingState: RatingState;
  ratingAvg?: number | null;
  ratingCount?: number | null;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  responseSpeedLabel?: string;
  stockMode?: StockMode;
  supportsOEM?: boolean;
  supportsRetrofit?: boolean;
  supportsReplacementBySample?: boolean;
  hasCertificates?: boolean;
  hasTechnicalDocs?: boolean;
  applications?: string[];
  materials?: string[];
  coatings?: string[];
  exportRegions?: string[];
  leadTimeLabel?: string;
  profileCompletenessScore?: number;
}

const roleLabels: Record<CompanyRole, string> = {
  manufacturer: "Производитель",
  seller: "Seller",
  supplier: "Поставщик",
  oem: "OEM",
  distributor: "Distributor",
  service: "Сервис",
};

const stockModeLabels: Record<StockMode, string> = {
  stock: "Со склада",
  made_to_order: "Под заказ",
  mixed: "Склад + заказ",
};

export const DEFAULT_MANUFACTURER_CARD_IMAGE = "/assets/media/heat-exchanger-hero.png";

export const DEFAULT_MANUFACTURER_CARD_IMAGE_ALT = "Медно-алюминиевый теплообменник";

function hasValue(value?: string | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasRatingPair(card: Pick<ManufacturerCompanyCardView, "ratingAvg" | "ratingCount">): boolean {
  return typeof card.ratingAvg === "number" && typeof card.ratingCount === "number" && card.ratingCount > 0;
}

export function getCompanyRoleLabel(role: CompanyRole): string {
  return roleLabels[role];
}

export function getCompanyLocationLabel(card: Pick<ManufacturerCompanyCardView, "country" | "city">): string {
  return hasValue(card.city) ? `${card.country}, ${card.city}` : card.country;
}

export function getCompanyImage(card: Pick<ManufacturerCompanyCardView, "logoUrl" | "primaryImageUrl">): string {
  return hasValue(card.logoUrl) ? card.logoUrl : card.primaryImageUrl;
}

export function getCompanyImageAlt(
  card: Pick<ManufacturerCompanyCardView, "logoUrl" | "name" | "primaryImageAlt">,
): string {
  return hasValue(card.logoUrl) ? `${card.name} logo` : card.primaryImageAlt;
}

export function getDisplayCapabilities(card: Pick<ManufacturerCompanyCardView, "capabilities" | "categoryRelevanceLabel">): string[] {
  const visibleCapabilities = card.capabilities.filter(Boolean).slice(0, 4);
  return visibleCapabilities.length > 0 ? visibleCapabilities : [card.categoryRelevanceLabel];
}

export function getRatingLabel(card: Pick<ManufacturerCompanyCardView, "ratingState" | "ratingAvg" | "ratingCount">): string {
  if (typeof card.ratingAvg === "number" && typeof card.ratingCount === "number" && card.ratingCount > 0) {
    return `★ ${card.ratingAvg.toFixed(1)} (${card.ratingCount})`;
  }

  if (card.ratingState === "new") {
    return "Новый профиль";
  }

  return "Без отзывов пока";
}

export function getCardMiniFacts(
  card: Pick<ManufacturerCompanyCardView, "standardProductsCount" | "responseSpeedLabel" | "stockMode">,
): string[] {
  const facts: string[] = [];

  if (typeof card.standardProductsCount === "number") {
    facts.push(`Стандартных позиций: ${card.standardProductsCount}`);
  }

  if (hasValue(card.responseSpeedLabel)) {
    facts.push(card.responseSpeedLabel);
  }

  if (card.stockMode) {
    facts.push(stockModeLabels[card.stockMode]);
  }

  return facts;
}

export function hasRatedReviews(card: Pick<ManufacturerCompanyCardView, "ratingAvg" | "ratingCount">): boolean {
  return hasRatingPair(card);
}
