"use client";

import { useMemo, useState } from "react";

import type { RecommendationCard, WeddingHairstylesPageData } from "./data";
import WeddingHairstylesGuidedSelector from "./WeddingHairstylesGuidedSelector";
import WeddingHairstylesPerformerGrid from "./WeddingHairstylesPerformerGrid";
import WeddingHairstylesTop100Section from "./WeddingHairstylesTop100Section";
import {
  getWeddingHairstyleByFilterKey,
  type ResolvedWeddingHairstyleRecord,
  type WeddingHairstyleCategory,
} from "./weddingHairstylesTop100Data";

type SelectedMap = Record<string, string>;

type AppliedFilter = {
  id: string;
  category: string;
  label: string;
};

type RankedRecommendation = {
  item: RecommendationCard;
  score: number;
};

type RecommendationHint = {
  categories: WeddingHairstyleCategory[];
  exactKeys: string[];
};

type WeddingHairstylesSelectionExperienceProps = {
  selector: WeddingHairstylesPageData["selector"];
  recommendations: RecommendationCard[];
  performersSection: WeddingHairstylesPageData["performersSection"];
  top100Items: ResolvedWeddingHairstyleRecord[];
  initialHairstyleKey?: string;
};

const RECOMMENDATION_HINTS: Record<string, RecommendationHint> = {
  "low-bun": {
    categories: ["bun"],
    exactKeys: ["smooth-low-bun", "classic-low-bun", "sleek-low-bun", "romantic-low-bun"],
  },
  "hollywood-waves": {
    categories: ["waves"],
    exactKeys: ["old-hollywood-waves", "glossy-waves", "side-swept-waves"],
  },
  "textured-updo": {
    categories: ["updo"],
    exactKeys: ["textured-updo", "soft-twisted-updo", "loose-updo"],
  },
  "high-bun": {
    categories: ["bun"],
    exactKeys: ["elegant-high-bun", "modern-high-bun", "high-bun-with-veil"],
  },
  "boho-braid": {
    categories: ["braid"],
    exactKeys: ["waterfall-braid", "fishtail-braid", "loose-side-braid"],
  },
  "half-up-half-down-curls": {
    categories: ["half-up", "waves"],
    exactKeys: ["half-up-half-down-curls", "half-up-soft-waves", "half-up-volume-curls"],
  },
};

function buildEmptySelection(categories: WeddingHairstylesPageData["selector"]["categories"]): SelectedMap {
  return categories.reduce<SelectedMap>((acc, category) => {
    acc[category.id] = "";
    return acc;
  }, {});
}

function buildAppliedFilters(
  categories: WeddingHairstylesPageData["selector"]["categories"],
  selected: SelectedMap,
): AppliedFilter[] {
  return categories.flatMap((category) => {
    const selectedId = selected[category.id];

    if (!selectedId) {
      return [];
    }

    const selectedOption = category.options.find((option) => option.id === selectedId);

    if (!selectedOption) {
      return [];
    }

    return [
      {
        id: `${category.id}-${selectedOption.id}`,
        category: category.title,
        label: selectedOption.label,
      },
    ];
  });
}

function buildSelectionFromPreset(
  categories: WeddingHairstylesPageData["selector"]["categories"],
  preset: RecommendationCard,
): SelectedMap {
  return categories.reduce<SelectedMap>((acc, category) => {
    const matchingOption = category.options.find((option) => preset.tags.includes(option.id));
    acc[category.id] = matchingOption?.id ?? "";
    return acc;
  }, {});
}

function rankRecommendations(recommendations: RecommendationCard[], selectedValues: string[]): RankedRecommendation[] {
  return recommendations
    .map((item) => {
      const score = item.tags.reduce((total, tag) => total + (selectedValues.includes(tag) ? 1 : 0), 0);
      return { item, score };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.item.title.localeCompare(b.item.title, "ru");
    });
}

