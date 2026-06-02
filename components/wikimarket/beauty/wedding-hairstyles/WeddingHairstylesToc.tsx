import styles from "./WeddingHairstylesPage.module.css";
import type { WeddingHairstylesPageData } from "./data";

type WeddingHairstylesTocProps = {
  toc: WeddingHairstylesPageData["toc"];
};

export default function WeddingHairstylesToc({ toc }: WeddingHairstylesTocProps) {
  return (
    <nav className={styles.toc} aria-label="Содержание страницы">
      <h2 className={styles.tocTitle}>{toc.title}</h2>
      <ul className={styles.tocList}>
        {toc.items.map((item) => (
          <li key={item.href}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
