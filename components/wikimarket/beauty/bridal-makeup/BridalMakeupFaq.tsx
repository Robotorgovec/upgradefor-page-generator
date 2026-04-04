import styles from "./BridalMakeupPage.module.css";
import type { FaqItem } from "./data";

type BridalMakeupFaqProps = {
  items: FaqItem[];
};

export default function BridalMakeupFaq({ items }: BridalMakeupFaqProps) {
  return (
    <section id="faq" className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>FAQ по свадебному макияжу</h2>
        <p>Самые частые вопросы перед выбором визажиста, формата репетиции и финального образа.</p>
      </div>

      <div className={styles.faqList}>
        {items.map((item, index) => {
          const panelId = `bridal-makeup-faq-panel-${index + 1}`;

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



