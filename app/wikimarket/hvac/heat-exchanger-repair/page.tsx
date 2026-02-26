import Script from "next/script";

import { loadHtmlTemplate } from "../../../../lib/html-template";

const template = loadHtmlTemplate("wikimarket/hvac/heat-exchanger-repair/index.html");

const heroVisualPattern = /<div class="hero-visual"[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/i;

const heroFrameMarkup = `
          <div class="hero-art hero-art-mobile" aria-hidden="true">
            <svg class="hero-figure" viewBox="0 0 300 200" role="img" aria-label="Схема теплообменника">
              <rect x="26" y="46" width="248" height="108" rx="16" fill="#E5E7EB" />
              <rect x="40" y="62" width="220" height="76" rx="12" fill="#F8FAFC" />
              <g>
                <rect x="50" y="72" width="14" height="56" rx="4" fill="#C46A2A" />
                <rect x="70" y="72" width="14" height="56" rx="4" fill="#E07A3F" />
                <rect x="90" y="72" width="14" height="56" rx="4" fill="#C46A2A" />
                <rect x="110" y="72" width="14" height="56" rx="4" fill="#E07A3F" />
                <rect x="130" y="72" width="14" height="56" rx="4" fill="#C46A2A" />
                <rect x="150" y="72" width="14" height="56" rx="4" fill="#E07A3F" />
                <rect x="170" y="72" width="14" height="56" rx="4" fill="#C46A2A" />
                <rect x="190" y="72" width="14" height="56" rx="4" fill="#E07A3F" />
                <rect x="210" y="72" width="14" height="56" rx="4" fill="#C46A2A" />
                <rect x="230" y="72" width="14" height="56" rx="4" fill="#E07A3F" />
              </g>
              <rect x="20" y="86" width="18" height="28" rx="6" fill="#CBD5E1" />
              <rect x="262" y="86" width="18" height="28" rx="6" fill="#CBD5E1" />
              <line x1="40" y1="62" x2="260" y2="62" stroke="#E2E8F0" stroke-width="2" />
              <line x1="40" y1="138" x2="260" y2="138" stroke="#E2E8F0" stroke-width="2" />
              <line x1="56" y1="54" x2="56" y2="146" stroke="#E5E7EB" stroke-width="1" />
              <line x1="244" y1="54" x2="244" y2="146" stroke="#E5E7EB" stroke-width="1" />
            </svg>
          </div>
          <div class="hero-art hero-art-desktop" aria-hidden="true">
            <svg class="hero-figure" viewBox="0 0 300 200" role="img" aria-label="Схема теплообменника">
              <rect x="26" y="46" width="248" height="108" rx="16" fill="#E5E7EB" />
              <rect x="40" y="62" width="220" height="76" rx="12" fill="#F8FAFC" />
              <g>
                <rect x="50" y="72" width="14" height="56" rx="4" fill="#C46A2A" />
                <rect x="70" y="72" width="14" height="56" rx="4" fill="#E07A3F" />
                <rect x="90" y="72" width="14" height="56" rx="4" fill="#C46A2A" />
                <rect x="110" y="72" width="14" height="56" rx="4" fill="#E07A3F" />
                <rect x="130" y="72" width="14" height="56" rx="4" fill="#C46A2A" />
                <rect x="150" y="72" width="14" height="56" rx="4" fill="#E07A3F" />
                <rect x="170" y="72" width="14" height="56" rx="4" fill="#C46A2A" />
                <rect x="190" y="72" width="14" height="56" rx="4" fill="#E07A3F" />
                <rect x="210" y="72" width="14" height="56" rx="4" fill="#C46A2A" />
                <rect x="230" y="72" width="14" height="56" rx="4" fill="#E07A3F" />
              </g>
              <rect x="20" y="86" width="18" height="28" rx="6" fill="#CBD5E1" />
              <rect x="262" y="86" width="18" height="28" rx="6" fill="#CBD5E1" />
              <line x1="40" y1="62" x2="260" y2="62" stroke="#E2E8F0" stroke-width="2" />
              <line x1="40" y1="138" x2="260" y2="138" stroke="#E2E8F0" stroke-width="2" />
              <line x1="56" y1="54" x2="56" y2="146" stroke="#E5E7EB" stroke-width="1" />
              <line x1="244" y1="54" x2="244" y2="146" stroke="#E5E7EB" stroke-width="1" />
            </svg>
          </div>
        </div>
      </section>`;

const pageHtml = template.mainHtml
  .replace(heroVisualPattern, heroFrameMarkup)
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

export const metadata = {
  title: "Ремонт и обслуживание теплообменников всех типов | UPGR Upgrade Innovations",
  description:
    "Сервис теплообменников всех типов: пластинчатые, кожухотрубные, ребристо‑трубные (калориферы/радиаторы), испарители/конденсаторы, микроканальные и др. Диагностика, чистка, герметичность, восстановление, замена.",
};

export default function HeatExchangerRepairPage() {
  return (
    <>
      <link
        rel="stylesheet"
        href="/assets/wikimarket-hvac-heat-exchanger-repair.css?v=heat-exchanger-repair-fix-1"
      />
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
      <div dangerouslySetInnerHTML={{ __html: pageHtml }} />
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
