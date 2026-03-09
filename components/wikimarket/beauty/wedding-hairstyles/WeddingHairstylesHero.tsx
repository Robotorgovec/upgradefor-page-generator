import styles from "./WeddingHairstylesPage.module.css";
import type { WeddingHairstylesPageData } from "./data";

type WeddingHairstylesHeroProps = {
  hero: WeddingHairstylesPageData["hero"];
};

export default function WeddingHairstylesHero({ hero }: WeddingHairstylesHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <p className={styles.kicker}>WikiMarket / Красота</p>
        <h1 className={styles.heroTitle}>{hero.title}</h1>
        <p className={styles.heroLead}>{hero.lead}</p>

        <div className={styles.heroActions}>
          <a className={`${styles.btn} ${styles.btnPrimary}`} href={hero.primaryCta.href}>
            {hero.primaryCta.label}
          </a>
          <a className={`${styles.btn} ${styles.btnSecondary}`} href={hero.secondaryCta.href}>
            {hero.secondaryCta.label}
          </a>
        </div>
      </div>

      <div className={styles.heroAccent} aria-hidden="true">
        <span className={`material-symbols-outlined ${styles.heroAccentIcon}`}>styler</span>
        <p className={styles.heroAccentText}>Коммерческая wiki-страница для выбора стиля и мастера</p>
      </div>
    </section>
  );
}
