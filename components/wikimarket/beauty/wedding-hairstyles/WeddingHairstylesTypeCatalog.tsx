import styles from "./WeddingHairstylesPage.module.css";
import type { WeddingHairstylesPageData } from "./data";

type WeddingHairstylesTypeCatalogProps = {
  section: WeddingHairstylesPageData["taxonomyCatalogSection"];
  groups: WeddingHairstylesPageData["taxonomyGroups"];
  modifiers: WeddingHairstylesPageData["modifierLibrary"]["items"];
};

const GROUP_BADGES: Record<string, string> = {
  buns: "Пучки",
  updos: "Собранные формы",
  "half-up-half-down": "Полусобранные",
  "waves-curls": "Волны и локоны",
  ponytails: "Хвосты",
  braids: "Плетения",
};

export default function WeddingHairstylesTypeCatalog({
  section,
  groups,
  modifiers,
}: WeddingHairstylesTypeCatalogProps) {
  const getModifierLabel = (modifierId: string) => {
    return modifiers.find((modifier) => modifier.id === modifierId)?.label ?? modifierId;
  };

  return (
    <section id={section.id} className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>{section.title}</h2>
        <p>{section.subtitle}</p>
      </div>

      <div className={styles.catalogGroupStack}>
        {groups.map((group) => (
          <section key={group.id} id={group.anchorId} className={styles.catalogGroupSection}>
            <header className={styles.catalogGroupHeader}>
              <div className={styles.catalogGroupTitleWrap}>
                <p className={styles.catalogGroupSlug}>{GROUP_BADGES[group.id] ?? group.title}</p>
                <h3>{group.title}</h3>
              </div>
              <a className={styles.inlineLink} href={`#${section.id}`}>
                {section.backToGroupsLabel}
              </a>
            </header>

            <p className={styles.catalogGroupDescription}>{group.shortDescription}</p>
            <p className={styles.catalogGroupIntent}>
              <strong>{section.intentLabel}</strong> {group.seoIntent}
            </p>

            <div className={styles.catalogTypeGrid}>
              {group.types.map((type) => (
                <article key={type.id} id={type.slug} className={styles.catalogTypeCard}>
                  <h4>{type.name}</h4>
                  <p>{type.shortDescription}</p>

                  <div className={styles.catalogTypeMeta}>
                    <p className={styles.catalogTypeMetaTitle}>{section.modifiersLabel}</p>
                    <ul className={styles.catalogTypeModifierList}>
                      {type.modifiers.map((modifierId) => (
                        <li key={modifierId}>{getModifierLabel(modifierId)}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
