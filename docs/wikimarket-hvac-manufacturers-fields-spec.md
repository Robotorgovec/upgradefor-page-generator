# UPGR-WIKIMARKET-HVAC-MANUFACTURERS-001

- Module: `manufacturers-fields-spec`
- Status: `approved-draft-for-codex`
- Date: 2026-03-06

## Поля данных и display contract

### 1) Visible card fields (Category Page, PR-1)

Entity: `ManufacturerCompanyCardView`

- `id`
- `slug`
- `name`
- `cardTitle`
- `shortDescription`
- `companyRole`
- `primaryImageUrl`
- `primaryImageAlt`
- `logoUrl?`
- `country`
- `city?`
- `isVerified`
- `profileUrl`
- `categoryRelevanceLabel`
- `capabilities[]` (UI: max 4)
- `standardProductsCount?`
- `ratingState`
- `ratingAvg?`
- `ratingCount?`
- `primaryCtaLabel`
- `primaryCtaUrl`

Card display order (desktop):
1. Image
2. Role + verified badge
3. Company name
4. Short description
5. Rating row / new profile state
6. Country/city
7. Capability tags
8. Standard products count + mini facts
9. CTA

### 2) Hidden ranking/filter fields

Entity: `ManufacturerCategoryPlacement`

- `companyId`
- `categorySlug`
- `relationType`
- `isFeatured`
- `featuredRank?`
- `manualSortOrder?`
- `isVisible`
- `categoryPriorityScore?`
- `relevanceTags[]`
- `countriesServed[]?`
- `exportRegions[]?`
- `responseSpeedLabel?`
- `leadTimeLabel?`
- `stockMode?`
- `acceptsTenderRequests?`
- `supportsOEM?`
- `supportsRetrofit?`
- `supportsReplacementBySample?`
- `hasStandardProducts?`
- `hasCertificates?`
- `hasCaseStudies?`
- `hasTechnicalDocs?`
- `profileCompletenessScore?`
- `lastActivityAt?`

Default category sorting:
1. `isFeatured desc`
2. `featuredRank asc`
3. `isVerified desc`
4. `categoryPriorityScore desc`
5. `profileCompletenessScore desc`
6. `ratingAvg desc`
7. `ratingCount desc`

### 3) Company profile fields

Entity: `ManufacturerCompany`

Core profile fields:
- identity and brand: `id`, `slug`, `publicBrandName`, `legalName?`, `h1Title`
- descriptions: `shortDescription`, `fullDescription`
- media: `logo*`, `coverImage*`
- trust/rating: `isVerified`, `verificationLevel?`, `ratingState`, `ratingAvg?`, `ratingCount?`
- business model: `companyRole`, `foundedYear?`, `yearsOnMarketLabel?`
- geo/contact: `headquartersCountry`, `headquartersCity?`, `websiteUrl?`, `profileUrl`, `primaryContactMode`, `inquiryUrl`
- expertise: `categories[]`, `capabilities[]`, `applications[]`, `materials[]`, `coatings[]`, `refrigerantsSupported?[]`
- delivery/commercial: `serviceRegions[]`, `responseSpeedLabel?`, `leadTimeLabel?`, `stockMode?`, `minimumOrderLabel?`
- project fit: `supportsOEM?`, `supportsRetrofit?`, `supportsReplacementBySample?`
- proof: `documentsAvailable[]`, `caseStudiesCount?`, `standardProductsCount?`
- advanced: `drawingSupport?`, `passportAndTestDocs?`, `engineeringSupportLabel?`, `productionCapacityLabel?`, `exportExperienceLabel?`

### 4) Standard product fields

Entity: `CompanyStandardProduct`

Card-level product fields:
- `id`, `companyId`, `slug`, `title`, `shortTitle?`
- `shortDescription`
- `imageUrl`, `imageAlt`
- `productFamily`, `productType`, `categorySlug`
- `applicationLabels[]`, `mediaTypeLabels[]`
- `availabilityMode`
- `priceMode`
- `inquiryUrl`
- `isVisible`

HVAC technical extensions:
- `tubeDiameterMm?`, `finPitchLabel?`, `rowsLabel?`, `coilDepthLabel?`, `dimensionsLabel?`
- `connectionTypeLabel?`, `maxWorkingPressureLabel?`
- `compatibleFluids?[]`, `refrigerantsSupported?[]`, `coatings?[]`
- `frameMaterialLabel?`, `usageContext?[]`
- `customSizeAvailable?`, `retrofitAvailable?`, `documentsAvailable?[]`

Commercial extensions:
- `leadTimeLabel?`, `moqLabel?`, `deliveryRegions?[]`, `requestPackageLabel?`
- `featuredInProfile?`, `featuredRank?`

### 5) Validation rules

- `name`, `slug`, `primaryImageUrl`, `primaryImageAlt`, `shortDescription`, `country`, `profileUrl` are required
- `companyRole` is strict enum
- `isVerified` is boolean
- `capabilities` max 8 in data, max 4 in UI
- `ratingAvg` and `ratingCount` are displayed only as a pair
- negative `standardProductsCount` is forbidden
- no fake star rating without reviews

### 6) Fallback rules

- no rating pair:
  - `ratingState = new` -> "Новый профиль"
  - otherwise -> "Без отзывов пока"
- no logo -> use `primaryImage`
- no city -> show country only
- no `standardProductsCount` -> hide block
- no capabilities -> show `categoryRelevanceLabel`

### 7) Admin override fields

Admin entity fields:
- `companyId`, `categorySlug`
- visibility and placement: `isVisible`, `isFeatured`, `featuredRank`, `manualSortOrder`
- moderation: `approvedForCategory`, `moderationStatus`
- UI controls: `trustBadgesEnabled[]`, `capabilityTagsEnabled[]`, `hideRating`, `hideLocation`
- content overrides: `overrideCardDescription?`, `overrideCategoryLabel?`, `overridePrimaryImage?`
- internal: `notesInternal?`

## PR-1 Scope

Render only on category card:
- image, role, verified, short description, geography, rating state, capabilities (max 4), standard products count, profile CTA

Prepare in types/mock data (without mandatory PR-1 display):
- `supportsOEM`, `supportsRetrofit`, `supportsReplacementBySample`
- `hasCertificates`, `hasTechnicalDocs`
- `applications`, `materials`, `coatings`
- `exportRegions`, `leadTimeLabel`, `stockMode`, `profileCompletenessScore`
