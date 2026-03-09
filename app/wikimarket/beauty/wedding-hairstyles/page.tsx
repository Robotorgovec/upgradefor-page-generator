import type { Metadata } from "next";
import Script from "next/script";

import WeddingHairstylesPage from "../../../../components/wikimarket/beauty/wedding-hairstyles/WeddingHairstylesPage";
import { weddingHairstylesPageData } from "../../../../components/wikimarket/beauty/wedding-hairstyles/data";

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
      name: "Свадебные прически",
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

export const metadata: Metadata = {
  title: weddingHairstylesPageData.pageMeta.title,
  description: weddingHairstylesPageData.pageMeta.description,
  alternates: {
    canonical: canonicalPath,
  },
};

export default function Page() {
  return (
    <>
      <Script id="wedding-hairstyles-breadcrumb-jsonld" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify(breadcrumbJsonLd)}
      </Script>
      <Script id="wedding-hairstyles-faq-jsonld" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify(faqJsonLd)}
      </Script>
      <WeddingHairstylesPage />
    </>
  );
}
