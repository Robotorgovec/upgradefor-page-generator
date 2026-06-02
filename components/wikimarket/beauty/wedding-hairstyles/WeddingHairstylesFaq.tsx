import styles from "./WeddingHairstylesPage.module.css";
import type { FaqItem } from "./data";

type WeddingHairstylesFaqProps = {
  items: FaqItem[];
};

export default function WeddingHairstylesFaq({ items }: WeddingHairstylesFaqProps) {
  return (
    <section id="faq" className={styles.section} aria-labelledby="faq-title">
      <div className={styles.sectionHeader}>
        <h2 id="faq-title">FAQ по свадебным прическам</h2>
        <p>Самые частые вопросы невест перед бронированием мастера и выбором формата образа.</p>
      </div>

      <div className={styles.faqList}>
        {items.map((item, index) => {
          const questionId = `wedding-hairstyles-faq-question-${index + 1}`;
          const panelId = `wedding-hairstyles-faq-panel-${index + 1}`;

          return (
            <details key={item.question} className={styles.faqItem}>
              <summary id={questionId} aria-controls={panelId}>
                {item.question}
              </summary>
              <p id={panelId} aria-labelledby={questionId}>
                {item.answer}
              </p>
            </details>
          );
        })}
      </div>
    </section>
  );
}
