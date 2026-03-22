"use client";

import Link from "next/link";

import type { ResolvedWeddingHairstyleRecord } from "./weddingHairstylesTop100Data";
import { getWeddingHairstylesGroupedByCategory } from "./weddingHairstylesTop100Data";
import WeddingHairstylesSliderRail from "./WeddingHairstylesSliderRail";
import styles from "./WeddingHairstylesTop100Section.module.css";

type AppliedFilter = {
  id: string;
  category: string;
  label: string;
};

type WeddingHairstylesTop100SectionProps = {
  items: ResolvedWeddingHairstyleRecord[];
  totalCount: number;
  appliedFilters: AppliedFilter[];
  onClearFilters: () => void;
  bridgeTitle: string;
  bridgeText: string;
  bridgeHref: string;
};

const TOP_100_COPY = {
  kicker: "\u0413\u043b\u0430\u0432\u043d\u0430\u044f \u0432\u0438\u0442\u0440\u0438\u043d\u0430",
  heading: "Top 100 \u0441\u0432\u0430\u0434\u0435\u0431\u043d\u044b\u0445 \u043f\u0440\u0438\u0447\u0435\u0441\u043e\u043a",
  intro:
    "\u0421\u043e\u0431\u0440\u0430\u043b\u0438 \u0437\u0434\u0435\u0441\u044c \u0441\u0430\u043c\u044b\u0435 \u0432\u043e\u0441\u0442\u0440\u0435\u0431\u043e\u0432\u0430\u043d\u043d\u044b\u0435 \u0441\u0432\u0430\u0434\u0435\u0431\u043d\u044b\u0435 \u043e\u0431\u0440\u0430\u0437\u044b, \u0447\u0442\u043e\u0431\u044b \u0431\u044b\u043b\u043e \u0443\u0434\u043e\u0431\u043d\u043e \u0441\u0440\u0430\u0432\u043d\u0438\u0442\u044c \u0441\u0438\u043b\u0443\u044d\u0442, \u043e\u0431\u044a\u0435\u043c, \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 \u0438 \u0441\u043e\u0447\u0435\u0442\u0430\u043d\u0438\u0435 \u0441 \u0444\u0430\u0442\u043e\u0439 \u0438\u043b\u0438 \u0430\u043a\u0441\u0435\u0441\u0441\u0443\u0430\u0440\u0430\u043c\u0438 \u0432 \u043e\u0434\u043d\u043e\u043c \u043a\u0430\u0442\u0430\u043b\u043e\u0433\u0435.",
  filteredCount: "\u043f\u043e\u0434\u0445\u043e\u0434\u044f\u0449\u0438\u0445 \u043a\u0430\u0440\u0442\u043e\u0447\u0435\u043a \u0438\u0437",
  totalCount: "\u043a\u0430\u0440\u0442\u043e\u0447\u0435\u043a \u0432 \u043f\u043e\u0434\u0431\u043e\u0440\u043a\u0435 \u0438\u0437",
  clearFilters: "\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c \u0444\u0438\u043b\u044c\u0442\u0440\u044b",
  emptyTitle: "\u041f\u043e\u0434\u0445\u043e\u0434\u044f\u0449\u0438\u0445 \u043a\u0430\u0440\u0442\u043e\u0447\u0435\u043a \u043f\u043e\u043a\u0430 \u043d\u0435\u0442",
  emptyText:
    "\u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u043e\u0441\u043b\u0430\u0431\u0438\u0442\u044c \u0444\u0438\u043b\u044c\u0442\u0440 \u0438\u043b\u0438 \u043e\u0442\u043a\u0440\u044b\u0442\u044c \u0431\u044b\u0441\u0442\u0440\u044b\u0439 \u043f\u0440\u0435\u0441\u0435\u0442 \u0441 \u0431\u043e\u043b\u0435\u0435 \u0448\u0438\u0440\u043e\u043a\u0438\u043c \u0441\u0446\u0435\u043d\u0430\u0440\u0438\u0435\u043c.",
  mastersCta: "\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u043c\u0430\u0441\u0442\u0435\u0440\u043e\u0432",
  indexTitle: "\u041f\u043e\u043b\u043d\u044b\u0439 \u0441\u043f\u0438\u0441\u043e\u043a \u0432\u0441\u0435\u0445 100 \u0441\u0442\u0438\u043b\u0435\u0439",
  indexText:
    "\u0415\u0441\u043b\u0438 \u0445\u043e\u0442\u0438\u0442\u0435 \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u043a\u0430\u0442\u0430\u043b\u043e\u0433 \u043f\u043e \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u044f\u043c, \u043e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 \u0441\u043f\u0438\u0441\u043e\u043a \u043d\u0438\u0436\u0435 \u0438 \u043f\u0435\u0440\u0435\u0445\u043e\u0434\u0438\u0442\u0435 \u0441\u0440\u0430\u0437\u0443 \u043a \u043d\u0443\u0436\u043d\u043e\u0439 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435.",
  openIndex: "\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043f\u043e\u043b\u043d\u044b\u0439 \u0441\u043f\u0438\u0441\u043e\u043a \u0441\u0442\u0438\u043b\u0435\u0439",
};

