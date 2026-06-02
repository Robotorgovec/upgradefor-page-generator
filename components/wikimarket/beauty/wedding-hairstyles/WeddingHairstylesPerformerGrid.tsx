"use client";

import { useEffect, useMemo, useState } from "react";

import styles from "./WeddingHairstylesPage.module.css";
import type { PerformerTag, WeddingHairstylesPageData } from "./data";
import { getWeddingHairstyleDisplayTitle } from "./weddingHairstylesDisplayText";
import { getWeddingHairstyleByFilterKey, getWeddingHairstyleBySlug } from "./weddingHairstylesTop100Data";
import type { WeddingHairstyleCategory } from "./weddingHairstylesTop100Data";

type WeddingHairstylesPerformerGridProps = {
  section: WeddingHairstylesPageData["performersSection"];
  hairstyleKey?: string;
};

type PerformerFilterId = "all" | PerformerTag;

const PERFORMER_IMAGES: Record<
  WeddingHairstylesPageData["performersSection"]["performers"][number]["id"],
  { src: string; alt: string }
> = {
  "performer-template-a": {
    src: "/assets/media/wikimarket/beauty/wedding-hairstyles/upgr-wedding-hairstylist-private-master-portrait.webp",
    alt: "Демо-портрет частного мастера свадебных причесок",
  },
  "performer-template-b": {
    src: "/assets/media/wikimarket/beauty/wedding-hairstyles/upgr-wedding-hairstylist-premium-salon-portrait.webp",
    alt: "Демо-портрет студии свадебных причесок",
  },
  "performer-template-c": {
    src: "/assets/media/wikimarket/beauty/wedding-hairstyles/upgr-wedding-hairstylist-mobile-bridal-service.webp",
    alt: "Демо-портрет выездной команды свадебных причесок",
  },
};

function resolveHairstyleFilter(value?: string | null) {
  if (!value) {
    return null;
  }

  return getWeddingHairstyleByFilterKey(value) ?? getWeddingHairstyleBySlug(value) ?? null;
}

function buildPerformerRequestHref(
  baseHref: string,
  hairstyleKey: string | null,
  activeFilter: PerformerFilterId,
) {
  const [hrefWithoutHash, hash] = baseHref.split("#");
  const params = new URLSearchParams();

  params.set("source", "wedding-hairstyle-masters");

  if (hairstyleKey) {
    params.set("hairstyle", hairstyleKey);
  }

  if (activeFilter !== "all") {
    params.set("masterFilter", activeFilter);
  }

  const separator = hrefWithoutHash.includes("?") ? "&" : "?";
  const hashSuffix = hash ? `#${hash}` : "";

  return `${hrefWithoutHash}${separator}${params.toString()}${hashSuffix}`;
}

