import Link from "next/link";

import { CopperAluminumHeatExchangerQuiz } from "../../../../components/learning-game/copper-aluminum-heat-exchanger-quiz";
import { COPPER_ALUMINUM_HEAT_EXCHANGER_GAME_PATH } from "../../../../lib/learning-game/copper-aluminum-heat-exchanger-quiz-data";
import styles from "./page.module.css";

export const metadata = {
  title: "Copper-Aluminum Heat Exchangers Basics Quiz | UPGR Learning",
  description:
    "Learn copper-aluminum heat exchanger fundamentals with an industrial mini-quiz covering construction, airflow risks, maintenance, and operation basics.",
};

export default function CopperAluminumHeatExchangersBasicsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Industrial learning module</p>
        <h1>Copper-Aluminum Heat Exchangers: Basics and Field Awareness</h1>
        <p className={styles.heroLead}>
          Learn how copper tubes and aluminum fins work together, what reduces airflow
          performance, and how practical maintenance decisions protect real operation.
        </p>
        <div className={styles.heroActions}>
          <a className={styles.primaryButton} href="#quiz-section">
            Start the quiz
          </a>
          <Link className={styles.secondaryButton} href="/heat-exchangers">
            Explore heat exchangers
          </Link>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Quick facts: copper-aluminum coil basics</h2>
        <div className={styles.factsGrid}>
          <article className={styles.factCard}>
            <h3>Copper tubes</h3>
            <p>
              Tube circuits usually carry refrigerant or process fluid and form the primary
              flow path inside the coil.
            </p>
          </article>
          <article className={styles.factCard}>
            <h3>Aluminum fins</h3>
            <p>
              Fins increase air-side contact area, helping transfer heat between the tube
              circuit and moving air.
            </p>
          </article>
          <article className={styles.factCard}>
            <h3>Airflow and heat transfer</h3>
            <p>
              Even good tube-side conditions cannot compensate for severely restricted airflow
              across a contaminated fin pack.
            </p>
          </article>
          <article className={styles.factCard}>
            <h3>Maintenance concerns</h3>
            <p>
              Fouling, bent fins, and harsh-environment corrosion exposure are common risks to
              monitor throughout service life.
            </p>
          </article>
        </div>
      </section>

      <section id="quiz-section" className={styles.section}>
        <h2>Interactive quiz: check your operational understanding</h2>
        <p className={styles.sectionLead}>
          Answer 10 focused questions. You will get immediate feedback and a final competence
          band after completion.
        </p>
        <CopperAluminumHeatExchangerQuiz />
      </section>

      <section className={styles.section}>
        <h2>What matters in real operation</h2>
        <ul className={styles.pointsList}>
          <li>Fouling reduces airflow and weakens overall heat exchange effectiveness.</li>
          <li>Bent fins reduce efficiency by restricting intended air passages.</li>
          <li>
            Galvanic and corrosion risk can matter more in harsh environments with moisture,
            salts, or industrial contaminants.
          </li>
          <li>
            Maintenance should protect aluminum fins while keeping airflow pathways open and
            clean.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>FAQ</h2>
        <div className={styles.faqList}>
          <article className={styles.faqItem}>
            <h3>What is a copper-aluminum heat exchanger?</h3>
            <p>
              It is a coil design where copper tubes carry the working fluid and aluminum fins
              increase air-side heat transfer area.
            </p>
          </article>
          <article className={styles.faqItem}>
            <h3>Why combine copper tubes with aluminum fins?</h3>
            <p>
              The combination balances tube-side fluid routing and air-side surface area, which
              supports practical heat exchange in compact HVAC equipment.
            </p>
          </article>
          <article className={styles.faqItem}>
            <h3>What maintenance issues affect performance most?</h3>
            <p>
              Air-side fouling, bent fins, and unmanaged corrosion exposure are among the most
              common causes of degraded performance.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Next step</h2>
        <p className={styles.sectionLead}>
          Continue learning with broader equipment categories and service options.
        </p>
        <div className={styles.heroActions}>
          <Link className={styles.primaryButton} href="/heat-exchangers">
            Explore heat exchangers
          </Link>
          <Link className={styles.secondaryButton} href="/wikimarket/hvac/heat-exchangers">
            Browse HVAC category
          </Link>
        </div>
        <p className={styles.canonicalNote}>
          Canonical learning path: <code>{COPPER_ALUMINUM_HEAT_EXCHANGER_GAME_PATH}</code>
        </p>
      </section>
    </div>
  );
}
