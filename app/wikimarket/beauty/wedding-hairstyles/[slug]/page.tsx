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
              <strong>Изображение обновляется</strong>
              <p>Карточка стиля уже доступна. Одобренное изображение появится здесь автоматически после публикации.</p>
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
              <p className={styles.factLabel}>Семья стиля</p>
              <p className={styles.factValue}>{hairstyle.categoryLabel}</p>
            </article>
            <article className={styles.factCard}>
              <p className={styles.factLabel}>Лучше для длины</p>
              <p className={styles.factValue}>{hairstyle.hairLengthNote}</p>
            </article>
            <article className={styles.factCard}>
              <p className={styles.factLabel}>Фактура и подготовка</p>
              <p className={styles.factValue}>{hairstyle.textureNote}</p>
            </article>
            <article className={styles.factCard}>
              <p className={styles.factLabel}>Что сказать мастеру</p>
              <p className={styles.factValue}>
                Укажите стиль {hairstyle.title}, желаемую стойкость и покажите ракурс, где прическа должна читаться лучше всего.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>На что обратить внимание</h2>
        <div className={styles.noteGrid}>
          <article className={styles.noteCard}>
            <h3>Фата и аксессуары</h3>
            <p>Заранее проверьте точку крепления и не перегружайте верх украшениями, чтобы сама прическа оставалась главным объектом.</p>
          </article>
          <article className={styles.noteCard}>
            <h3>Стойкость по таймингу</h3>
            <p>Если день длинный, заранее обсудите запас по фиксации, влажность локации и момент, когда образ должен выглядеть идеально.</p>
          </article>
          <article className={styles.noteCard}>
            <h3>Фото и лучший ракурс</h3>
            <p>Попросите мастера показать стиль в полуоборота или semi-side ракурсе, где видны конструкция, объем и линия у шеи.</p>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Похожие стили</h2>
          <p>Соседние варианты внутри той же семьи помогают сравнить силуэт, степень гладкости и работу с аксессуарами.</p>
        </div>

        <div className={styles.relatedGrid}>
          {relatedStyles.map((item) => (
            <article key={item.slug} className={styles.relatedCard}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <Link href={item.detailHref} prefetch={false}>
                Открыть карточку
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
