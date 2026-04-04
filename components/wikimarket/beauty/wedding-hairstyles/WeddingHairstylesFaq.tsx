import styles from "./WeddingHairstylesPage.module.css";
import type { FaqItem } from "./data";

type WeddingHairstylesFaqProps = {
  items: FaqItem[];
};

export default function WeddingHairstylesFaq({ items }: WeddingHairstylesFaqProps) {
  return (
    <section id="faq" className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>FAQ по свадебным прическам</h2>
        <p>Самые частые вопросы невест перед бронированием мастера и выбором формата образа.</p>
      </div>

      <div className={styles.faqList}>
        {items.map((item, index) => {
          const panelId = `wedding-hairstyles-faq-panel-${index + 1}`;

          return (
            <details key={item.question} className={styles.faqItem}>
              <summary aria-controls={panelId}>{item.question}</summary>
              <p id={panelId}>{item.answer}</p>
            </details>
          );
        })}
      </div>
    </section>
  );
}
