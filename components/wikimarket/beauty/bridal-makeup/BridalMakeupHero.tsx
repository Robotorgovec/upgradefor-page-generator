import styles from "./BridalMakeupPage.module.css";
import type { BridalMakeupPageData } from "./data";

type BridalMakeupHeroProps = {
  hero: BridalMakeupPageData["hero"];
};

export default function BridalMakeupHero({ hero }: BridalMakeupHeroProps) {
  return (
    <section className={styles.heroWrap}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.kicker}>WikiMarket / Красота</p>
          <h1 className={styles.heroTitle}>{hero.title}</h1>
          <p className={styles.heroLead}>{hero.subtitle}</p>

          <ul className={styles.heroBadges} aria-label="Форматы услуги">
            {hero.badges.map((badge) => (
              <li key={badge.label}>{badge.label}</li>
            ))}
          </ul>

          <div className={styles.heroActions}>
            <a className={`${styles.btn} ${styles.btnPrimary}`} href={hero.primaryCta.href}>
              {hero.primaryCta.label}
            </a>
            <a className={`${styles.btn} ${styles.btnSecondary}`} href={hero.secondaryCta.href}>
              {hero.secondaryCta.label}
            </a>
          </div>

          <div className={styles.heroPoints}>
            {hero.points.map((point) => (
              <article key={point.title} className={styles.heroPointCard}>
                <h2>{point.title}</h2>
                <p>{point.text}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className={styles.heroAside}>
          <div className={styles.heroVisual} aria-hidden="true" data-wm-hero-image>
            <div className={styles.heroVisualOrb} />
            <div className={styles.heroVisualGrid} />
            <p>Bridal makeup map</p>
          </div>

          <article className={styles.heroSupportCard}>
            <h2>{hero.supportCard.title}</h2>
            <p>{hero.supportCard.text}</p>
            <a className={`${styles.btn} ${styles.btnSecondary}`} href={hero.supportCard.microCtaHref}>
              {hero.supportCard.microCtaLabel}
            </a>
          </article>
        </aside>
      </div>

      <ul className={styles.heroTrustStrip} aria-label="Доверие и прозрачность">
        {hero.trustStrip.map((item) => (
          <li key={item.label}>{item.label}</li>
        ))}
      </ul>
    </section>
  );
}



