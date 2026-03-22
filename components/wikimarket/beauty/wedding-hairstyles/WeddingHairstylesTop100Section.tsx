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
          <p className={styles.kicker}>������� �������</p>
          <h2>Top 100 ��������� ��������</h2>
          <p>
            ������� ����� ����� �������������� ��������� ������, ����� ���� ������ �������� ������, �����, ���������� �
            ��������� � ����� ��� ������������ � ����� ��������.
          </p>
        </div>

        <div className={styles.liveCounter}>
          <strong>{items.length}</strong>
          <span>{hasFilters ? `���������� �������� �� ${totalCount}` : `�������� � �������� �� ${totalCount}`}</span>
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
            �������� �������
          </button>
        </div>
      ) : null}

      {items.length > 0 ? (
        <WeddingHairstylesSliderRail items={items} />
      ) : (
        <div className={styles.emptyState}>
          <h3>���������� �������� ���� ���</h3>
          <p>���������� �������� ������ ��� ������� ������� ������ � ����� ������� ���������.</p>
        </div>
      )}

      <div className={styles.bridgeCard}>
        <div>
          <h3>{bridgeTitle}</h3>
          <p>{bridgeText}</p>
        </div>
        <a className={styles.ctaPrimary} href={bridgeHref}>
          �������� ��������
        </a>
      </div>

      <div className={styles.indexBlock}>
        <div>
          <h3>������ ������ ���� 100 ������</h3>
          <p>���� ������ ����������� ������� �� ���������, �������� ������ ���� � ���������� ����� � ������ ��������.</p>
        </div>

        <details className={styles.indexDisclosure}>
          <summary className={styles.indexSummary}>������� ������ ������ ������</summary>

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
