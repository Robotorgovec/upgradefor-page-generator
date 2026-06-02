"use client";

import { useEffect, useMemo, useState } from "react";

import type { RecommendationCard, WeddingHairstylesPageData } from "./data";
import WeddingHairstylesGuidedSelector from "./WeddingHairstylesGuidedSelector";
import WeddingHairstylesPerformerGrid from "./WeddingHairstylesPerformerGrid";
import WeddingHairstylesTop100Section from "./WeddingHairstylesTop100Section";
import { getWeddingHairstyleDisplayTitle } from "./weddingHairstylesDisplayText";
import {
  getWeddingHairstyleByFilterKey,
  getWeddingHairstyleBySlug,
  type ResolvedWeddingHairstyleRecord,
  type WeddingHairstyleCategory,
} from "./weddingHairstylesTop100Data";

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

function resolveInitialHairstyleKey(value?: string | null) {
  if (!value) {
    return null;
  }

  const directMatch = getWeddingHairstyleByFilterKey(value) ?? getWeddingHairstyleBySlug(value);

  if (directMatch) {
    return directMatch.mastersFilterKey;
  }

  const presetHintKey = RECOMMENDATION_HINTS[value]?.exactKeys[0];

  return presetHintKey ? (getWeddingHairstyleByFilterKey(presetHintKey)?.mastersFilterKey ?? presetHintKey) : null;
}

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
        categoryId: category.id,
        optionId: selectedOption.id,
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

function resolvePresetTopTypeKey(preset: RecommendationCard): string | null {
  if (preset.sourceTypeId && getWeddingHairstyleByFilterKey(preset.sourceTypeId)) {
    return preset.sourceTypeId;
  }

  return RECOMMENDATION_HINTS[preset.id]?.exactKeys[0] ?? null;
}

function rankRecommendations(recommendations: RecommendationCard[], selectedValues: string[]): RankedRecommendation[] {
  return recommendations
    .map((item, sourceIndex) => {
      const score = item.tags.reduce((total, tag) => total + (selectedValues.includes(tag) ? 1 : 0), 0);
      return { item, score, sourceIndex };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.sourceIndex - b.sourceIndex;
    });
}

