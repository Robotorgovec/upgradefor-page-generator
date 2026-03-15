import styles from "./WeddingHairstylesPage.module.css";
import WeddingHairstylesIcon from "./WeddingHairstylesIcon";
import type { WeddingHairstylesPageData } from "./data";

type WeddingHairstylesHeroProps = {
  hero: WeddingHairstylesPageData["hero"];
};

const HERO_IMAGE_SRC =
  "/assets/media/wikimarket/beauty/wedding-hairstyles/upgr-wedding-hairstyles-hero-editorial-bride.webp";
const HERO_KICKER = "\u0413\u0438\u0434 \u043f\u043e \u0432\u044b\u0431\u043e\u0440\u0443";

export default function WeddingHairstylesHero({ hero }: WeddingHairstylesHeroProps) {
  return (
    <section className={styles.heroWrap}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.kicker}>
            <WeddingHairstylesIcon name="bridal-guide" className={styles.kickerIcon} />
            <span>{HERO_KICKER}</span>
          </p>
          <h1 className={styles.heroTitle}>{hero.title}</h1>
          <p className={styles.heroLead}>{hero.subtitle}</p>

          <ul className={styles.heroBadges} aria-label="\u0424\u043e\u0440\u043c\u0430\u0442\u044b \u0443\u0441\u043b\u0443\u0433\u0438">
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
          <div className={styles.heroVisual} data-wm-hero-image>
            <img
              className={styles.heroImage}
              src={HERO_IMAGE_SRC}
              alt="Premium wedding hairstyle for bride"
              width={1600}
              height={1600}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
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

      <ul className={styles.heroTrustStrip} aria-label="\u0414\u043e\u0432\u0435\u0440\u0438\u0435 \u0438 \u043f\u0440\u043e\u0437\u0440\u0430\u0447\u043d\u043e\u0441\u0442\u044c">
        {hero.trustStrip.map((item) => (
          <li key={item.label}>{item.label}</li>
        ))}
      </ul>
    </section>
  );
}