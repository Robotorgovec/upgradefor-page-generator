import styles from "./WeddingHairstylesPage.module.css";
import type { WeddingHairstylesPageData } from "./data";

type WeddingHairstylesTaxonomyGroupsProps = {
  section: WeddingHairstylesPageData["taxonomyOverviewSection"];
  catalogSection: WeddingHairstylesPageData["taxonomyCatalogSection"];
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

export default function WeddingHairstylesTaxonomyGroups({
  section,
  catalogSection,
  groups,
  modifiers,
}: WeddingHairstylesTaxonomyGroupsProps) {
  const totalTypeCount = groups.reduce((total, group) => total + group.types.length, 0);
  const modifierCount = modifiers.length;
  const sectionTitleId = `${section.id}-title`;
  const catalogTitleId = `${catalogSection.id}-title`;
  const getModifierLabel = (modifierId: string) => {
    return modifiers.find((modifier) => modifier.id === modifierId)?.label ?? modifierId;
  };

  return (
    <section
      id={section.id}
      className={`${styles.section} ${styles.referenceGuide}`}
      aria-labelledby={sectionTitleId}
    >
      <div className={styles.sectionHeader}>
        <h2 id={sectionTitleId}>{section.title}</h2>
        <p>{section.subtitle}</p>
      </div>

      <div className={styles.referenceFlow} aria-label="Как устроен справочник свадебных причесок">
        <div aria-label={`${groups.length} семейств формы`}>
          <strong>{groups.length}</strong>
          <span>семейств формы</span>
        </div>
        <div aria-label={`${totalTypeCount} базовых типов`}>
          <strong>{totalTypeCount}</strong>
          <span>базовых типов</span>
        </div>
        <div aria-label={`${modifierCount} модификаторов после выбора формы`}>
          <strong>{modifierCount}</strong>
          <span>модификаторов после выбора формы</span>
        </div>
      </div>

      <div className={styles.taxonomyGroupGrid}>
        {groups.map((group) => (
          <article
            key={group.id}
            className={styles.taxonomyGroupCard}
            aria-labelledby={`${group.anchorId}-overview-title`}
          >
            <div className={styles.taxonomyGroupHeader}>
              <p className={styles.taxonomyGroupSlug}>{GROUP_BADGES[group.id] ?? group.title}</p>
              <h3 id={`${group.anchorId}-overview-title`}>{group.title}</h3>
            </div>

            <p className={styles.taxonomyGroupDescription}>{group.shortDescription}</p>
            <p className={styles.taxonomyGroupIntent}>
              <strong>{section.seoIntentLabel}</strong> {group.seoIntent}
            </p>

            <div className={styles.taxonomyRepresentativeBlock}>
              <p className={styles.taxonomyRepresentativeTitle}>{section.representativeLabel}</p>
              <ul className={styles.taxonomyRepresentativeList}>
                {group.types.map((type) => (
                  <li key={type.id}>
                    <a href={`#${type.slug}`} aria-label={`${type.name}: перейти к карточке типа`}>
                      {type.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <a className={styles.inlineLink} href={`#${group.anchorId}`}>
              {section.jumpLabel}
            </a>
          </article>
        ))}
      </div>

      <div
        id={catalogSection.id}
        className={styles.referenceCatalog}
        role="region"
        aria-labelledby={catalogTitleId}
      >
        <div className={styles.referenceCatalogHeader}>
          <div>
            <p className={styles.referenceCatalogEyebrow}>Слой 2: тип внутри выбранной группы</p>
            <h3 id={catalogTitleId}>{catalogSection.title}</h3>
            <p>{catalogSection.subtitle}</p>
          </div>
          <a className={styles.inlineLink} href="#selection-modifiers">
            Уточнить модификаторы
          </a>
        </div>

        <nav className={styles.catalogGroupNav} aria-label="Навигация по 6 группам справочника">
          {groups.map((group) => (
            <a
              key={group.id}
              href={`#${group.anchorId}`}
              aria-label={`${GROUP_BADGES[group.id] ?? group.title}: ${group.types.length} базовых типов`}
            >
              <span>{GROUP_BADGES[group.id] ?? group.title}</span>
              <strong>{group.types.length}</strong>
            </a>
          ))}
        </nav>

        <div className={styles.catalogGroupStack}>
          {groups.map((group) => (
            <section
              key={group.id}
              id={group.anchorId}
              className={styles.catalogGroupSection}
              aria-labelledby={`${group.anchorId}-title`}
            >
              <header className={styles.catalogGroupHeader}>
                <div className={styles.catalogGroupTitleWrap}>
                  <p className={styles.catalogGroupSlug}>{GROUP_BADGES[group.id] ?? group.title}</p>
                  <h3 id={`${group.anchorId}-title`}>{group.title}</h3>
                </div>
                <a className={styles.inlineLink} href={`#${section.id}`}>
                  {catalogSection.backToGroupsLabel}
                </a>
              </header>

              <p className={styles.catalogGroupDescription}>{group.shortDescription}</p>
              <p className={styles.catalogGroupIntent}>
                <strong>{catalogSection.intentLabel}</strong> {group.seoIntent}
              </p>

              {group.types.map((type) => (
                <article
                  key={type.id}
                  id={type.slug}
                  className={styles.catalogTypeCard}
                  aria-labelledby={`${type.slug}-title`}
                >
                  <h4 id={`${type.slug}-title`}>{type.name}</h4>
                  <p>{type.shortDescription}</p>

                  <div className={styles.catalogTypeMeta}>
                    <p className={styles.catalogTypeMetaTitle}>{catalogSection.modifiersLabel}</p>
                    <ul className={styles.catalogTypeModifierList}>
                      {type.modifiers.map((modifierId) => (
                        <li key={modifierId}>{getModifierLabel(modifierId)}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
