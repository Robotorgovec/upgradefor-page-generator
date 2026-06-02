"use client";

import Link from "next/link";

import {
  type ResolvedWeddingHairstyleRecord,
  type WeddingHairstyleCategory,
  weddingHairstylesTop100CategoryOrder,
} from "./weddingHairstylesTop100Data";
import {
  getWeddingHairstyleDisplayDescription,
  getWeddingHairstyleDisplayImageAlt,
  getWeddingHairstyleDisplayTitle,
} from "./weddingHairstylesDisplayText";
import WeddingHairstylesSliderRail from "./WeddingHairstylesSliderRail";
import styles from "./WeddingHairstylesTop100Section.module.css";

type AppliedFilter = {
  id: string;
  categoryId: string;
  optionId: string;
  category: string;
  label: string;
};

type WeddingHairstylesTop100SectionProps = {
  items: ResolvedWeddingHairstyleRecord[];
  allItems: ResolvedWeddingHairstyleRecord[];
  totalCount: number;
  appliedFilters: AppliedFilter[];
  onRemoveFilter: (categoryId: string) => void;
  onClearFilters: () => void;
  onOpenMasters: (hairstyleKey?: string) => void;
  bridgeTitle: string;
  bridgeText: string;
};

const TOP_100_COPY = {
  kicker: "\u0413\u043b\u0430\u0432\u043d\u0430\u044f \u0432\u0438\u0442\u0440\u0438\u043d\u0430",
  heading: "Top 100 \u0441\u0432\u0430\u0434\u0435\u0431\u043d\u044b\u0445 \u043f\u0440\u0438\u0447\u0435\u0441\u043e\u043a",
  intro:
    "Верхняя лента показывает приоритетные стили под текущий сценарий, а ниже собран полный визуальный каталог из 10 кластеров.",
  counterCatalogLabel: "Каталог",
  counterPriorityLabel: "в витрине сейчас",
  indexAvailability: "Ниже — все 100 карточек с фото, короткими ориентирами и индексируемыми ссылками на стили.",
  clearFilters: "\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c \u0444\u0438\u043b\u044c\u0442\u0440\u044b",
  emptyTitle: "\u041f\u043e\u0434\u0445\u043e\u0434\u044f\u0449\u0438\u0445 \u043a\u0430\u0440\u0442\u043e\u0447\u0435\u043a \u043f\u043e\u043a\u0430 \u043d\u0435\u0442",
  emptyText:
    "\u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u043e\u0441\u043b\u0430\u0431\u0438\u0442\u044c \u0444\u0438\u043b\u044c\u0442\u0440 \u0438\u043b\u0438 \u043e\u0442\u043a\u0440\u044b\u0442\u044c \u0431\u044b\u0441\u0442\u0440\u044b\u0439 \u043f\u0440\u0435\u0441\u0435\u0442 \u0441 \u0431\u043e\u043b\u0435\u0435 \u0448\u0438\u0440\u043e\u043a\u0438\u043c \u0441\u0446\u0435\u043d\u0430\u0440\u0438\u0435\u043c.",
  mastersCta: "\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u043c\u0430\u0441\u0442\u0435\u0440\u043e\u0432",
  indexTitle: "\u041f\u043e\u043b\u043d\u044b\u0439 \u043a\u0430\u0442\u0430\u043b\u043e\u0433 \u0432\u0441\u0435\u0445 100 \u0441\u0442\u0438\u043b\u0435\u0439",
  indexText:
    "Top 100 сгруппирован шире, чем базовый справочник из 6 SEO-групп: дополнительные кластеры помогают покрыть короткие волосы, локсы, защитные укладки и естественные кудри.",
  openIndex: "Все 100 карточек по кластерам",
  indexNavLabel: "Кластеры полного каталога Top 100",
  detailsCta: "Подробнее",
  mastersCardCta: "Мастера",
};

const PRIORITY_CARD_LIMIT = 12;
const EAGER_INDEX_CARD_LIMIT = 24;

function formatStylesCount(count: number) {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${count} стилей`;
  }

  if (lastDigit === 1) {
    return `${count} стиль`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${count} стиля`;
  }

  return `${count} стилей`;
}

