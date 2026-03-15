const ICONS = {
  "bridal-guide":
    "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-bridal-guide.svg",
  consultation:
    "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-consultation.svg",
  "face-shape": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-face-shape.svg",
  "faq-help": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-faq-help.svg",
  "hair-density":
    "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-hair-density.svg",
  "hair-length": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-hair-length.svg",
  "hair-prep": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-hair-prep.svg",
  "mobile-service":
    "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-mobile-service.svg",
  "neckline-dress":
    "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-neckline-dress.svg",
  "preparation-checklist":
    "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-preparation-checklist.svg",
  "premium-salon":
    "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-premium-salon.svg",
  "price-guide": "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-price-guide.svg",
  "private-master":
    "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-private-master.svg",
  "reference-photo":
    "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-reference-photo.svg",
  "style-catalog":
    "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-style-catalog.svg",
  "trial-session":
    "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-trial-session.svg",
  "veil-accessory":
    "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-veil-accessory.svg",
} as const;

export type WeddingHairstylesIconName = keyof typeof ICONS;

type WeddingHairstylesIconProps = {
  name: WeddingHairstylesIconName;
  size?: "section" | "inline" | "pill";
  className?: string;
};

const BASE_STYLE = {
  display: "block",
  flexShrink: 0,
} as const;

export default function WeddingHairstylesIcon({
  name,
  size = "inline",
  className,
}: WeddingHairstylesIconProps) {
  const style = className
    ? BASE_STYLE
    : size === "section"
      ? { ...BASE_STYLE, width: 24, height: 24 }
      : { ...BASE_STYLE, width: 20, height: 20 };

  return (
    <img
      className={className}
      src={ICONS[name]}
      alt=""
      aria-hidden="true"
      draggable={false}
      loading="lazy"
      decoding="async"
      style={style}
    />
  );
}