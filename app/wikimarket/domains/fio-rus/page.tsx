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
