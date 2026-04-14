import Image from "next/image";
import Link from "next/link";

import type { Company, RouteFamily } from "../../../lib/wikimarket/company-types";
import { getCompanyLocation, getCompanyPath, getRoleLabel } from "../../../lib/wikimarket/company-repository";
import styles from "./CompanyDirectoryPage.module.css";

type CompanyDirectoryPageProps = {
  routeFamily: RouteFamily;
  companies: Company[];
};

const copyByFamily: Record<RouteFamily, { title: string; description: string }> = {
  manufacturers: {
    title: "Производители WikiMarket",
    description: "Каталог производителей, OEM и supplier-профилей для WikiMarket."
  },
  sellers: {
    title: "Sellers WikiMarket",
    description: "Публичные seller и distributor-профили с фокусом на наличие, MOQ и логистику."
  }
};

export default function CompanyDirectoryPage({ routeFamily, companies }: CompanyDirectoryPageProps) {
  const copy = copyByFamily[routeFamily];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>WikiMarket / {routeFamily}</p>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
      </header>

      <section className={styles.grid}>
        {companies.map((company) => {
          const locationLabel = getCompanyLocation(company);

          return (
            <article key={company.id} className={styles.card}>
              <div className={styles.media}>
                <Image
                  src={company.coverImage?.url ?? company.logo.url}
                  alt={company.coverImage?.alt ?? company.logo.alt}
                  width={company.coverImage?.width ?? company.logo.width}
                  height={company.coverImage?.height ?? company.logo.height}
                  sizes="(max-width: 900px) 100vw, 360px"
                />
              </div>

              <div className={styles.content}>
                <div className={styles.badges}>
                  <span className={styles.roleBadge}>{getRoleLabel(company.role)}</span>
                  {company.verification.isVerified ? <span className={styles.verifiedBadge}>Проверен</span> : null}
                </div>

                <h2>{company.publicName}</h2>
                <p>{company.shortDescription}</p>

                <ul className={styles.metaList}>
                  {locationLabel ? <li>{locationLabel}</li> : null}
                  {company.responseSpeedLabel ? <li>{company.responseSpeedLabel}</li> : null}
                  {company.leadTimeLabel ? <li>{company.leadTimeLabel}</li> : null}
                </ul>

                <div className={styles.tags}>
                  {company.capabilities.slice(0, 4).map((capability) => (
                    <span key={capability}>{capability}</span>
                  ))}
                </div>

                <Link className={styles.cardLink} href={getCompanyPath(company, routeFamily)}>
                  Открыть профиль
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
