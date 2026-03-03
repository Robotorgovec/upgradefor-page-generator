import Script from "next/script";

import ContactsCountryBlock from "../../../../components/wikimarket/hvac/shared/ContactsCountryBlock";
import { loadHtmlTemplate } from "../../../../lib/html-template";

const template = loadHtmlTemplate("wikimarket/hvac/heat-exchanger-repair/index.html");

const heroVisualPattern = /<div class="hero-visual"[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/i;
const contactsSectionPattern = /<!-- CONTACTS -->[\s\S]*?<\/section>/i;

const heroFrameMarkup = `
          <div class="hero-art hero-art-mobile" aria-hidden="true">
            <img class="hero-figure" src="/assets/media/heat-exchanger-hero.png" alt="Теплообменники — ремонт и обслуживание" />
          </div>
          <div class="hero-art hero-art-desktop" aria-hidden="true">
            <img class="hero-figure" src="/assets/media/heat-exchanger-hero.png" alt="Теплообменники — ремонт и обслуживание" />
          </div>
        </div>
      </section>`;

const CONTACTS_MARKER = "<!--__HX_CONTACTS_BLOCK__-->";

const pageHtmlWithMarker = template.mainHtml
  .replace(heroVisualPattern, heroFrameMarkup)
  .replace(contactsSectionPattern, CONTACTS_MARKER)
  .replace(
    /<h1>\s*Ремонт теплообменников всех типов\s*<\/h1>/i,
    "<h1 class=\"hx-hero-title\" data-hx-h1=\"fix-6\">" +
      "<span class=\"hx-h1-line\">Ремонт теплообменников</span>" +
      "<span class=\"hx-h1-line hx-h1-line--second\">всех типов</span>" +
    "</h1>",
  )
  .replaceAll(' style="padding:16px"', ' class="pad-16"')
  .replaceAll(' class="card" class="pad-16"', ' class="card pad-16"')
  .replaceAll(' class="plain-card" class="pad-16"', ' class="plain-card pad-16"')
  .replaceAll('style="align-items:start"', 'class="ai-start"')
  .replaceAll('style="gap:12px"', 'class="gap-12"')
  .replaceAll('style="gap:10px; margin-top:12px; max-width: 720px;"', 'class="filters-grid"')
  .replaceAll('style="gap:10px; max-width: 920px"', 'class="faq-grid"')
  .replaceAll('style="margin-top:14px; align-items:start"', 'class="mt-14 ai-start"')
  .replaceAll('style="margin-top:14px"', 'class="mt-14"')
  .replaceAll('style="margin-top:12px"', 'class="mt-12"')
  .replaceAll('style="margin-top:10px"', 'class="mt-10"')
  .replaceAll('style="margin-top:8px"', 'class="mt-8"')
  .replaceAll('style="margin-bottom:8px"', 'class="mb-8"')
  .replaceAll('style="width:100%"', 'class="w-100"')
  .replaceAll('style="width:15%"', 'class="w-15"')
  .replaceAll('style="width:30%"', 'class="w-30"')
  .replaceAll('style="width:55%"', 'class="w-55"')
  .replace(/class="([^"]*)"\s+class="([^"]*)"/g, 'class="$1 $2"');

const hasContactsMarker = pageHtmlWithMarker.includes(CONTACTS_MARKER);
const parts = hasContactsMarker ? pageHtmlWithMarker.split(CONTACTS_MARKER) : [pageHtmlWithMarker];
const pageHtmlBefore = parts[0] ?? pageHtmlWithMarker;
const pageHtmlAfter = parts[1] ?? "";

export const metadata = {
  title: "Ремонт и обслуживание теплообменников всех типов | UPGR Upgrade Innovations",
  description:
    "Сервис теплообменников всех типов: пластинчатые, кожухотрубные, ребристо-трубные (калориферы/радиаторы), испарители/конденсаторы, микроканальные и др. Диагностика, чистка, герметичность, восстановление, замена.",
};

export default function HeatExchangerRepairPage() {
  return (
    <>
      <link rel="stylesheet" href="/assets/wikimarket-hvac-heat-exchanger-repair.fix-6.css" />

      {template.jsonLd.map((data, index) => (
        <Script
          key={`heat-exchanger-repair-jsonld-${index}`}
          id={`heat-exchanger-repair-jsonld-${index}`}
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {data}
        </Script>
      ))}

      <div className="upgr-hx">
        <div dangerouslySetInnerHTML={{ __html: pageHtmlBefore }} />
        {hasContactsMarker ? <ContactsCountryBlock /> : null}
        {hasContactsMarker && pageHtmlAfter ? <div dangerouslySetInnerHTML={{ __html: pageHtmlAfter }} /> : null}
      </div>

      {template.inlineScripts.map((script, index) => (
        <Script
          key={`heat-exchanger-repair-inline-${index}`}
          id={`heat-exchanger-repair-inline-${index}`}
          strategy="afterInteractive"
        >
          {script}
        </Script>
      ))}
    </>
  );
}
