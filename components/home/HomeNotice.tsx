"use client";

import { useEffect, useState } from "react";

import TopNotice from "../TopNotice";

import styles from "./HomeNotice.module.css";

const STORAGE_KEY = "topNoticeDismissed_v1";
const NOTICE_BUTTON_SELECTOR = "[data-notice-button]";
const NOTICE_BADGE_SELECTOR = "[data-notice-badge]";

export default function HomeNotice() {
  const [hasNotice, setHasNotice] = useState(true);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);

  useEffect(() => {
    const dismissed = window.localStorage.getItem(STORAGE_KEY) === "1";
    setHasNotice(!dismissed);
    setIsNoticeOpen(false);
  }, []);

  useEffect(() => {
    const button = document.querySelector<HTMLButtonElement>(NOTICE_BUTTON_SELECTOR);
    if (!button) return;

    const handleClick = (event: MouseEvent) => {
      if (!hasNotice) {
        event.preventDefault();
        return;
      }
      setIsNoticeOpen((prev) => !prev);
    };

    button.addEventListener("click", handleClick);
    return () => button.removeEventListener("click", handleClick);
  }, [hasNotice]);

  useEffect(() => {
    const button = document.querySelector<HTMLButtonElement>(NOTICE_BUTTON_SELECTOR);
    if (button) {
      button.disabled = !hasNotice;
      button.setAttribute("aria-disabled", String(!hasNotice));
      button.setAttribute("aria-expanded", String(isNoticeOpen));
    }

    const badge = document.querySelector<HTMLElement>(NOTICE_BADGE_SELECTOR);
    if (badge) {
      badge.classList.toggle("is-hidden", !hasNotice);
    }
  }, [hasNotice, isNoticeOpen]);

  const handleClose = () => {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setHasNotice(false);
    setIsNoticeOpen(false);
  };

  const isHidden = !hasNotice || !isNoticeOpen;

  return (
    <div
      id="top-notice"
      className={`${styles.noticeContainer} ${isHidden ? styles.isHidden : ""}`}
    >
      <TopNotice onClose={handleClose} />
    </div>
  );
}
