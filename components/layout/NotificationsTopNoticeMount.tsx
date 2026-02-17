"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import TopNotice from "../TopNotice";

const TOP_NOTICE_SLOT_SELECTOR = '[data-top-notice-slot="true"]';

export default function NotificationsTopNoticeMount() {
  const [slot, setSlot] = useState<Element | null>(null);

  useEffect(() => {
    const resolveSlot = () => {
      const nextSlot = document.querySelector(TOP_NOTICE_SLOT_SELECTOR);
      setSlot(nextSlot);
      return nextSlot;
    };

    if (resolveSlot()) {
      return;
    }

    const observer = new MutationObserver(() => {
      if (resolveSlot()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  if (!slot) {
    return null;
  }

  return createPortal(<TopNotice />, slot);
}
