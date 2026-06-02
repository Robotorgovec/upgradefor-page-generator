import WeddingHairstylesCta from "./WeddingHairstylesCta";
import WeddingHairstylesFaq from "./WeddingHairstylesFaq";
import WeddingHairstylesHero from "./WeddingHairstylesHero";
import WeddingHairstylesModifiers from "./WeddingHairstylesModifiers";
import WeddingHairstylesScenarios from "./WeddingHairstylesScenarios";
import WeddingHairstylesSelectionExperience from "./WeddingHairstylesSelectionExperience";
import WeddingHairstylesTaxonomyGroups from "./WeddingHairstylesTaxonomyGroups";
import WeddingHairstylesToc from "./WeddingHairstylesToc";
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
      "Подбор стиля свадебной прически, сравнение демо-шаблонов исполнителей и подготовка брифа через WikiMarket.",
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
    name: "Демо-шаблоны сравнения исполнителей свадебных причесок",
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

      <section className={styles.trustBridge} aria-labelledby="trust-bridge-title">
        <div className={styles.trustBridgeHeader}>
          <p className={styles.trustBridgeEyebrow}>{data.trustBridge.eyebrow}</p>
          <h2 id="trust-bridge-title">{data.trustBridge.title}</h2>
          <p>{data.trustBridge.subtitle}</p>
        </div>

        <div className={styles.trustBridgeGrid}>
          {data.trustBridge.proofCards.map((card) => (
            <article key={card.label} className={styles.trustProofCard}>
              <div className={styles.trustProofValue}>
                <strong>{card.value}</strong>
                <span>{card.label}</span>
              </div>
              <p>{card.text}</p>
            </article>
          ))}

          <aside className={styles.trustBridgePanel} aria-labelledby="trust-bridge-handoff-title">
            <h3 id="trust-bridge-handoff-title">{data.trustBridge.handoffTitle}</h3>
            <ol>
              {data.trustBridge.handoffItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <div className={styles.trustBridgeActions}>
              <a className={`${styles.btn} ${styles.btnPrimary}`} href={data.trustBridge.primaryCta.href}>
                {data.trustBridge.primaryCta.label}
              </a>
              <a className={`${styles.btn} ${styles.btnSecondary}`} href={data.trustBridge.secondaryCta.href}>
                {data.trustBridge.secondaryCta.label}
              </a>
            </div>
          </aside>
        </div>
      </section>

      <WeddingHairstylesSelectionExperience
        selector={data.selector}
        recommendations={[...data.popularStyles]}
        performersSection={data.performersSection}
        top100Items={resolvedTop100Registry}
        initialHairstyleKey={initialHairstyleKey}
      />

      <section id="summary" className={styles.section} aria-labelledby="summary-title">
        <div className={styles.sectionHeader}>
          <h2 id="summary-title">{data.quickAnswer.title}</h2>
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
        catalogSection={data.taxonomyCatalogSection}
        groups={data.taxonomyGroups}
        modifiers={data.modifierLibrary.items}
      />

      <WeddingHairstylesModifiers section={data.modifierGuideSection} library={data.modifierLibrary} />

      <WeddingHairstylesScenarios section={data.scenariosSection} items={data.scenarios} />

      <section id="master-checklist" className={styles.section} aria-labelledby="master-checklist-title">
        <div className={styles.sectionHeader}>
          <h2 id="master-checklist-title">{data.chooseMasterChecklist.title}</h2>
          <p>{data.chooseMasterChecklist.subtitle}</p>
        </div>

        <div className={styles.checklistGrid}>
          <article className={styles.checklistCard} aria-labelledby="master-check-card-title">
            <h3 id="master-check-card-title">Что проверить у мастера</h3>
            <ul>
              {data.chooseMasterChecklist.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={styles.checklistCard} aria-labelledby="booking-questions-card-title">
            <h3 id="booking-questions-card-title">{data.bookingQuestions.title}</h3>
            <ul>
              {data.bookingQuestions.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={styles.checklistCard} aria-labelledby="photo-checklist-card-title">
            <h3 id="photo-checklist-card-title">{data.photoChecklist.title}</h3>
            <ul>
              {data.photoChecklist.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={styles.checklistCard} aria-labelledby="trial-checklist-card-title">
            <h3 id="trial-checklist-card-title">{data.trialChecklist.title}</h3>
            <ul>
              {data.trialChecklist.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section id="pricing" className={styles.section} aria-labelledby="pricing-title">
        <div className={styles.sectionHeader}>
          <h2 id="pricing-title">{data.pricingSection.title}</h2>
          <p>{data.pricingSection.subtitle}</p>
        </div>

        <div className={styles.pricingGrid}>
          {data.pricingSection.columns.map((column, index) => (
            <article
              key={column.title}
              className={styles.pricingCard}
              aria-labelledby={`pricing-card-${index + 1}-title`}
            >
              <h3 id={`pricing-card-${index + 1}-title`}>{column.title}</h3>
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

      <section id="process" className={styles.section} aria-labelledby="process-title">
        <div className={styles.sectionHeader}>
          <h2 id="process-title">{data.processSection.title}</h2>
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

      <section id="prep" className={styles.section} aria-labelledby="prep-title">
        <div className={styles.sectionHeader}>
          <h2 id="prep-title">{data.prepChecklist.title}</h2>
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
        buttonAriaLabel="Оставить заявку на подбор свадебной прически"
      />

      <section id="related-pages" className={styles.section} aria-labelledby="related-pages-title">
        <div className={styles.sectionHeader}>
          <h2 id="related-pages-title">{data.relatedPagesSection.title}</h2>
          <p>{data.relatedPagesSection.subtitle}</p>
        </div>

        <div className={styles.relatedGrid}>
          {data.relatedPages.map((page, index) => (
            <article
              key={page.href}
              className={styles.relatedCard}
              aria-labelledby={`related-page-${index + 1}-title`}
            >
              <h3 id={`related-page-${index + 1}-title`}>{page.title}</h3>
              <p>{page.note}</p>
              <a className={styles.inlineLink} href={page.href}>
                {page.ctaLabel}
              </a>
            </article>
          ))}
        </div>
      </section>

      <WeddingHairstylesCta
        id="performer-cta"
        title={data.performerCta.title}
        text={data.performerCta.text}
        buttonLabel={data.performerCta.buttonLabel}
        href={data.performerCta.href}
        tone="neutral"
        buttonTone="secondary"
        eyebrow={"\u0414\u043b\u044f \u043c\u0430\u0441\u0442\u0435\u0440\u043e\u0432 \u0438 \u0441\u0442\u0443\u0434\u0438\u0439"}
        compact
      />

      <div className={styles.stickyMobileCta}>
        <a
          className={`${styles.btn} ${styles.btnPrimary}`}
          href={data.finalCta.href}
          aria-label="Оставить заявку на подбор свадебной прически"
        >
          Оставить заявку
        </a>
      </div>
    </main>
  );
}
