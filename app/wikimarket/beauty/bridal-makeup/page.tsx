import type { Metadata } from "next";
import Script from "next/script";

import BridalMakeupPage from "../../../../components/wikimarket/beauty/bridal-makeup/BridalMakeupPage";
import { bridalMakeupPageData } from "../../../../components/wikimarket/beauty/bridal-makeup/data";

const SITE_URL = "https://upgradefor.com";

const canonicalPath = bridalMakeupPageData.pageMeta.canonicalPath;
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
      name: "Свадебный макияж",
      item: canonicalUrl,
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: bridalMakeupPageData.faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export const metadata: Metadata = {
  title: bridalMakeupPageData.pageMeta.title,
  description: bridalMakeupPageData.pageMeta.description,
  alternates: {
    canonical: canonicalPath,
  },
};

export default function Page() {
  return (
    <>
      <Script id="bridal-makeup-breadcrumb-jsonld" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify(breadcrumbJsonLd)}
      </Script>
      <Script id="bridal-makeup-faq-jsonld" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify(faqJsonLd)}
      </Script>
      <BridalMakeupPage />
    </>
  );
}