export default function WeddingHairstylesTop100Section({
  items,
  totalCount,
  appliedFilters,
  onClearFilters,
  bridgeTitle,
  bridgeText,
  bridgeHref,
}: WeddingHairstylesTop100SectionProps) {
  const groupedRegistry = getWeddingHairstylesGroupedByCategory();
  const hasFilters = appliedFilters.length > 0;

  return (
    <section id="top-100-hairstyles" className={styles.section}>
      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <p className={styles.kicker}>{TOP_100_COPY.kicker}</p>
          <h2>{TOP_100_COPY.heading}</h2>
          <p>{TOP_100_COPY.intro}</p>
        </div>

        <div className={styles.liveCounter}>
          <strong>{items.length}</strong>
          <span>
            {hasFilters ? `${TOP_100_COPY.filteredCount} ${totalCount}` : `${TOP_100_COPY.totalCount} ${totalCount}`}
          </span>
        </div>
      </div>

      {hasFilters ? (
        <div className={styles.appliedFilters} aria-live="polite">
          <ul className={styles.appliedFiltersList}>
            {appliedFilters.map((filter) => (
              <li key={filter.id} className={styles.appliedFilterChip}>
                <span>{filter.category}:</span> {filter.label}
              </li>
            ))}
          </ul>

          <button type="button" className={`${styles.ctaSecondary} ${styles.clearAction}`} onClick={onClearFilters}>
            {TOP_100_COPY.clearFilters}
          </button>
        </div>
      ) : null}

      {items.length > 0 ? (
        <WeddingHairstylesSliderRail items={items} />
      ) : (
        <div className={styles.emptyState}>
          <h3>{TOP_100_COPY.emptyTitle}</h3>
          <p>{TOP_100_COPY.emptyText}</p>
        </div>
      )}

      <div className={styles.bridgeCard}>
        <div>
          <h3>{bridgeTitle}</h3>
          <p>{bridgeText}</p>
        </div>
        <a className={styles.ctaPrimary} href={bridgeHref}>
          {TOP_100_COPY.mastersCta}
        </a>
      </div>

      <div className={styles.indexBlock}>
        <div>
          <h3>{TOP_100_COPY.indexTitle}</h3>
          <p>{TOP_100_COPY.indexText}</p>
        </div>

        <details className={styles.indexDisclosure}>
          <summary className={styles.indexSummary}>{TOP_100_COPY.openIndex}</summary>

          <div className={styles.indexGrid}>
            {groupedRegistry.map((group) => (
              <section key={group.category} className={styles.indexGroup} aria-label={`${group.label} wedding hairstyles`}>
                <h4>{group.label}</h4>
                <ul className={styles.indexList}>
                  {group.items.map((item) => (
                    <li key={item.slug}>
                      <Link className={styles.indexLink} href={item.detailHref} prefetch={false}>
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}