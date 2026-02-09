"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./TopNotice.module.css";

const STORAGE_COUNT_KEY = "upgr_notice_count";
const STORAGE_DISMISSED_KEY = "upgr_home_notice_dismissed";
const NOTICE_BELL_SELECTOR = 'button.icon-btn[aria-label="Уведомления"]';
const BADGE_ATTR = "data-upgr-bell-badge";
const BOUND_ATTR = "data-upgr-notice-bound";

const getBellButton = () => {
  const directButton = document.querySelector<HTMLButtonElement>(NOTICE_BELL_SELECTOR);
  if (directButton) {
    return directButton;
  }

  const iconFallback = Array.from(
    document.querySelectorAll<HTMLElement>(".header-icons .material-symbols-outlined"),
  ).find((icon) => icon.textContent?.trim() === "notifications");

  return iconFallback?.closest("button") ?? null;
};

const formatBadgeValue = (count: number) => {
  if (count <= 0) return "";
  if (count >= 10) return "9+";
  return String(count);
};

const applyBadgeStyles = (badge: HTMLSpanElement) => {
  badge.style.position = "absolute";
  badge.style.top = "-2px";
  badge.style.right = "-2px";
  badge.style.minWidth = "16px";
  badge.style.height = "16px";
  badge.style.padding = "0 4px";
  badge.style.borderRadius = "999px";
  badge.style.fontSize = "11px";
  badge.style.lineHeight = "16px";
  badge.style.display = "flex";
  badge.style.alignItems = "center";
  badge.style.justifyContent = "center";
  badge.style.background = "var(--color-primary)";
  badge.style.color = "#fff";
  badge.style.boxShadow = "0 0 0 1px rgba(0,0,0,0.1)";
};

const clearBellBadge = () => {
  const bellButton = getBellButton();
  if (!bellButton) {
    return;
  }

  const badge = bellButton.querySelector<HTMLSpanElement>(`[${BADGE_ATTR}="1"]`);
  if (badge) {
    badge.remove();
  }

  bellButton.setAttribute("aria-label", "Уведомления, непрочитанных: 0");
};

export default function TopNotice() {
  const [isVisible, setIsVisible] = useState(false);
  const [noticeCount, setNoticeCount] = useState(1);
  const [dismissed, setDismissed] = useState(false);
  const noticeCountRef = useRef(noticeCount);
  const dismissedRef = useRef(dismissed);

  useEffect(() => {
    const storedDismissed = window.localStorage.getItem(STORAGE_DISMISSED_KEY);
    if (storedDismissed === "1") {
      setDismissed(true);
      setNoticeCount(0);
      clearBellBadge();
      return;
    }

    const storedCount = window.localStorage.getItem(STORAGE_COUNT_KEY);
    if (storedCount) {
      const parsed = Number.parseInt(storedCount, 10);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        setNoticeCount(parsed);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_COUNT_KEY, String(noticeCount));
  }, [noticeCount]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_DISMISSED_KEY, dismissed ? "1" : "0");
  }, [dismissed]);

  useEffect(() => {
    noticeCountRef.current = noticeCount;
    dismissedRef.current = dismissed;
  }, [noticeCount, dismissed]);

  useEffect(() => {
    const updateBadge = (bellButton: HTMLButtonElement) => {
      if (dismissed) {
        clearBellBadge();
        return;
      }
      const badgeValue = formatBadgeValue(noticeCount);
      let badge = bellButton.querySelector<HTMLSpanElement>(`[${BADGE_ATTR}="1"]`);

      if (!badgeValue) {
        badge?.remove();
      } else {
        if (!badge) {
          badge = document.createElement("span");
          badge.setAttribute(BADGE_ATTR, "1");
          badge.className = "upgr-bell-badge";
          bellButton.appendChild(badge);
        }
        applyBadgeStyles(badge);
        const computed = window.getComputedStyle(bellButton).position;
        if (computed === "static") {
          bellButton.style.position = "relative";
        }
        badge.textContent = badgeValue;
      }

      bellButton.setAttribute(
        "aria-label",
        `Уведомления, непрочитанных: ${Math.max(noticeCount, 0)}`,
      );
    };

    let observer: MutationObserver | null = null;
    let bellButton = getBellButton();

    if (bellButton) {
      updateBadge(bellButton);
    } else {
      observer = new MutationObserver(() => {
        bellButton = getBellButton();
        if (bellButton) {
          updateBadge(bellButton);
          observer?.disconnect();
          observer = null;
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      observer?.disconnect();
    };
  }, [noticeCount, dismissed]);

  useEffect(() => {
    let observer: MutationObserver | null = null;
    let removeListener: (() => void) | null = null;

    const attachListener = (button: HTMLButtonElement) => {
      if (button.getAttribute(BOUND_ATTR) === "1") {
        return;
      }
      const handler = () => {
        if (dismissedRef.current || noticeCountRef.current <= 0) {
          return;
        }
        setIsVisible((prev) => !prev);
      };
      button.addEventListener("click", handler);
      removeListener = () => button.removeEventListener("click", handler);
      button.setAttribute(BOUND_ATTR, "1");
    };

    const bellButton = getBellButton();
    if (bellButton) {
      attachListener(bellButton);
    } else {
      observer = new MutationObserver(() => {
        const nextButton = getBellButton();
        if (nextButton) {
          attachListener(nextButton);
          observer?.disconnect();
          observer = null;
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      removeListener?.();
      observer?.disconnect();
    };
  }, [noticeCount]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={styles.notice}
      role="status"
      aria-live="polite"
      data-debug="TOPNOTICE"
      id="top-notice"
    >
      <div className={styles.iconBlock}>
        <span className={`material-symbols-outlined ${styles.bellIcon}`} aria-hidden="true">
          notifications
        </span>
        <span className={styles.badge}>BETA</span>
      </div>
      <p className={styles.text}>
        Новый сервис. Публикуем статус разделов, план развития и журнал изменений — ваши идеи
        помогают расставлять приоритеты.
      </p>
      <button
        className={styles.closeButton}
        type="button"
        aria-label="Закрыть уведомление"
        onClick={() => {
          clearBellBadge();
          setDismissed(true);
          setNoticeCount(0);
          setIsVisible(false);
          window.localStorage.setItem(STORAGE_COUNT_KEY, "0");
          window.localStorage.setItem(STORAGE_DISMISSED_KEY, "1");
        }}
      >
        <span className={`material-symbols-outlined ${styles.closeIcon}`} aria-hidden="true">
          close
        </span>
      </button>
    </div>
  );
}
