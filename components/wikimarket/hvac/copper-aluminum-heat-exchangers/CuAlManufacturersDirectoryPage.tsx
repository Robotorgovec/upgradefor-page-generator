import Link from "next/link";

import styles from "./CuAlManufacturersDirectoryPage.module.css";
import {
  cuAlManufacturerCards,
  getCardMiniFacts,
  getCompanyImage,
  getCompanyImageAlt,
  getCompanyLocationLabel,
  getCompanyRoleLabel,
  getDisplayCapabilities,
  getRatingLabel,
  getTrustEvidence,
  getVerificationHint,
  hasRatedReviews,
} from "./manufacturers";

const cardSignals = [
  "Роль компании",
  "Страна и город",
  "Проверка документов",
  "Срок ответа",
  "Стандартные позиции",
] as const;

export default function CuAlManufacturersDirectoryPage() {
  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <a href="/wikimarket/hvac/heat-exchangers">WikiMarket HVAC</a>
        <span aria-hidden="true">/</span>
        <a href="/wikimarket/hvac/copper-aluminum-heat-exchangers">Cu-Al теплообменники</a>
        <span aria-hidden="true">/</span>
        <span>Производители</span>
      </nav>

      <header className={styles.header}>
        <p className={styles.kicker}>WikiMarket / HVAC / Cu-Al</p>
        <h1>Производители и поставщики Cu-Al теплообменников</h1>
        <p className={styles.lead}>
          Список помогает быстро оценить специализацию, статус проверки, документы и удобный способ связи по вашей задаче.
        </p>
        <Link className={styles.backLink} href="/wikimarket/hvac/copper-aluminum-heat-exchangers#manufacturers">
          Вернуться к подбору по категории
        </Link>
      </header>

      <section className={styles.filters} aria-label="Что отображается в карточке">
        <h2>Что видно в карточке поставщика</h2>
        <ul>
          {cardSignals.map((signal) => (
            <li key={signal}>{signal}</li>
          ))}
        </ul>
      </section>

      <section className={styles.gridSection}>
        <div className={styles.grid}>
          {cuAlManufacturerCards.map((company) => {
            const capabilities = getDisplayCapabilities(company);
            const miniFacts = getCardMiniFacts(company);
            const trustEvidence = getTrustEvidence(company);
            const rated = hasRatedReviews(company);

            return (
              <article key={company.id} className={styles.card}>
                <img className={styles.image} src={getCompanyImage(company)} alt={getCompanyImageAlt(company)} />

                <div className={styles.badges}>
                  <span className={`${styles.badge} ${styles.roleBadge}`}>{getCompanyRoleLabel(company.companyRole)}</span>
                  {company.isVerified ? (
                    <span
                      className={`${styles.badge} ${styles.trustBadge}`}
                      title={getVerificationHint(company)}
                    >
                      Проверен
                    </span>
                  ) : null}
                </div>

                <h3 className={styles.cardTitle}>
                  <Link href={company.profileUrl}>{company.name}</Link>
                </h3>
                <p className={styles.description}>{company.shortDescription}</p>
                <p className={styles.relevance}>{company.categoryRelevanceLabel}</p>
                <p className={`${styles.rating} ${rated ? styles.ratingRated : ""}`}>{getRatingLabel(company)}</p>
                <p className={styles.geo}>{getCompanyLocationLabel(company)}</p>

                <ul className={styles.tags}>
                  {capabilities.map((capability) => (
                    <li key={`${company.id}-${capability}`}>{capability}</li>
                  ))}
                </ul>

                {trustEvidence.length > 0 ? (
                  <ul className={styles.trustEvidence}>
                    {trustEvidence.map((fact) => (
                      <li key={`${company.id}-trust-${fact}`}>{fact}</li>
                    ))}
                  </ul>
                ) : null}

                {miniFacts.length > 0 ? (
                  <ul className={styles.facts}>
                    {miniFacts.map((fact) => (
                      <li key={`${company.id}-fact-${fact}`}>{fact}</li>
                    ))}
                  </ul>
                ) : null}

                <Link className={styles.cta} href={company.primaryCtaUrl}>
                  {company.primaryCtaLabel}
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
