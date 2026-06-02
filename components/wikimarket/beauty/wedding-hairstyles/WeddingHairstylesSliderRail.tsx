"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import type { ResolvedWeddingHairstyleRecord } from "./weddingHairstylesTop100Data";
import WeddingHairstyleCard from "./WeddingHairstyleCard";
import styles from "./WeddingHairstylesTop100Section.module.css";

type WeddingHairstylesSliderRailProps = {
  items: ResolvedWeddingHairstyleRecord[];
};

type VisibleRange = {
  start: number;
  end: number;
  total: number;
};

const INITIAL_CHUNK_SIZE = 12;
const CHUNK_SIZE = 12;
const EAGER_CARD_COUNT = INITIAL_CHUNK_SIZE;
const HIGH_PRIORITY_CARD_COUNT = 4;
const VISIBILITY_SYNC_INTERVAL_MS = 250;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getScrollStep(viewport: HTMLDivElement) {
  const firstSlide = viewport.querySelector<HTMLElement>("[data-card-slide='true']");

  if (!firstSlide) {
    return Math.max(viewport.clientWidth * 0.84, 280);
  }

  const slideWidth = firstSlide.getBoundingClientRect().width;
  const gap = Number.parseFloat(window.getComputedStyle(viewport).getPropertyValue("--top100-track-gap")) || 16;
  const cardsPerStep = Math.max(1, Math.floor(viewport.clientWidth / Math.max(slideWidth, 1)) - 1);

  return Math.max((slideWidth + gap) * cardsPerStep, slideWidth + gap);
}

