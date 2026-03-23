"use client";

import styles from "./WeddingHairstylesPage.module.css";
import type { RecommendationCard, WeddingHairstylesPageData } from "./data";

type SelectedMap = Record<string, string>;

type AppliedFilter = {
  id: string;
  category: string;
  label: string;
};

type RankedRecommendation = {
  item: RecommendationCard;
  score: number;
  sourceIndex: number;
};

type WeddingHairstylesGuidedSelectorProps = {
  selector: WeddingHairstylesPageData["selector"];
  selected: SelectedMap;
  appliedFilters: AppliedFilter[];
  recommendations: RankedRecommendation[];
  presets: RecommendationCard[];
  onToggleOption: (categoryId: string, optionId: string) => void;
  onApplyPreset: (preset: RecommendationCard) => void;
  onClear: () => void;
};

export default function WeddingHairstylesGuidedSelector({
  selector,
  selected,
  appliedFilters,
  recommendations,
  presets,
  onToggleOption,
  onApplyPreset,
  onClear,
}: WeddingHairstylesGuidedSelectorProps) {
  const hasFilters = appliedFilters.length > 0;
  const hasRecommendationMatches = recommendations.length > 0;

  const selectedLabels = selector.categories.map((category) => {
    const selectedId = selected[category.id];
    const selectedOption = category.options.find((option) => option.id === selectedId);

    return {
      category: category.title,
      label: selectedOption?.label ?? "Не выбрано",
    };
  });

  return (
    <section id="guided-selection" className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>{selector.title}</h2>
        <p>{selector.text}</p>
      </div>

      <div className={styles.selectorPresetBlock}>
        <div className={styles.selectorPresetHeader}>
          <div>
            <h3>Быстрые пресеты</h3>
            <p>Используйте готовые направления вместо отдельной витрины featured styles.</p>
          </div>
          {hasFilters ? (
            <button type="button" className={styles.clearFiltersButton} onClick={onClear}>
              Сбросить все
            </button>
          ) : null}
        </div>

        <div className={styles.selectorPresetGrid}>
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={styles.selectorPresetButton}
              onClick={() => onApplyPreset(preset)}
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {hasFilters ? (
        <div className={styles.appliedFiltersRow} aria-live="polite">
          <p className={styles.appliedFiltersLabel}>Применено:</p>
          <ul className={styles.appliedFiltersList}>
            {appliedFilters.map((filter) => (
              <li key={filter.id} className={styles.appliedFilterTag}>
                <span>{filter.category}:</span> {filter.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={styles.selectorLayout}>
        <div className={styles.selectorControls}>
          {selector.categories.map((category) => (
            <fieldset key={category.id} className={styles.selectorGroup}>
              <legend>{category.title}</legend>
              <div className={styles.selectorChips}>
                {category.options.map((option) => {
                  const isActive = selected[category.id] === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`${styles.selectorChip} ${isActive ? styles.selectorChipActive : ""}`}
                      aria-pressed={isActive}
                      onClick={() => onToggleOption(category.id, option.id)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <aside className={styles.selectorSummary} aria-live="polite">
          <h3>{selector.summaryTitle}</h3>
          <ul>
            {selectedLabels.map((item) => (
              <li key={item.category}>
                <span>{item.category}:</span> {item.label}
              </li>
            ))}
          </ul>
          {!hasFilters ? (
            <p className={styles.selectorHint}>Отметьте 3-5 параметров, и Top 100 ниже перестроится под ваш сценарий.</p>
          ) : null}
        </aside>
      </div>

      <div className={styles.recommendationHeader}>
        <div>
          <h3>Приоритетные попадания</h3>
          <p>Эти направления сейчас ближе всего к выбранным параметрам и помогают быстро сузить Top 100.</p>
        </div>
      </div>

      <div className={styles.recommendationGrid}>
        {hasRecommendationMatches ? (
          recommendations.map(({ item, score }) => (
            <article key={item.id} className={styles.recommendationCard}>
              <p className={styles.recommendationScore}>Совпадение параметров: {score}</p>
              <h3>{item.title}</h3>
              <p>
                <strong>Кому подходит:</strong> {item.suitedFor}
              </p>
              <p>
                <strong>Ключевой эффект:</strong> {item.effect}
              </p>
              <p>
                <strong>Когда выбирать:</strong> {item.whenToChoose}
              </p>
              <a className={styles.inlineLink} href={item.ctaHref}>
                {item.ctaLabel}
              </a>
            </article>
          ))
        ) : (
          <article className={styles.recommendationCard}>
            <p className={styles.recommendationScore}>Совпадений: 0</p>
            <h3>{"\u0422\u043e\u0447\u043d\u043e\u0433\u043e \u0441\u043e\u0432\u043f\u0430\u0434\u0435\u043d\u0438\u044f \u043f\u043e\u043a\u0430 \u043d\u0435\u0442"}</h3>
            <p>
              {
                "\u0421\u0435\u0439\u0447\u0430\u0441 \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u044b\u0439 \u043d\u0430\u0431\u043e\u0440 \u043f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u043e\u0432 \u043d\u0435 \u0434\u0430\u0435\u0442 \u0447\u0435\u0441\u0442\u043d\u043e\u0433\u043e \u043f\u043e\u043f\u0430\u0434\u0430\u043d\u0438\u044f \u0432 \u0433\u043e\u0442\u043e\u0432\u044b\u0435 \u043f\u0440\u0435\u0441\u0435\u0442\u044b. \u0421\u043d\u0438\u043c\u0438\u0442\u0435 \u043e\u0434\u0438\u043d-\u0434\u0432\u0430 \u0444\u0438\u043b\u044c\u0442\u0440\u0430 \u0438\u043b\u0438 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0431\u043e\u043b\u0435\u0435 \u0448\u0438\u0440\u043e\u043a\u0438\u0439 \u043f\u0440\u0435\u0441\u0435\u0442, \u0447\u0442\u043e\u0431\u044b \u0441\u043d\u043e\u0432\u0430 \u0443\u0432\u0438\u0434\u0435\u0442\u044c \u0440\u0435\u043b\u0435\u0432\u0430\u043d\u0442\u043d\u044b\u0435 \u043d\u0430\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u044f."
              }
            </p>
            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClear}>
              Сбросить фильтры
            </button>
          </article>
        )}
      </div>

      <div className={styles.inlineCta}>
        <h3>{selector.cta.title}</h3>
        <p>{selector.cta.text}</p>
        <a className={`${styles.btn} ${styles.btnPrimary}`} href={selector.cta.href}>
          {selector.cta.buttonLabel}
        </a>
      </div>
    </section>
  );
}
