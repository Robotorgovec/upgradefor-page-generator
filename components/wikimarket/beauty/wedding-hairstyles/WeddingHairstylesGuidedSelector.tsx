"use client";

import { useMemo, useState } from "react";

import styles from "./WeddingHairstylesPage.module.css";
import WeddingHairstylesIcon, { type WeddingHairstylesIconName } from "./WeddingHairstylesIcon";
import type { RecommendationCard, WeddingHairstylesPageData } from "./data";

type WeddingHairstylesGuidedSelectorProps = {
  selector: WeddingHairstylesPageData["selector"];
  recommendations: RecommendationCard[];
};

type SelectedMap = Record<string, string>;

const SELECTOR_SUMMARY_TITLE =
  "\u0412\u0430\u0448 \u0442\u0435\u043a\u0443\u0449\u0438\u0439 \u043d\u0430\u0431\u043e\u0440 \u043f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u043e\u0432";
const SELECTED_FALLBACK = "\u041d\u0435 \u0432\u044b\u0431\u0440\u0430\u043d\u043e";
const MATCH_LABEL =
  "\u0421\u043e\u0432\u043f\u0430\u0434\u0435\u043d\u0438\u0435 \u043f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u043e\u0432";
const SUITED_FOR_LABEL = "\u041a\u043e\u043c\u0443 \u043f\u043e\u0434\u0445\u043e\u0434\u0438\u0442";
const EFFECT_LABEL = "\u041a\u043b\u044e\u0447\u0435\u0432\u043e\u0439 \u044d\u0444\u0444\u0435\u043a\u0442";
const WHEN_TO_CHOOSE_LABEL = "\u041a\u043e\u0433\u0434\u0430 \u0432\u044b\u0431\u0438\u0440\u0430\u0442\u044c";

function getSelectorIconName(categoryId: string): WeddingHairstylesIconName | undefined {
  switch (categoryId) {
    case "hair-length":
      return "hair-length";
    case "face-shape":
      return "face-shape";
    case "volume":
      return "hair-density";
    case "dress-style":
      return "neckline-dress";
    case "veil":
      return "veil-accessory";
    default:
      return undefined;
  }
}

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
        category: category.title,
        label: selectedOption?.label ?? SELECTED_FALLBACK,
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
            const iconName = getSelectorIconName(category.id);

            return (
              <fieldset key={category.id} className={styles.selectorGroup}>
                <legend className={styles.selectorGroupHeading}>
                  <span className={styles.selectorLegend}>{category.title}</span>
                </legend>
                <div className={iconName ? styles.selectorControlRowWithIcon : styles.selectorControlRowPlain}>
                  {iconName ? <WeddingHairstylesIcon name={iconName} className={styles.selectorBlockIcon} /> : null}
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
                </div>
              </fieldset>
            );
          })}
        </div>

        <aside className={styles.selectorSummary} aria-live="polite">
          <h3>{SELECTOR_SUMMARY_TITLE}</h3>
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
            <p className={styles.recommendationScore}>
              {MATCH_LABEL}: {score}
            </p>
            <h3>{item.title}</h3>
            <p>
              <strong>{SUITED_FOR_LABEL}:</strong> {item.suitedFor}
            </p>
            <p>
              <strong>{EFFECT_LABEL}:</strong> {item.effect}
            </p>
            <p>
              <strong>{WHEN_TO_CHOOSE_LABEL}:</strong> {item.whenToChoose}
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