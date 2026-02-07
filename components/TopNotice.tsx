"use client";

import { useEffect, useState } from "react";

import styles from "./TopNotice.module.css";

export default function TopNotice() {
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleToggle = () => {
      setIsVisible((prev) => !prev);
    };

    window.addEventListener("upgr:topnotice-toggle", handleToggle);
    setIsReady(true);

    return () => {
      window.removeEventListener("upgr:topnotice-toggle", handleToggle);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isReady || !isVisible) {
    return null;
  }

  return (
    <div
      className={styles.notice}
      role="status"
      aria-live="polite"
      id="top-notice"
      data-debug="TOPNOTICE"
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
        onClick={handleDismiss}
      >
        <span className={`material-symbols-outlined ${styles.closeIcon}`} aria-hidden="true">
          close
        </span>
      </button>
    </div>
  );
}
