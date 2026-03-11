import styles from "./WeddingHairstylesPage.module.css";
import type { RecommendationCard } from "./data";

type WeddingHairstylesStylesGridProps = {
  items: RecommendationCard[];
};

const STYLE_IMAGES: Record<RecommendationCard["id"], { src: string; alt: string }> = {
  "low-bun": {
    src: "/assets/media/wikimarket/beauty/wedding-hairstyles/upgr-wedding-hairstyle-low-bun-classic.webp",
    alt: "Classic low bun wedding hairstyle",
  },
  "hollywood-waves": {
    src: "/assets/media/wikimarket/beauty/wedding-hairstyles/upgr-wedding-hairstyle-hollywood-waves.webp",
    alt: "Hollywood waves bridal hairstyle",
  },
  "textured-updo": {
    src: "/assets/media/wikimarket/beauty/wedding-hairstyles/upgr-wedding-hairstyle-textured-updo.webp",
    alt: "Textured updo wedding hairstyle",
  },
  "high-bun": {
    src: "/assets/media/wikimarket/beauty/wedding-hairstyles/upgr-wedding-hairstyle-high-bun-elegant.webp",
    alt: "Elegant high bun bridal hairstyle",
  },
  "boho-braid": {
    src: "/assets/media/wikimarket/beauty/wedding-hairstyles/upgr-wedding-hairstyle-boho-braid.webp",
    alt: "Boho braid wedding hairstyle",
  },
  "half-up-half-down-curls": {
    src: "/assets/media/wikimarket/beauty/wedding-hairstyles/upgr-wedding-hairstyle-half-up-half-down-curls.webp",
    alt: "Half up half down bridal hairstyle",
  },
};

export default function WeddingHairstylesStylesGrid({ items }: WeddingHairstylesStylesGridProps) {
  return (
    <div className={styles.stylesGrid}>
      {items.map((item) => {
        const image = STYLE_IMAGES[item.id];

        return (
          <article key={item.id} className={styles.styleCard}>
            <figure className={styles.styleImageSlot}>
              <img
                className={styles.styleImage}
                src={image.src}
                alt={image.alt}
                width={1200}
                height={900}
                loading="lazy"
                decoding="async"
              />
            </figure>

            <h3>{item.title}</h3>
            <p>
              <strong>Кому подходит:</strong> {item.suitedFor}
            </p>
            <p>
              <strong>Ключевой эффект:</strong> {item.effect}
            </p>
            <p>
              <strong>Когда выбирать:</strong> {item.whenToChoose}
            </p>
            <a className={styles.inlineLink} href={item.ctaHref}>
              {item.ctaLabel}
            </a>
          </article>
        );
      })}
    </div>
  );
}
