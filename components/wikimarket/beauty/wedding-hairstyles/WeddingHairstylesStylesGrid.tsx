import styles from "./WeddingHairstylesPage.module.css";
import type { RecommendationCard } from "./data";

type WeddingHairstylesStylesGridProps = {
  items: RecommendationCard[];
};

export default function WeddingHairstylesStylesGrid({ items }: WeddingHairstylesStylesGridProps) {
  return (
    <div className={styles.stylesGrid}>
      {items.map((item) => (
        <article key={item.id} className={styles.styleCard}>
          <figure className={styles.styleImageSlot} aria-hidden="true">
            <span className="material-symbols-outlined">styler</span>
            <figcaption>Image slot</figcaption>
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
      ))}
    </div>
  );
}
