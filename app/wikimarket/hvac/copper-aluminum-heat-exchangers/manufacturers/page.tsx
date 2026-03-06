import type { Metadata } from "next";
import Link from "next/link";

import {
  cuAlManufacturerCards,
  getCardMiniFacts,
  getCompanyImage,
  getCompanyImageAlt,
  getCompanyLocationLabel,
  getCompanyRoleLabel,
  getDisplayCapabilities,
  getRatingLabel,
  hasRatedReviews,
} from "../../../../../components/wikimarket/hvac/copper-aluminum-heat-exchangers/manufacturers";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Производители Cu-Al теплообменников для HVAC",
  description:
    "Проверенные производители, OEM и поставщики Cu-Al coils: роли, верификация, рейтинг, capability tags и переход в профиль компании.",
};

const coreFilters = [
  "Role",
  "Country",
  "Verified",
  "Capabilities",
  "Has standard products",
  "Rating state",
];

export default function CuAlManufacturersPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>WikiMarket / HVAC / Cu-Al</p>
        <h1>Все производители</h1>
        <p className={styles.lead}>
          Карточки показывают ядро PR-1: роль, верификацию, рейтинг, географию, capability tags и стандартные позиции.
        </p>
        <Link className={styles.backLink} href="/wikimarket/hvac/copper-aluminum-heat-exchangers#manufacturers">
          Вернуться в категорию
        </Link>
      </header>

      <section className={styles.filters} aria-label="Core filters roadmap">
        <h2>Фильтры (ядро)</h2>
        <ul>
          {coreFilters.map((filterName) => (
            <li key={filterName}>{filterName}</li>
          ))}
        </ul>
      </section>

      <section>
        <div className={styles.grid}>
          {cuAlManufacturerCards.map((company) => {
            const capabilities = getDisplayCapabilities(company);
            const miniFacts = getCardMiniFacts(company);
            const rated = hasRatedReviews(company);

            return (
              <article key={company.id} className={styles.card}>
                <img className={styles.image} src={getCompanyImage(company)} alt={getCompanyImageAlt(company)} />

                <div className={styles.badges}>
                  <span className={`${styles.badge} ${styles.roleBadge}`}>{getCompanyRoleLabel(company.companyRole)}</span>
                  {company.isVerified ? <span className={`${styles.badge} ${styles.trustBadge}`}>Проверен</span> : null}
                </div>

                <h3>
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
    </main>
  );
}
