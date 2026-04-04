import styles from "./BridalMakeupPage.module.css";
import type { ScenarioItem } from "./data";

type BridalMakeupScenariosProps = {
  items: ScenarioItem[];
};

export default function BridalMakeupScenarios({ items }: BridalMakeupScenariosProps) {
  return (
    <section id="personal-scenarios" className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>Что выбрать именно вам?</h2>
        <p>Короткие сценарии, которые помогают быстро сузить выбор перед брифом мастеру.</p>
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


