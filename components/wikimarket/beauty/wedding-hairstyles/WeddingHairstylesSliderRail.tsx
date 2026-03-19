"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import type { ResolvedWeddingHairstyleRecord } from "./weddingHairstylesTop100Data";
import WeddingHairstyleCard from "./WeddingHairstyleCard";
import styles from "./WeddingHairstylesTop100Section.module.css";

type WeddingHairstylesSliderRailProps = {
  items: ResolvedWeddingHairstyleRecord[];
};

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function WeddingHairstylesSliderRail({ items }: WeddingHairstylesSliderRailProps) {
  const viewportId = useId();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(items.length > 1);

  const refreshControls = useCallback(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    setCanScrollPrev(viewport.scrollLeft > 8);
    setCanScrollNext(viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth - 8);
  }, []);

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
  }, [items.length, refreshControls]);

  const scrollByDirection = (direction: 1 | -1) => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const scrollAmount = Math.max(viewport.clientWidth * 0.84, 280) * direction;

    viewport.scrollBy({
      left: scrollAmount,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  return (
    <div className={styles.railShell}>
      <div className={styles.railHeader}>
        <div>
          <h3>Live image rail</h3>
          <p>Touch, trackpad, keyboard, and buttons all use the same scroll-snap rail without a heavy carousel dependency.</p>
        </div>

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
          {items.map((item) => (
            <WeddingHairstyleCard key={item.slug} hairstyle={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
