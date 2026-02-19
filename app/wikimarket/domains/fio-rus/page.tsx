import Script from "next/script";

import { loadHtmlTemplate } from "../../../../lib/html-template";

const template = loadHtmlTemplate("wikimarket/domains/fio-rus/index.html");

export const metadata = {
  title: "Именной домен .РУС для {{user_name}} | UpgradeFor",
  description:
    "Персональный домен .РУС с регистрацией, настройкой и поддержкой для вашего проекта.",
};

export default function FioRusDomainPage() {
  return (
    <>
      {template.styles.map((style, index) => (
        <style
          key={`fio-rus-style-${index}`}
          dangerouslySetInnerHTML={{ __html: style }}
        />
      ))}
      <div dangerouslySetInnerHTML={{ __html: template.mainHtml }} />
      <section
        className="wrap"
        aria-labelledby="merchant-disclosure-title"
        style={{ marginBottom: "clamp(16px, 3vw, 48px)" }}
      >
        <div className="card" style={{ marginTop: "var(--space-3)" }}>
          <h2 className="section-title" id="merchant-disclosure-title">
            Реквизиты продавца
          </h2>
          <address style={{ fontStyle: "normal", margin: 0 }}>
            <p style={{ margin: 0 }}>
              UPGRADE INNOVATIONS S.R.L. (Republica Moldova)
            </p>
            <p style={{ margin: 0 }}>IDNO: 1025600022961</p>
            <p style={{ margin: 0 }}>
              Поддержка:{" "}
              <a
                href="mailto:info@upgradefor.com"
                aria-label="Email support at info@upgradefor.com"
              >
                info@upgradefor.com
              </a>{" "}
              <span aria-hidden="true">•</span>{" "}
              <a
                href="tel:+37378856998"
                aria-label="Call support at +373 78 856 998"
              >
                +373 78 856 998
              </a>
            </p>
            <p style={{ margin: 0 }}>Часы работы: 24/7</p>
            <p style={{ margin: 0 }}>
              Адрес: MD-2062, Chișinău, bd. Ștefan cel Mare și Sfânt, 6/2
            </p>
          </address>
        </div>
      </section>
      {template.inlineScripts.map((script, index) => (
        <Script
          key={`fio-rus-inline-${index}`}
          id={`fio-rus-inline-${index}`}
          strategy="afterInteractive"
        >
          {script}
        </Script>
      ))}
    </>
  );
}
