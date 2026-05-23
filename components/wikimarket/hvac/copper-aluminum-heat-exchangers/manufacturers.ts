export type CompanyRole = "manufacturer" | "supplier" | "oem" | "distributor" | "service";

export type RatingState = "rated" | "new" | "no_reviews";

export type StockMode = "stock" | "made_to_order" | "mixed";

export type VerificationLevel = "basic" | "docs" | "advanced";

export type PrimaryContactMode = "form" | "message" | "phone" | "whatsapp" | "email";

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

export interface ManufacturerCategoryPlacement {
  companyId: string;
  categorySlug: string;
  relationType: CompanyRole;
  isFeatured: boolean;
  featuredRank?: number;
  manualSortOrder?: number;
  isVisible: boolean;
  categoryPriorityScore?: number;
  relevanceTags: string[];
  createdAt?: string;
  updatedAt?: string;
  countriesServed?: string[];
  exportRegions?: string[];
  responseSpeedLabel?: string;
  leadTimeLabel?: string;
  stockMode?: StockMode;
  acceptsTenderRequests?: boolean;
  supportsOEM?: boolean;
  supportsRetrofit?: boolean;
  supportsReplacementBySample?: boolean;
  hasStandardProducts?: boolean;
  hasCertificates?: boolean;
  hasCaseStudies?: boolean;
  hasTechnicalDocs?: boolean;
  profileCompletenessScore?: number;
  lastActivityAt?: string;
}

type ManufacturerCardWithPlacement = ManufacturerCompanyCardView & {
  _placement: ManufacturerCategoryPlacement;
};

export interface ManufacturerCompany {
  id: string;
  slug: string;
  legalName?: string;
  publicBrandName: string;
  h1Title: string;
  shortDescription: string;
  fullDescription: string;
  logoUrl: string;
  logoAlt: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  companyRole: CompanyRole;
  foundedYear?: number;
  yearsOnMarketLabel?: string;
  headquartersCountry: string;
  headquartersCity?: string;
  websiteUrl?: string;
  profileUrl: string;
  isVerified: boolean;
  verificationLevel?: VerificationLevel;
  ratingState: RatingState;
  ratingAvg?: number | null;
  ratingCount?: number | null;
  categories: string[];
  capabilities: string[];
  applications: string[];
  materials: string[];
  coatings: string[];
  refrigerantsSupported?: string[];
  documentsAvailable: string[];
  serviceRegions: string[];
  languages?: string[];
  responseSpeedLabel?: string;
  leadTimeLabel?: string;
  stockMode?: StockMode;
  minimumOrderLabel?: string;
  acceptsTenderRequests?: boolean;
  supportsOEM?: boolean;
  supportsRetrofit?: boolean;
  supportsReplacementBySample?: boolean;
  standardProductsCount?: number;
  caseStudiesCount?: number;
  primaryContactMode: PrimaryContactMode;
  inquiryUrl: string;
  engineeringSupportLabel?: string;
  productionCapacityLabel?: string;
  drawingSupport?: boolean;
  passportAndTestDocs?: boolean;
  exportExperienceLabel?: string;
  industriesServed?: string[];
  deliveryOptions?: string[];
  customManufacturingNotes?: string;
  oemNotes?: string;
  retrofitNotes?: string;
}

export interface CompanyStandardProduct {
  id: string;
  companyId: string;
  slug: string;
  title: string;
  shortTitle?: string;
  shortDescription: string;
  imageUrl: string;
  imageAlt: string;
  productFamily: string;
  productType: string;
  categorySlug: string;
  applicationLabels: string[];
  mediaTypeLabels: string[];
  availabilityMode: StockMode;
  priceMode: "request_quote" | "from_price" | "hidden";
  inquiryUrl: string;
  isVisible: boolean;
  tubeDiameterMm?: number;
  finPitchLabel?: string;
  rowsLabel?: string;
  coilDepthLabel?: string;
  dimensionsLabel?: string;
  connectionTypeLabel?: string;
  maxWorkingPressureLabel?: string;
  compatibleFluids?: string[];
  refrigerantsSupported?: string[];
  coatings?: string[];
  frameMaterialLabel?: string;
  usageContext?: string[];
  customSizeAvailable?: boolean;
  retrofitAvailable?: boolean;
  documentsAvailable?: string[];
  leadTimeLabel?: string;
  moqLabel?: string;
  deliveryRegions?: string[];
  requestPackageLabel?: string;
  featuredInProfile?: boolean;
  featuredRank?: number;
}