export default function WeddingHairstylesPerformerGrid({
  section,
  hairstyleKey,
}: WeddingHairstylesPerformerGridProps) {
  const [activeFilter, setActiveFilter] = useState<PerformerFilterId>("all");
  const sectionTitleId = "performers-title";
  const performerResultsId = "performer-results";

  const activeHairstyle = useMemo(() => resolveHairstyleFilter(hairstyleKey), [hairstyleKey]);
  const activeHairstyleTitle = activeHairstyle ? getWeddingHairstyleDisplayTitle(activeHairstyle) : null;
  const activeFilterLabel = section.filters.find((filter) => filter.id === activeFilter)?.label ?? "Все";
  const performerRequestTitle = activeHairstyleTitle
    ? `Собрать короткий список под «${activeHairstyleTitle}»`
    : section.compareCta.title;

  const styleMatchedPerformers = useMemo(() => {
    if (!activeHairstyle) {
      return section.performers;
    }

    return section.performers.filter((performer) => {
      const matchesExplicitKey = (performer.hairstyleKeys ?? []).includes(activeHairstyle.mastersFilterKey);
      const matchesCategory = ((performer.hairstyleCategories as readonly WeddingHairstyleCategory[] | undefined) ?? [])
        .includes(activeHairstyle.category);

      return matchesExplicitKey || matchesCategory;
    });
  }, [activeHairstyle, section.performers]);

  const filterCounts = useMemo(
    () =>
      section.filters.reduce<Record<PerformerFilterId, number>>((acc, filter) => {
        acc[filter.id] =
          filter.id === "all"
            ? styleMatchedPerformers.length
            : styleMatchedPerformers.filter((performer) =>
                (performer.tags as readonly PerformerTag[]).includes(filter.id),
              ).length;

        return acc;
      }, {} as Record<PerformerFilterId, number>),
    [section.filters, styleMatchedPerformers],
  );

  useEffect(() => {
    if (activeFilter !== "all" && (filterCounts[activeFilter] ?? 0) === 0) {
      setActiveFilter("all");
    }
  }, [activeFilter, filterCounts]);

  const filteredPerformers = useMemo(
    () =>
      activeFilter === "all"
        ? styleMatchedPerformers
        : styleMatchedPerformers.filter((performer) =>
            (performer.tags as readonly PerformerTag[]).includes(activeFilter),
          ),
    [activeFilter, styleMatchedPerformers],
  );
  const performerRequestHref = buildPerformerRequestHref(
    section.compareCta.href,
    activeHairstyle?.mastersFilterKey ?? null,
    activeFilter,
  );

  return (
    <section
      id="performers"
      className={styles.section}
      data-focus-target="masters"
      tabIndex={-1}
      aria-labelledby={sectionTitleId}
    >
      <div id="wedding-hairstyle-masters" className={styles.anchorTarget} aria-hidden="true" />

      <div className={styles.sectionHeader}>
        <h2 id={sectionTitleId}>{section.title}</h2>
        <p>{section.subtitle}</p>
      </div>

      <p className={styles.performerDisclaimer}>{section.disclaimer}</p>

      {activeHairstyle ? (
        <div
          className={styles.performerFilterSummary}
          aria-labelledby="performer-style-summary-title"
          aria-live="polite"
        >
          <div>
            <p className={styles.performerFilterEyebrow}>Подобрано под стиль</p>
            <h3 id="performer-style-summary-title">{getWeddingHairstyleDisplayTitle(activeHairstyle)}</h3>
            <p>
              Сейчас показаны мастера, которые чаще работают с этим направлением или его ближайшей категорией. Ниже можно
              дополнительно отфильтровать их по выезду, пробному образу и времени сборов.
            </p>
          </div>
          <a className={styles.inlineLink} href="#top-100-hairstyles">
            Сменить стиль
          </a>
        </div>
      ) : null}

      <nav className={styles.filterBar} aria-label={section.filtersAriaLabel}>
        {section.filters.map((filter) => {
          const isActive = activeFilter === filter.id;
          const resultCount = filterCounts[filter.id] ?? 0;
          const isDisabled = !isActive && resultCount === 0;

          return (
            <button
              key={filter.id}
              type="button"
              className={`${styles.filterChip} ${isActive ? styles.filterChipActive : ""} ${
                isDisabled ? styles.filterChipDisabled : ""
              }`}
              aria-pressed={isActive}
              aria-controls={performerResultsId}
              aria-label={
                isDisabled
                  ? `Нет профилей: ${filter.label}`
                  : `${isActive ? "Активный фильтр" : "Показать"}: ${filter.label}, ${resultCount} профилей`
              }
              disabled={isDisabled}
              onClick={() => setActiveFilter(filter.id)}
            >
              <span>{filter.label}</span>
              <strong>{resultCount}</strong>
            </button>
          );
        })}
      </nav>

      <div className={styles.performerMatchPanel} aria-live="polite">
        <div className={styles.performerMatchCopy}>
          <p className={styles.performerMatchEyebrow}>
            {activeHairstyle ? "Выдача под выбранный стиль" : "База исполнителей"}
          </p>
          <h3>
            {activeHairstyleTitle
              ? `Показаны мастера под «${activeHairstyleTitle}»`
              : "Сравнение начнется с общего списка мастеров"}
          </h3>
          <p>
            {activeHairstyle
              ? "Мы оставляем в выдаче тех, кто совпадает с конкретным типом прически или ближайшей категорией стиля. Фильтры сверху уточняют формат работы."
              : "Выберите стиль в Top 100 или пресет в подборе, чтобы список мастеров стал контекстным."}
          </p>
        </div>

        <div className={styles.performerMatchMetrics} aria-label="Статус выдачи исполнителей">
          <span>
            <strong>{filteredPerformers.length}</strong>
            подходящих
          </span>
          <span>
            <strong>{activeFilterLabel}</strong>
            фильтр
          </span>
          <span>
            <strong>{activeHairstyleTitle ?? "Все стили"}</strong>
            стиль
          </span>
        </div>
      </div>

      <div id={performerResultsId} className={styles.performerGrid} aria-live="polite">
        {filteredPerformers.map((performer) => {
          const image = PERFORMER_IMAGES[performer.id];
          const matchesExplicitKey = activeHairstyle
            ? (performer.hairstyleKeys ?? []).includes(activeHairstyle.mastersFilterKey)
            : false;
          const matchesCategory = activeHairstyle
            ? ((performer.hairstyleCategories as readonly WeddingHairstyleCategory[] | undefined) ?? []).includes(
                activeHairstyle.category,
              )
            : false;
          const fitLabel = activeHairstyle
            ? matchesExplicitKey
              ? "Точное совпадение со стилем"
              : matchesCategory
                ? "Совпадает категория стиля"
                : "Широкий профиль"
            : "Базовый профиль";
          const fitText = activeHairstyleTitle
            ? matchesExplicitKey
              ? `В профиле указан опыт с направлением «${activeHairstyleTitle}».`
              : `Профиль подходит по близкой категории для «${activeHairstyleTitle}».`
            : "После выбора стиля здесь появится объяснение соответствия.";

          return (
            <article
              key={performer.id}
              className={styles.performerCard}
              id={performer.id}
              aria-labelledby={`${performer.id}-title`}
            >
              <figure className={styles.performerImageSlot}>
                <span className={styles.performerImageFallback} aria-hidden="true">
                  Демо-портрет мастера
                </span>
                <img
                  className={styles.performerImage}
                  src={image.src}
                  alt={image.alt}
                  width={1200}
                  height={1500}
                  loading="eager"
                  decoding="async"
                />
              </figure>

              <header className={styles.performerHeader}>
                <div>
                  <h3 id={`${performer.id}-title`} className={styles.performerName}>
                    {performer.displayName}
                  </h3>
                  <p className={styles.performerMeta}>{performer.cityLabel}</p>
                </div>
                {performer.premiumLabel ? <p className={styles.premiumBadge}>{performer.premiumLabel}</p> : null}
              </header>

              <div className={styles.performerFit}>
                <span>{fitLabel}</span>
                <p>{fitText}</p>
              </div>

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
                  <span>Пробный образ:</span> {performer.trialLabel}
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
                <h4>{section.strengthsTitle}</h4>
                <ul>
                  {performer.strengths.map((strength) => (
                    <li key={strength}>{strength}</li>
                  ))}
                </ul>
              </div>

              <a
                className={`${styles.btn} ${styles.btnPrimary}`}
                href={performer.ctaHref}
                aria-label={`${performer.ctaLabel}: ${performer.displayName}`}
              >
                {performer.ctaLabel}
              </a>
            </article>
          );
        })}
      </div>

      {filteredPerformers.length === 0 ? (
        <p className={styles.emptyFilterState} role="status">
          {section.emptyState}
        </p>
      ) : null}

      <div className={styles.performerRequestPanel} aria-labelledby="performer-request-title">
        <div className={styles.performerRequestCopy}>
          <p className={styles.performerRequestEyebrow}>Финальный шаг</p>
          <h3 id="performer-request-title">{performerRequestTitle}</h3>
          <p>
            {activeHairstyleTitle
              ? `Передадим в заявку стиль «${activeHairstyleTitle}», активный фильтр «${activeFilterLabel}» и текущий контекст выдачи, чтобы сравнение началось без повторного заполнения.`
              : section.compareCta.text}
          </p>
          <div className={styles.performerRequestActions}>
            <a className={`${styles.btn} ${styles.btnPrimary}`} href={performerRequestHref}>
              {section.compareCta.buttonLabel}
            </a>
            <a className={`${styles.btn} ${styles.btnSecondary}`} href="#guided-selection">
              Уточнить параметры
            </a>
          </div>
        </div>

        <div className={styles.performerRequestDetails} aria-label="Что попадет в бриф">
          <div className={styles.performerRequestMetrics}>
            <span>
              <strong>{filteredPerformers.length}</strong>
              профилей в выдаче
            </span>
            <span>
              <strong>{activeFilterLabel}</strong>
              активный фильтр
            </span>
            <span>
              <strong>{activeHairstyleTitle ?? "Выберите стиль"}</strong>
              стиль в заявке
            </span>
          </div>

          <ol className={styles.performerRequestList}>
            <li>
              <span>01</span>
              Выбранный стиль и близкая категория
            </li>
            <li>
              <span>02</span>
              Формат мастера, выезд, пробный образ
            </li>
            <li>
              <span>03</span>
              Короткий список без лишних профилей
            </li>
          </ol>

          <p className={styles.performerRequestNote}>Без оплаты на этом шаге: сначала параметры и сравнение.</p>
        </div>
      </div>
    </section>
  );
}
