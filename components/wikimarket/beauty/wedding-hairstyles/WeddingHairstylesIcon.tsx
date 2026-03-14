import type { CSSProperties } from "react";

import styles from "./WeddingHairstylesPage.module.css";

const ICON_PATHS = {
  "bridal-guide": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-bridal-guide.svg",
  consultation: "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-consultation.svg",
  "face-shape": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-face-shape.svg",
  "faq-help": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-faq-help.svg",
  "hair-length": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-hair-length.svg",
  "hair-prep": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-hair-prep.svg",
  "mobile-service": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-mobile-service.svg",
  "preparation-checklist":
    "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-preparation-checklist.svg",
  "premium-salon": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-premium-salon.svg",
  "price-guide": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-price-guide.svg",
  "private-master": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-private-master.svg",
  "reference-photo": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-reference-photo.svg",
  "style-catalog": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-style-catalog.svg",
  "trial-session": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-trial-session.svg",
  "veil-accessory": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-veil-accessory.svg",
} as const;

export type WeddingHairstylesIconName = keyof typeof ICON_PATHS;

type WeddingHairstylesIconProps = {
  name: WeddingHairstylesIconName;
  size?: "section" | "inline" | "pill";
  className?: string;
};

export default function WeddingHairstylesIcon({
  name,
  size = "inline",
  className,
}: WeddingHairstylesIconProps) {
  const src = ICON_PATHS[name];
  if (!src) return null;

  const sizeClass =
    size === "section" ? styles.pageIconSection : size === "pill" ? styles.pageIconPill : styles.pageIconInline;

  const style = {
    "--wedding-hairstyles-icon-mask": `url("${src}")`,
  } as CSSProperties;

  return (
    <span
      aria-hidden="true"
      className={[styles.pageIcon, sizeClass, className].filter(Boolean).join(" ")}
      style={style}
    />
  );
}