export interface CompanyReviewAggregate {
  companyId: string;
  ratingState: RatingState;
  ratingAvg?: number | null;
  ratingCount?: number | null;
  lastReviewAt?: string | null;
  hasVerifiedReviews?: boolean;
}

export interface CompanyLeadOptions {
  companyId: string;
  primaryContactMode: PrimaryContactMode;
  inquiryUrl: string;
  responseSpeedLabel?: string;
  allowFileAttachment?: boolean;
}

export interface ManufacturerSeoMeta {
  companyId: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  breadcrumbTitle?: string;
  categoryAnchorText?: string;
  profileAnchorText?: string;
  structuredDataType?: "Organization" | "Product" | "ItemList";
}

export interface ManufacturerAnalyticsPayload {
  pageCategorySlug: string;
  companyId: string;
  companySlug: string;
  companyRole: string;
  isFeatured: boolean;
  positionIndex: number;
  clickTarget: "card" | "profile_cta" | "show_all";
  ratingState: string;
  hasStandardProducts: boolean;
  isVerified: boolean;
}

export interface ManufacturerAdminFields {
  companyId: string;
  categorySlug: string;
  isVisible: boolean;
  isFeatured: boolean;
  featuredRank?: number;
  manualSortOrder?: number;
  approvedForCategory?: boolean;
  moderationStatus: "draft" | "review" | "approved" | "rejected";
  trustBadgesEnabled: string[];
  capabilityTagsEnabled: string[];
  hideRating: boolean;
  hideLocation: boolean;
  overrideCardDescription?: string;
  overrideCategoryLabel?: string;
  overridePrimaryImage?: string;
  notesInternal?: string;
}

export const CU_AL_CATEGORY_SLUG = "hvac/copper-aluminum-heat-exchangers";

export const DEFAULT_MANUFACTURER_CARD_IMAGE = "/assets/media/heat-exchanger-hero.png";

export const DEFAULT_MANUFACTURER_CARD_IMAGE_ALT = "Медно-алюминиевый теплообменник";

export const CU_AL_CAPABILITY_WHITELIST = [
  "Cu-Al coils",
  "AHU coils",
  "DX evaporators",
  "Condensers",
  "Dry cooler",
  "OEM production",
  "Custom size",
  "Retrofit replacement",
  "Fast quotation",
  "Export supply",
  "Anti-corrosion coating",
  "Tender docs",
  "HVAC projects",
  "Heat pump coils",
  "Rooftop coils",
  "Glycol coils",
] as const;

const capabilityWhitelistSet = new Set<string>(CU_AL_CAPABILITY_WHITELIST);

