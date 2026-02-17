"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import TopNotice from "../TopNotice";

const TOP_NOTICE_SLOT_SELECTOR = '[data-top-notice-slot="true"]';
const OBSERVER_TIMEOUT_MS = 8000;

export default function NotificationsTopNoticeMount() {
  const [slot, setSlot] = useState<Element | null>(null);

  useEffect(() => {
    let timeoutId: number | null = null;

    const resolveSlot = () => {
      const nextSlot = document.querySelector(TOP_NOTICE_SLOT_SELECTOR);
      setSlot((currentSlot) => (currentSlot === nextSlot ? currentSlot : nextSlot));
      return nextSlot;
    };

    if (resolveSlot()) {
      return;
    }

    const observer = new MutationObserver(() => {
      if (resolveSlot()) {
        observer.disconnect();
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
          timeoutId = null;
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    timeoutId = window.setTimeout(() => {
      observer.disconnect();
    }, OBSERVER_TIMEOUT_MS);

    return () => {
      observer.disconnect();
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  if (!slot || !slot.isConnected) {
    return null;
  }

  return createPortal(<TopNotice />, slot);
}
