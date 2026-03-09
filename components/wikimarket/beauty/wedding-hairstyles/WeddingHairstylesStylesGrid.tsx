import styles from "./WeddingHairstylesPage.module.css";
import type { PopularStyleCard } from "./data";

type WeddingHairstylesStylesGridProps = {
  items: PopularStyleCard[];
};

export default function WeddingHairstylesStylesGrid({ items }: WeddingHairstylesStylesGridProps) {
  return (
    <div className={styles.stylesGrid}>
      {items.map((item) => (
        <article key={item.id} className={styles.styleCard}>
          <h3>{item.title}</h3>
          <p>{item.whenFits}</p>
          <p>{item.hairAndLookFit}</p>
          <a className={styles.inlineLink} href={item.ctaHref}>
            {item.ctaLabel}
          </a>
        </article>
      ))}
    </div>
  );
}
