"use client";

import { useMemo, useState } from "react";

import styles from "./BridalMakeupPage.module.css";
import type { BridalMakeupPageData, PerformerTag } from "./data";

type BridalMakeupPerformerGridProps = {
  section: BridalMakeupPageData["performersSection"];
};

type PerformerFilterId = "all" | PerformerTag;

export default function BridalMakeupPerformerGrid({ section }: BridalMakeupPerformerGridProps) {
  const [activeFilter, setActiveFilter] = useState<PerformerFilterId>("all");

  const filteredPerformers = useMemo(() => {
    if (activeFilter === "all") return section.performers;
    return section.performers.filter((performer) =>
      (performer.tags as readonly PerformerTag[]).includes(activeFilter),
    );
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
        {filteredPerformers.map((performer) => (
          <article key={performer.id} className={styles.performerCard} id={performer.id}>
            <header className={styles.performerHeader}>
              <span className={styles.placeholderIcon} aria-hidden="true">
                <span className="material-symbols-outlined">styler</span>
              </span>
              <div>
                <h3 className={styles.performerName}>{performer.displayName}</h3>
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
        ))}
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