const manufacturerCards: ManufacturerCompanyCardView[] = [
  {
    id: "alucoil-systems",
    slug: "alucoil-systems",
    name: "AluCoil Systems",
    cardTitle: "AluCoil Systems",
    shortDescription: "Cu-Al секции для AHU, DX и rooftop-проектов с расчётом под режимы и пакетами тендерных документов.",
    companyRole: "manufacturer",
    primaryImageUrl: "/assets/media/heat-exchanger-hero.png",
    primaryImageAlt: "Cu-Al coils production line by AluCoil Systems",
    logoUrl: "/assets/logo/logo-blue-only.png",
    country: "UAE",
    city: "Dubai",
    isVerified: true,
    profileUrl: "/wikimarket/manufacturers/alucoil-systems",
    categoryRelevanceLabel: "Специализация: Cu-Al coils для HVAC",
    capabilities: ["Cu-Al coils", "AHU coils", "OEM production", "Custom size", "Tender docs", "Export supply"],
    standardProductsCount: 24,
    ratingState: "rated",
    ratingAvg: 4.8,
    ratingCount: 12,
    primaryCtaLabel: "Смотреть профиль",
    primaryCtaUrl: "/wikimarket/manufacturers/alucoil-systems",
    responseSpeedLabel: "Ответ в течение 2 часов",
    stockMode: "mixed",
    supportsOEM: true,
    supportsRetrofit: true,
    supportsReplacementBySample: true,
    hasCertificates: true,
    hasTechnicalDocs: true,
    applications: ["AHU", "Rooftop", "Industrial ventilation"],
    materials: ["Copper tubes", "Aluminium fins", "Galvanized frame"],
    coatings: ["Hydrophilic", "Epoxy"],
    exportRegions: ["MENA", "Central Asia", "EU"],
    leadTimeLabel: "3-5 недель",
    profileCompletenessScore: 94,
  },
  {
    id: "nordcoil-oem",
    slug: "nordcoil-oem",
    name: "NordCoil OEM",
    cardTitle: "NordCoil OEM",
    shortDescription: "Контрактное производство Cu-Al секций под бренд заказчика, включая DX испарители и конденсаторы для тепловых насосов.",
    companyRole: "oem",
    primaryImageUrl: "/assets/media/heat-exchanger-hero.png",
    primaryImageAlt: "OEM Cu-Al coil production for HVAC units",
    country: "Turkey",
    city: "Bursa",
    isVerified: true,
    profileUrl: "/wikimarket/manufacturers/nordcoil-oem",
    categoryRelevanceLabel: "OEM специализация для Cu-Al и HVAC",
    capabilities: ["Cu-Al coils", "OEM production", "DX evaporators", "Heat pump coils", "Fast quotation"],
    standardProductsCount: 18,
    ratingState: "new",
    ratingAvg: null,
    ratingCount: null,
    primaryCtaLabel: "Смотреть профиль",
    primaryCtaUrl: "/wikimarket/manufacturers/nordcoil-oem",
    responseSpeedLabel: "Ответ в рабочий день",
    stockMode: "made_to_order",
    supportsOEM: true,
    supportsRetrofit: false,
    supportsReplacementBySample: true,
    hasCertificates: true,
    hasTechnicalDocs: true,
    applications: ["Heat pumps", "Split systems", "Rooftop"],
    materials: ["Copper tubes", "Aluminium fins"],
    coatings: ["Epoxy"],
    exportRegions: ["EU", "MENA"],
    leadTimeLabel: "4-6 недель",
    profileCompletenessScore: 88,
  },
  {
    id: "retrofit-hvac-lab",
    slug: "retrofit-hvac-lab",
    name: "Retrofit HVAC Lab",
    cardTitle: "Retrofit HVAC Lab",
    shortDescription: "Замена секций по образцу и шильдику, retrofit для AHU и rooftop с адаптацией присоединений и проверкой геометрии.",
    companyRole: "service",
    primaryImageUrl: "/assets/media/heat-exchanger-hero.png",
    primaryImageAlt: "Retrofit and replacement Cu-Al coil engineering",
    country: "Kazakhstan",
    city: "Almaty",
    isVerified: true,
    profileUrl: "/wikimarket/manufacturers/retrofit-hvac-lab",
    categoryRelevanceLabel: "Retrofit и replacement для Cu-Al секций",
    capabilities: ["Retrofit replacement", "AHU coils", "Custom size", "Fast quotation", "HVAC projects"],
    standardProductsCount: 9,
    ratingState: "rated",
    ratingAvg: 4.6,
    ratingCount: 8,
    primaryCtaLabel: "Смотреть профиль",
    primaryCtaUrl: "/wikimarket/manufacturers/retrofit-hvac-lab",
    responseSpeedLabel: "Ответ до 4 часов",
    stockMode: "mixed",
    supportsOEM: false,
    supportsRetrofit: true,
    supportsReplacementBySample: true,
    hasCertificates: false,
    hasTechnicalDocs: true,
    applications: ["Retrofit AHU", "Rooftop service", "Commercial HVAC"],
    materials: ["Copper", "Aluminium", "Stainless steel frame"],
    coatings: ["Hydrophilic", "Anti-corrosion coating"],
    exportRegions: ["Central Asia"],
    leadTimeLabel: "2-4 недели",
    profileCompletenessScore: 81,
  },
  {
    id: "gulf-climate-supply",
    slug: "gulf-climate-supply",
    name: "Gulf Climate Supply",
    cardTitle: "Gulf Climate Supply",
    shortDescription: "Поставки Cu-Al coils со склада и под заказ для HVAC-проектов, включая экспортные отгрузки и тендерные комплекты.",
    companyRole: "supplier",
    primaryImageUrl: "/assets/media/heat-exchanger-hero.png",
    primaryImageAlt: "Supply chain of Cu-Al HVAC coils",
    country: "Saudi Arabia",
    isVerified: false,
    profileUrl: "/wikimarket/manufacturers/gulf-climate-supply",
    categoryRelevanceLabel: "Поставки Cu-Al компонентов для HVAC",
    capabilities: ["Cu-Al coils", "Export supply", "Tender docs", "Anti-corrosion coating", "HVAC projects"],
    standardProductsCount: 31,
    ratingState: "no_reviews",
    ratingAvg: null,
    ratingCount: null,
    primaryCtaLabel: "Смотреть профиль",
    primaryCtaUrl: "/wikimarket/manufacturers/gulf-climate-supply",
    responseSpeedLabel: "Ответ в течение дня",
    stockMode: "stock",
    supportsOEM: false,
    supportsRetrofit: true,
    supportsReplacementBySample: false,
    hasCertificates: true,
    hasTechnicalDocs: false,
    applications: ["Warehouse HVAC", "Retail rooftop", "Industrial cooling"],
    materials: ["Copper tubes", "Aluminium fins"],
    coatings: ["Epoxy"],
    exportRegions: ["GCC", "MENA"],
    leadTimeLabel: "Со склада / 1-2 недели",
    profileCompletenessScore: 73,
  },
  {
    id: "hidden-demo-vendor",
    slug: "hidden-demo-vendor",
    name: "Hidden Demo Vendor",
    cardTitle: "Hidden Demo Vendor",
    shortDescription: "Технический профиль для внутренних тестов модерации.",
    companyRole: "distributor",
    primaryImageUrl: "/assets/media/heat-exchanger-hero.png",
    primaryImageAlt: "Hidden test profile",
    country: "Germany",
    isVerified: false,
    profileUrl: "/wikimarket/manufacturers/hidden-demo-vendor",
    categoryRelevanceLabel: "Тестовая релевантность",
    capabilities: ["Cu-Al coils"],
    ratingState: "new",
    ratingAvg: null,
    ratingCount: null,
    primaryCtaLabel: "Смотреть профиль",
    primaryCtaUrl: "/wikimarket/manufacturers/hidden-demo-vendor",
  },
];

