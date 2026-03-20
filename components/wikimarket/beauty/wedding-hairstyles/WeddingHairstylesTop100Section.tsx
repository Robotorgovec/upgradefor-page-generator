import Link from "next/link";

import { getResolvedWeddingHairstylesTop100Registry, getWeddingHairstyleAssetAudit } from "./WeddingHairstylesTop100Assets.server";
import WeddingHairstylesSliderRail from "./WeddingHairstylesSliderRail";
import { getWeddingHairstylesGroupedByCategory } from "./weddingHairstylesTop100Data";
import styles from "./WeddingHairstylesTop100Section.module.css";

export default function WeddingHairstylesTop100Section() {
  const resolvedRegistry = getResolvedWeddingHairstylesTop100Registry();
  const liveCards = resolvedRegistry.filter((item) => item.hasLiveImage);
  const assetAudit = getWeddingHairstyleAssetAudit();
  const groupedRegistry = getWeddingHairstylesGroupedByCategory();

  return (
    <section id="top-100-hairstyles" className={styles.section}>
      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <p className={styles.kicker}>Top 100 / Bridal Catalog</p>
          <h2>Top 100 Wedding Hairstyles</h2>
          <p>
            One slug-based registry now powers the cards rail, slug detail routes, and the masters filter contract.
            The main page only renders cards that already have a local image file, so the page never shows broken media.
          </p>
        </div>

        <div className={styles.liveCounter}>
          <strong>{liveCards.length}</strong>
          <span>live cards now</span>
        </div>
      </div>

      <div className={styles.stats}>
        <article className={styles.statCard}>
          <strong>100</strong>
          <span>indexed detail URLs generated from the central registry</span>
        </article>
        <article className={styles.statCard}>
          <strong>{liveCards.length}</strong>
          <span>cards already lighting up from local media files</span>
        </article>
        <article className={styles.statCard}>
          <strong>{assetAudit.missingPngFilenames.length}</strong>
          <span>canonical PNG contract files still expected in the final asset drop</span>
        </article>
      </div>

      <p className={styles.contractNote}>
        Canonical drop target: <code>public/assets/media/wikimarket/beauty/wedding-hairstyles/top-100/&lt;slug&gt;.png</code>.
        Temporary local <code>.webp</code> placeholders are supported, but the final production drop can land later without any code refactor.
      </p>

      {liveCards.length > 0 ? (
        <WeddingHairstylesSliderRail items={liveCards} />
      ) : (
        <div className={styles.emptyState}>
          <h3>No local card images yet</h3>
          <p>
            The route and SEO architecture are already live. As soon as files land in <code>top-100</code>, matching cards will
            appear here automatically and keep the same stable slug URLs.
          </p>
        </div>
      )}

      <div className={styles.indexBlock}>
        <div>
          <h3>All 100 detail links</h3>
          <p>
            Every approved slug already has a crawlable detail page and a masters CTA. This index keeps the whole catalog linked even
            while the remaining binaries are still pending.
          </p>
        </div>

        <div className={styles.indexGrid}>
          {groupedRegistry.map((group) => (
            <section key={group.category} className={styles.indexGroup} aria-label={`${group.label} wedding hairstyles`}>
              <h4>{group.label}</h4>
              <ul className={styles.indexList}>
                {group.items.map((item) => (
                  <li key={item.slug}>
                    <Link className={styles.indexLink} href={item.detailHref} prefetch={false}>
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