export default function WeddingHairstylesSliderRail({ items }: WeddingHairstylesSliderRailProps) {
  const viewportId = useId();
  const railTitleId = useId();
  const railDescriptionId = useId();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [renderedCount, setRenderedCount] = useState(() => Math.min(INITIAL_CHUNK_SIZE, items.length));
  const [visibleRange, setVisibleRange] = useState<VisibleRange>(() => ({
    start: items.length > 0 ? 1 : 0,
    end: Math.min(INITIAL_CHUNK_SIZE, items.length),
    total: items.length,
  }));
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(items.length > INITIAL_CHUNK_SIZE);

  const hasMore = renderedCount < items.length;
  const renderedItems = items.slice(0, renderedCount);

  const loadMore = useCallback(() => {
    setRenderedCount((current) => Math.min(current + CHUNK_SIZE, items.length));
  }, [items.length]);

  const refreshControls = useCallback(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const hasHorizontalNext = viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth - 8;
    setCanScrollPrev(viewport.scrollLeft > 8);
    setCanScrollNext(hasHorizontalNext || hasMore);

    const slides = Array.from(viewport.querySelectorAll<HTMLElement>("[data-card-slide='true']"));
    const viewportRect = viewport.getBoundingClientRect();
    const visibleIndexes = slides
      .map((slide, index) => ({ index, rect: slide.getBoundingClientRect() }))
      .filter(({ rect }) => rect.right > viewportRect.left + 8 && rect.left < viewportRect.right - 8)
      .map(({ index }) => index);

    const nextRange = {
      start: visibleIndexes.length > 0 ? visibleIndexes[0] + 1 : items.length > 0 ? 1 : 0,
      end: visibleIndexes.length > 0 ? visibleIndexes[visibleIndexes.length - 1] + 1 : Math.min(renderedCount, items.length),
      total: items.length,
    };

    setVisibleRange((currentRange) =>
      currentRange.start === nextRange.start &&
      currentRange.end === nextRange.end &&
      currentRange.total === nextRange.total
        ? currentRange
        : nextRange,
    );
  }, [hasMore, items.length, renderedCount]);

  useEffect(() => {
    const initialCount = Math.min(INITIAL_CHUNK_SIZE, items.length);
    setRenderedCount(initialCount);
    setVisibleRange({
      start: items.length > 0 ? 1 : 0,
      end: initialCount,
      total: items.length,
    });
  }, [items.length]);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    refreshControls();

    const handleScroll = () => refreshControls();
    viewport.addEventListener("scroll", handleScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => refreshControls());
    resizeObserver.observe(viewport);

    Array.from(viewport.children).forEach((child) => resizeObserver.observe(child));
    const visibilitySyncInterval = window.setInterval(refreshControls, VISIBILITY_SYNC_INTERVAL_MS);

    return () => {
      viewport.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
      window.clearInterval(visibilitySyncInterval);
    };
  }, [renderedCount, refreshControls]);

  useEffect(() => {
    if (!hasMore) {
      return;
    }

    const viewport = viewportRef.current;
    const sentinel = sentinelRef.current;

    if (!viewport || !sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      {
        root: viewport,
        rootMargin: "0px 240px 0px 0px",
        threshold: 0.25,
      },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, loadMore, renderedCount]);

  const scrollByDirection = useCallback(
    (direction: 1 | -1) => {
      const viewport = viewportRef.current;

      if (!viewport) {
        return;
      }

      const step = getScrollStep(viewport) * direction;
      const isAtEnd = viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 8;

      if (direction === 1 && hasMore && isAtEnd) {
        loadMore();

        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            viewport.scrollBy({
              left: step,
              behavior: prefersReducedMotion() ? "auto" : "smooth",
            });
          });
        });

        return;
      }

      viewport.scrollBy({
        left: step,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    },
    [hasMore, loadMore],
  );

  return (
    <section
      className={styles.railShell}
      role="region"
      aria-roledescription="carousel"
      aria-labelledby={railTitleId}
      aria-describedby={railDescriptionId}
    >
      <div className={styles.railHeader}>
        <div>
          <h3 id={railTitleId}>Приоритетные карточки</h3>
          <p id={railDescriptionId}>
            Листайте карточки, чтобы сравнить форму, эффект и сразу перейти к мастерам под выбранное направление.
          </p>
        </div>

        <div className={styles.railMeta}>
          <span
            className={styles.railProgress}
            role="status"
            aria-label={
              visibleRange.total > 0
                ? `Видно карточки ${visibleRange.start}-${visibleRange.end} из ${visibleRange.total}`
                : "Карточек пока нет"
            }
          >
            {visibleRange.total > 0
              ? `Видно ${visibleRange.start}-${visibleRange.end} из ${visibleRange.total}`
              : "Карточек пока нет"}
          </span>

          <div className={styles.railControls}>
            <button
              type="button"
              className={styles.railButton}
              aria-label={`Прокрутить карточки назад. Сейчас видно ${visibleRange.start}-${visibleRange.end} из ${visibleRange.total}`}
              aria-controls={viewportId}
              disabled={!canScrollPrev}
              onClick={() => scrollByDirection(-1)}
            >
              <span className={styles.railButtonIcon} aria-hidden="true">
                &lsaquo;
              </span>
            </button>
            <button
              type="button"
              className={styles.railButton}
              aria-label={`Прокрутить карточки вперед. Сейчас видно ${visibleRange.start}-${visibleRange.end} из ${visibleRange.total}`}
              aria-controls={viewportId}
              disabled={!canScrollNext}
              onClick={() => scrollByDirection(1)}
            >
              <span className={styles.railButtonIcon} aria-hidden="true">
                &rsaquo;
              </span>
            </button>
          </div>
        </div>
      </div>

      <div
        id={viewportId}
        ref={viewportRef}
        className={styles.viewport}
        tabIndex={0}
        aria-labelledby={railTitleId}
        aria-describedby={railDescriptionId}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            scrollByDirection(-1);
          }

          if (event.key === "ArrowRight") {
            event.preventDefault();
            scrollByDirection(1);
          }
        }}
      >
        <div className={styles.track}>
          {renderedItems.map((item, index) => (
            <div key={item.slug} className={styles.slide} data-card-slide="true" data-slot="slide">
              <WeddingHairstyleCard
                hairstyle={item}
                eager={index < EAGER_CARD_COUNT}
                priority={index < HIGH_PRIORITY_CARD_COUNT}
              />
            </div>
          ))}
          {hasMore ? <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" /> : null}
        </div>
      </div>
    </section>
  );
}
