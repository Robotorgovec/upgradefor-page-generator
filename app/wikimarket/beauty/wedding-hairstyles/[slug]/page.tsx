import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getResolvedWeddingHairstyleBySlug } from "../../../../../components/wikimarket/beauty/wedding-hairstyles/WeddingHairstylesTop100Assets.server";
import {
  buildWeddingHairstyleMastersHref,
  getWeddingHairstyleBySlug,
  weddingHairstylesTop100Registry,
} from "../../../../../components/wikimarket/beauty/wedding-hairstyles/weddingHairstylesTop100Data";
import styles from "./page.module.css";

const SITE_URL = "https://upgradefor.com";

export function generateStaticParams() {
  return weddingHairstylesTop100Registry.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hairstyle = getWeddingHairstyleBySlug(slug);

  if (!hairstyle) {
    return {
      title: "Wedding hairstyle not found | WikiMarket",
    };
  }

  return {
    title: `${hairstyle.title} | Wedding Hairstyles | WikiMarket`,
    description: hairstyle.description,
    alternates: {
      canonical: hairstyle.detailHref,
    },
  };
}

export default async function WeddingHairstyleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hairstyle = getResolvedWeddingHairstyleBySlug(slug);

  if (!hairstyle) {
    notFound();
  }

  const currentIndex = weddingHairstylesTop100Registry.findIndex((item) => item.slug === hairstyle.slug);
  const previousStyle = currentIndex > 0 ? weddingHairstylesTop100Registry[currentIndex - 1] : null;
  const nextStyle = currentIndex >= 0 ? weddingHairstylesTop100Registry[currentIndex + 1] ?? null : null;
  const relatedStyles = weddingHairstylesTop100Registry
    .filter((item) => item.category === hairstyle.category && item.slug !== hairstyle.slug)
    .slice(0, 3);

  const canonicalUrl = `${SITE_URL}${hairstyle.detailHref}`;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "WikiMarket",
        item: `${SITE_URL}/wikimarket/categories`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Wedding Hairstyles",
        item: `${SITE_URL}/wikimarket/beauty/wedding-hairstyles`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: hairstyle.title,
        item: canonicalUrl,
      },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: hairstyle.title,
    description: hairstyle.description,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    keywords: [hairstyle.title, hairstyle.categoryLabel, "wedding hairstyle"],
    image: hairstyle.liveImageSrc ? [`${SITE_URL}${hairstyle.liveImageSrc}`] : undefined,
  };

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <nav className={styles.breadcrumbs} aria-label="Breadcrumbs">
        <Link href="/wikimarket/beauty/wedding-hairstyles" prefetch={false}>
          Wedding Hairstyles
        </Link>
        <span>/</span>
        <span>{hairstyle.title}</span>
      </nav>

      <section className={styles.hero}>
        <div className={styles.mediaCard}>
          {hairstyle.liveImageSrc ? (
            <figure className={styles.figure}>
              <img
                className={styles.image}
                src={hairstyle.liveImageSrc}
                alt={hairstyle.imageAlt}
                width={1200}
                height={1500}
                decoding="async"
              />
            </figure>
          ) : (
            <div className={styles.placeholder}>
              <strong>Asset pending</strong>
              <p>The detail page is live now and will pick up the approved mapped file automatically once it lands locally.</p>
              <code>{hairstyle.assetFilename}</code>
            </div>
          )}
        </div>

        <div className={styles.contentCard}>
          <p className={styles.kicker}>
            {hairstyle.categoryLabel} / #{hairstyle.sortOrder}
          </p>
          <h1>{hairstyle.title}</h1>
          <p className={styles.lead}>{hairstyle.description}</p>
          <p className={styles.copy}>{hairstyle.intro}</p>

          <div className={styles.actionRow}>
            <a className={styles.primaryButton} href={buildWeddingHairstyleMastersHref(hairstyle.mastersFilterKey)}>
              Посмотреть мастеров
            </a>
            <Link className={styles.secondaryButton} href="/wikimarket/beauty/wedding-hairstyles#top-100-hairstyles" prefetch={false}>
              Назад к Top 100
            </Link>
          </div>

          <div className={styles.factGrid}>
            <article className={styles.factCard}>
              <p className={styles.factLabel}>Style family</p>
              <p className={styles.factValue}>{hairstyle.categoryLabel}</p>
            </article>
            <article className={styles.factCard}>
              <p className={styles.factLabel}>Best for length</p>
              <p className={styles.factValue}>{hairstyle.hairLengthNote}</p>
            </article>
            <article className={styles.factCard}>
              <p className={styles.factLabel}>Texture note</p>
              <p className={styles.factValue}>{hairstyle.textureNote}</p>
            </article>
            <article className={styles.factCard}>
              <p className={styles.factLabel}>Masters filter key</p>
              <p className={styles.factValue}>{hairstyle.mastersFilterKey}</p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Why this page exists</h2>
        <div className={styles.noteGrid}>
          <article className={styles.noteCard}>
            <h3>Stable slug contract</h3>
            <p>
              The route, internal links, and masters filter all stay tied to the canonical slug, while the asset mapping layer keeps
              approved filenames separate.
            </p>
          </article>
          <article className={styles.noteCard}>
            <h3>SEO-safe structure</h3>
            <p>
              The title, metadata, detail copy, and internal links are rendered as plain HTML instead of depending on client-only slider UI.
            </p>
          </article>
          <article className={styles.noteCard}>
            <h3>Filter-ready CTA</h3>
            <p>
              The masters CTA points to a reusable <code>hairstyle</code> filter contract on the main page and keeps the anchor behavior intact.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Related styles</h2>
          <p>Nearby internal links stay within the same style family and help search engines discover the rest of the registry.</p>
        </div>

        <div className={styles.relatedGrid}>
          {relatedStyles.map((item) => (
            <article key={item.slug} className={styles.relatedCard}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <Link href={item.detailHref} prefetch={false}>
                Open detail page
              </Link>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.navRow}>
        {previousStyle ? (
          <Link href={previousStyle.detailHref} prefetch={false}>
            {"<-"} {previousStyle.title}
          </Link>
        ) : (
          <span />
        )}
        {nextStyle ? (
          <Link href={nextStyle.detailHref} prefetch={false}>
            {nextStyle.title} {"->"}
          </Link>
        ) : null}
      </div>
    </main>
  );
}


