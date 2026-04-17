import ObairSelectorClient from "./ObairSelectorClient";
import { comparisonRows, faqItems, familyCards, industryScenarios } from "./data";
import styles from "./obair-ventilation-selector.module.css";

export default function ObairVentilationSelectorPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.kicker}>HVAC / OBAIR Official Catalog Selector</p>
        <h1>Подбор OBAIR вентиляционных и air-side установок</h1>
        <p>
          Guided selector по официальным семействам OBAIR: BF, GXH, FG и ZKW. Это предварительная рекомендация
          семейства, не замена полного инженерного расчёта.
        </p>
        <a href="#selector" className={styles.primaryBtn}>
          Начать подбор
        </a>
      </section>

      <ObairSelectorClient />

      <section className={styles.section}>
        <h2>Семейства OBAIR</h2>
        <div className={styles.cardsGrid}>
          {familyCards.map((card) => (
            <article key={card.id} className={styles.familyCard}>
              <h3>{card.title}</h3>
              <p>{card.shortDescription}</p>
              <h4>Когда подходит</h4>
              <ul>
                {card.suitableWhen.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <h4>Когда не подходит</h4>
              <ul>
                {card.notSuitableWhen.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <h4>Типовой диапазон</h4>
              <ul>
                <li>Airflow: {card.typicalRange.airflow}</li>
                <li>Static pressure: {card.typicalRange.staticPressure}</li>
                <li>Heat recovery: {card.typicalRange.heatRecovery}</li>
                {card.typicalRange.note ? <li>{card.typicalRange.note}</li> : null}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>Comparison: BF vs GXH vs FG vs ZKW</h2>
        <div className={styles.tableWrap}>
          <table className={styles.compareTable}>
            <thead>
              <tr>
                <th>Параметр</th>
                <th>BF</th>
                <th>GXH</th>
                <th>FG</th>
                <th>ZKW</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.metric}>
                  <td>{row.metric}</td>
                  <td>{row.BF}</td>
                  <td>{row.GXH}</td>
                  <td>{row.FG}</td>
                  <td>{row.ZKW}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Industry scenarios</h2>
        <div className={styles.cardsGrid}>
          {industryScenarios.map((scenario) => (
            <article key={scenario.title} className={styles.industryCard}>
              <h3>{scenario.title}</h3>
              <p>{scenario.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>FAQ</h2>
        <div className={styles.faqList}>
          {faqItems.map((item) => (
            <details key={item.question} className={styles.faqItem}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="final-cta" className={styles.finalCta}>
        <h2>Следующий шаг: инженерная консультация</h2>
        <p>
          Отправьте входные данные проекта — и получите рекомендацию инженера по семейству OBAIR, конфигурации
          секций и данным для коммерческого предложения.
        </p>
        <div className={styles.resultCtas}>
          <a className={styles.primaryBtn} href="mailto:info@upgradefor.com?subject=OBAIR%20selector%20request">
            Запросить консультацию
          </a>
          <a className={styles.secondaryBtn} href="mailto:info@upgradefor.com?subject=OBAIR%20input%20data">
            Отправить входные данные
          </a>
        </div>
      </section>
    </main>
  );
}
