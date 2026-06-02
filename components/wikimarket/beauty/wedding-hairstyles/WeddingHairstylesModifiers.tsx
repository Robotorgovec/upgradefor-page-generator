import styles from "./WeddingHairstylesPage.module.css";
import type { WeddingHairstylesPageData } from "./data";

type WeddingHairstylesModifiersProps = {
  section: WeddingHairstylesPageData["modifierGuideSection"];
  library: WeddingHairstylesPageData["modifierLibrary"];
};

export default function WeddingHairstylesModifiers({
  section,
  library,
}: WeddingHairstylesModifiersProps) {
  const getModifier = (modifierId: string) => {
    return library.items.find((modifier) => modifier.id === modifierId);
  };
  const sectionTitleId = `${section.id}-title`;

  return (
    <section id={section.id} className={styles.section} aria-labelledby={sectionTitleId}>
      <div className={styles.sectionHeader}>
        <h2 id={sectionTitleId}>{section.title}</h2>
        <p>{section.subtitle}</p>
      </div>

      <p className={styles.modifierGuideNote}>{section.note}</p>

      <div className={styles.modifierGroupGrid}>
        {library.groups.map((group) => (
          <article key={group.id} className={styles.modifierGroupCard} aria-labelledby={`${group.id}-title`}>
            <h3 id={`${group.id}-title`}>{group.title}</h3>
            <p>{group.description}</p>

            <ul className={styles.modifierList}>
              {group.modifierIds.map((modifierId) => {
                const modifier = getModifier(modifierId);
                if (!modifier) return null;

                return (
                  <li key={modifier.id}>
                    <strong>{modifier.label}</strong>
                    <span>{modifier.description}</span>
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
