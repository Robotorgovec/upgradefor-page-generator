const ICONS = {
  "bridal-guide":
    "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-bridal-guide.svg",
  "trial-session":
    "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-trial-session.svg",
  "face-shape":
    "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-face-shape.svg",
  "hair-length":
    "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-hair-length.svg",
  "hair-density":
    "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-hair-density.svg",
  "neckline-dress":
    "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-neckline-dress.svg",
  "veil-accessory":
    "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-veil-accessory.svg",
  "weather-resistant":
    "/assets/icons/wikimarket/beauty/wedding-hairstyles/upgr-icon-wedding-hairstyles-weather-resistant.svg",
} as const;

export type WeddingHairstylesIconName = keyof typeof ICONS;

type WeddingHairstylesIconProps = {
  name: WeddingHairstylesIconName;
  className?: string;
};

export default function WeddingHairstylesIcon({ name, className }: WeddingHairstylesIconProps) {
  return <img className={className} src={ICONS[name]} alt="" aria-hidden="true" draggable={false} />;
}
