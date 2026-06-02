"use client";

import styles from "./WeddingHairstylesPage.module.css";
import type { RecommendationCard, WeddingHairstylesPageData } from "./data";
import { buildWeddingHairstyleMastersHref } from "./weddingHairstylesTop100Data";

type SelectedMap = Record<string, string>;

type AppliedFilter = {
  id: string;
  categoryId: string;
  optionId: string;
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
  activePresetId?: string | null;
  onToggleOption: (categoryId: string, optionId: string) => void;
  onRemoveFilter: (categoryId: string) => void;
  onApplyPreset: (preset: RecommendationCard) => void;
  onClear: () => void;
};

export default function WeddingHairstylesGuidedSelector({
  selector,
  selected,
  appliedFilters,
  recommendations,
  presets,
  activePresetId,
  onToggleOption,
  onRemoveFilter,
  onApplyPreset,
  onClear,
}: WeddingHairstylesGuidedSelectorProps) {
  const hasFilters = appliedFilters.length > 0;
  const hasRecommendationMatches = recommendations.length > 0;
  const selectedCount = appliedFilters.length;
  const totalCategoryCount = selector.categories.length;
  const activePresetTitle = presets.find((preset) => preset.id === activePresetId)?.title ?? null;
  const primaryRecommendation = recommendations[0] ?? null;
  const primaryRecommendationScoreLabel =
    primaryRecommendation && primaryRecommendation.score > 0
      ? `${primaryRecommendation.score} из ${selectedCount} совпадений`
      : "стартовый ориентир";
  const visibleSummaryRecommendations = recommendations.slice(0, 3);
  const nextMissingCategory = selector.categories.find((category) => !selected[category.id])?.title ?? null;
  const nextStepLabel =
    selectedCount >= 3
      ? "Можно сравнивать Top 100"
      : nextMissingCategory
        ? `Следующий параметр: ${nextMissingCategory}`
        : "Сценарий собран";
  const readinessLabel =
    selectedCount >= 5
      ? "Точный сценарий"
      : selectedCount >= 3
        ? "Хорошая основа"
        : selectedCount > 0
          ? "Черновой набор"
          : "Старт";
  const sectionTitleId = "guided-selection-title";
  const presetTitleId = "guided-selection-presets-title";
  const summaryTitleId = "guided-selection-summary-title";
  const summaryMatchesTitleId = "guided-selection-summary-matches-title";
  const recommendationTitleId = "guided-selection-recommendations-title";
  const top100RegionId = "top-100-hairstyles";
  const progressNote = activePresetTitle
    ? `Активный пресет: ${activePresetTitle}`
    : hasFilters
      ? "Настроено вручную: Top 100 уже пересчитан"
      : "Можно собрать вручную или начать с пресета";
  const starterTitle =
    selectedCount >= 3
      ? "Сценарий уже можно сравнивать"
      : hasFilters
        ? "Добавьте еще 1–2 параметра"
        : "Начните с пресета или 3–5 параметров";
  const starterText =
    selectedCount >= 3
      ? "Top 100 и мастера уже перестроены под выбранный сценарий. Дальше можно смотреть карточки или сразу перейти к мастерам."
      : hasFilters
        ? "Каждый новый параметр уточняет Top 100, ближайшее направление и выдачу мастеров ниже."
        : "Самый быстрый путь: нажать готовый пресет. Самый точный путь: выбрать параметры вручную.";

  const selectedLabels = selector.categories.map((category) => {
    const selectedId = selected[category.id];
    const selectedOption = category.options.find((option) => option.id === selectedId);

    return {
      category: category.title,
      label: selectedOption?.label ?? "Не выбрано",
    };
  });
  const handoffFilters = appliedFilters.slice(0, 5);
  const hiddenHandoffFilterCount = Math.max(0, appliedFilters.length - handoffFilters.length);
  const handoffMastersHref = primaryRecommendation?.item.sourceTypeId
    ? buildWeddingHairstyleMastersHref(primaryRecommendation.item.sourceTypeId)
    : null;
  const handoffTitle =
    selectedCount >= 3
      ? "Сценарий можно передавать мастеру"
      : selectedCount > 0
        ? "Бриф начал собираться"
        : selector.cta.title;
  const handoffText =
    selectedCount >= 3 && primaryRecommendation
      ? `В бриф попадут параметры, ближайшее направление «${primaryRecommendation.item.title}» и задачи для пробного образа.`
      : selectedCount > 0
        ? "Добавьте еще пару параметров, чтобы Top 100 и список мастеров стали точнее."
        : selector.cta.text;

  return (
    <section
      id="guided-selection"
      className={`${styles.section} ${styles.selectorSection}`}
      aria-labelledby={sectionTitleId}
    >
      <div className={styles.selectorHero}>
        <div className={styles.selectorHeroCopy}>
          <p className={styles.selectorEyebrow}>Персональный подбор</p>
          <h2 id={sectionTitleId}>{selector.title}</h2>
          <p>{selector.text}</p>
        </div>

        <div className={styles.selectorHeroPanel}>
          <div className={styles.selectorHeroStats} aria-label="Статус подбора">
            <span>
              <strong>{selectedCount}</strong>
              выбрано
            </span>
            <span>
              <strong>{totalCategoryCount}</strong>
              параметров
            </span>
            <span>
              <strong>{recommendations.length}</strong>
              направления
            </span>
          </div>

          {primaryRecommendation ? (
            <div className={styles.selectorHeroMatch} aria-label="Ближайшее направление подбора">
              <p>{hasFilters ? "Ближе всего сейчас" : "Стартовый ориентир"}</p>
              <strong>{primaryRecommendation.item.title}</strong>
              <span>{primaryRecommendationScoreLabel}</span>
              <div className={styles.selectorHeroMatchActions}>
                <a href={primaryRecommendation.item.ctaHref}>{primaryRecommendation.item.ctaLabel}</a>
                {primaryRecommendation.item.sourceTypeId ? (
                  <a href={buildWeddingHairstyleMastersHref(primaryRecommendation.item.sourceTypeId)}>
                    Мастера
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.selectorStarter} aria-label="Как начать персональный подбор">
        <div className={styles.selectorStarterCopy}>
          <p>{selectedCount >= 3 ? "Готово к сравнению" : "Рекомендуемый старт"}</p>
          <h3>{starterTitle}</h3>
          <span>{starterText}</span>
        </div>

        <ol className={styles.selectorStarterSteps}>
          <li className={activePresetId ? styles.selectorStarterStepDone : ""}>
            <span>01</span>
            Пресет или ручной выбор
          </li>
          <li className={selectedCount >= 3 ? styles.selectorStarterStepDone : ""}>
            <span>02</span>
            3–5 параметров для точности
          </li>
          <li className={selectedCount >= 3 ? styles.selectorStarterStepActive : ""}>
            <span>03</span>
            Top 100 и мастера под сценарий
          </li>
        </ol>

        <div className={styles.selectorStarterActions}>
          <a href="#guided-selection-presets-title">Быстрые пресеты</a>
          <a href="#wedding-hairstyle-masters">Мастера</a>
        </div>
      </div>

      <div className={styles.selectorPresetBlock} role="group" aria-labelledby={presetTitleId}>
        <div className={styles.selectorPresetHeader}>
          <div>
            <h3 id={presetTitleId}>Быстрые пресеты</h3>
            <p>Готовые сценарии сразу перестраивают витрину и список мастеров.</p>
          </div>
          {hasFilters ? (
            <button
              type="button"
              className={styles.clearFiltersButton}
              aria-label="Сбросить все выбранные параметры подбора"
              aria-controls={top100RegionId}
              onClick={onClear}
            >
              Сбросить все
            </button>
          ) : null}
        </div>

        <div className={styles.selectorPresetGrid}>
          {presets.map((preset) => {
            const isActive = activePresetId === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                className={`${styles.selectorPresetButton} ${isActive ? styles.selectorPresetButtonActive : ""}`}
                aria-pressed={isActive}
                aria-label={`${isActive ? "Активный пресет" : "Применить пресет"}: ${preset.title}`}
                aria-controls={top100RegionId}
                onClick={() => onApplyPreset(preset)}
              >
                <span>{preset.title}</span>
                {isActive ? <strong>Выбран</strong> : null}
              </button>
            );
          })}
        </div>
      </div>

      {hasFilters ? (
        <div className={styles.appliedFiltersRow} aria-live="polite">
          <p className={styles.appliedFiltersLabel}>Применено:</p>
          <ul className={styles.appliedFiltersList}>
            {appliedFilters.map((filter) => (
              <li key={filter.id}>
                <button
                  type="button"
                  className={styles.appliedFilterTag}
                  aria-label={`Убрать фильтр ${filter.category}: ${filter.label}`}
                  aria-controls={top100RegionId}
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
        </div>
      ) : null}

      <div className={styles.selectorLayout}>
        <div className={styles.selectorControls}>
          {selector.categories.map((category, categoryIndex) => {
            const selectedId = selected[category.id];
            const selectedOption = category.options.find((option) => option.id === selectedId);

            return (
              <fieldset key={category.id} className={styles.selectorGroup}>
                <legend>
                  <span className={styles.selectorGroupStep}>{String(categoryIndex + 1).padStart(2, "0")}</span>
                  <span>{category.title}</span>
                  <strong>{selectedOption?.label ?? "Не выбрано"}</strong>
                </legend>
                <div className={styles.selectorChips}>
                  {category.options.map((option) => {
                    const isActive = selected[category.id] === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={`${styles.selectorChip} ${isActive ? styles.selectorChipActive : ""}`}
                        aria-pressed={isActive}
                        aria-label={`${isActive ? "Убрать" : "Выбрать"} ${category.title}: ${option.label}`}
                        aria-controls={top100RegionId}
                        onClick={() => onToggleOption(category.id, option.id)}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>

        <aside className={styles.selectorSummary} aria-live="polite" aria-labelledby={summaryTitleId}>
          <div className={styles.selectorSummaryHeader}>
            <div>
              <p>{readinessLabel}</p>
              <h3 id={summaryTitleId}>{selector.summaryTitle}</h3>
            </div>
            <strong>{selectedCount}/{totalCategoryCount}</strong>
          </div>
          <div
            className={styles.selectorProgress}
            role="status"
            aria-label={`Выбрано ${selectedCount} из ${totalCategoryCount}. ${progressNote}`}
          >
            <p>
              Выбрано {selectedCount} из {totalCategoryCount}
            </p>
            <div
              className={styles.selectorProgressTrack}
              data-progress={selectedCount}
              role="progressbar"
              aria-label="Заполненность подбора свадебной прически"
              aria-valuemin={0}
              aria-valuemax={totalCategoryCount}
              aria-valuenow={selectedCount}
            />
            <span>{progressNote}</span>
          </div>

          <div className={styles.selectorNextStep}>
            <span>{selectedCount >= 3 ? "Статус выдачи" : "Фокус выбора"}</span>
            <strong>{nextStepLabel}</strong>
          </div>

          {visibleSummaryRecommendations.length > 0 ? (
            <div className={styles.selectorSummaryMatches} aria-labelledby={summaryMatchesTitleId}>
              <div className={styles.selectorSummaryMatchesHeader}>
                <p id={summaryMatchesTitleId}>Ближайшие направления</p>
                <span>{hasFilters ? "по параметрам" : "старт"}</span>
              </div>
              <ol className={styles.selectorSummaryMatchList}>
                {visibleSummaryRecommendations.map(({ item, score }, index) => (
                  <li key={item.id}>
                    <a href={item.ctaHref}>
                      <span>{index + 1}</span>
                      <strong>{item.title}</strong>
                      <small>
                        {score > 0 ? `${score} из ${selectedCount}` : "стартовый ориентир"}
                      </small>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          <ul>
            {selectedLabels.map((item) => (
              <li key={item.category}>
                <span>{item.category}:</span> {item.label}
              </li>
            ))}
          </ul>
          {!hasFilters ? (
            <p className={styles.selectorHint}>
              Выберите 3–5 параметров, чтобы увидеть более точные совпадения в Top 100.
            </p>
          ) : null}
        </aside>
      </div>

      <div className={styles.recommendationHeader}>
        <div>
          <h3 id={recommendationTitleId}>Приоритетные попадания</h3>
          <p>Эти направления сейчас ближе всего к выбранным параметрам и помогают быстро сузить Top 100.</p>
        </div>
      </div>

      <div className={styles.recommendationGrid} aria-labelledby={recommendationTitleId}>
        {hasRecommendationMatches ? (
          recommendations.map(({ item, score }, index) => {
            const matchedFilters = appliedFilters.filter((filter) => item.tags.includes(filter.optionId));
            const visibleMatchedFilters = matchedFilters.slice(0, 3);
            const hiddenMatchCount = Math.max(0, matchedFilters.length - visibleMatchedFilters.length);
            const recommendationCardTitleId = `guided-selection-recommendation-${item.id}`;
            const matchPercent = selectedCount > 0 ? Math.round((score / selectedCount) * 100) : 0;
            const matchStrengthLabel =
              selectedCount === 0
                ? "Стартовый ориентир"
                : score === selectedCount
                  ? "Полное совпадение"
                  : score >= Math.max(3, Math.ceil(selectedCount * 0.62))
                    ? "Сильное совпадение"
                    : score > 0
                      ? "Есть пересечения"
                      : "Слабая связь";
            const matchMeterWidth = selectedCount > 0 ? `${Math.min(100, Math.max(6, matchPercent))}%` : "18%";
            const mastersHref = item.sourceTypeId ? buildWeddingHairstyleMastersHref(item.sourceTypeId) : null;

            return (
              <article
                key={item.id}
                className={styles.recommendationCard}
                aria-labelledby={recommendationCardTitleId}
              >
                <div className={styles.recommendationCardTopline}>
                  <span className={styles.recommendationRank}>#{index + 1}</span>
                  <div className={styles.recommendationScoreBlock}>
                    <p className={styles.recommendationScore}>{matchStrengthLabel}</p>
                    <strong>{selectedCount > 0 ? `${matchPercent}%` : "Старт"}</strong>
                  </div>
                </div>
                <div
                  className={styles.recommendationMeter}
                  aria-label={
                    selectedCount > 0
                      ? `Совпадение ${score} из ${selectedCount}: ${matchPercent} процентов`
                      : "Стартовое направление без выбранных параметров"
                  }
                >
                  <span style={{ width: matchMeterWidth }} />
                </div>
                {visibleMatchedFilters.length > 0 ? (
                  <ul className={styles.recommendationMatchList} aria-label={`Совпавшие параметры: ${item.title}`}>
                    {visibleMatchedFilters.map((filter) => (
                      <li key={`${item.id}-${filter.id}`}>{filter.label}</li>
                    ))}
                    {hiddenMatchCount > 0 ? (
                      <li className={styles.recommendationMatchMore}>+{hiddenMatchCount}</li>
                    ) : null}
                  </ul>
                ) : null}
                <div className={styles.recommendationCardText}>
                  <h3 id={recommendationCardTitleId}>{item.title}</h3>
                  <p>
                    <strong>Кому подходит:</strong> {item.suitedFor}
                  </p>
                  <p>
                    <strong>Ключевой эффект:</strong> {item.effect}
                  </p>
                  <p>
                    <strong>Когда выбирать:</strong> {item.whenToChoose}
                  </p>
                </div>
                <div className={styles.recommendationActions}>
                  <a className={`${styles.inlineLink} ${styles.recommendationPrimaryAction}`} href={item.ctaHref}>
                    {item.ctaLabel}
                  </a>
                  {mastersHref ? (
                    <a className={`${styles.inlineLink} ${styles.recommendationSecondaryAction}`} href={mastersHref}>
                      Мастера под стиль
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })
        ) : (
          <article className={styles.recommendationCard} aria-labelledby="guided-selection-no-match-title">
            <p className={styles.recommendationScore}>Совпадений: 0</p>
            <h3 id="guided-selection-no-match-title">
              {"\u0422\u043e\u0447\u043d\u043e\u0433\u043e \u0441\u043e\u0432\u043f\u0430\u0434\u0435\u043d\u0438\u044f \u043f\u043e\u043a\u0430 \u043d\u0435\u0442"}
            </h3>
            <p>
              {
                "\u0421\u0435\u0439\u0447\u0430\u0441 \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u044b\u0439 \u043d\u0430\u0431\u043e\u0440 \u043f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u043e\u0432 \u043d\u0435 \u0434\u0430\u0435\u0442 \u0447\u0435\u0441\u0442\u043d\u043e\u0433\u043e \u043f\u043e\u043f\u0430\u0434\u0430\u043d\u0438\u044f \u0432 \u0433\u043e\u0442\u043e\u0432\u044b\u0435 \u043f\u0440\u0435\u0441\u0435\u0442\u044b. \u0421\u043d\u0438\u043c\u0438\u0442\u0435 \u043e\u0434\u0438\u043d-\u0434\u0432\u0430 \u0444\u0438\u043b\u044c\u0442\u0440\u0430 \u0438\u043b\u0438 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0431\u043e\u043b\u0435\u0435 \u0448\u0438\u0440\u043e\u043a\u0438\u0439 \u043f\u0440\u0435\u0441\u0435\u0442, \u0447\u0442\u043e\u0431\u044b \u0441\u043d\u043e\u0432\u0430 \u0443\u0432\u0438\u0434\u0435\u0442\u044c \u0440\u0435\u043b\u0435\u0432\u0430\u043d\u0442\u043d\u044b\u0435 \u043d\u0430\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u044f."
              }
            </p>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary}`}
              aria-controls={top100RegionId}
              onClick={onClear}
            >
              Сбросить фильтры
            </button>
          </article>
        )}
      </div>

      <div className={styles.selectorHandoff} aria-label="Следующий шаг после подбора">
        <div className={styles.selectorHandoffCopy}>
          <p className={styles.selectorHandoffEyebrow}>
            {selectedCount >= 3 ? "Готовый следующий шаг" : "Финал подбора"}
          </p>
          <h3>{handoffTitle}</h3>
          <p>{handoffText}</p>
        </div>

        <div className={styles.selectorHandoffPanel}>
          <div className={styles.selectorHandoffMetrics} aria-label="Состав брифа">
            <span>
              <strong>{selectedCount}</strong>
              параметров
            </span>
            <span>
              <strong>{primaryRecommendation?.item.title ?? "Старт"}</strong>
              направление
            </span>
          </div>

          {handoffFilters.length > 0 ? (
            <ul className={styles.selectorHandoffList} aria-label="Параметры для брифа">
              {handoffFilters.map((filter) => (
                <li key={`handoff-${filter.id}`}>
                  <span>{filter.category}: </span>
                  {filter.label}
                </li>
              ))}
              {hiddenHandoffFilterCount > 0 ? <li>+{hiddenHandoffFilterCount} еще</li> : null}
            </ul>
          ) : (
            <p className={styles.selectorHandoffHint}>Выберите параметры выше или начните с готового пресета.</p>
          )}

          <div className={styles.selectorHandoffActions}>
            <a className={`${styles.btn} ${styles.btnPrimary}`} href={selector.cta.href}>
              {selector.cta.buttonLabel}
            </a>
            {handoffMastersHref ? (
              <a className={`${styles.btn} ${styles.btnSecondary}`} href={handoffMastersHref}>
                Смотреть мастеров
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