function groupTop100CatalogItems(items: ResolvedWeddingHairstyleRecord[]) {
  return weddingHairstylesTop100CategoryOrder
    .map((category) => {
      const groupItems = items
        .filter((item) => item.category === category)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      return {
        category,
        label: groupItems[0]?.categoryLabel ?? category,
        items: groupItems,
      };
    })
    .filter((group): group is { category: WeddingHairstyleCategory; label: string; items: ResolvedWeddingHairstyleRecord[] } =>
      group.items.length > 0,
    );
}

function Top100IndexCard({
  item,
  eager,
  onOpenMasters,
}: {
  item: ResolvedWeddingHairstyleRecord;
  eager: boolean;
  onOpenMasters: (hairstyleKey: string) => void;
}) {
  const displayTitle = getWeddingHairstyleDisplayTitle(item);
  const titleId = `top100-index-card-${item.slug}-title`;

  return (
    <article className={styles.indexCard} aria-labelledby={titleId}>
      <Link
        className={styles.indexCardSurface}
        href={item.detailHref}
        aria-label={`Открыть стиль: ${displayTitle}`}
        prefetch={false}
      >
        <figure className={styles.indexCardImageSlot}>
          {item.liveImageSrc ? (
            <img
              className={styles.indexCardImage}
              src={item.liveImageSrc}
              alt={getWeddingHairstyleDisplayImageAlt(item)}
              width={1024}
              height={1536}
              loading={eager ? "eager" : "lazy"}
              decoding="async"
            />
          ) : null}
          <span className={styles.indexCardNumber}>#{item.sortOrder}</span>
        </figure>

        <div className={styles.indexCardBody}>
          <p className={styles.indexCardMeta}>
            {item.categoryLabel} / {item.vibeLabel}
          </p>
          <h5 id={titleId} className={styles.indexCardTitle}>
            {displayTitle}
          </h5>
          <p className={styles.indexCardText}>{getWeddingHairstyleDisplayDescription(item)}</p>
        </div>
      </Link>

      <div className={styles.indexCardActions}>
        <Link className={styles.indexCardAction} href={item.detailHref} prefetch={false}>
          {TOP_100_COPY.detailsCta}
        </Link>
        <button
          type="button"
          className={styles.indexCardAction}
          aria-label={`Показать мастеров под стиль: ${displayTitle}`}
          onClick={() => onOpenMasters(item.mastersFilterKey)}
        >
          {TOP_100_COPY.mastersCardCta}
        </button>
      </div>
    </article>
  );
}