function rankTop100Items(
  items: ResolvedWeddingHairstyleRecord[],
  rankedRecommendations: RankedRecommendation[],
  hasActiveSelection: boolean,
  preferredTopTypeKey?: string | null,
): ResolvedWeddingHairstyleRecord[] {
  const liveItems = items.filter((item) => item.hasLiveImage);

  if (!hasActiveSelection) {
    if (!preferredTopTypeKey) {
      return liveItems;
    }

    const preferredIndex = liveItems.findIndex((item) => item.mastersFilterKey === preferredTopTypeKey);

    if (preferredIndex <= 0) {
      return liveItems;
    }

    const preferredItem = liveItems[preferredIndex];
    return [preferredItem, ...liveItems.slice(0, preferredIndex), ...liveItems.slice(preferredIndex + 1)];
  }

  const positiveRecommendations = rankedRecommendations.filter((entry) => entry.score > 0).slice(0, 3);

  if (positiveRecommendations.length === 0) {
    return [];
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

    const preferredTopTypeBoost = preferredTopTypeKey === item.mastersFilterKey ? 80 : 0;

    return { item, score: score + preferredTopTypeBoost, index };
  });

  const positiveItems = scoredItems.filter((entry) => entry.score > 0);

  if (positiveItems.length === 0) {
    return [];
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
  const [queryHairstyleKey, setQueryHairstyleKey] = useState<string | null>(null);
  const [preferredTopTypeKey, setPreferredTopTypeKey] = useState<string | null>(() =>
    resolveInitialHairstyleKey(initialHairstyleKey),
  );
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const initialContextHairstyleKey = useMemo(
    () => queryHairstyleKey ?? resolveInitialHairstyleKey(initialHairstyleKey),
    [queryHairstyleKey, initialHairstyleKey],
  );

  useEffect(() => {
    const initialQueryValue = new URLSearchParams(window.location.search).get("hairstyle");
    setQueryHairstyleKey(resolveInitialHairstyleKey(initialQueryValue));
  }, []);

  useEffect(() => {
    if (hasUserInteracted) {
      return;
    }

    setPreferredTopTypeKey(initialContextHairstyleKey);
  }, [hasUserInteracted, initialContextHairstyleKey]);

  const appliedFilters = useMemo(
    () => buildAppliedFilters(selector.categories, selected),
    [selector.categories, selected],
  );

  const selectedValues = useMemo(() => Object.values(selected).filter(Boolean), [selected]);
  const hasActiveSelection = selectedValues.length > 0;

  const rankedRecommendations = useMemo(
    () => rankRecommendations(recommendations, selectedValues),
    [recommendations, selectedValues],
  );

  const previewRecommendations = useMemo(() => {
    if (!hasActiveSelection) {
      return recommendations.slice(0, 3).map((item, sourceIndex) => ({ item, score: 0, sourceIndex }));
    }

    return rankedRecommendations.filter((entry) => entry.score > 0).slice(0, 3);
  }, [hasActiveSelection, rankedRecommendations, recommendations]);

  const rankedTop100Items = useMemo(
    () => rankTop100Items(top100Items, rankedRecommendations, hasActiveSelection, preferredTopTypeKey),
    [top100Items, rankedRecommendations, hasActiveSelection, preferredTopTypeKey],
  );

  const contextualHairstyleKey = useMemo(() => {
    if (preferredTopTypeKey) {
      return preferredTopTypeKey;
    }

    if (hasActiveSelection) {
      return rankedTop100Items[0]?.mastersFilterKey;
    }

    if (!hasUserInteracted) {
      return initialContextHairstyleKey ?? undefined;
    }

    return undefined;
  }, [preferredTopTypeKey, hasActiveSelection, hasUserInteracted, initialContextHairstyleKey, rankedTop100Items]);

  const contextualHairstyle = useMemo(
    () => (contextualHairstyleKey ? getWeddingHairstyleByFilterKey(contextualHairstyleKey) : null),
    [contextualHairstyleKey],
  );

  const handleClear = () => {
    setHasUserInteracted(true);
    setPreferredTopTypeKey(null);
    setActivePresetId(null);
    setSelected(buildEmptySelection(selector.categories));
  };

  const handleToggleOption = (categoryId: string, optionId: string) => {
    setHasUserInteracted(true);
    setPreferredTopTypeKey(null);
    setActivePresetId(null);
    setSelected((current) => ({
      ...current,
      [categoryId]: current[categoryId] === optionId ? "" : optionId,
    }));
  };

  const handleRemoveFilter = (categoryId: string) => {
    setHasUserInteracted(true);
    setPreferredTopTypeKey(null);
    setActivePresetId(null);
    setSelected((current) => ({
      ...current,
      [categoryId]: "",
    }));
  };

  const handleApplyPreset = (preset: RecommendationCard) => {
    setHasUserInteracted(true);
    setPreferredTopTypeKey(resolvePresetTopTypeKey(preset));
    setActivePresetId(preset.id);
    setSelected(buildSelectionFromPreset(selector.categories, preset));
  };

  const handleOpenMasters = (hairstyleKey?: string) => {
    const normalizedHairstyleKey = resolveInitialHairstyleKey(hairstyleKey);

    if (normalizedHairstyleKey) {
      setPreferredTopTypeKey(normalizedHairstyleKey);
    }

    const target = document.getElementById("wedding-hairstyle-masters");
    const focusTarget = document.getElementById("performers");

    if (typeof window !== "undefined") {
      const nextUrl = new URL(window.location.href);

      if (normalizedHairstyleKey) {
        nextUrl.searchParams.set("hairstyle", normalizedHairstyleKey);
      }

      nextUrl.hash = "wedding-hairstyle-masters";
      window.history.replaceState(null, "", nextUrl);

      window.requestAnimationFrame(() => {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target?.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
        focusTarget?.focus({ preventScroll: true });
      });
    }
  };

  const bridgeTitle = contextualHairstyle
    ? "Показать мастеров под выбранные стили"
    : "Сравнить мастеров по стилю";
  const bridgeText = contextualHairstyle
    ? `Ниже уже показаны мастера, которые чаще работают с направлениями вроде ${getWeddingHairstyleDisplayTitle(contextualHairstyle)}. Уточните дату, формат сборов и аксессуары в одном коротком брифе.`
    : "После просмотра карточек можно сразу перейти к мастерам и сравнить, кто работает под ваш формат сборов и тайминг дня.";

  return (
    <>
      <WeddingHairstylesGuidedSelector
        selector={selector}
        selected={selected}
        appliedFilters={appliedFilters}
        recommendations={previewRecommendations}
        presets={recommendations}
        activePresetId={activePresetId}
        onToggleOption={handleToggleOption}
        onRemoveFilter={handleRemoveFilter}
        onApplyPreset={handleApplyPreset}
        onClear={handleClear}
      />

      <WeddingHairstylesTop100Section
        items={rankedTop100Items}
        allItems={top100Items}
        totalCount={top100Items.filter((item) => item.hasLiveImage).length}
        appliedFilters={appliedFilters}
        onRemoveFilter={handleRemoveFilter}
        onClearFilters={handleClear}
        onOpenMasters={handleOpenMasters}
        bridgeTitle={bridgeTitle}
        bridgeText={bridgeText}
      />

      <WeddingHairstylesPerformerGrid section={performersSection} hairstyleKey={contextualHairstyleKey} />
    </>
  );
}
