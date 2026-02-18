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
      <section className="wrap" aria-labelledby="merchant-disclosure-title">
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
          <p style={{ marginTop: "var(--space-3)", marginBottom: "8px" }}>
            Домен регистрируется на вас (вы — администратор домена). Оплата включает
            регистрационные сборы у регистратора и сервис сопровождения. Итоговая цена
            отображается до оплаты.
          </p>
          <p style={{ margin: 0 }}>
            Оплачивая, вы соглашаетесь с <a href="/legal/terms" style={{ textDecoration: "underline" }}>Публичной офертой</a>,{" "}
            <a href="/legal/refunds" style={{ textDecoration: "underline" }}>Политикой возвратов</a> и{" "}
            <a href="/legal/privacy" style={{ textDecoration: "underline" }}>Политикой конфиденциальности</a>.
          </p>
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
