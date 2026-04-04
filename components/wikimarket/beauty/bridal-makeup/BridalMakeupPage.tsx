import BridalMakeupCta from "./BridalMakeupCta";
import BridalMakeupFaq from "./BridalMakeupFaq";
import BridalMakeupGuidedSelector from "./BridalMakeupGuidedSelector";
import BridalMakeupHero from "./BridalMakeupHero";
import BridalMakeupPerformerGrid from "./BridalMakeupPerformerGrid";
import BridalMakeupScenarios from "./BridalMakeupScenarios";
import BridalMakeupStylesGrid from "./BridalMakeupStylesGrid";
import BridalMakeupToc from "./BridalMakeupToc";
import styles from "./BridalMakeupPage.module.css";
import { bridalMakeupPageData } from "./data";

export default function BridalMakeupPage() {
  const data = bridalMakeupPageData;

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Свадебный макияж",
    serviceType: "Подбор свадебного макияжа и визажиста",
    category: "BeautyService",
    description:
      "Подбор формата свадебного макияжа, сравнение визажистов и оформление заявки через WikiMarket.",
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
    name: "Визажисты свадебного макияжа",
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

      <BridalMakeupHero hero={data.hero} />

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

      <BridalMakeupToc items={[...data.toc]} />

      <BridalMakeupGuidedSelector selector={data.selector} recommendations={[...data.popularStyles]} />

      <section id="popular-styles" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Популярные форматы свадебного макияжа</h2>
          <p>
            Карточки помогают сравнить сценарии по стойкости, съемке и интенсивности образа до бронирования.
          </p>
        </div>
        <BridalMakeupStylesGrid items={[...data.popularStyles]} />
      </section>

      <BridalMakeupScenarios items={[...data.scenarios]} />

      <BridalMakeupCta
        id="cta-after-selection"
        title={data.ctaAfterSelection.title}
        text={data.ctaAfterSelection.text}
        buttonLabel={data.ctaAfterSelection.buttonLabel}
        href={data.ctaAfterSelection.href}
        tone="neutral"
      />

      <BridalMakeupPerformerGrid section={data.performersSection} />

      <BridalMakeupCta
        id="cta-after-performers"
        title={data.ctaAfterPerformers.title}
        text={data.ctaAfterPerformers.text}
        buttonLabel={data.ctaAfterPerformers.buttonLabel}
        href={data.ctaAfterPerformers.href}
        tone="secondary"
      />

      <section id="master-checklist" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>{data.chooseMasterChecklist.title}</h2>
          <p>{data.chooseMasterChecklist.subtitle}</p>
        </div>

        <div className={styles.checklistGrid}>
          <article className={styles.checklistCard}>
            <h3>Как выбрать визажиста</h3>
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
          <h2>Как проходит заказ</h2>
          <p>Пять шагов от первого брифа до подтверждения визажиста.</p>
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
          <p>Подготовьте материалы заранее, чтобы согласование образа прошло быстро и без лишних правок.</p>
        </div>

        <ul className={styles.prepList}>
          {data.prepChecklist.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <BridalMakeupFaq items={[...data.faq]} />

      <BridalMakeupCta
        id="request"
        title={data.finalCta.title}
        text={data.finalCta.text}
        buttonLabel={data.finalCta.buttonLabel}
        href={data.finalCta.href}
      />

      <BridalMakeupCta
        id="performer-cta"
        title={data.performerCta.title}
        text={data.performerCta.text}
        buttonLabel={data.performerCta.buttonLabel}
        href={data.performerCta.href}
        tone="secondary"
      />

      <section id="related-pages" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Смежные интенты</h2>
          <p>Внутренние переходы для расширенного bridal-сценария внутри beauty-кластера WikiMarket.</p>
        </div>

        <div className={styles.relatedGrid}>
          {data.relatedPages.map((page) => (
            <article key={page.href} className={styles.relatedCard}>
              <h3>{page.title}</h3>
              <p>{page.note}</p>
              <a className={styles.inlineLink} href={page.href}>
                Открыть интент
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




