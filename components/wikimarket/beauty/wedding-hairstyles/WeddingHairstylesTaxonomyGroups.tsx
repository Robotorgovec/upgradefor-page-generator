import styles from "./WeddingHairstylesPage.module.css";
import type { WeddingHairstylesPageData } from "./data";

type WeddingHairstylesTaxonomyGroupsProps = {
  section: WeddingHairstylesPageData["taxonomyOverviewSection"];
  groups: WeddingHairstylesPageData["taxonomyGroups"];
};

export default function WeddingHairstylesTaxonomyGroups({
  section,
  groups,
}: WeddingHairstylesTaxonomyGroupsProps) {
  return (
    <section id={section.id} className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>{section.title}</h2>
        <p>{section.subtitle}</p>
      </div>

      <div className={styles.taxonomyGroupGrid}>
        {groups.map((group) => (
          <article key={group.id} className={styles.taxonomyGroupCard}>
            <div className={styles.taxonomyGroupHeader}>
              <p className={styles.taxonomyGroupSlug}>{group.slug}</p>
              <h3>{group.title}</h3>
            </div>

            <p className={styles.taxonomyGroupDescription}>{group.shortDescription}</p>
            <p className={styles.taxonomyGroupIntent}>
              <strong>{section.seoIntentLabel}</strong> {group.seoIntent}
            </p>

            <div className={styles.taxonomyRepresentativeBlock}>
              <p className={styles.taxonomyRepresentativeTitle}>{section.representativeLabel}</p>
              <ul className={styles.taxonomyRepresentativeList}>
                {group.types.map((type) => (
                  <li key={type.id}>{type.name}</li>
                ))}
              </ul>
            </div>

            <a className={styles.inlineLink} href={`#${group.anchorId}`}>
              {section.jumpLabel}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
