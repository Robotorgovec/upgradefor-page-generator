import styles from "./WeddingHairstylesPage.module.css";
import type { WeddingHairstylesPageData } from "./data";

type WeddingHairstylesScenariosProps = {
  section: WeddingHairstylesPageData["scenariosSection"];
  items: WeddingHairstylesPageData["scenarios"];
};

export default function WeddingHairstylesScenarios({
  section,
  items,
}: WeddingHairstylesScenariosProps) {
  return (
    <section id="personal-scenarios" className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>{section.title}</h2>
        <p>{section.subtitle}</p>
      </div>

      <div className={styles.scenarioGrid}>
        {items.map((item) => (
          <article key={item.id} className={styles.scenarioCard}>
            <h3>{item.title}</h3>
            <p>{item.note}</p>
            <a className={styles.inlineLink} href={item.ctaHref}>
              {item.ctaLabel}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
