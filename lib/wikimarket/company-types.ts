export type RouteFamily = "manufacturers" | "sellers";

export type CompanyRole = "manufacturer" | "seller" | "supplier" | "oem" | "distributor" | "service";

export type RatingState = "rated" | "new" | "no_reviews";

export type AvailabilityMode = "stock" | "made_to_order" | "mixed";

export type PriceMode = "request_quote" | "from_price" | "hidden";

export type VerificationLevel = "basic" | "docs" | "advanced";

export type CompanyImageAsset = {
  url: string;
  alt: string;
  width: number;
  height: number;
};

export type CompanyHeadquarters = {
  country: string;
  city?: string;
  addressLine?: string;
};

export type CompanyContacts = {
  email?: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  formEnabled: boolean;
};

export type CompanyVerification = {
  isVerified: boolean;
  level?: VerificationLevel;
};

export type CompanyRating = {
  state: RatingState;
  avg?: number;
  count?: number;
};

export type CompanyDocument = {
  type: string;
  title: string;
  url: string;
};

export type StandardProduct = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  image: CompanyImageAsset;
  availabilityMode: AvailabilityMode;
  priceMode: PriceMode;
  inquiryUrl: string;
  specs?: Record<string, string | number>;
};

export type SeoMeta = {
  title: string;
  description: string;
  canonicalPath: string;
  ogImageUrl?: string;
  breadcrumbTitle: string;
  noindex: boolean;
};

export type CompanyFact = {
  label: string;
  value: string;
};

export type CompanyFaqItem = {
  question: string;
  answer: string;
};

export type Company = {
  id: string;
  slug: string;
  role: CompanyRole;
  primaryRouteFamily: RouteFamily;
  routeFamilies: RouteFamily[];
  publicName: string;
  legalName?: string;
  shortDescription: string;
  fullDescriptionMd: string;
  logo: CompanyImageAsset;
  coverImage?: CompanyImageAsset;
  hq?: CompanyHeadquarters;
  serviceRegions?: string[];
  languages?: string[];
  websiteUrl?: string;
  contacts: CompanyContacts;
  verification: CompanyVerification;
  capabilities: string[];
  categories: string[];
  rating: CompanyRating;
  documents?: CompanyDocument[];
  standardProducts?: StandardProduct[];
  seo: SeoMeta;
  updatedAt: string;
  responseSpeedLabel?: string;
  leadTimeLabel?: string;
  minimumOrderLabel?: string;
  paymentTerms?: string;
  deliveryNotes?: string;
  brands?: string[];
  highlights?: string[];
  profileFacts?: CompanyFact[];
  faq?: CompanyFaqItem[];
};

export type CompanyRouteResolution = {
  company: Company;
  routeFamily: RouteFamily;
  routePath: string;
  isCanonicalRoute: boolean;
  canonicalPath: string;
};

export type CategoryMeta = {
  slug: string;
  title: string;
  href: string;
  listTitle: string;
  manufacturersHref?: string;
  sellersHref?: string;
};

export const WIKIMARKET_REVALIDATE_SECONDS = 3600;
