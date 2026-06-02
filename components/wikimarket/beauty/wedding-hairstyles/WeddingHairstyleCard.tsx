import Link from "next/link";

import { buildWeddingHairstyleMastersHref, type ResolvedWeddingHairstyleRecord } from "./weddingHairstylesTop100Data";
import {
  getWeddingHairstyleDisplayDescription,
  getWeddingHairstyleDisplayImageAlt,
  getWeddingHairstyleDisplayTitle,
} from "./weddingHairstylesDisplayText";
import styles from "./WeddingHairstylesTop100Section.module.css";

type WeddingHairstyleCardProps = {
  hairstyle: ResolvedWeddingHairstyleRecord;
  eager?: boolean;
  priority?: boolean;
};

export default function WeddingHairstyleCard({
  hairstyle,
  eager = false,
  priority = false,
}: WeddingHairstyleCardProps) {
  if (!hairstyle.liveImageSrc) {
    return null;
  }

  const displayTitle = getWeddingHairstyleDisplayTitle(hairstyle);
  const titleId = `top100-card-${hairstyle.slug}-title`;

  return (
    <article className={styles.card} aria-labelledby={titleId}>
      <Link
        className={styles.cardSurface}
        href={hairstyle.detailHref}
        aria-label={`Открыть карточку: ${displayTitle}`}
        prefetch={false}
      >
        <figure className={styles.imageWrap}>
          <img
            className={styles.image}
            src={hairstyle.liveImageSrc}
            alt={getWeddingHairstyleDisplayImageAlt(hairstyle)}
            width={1200}
            height={1500}
            loading={eager || priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
          />
        </figure>

        <div className={styles.cardBody}>
          <p className={styles.cardMeta}>
            {hairstyle.categoryLabel} / {hairstyle.vibeLabel}
          </p>
          <h3 id={titleId} className={styles.cardTitle}>
            {displayTitle}
          </h3>
          <ul className={styles.cardFacts}>
            <li>
              <span>Подходит:</span> {hairstyle.hairLengthNote}
            </li>
            <li>
              <span>Эффект:</span> {getWeddingHairstyleDisplayDescription(hairstyle)}
            </li>
            <li>
              <span>На что смотреть:</span> {hairstyle.textureNote}
            </li>
          </ul>
        </div>
      </Link>

      <div className={styles.cardActions}>
        <Link
          className={styles.ctaPrimary}
          href={hairstyle.detailHref}
          aria-label={`Подробнее о стиле: ${displayTitle}`}
          prefetch={false}
        >
          Подробнее
        </Link>
        <a
          className={styles.ctaSecondary}
          href={buildWeddingHairstyleMastersHref(hairstyle.mastersFilterKey)}
          aria-label={`Мастера под стиль: ${displayTitle}`}
        >
          Мастера под этот стиль
        </a>
      </div>
    </article>
  );
}
