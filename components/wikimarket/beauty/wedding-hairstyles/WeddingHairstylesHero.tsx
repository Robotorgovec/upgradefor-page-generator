import styles from "./WeddingHairstylesPage.module.css";
import type { WeddingHairstylesPageData } from "./data";

type WeddingHairstylesHeroProps = {
  hero: WeddingHairstylesPageData["hero"];
};

const HERO_IMAGE_SRC =
  "/assets/media/wikimarket/beauty/wedding-hairstyles/upgr-wedding-hairstyles-hero-editorial-bride.webp";

const HERO_DECISION_STEPS = [
  "Параметры: платье, фата, длина, тайминг",
  "Top 100 поднимает ближайшие стили",
  "Выбранный стиль ведет к мастерам",
];

const HERO_DECISION_METRICS = [
  { value: "100", label: "стилей" },
  { value: "8", label: "параметров" },
  { value: "3", label: "профиля" },
];

export default function WeddingHairstylesHero({ hero }: WeddingHairstylesHeroProps) {
  return (
    <section className={styles.heroWrap}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.kicker}>{hero.kicker}</p>
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

          <p className={styles.heroActionNote}>{hero.actionNote}</p>
        </div>

        <div className={styles.heroVisual} data-wm-hero-image>
          <img
            className={styles.heroImage}
            src={HERO_IMAGE_SRC}
            alt={hero.imageAlt}
            width={1600}
            height={1600}
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />

          <div className={styles.heroDecisionPanel} aria-label="Как работает подбор свадебной прически">
            <div className={styles.heroDecisionHeader}>
              <p>Маршрут выбора</p>
              <span>без перегруза</span>
            </div>

            <ol className={styles.heroDecisionSteps}>
              {HERO_DECISION_STEPS.map((step, index) => (
                <li key={step}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {step}
                </li>
              ))}
            </ol>

            <div className={styles.heroDecisionMetrics} aria-label="Покрытие подбора">
              {HERO_DECISION_METRICS.map((metric) => (
                <span key={metric.label}>
                  <strong>{metric.value}</strong>
                  {metric.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.heroPoints}>
          {hero.points.map((point) => (
            <article key={point.title} className={styles.heroPointCard}>
              <h2>{point.title}</h2>
              <p>{point.text}</p>
            </article>
          ))}
        </div>

        <aside className={styles.heroAside}>
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