export default function WeddingHairstylesTop100Section({
  items,
  allItems,
  totalCount,
  appliedFilters,
  onRemoveFilter,
  onClearFilters,
  onOpenMasters,
  bridgeTitle,
  bridgeText,
}: WeddingHairstylesTop100SectionProps) {
  const hasFilters = appliedFilters.length > 0;
  const priorityItems = items.slice(0, PRIORITY_CARD_LIMIT);
  const fullCatalogItems = allItems.filter((item) => item.hasLiveImage);
  const groupedRegistry = groupTop100CatalogItems(fullCatalogItems);
  const firstPriorityItem = priorityItems[0] ?? null;
  const firstPriorityTitle = firstPriorityItem ? getWeddingHairstyleDisplayTitle(firstPriorityItem) : null;
  const visibleScenarioFilters = appliedFilters.slice(0, 3).map((filter) => filter.label);
  const hiddenScenarioFilterCount = Math.max(0, appliedFilters.length - visibleScenarioFilters.length);
  const visiblePriorityTitles = priorityItems.slice(0, 3).map((item) => getWeddingHairstyleDisplayTitle(item));
  const scenarioSignalsText = hasFilters
    ? `${visibleScenarioFilters.join(", ")}${hiddenScenarioFilterCount > 0 ? `, +${hiddenScenarioFilterCount}` : ""}`
    : "Пресет или 3–5 параметров выше";
  const scenarioPriorityText =
    visiblePriorityTitles.length > 0 ? visiblePriorityTitles.join(", ") : "Появятся после выбора сценария";
  const contextualMastersCta = firstPriorityTitle ? "Мастера под первый стиль" : "Мастера под выдачу";
  const contextualMastersAriaLabel = firstPriorityTitle
    ? `Показать мастеров под стиль: ${firstPriorityTitle}`
    : "Показать мастеров под текущую выдачу Top 100";
  const sectionTitleId = "top-100-hairstyles-title";
  const scenarioTitleId = "top-100-scenario-title";
  const bridgeTitleId = "top-100-masters-bridge-title";
  const indexTitleId = "top-100-full-index-title";
  const handleContextualMastersClick = () => {
    onOpenMasters(firstPriorityItem?.mastersFilterKey);
  };

  return (
    <section id="top-100-hairstyles" className={styles.section} aria-labelledby={sectionTitleId}>
      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <p className={styles.kicker}>{TOP_100_COPY.kicker}</p>
          <h2 id={sectionTitleId}>{TOP_100_COPY.heading}</h2>
          <p>{TOP_100_COPY.intro}</p>
        </div>

        <div
          className={styles.liveCounter}
          role="status"
          aria-label={`${TOP_100_COPY.counterCatalogLabel}: ${fullCatalogItems.length} карточек с фото; ${priorityItems.length} ${TOP_100_COPY.counterPriorityLabel}`}
        >
          <strong>{fullCatalogItems.length || totalCount}</strong>
          <span>
            {TOP_100_COPY.counterCatalogLabel.toLowerCase()} / {priorityItems.length} {TOP_100_COPY.counterPriorityLabel}
          </span>
        </div>
      </div>

      <p className={styles.indexAvailability}>{TOP_100_COPY.indexAvailability}</p>

      <div className={styles.scenarioPanel} aria-label="Статус витрины Top 100" aria-labelledby={scenarioTitleId}>
        <div className={styles.scenarioPanelCopy}>
          <p className={styles.scenarioPanelKicker}>{hasFilters ? "Витрина пересчитана" : "Стартовая витрина"}</p>
          <h3 id={scenarioTitleId}>
            {hasFilters
              ? `Top 100 поднял ближайшие стили по ${appliedFilters.length} параметрам`
              : "Top 100 готов к персональному сценарию"}
          </h3>
          <p>
            {firstPriorityTitle
              ? `Первым сейчас показывается «${firstPriorityTitle}». Верхняя лента меняется сразу после пресета или ручного выбора параметров.`
              : "Выберите пресет или параметры выше, чтобы увидеть приоритетные карточки для вашего сценария."}
          </p>
        </div>

        <div className={styles.scenarioPanelStatus} aria-label="Текущий статус витрины Top 100">
          <span>
            <strong>{priorityItems.length}</strong>
            карточек в ленте
          </span>
          <span>
            <strong>{hasFilters ? appliedFilters.length : "0"}</strong>
            параметров
          </span>
          <span>
            <strong>{firstPriorityTitle ?? "Старт"}</strong>
            первый стиль
          </span>
        </div>

        <dl className={styles.scenarioReasoning} aria-label="Почему эти карточки подняты в Top 100">
          <div>
            <dt>{hasFilters ? "Сигналы сценария" : "Что запустить"}</dt>
            <dd>{scenarioSignalsText}</dd>
          </div>
          <div>
            <dt>{hasFilters ? "Верх выдачи" : "Что изменится"}</dt>
            <dd>{scenarioPriorityText}</dd>
          </div>
          <div>
            <dt>Следующий шаг</dt>
            <dd>
              {firstPriorityTitle
                ? `Откройте «${firstPriorityTitle}» или сразу сравните мастеров под этот стиль.`
                : "После выбора сценария здесь появится прямой путь к стилю и мастерам."}
            </dd>
          </div>
        </dl>

        <div className={styles.scenarioPanelActions}>
          {firstPriorityItem ? (
            <Link className={styles.scenarioAction} href={firstPriorityItem.detailHref} prefetch={false}>
              Открыть первый стиль
            </Link>
          ) : null}
          <button
            type="button"
            className={styles.scenarioAction}
            aria-label={contextualMastersAriaLabel}
            onClick={handleContextualMastersClick}
          >
            {contextualMastersCta}
          </button>
          {hasFilters ? (
            <button
              type="button"
              className={`${styles.scenarioAction} ${styles.scenarioActionMuted}`}
              aria-label="Сбросить сценарий Top 100"
              aria-controls="guided-selection"
              onClick={onClearFilters}
            >
              Сбросить сценарий
            </button>
          ) : null}
        </div>
      </div>

      {hasFilters ? (
        <div className={styles.appliedFilters} aria-live="polite">
          <ul className={styles.appliedFiltersList}>
            {appliedFilters.map((filter) => (
              <li key={filter.id}>
                <button
                  type="button"
                  className={styles.appliedFilterChip}
                  aria-label={`Убрать фильтр ${filter.category}: ${filter.label}`}
                  aria-controls="guided-selection"
                  title="Убрать фильтр"
                  onClick={() => onRemoveFilter(filter.categoryId)}
                >
                  <span>{filter.category}:</span> {filter.label}
                  <span className={styles.appliedFilterRemove} aria-hidden="true">
                    ×
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className={`${styles.ctaSecondary} ${styles.clearAction}`}
            aria-label="Сбросить фильтры Top 100 и подбора"
            aria-controls="guided-selection"
            onClick={onClearFilters}
          >
            {TOP_100_COPY.clearFilters}
          </button>
        </div>
      ) : null}

      {priorityItems.length > 0 ? (
        <WeddingHairstylesSliderRail items={priorityItems} />
      ) : (
        <div className={styles.emptyState} role="status" aria-live="polite">
          <h3>{TOP_100_COPY.emptyTitle}</h3>
          <p>{TOP_100_COPY.emptyText}</p>
        </div>
      )}

      <section className={styles.bridgeCard} aria-labelledby={bridgeTitleId}>
        <div>
          <h3 id={bridgeTitleId}>{bridgeTitle}</h3>
          <p>{bridgeText}</p>
        </div>
        <button
          type="button"
          className={styles.ctaPrimary}
          aria-label={contextualMastersAriaLabel}
          onClick={handleContextualMastersClick}
        >
          {firstPriorityTitle ? "Показать мастеров под стиль" : TOP_100_COPY.mastersCta}
        </button>
      </section>

      <section className={styles.indexBlock} aria-labelledby={indexTitleId}>
        <div>
          <h3 id={indexTitleId}>{TOP_100_COPY.indexTitle}</h3>
          <p>{TOP_100_COPY.indexText}</p>
        </div>

        <details className={styles.indexDisclosure} open>
          <summary className={styles.indexSummary}>{TOP_100_COPY.openIndex}</summary>

          <nav className={styles.indexClusterNav} aria-label={TOP_100_COPY.indexNavLabel}>
            {groupedRegistry.map((group) => (
              <a
                key={group.category}
                href={`#top100-index-${group.category}`}
                aria-label={`${group.label}: ${formatStylesCount(group.items.length)}`}
              >
                <span>{group.label}</span>
                <strong>{group.items.length}</strong>
              </a>
            ))}
          </nav>

          <div className={styles.indexGrid}>
            {groupedRegistry.map((group) => (
              <section
                key={group.category}
                id={`top100-index-${group.category}`}
                className={styles.indexGroup}
                aria-labelledby={`top100-index-${group.category}-title`}
              >
                <div className={styles.indexGroupHeader}>
                  <h4 id={`top100-index-${group.category}-title`}>{group.label}</h4>
                  <span>{formatStylesCount(group.items.length)}</span>
                </div>

                <ol className={styles.indexList} aria-label={`${group.label}: карточки Top 100`}>
                  {group.items.map((item) => (
                    <li key={item.slug}>
                      <Top100IndexCard
                        item={item}
                        eager={item.sortOrder <= EAGER_INDEX_CARD_LIMIT}
                        onOpenMasters={onOpenMasters}
                      />
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </details>
      </section>
    </section>
  );
}