const categoryPlacements: ManufacturerCategoryPlacement[] = [
  {
    companyId: "alucoil-systems",
    categorySlug: CU_AL_CATEGORY_SLUG,
    relationType: "manufacturer",
    isFeatured: true,
    featuredRank: 1,
    isVisible: true,
    categoryPriorityScore: 97,
    relevanceTags: ["Cu-Al coils", "AHU coils", "OEM production"],
    responseSpeedLabel: "Ответ в течение 2 часов",
    leadTimeLabel: "3-5 недель",
    stockMode: "mixed",
    supportsOEM: true,
    supportsRetrofit: true,
    supportsReplacementBySample: true,
    hasStandardProducts: true,
    hasCertificates: true,
    hasCaseStudies: true,
    hasTechnicalDocs: true,
    profileCompletenessScore: 94,
    countriesServed: ["UAE", "Saudi Arabia", "Qatar"],
    exportRegions: ["MENA", "EU", "Central Asia"],
    lastActivityAt: "2026-03-01T09:00:00.000Z",
  },
  {
    companyId: "nordcoil-oem",
    categorySlug: CU_AL_CATEGORY_SLUG,
    relationType: "oem",
    isFeatured: true,
    featuredRank: 2,
    isVisible: true,
    categoryPriorityScore: 92,
    relevanceTags: ["OEM production", "DX evaporators", "Heat pump coils"],
    responseSpeedLabel: "Ответ в рабочий день",
    leadTimeLabel: "4-6 недель",
    stockMode: "made_to_order",
    supportsOEM: true,
    supportsRetrofit: false,
    supportsReplacementBySample: true,
    hasStandardProducts: true,
    hasCertificates: true,
    hasCaseStudies: false,
    hasTechnicalDocs: true,
    profileCompletenessScore: 88,
    countriesServed: ["Turkey", "Poland", "Italy"],
    exportRegions: ["EU", "MENA"],
    lastActivityAt: "2026-02-25T14:30:00.000Z",
  },
  {
    companyId: "retrofit-hvac-lab",
    categorySlug: CU_AL_CATEGORY_SLUG,
    relationType: "service",
    isFeatured: false,
    isVisible: true,
    categoryPriorityScore: 86,
    relevanceTags: ["Retrofit replacement", "AHU coils"],
    responseSpeedLabel: "Ответ до 4 часов",
    leadTimeLabel: "2-4 недели",
    stockMode: "mixed",
    supportsOEM: false,
    supportsRetrofit: true,
    supportsReplacementBySample: true,
    hasStandardProducts: true,
    hasCertificates: false,
    hasCaseStudies: true,
    hasTechnicalDocs: true,
    profileCompletenessScore: 81,
    countriesServed: ["Kazakhstan", "Uzbekistan"],
    exportRegions: ["Central Asia"],
    lastActivityAt: "2026-03-02T11:10:00.000Z",
  },
  {
    companyId: "gulf-climate-supply",
    categorySlug: CU_AL_CATEGORY_SLUG,
    relationType: "supplier",
    isFeatured: false,
    isVisible: true,
    categoryPriorityScore: 77,
    relevanceTags: ["Cu-Al coils", "Export supply", "Tender docs"],
    responseSpeedLabel: "Ответ в течение дня",
    leadTimeLabel: "Со склада / 1-2 недели",
    stockMode: "stock",
    supportsOEM: false,
    supportsRetrofit: true,
    supportsReplacementBySample: false,
    hasStandardProducts: true,
    hasCertificates: true,
    hasCaseStudies: false,
    hasTechnicalDocs: false,
    profileCompletenessScore: 73,
    countriesServed: ["Saudi Arabia", "UAE", "Bahrain"],
    exportRegions: ["GCC", "MENA"],
    lastActivityAt: "2026-02-26T08:45:00.000Z",
  },
  {
    companyId: "hidden-demo-vendor",
    categorySlug: CU_AL_CATEGORY_SLUG,
    relationType: "distributor",
    isFeatured: false,
    isVisible: false,
    categoryPriorityScore: 30,
    relevanceTags: ["Cu-Al coils"],
    stockMode: "made_to_order",
    profileCompletenessScore: 40,
    lastActivityAt: "2026-01-12T08:45:00.000Z",
  },
];

