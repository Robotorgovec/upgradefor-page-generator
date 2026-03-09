import WeddingHairstylesCta from "./WeddingHairstylesCta";
import WeddingHairstylesFaq from "./WeddingHairstylesFaq";
import WeddingHairstylesHero from "./WeddingHairstylesHero";
import WeddingHairstylesPerformerGrid from "./WeddingHairstylesPerformerGrid";
import WeddingHairstylesStylesGrid from "./WeddingHairstylesStylesGrid";
import WeddingHairstylesToc from "./WeddingHairstylesToc";
import styles from "./WeddingHairstylesPage.module.css";
import { weddingHairstylesPageData } from "./data";

export default function WeddingHairstylesPage() {
  const data = weddingHairstylesPageData;

  return (
    <main className={styles.page}>
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
          <p>{data.quickAnswer.text}</p>
        </div>
        <ul className={styles.quickAnswerList}>
          {data.quickAnswer.priorities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <WeddingHairstylesToc items={[...data.toc]} />

      <section id="popular-styles" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Популярные стили свадебных причесок</h2>
          <p>Сравните основные форматы по задаче дня, длине волос и характеру образа.</p>
        </div>
        <WeddingHairstylesStylesGrid items={[...data.popularStyles]} />
      </section>

      <section id="selection" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Подбор прически по параметрам</h2>
          <p>Выбор удобно делать по четырем блокам: длина, аксессуары, стиль свадьбы и практичность.</p>
        </div>

        <div className={styles.selectionGrid}>
          {data.selectionGroups.map((group) => (
            <article key={group.id} className={styles.selectionCard}>
              <h3 id={group.anchorId}>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <WeddingHairstylesPerformerGrid section={data.performersSection} />

      <section id="how-to-choose" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Как выбрать мастера</h2>
          <p>Практический чек-лист, который помогает отфильтровать неподходящие варианты до бронирования.</p>
        </div>

        <ol className={styles.numberedList}>
          {data.chooseMasterChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section id="pricing" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>От чего зависит стоимость</h2>
          <p>Стоимость зависит от набора факторов задачи и условий работы мастера.</p>
        </div>

        <ul className={styles.quickAnswerList}>
          {data.pricingFactors.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section id="prep-checklist" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Чек-лист подготовки</h2>
          <p>Что сделать заранее, чтобы в день свадьбы укладка проходила спокойно и по таймингу.</p>
        </div>

        <ol className={styles.numberedList}>
          {data.prepChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <WeddingHairstylesFaq items={[...data.faq]} />

      <WeddingHairstylesCta
        id="request"
        title={data.ctaBride.title}
        text={data.ctaBride.text}
        buttonLabel={data.ctaBride.buttonLabel}
        href={data.ctaBride.href}
      />

      <WeddingHairstylesCta
        id="performer-cta"
        title={data.ctaPerformer.title}
        text={data.ctaPerformer.text}
        buttonLabel={data.ctaPerformer.buttonLabel}
        href={data.ctaPerformer.href}
        tone="secondary"
      />

      <section id="related-pages" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Related pages / related intents</h2>
          <p>Блок подготовлен как основа будущего beauty-кластера в том же namespace WikiMarket.</p>
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
    </main>
  );
}
