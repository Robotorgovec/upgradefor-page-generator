import Link from "next/link";

import { getResolvedWeddingHairstylesTop100Registry, getWeddingHairstyleAssetAudit } from "./WeddingHairstylesTop100Assets.server";
import WeddingHairstylesSliderRail from "./WeddingHairstylesSliderRail";
import { getWeddingHairstylesGroupedByCategory, weddingHairstylesTop100CanonicalSlugs } from "./weddingHairstylesTop100Data";
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
          <p className={styles.kicker}>Top 100 / Bridal Rail</p>
          <h2>Top 100 Wedding Hairstyles</h2>
          <p>
            Canonical slugs, detail routes, filters, and taxonomy bindings stay frozen. The approved PNG pack now connects through a
            dedicated asset mapping layer, while the rail appends cards in lightweight 12-card chunks.
          </p>
        </div>

        <div className={styles.liveCounter}>
          <strong>{liveCards.length}</strong>
          <span>cards live in the rail</span>
        </div>
      </div>

      <div className={styles.stats}>
        <article className={styles.statCard}>
          <strong>{weddingHairstylesTop100CanonicalSlugs.length}</strong>
          <span>canonical slugs and detail URLs remain untouched</span>
        </article>
        <article className={styles.statCard}>
          <strong>{assetAudit.approvedAssetCount}</strong>
          <span>approved PNG files are mapped to the registry without changing the route IDs</span>
        </article>
        <article className={styles.statCard}>
          <strong>{assetAudit.mappingCoverageCount}</strong>
          <span>cards are connected to the rail and keep the same masters filter contract</span>
        </article>
      </div>

      <p className={styles.contractNote}>
        Approved image contract lives in <code>public/assets/media/wikimarket/beauty/wedding-hairstyles/top-100/</code>. If a
        filename differs from the canonical slug, the route stays stable and the asset mapping layer handles the connection. The two
        approved closeup variants are kept inside this same rail.
      </p>

      {liveCards.length > 0 ? (
        <WeddingHairstylesSliderRail items={liveCards} />
      ) : (
        <div className={styles.emptyState}>
          <h3>No local card images yet</h3>
          <p>
            The slug pages and masters CTA contract are already wired. As soon as approved files land in <code>top-100</code>, the
            rail will pick them up without breaking links or layout.
          </p>
        </div>
      )}

      <div className={styles.indexBlock}>
        <div>
          <h3>All 100 detail links</h3>
          <p>
            Every slug keeps its own crawlable detail page even while the rail uses progressive card loading. That preserves internal
            linking and keeps the full catalog discoverable.
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
