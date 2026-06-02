import type { Metadata } from "next";

import WeddingHairstylesPage from "../../../../components/wikimarket/beauty/wedding-hairstyles/WeddingHairstylesPage";
import { weddingHairstylesPageData } from "../../../../components/wikimarket/beauty/wedding-hairstyles/data";
import { getWeddingHairstyleDisplayTitle } from "../../../../components/wikimarket/beauty/wedding-hairstyles/weddingHairstylesDisplayText";
import { weddingHairstylesTop100Registry } from "../../../../components/wikimarket/beauty/wedding-hairstyles/weddingHairstylesTop100Data";

const SITE_URL = "https://upgradefor.com";

const canonicalPath = weddingHairstylesPageData.pageMeta.canonicalPath;
const canonicalUrl = `${SITE_URL}${canonicalPath}`;
const ogImageUrl = `${SITE_URL}/assets/media/wikimarket/beauty/wedding-hairstyles/upgr-wedding-hairstyles-hero-editorial-bride.webp`;

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Главная",
      item: `${SITE_URL}/`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "WikiMarket",
      item: `${SITE_URL}/wikimarket/categories`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Красота",
      item: `${SITE_URL}/wikimarket/categories`,
    },
    {
      "@type": "ListItem",
      position: 4,
      name: weddingHairstylesPageData.pageMeta.h1,
      item: canonicalUrl,
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: weddingHairstylesPageData.faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const top100ItemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Top 100 свадебных причесок",
  numberOfItems: weddingHairstylesTop100Registry.length,
  itemListElement: weddingHairstylesTop100Registry.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: getWeddingHairstyleDisplayTitle(item),
    url: `${SITE_URL}${item.detailHref}`,
  })),
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: weddingHairstylesPageData.pageMeta.title,
  description: weddingHairstylesPageData.pageMeta.description,
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: weddingHairstylesPageData.pageMeta.title,
    description: weddingHairstylesPageData.pageMeta.description,
    url: canonicalUrl,
    siteName: "WikiMarket",
    type: "website",
    images: [
      {
        url: ogImageUrl,
        width: 1600,
        height: 1600,
        alt: "Свадебная прическа невесты",
      },
    ],
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ hairstyle?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const activeHairstyleKey = Array.isArray(resolvedSearchParams?.hairstyle)
    ? resolvedSearchParams.hairstyle[0]
    : resolvedSearchParams?.hairstyle;

  return (
    <>
      <script
        id="wedding-hairstyles-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        id="wedding-hairstyles-faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        id="wedding-hairstyles-top100-itemlist-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(top100ItemListJsonLd) }}
      />
      <WeddingHairstylesPage initialHairstyleKey={activeHairstyleKey} />
    </>
  );
}
