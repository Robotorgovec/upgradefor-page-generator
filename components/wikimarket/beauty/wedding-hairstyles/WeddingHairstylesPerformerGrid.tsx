"use client";

import { useMemo, useState } from "react";

import styles from "./WeddingHairstylesPage.module.css";
import WeddingHairstylesIcon, { type WeddingHairstylesIconName } from "./WeddingHairstylesIcon";
import type { WeddingHairstylesPageData } from "./data";

type WeddingHairstylesPerformerGridProps = {
  section: WeddingHairstylesPageData["performersSection"];
};

const PERFORMER_IMAGES: Record<
  WeddingHairstylesPageData["performersSection"]["performers"][number]["id"],
  { src: string; alt: string }
> = {
  "performer-template-a": {
    src: "/assets/media/wikimarket/beauty/wedding-hairstyles/upgr-wedding-hairstylist-private-master-portrait.webp",
    alt: "Private bridal hairstylist portrait",
  },
  "performer-template-b": {
    src: "/assets/media/wikimarket/beauty/wedding-hairstyles/upgr-wedding-hairstylist-premium-salon-portrait.webp",
    alt: "Premium salon bridal hairstylist",
  },
  "performer-template-c": {
    src: "/assets/media/wikimarket/beauty/wedding-hairstyles/upgr-wedding-hairstylist-mobile-bridal-service.webp",
    alt: "Mobile bridal hairstylist service",
  },
};

const PERFORMER_TITLE_ICONS: Record<
  WeddingHairstylesPageData["performersSection"]["performers"][number]["id"],
  WeddingHairstylesIconName
> = {
  "performer-template-a": "private-master",
  "performer-template-b": "premium-salon",
  "performer-template-c": "mobile-service",
};

export default function WeddingHairstylesPerformerGrid({ section }: WeddingHairstylesPerformerGridProps) {
  const [activeFilter, setActiveFilter] = useState<WeddingHairstylesPageData["performersSection"]["filters"][number]["id"]>(
    "all",
  );

  const filteredPerformers = useMemo(() => {
    if (activeFilter === "all") return section.performers;
    return section.performers.filter((performer) => performer.tags.includes(activeFilter));
  }, [activeFilter, section.performers]);

  return (
    <section id="performers" className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>{section.title}</h2>
        <p>{section.subtitle}</p>
      </div>

      <p className={styles.performerDisclaimer}>{section.disclaimer}</p>

      <nav className={styles.filterBar} aria-label="Фильтры исполнителей">
        {section.filters.map((filter) => {
          const isActive = activeFilter === filter.id;

          return (
            <button
              key={filter.id}
              type="button"
              className={`${styles.filterChip} ${isActive ? styles.filterChipActive : ""}`}
              aria-pressed={isActive}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          );
        })}
      </nav>

      <div className={styles.performerGrid}>
        {filteredPerformers.map((performer) => {
          const image = PERFORMER_IMAGES[performer.id];
          const titleIcon = PERFORMER_TITLE_ICONS[performer.id];

          return (
            <article key={performer.id} className={styles.performerCard} id={performer.id}>
              <figure className={styles.performerImageSlot}>
                <img
                  className={styles.performerImage}
                  src={image.src}
                  alt={image.alt}
                  width={1200}
                  height={1500}
                  loading="lazy"
                  decoding="async"
                />
              </figure>

              <header className={styles.performerHeader}>
                <div>
                  <h3 className={`${styles.performerName} ${styles.headingIconLabel}`}>
                    <WeddingHairstylesIcon name={titleIcon} size="inline" />
                    <span className={styles.iconLabelText}>{performer.displayName}</span>
                  </h3>
                  <p className={styles.performerMeta}>{performer.cityLabel}</p>
                </div>
                {performer.premiumLabel ? <p className={styles.premiumBadge}>{performer.premiumLabel}</p> : null}
              </header>

              <ul className={styles.performerFacts}>
                <li>
                  <span>Формат:</span> {performer.workFormat}
                </li>
                <li>
                  <span>Специализация:</span> {performer.specialization}
                </li>
                <li>
                  <span>Выезд / студия:</span> {performer.serviceModes}
                </li>
                <li>
                  <span>Репетиция:</span> {performer.trialLabel}
                </li>
                <li>
                  <span>Цена:</span> {performer.priceFromLabel}
                </li>
                <li>
                  <span>Ответ:</span> {performer.responseTimeLabel}
                </li>
                <li>
                  <span>Доступность:</span> {performer.availabilityLabel}
                </li>
              </ul>

              <div className={styles.performerStrengths}>
                <h4>Сильные стороны</h4>
                <ul>
                  {performer.strengths.map((strength) => (
                    <li key={strength}>{strength}</li>
                  ))}
                </ul>
              </div>

              <a className={`${styles.btn} ${styles.btnPrimary}`} href={performer.ctaHref}>
                {performer.ctaLabel}
              </a>
            </article>
          );
        })}
      </div>

      {filteredPerformers.length === 0 ? (
        <p className={styles.emptyFilterState}>
          По выбранному фильтру карточки пока не показаны. Оставьте заявку, чтобы получить подбор под ваши параметры.
        </p>
      ) : null}

      <div className={styles.inlineCta}>
        <h3>{section.compareCta.title}</h3>
        <p>{section.compareCta.text}</p>
        <a className={`${styles.btn} ${styles.btnSecondary}`} href={section.compareCta.href}>
          {section.compareCta.buttonLabel}
        </a>
      </div>
    </section>
  );
}