function rankTop100Items(
  items: ResolvedWeddingHairstyleRecord[],
  rankedRecommendations: RankedRecommendation[],
): ResolvedWeddingHairstyleRecord[] {
  const liveItems = items.filter((item) => item.hasLiveImage);
  const positiveRecommendations = rankedRecommendations.filter((entry) => entry.score > 0).slice(0, 3);

  if (positiveRecommendations.length === 0) {
    return liveItems;
  }

  const scoredItems = liveItems.map((item, index) => {
    const score = positiveRecommendations.reduce((total, entry, recommendationIndex) => {
      const hint = RECOMMENDATION_HINTS[entry.item.id];

      if (!hint) {
        return total;
      }

      const recommendationWeight = Math.max(14, 20 - recommendationIndex * 4) + entry.score;
      const categoryMatch = hint.categories.includes(item.category) ? recommendationWeight : 0;
      const exactMatch = hint.exactKeys.includes(item.mastersFilterKey) ? recommendationWeight + 18 : 0;

      return total + categoryMatch + exactMatch;
    }, 0);

    return { item, score, index };
  });

  const positiveItems = scoredItems.filter((entry) => entry.score > 0);

  if (positiveItems.length === 0) {
    return liveItems;
  }

  return positiveItems
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.index - b.index;
    })
    .map((entry) => entry.item);
}

export default function WeddingHairstylesSelectionExperience({
  selector,
  recommendations,
  performersSection,
  top100Items,
  initialHairstyleKey,
}: WeddingHairstylesSelectionExperienceProps) {
  const [selected, setSelected] = useState<SelectedMap>(() => buildEmptySelection(selector.categories));

  const appliedFilters = useMemo(
    () => buildAppliedFilters(selector.categories, selected),
    [selector.categories, selected],
  );

  const selectedValues = useMemo(() => Object.values(selected).filter(Boolean), [selected]);

  const rankedRecommendations = useMemo(
    () => rankRecommendations(recommendations, selectedValues),
    [recommendations, selectedValues],
  );

  const previewRecommendations = useMemo(() => {
    const positiveMatches = rankedRecommendations.filter((entry) => entry.score > 0);
    const source = positiveMatches.length > 0 ? positiveMatches : rankedRecommendations;
    return source.slice(0, 3);
  }, [rankedRecommendations]);

  const rankedTop100Items = useMemo(
    () => rankTop100Items(top100Items, rankedRecommendations),
    [top100Items, rankedRecommendations],
  );

  const contextualHairstyleKey = useMemo(() => {
    if (appliedFilters.length > 0) {
      return rankedTop100Items[0]?.mastersFilterKey;
    }

    return initialHairstyleKey;
  }, [appliedFilters.length, initialHairstyleKey, rankedTop100Items]);

  const contextualHairstyle = useMemo(
    () => (contextualHairstyleKey ? getWeddingHairstyleByFilterKey(contextualHairstyleKey) : null),
    [contextualHairstyleKey],
  );

  const handleClear = () => {
    setSelected(buildEmptySelection(selector.categories));
  };

  const handleToggleOption = (categoryId: string, optionId: string) => {
    setSelected((current) => ({
      ...current,
      [categoryId]: current[categoryId] === optionId ? "" : optionId,
    }));
  };

  const handleApplyPreset = (preset: RecommendationCard) => {
    setSelected(buildSelectionFromPreset(selector.categories, preset));
  };

  const bridgeTitle = contextualHairstyle
    ? "Показать мастеров под выбранные стили"
    : "Сравнить мастеров по стилю";
  const bridgeText = contextualHairstyle
    ? `Ниже уже показаны мастера, которые чаще работают с направлениями вроде ${contextualHairstyle.title}. Уточните дату, формат сборов и аксессуары в одном коротком брифе.`
    : "После просмотра карточек можно сразу перейти к мастерам и сравнить, кто работает под ваш формат сборов и тайминг дня.";

  return (
    <>
      <WeddingHairstylesGuidedSelector
        selector={selector}
        selected={selected}
        appliedFilters={appliedFilters}
        recommendations={previewRecommendations}
        presets={recommendations}
        onToggleOption={handleToggleOption}
        onApplyPreset={handleApplyPreset}
        onClear={handleClear}
      />

      <WeddingHairstylesTop100Section
        items={rankedTop100Items}
        totalCount={top100Items.filter((item) => item.hasLiveImage).length}
        appliedFilters={appliedFilters}
        onClearFilters={handleClear}
        bridgeTitle={bridgeTitle}
        bridgeText={bridgeText}
        bridgeHref="#wedding-hairstyle-masters"
      />

      <WeddingHairstylesPerformerGrid section={performersSection} hairstyleKey={contextualHairstyleKey} />
    </>
  );
}
