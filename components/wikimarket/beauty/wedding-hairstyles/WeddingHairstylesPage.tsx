import WeddingHairstylesCta from "./WeddingHairstylesCta";
import WeddingHairstylesFaq from "./WeddingHairstylesFaq";
import WeddingHairstylesHero from "./WeddingHairstylesHero";
import WeddingHairstylesModifiers from "./WeddingHairstylesModifiers";
import WeddingHairstylesScenarios from "./WeddingHairstylesScenarios";
import WeddingHairstylesSelectionExperience from "./WeddingHairstylesSelectionExperience";
import WeddingHairstylesTaxonomyGroups from "./WeddingHairstylesTaxonomyGroups";
import WeddingHairstylesToc from "./WeddingHairstylesToc";
import WeddingHairstylesTypeCatalog from "./WeddingHairstylesTypeCatalog";
import styles from "./WeddingHairstylesPage.module.css";
import { weddingHairstylesPageData } from "./data";
import { getResolvedWeddingHairstylesTop100Registry } from "./WeddingHairstylesTop100Assets.server";

export default function WeddingHairstylesPage({ initialHairstyleKey }: { initialHairstyleKey?: string }) {
  const data = weddingHairstylesPageData;
  const resolvedTop100Registry = getResolvedWeddingHairstylesTop100Registry();

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Свадебные прически",
    serviceType: "Подбор свадебной прически и исполнителя",
    category: "BeautyService",
    description:
      "Подбор стиля свадебной прически, сравнение исполнителей и оформление заявки через WikiMarket.",
    provider: {
      "@type": "Organization",
      name: "WikiMarket",
      url: "https://upgradefor.com/wikimarket/categories",
    },
    areaServed: "RU",
    url: `https://upgradefor.com${data.pageMeta.canonicalPath}`,
  };

  const performerListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Исполнители свадебных причесок",
    itemListElement: data.performersSection.performers.map((performer, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: performer.displayName,
      url: `https://upgradefor.com${data.pageMeta.canonicalPath}#${performer.id}`,
    })),
  };

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(performerListJsonLd) }} />

      <nav className={styles.breadcrumbs} aria-label="Хлебные крошки">
        <ol>
          {data.breadcrumbs.map((crumb, index) => {
            const isLast = index === data.breadcrumbs.length - 1;

            return (
              <li key={`${crumb.label}-${index}`}>
                {crumb.href && !isLast ? <a href={crumb.href}>{crumb.label}</a> : <span>{crumb.label}</span>}
              </li>
            );
          })}
        </ol>
      </nav>

      <WeddingHairstylesHero hero={data.hero} />

      <WeddingHairstylesSelectionExperience
        selector={data.selector}
        recommendations={[...data.popularStyles]}
        performersSection={data.performersSection}
        top100Items={resolvedTop100Registry}
        initialHairstyleKey={initialHairstyleKey}
      />

      <section id="summary" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>{data.quickAnswer.title}</h2>
        </div>
        <ul className={styles.quickAnswerList}>
          {data.quickAnswer.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <WeddingHairstylesToc toc={data.toc} />

      <WeddingHairstylesTaxonomyGroups
        section={data.taxonomyOverviewSection}
        groups={data.taxonomyGroups}
      />

      <WeddingHairstylesTypeCatalog
        section={data.taxonomyCatalogSection}
        groups={data.taxonomyGroups}
        modifiers={data.modifierLibrary.items}
      />

      <WeddingHairstylesModifiers section={data.modifierGuideSection} library={data.modifierLibrary} />

      <WeddingHairstylesScenarios section={data.scenariosSection} items={data.scenarios} />

      <section id="master-checklist" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>{data.chooseMasterChecklist.title}</h2>
          <p>{data.chooseMasterChecklist.subtitle}</p>
        </div>

        <div className={styles.checklistGrid}>
          <article className={styles.checklistCard}>
            <h3>Как выбрать мастера</h3>
            <ul>
              {data.chooseMasterChecklist.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={styles.checklistCard}>
            <h3>{data.bookingQuestions.title}</h3>
            <ul>
              {data.bookingQuestions.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={styles.checklistCard}>
            <h3>{data.photoChecklist.title}</h3>
            <ul>
              {data.photoChecklist.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={styles.checklistCard}>
            <h3>{data.trialChecklist.title}</h3>
            <ul>
              {data.trialChecklist.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section id="pricing" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>{data.pricingSection.title}</h2>
          <p>{data.pricingSection.subtitle}</p>
        </div>

        <div className={styles.pricingGrid}>
          {data.pricingSection.columns.map((column) => (
            <article key={column.title} className={styles.pricingCard}>
              <h3>{column.title}</h3>
              <ul>
                {column.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <ul className={styles.pricingNotes}>
          {data.pricingSection.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <section id="process" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>{data.processSection.title}</h2>
          <p>{data.processSection.subtitle}</p>
        </div>

        <ol className={styles.processList}>
          {data.processSteps.map((step) => (
            <li key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="prep" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>{data.prepChecklist.title}</h2>
          <p>{data.prepChecklist.subtitle}</p>
        </div>

        <ul className={styles.prepList}>
          {data.prepChecklist.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <WeddingHairstylesFaq items={[...data.faq]} />

      <WeddingHairstylesCta
        id="request"
        title={data.finalCta.title}
        text={data.finalCta.text}
        buttonLabel={data.finalCta.buttonLabel}
        href={data.finalCta.href}
      />

      <WeddingHairstylesCta
        id="performer-cta"
        title={data.performerCta.title}
        text={data.performerCta.text}
        buttonLabel={data.performerCta.buttonLabel}
        href={data.performerCta.href}
        tone="secondary"
      />

      <section id="related-pages" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>{data.relatedPagesSection.title}</h2>
          <p>{data.relatedPagesSection.subtitle}</p>
        </div>

        <div className={styles.relatedGrid}>
          {data.relatedPages.map((page) => (
            <article key={page.href} className={styles.relatedCard}>
              <h3>{page.title}</h3>
              <p>{page.note}</p>
              <a className={styles.inlineLink} href={page.href}>
                Открыть переход
              </a>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.stickyMobileCta}>
        <a className={`${styles.btn} ${styles.btnPrimary}`} href={data.finalCta.href} aria-label="Оставить заявку">
          Оставить заявку
        </a>
      </div>
    </main>
  );
}
