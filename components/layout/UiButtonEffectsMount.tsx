"use client";

import { useEffect } from "react";

function addRipple(el: HTMLElement, x: number, y: number) {
  const rect = el.getBoundingClientRect();
  const size = Math.ceil(Math.max(rect.width, rect.height) * 1.2);
  const ripple = document.createElement("span");
  ripple.className = "ui-btn__ripple";
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${x - rect.left - size / 2}px`;
  ripple.style.top = `${y - rect.top - size / 2}px`;
  el.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
}

export default function UiButtonEffectsMount() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const btn = target?.closest?.(".ui-btn") as HTMLElement | null;
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const mx = Math.max(0, Math.min(100, (px / rect.width) * 100));

      btn.style.setProperty("--mx", `${mx}%`);
      btn.style.setProperty("--sx", `${px}px`);
      btn.style.setProperty("--sy", `${py}px`);
    };

    const onLeave = (e: Event) => {
      const target = e.target as HTMLElement | null;
      const btn = target?.closest?.(".ui-btn") as HTMLElement | null;
      if (!btn) return;

      btn.style.removeProperty("--mx");
      btn.style.removeProperty("--sx");
      btn.style.removeProperty("--sy");
    };

    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const btn = target?.closest?.(".ui-btn") as HTMLElement | null;
      if (!btn || btn.hasAttribute("disabled") || btn.getAttribute("aria-disabled") === "true") return;

      addRipple(btn, e.clientX, e.clientY);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerleave", onLeave, true);

    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave, true);
    };
  }, []);

  return null;
}
