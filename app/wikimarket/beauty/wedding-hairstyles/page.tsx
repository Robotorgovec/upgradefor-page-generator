import type { Metadata } from "next";
import Script from "next/script";

import WeddingHairstylesPage from "../../../../components/wikimarket/beauty/wedding-hairstyles/WeddingHairstylesPage";
import { weddingHairstylesPageData } from "../../../../components/wikimarket/beauty/wedding-hairstyles/data";
import { weddingHairstylesTop100Registry } from "../../../../components/wikimarket/beauty/wedding-hairstyles/weddingHairstylesTop100Data";

const SITE_URL = "https://upgradefor.com";

const canonicalPath = weddingHairstylesPageData.pageMeta.canonicalPath;
const canonicalUrl = `${SITE_URL}${canonicalPath}`;

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
  name: "Top 100 Wedding Hairstyles",
  numberOfItems: weddingHairstylesTop100Registry.length,
  itemListElement: weddingHairstylesTop100Registry.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.title,
    url: `${SITE_URL}${item.detailHref}`,
  })),
};

export const metadata: Metadata = {
  title: weddingHairstylesPageData.pageMeta.title,
  description: weddingHairstylesPageData.pageMeta.description,
  alternates: {
    canonical: canonicalPath,
  },
};

export default function Page({
  searchParams,
}: {
  searchParams?: { hairstyle?: string | string[] };
}) {
  const activeHairstyleKey = Array.isArray(searchParams?.hairstyle)
    ? searchParams.hairstyle[0]
    : searchParams?.hairstyle;

  return (
    <>
      <Script id="wedding-hairstyles-breadcrumb-jsonld" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify(breadcrumbJsonLd)}
      </Script>
      <Script id="wedding-hairstyles-faq-jsonld" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify(faqJsonLd)}
      </Script>
      <Script id="wedding-hairstyles-top100-itemlist-jsonld" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify(top100ItemListJsonLd)}
      </Script>
      <WeddingHairstylesPage initialHairstyleKey={activeHairstyleKey} />
    </>
  );
}
