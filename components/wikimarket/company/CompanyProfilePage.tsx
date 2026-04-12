import Image from "next/image";
import Link from "next/link";

import type { Company, RouteFamily } from "../../../lib/wikimarket/company-types";
import {
  getCategoryLinks,
  getCompanyLocation,
  getRouteFamilyLabel,
  getRoleLabel,
} from "../../../lib/wikimarket/company-repository";
import { toAbsoluteUrl } from "../../../lib/wikimarket/site";
import Breadcrumbs from "./Breadcrumbs";
import CompanyCapabilityTags from "./CompanyCapabilityTags";
import CompanyContactCard from "./CompanyContactCard";
import CompanyProductsList from "./CompanyProductsList";
import JsonLd from "./JsonLd";
import MarkdownText from "./MarkdownText";
import styles from "./CompanyProfilePage.module.css";

type CompanyProfilePageProps = {
  company: Company;
  routeFamily: RouteFamily;
};

export default function CompanyProfilePage({ company, routeFamily }: CompanyProfilePageProps) {
  const routeFamilyLabel = getRouteFamilyLabel(routeFamily);
  const locationLabel = getCompanyLocation(company);
  const categoryLinks = getCategoryLinks(company);
  const profileUrl = toAbsoluteUrl(company.seo.canonicalPath);
  const logoUrl = toAbsoluteUrl(company.logo.url);
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: routeFamilyLabel,
        item: toAbsoluteUrl(`/wikimarket/${routeFamily}`),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: company.seo.breadcrumbTitle,
        item: profileUrl,
      },
    ],
  };
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.publicName,
    url: profileUrl,
    logo: logoUrl,
    description: company.shortDescription,
    address: company.hq
      ? {
          "@type": "PostalAddress",
          addressCountry: company.hq.country,
          addressLocality: company.hq.city,
          streetAddress: company.hq.addressLine,
        }
      : undefined,
    areaServed: company.serviceRegions?.map((region) => ({
      "@type": "Place",
      name: region,
    })),
    knowsLanguage: company.languages,
  };
  const itemListJsonLd =
    company.standardProducts && company.standardProducts.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: company.standardProducts.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: product.title,
            url: toAbsoluteUrl(product.inquiryUrl),
          })),
        }
      : null;

  return (
    <main className={styles.page}>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={organizationJsonLd} />
      {itemListJsonLd ? <JsonLd data={itemListJsonLd} /> : null}

      <Breadcrumbs
        items={[
          {
            label: routeFamilyLabel,
            href: `/wikimarket/${routeFamily}`,
          },
          {
            label: company.publicName,
          },
        ]}
      />

      <section className={styles.hero}>
        <div className={styles.heroMedia}>
          <Image
            src={company.coverImage?.url ?? company.logo.url}
            alt={company.coverImage?.alt ?? company.logo.alt}
            width={company.coverImage?.width ?? company.logo.width}
            height={company.coverImage?.height ?? company.logo.height}
            priority
            sizes="(max-width: 1000px) 100vw, 520px"
          />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroTop}>
            <div className={styles.logoWrap}>
              <Image src={company.logo.url} alt={company.logo.alt} width={72} height={72} />
            </div>

            <div className={styles.badgeRow}>
              <span className={styles.roleBadge}>{getRoleLabel(company.role)}</span>
              {company.verification.isVerified ? <span className={styles.verificationBadge}>Проверен</span> : null}
              {locationLabel ? <span className={styles.infoBadge}>{locationLabel}</span> : null}
            </div>
          </div>

          <div className={styles.heroCopy}>
            <p className={styles.kicker}>WikiMarket / {routeFamilyLabel}</p>
            <h1>{company.publicName}</h1>
            <p className={styles.lead}>{company.shortDescription}</p>
          </div>

          <div className={styles.actionRow}>
            <a className={styles.primaryButton} href="#inquiry">
              Запросить КП
            </a>
            {company.websiteUrl ? (
              <a className={styles.secondaryButton} href={company.websiteUrl} target="_blank" rel="noreferrer">
                Открыть сайт
              </a>
            ) : null}
          </div>

          {company.profileFacts && company.profileFacts.length > 0 ? (
            <dl className={styles.factGrid}>
              {company.profileFacts.map((fact) => (
                <div key={fact.label} className={styles.factCard}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </section>

      <div className={styles.contentGrid}>
        <div className={styles.mainColumn}>
          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <h2>О компании</h2>
              <p>Публичный профиль компании с SEO-метаданными, capabilities и быстрым RFQ.</p>
            </div>
            <MarkdownText markdown={company.fullDescriptionMd} />
          </section>

          {company.highlights && company.highlights.length > 0 ? (
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <h2>Почему этот профиль полезен</h2>
                <p>Короткий слой для закупки, инженера и сервисной команды.</p>
              </div>
              <ul className={styles.highlightList}>
                {company.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <h2>Capabilities</h2>
              <p>Теги позволяют быстро понять, подходит ли профиль под OEM, supply или replacement-задачу.</p>
            </div>
            <CompanyCapabilityTags capabilities={company.capabilities} />
          </section>

          {company.standardProducts && company.standardProducts.length > 0 ? (
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <h2>Standard products</h2>
                <p>Стандартные позиции и entry-point для быстрого запроса.</p>
              </div>
              <CompanyProductsList products={company.standardProducts} />
            </section>
          ) : null}

          {company.documents && company.documents.length > 0 ? (
            <section className={styles.section} id="documents">
              <div className={styles.sectionHeading}>
                <h2>Документы</h2>
                <p>Ссылки и request packs, которые поддерживают квалификацию поставщика или replacement-проекта.</p>
              </div>
              <ul className={styles.documentList}>
                {company.documents.map((document) => (
                  <li key={`${document.type}-${document.title}`}>
                    <a href={document.url}>{document.title}</a>
                    <span>{document.type}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <h2>География и условия</h2>
              <p>Регион покрытия, языки и операционные сигналы, которые полезны до первого контакта.</p>
            </div>

            <div className={styles.metaGrid}>
              {company.serviceRegions && company.serviceRegions.length > 0 ? (
                <article className={styles.metaCard}>
                  <h3>Регионы</h3>
                  <p>{company.serviceRegions.join(", ")}</p>
                </article>
              ) : null}

              {company.languages && company.languages.length > 0 ? (
                <article className={styles.metaCard}>
                  <h3>Языки</h3>
                  <p>{company.languages.join(", ")}</p>
                </article>
              ) : null}

              {company.deliveryNotes ? (
                <article className={styles.metaCard}>
                  <h3>Логистика</h3>
                  <p>{company.deliveryNotes}</p>
                </article>
              ) : null}

              {company.paymentTerms ? (
                <article className={styles.metaCard}>
                  <h3>Payment terms</h3>
                  <p>{company.paymentTerms}</p>
                </article>
              ) : null}
            </div>
          </section>

          {categoryLinks.length > 0 ? (
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <h2>Связанные категории</h2>
                <p>Backlinks для перехода в категорию и обратно к каталожным страницам.</p>
              </div>

              <div className={styles.relatedGrid}>
                {categoryLinks.map((category) => (
                  <article key={category.slug} className={styles.relatedCard}>
                    <h3>{category.title}</h3>
                    <p>{category.listTitle}</p>
                    <div className={styles.relatedActions}>
                      <Link href={category.href}>Категория</Link>
                      {routeFamily === "manufacturers" && category.manufacturersHref ? (
                        <Link href={category.manufacturersHref}>Все производители</Link>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {company.faq && company.faq.length > 0 ? (
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <h2>FAQ</h2>
                <p>Короткие ответы на типовые вопросы до коммерческого диалога.</p>
              </div>

              <div className={styles.faqList}>
                {company.faq.map((item) => (
                  <article key={item.question} className={styles.faqCard}>
                    <h3>{item.question}</h3>
                    <p>{item.answer}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className={styles.sidebarColumn}>
          <CompanyContactCard
            companySlug={company.slug}
            companyName={company.publicName}
            contacts={company.contacts}
            responseSpeedLabel={company.responseSpeedLabel}
          />

          <section className={styles.sidebarCard}>
            <h2>Trust signals</h2>
            <ul className={styles.sidebarList}>
              <li>Verification: {company.verification.isVerified ? "verified" : "not verified"}</li>
              <li>Rating state: {company.rating.state}</li>
              {company.leadTimeLabel ? <li>Lead time: {company.leadTimeLabel}</li> : null}
              {company.minimumOrderLabel ? <li>MOQ: {company.minimumOrderLabel}</li> : null}
              <li>Updated: {new Date(company.updatedAt).toLocaleDateString("ru-RU")}</li>
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}
