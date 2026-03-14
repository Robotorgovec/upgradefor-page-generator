import WeddingHairstylesCta from "./WeddingHairstylesCta";
import WeddingHairstylesFaq from "./WeddingHairstylesFaq";
import WeddingHairstylesGuidedSelector from "./WeddingHairstylesGuidedSelector";
import WeddingHairstylesHero from "./WeddingHairstylesHero";
import WeddingHairstylesPerformerGrid from "./WeddingHairstylesPerformerGrid";
import WeddingHairstylesScenarios from "./WeddingHairstylesScenarios";
import WeddingHairstylesStylesGrid from "./WeddingHairstylesStylesGrid";
import WeddingHairstylesToc from "./WeddingHairstylesToc";
import WeddingHairstylesIcon, { type WeddingHairstylesIconName } from "./WeddingHairstylesIcon";
import styles from "./WeddingHairstylesPage.module.css";
import { weddingHairstylesPageData } from "./data";

const QUICK_ANSWER_ICONS: Record<string, WeddingHairstylesIconName> = {
  "Репетиция особенно нужна, если критичны крепление фаты, ранний выезд или сложная конструкция формы.":
    "trial-session",
};

const PREP_ROW_ICONS: Record<string, WeddingHairstylesIconName> = {
  "Длина и текущее состояние волос": "hair-prep",
};

export default function WeddingHairstylesPage() {
  const data = weddingHairstylesPageData;

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

      <section id="summary" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>{data.quickAnswer.title}</h2>
        </div>
        <ul className={styles.quickAnswerList}>
          {data.quickAnswer.bullets.map((item) => {
            const iconName = QUICK_ANSWER_ICONS[item];

            return (
              <li key={item}>
                {iconName ? (
                  <span className={styles.listIconLabel}>
                    <WeddingHairstylesIcon name={iconName} size="inline" />
                    <span className={styles.iconLabelText}>{item}</span>
                  </span>
                ) : (
                  item
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <WeddingHairstylesToc items={[...data.toc]} />

      <WeddingHairstylesGuidedSelector selector={data.selector} recommendations={[...data.popularStyles]} />

      <section id="popular-styles" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.headingIconLabel}>
            <WeddingHairstylesIcon name="style-catalog" size="section" />
            <span className={styles.headingIconText}>Популярные стили свадебных причесок</span>
          </h2>
          <p>
            Карточки помогают сравнить стиль по задаче дня, ожидаемому эффекту и моменту выбора перед
            бронированием.
          </p>
        </div>
        <WeddingHairstylesStylesGrid items={[...data.popularStyles]} />
      </section>

      <WeddingHairstylesScenarios items={[...data.scenarios]} />

      <WeddingHairstylesCta
        id="cta-after-selection"
        title={data.ctaAfterSelection.title}
        text={data.ctaAfterSelection.text}
        buttonLabel={data.ctaAfterSelection.buttonLabel}
        href={data.ctaAfterSelection.href}
        tone="neutral"
      />

      <WeddingHairstylesPerformerGrid section={data.performersSection} />

      <WeddingHairstylesCta
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
            <h3>Как выбрать мастера</h3>
            <ul>
              {data.chooseMasterChecklist.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={styles.checklistCard}>
            <h3 className={styles.headingIconLabel}>
              <WeddingHairstylesIcon name="consultation" size="inline" />
              <span className={styles.iconLabelText}>{data.bookingQuestions.title}</span>
            </h3>
            <ul>
              {data.bookingQuestions.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={styles.checklistCard}>
            <h3 className={styles.headingIconLabel}>
              <WeddingHairstylesIcon name="reference-photo" size="inline" />
              <span className={styles.iconLabelText}>{data.photoChecklist.title}</span>
            </h3>
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
          <h2 className={styles.headingIconLabel}>
            <WeddingHairstylesIcon name="price-guide" size="section" />
            <span className={styles.headingIconText}>{data.pricingSection.title}</span>
          </h2>
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
          <p>Пять шагов от первого брифа до подтверждения исполнителя.</p>
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
          <h2 className={styles.headingIconLabel}>
            <WeddingHairstylesIcon name="preparation-checklist" size="section" />
            <span className={styles.headingIconText}>{data.prepChecklist.title}</span>
          </h2>
          <p>Соберите материалы заранее, чтобы выбор стиля и исполнителя прошел без потери времени.</p>
        </div>

        <ul className={styles.prepList}>
          {data.prepChecklist.items.map((item) => {
            const iconName = PREP_ROW_ICONS[item];

            return (
              <li key={item}>
                {iconName ? (
                  <span className={styles.listIconLabel}>
                    <WeddingHairstylesIcon name={iconName} size="inline" />
                    <span className={styles.iconLabelText}>{item}</span>
                  </span>
                ) : (
                  item
                )}
              </li>
            );
          })}
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
          <h2>Related intents</h2>
          <p>Внутренние переходы для расширенного bridal-сценария внутри beauty-кластера WikiMarket.</p>
        </div>

        <div className={styles.relatedGrid}>
          {data.relatedPages.map((page) => (
            <article key={page.href} className={styles.relatedCard}>
              <h3>{page.title}</h3>
              <p>{page.note}</p>
              <a className={styles.inlineLink} href={page.href}>
                Открыть intent
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