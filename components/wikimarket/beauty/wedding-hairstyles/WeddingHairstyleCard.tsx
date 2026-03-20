import Link from "next/link";

import { buildWeddingHairstyleMastersHref, type ResolvedWeddingHairstyleRecord } from "./weddingHairstylesTop100Data";
import styles from "./WeddingHairstylesTop100Section.module.css";

type WeddingHairstyleCardProps = {
  hairstyle: ResolvedWeddingHairstyleRecord;
};

export default function WeddingHairstyleCard({ hairstyle }: WeddingHairstyleCardProps) {
  if (!hairstyle.liveImageSrc) {
    return null;
  }

  return (
    <article className={styles.card}>
      <Link className={styles.cardSurface} href={hairstyle.detailHref} prefetch={false}>
        <figure className={styles.imageWrap}>
          <img
            className={styles.image}
            src={hairstyle.liveImageSrc}
            alt={hairstyle.imageAlt}
            width={1200}
            height={1500}
            loading="lazy"
            decoding="async"
          />
        </figure>

        <div className={styles.cardBody}>
          <p className={styles.cardMeta}>
            {hairstyle.categoryLabel} / {hairstyle.vibeLabel}
          </p>
          <h3 className={styles.cardTitle}>{hairstyle.title}</h3>
          <p className={styles.cardSummary}>{hairstyle.description}</p>
        </div>
      </Link>

      <div className={styles.cardActions}>
        <Link className={styles.ctaPrimary} href={hairstyle.detailHref} prefetch={false}>
          Подробнее
        </Link>
        <a className={styles.ctaSecondary} href={buildWeddingHairstyleMastersHref(hairstyle.mastersFilterKey)}>
          Посмотреть мастеров
        </a>
      </div>
    </article>
  );
}

