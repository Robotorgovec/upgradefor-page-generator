"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import type { ResolvedWeddingHairstyleRecord } from "./weddingHairstylesTop100Data";
import WeddingHairstyleCard from "./WeddingHairstyleCard";
import styles from "./WeddingHairstylesTop100Section.module.css";

type WeddingHairstylesSliderRailProps = {
  items: ResolvedWeddingHairstyleRecord[];
};

const INITIAL_CHUNK_SIZE = 12;
const CHUNK_SIZE = 12;
const PRIORITY_CARD_COUNT = 4;

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
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [renderedCount, setRenderedCount] = useState(() => Math.min(INITIAL_CHUNK_SIZE, items.length));
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
  }, [hasMore]);

  useEffect(() => {
    setRenderedCount(Math.min(INITIAL_CHUNK_SIZE, items.length));
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

    return () => {
      viewport.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
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
    <div className={styles.railShell}>
      <div className={styles.railHeader}>
        <div>
          <h3>One horizontal Top 100 rail</h3>
          <p>All approved cards live in one swipeable feed and append in 12-card chunks as the user moves through the rail.</p>
        </div>

        <div className={styles.railMeta}>
          <span className={styles.railProgress}>
            {renderedItems.length} / {items.length} loaded
          </span>

          <div className={styles.railControls}>
            <button
              type="button"
              className={styles.railButton}
              aria-label="Прокрутить карточки назад"
              aria-controls={viewportId}
              disabled={!canScrollPrev}
              onClick={() => scrollByDirection(-1)}
            >
              {"<"}
            </button>
            <button
              type="button"
              className={styles.railButton}
              aria-label="Прокрутить карточки вперед"
              aria-controls={viewportId}
              disabled={!canScrollNext}
              onClick={() => scrollByDirection(1)}
            >
              {">"}
            </button>
          </div>
        </div>
      </div>

      <div
        id={viewportId}
        ref={viewportRef}
        className={styles.viewport}
        tabIndex={0}
        aria-label="Top 100 wedding hairstyles slider"
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
            <div key={item.slug} className={styles.slide} data-card-slide="true">
              <WeddingHairstyleCard hairstyle={item} priority={index < PRIORITY_CARD_COUNT} />
            </div>
          ))}
          {hasMore ? <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" /> : null}
        </div>
      </div>
    </div>
  );
}
