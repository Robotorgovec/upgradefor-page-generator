import styles from "./WeddingHairstylesPage.module.css";
import type { FaqItem } from "./data";

type WeddingHairstylesFaqProps = {
  items: FaqItem[];
};

export default function WeddingHairstylesFaq({ items }: WeddingHairstylesFaqProps) {
  return (
    <section id="faq" className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>FAQ</h2>
        <p>Частые вопросы по выбору свадебной прически и организации работы с мастером.</p>
      </div>

      <div className={styles.faqList}>
        {items.map((item) => (
          <details key={item.question} className={styles.faqItem}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