const roleLabels: Record<CompanyRole, string> = {
  manufacturer: "Производитель",
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

const MAX_CARD_CAPABILITIES_IN_DATA = 8;
const MAX_CARD_CAPABILITIES_IN_UI = 4;
const MAX_CARD_SHORT_DESCRIPTION = 160;

function normalizeCapabilities(capabilities: string[]): string[] {
  return capabilities.map((item) => item.trim()).filter(Boolean);
}

function hasValue(value?: string | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasRatingPair<T extends Pick<ManufacturerCompanyCardView, "ratingAvg" | "ratingCount">>(
  card: T,
): card is T & { ratingAvg: number; ratingCount: number } {
  return typeof card.ratingAvg === "number" && typeof card.ratingCount === "number" && card.ratingCount > 0;
}

function collectCardValidationErrors(cards: ManufacturerCompanyCardView[]): string[] {
  const errors: string[] = [];

  for (const card of cards) {
    if (!hasValue(card.name)) errors.push(`${card.id}: name is required`);
    if (!hasValue(card.slug)) errors.push(`${card.id}: slug is required`);
    if (!hasValue(card.primaryImageUrl)) errors.push(`${card.id}: primaryImageUrl is required`);
    if (!hasValue(card.primaryImageAlt)) errors.push(`${card.id}: primaryImageAlt is required`);
    if (!hasValue(card.shortDescription)) errors.push(`${card.id}: shortDescription is required`);
    if (!hasValue(card.country)) errors.push(`${card.id}: country is required`);
    if (!hasValue(card.profileUrl)) errors.push(`${card.id}: profileUrl is required`);

    if (card.shortDescription.length > MAX_CARD_SHORT_DESCRIPTION) {
      errors.push(`${card.id}: shortDescription must be <= ${MAX_CARD_SHORT_DESCRIPTION}`);
    }

    const capabilities = normalizeCapabilities(card.capabilities);
    if (capabilities.length > MAX_CARD_CAPABILITIES_IN_DATA) {
      errors.push(`${card.id}: capabilities must be <= ${MAX_CARD_CAPABILITIES_IN_DATA}`);
    }

    if (capabilities.some((tag) => !capabilityWhitelistSet.has(tag))) {
      errors.push(`${card.id}: contains non-whitelisted capability tag`);
    }

    if ((card.ratingAvg == null) !== (card.ratingCount == null)) {
      errors.push(`${card.id}: ratingAvg and ratingCount must be provided together`);
    }

    if (typeof card.standardProductsCount === "number" && card.standardProductsCount < 0) {
      errors.push(`${card.id}: standardProductsCount cannot be negative`);
    }
  }

  return errors;
}

const cardValidationErrors = collectCardValidationErrors(manufacturerCards);

if (cardValidationErrors.length > 0 && process.env.NODE_ENV !== "production") {
  console.warn(`[manufacturers] data validation issues:\n${cardValidationErrors.join("\n")}`);
}

function compareNullableNumberAsc(valueA?: number, valueB?: number): number {
  const a = typeof valueA === "number" ? valueA : Number.POSITIVE_INFINITY;
  const b = typeof valueB === "number" ? valueB : Number.POSITIVE_INFINITY;
  return a - b;
}

function compareNullableNumberDesc(valueA?: number, valueB?: number): number {
  const a = typeof valueA === "number" ? valueA : Number.NEGATIVE_INFINITY;
  const b = typeof valueB === "number" ? valueB : Number.NEGATIVE_INFINITY;
  return b - a;
}

function buildCardsForCategory(categorySlug: string): ManufacturerCompanyCardView[] {
  const cardsById = new Map(manufacturerCards.map((card) => [card.id, card]));
  const visiblePlacements = categoryPlacements.filter(
    (placement) => placement.categorySlug === categorySlug && placement.isVisible,
  );

  const merged = visiblePlacements
    .map<ManufacturerCardWithPlacement | null>((placement) => {
      const card = cardsById.get(placement.companyId);
      if (!card) return null;

      return {
        ...card,
        stockMode: card.stockMode ?? placement.stockMode,
        responseSpeedLabel: card.responseSpeedLabel ?? placement.responseSpeedLabel,
        leadTimeLabel: card.leadTimeLabel ?? placement.leadTimeLabel,
        supportsOEM: card.supportsOEM ?? placement.supportsOEM,
        supportsRetrofit: card.supportsRetrofit ?? placement.supportsRetrofit,
        supportsReplacementBySample: card.supportsReplacementBySample ?? placement.supportsReplacementBySample,
        hasCertificates: card.hasCertificates ?? placement.hasCertificates,
        hasTechnicalDocs: card.hasTechnicalDocs ?? placement.hasTechnicalDocs,
        exportRegions: card.exportRegions ?? placement.exportRegions,
        profileCompletenessScore: card.profileCompletenessScore ?? placement.profileCompletenessScore,
        _placement: placement,
      };
    })
    .filter((item): item is ManufacturerCardWithPlacement => item !== null);

  merged.sort((a, b) => {
    const featuredDiff = Number(b._placement.isFeatured) - Number(a._placement.isFeatured);
    if (featuredDiff !== 0) return featuredDiff;

    const featuredRankDiff = compareNullableNumberAsc(a._placement.featuredRank, b._placement.featuredRank);
    if (featuredRankDiff !== 0) return featuredRankDiff;

    const verifiedDiff = Number(b.isVerified) - Number(a.isVerified);
    if (verifiedDiff !== 0) return verifiedDiff;

    const priorityDiff = compareNullableNumberDesc(a._placement.categoryPriorityScore, b._placement.categoryPriorityScore);
    if (priorityDiff !== 0) return priorityDiff;

    const completenessDiff = compareNullableNumberDesc(
      a.profileCompletenessScore ?? a._placement.profileCompletenessScore,
      b.profileCompletenessScore ?? b._placement.profileCompletenessScore,
    );
    if (completenessDiff !== 0) return completenessDiff;

    const ratingAvgDiff = compareNullableNumberDesc(a.ratingAvg ?? undefined, b.ratingAvg ?? undefined);
    if (ratingAvgDiff !== 0) return ratingAvgDiff;

    const ratingCountDiff = compareNullableNumberDesc(a.ratingCount ?? undefined, b.ratingCount ?? undefined);
    if (ratingCountDiff !== 0) return ratingCountDiff;

    return a.name.localeCompare(b.name);
  });

  return merged.map(({ _placement: _unused, ...card }) => card);
}

export const cuAlManufacturerCards = buildCardsForCategory(CU_AL_CATEGORY_SLUG);

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
  const normalized = normalizeCapabilities(card.capabilities);
  const whitelisted = normalized.filter((tag) => capabilityWhitelistSet.has(tag));
  const source = whitelisted.length > 0 ? whitelisted : normalized;
  const truncated = source.slice(0, MAX_CARD_CAPABILITIES_IN_UI);
  return truncated.length > 0 ? truncated : [card.categoryRelevanceLabel];
}

export function getRatingLabel(card: Pick<ManufacturerCompanyCardView, "ratingState" | "ratingAvg" | "ratingCount">): string {
  if (hasRatingPair(card)) {
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
