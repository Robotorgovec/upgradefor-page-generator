"use client";

import { useMemo, useState } from "react";

import styles from "./WeddingHairstylesPage.module.css";
import WeddingHairstylesIcon, { type WeddingHairstylesIconName } from "./WeddingHairstylesIcon";
import type { RecommendationCard, WeddingHairstylesPageData } from "./data";

type WeddingHairstylesGuidedSelectorProps = {
  selector: WeddingHairstylesPageData["selector"];
  recommendations: RecommendationCard[];
};

type SelectorCategory = WeddingHairstylesPageData["selector"]["categories"][number];

type SelectedMap = Record<string, string>;

const SELECTOR_ICONS: Partial<Record<SelectorCategory["id"], WeddingHairstylesIconName>> = {
  "face-shape": "face-shape",
  "hair-length": "hair-length",
  volume: "hair-density",
  "dress-style": "neckline-dress",
  veil: "veil-accessory",
};

const SELECTOR_TITLE_OVERRIDES: Partial<Record<SelectorCategory["id"], string>> = {
  volume: "\u0413\u0443\u0441\u0442\u043e\u0442\u0430 / \u043e\u0431\u044a\u0435\u043c",
  "dress-style": "\u0412\u044b\u0440\u0435\u0437 \u043f\u043b\u0430\u0442\u044c\u044f",
  veil: "\u0424\u0430\u0442\u0430 / \u0430\u043a\u0441\u0435\u0441\u0441\u0443\u0430\u0440\u044b",
};

const getCategoryTitle = (category: SelectorCategory) => SELECTOR_TITLE_OVERRIDES[category.id] ?? category.title;

export default function WeddingHairstylesGuidedSelector({
  selector,
  recommendations,
}: WeddingHairstylesGuidedSelectorProps) {
  const initialSelection = useMemo<SelectedMap>(
    () =>
      selector.categories.reduce<SelectedMap>((acc, category) => {
        acc[category.id] = category.options[0]?.id ?? "";
        return acc;
      }, {}),
    [selector.categories],
  );

  const [selected, setSelected] = useState<SelectedMap>(initialSelection);

  const selectedValues = useMemo(() => Object.values(selected), [selected]);

  const ranked = useMemo(() => {
    return recommendations
      .map((item) => {
        const score = item.tags.reduce((total, tag) => total + (selectedValues.includes(tag) ? 1 : 0), 0);
        return { item, score };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.item.title.localeCompare(b.item.title, "ru");
      })
      .slice(0, 3);
  }, [recommendations, selectedValues]);

  const selectedLabels = useMemo(() => {
    return selector.categories.map((category) => {
      const selectedId = selected[category.id];
      const selectedOption = category.options.find((option) => option.id === selectedId);
      return {
        category: getCategoryTitle(category),
        label: selectedOption?.label ?? "Не выбрано",
      };
    });
  }, [selector.categories, selected]);

  return (
    <section id="guided-selection" className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>{selector.title}</h2>
        <p>{selector.text}</p>
      </div>

      <div className={styles.selectorLayout}>
        <div className={styles.selectorControls}>
          {selector.categories.map((category) => {
            const iconName = SELECTOR_ICONS[category.id];

            return (
              <fieldset key={category.id} className={styles.selectorGroup}>
                <legend className={iconName ? styles.selectorLegend : undefined}>
                  {iconName ? <WeddingHairstylesIcon name={iconName} size="inline" /> : null}
                  <span className={styles.iconLabelText}>{getCategoryTitle(category)}</span>
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
                        onClick={() =>
                          setSelected((current) => ({
                            ...current,
                            [category.id]: option.id,
                          }))
                        }
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

        <aside className={styles.selectorSummary} aria-live="polite">
          <h3>Ваш текущий набор параметров</h3>
          <ul>
            {selectedLabels.map((item) => (
              <li key={item.category}>
                <span>{item.category}:</span> {item.label}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <div className={styles.recommendationGrid}>
        {ranked.map(({ item, score }) => (
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
        ))}
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