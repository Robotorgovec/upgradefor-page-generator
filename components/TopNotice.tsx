"use client";

import styles from "./TopNotice.module.css";

type TopNoticeProps = {
  onClose: () => void;
};

export default function TopNotice({ onClose }: TopNoticeProps) {
  return (
    <div className={styles.notice} role="status" aria-live="polite" data-debug="TOPNOTICE">
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
        onClick={onClose}
      >
        <span className={`material-symbols-outlined ${styles.closeIcon}`} aria-hidden="true">
          close
        </span>
      </button>
    </div>
  );
}
