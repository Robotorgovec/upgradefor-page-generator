import type { CSSProperties } from "react";

import styles from "./WeddingHairstylesPage.module.css";

const ICON_PATHS = {
  "bridal-guide": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-bridal-guide.svg",
  consultation: "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-consultation.svg",
  "face-shape": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-face-shape.svg",
  "faq-help": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-faq-help.svg",
  "hair-density": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-hair-density.svg",
  "hair-length": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-hair-length.svg",
  "hair-prep": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-hair-prep.svg",
  "mobile-service": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-mobile-service.svg",
  "neckline-dress": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-neckline-dress.svg",
  "preparation-checklist":
    "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-preparation-checklist.svg",
  "premium-salon": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-premium-salon.svg",
  "price-guide": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-price-guide.svg",
  "private-master": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-private-master.svg",
  "reference-photo": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-reference-photo.svg",
  "style-catalog": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-style-catalog.svg",
  "trial-session": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-trial-session.svg",
  "veil-accessory": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-veil-accessory.svg",
  "weather-resistant": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-weather-resistant.svg",
} as const;

export type WeddingHairstylesIconName = keyof typeof ICON_PATHS;

const INLINE_ICON_PATHS: Partial<Record<WeddingHairstylesIconName, readonly string[]>> = {
  "bridal-guide": [
    "M4 4.5h4.5",
    "M4 4.5V9",
    "M4 19.5V15",
    "M4 19.5h4.5",
    "m4.9 12.9 1.7 1.8 3.4-4",
    "M15 4.8c-1.9 0-3.8.9-4.7 2.6-.7 1.3-.7 3 .1 4.2.3.6.4 1.2.3 1.9-.2 1.1-.8 2.2-1.8 3.1",
    "M13.3 6.2c1.9-.4 4.2.1 5.5 1.6 1 1.2 1.3 3 .6 4.5-.3.8-.1 1.7.5 2.3.6.7.9 1.5.9 2.4",
    "M16.2 16.4c1.4 0 2.6 1.1 2.6 2.5s-1.2 2.6-2.6 2.6",
    "M8.6 18.8c1.1.6 2.3.9 3.7.9 1.7 0 3.1-.5 4.2-1.5",
  ],
  "trial-session": [
    "M8.1 9.1c0-2.8 1.8-4.8 4.4-4.8s4.4 2 4.4 4.8",
    "M10.3 6.4c.6-.8 1.4-1.2 2.2-1.2 1.4 0 2.6 1.1 2.9 2.7",
    "M9.2 11.2c.1 2.6 1.5 4.7 3.3 4.7s3.2-2.1 3.3-4.7",
    "M10.1 18.8c.6-.7 1.4-1 2.4-1 .9 0 1.7.3 2.4 1",
    "M7.4 20.1c.8-1.5 2.8-2.4 5.1-2.4s4.3.9 5.1 2.4",
    "M10.3 3.8c.4-1 1.3-1.6 2.2-1.6 1.2 0 2.2 1 2.4 2.4",
    "M17.8 5.3 21 5.9",
    "M17.1 7.4 20.5 8",
    "M16.4 9.5 19.8 10.1",
  ],
  "face-shape": [
    "M12 2.8 18.6 8c.8.7 1.3 1.6 1.3 2.7 0 1.1-.5 2-1.3 2.7L12 18.6 5.4 13.4c-.8-.7-1.3-1.6-1.3-2.7 0-1.1.5-2 1.3-2.7L12 2.8Z",
    "M8.8 9.4c.1-2.4 1.3-4.2 3.2-4.2s3.1 1.8 3.2 4.2",
    "M9.3 9.7c0 3.1 1.3 5.7 2.7 5.7s2.7-2.6 2.7-5.7",
    "M9.9 7.5c.9.2 1.7.8 2.2 1.6.7-1.1 2-1.8 3.2-1.8",
    "M8.2 10.7h-.9",
    "M16.7 10.7h.9",
    "M11.5 2.3v.9",
    "M11.5 17v.9",
  ],
  "hair-length": [
    "M6 10.8h2.7",
    "M6 14.2h2.7",
    "M15.8 4.2c-1.3 0-2.4.4-3.3 1.2-.9.8-1.4 1.9-1.4 3.1 0 1 .3 1.9.8 2.7.4.5.5 1.1.5 1.7 0 2.3-.8 4.4-2.2 6.4",
    "M15.5 4.2c1.5 0 2.9.7 3.8 1.9.7 1 1.1 2.2 1.1 3.7 0 1.3-.4 2.4-1.1 3.4-.5.6-.8 1.4-.9 2.2-.1 1.4-.6 2.8-1.6 4",
    "M14 8.1c.8.2 1.6.5 2.2 1",
    "M13.4 20.2c1.3.6 2.8.6 4.1 0",
  ],
  "hair-density": [
    "M5 20v-4.2",
    "M7.5 20v-6.6",
    "M10 20v-5.1",
    "M15.7 4.1c-1.2 0-2.4.4-3.3 1.1-1 .8-1.5 1.8-1.5 3 0 1 .3 1.8.8 2.6.4.5.6 1 .6 1.6 0 2.2-.8 4.3-2.1 6.2",
    "M14.9 4.1c2.1 0 4.2 1.1 5.4 2.9.9 1.3 1.1 2.8.7 4.4-.2.7-.8 1.4-1.6 1.9",
    "M14.6 4.1c1.6 0 3.3.6 4.5 1.8",
    "M13.6 20c1.5.8 3.3.8 4.8 0",
  ],
  "neckline-dress": [
    "M7.5 3.8 6.8 8.9c-.1 1.1.2 2.1.9 3l1.4 1.7v6.6",
    "M16.5 3.8 17.2 8.9c.1 1.1-.2 2.1-.9 3l-1.4 1.7v6.6",
    "M7.5 3.8 12 7.3l4.5-3.5",
    "M9.1 20.2h5.8",
  ],
  "veil-accessory": [
    "M16.1 5.1c-1.2 0-2.2.4-3.1 1.2-.8.7-1.3 1.8-1.3 3 0 .9.3 1.7.8 2.4.3.5.5 1 .5 1.6 0 1.8-.8 3.6-2.2 5.2",
    "M15.9 5.1c1.5 0 2.9.7 3.7 1.8.6.9.9 2 .9 3.2 0 .9-.2 1.7-.6 2.5",
    "M15.2 4c.5-1 1.4-1.7 2.4-1.7 1.3 0 2.3 1 2.5 2.5",
    "M10.2 8.1c1 .2 1.8.8 2.3 1.6",
    "M12.8 7.8c.6.8 1.2 1.4 2 1.8",
    "M11 10.7c-1.7 1.7-3.8 3.8-6.2 5.5",
    "M5 16.2c1.2 2.2 3.4 3.5 6.4 3.9",
  ],
  "weather-resistant": [
    "M6 11.8c.9-1 2-1.5 3.1-1.5",
    "M4.6 14.4c1.2-1.4 2.8-2.1 4.5-2.1",
    "M14.9 5c-1.2 0-2.2.4-3 1.1-.8.7-1.3 1.8-1.3 3 0 .9.3 1.7.7 2.4.4.5.6 1.1.6 1.7 0 1.8-.9 3.5-2.3 5",
    "M14.7 5c1.6 0 3 .7 3.9 1.9.6.8 1 1.9 1 3.1",
    "M14.1 4c.5-1 1.4-1.7 2.5-1.7 1.2 0 2.2 1 2.5 2.4",
    "M16.4 4.6c2.1.1 4.1 1.1 5.2 2.9",
    "m19.4 4.1 1.4-2.1 1.4 2.1",
    "M10.2 17.7c1 .7 2.2 1.1 3.7 1.1",
  ],
};

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
  const sizeClass =
    size === "section" ? styles.pageIconSection : size === "pill" ? styles.pageIconPill : styles.pageIconInline;
  const inlinePaths = INLINE_ICON_PATHS[name];

  if (inlinePaths) {
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={[styles.pageIconSvg, sizeClass, className].filter(Boolean).join(" ")}
      >
        {inlinePaths.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    );
  }

  const src = ICON_PATHS[name];
  if (!src) return null;

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
