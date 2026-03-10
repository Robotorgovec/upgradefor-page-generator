import styles from "./WeddingHairstylesPage.module.css";
import type { TocItem } from "./data";

type WeddingHairstylesTocProps = {
  items: TocItem[];
};

export default function WeddingHairstylesToc({ items }: WeddingHairstylesTocProps) {
  return (
    <nav className={styles.toc} aria-label="Содержание страницы">
      <h2 className={styles.tocTitle}>Содержание</h2>
      <ul className={styles.tocList}>
        {items.map((item) => (
          <li key={item.href}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
