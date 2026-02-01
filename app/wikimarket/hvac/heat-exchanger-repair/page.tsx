import Script from "next/script";

import { loadHtmlTemplate } from "../../../../lib/html-template";

const template = loadHtmlTemplate("wikimarket/hvac/heat-exchanger-repair/index.html");

export const metadata = {
  title: "Ремонт и обслуживание теплообменников всех типов | UPGR Upgrade Innovations",
  description:
    "Сервис теплообменников всех типов: пластинчатые, кожухотрубные, ребристо‑трубные (калориферы/радиаторы), испарители/конденсаторы, микроканальные и др. Диагностика, чистка, герметичность, восстановление, замена.",
};

export default function HeatExchangerRepairPage() {
  return (
    <>
      {template.styles.map((style, index) => (
        <style
          key={`heat-exchanger-repair-style-${index}`}
          dangerouslySetInnerHTML={{ __html: style }}
        />
      ))}
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
      <div dangerouslySetInnerHTML={{ __html: template.mainHtml }} />
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
